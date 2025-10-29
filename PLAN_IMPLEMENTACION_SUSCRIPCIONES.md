# 🏋️ Plan de Implementación: Sistema de Suscripciones y Validación de Check-in

**Fecha:** 29 de Octubre, 2025
**Proyecto:** GymPoint
**Objetivo:** Implementar validación de suscripción activa para check-in con enfoque híbrido

---

## 📋 Resumen Ejecutivo

Implementar sistema completo de suscripciones con:
- **Validación híbrida**: Gym controla si permite trials + Usuario solo puede usar 1 trial por gym
- **UI mejorada en GymDetailScreen**: Mostrar estado de suscripción y opciones de pago/registro
- **Sistema de notificaciones**: Alertas 3-7 días antes del vencimiento
- **Límite de suscripciones**: Máximo 2 gimnasios activos por usuario
- **Excepción de trial**: Gym decide si permite visitas de prueba, usuario solo 1 trial por gym

---

## 🎯 FASE 1: Backend - Modificar Migraciones Existentes

### 1.1 Actualizar Migración `20260103-create-gym-ecosystem.js`

**Agregar campo `trial_allowed` a tabla `gym`:**

```javascript
// En la definición de tabla 'gym', después del campo 'min_stay_minutes' (línea ~180):

trial_allowed: {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  comment: 'Si el gimnasio permite visitas de prueba sin suscripción'
},
```

**Ubicación exacta:** Insertar después de `min_stay_minutes` y antes de `registration_date`

---

### 1.2 Actualizar Migración `20260104-create-fitness-tracking.js`

**Agregar campos de trial a tabla `user_gym`:**

```javascript
// En la definición de tabla 'user_gym', después del campo 'is_active' (línea ~287):

trial_used: {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  comment: 'Si el usuario ya usó su visita de prueba en este gimnasio'
},
trial_date: {
  type: Sequelize.DATEONLY,
  allowNull: true,
  comment: 'Fecha en que usó el trial (si aplica)'
},
```

**Actualizar índice existente:**
```javascript
// Modificar el índice en línea ~305 para incluir trial_used:
await queryInterface.addIndex('user_gym', ['is_active', 'subscription_end', 'trial_used'], {
  name: 'idx_user_gym_active_end_trial',
  transaction
});
```

---

## 🎯 FASE 2: Backend - Actualizar Modelos

### 2.1 Actualizar `models/Gym.js`

**Agregar campo:**
```javascript
trial_allowed: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  comment: 'Si el gimnasio permite visitas de prueba sin suscripción'
}
```

**Ubicación:** Después del campo `min_stay_minutes` (línea ~150)

---

### 2.2 Actualizar `models/UserGym.js`

**Agregar campos:**
```javascript
trial_used: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  comment: 'Si el usuario ya usó su visita de prueba en este gimnasio'
},
trial_date: {
  type: DataTypes.DATEONLY,
  allowNull: true,
  comment: 'Fecha en que usó el trial (si aplica)'
}
```

**Ubicación:** Después del campo `is_active` (línea ~52)

---

## 🎯 FASE 3: Backend - Validación de Suscripciones en Check-in

### 3.1 Modificar `services/assistance-service.js`

**Agregar función de validación (líneas ~26-38, después de constantes):**

```javascript
/**
 * Validar suscripción activa o trial disponible (Enfoque Híbrido)
 * @param {number} userProfileId
 * @param {number} gymId
 * @returns {Promise<{allowed: boolean, reason: string, usedTrial?: boolean}>}
 */
const validateSubscriptionOrTrial = async (userProfileId, gymId) => {
  const { userGymRepository } = require('../infra/db/repositories');

  // 1. Buscar relación user_gym (puede no existir)
  const userGym = await userGymRepository.findByUserAndGym(userProfileId, gymId);

  const hoy = new Date().toISOString().split('T')[0];

  // 2. ✅ CASO A: Usuario TIENE suscripción activa y vigente
  if (userGym && userGym.is_active && userGym.subscription_end) {
    if (userGym.subscription_end >= hoy) {
      return { allowed: true, reason: 'ACTIVE_SUBSCRIPTION' };
    }
  }

  // 3. Verificar si gym permite trials
  const gym = await gymRepository.findById(gymId);
  if (!gym) throw new NotFoundError('Gimnasio');

  // 4. ✅ CASO B: Gym permite trial Y usuario NO lo ha usado
  if (gym.trial_allowed && (!userGym || !userGym.trial_used)) {
    return { allowed: true, reason: 'TRIAL_VISIT', usedTrial: false };
  }

  // 5. ❌ CASO C: No cumple ninguna condición
  const errorMessage = userGym && userGym.trial_used
    ? `Ya utilizaste tu visita de prueba en ${gym.name}. Para seguir entrenando, activa tu suscripción.`
    : `Necesitas una suscripción activa para hacer check-in en ${gym.name}.`;

  throw new BusinessError(errorMessage, 'SUBSCRIPTION_REQUIRED', {
    gymId,
    gymName: gym.name,
    trialUsed: userGym?.trial_used || false,
    hasSubscription: !!userGym
  });
};
```

---

### 3.2 Modificar función `registrarAsistencia` (línea ~45)

**Agregar validación antes de validar fecha (después línea ~51):**

```javascript
const registrarAsistencia = async (command) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  const idUserProfile = command.userProfileId;
  const idGym = command.gymId;

  // ⭐ NUEVA VALIDACIÓN: Verificar suscripción o trial
  const validation = await validateSubscriptionOrTrial(idUserProfile, idGym);
  const isTrialVisit = validation.reason === 'TRIAL_VISIT';

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(idUserProfile, fecha);
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // ... resto del código existente

  // Crear asistencia
  const nuevaAsistencia = await assistanceRepository.createAssistance({
    id_user_profile: idUserProfile,
    id_gym: idGym,
    date: fecha,
    check_in_time: hora,
    check_out_time: null,
    duration_minutes: null,
    auto_checkin: command.autoCheckin || false,
    distance_meters: command.distanceMeters || null,
    verified: command.verified || false
  });

  // ⭐ Si es trial, marcar como usado
  if (isTrialVisit) {
    const { userGymRepository } = require('../infra/db/repositories');
    await userGymRepository.markTrialAsUsed(idUserProfile, idGym, fecha);
  }

  // ... resto del código (racha, tokens, etc.)
};
```

