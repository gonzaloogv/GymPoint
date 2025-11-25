const mercadopago = require('mercadopago');
const sequelize = require('../config/database');
const {
  MercadoPagoPayment,
  UserProfile,
  Account,
  Gym,
  UserGym
} = require('../models');
const notificationService = require('./notification-service');
const tokenLedgerService = require('./token-ledger-service');
const {
  ValidationError,
  NotFoundError,
  ServiceUnavailableError
} = require('../utils/errors');
const { TOKENS, TOKEN_REASONS, SUBSCRIPTION_TYPES } = require('../config/constants');

const SUPPORTED_SUBSCRIPTIONS = new Set(['MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL']);
const PLAN_MAP = {
  MONTHLY: 'MENSUAL',
  WEEKLY: 'SEMANAL',
  DAILY: 'DIARIO',
  ANNUAL: 'ANUAL'
};

let mercadopagoConfigured = false;

const ensureMercadoPagoConfigured = () => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.log('🔧 Modo mock: MercadoPago sin token real');
    return false; // Modo mock
  }

  if (!mercadopagoConfigured) {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
    mercadopagoConfigured = true;
  }
};

const normalizeSubscriptionType = (value) => {
  if (!value) return 'MONTHLY';
  const normalized = String(value).trim().toUpperCase();

  if (SUPPORTED_SUBSCRIPTIONS.has(normalized)) {
    return normalized;
  }

  switch (normalized) {
    case 'MENSUAL':
      return 'MONTHLY';
    case 'SEMANAL':
      return 'WEEKLY';
    case 'ANUAL':
      return 'ANNUAL';
    case 'DIARIO':
      return 'DAILY';
    default:
      throw new ValidationError('Tipo de suscripcion invalido');
  }
};

const mapPlanFromSubscription = (subscriptionType) => {
  return PLAN_MAP[subscriptionType] || PLAN_MAP.MONTHLY;
};

const determinePricing = (gym, subscriptionType) => {
  switch (subscriptionType) {
    case 'MONTHLY':
      if (gym.month_price == null) {
        throw new ValidationError('El gimnasio no tiene precio mensual configurado');
      }
      return {
        amount: Number(gym.month_price),
        description: `Membresia mensual - ${gym.name}`
      };
    case 'WEEKLY':
      if (gym.week_price == null) {
        throw new ValidationError('El gimnasio no tiene precio semanal configurado');
      }
      return {
        amount: Number(gym.week_price),
        description: `Membresia semanal - ${gym.name}`
      };
    case 'ANNUAL':
      if (gym.month_price == null) {
        throw new ValidationError('El gimnasio no tiene precio mensual configurado');
      }
      return {
        amount: Number(gym.month_price) * 12,
        description: `Membresia anual - ${gym.name}`
      };
    default:
      throw new ValidationError('Tipo de suscripcion invalido');
  }
};

const calculateEndDate = (subscriptionType, startDate = new Date()) => {
  const finishDate = new Date(startDate);

  switch (subscriptionType) {
    case 'WEEKLY':
      finishDate.setDate(finishDate.getDate() + 7);
      break;
    case 'ANNUAL':
      finishDate.setFullYear(finishDate.getFullYear() + 1);
      break;
    case 'MONTHLY':
    default:
      finishDate.setMonth(finishDate.getMonth() + 1);
      break;
  }

  return finishDate;
};

const fetchUserWithAccount = async (userProfileId) => {
  const profile = await UserProfile.findByPk(userProfileId, {
    include: [
      {
        model: Account,
        as: 'account'
      }
    ]
  });

  if (!profile) {
    throw new NotFoundError('Perfil de usuario');
  }

  if (!profile.account) {
    throw new ValidationError('Cuenta asociada al usuario no encontrada');
  }

  return profile;
};

const createPreference = async ({
  userProfileId,
  gymId,
  subscriptionType,
  autoRenew = false
}) => {
  ensureMercadoPagoConfigured();

  const normalizedSubscription = normalizeSubscriptionType(subscriptionType);

  const [profile, gym] = await Promise.all([
    fetchUserWithAccount(userProfileId),
    Gym.findByPk(gymId)
  ]);

  if (!gym) {
    throw new NotFoundError('Gimnasio');
  }

  const { amount, description } = determinePricing(gym, normalizedSubscription);

  const paymentRecord = await MercadoPagoPayment.create({
    id_user_profile: userProfileId,
    id_gym: gymId,
    subscription_type: normalizedSubscription,
    auto_renew: Boolean(autoRenew),
    amount,
    currency: 'ARS',
    description,
    status: 'PENDING',
    external_reference: `GYM_${gymId}_USER_${userProfileId}_${Date.now()}`
  });

  try {
    const preference = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: profile.account.email,
        name: profile.name,
        surname: profile.lastname
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || ''}/payment/success`,
        failure: `${process.env.FRONTEND_URL || ''}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || ''}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: paymentRecord.external_reference,
      notification_url: `${process.env.BACKEND_URL || ''}/api/webhooks/mercadopago`
    };

    const response = await mercadopago.preferences.create(preference);
    const body = response.body || response;

    await paymentRecord.update({
      preference_id: body.id || body.preference_id || null
    });

    return {
      id_payment: paymentRecord.id_mp_payment,
      preference_id: body.id || body.preference_id,
      init_point: body.init_point,
      sandbox_init_point: body.sandbox_init_point
    };
  } catch (error) {
    await paymentRecord.update({
      status: 'CANCELLED',
      status_detail: 'PREFERENCE_CREATION_FAILED'
    });

    console.error('[payment-service] Error creando preferencia MP:', error.message);
    throw new ServiceUnavailableError('No se pudo crear la preferencia de pago');
  }
};

