const paymentService = require('../services/payment-service');
const { asyncHandler } = require('../middlewares/error-handler');

const requireUserProfile = (req, res) => {
  const profile = req.account?.userProfile;

  if (!profile) {
    res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
    return null;
  }

  return profile;
};

const crearPreferencia = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { gymId, subscriptionType, autoRenew } = req.body || {};

  if (!gymId) {
    return res.status(400).json({
      error: {
        code: 'GYM_ID_REQUIRED',
        message: 'gymId es requerido'
      }
    });
  }

  const preference = await paymentService.createPreference({
    userProfileId: profile.id_user_profile,
    gymId,
    subscriptionType,
    autoRenew
  });

  res.status(201).json(preference);
});

const obtenerPago = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentById(id);

  const isAdmin = req.roles?.includes('ADMIN');
  const isOwner = req.account?.userProfile?.id_user_profile === payment.id_user_profile;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({
      error: {
        code: 'PAYMENT_FORBIDDEN',
        message: 'No tienes permiso para ver este pago'
      }
    });
  }

  res.json(payment);
});

const historialPagos = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { limit, offset } = req.query;

  const pagos = await paymentService.listPaymentsForUser(profile.id_user_profile, {
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined
  });

  res.json(pagos);
});

module.exports = {
  crearPreferencia,
  obtenerPago,
  historialPagos
};