---

### 3.3 Modificar función `autoCheckIn` (línea ~240)

**Agregar la misma validación:**

```javascript
const autoCheckIn = async (command) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  const idUserProfile = command.userProfileId;
  const idGym = command.gymId;

  // ⭐ NUEVA VALIDACIÓN: Verificar suscripción o trial
  const validation = await validateSubscriptionOrTrial(idUserProfile, idGym);
  const isTrialVisit = validation.reason === 'TRIAL_VISIT';

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(idUserProfile, fecha);
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // ... resto del código existente

  // ⭐ Si es trial, marcar como usado
  if (isTrialVisit) {
    const { userGymRepository } = require('../infra/db/repositories');
    await userGymRepository.markTrialAsUsed(idUserProfile, idGym, fecha);
  }

  // ... resto del código
};
```

---

### 3.4 Modificar función `verificarAutoCheckIn` (línea ~420)

**Agregar la misma validación al inicio de la función.**

---

## 🎯 FASE 4: Backend - Repository de UserGym

### 4.1 Actualizar `infra/db/repositories/user-gym.repository.js`

**Agregar nuevos métodos:**

```javascript
/**
 * Buscar relación user-gym (incluso si no está activa)
 */
async function findByUserAndGym(userProfileId, gymId, options = {}) {
  const relation = await UserGym.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    transaction: options.transaction,
  });
  return toUserGym(relation);
}

/**
 * Marcar trial como usado para un usuario en un gym
 */
async function markTrialAsUsed(userProfileId, gymId, trialDate, options = {}) {
  // Buscar o crear registro
  let userGym = await UserGym.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    transaction: options.transaction,
  });

  if (!userGym) {
    // Crear nuevo registro solo con trial
    userGym = await UserGym.create({
      id_user_profile: userProfileId,
      id_gym: gymId,
      subscription_plan: null,
      subscription_start: null,
      subscription_end: null,
      is_active: false,
      trial_used: true,
      trial_date: trialDate,
    }, { transaction: options.transaction });
  } else {
    // Actualizar existente
    await userGym.update({
      trial_used: true,
      trial_date: trialDate,
    }, { transaction: options.transaction });
  }

  return toUserGym(userGym);
}

/**
 * Contar suscripciones activas de un usuario
 */
async function countActiveSubscriptions(userProfileId, options = {}) {
  const hoy = new Date().toISOString().split('T')[0];

  const count = await UserGym.count({
    where: {
      id_user_profile: userProfileId,
      is_active: true,
      subscription_end: {
        [Op.gte]: hoy
      }
    },
    transaction: options.transaction,
  });

  return count;
}

// Exportar
module.exports = {
  // ... exports existentes
  findByUserAndGym,
  markTrialAsUsed,
  countActiveSubscriptions,
};
```

---

## 🎯 FASE 5: Backend - Validación de Límite de Suscripciones

### 5.1 Modificar `services/user-gym-service.js`

**En función `subscribeToGym` (línea ~42), agregar validación:**

```javascript
async function subscribeToGym(command) {
  const transaction = await sequelize.transaction();

  try {
    // Verify user exists
    const user = await userProfileRepository.findById(command.userProfileId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // Verify gym exists
    const gym = await gymRepository.findById(command.gymId, { transaction });
    if (!gym) {
      throw new NotFoundError('Gimnasio');
    }

    // ⭐ NUEVA VALIDACIÓN: Verificar límite de 2 suscripciones activas
    const activeCount = await userGymRepository.countActiveSubscriptions(command.userProfileId, { transaction });
    if (activeCount >= 2) {
      throw new BusinessError(
        'Ya tienes 2 gimnasios activos. Debes cancelar una suscripción antes de agregar otra.',
        'MAX_SUBSCRIPTIONS_REACHED',
        { currentActive: activeCount, maxAllowed: 2 }
      );
    }

    // Validate subscription plan
    if (!VALID_PLANS.has(command.subscriptionPlan)) {
      throw new ValidationError('Plan de suscripción inválido');
    }

    // Check if already has active subscription
    const existing = await userGymRepository.findActiveSubscription(
      command.userProfileId,
      command.gymId,
      { transaction }
    );

    if (existing) {
      throw new ConflictError('El usuario ya tiene una suscripción activa en este gimnasio');
    }

    // Calculate dates
    const subscriptionStart = command.subscriptionStart ? new Date(command.subscriptionStart) : new Date();
    const subscriptionEnd = command.subscriptionEnd
      ? new Date(command.subscriptionEnd)
      : calculateEndDate(command.subscriptionPlan, subscriptionStart);

    // ⭐ Buscar si ya existe registro (por trial)
    let subscription = await userGymRepository.findByUserAndGym(
      command.userProfileId,
      command.gymId,
      { transaction }
    );

    if (subscription) {
      // Actualizar registro existente con suscripción
      subscription = await userGymRepository.updateSubscription(
        subscription.id_user_gym,
        {
          subscription_plan: command.subscriptionPlan,
          subscription_start: subscriptionStart,
          subscription_end: subscriptionEnd,
          is_active: true,
        },
        { transaction }
      );
    } else {
      // Create subscription
      subscription = await userGymRepository.createSubscription({
        id_user_profile: command.userProfileId,
        id_gym: command.gymId,
        subscription_plan: command.subscriptionPlan,
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
        is_active: true,
        trial_used: false,
        trial_date: null,
      }, { transaction });
    }

    await transaction.commit();
    return subscription;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

## 🎯 FASE 6: Backend - Sistema de Notificaciones

### 6.1 Actualizar `services/notification-service.js`

**Agregar tipo de notificación (línea ~14):**

```javascript
const NOTIFICATION_TYPES = new Set([
  'REMINDER',
  'ACHIEVEMENT',
  'REWARD',
  'GYM_UPDATE',
  'PAYMENT',
  'SOCIAL',
  'SYSTEM',
  'CHALLENGE',
  'SUBSCRIPTION_EXPIRY' // ⭐ NUEVO
]);
```

---

### 6.2 Crear Job de verificación `jobs/subscription-expiry-check.js`

**Nuevo archivo:**

```javascript
/**
 * Job: Verificar suscripciones próximas a vencer
 * Ejecutar diariamente (ej: 9:00 AM)
 */