const loadPaymentInfo = async (paymentId) => {
  try {
    const result = await mercadopago.payment.findById(paymentId);
    return result.body || result;
  } catch (error) {
    if (typeof mercadopago.payment.get === 'function') {
      const fallback = await mercadopago.payment.get(paymentId);
      return fallback.body || fallback;
    }
    throw error;
  }
};

const activateMembership = async (payment, transaction) => {
  const { id_user_profile, id_gym, subscription_type: subscriptionType } = payment;

  const startDate = new Date();
  const finishDate = calculateEndDate(subscriptionType, startDate);
  const plan = mapPlanFromSubscription(subscriptionType);

  const [userGym, created] = await UserGym.findOrCreate({
    where: {
      id_user: id_user_profile,
      id_gym
    },
    defaults: {
      start_date: startDate,
      finish_date: finishDate,
      active: true,
      plan,
      subscription_type: subscriptionType,
      auto_renew: payment.auto_renew,
      id_payment: payment.id_mp_payment
    },
    transaction
  });

  if (!created) {
    await userGym.update({
      start_date: startDate,
      finish_date: finishDate,
      active: true,
      plan,
      subscription_type: subscriptionType,
      auto_renew: payment.auto_renew,
      id_payment: payment.id_mp_payment
    }, { transaction });
  }

  await UserProfile.update({
    subscription: SUBSCRIPTION_TYPES.PREMIUM
  }, {
    where: { id_user_profile },
    transaction
  });

  await notificationService.createNotification({
    id_user_profile,
    type: 'PAYMENT',
    title: 'Pago aprobado',
    message: 'Tu membresia fue activada correctamente',
    icon: 'checkmark-circle'
  }, { transaction });

  const newMembershipTokens = Number.isFinite(TOKENS.MEMBERSHIP_ACTIVATION)
    ? TOKENS.MEMBERSHIP_ACTIVATION
    : 0;

  if (created && newMembershipTokens > 0) {
    await tokenLedgerService.registrarMovimiento({
      userId: id_user_profile,
      delta: newMembershipTokens,
      reason: TOKEN_REASONS.MEMBERSHIP_ACTIVATED,
      refType: 'mercadopago_payment',
      refId: payment.id_mp_payment,
      transaction
    });
  }

  return userGym;
};

const processWebhook = async (payload) => {
  ensureMercadoPagoConfigured();

  if (!payload || payload.type !== 'payment') {
    return { processed: false, reason: 'ignored_event' };
  }

  const paymentId = payload.data?.id || payload.data?.resource?.split('/').pop();

  if (!paymentId) {
    return { processed: false, reason: 'missing_payment_id' };
  }

  const paymentInfo = await loadPaymentInfo(paymentId);

  const externalReference = paymentInfo.external_reference || paymentInfo.externalReference;

  const paymentRecord = await MercadoPagoPayment.findOne({
    where: externalReference
      ? { external_reference: externalReference }
      : { payment_id: String(paymentInfo.id) }
  });

  if (!paymentRecord) {
    console.error('[payment-service] Pago no encontrado para referencia:', externalReference || paymentInfo.id);
    return { processed: false, reason: 'payment_not_found' };
  }

  const transaction = await sequelize.transaction();

  try {
    const status = String(paymentInfo.status || paymentRecord.status).toUpperCase();

    const updatedPayment = await paymentRecord.update({
      payment_id: String(paymentInfo.id || paymentRecord.payment_id || ''),
      merchant_order_id: paymentInfo.order?.id || paymentInfo.merchant_order_id || paymentRecord.merchant_order_id,
      status,
      status_detail: paymentInfo.status_detail || paymentRecord.status_detail,
      payment_method: paymentInfo.payment_method_id || paymentInfo.payment_method || paymentRecord.payment_method,
      payment_type: paymentInfo.payment_type_id || paymentInfo.payment_type || paymentRecord.payment_type,
      payment_date: paymentInfo.date_approved || paymentInfo.date_created || paymentRecord.payment_date,
      approved_at: paymentInfo.date_approved || paymentRecord.approved_at,
      payer_email: paymentInfo.payer?.email || paymentRecord.payer_email,
      webhook_received_at: new Date(),
      raw_response: paymentInfo
    }, { transaction });

    if (status === 'APPROVED') {
      await activateMembership(updatedPayment, transaction);
    }

    await transaction.commit();
    return { processed: true, status };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getPaymentById = async (id_mp_payment) => {
  const payment = await MercadoPagoPayment.findByPk(id_mp_payment, {
    include: [
      {
        model: Gym,
        as: 'gym',
        attributes: ['id_gym', 'name', 'city', 'address']
      },
      {
        model: UserGym,
        as: 'memberships',
        attributes: ['id_user_gym', 'start_date', 'finish_date', 'active', 'subscription_type']
      }
    ]
  });

  if (!payment) {
    throw new NotFoundError('Pago');
  }

  return payment;
};

const listPaymentsForUser = async (id_user_profile, { limit = 20, offset = 0 } = {}) => {
  return MercadoPagoPayment.findAll({
    where: { id_user_profile },
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: Gym,
        as: 'gym',
        attributes: ['id_gym', 'name', 'city']
      }
    ]
  });
};

module.exports = {
  createPreference,
  processWebhook,
  getPaymentById,
  listPaymentsForUser,
  __private: {
    normalizeSubscriptionType,
    mapPlanFromSubscription,
    calculateEndDate
  }
};