const { userGymRepository } = require('../infra/db/repositories');
const notificationService = require('../services/notification-service');
const { CreateNotificationCommand } = require('../services/commands/notification.commands');

/**
 * Buscar suscripciones que vencen en los próximos 3, 5 y 7 días
 * Enviar notificación personalizada
 */
async function checkExpiringSubscriptions() {
  console.log('[Job] 🔔 Verificando suscripciones próximas a vencer...');

  const today = new Date();
  const daysToCheck = [3, 5, 7];

  for (const days of daysToCheck) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    console.log(`  Buscando suscripciones que vencen el ${targetDateStr} (en ${days} días)...`);

    // Buscar suscripciones que vencen en esa fecha exacta
    const expiring = await userGymRepository.findSubscriptionsExpiringOn(targetDateStr);

    console.log(`  Encontradas ${expiring.length} suscripciones`);

    for (const subscription of expiring) {
      try {
        // Crear notificación
        const command = new CreateNotificationCommand({
          userProfileId: subscription.id_user_profile,
          type: 'SUBSCRIPTION_EXPIRY',
          title: `Tu suscripción en ${subscription.gym.name} vence pronto`,
          message: `Tu suscripción en ${subscription.gym.name} vence en ${days} días (${targetDateStr}). ¡Renuévala para seguir entrenando!`,
          data: {
            gymId: subscription.id_gym,
            gymName: subscription.gym.name,
            subscriptionId: subscription.id_user_gym,
            expiryDate: subscription.subscription_end,
            daysRemaining: days,
            canRenewViaMercadoPago: true,
          },
          priority: days <= 3 ? 'HIGH' : 'NORMAL',
        });

        await notificationService.createNotification(command);
        console.log(`    ✅ Notificación enviada a user_profile ${subscription.id_user_profile}`);
      } catch (error) {
        console.error(`    ❌ Error notificando a user_profile ${subscription.id_user_profile}:`, error.message);
      }
    }
  }

  console.log('[Job] ✅ Verificación de suscripciones completada\n');
}

/**
 * Buscar suscripciones que YA vencieron (1 día después)
 * Enviar notificación con opción de renovar
 */
async function notifyExpiredSubscriptions() {
  console.log('[Job] 📆 Notificando suscripciones vencidas...');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const expired = await userGymRepository.findSubscriptionsExpiredOn(yesterdayStr);

  console.log(`  Encontradas ${expired.length} suscripciones vencidas ayer`);

  for (const subscription of expired) {
    try {
      const command = new CreateNotificationCommand({
        userProfileId: subscription.id_user_profile,
        type: 'SUBSCRIPTION_EXPIRY',
        title: `Tu suscripción en ${subscription.gym.name} ha vencido`,
        message: `Tu suscripción en ${subscription.gym.name} venció ayer. Renuévala ahora con MercadoPago o acércate al gimnasio.`,
        data: {
          gymId: subscription.id_gym,
          gymName: subscription.gym.name,
          subscriptionId: subscription.id_user_gym,
          expiryDate: subscription.subscription_end,
          expired: true,
          canRenewViaMercadoPago: true,
        },
        priority: 'HIGH',
      });

      await notificationService.createNotification(command);
      console.log(`    ✅ Notificación de vencimiento enviada a user_profile ${subscription.id_user_profile}`);
    } catch (error) {
      console.error(`    ❌ Error:`, error.message);
    }
  }

  console.log('[Job] ✅ Notificación de vencimientos completada\n');
}

module.exports = {
  checkExpiringSubscriptions,
  notifyExpiredSubscriptions,
};
```

---

### 6.3 Agregar métodos al repository `user-gym.repository.js`

```javascript
/**
 * Buscar suscripciones que vencen en una fecha específica
 */
async function findSubscriptionsExpiringOn(dateString, options = {}) {
  const subscriptions = await UserGym.findAll({
    where: {
      is_active: true,
      subscription_end: dateString,
    },
    include: [{ model: Gym, as: 'gym' }],
    transaction: options.transaction,
  });

  return toUserGyms(subscriptions);
}

/**
 * Buscar suscripciones que vencieron en una fecha específica
 */
async function findSubscriptionsExpiredOn(dateString, options = {}) {
  const subscriptions = await UserGym.findAll({
    where: {
      is_active: true,
      subscription_end: dateString,
    },
    include: [{ model: Gym, as: 'gym' }],
    transaction: options.transaction,
  });

  return toUserGyms(subscriptions);
}

// Exportar
module.exports = {
  // ... exports existentes
  findSubscriptionsExpiringOn,
  findSubscriptionsExpiredOn,
};
```

---

### 6.4 Configurar Cron Job (en `server.js` o archivo principal)

```javascript
const cron = require('node-cron');
const { checkExpiringSubscriptions, notifyExpiredSubscriptions } = require('./jobs/subscription-expiry-check');

// Ejecutar todos los días a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ [CRON] Ejecutando job de verificación de suscripciones...');
  try {
    await checkExpiringSubscriptions();
    await notifyExpiredSubscriptions();
  } catch (error) {
    console.error('❌ [CRON] Error en job de suscripciones:', error);
  }
});

console.log('✅ Cron job de suscripciones configurado (9:00 AM diario)');
```

---

## 🎯 FASE 7: Backend - API Endpoints

### 7.1 Actualizar `routes/user-gym-routes.js`

**Agregar nuevas rutas:**

```javascript
/**
 * GET /api/user-gym/check-status/:gymId
 * Verificar estado de suscripción del usuario en un gym
 */
router.get('/check-status/:gymId', verificarToken, verificarUsuarioApp, controller.checkSubscriptionStatus);

/**
 * POST /api/user-gym/subscribe
 * Suscribirse a un gimnasio (sin pago - registro manual)
 */
router.post('/subscribe', verificarToken, verificarUsuarioApp, controller.subscribToGym);
```

---

### 7.2 Actualizar `controllers/user-gym-controller.js`

**Agregar controladores:**

```javascript
/**
 * Verificar estado de suscripción en un gym
 */
const checkSubscriptionStatus = async (req, res) => {
  try {
    const id_gym = parseInt(req.params.gymId, 10);
    const id_user_profile = req.user.id_user_profile;

    if (!Number.isInteger(id_gym)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_GYM_ID',
          message: 'ID de gimnasio inválido'
        }
      });
    }

    // Buscar gym para obtener trial_allowed
    const gym = await gymRepository.findById(id_gym);
    if (!gym) {
      return res.status(404).json({
        error: { code: 'GYM_NOT_FOUND', message: 'Gimnasio no encontrado' }
      });
    }

    // Buscar relación user-gym
    const userGym = await userGymRepository.findByUserAndGym(id_user_profile, id_gym);

    const hoy = new Date().toISOString().split('T')[0];
    const isActive = userGym && userGym.is_active && userGym.subscription_end >= hoy;

    return res.json({
      gymId: id_gym,
      gymName: gym.name,
      isSubscribed: isActive,
      subscription: userGym ? {
        plan: userGym.subscription_plan,
        startDate: userGym.subscription_start,
        endDate: userGym.subscription_end,
        isActive: userGym.is_active,
        daysRemaining: userGym.subscription_end ?
          Math.ceil((new Date(userGym.subscription_end) - new Date(hoy)) / (1000 * 60 * 60 * 24)) : null
      } : null,
      trial: {
        allowed: gym.trial_allowed,
        used: userGym?.trial_used || false,
        date: userGym?.trial_date || null,
        available: gym.trial_allowed && (!userGym || !userGym.trial_used)
      },
      canCheckIn: isActive || (gym.trial_allowed && (!userGym || !userGym.trial_used))
    });
  } catch (err) {
    console.error('Error en checkSubscriptionStatus:', err);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message }
    });
  }
};

/**
 * Suscribirse a un gimnasio (sin pago)
 */
const subscribToGym = async (req, res) => {
  try {
    const { id_gym, plan, subscription_end } = req.body;
    const id_user_profile = req.user.id_user_profile;

    if (!id_gym || !plan || !subscription_end) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan campos requeridos: id_gym, plan, subscription_end'
        }
      });
    }

    const command = new SubscribeToGymCommand({
      userProfileId: id_user_profile,
      gymId: id_gym,
      subscriptionPlan: plan,
      subscriptionEnd: subscription_end
    });

    const subscription = await userGymService.subscribeToGym(command);

    return res.status(201).json({
      message: 'Suscripción creada exitosamente',
      data: subscription
    });
  } catch (err) {
    console.error('Error en subscribToGym:', err);

    if (err.code === 'MAX_SUBSCRIPTIONS_REACHED') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      });
    }

    return res.status(400).json({
      error: { code: 'SUBSCRIPTION_FAILED', message: err.message }
    });
  }
};

module.exports = {
  // ... exports existentes
  checkSubscriptionStatus,
  subscribToGym,
};
```

---

### 7.3 Actualizar OpenAPI Schemas

**Crear archivo `docs/openapi/components/schemas/user-gym.yaml`:**

```yaml
schemas:
  SubscriptionStatusResponse:
    type: object
    properties:
      gymId:
        type: integer
        example: 5
      gymName:
        type: string
        example: "MegaGym Centro"
      isSubscribed:
        type: boolean
        example: true
      subscription:
        type: object
        nullable: true
        properties:
          plan:
            type: string
            enum: [MONTHLY, WEEKLY, DAILY, ANNUAL]
          startDate:
            type: string
            format: date
          endDate:
            type: string
            format: date
          isActive:
            type: boolean
          daysRemaining:
            type: integer
            nullable: true
      trial:
        type: object
        properties:
          allowed:
            type: boolean
            description: Si el gym permite trials
          used:
            type: boolean
            description: Si el usuario ya usó su trial
          date:
            type: string
            format: date
            nullable: true
          available:
            type: boolean
            description: Si el usuario puede usar trial ahora
      canCheckIn:
        type: boolean
        description: Si el usuario puede hacer check-in

  SubscribeToGymRequest:
    type: object
    required:
      - id_gym
      - plan
      - subscription_end
    properties:
      id_gym:
        type: integer
        example: 5
      plan:
        type: string
        enum: [MONTHLY, WEEKLY, DAILY, ANNUAL]
        example: MONTHLY
      subscription_end:
        type: string
        format: date
        example: "2025-11-29"
        description: Fecha de vencimiento de la suscripción

  UserGymSubscriptionResponse:
    type: object
    properties:
      id_user_gym:
        type: integer
      id_user_profile:
        type: integer
      id_gym:
        type: integer
      subscription_plan:
        type: string
        enum: [MONTHLY, WEEKLY, DAILY, ANNUAL]
      subscription_start:
        type: string
        format: date
      subscription_end:
        type: string
        format: date
      is_active:
        type: boolean
      trial_used:
        type: boolean
      trial_date:
        type: string
        format: date
        nullable: true
      created_at:
        type: string
        format: date-time
      updated_at:
        type: string
        format: date-time
```

---

**Actualizar `docs/openapi/components/schemas/gyms.yaml`:**

```yaml
# Agregar campo trial_allowed a GymResponse (después de min_stay_minutes):

trial_allowed:
  type:
    - boolean
  description: Si el gimnasio permite visitas de prueba sin suscripción
```

---

**Actualizar `docs/openapi.yaml` (paths):**

```yaml
/api/user-gym/check-status/{gymId}:
  get:
    summary: Verificar estado de suscripción en un gimnasio
    tags:
      - Membresías
    security:
      - bearerAuth: []
    parameters:
      - in: path
        name: gymId
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Estado de suscripción
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubscriptionStatusResponse'

/api/user-gym/subscribe:
  post:
    summary: Suscribirse a un gimnasio (sin pago)
    tags:
      - Membresías
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SubscribeToGymRequest'
    responses:
      201:
        description: Suscripción creada
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserGymSubscriptionResponse'
      400:
        description: Error de validación o límite alcanzado
```

---

### 7.4 Bundle OpenAPI

**Ejecutar:**
```bash
cd backend/node
npm run openapi:bundle
```

---

## 🎯 FASE 8: Mobile - Feature de Suscripciones

### 8.1 Crear estructura de directorios

```
src/features/subscriptions/
├── data/
│   ├── subscription.remote.ts
│   └── dto/
│       └── SubscriptionDTO.ts
├── domain/
│   └── entities/
│       └── Subscription.ts
└── presentation/
    ├── hooks/
    │   ├── useSubscription.ts
    │   └── useGymSubscription.ts
    └── ui/
        ├── components/
        │   ├── SubscriptionCard.tsx
        │   ├── SubscriptionExpiryAlert.tsx
        │   └── SubscriptionModal.tsx
        └── screens/
            └── MySubscriptionsScreen.tsx
```

---

### 8.2 Crear `data/subscription.remote.ts`

```typescript
import { api } from '../../../shared/http/apiClient';
import { SubscriptionStatusDTO, SubscribeRequestDTO, UserGymSubscriptionDTO } from './dto/SubscriptionDTO';

/**
 * Subscription API Client
 * Base path: /api/user-gym
 */
export const SubscriptionRemote = {
  /**
   * GET /api/user-gym/check-status/:gymId
   * Verificar estado de suscripción en un gimnasio
   */
  checkStatus: (gymId: number) =>
    api.get<SubscriptionStatusDTO>(`/api/user-gym/check-status/${gymId}`).then((r) => r.data),

  /**
   * POST /api/user-gym/subscribe
   * Suscribirse a un gimnasio
   */
  subscribe: (payload: SubscribeRequestDTO) =>
    api.post<UserGymSubscriptionDTO>('/api/user-gym/subscribe', payload).then((r) => r.data),

  /**
   * GET /api/user-gym/me/activos
   * Obtener gimnasios activos del usuario
   */
  getMyActiveGyms: () =>
    api.get<UserGymSubscriptionDTO[]>('/api/user-gym/me/activos').then((r) => r.data),

  /**
   * GET /api/user-gym/me/historial
   * Obtener historial de suscripciones
   */
  getMyHistory: (isActive?: boolean) =>
    api.get<UserGymSubscriptionDTO[]>('/api/user-gym/me/historial', {
      params: { active: isActive }
    }).then((r) => r.data),

  /**
   * PUT /api/user-gym/baja
   * Dar de baja suscripción
   */
  unsubscribe: (gymId: number) =>
    api.put<void>('/api/user-gym/baja', { id_gym: gymId }).then((r) => r.data),
};
```

---

### 8.3 Crear `data/dto/SubscriptionDTO.ts`

```typescript
export interface SubscriptionStatusDTO {
  gymId: number;
  gymName: string;
  isSubscribed: boolean;
  subscription: {
    plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL';
    startDate: string;
    endDate: string;
    isActive: boolean;
    daysRemaining: number | null;
  } | null;
  trial: {
    allowed: boolean;
    used: boolean;
    date: string | null;
    available: boolean;
  };
  canCheckIn: boolean;
}

export interface SubscribeRequestDTO {
  id_gym: number;
  plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL';
  subscription_end: string; // YYYY-MM-DD
}

export interface UserGymSubscriptionDTO {
  id_user_gym: number;
  id_user_profile: number;
  id_gym: number;
  subscription_plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL' | null;
  subscription_start: string | null;
  subscription_end: string | null;
  is_active: boolean;
  trial_used: boolean;
  trial_date: string | null;
  created_at: string;
  updated_at: string;
  gym?: {
    name: string;
    city: string;
    address: string;
  };
}
```

---

### 8.4 Crear `domain/entities/Subscription.ts`

```typescript
export interface Subscription {
  id: number;
  userId: number;
  gymId: number;
  plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL' | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  trialUsed: boolean;
  trialDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  gym?: {
    name: string;
    city: string;
    address: string;
  };
}

export interface SubscriptionStatus {
  gymId: number;
  gymName: string;
  isSubscribed: boolean;
  subscription: {
    plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    daysRemaining: number | null;
  } | null;
  trial: {
    allowed: boolean;
    used: boolean;
    date: Date | null;
    available: boolean;
  };
  canCheckIn: boolean;
}
```

---

### 8.5 Crear hook `presentation/hooks/useGymSubscription.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { SubscriptionRemote } from '../../data/subscription.remote';
import { SubscriptionStatus } from '../../domain/entities/Subscription';

/**
 * Hook para verificar estado de suscripción en un gimnasio
 */
export const useGymSubscription = (gymId: number) => {
  const query = useQuery({
    queryKey: ['gym-subscription', gymId],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const dto = await SubscriptionRemote.checkStatus(gymId);

      return {
        gymId: dto.gymId,
        gymName: dto.gymName,
        isSubscribed: dto.isSubscribed,
        subscription: dto.subscription ? {
          plan: dto.subscription.plan,
          startDate: new Date(dto.subscription.startDate),
          endDate: new Date(dto.subscription.endDate),
          isActive: dto.subscription.isActive,
          daysRemaining: dto.subscription.daysRemaining,
        } : null,
        trial: {
          allowed: dto.trial.allowed,
          used: dto.trial.used,
          date: dto.trial.date ? new Date(dto.trial.date) : null,
          available: dto.trial.available,
        },
        canCheckIn: dto.canCheckIn,
      };
    },
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    subscriptionStatus: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
```

---

### 8.6 Crear hook `presentation/hooks/useSubscription.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionRemote } from '../../data/subscription.remote';
import { SubscribeRequestDTO } from '../../data/dto/SubscriptionDTO';

/**
 * Hook para acciones de suscripción (suscribirse, dar de baja)
 */
export const useSubscription = () => {
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: (payload: SubscribeRequestDTO) => SubscriptionRemote.subscribe(payload),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['gym-subscription', variables.id_gym] });
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (gymId: number) => SubscriptionRemote.unsubscribe(gymId),
    onSuccess: (_, gymId) => {
      queryClient.invalidateQueries({ queryKey: ['gym-subscription', gymId] });
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
    },
  });

  return {
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
    subscribeError: subscribeMutation.error,
    unsubscribeError: unsubscribeMutation.error,
  };
};
```

---

## 🎯 FASE 9: Mobile - Componentes UI

### 9.1 Crear `SubscriptionCard.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';

interface SubscriptionCardProps {
  plan: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL';
  endDate: Date;
  daysRemaining: number;
  gymName: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  endDate,
  daysRemaining,
  gymName,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Color coding según días restantes
  const getBadgeColor = () => {
    if (daysRemaining > 7) return { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-600' };
    if (daysRemaining >= 3) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-600' };
    return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-600' };
  };

  const colors = getBadgeColor();

  const planLabels = {
    MONTHLY: 'Mensual',
    WEEKLY: 'Semanal',
    DAILY: 'Diaria',
    ANNUAL: 'Anual',
  };

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-primary/30' : 'bg-primary/20'}`}>
            <Feather name="check-circle" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
          </View>
          <View className="flex-1">
            <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Suscripción activa
            </Text>
            <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Plan {planLabels[plan]}
            </Text>
          </View>
        </View>
        <View className={`${colors.bg} border ${colors.border} rounded-2xl px-3 py-1`}>
          <Text className={`text-xs font-semibold ${colors.text}`}>
            {daysRemaining} días
          </Text>
        </View>
      </View>

      <View className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-lg p-3`}>
        <View className="flex-row items-center mb-2">
          <Feather name="calendar" size={14} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`text-sm ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Vence el {endDate.toLocaleDateString('es-AR')}
          </Text>
        </View>
        {daysRemaining <= 7 && (
          <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            ⚠️ Tu suscripción está por vencer. Renovála para seguir entrenando.
          </Text>
        )}
      </View>
    </Card>
  );
};
```

---

### 9.2 Crear `SubscriptionExpiryAlert.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { AlertCard, Button } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface SubscriptionExpiryAlertProps {
  daysRemaining: number;
  gymName: string;
  onRenew: () => void;
  onDismiss: () => void;
}

export const SubscriptionExpiryAlert: React.FC<SubscriptionExpiryAlertProps> = ({
  daysRemaining,
  gymName,
  onRenew,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (daysRemaining > 7) return null;

  const variant = daysRemaining <= 3 ? 'error' : 'warning';
  const title = daysRemaining <= 3
    ? `⚠️ Tu suscripción vence en ${daysRemaining} días`
    : `📆 Tu suscripción en ${gymName} vence pronto`;

  const message = daysRemaining <= 3
    ? `Solo quedan ${daysRemaining} días de tu suscripción en ${gymName}. Renovála ahora para no perder el acceso.`
    : `Tu suscripción en ${gymName} vence el próximo ${daysRemaining} días. ¡No te quedes sin entrenar!`;

  return (
    <AlertCard
      variant={variant}
      title={title}
      message={message}
      actions={
        <View className="flex-row gap-2 mt-3">
          <Button
            variant="primary"
            size="sm"
            onPress={onRenew}
            className="flex-1"
          >
            Renovar ahora
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={onDismiss}
            className="flex-1"
          >
            Después
          </Button>
        </View>
      }
    />
  );
};
```

---

### 9.3 Crear `SubscriptionModal.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, Button } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';

interface SubscriptionModalProps {
  visible: boolean;
  gymId: number;
  gymName: string;
  onClose: () => void;
  onConfirm: (plan: string, endDate: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  gymId,
  gymName,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL'>('MONTHLY');
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const plans = [
    { value: 'DAILY', label: 'Diaria', icon: '📅' },
    { value: 'WEEKLY', label: 'Semanal', icon: '📆' },
    { value: 'MONTHLY', label: 'Mensual', icon: '🗓️' },
    { value: 'ANNUAL', label: 'Anual', icon: '📊' },
  ];

  const handleConfirm = () => {
    const endDateStr = endDate.toISOString().split('T')[0];
    onConfirm(selectedPlan, endDateStr);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className={`${isDark ? 'bg-surface-dark' : 'bg-surface'} rounded-t-3xl p-6 pb-8`}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Ya soy socio de {gymName}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <Text className={`text-sm mb-4 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            Ingresá los datos de tu suscripción para registrar tu membresía en GymPoint
          </Text>

          {/* Plan Selection */}
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Plan de suscripción
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.value}
                onPress={() => setSelectedPlan(plan.value as any)}
                className={`flex-1 min-w-[45%] rounded-xl p-3 border-2 ${
                  selectedPlan === plan.value
                    ? 'border-primary bg-primary/10'
                    : `${isDark ? 'border-border-dark bg-surfaceVariant-dark' : 'border-border bg-surfaceVariant'}`
                }`}
              >
                <Text style={{ fontSize: 24 }} className="text-center mb-1">
                  {plan.icon}
                </Text>
                <Text className={`text-center text-sm font-semibold ${
                  selectedPlan === plan.value
                    ? 'text-primary'
                    : isDark ? 'text-text-dark' : 'text-text'
                }`}>
                  {plan.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Picker */}
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Fecha de vencimiento
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className={`${isDark ? 'bg-surfaceVariant-dark border-border-dark' : 'bg-surfaceVariant border-border'} border rounded-xl p-4 mb-6 flex-row items-center justify-between`}
          >
            <View className="flex-row items-center">
              <Feather name="calendar" size={20} color={isDark ? '#B0B8C8' : '#666666'} />
              <Text className={`ml-3 text-base ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {endDate.toLocaleDateString('es-AR')}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#B0B8C8' : '#666666'} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
              minimumDate={new Date()}
            />
          )}

          {/* Actions */}
          <Button
            variant="primary"
            fullWidth
            onPress={handleConfirm}
          >
            Confirmar suscripción
          </Button>
        </View>
      </View>
    </Modal>
  );
};
```

---

## 🎯 FASE 10: Mobile - Actualizar GymDetailScreen

### 10.1 Modificar `GymDetailScreen.tsx`

**Importar hooks y componentes:**
```typescript
import { useGymSubscription } from '../../../subscriptions/presentation/hooks/useGymSubscription';
import { useSubscription } from '../../../subscriptions/presentation/hooks/useSubscription';
import { SubscriptionCard } from '../../../subscriptions/presentation/ui/components/SubscriptionCard';
import { SubscriptionExpiryAlert } from '../../../subscriptions/presentation/ui/components/SubscriptionExpiryAlert';
import { SubscriptionModal } from '../../../subscriptions/presentation/ui/components/SubscriptionModal';
```

**Agregar estados y hooks (después de línea ~18):**
```typescript
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

// Hook de suscripción
const { subscriptionStatus, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useGymSubscription(gym.id);
const { subscribe, isSubscribing, subscribeError } = useSubscription();
```

**Reemplazar lógica de botón Check-in (líneas ~376-402):**

```typescript
{/* Subscription Status & Actions */}
{!isLoadingSubscription && subscriptionStatus && (
  <>
    {/* Caso 1: Usuario SUSCRITO */}
    {subscriptionStatus.isSubscribed && subscriptionStatus.subscription && (
      <>
        <SubscriptionCard
          plan={subscriptionStatus.subscription.plan}
          endDate={subscriptionStatus.subscription.endDate}
          daysRemaining={subscriptionStatus.subscription.daysRemaining || 0}
          gymName={gym.name}
        />

        {/* Expiry Alert */}
        {subscriptionStatus.subscription.daysRemaining && subscriptionStatus.subscription.daysRemaining <= 7 && (
          <View className="mx-4 mb-4">
            <SubscriptionExpiryAlert
              daysRemaining={subscriptionStatus.subscription.daysRemaining}
              gymName={gym.name}
              onRenew={() => {
                // TODO: Navegar a renovación/pago
                console.log('Renovar suscripción');
              }}
              onDismiss={() => console.log('Dismissed')}
            />
          </View>
        )}

        {/* Check-in Alert (si fuera de rango) */}
        {!isInRange && (
          <View className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mx-4 mb-4 flex-row items-start">
            <Feather name="alert-triangle" size={16} color="#856404" />
            <Text className="text-sm text-yellow-800 ml-2 flex-1">
              Estás a {(gym.distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar
              dentro de los 150m para hacer check-in.
            </Text>
          </View>
        )}

        {/* Check-in Button */}
        <TouchableOpacity
          className={`${!isInRange ? 'bg-gray-400' : 'bg-primary'} rounded-2xl p-4 mx-4 mt-2 items-center`}
          disabled={!isInRange}
          onPress={onCheckIn}
        >
          <Text className={`text-base font-semibold ${!isInRange ? 'text-gray-600' : 'text-onPrimary'}`}>
            {isInRange
              ? 'Hacer Check-in'
              : `Acercate ${(gym.distance * 1000 - 150).toFixed(0)}m más`}
          </Text>
        </TouchableOpacity>

        <Text className={`text-xs text-center mx-4 mt-2 mb-8 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          Al hacer check-in ganarás +10 tokens y extenderás tu racha
        </Text>
      </>
    )}

    {/* Caso 2: Usuario NO SUSCRITO */}
    {!subscriptionStatus.isSubscribed && (
      <Card className="mx-4 mt-4 mb-8">
        <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Membresía requerida
        </Text>

        <Text className={`text-sm mb-4 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          {subscriptionStatus.trial.available
            ? `Podés hacer una visita de prueba gratis o activar tu membresía para entrenar regularmente.`
            : subscriptionStatus.trial.used
            ? `Ya utilizaste tu visita de prueba. Activá tu membresía para seguir entrenando.`
            : `Necesitás una membresía activa para entrenar en ${gym.name}.`}
        </Text>

        {/* Opción 1: Pagar con MercadoPago (placeholder) */}
        <Button
          variant="primary"
          fullWidth
          disabled
          icon={<Feather name="credit-card" size={18} color="#FFFFFF" />}
          className="mb-3"
        >
          Pagar con MercadoPago (Próximamente)
        </Button>

        {/* Opción 2: Ya soy socio */}
        <Button
          variant="outline"
          fullWidth
          onPress={() => setShowSubscriptionModal(true)}
          icon={<Feather name="user-check" size={18} color={isDark ? '#60a5fa' : '#3b82f6'} />}
        >
          Ya soy socio de este gym
        </Button>

        {/* Info sobre trial si está disponible */}
        {subscriptionStatus.trial.available && (
          <View className={`${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-100 border-blue-300'} border rounded-xl p-3 mt-4 flex-row items-start`}>
            <Feather name="info" size={16} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <Text className={`text-xs ml-2 flex-1 ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
              💡 Podés hacer 1 visita de prueba gratis acercándote al gimnasio y haciendo check-in.
            </Text>
          </View>
        )}
      </Card>
    )}
  </>
)}

{/* Modal de Suscripción */}
<SubscriptionModal
  visible={showSubscriptionModal}
  gymId={gym.id}
  gymName={gym.name}
  onClose={() => setShowSubscriptionModal(false)}
  onConfirm={(plan, endDate) => {
    subscribe(
      {
        id_gym: gym.id,
        plan: plan as any,
        subscription_end: endDate,
      },
      {
        onSuccess: () => {
          setShowSubscriptionModal(false);
          refetchSubscription();
          // Mostrar toast/alert de éxito
        },
        onError: (error: any) => {
          console.error('Error subscribing:', error);
          // Mostrar toast/alert de error
        },
      }
    );
  }}
/>
```

---

## 🎯 FASE 11: Base de Datos - Resetear y Aplicar Migraciones

### 11.1 Detener contenedores Docker

```bash
cd backend/node
docker-compose down
```

---

### 11.2 Eliminar volúmenes de base de datos

```bash
docker volume ls
# Identificar volumen de MySQL (ej: gympoint_mysql_data)
docker volume rm <nombre_volumen_mysql>
```

**O eliminar todos los volúmenes:**
```bash
docker-compose down -v
```

---

### 11.3 Levantar base de datos limpia

```bash
docker-compose up -d db
```

---

### 11.4 Esperar que DB esté lista y ejecutar migraciones

```bash
# Esperar 10 segundos
sleep 10

# Ejecutar migraciones
docker-compose up -d backend

# Ver logs para verificar
docker-compose logs -f backend
```

**Las migraciones se ejecutarán automáticamente al iniciar el backend.**

---

## 🎯 FASE 12: Testing y Validación

### 12.1 Tests Backend

**Casos a probar:**

1. ✅ Check-in con suscripción activa → Debe permitir
2. ❌ Check-in sin suscripción y sin trial → Debe fallar con error claro
3. ✅ Check-in con trial disponible → Debe permitir y marcar trial_used
4. ❌ Check-in con trial ya usado → Debe fallar
5. ❌ Suscribirse a 3er gimnasio → Debe fallar con MAX_SUBSCRIPTIONS_REACHED
6. ✅ Notificaciones de vencimiento → Job debe crear notificaciones
7. ✅ Validación en autoCheckIn y verificarAutoCheckIn

---

### 12.2 Tests Mobile

**Casos a probar:**

1. Ver gym sin suscripción → Mostrar opciones de pago/registro
2. Ver gym con suscripción activa → Mostrar botón check-in
3. Ver gym con suscripción próxima a vencer → Mostrar alert
4. Registrar suscripción manual → Modal funcional
5. Límite de 2 gimnasios → Error al intentar 3er gym

---

## 📝 Resumen de Archivos a Modificar/Crear

### Backend (22 archivos)

**Migraciones modificadas:**
1. ✏️ `migrations/20260103-create-gym-ecosystem.js` (agregar `trial_allowed`)
2. ✏️ `migrations/20260104-create-fitness-tracking.js` (agregar `trial_used`, `trial_date`)

**Modelos:**
3. ✏️ `models/Gym.js`
4. ✏️ `models/UserGym.js`

**Services:**
5. ✏️ `services/assistance-service.js` (validación + marcar trial)
6. ✏️ `services/user-gym-service.js` (límite 2 suscripciones)
7. ✏️ `services/notification-service.js` (tipo SUBSCRIPTION_EXPIRY)

**Repositories:**
8. ✏️ `infra/db/repositories/user-gym.repository.js` (nuevos métodos)

**Controllers:**
9. ✏️ `controllers/user-gym-controller.js` (nuevos endpoints)

**Routes:**
10. ✏️ `routes/user-gym-routes.js`

**Jobs:**
11. ➕ `jobs/subscription-expiry-check.js`

**OpenAPI:**
12. ➕ `docs/openapi/components/schemas/user-gym.yaml`
13. ✏️ `docs/openapi/components/schemas/gyms.yaml`
14. ✏️ `docs/openapi.yaml` (bundle)

**Comandos:**
15. ➕ `services/commands/subscription.commands.js` (si aplica)

---

### Mobile (15 archivos)

**Data Layer:**
16. ➕ `features/subscriptions/data/subscription.remote.ts`
17. ➕ `features/subscriptions/data/dto/SubscriptionDTO.ts`

**Domain Layer:**
18. ➕ `features/subscriptions/domain/entities/Subscription.ts`

**Presentation - Hooks:**
19. ➕ `features/subscriptions/presentation/hooks/useGymSubscription.ts`
20. ➕ `features/subscriptions/presentation/hooks/useSubscription.ts`

**Presentation - Components:**
21. ➕ `features/subscriptions/presentation/ui/components/SubscriptionCard.tsx`
22. ➕ `features/subscriptions/presentation/ui/components/SubscriptionExpiryAlert.tsx`
23. ➕ `features/subscriptions/presentation/ui/components/SubscriptionModal.tsx`

**Presentation - Screens:**
24. ➕ `features/subscriptions/presentation/ui/screens/MySubscriptionsScreen.tsx` (opcional)

**Updates:**
25. ✏️ `features/gyms/presentation/ui/screens/GymDetailScreen.tsx`

---

## 🚀 Orden de Ejecución

1. **FASE 1-2**: Modificar migraciones y modelos
2. **FASE 11**: Resetear DB y aplicar migraciones
3. **FASE 3-5**: Backend - Validación de check-in
4. **FASE 4**: Backend - Repository updates
5. **FASE 6**: Backend - Notificaciones
6. **FASE 7**: Backend - API endpoints + OpenAPI
7. **FASE 8-9**: Mobile - Feature estructura + componentes
8. **FASE 10**: Mobile - Actualizar GymDetailScreen
9. **FASE 12**: Testing completo

---

## ⚠️ Notas Importantes

### Consistencia de Arquitectura

- **Backend CQRS**: Usar Commands/Queries, repository pattern
- **Mobile Clean Arch**: Respetar data/domain/presentation
- **Componentes Reutilizables**: Usar `Button`, `Card`, `AlertCard` existentes
- **API Client**: Usar `apiClient.ts` con interceptores
- **OpenAPI**: Mantener sincronizado, bundle después de cambios

### Validaciones

- Mensajes de error claros en español
- Estados de loading apropiados
- Feedback visual inmediato

### Consideraciones de UX

- Trial solo 1 vez por gym por usuario
- Máximo 2 gimnasios activos
- Notificaciones 3, 5, 7 días antes
- UI adaptable según estado de suscripción

---

**Fin del Plan de Implementación** 🎉
