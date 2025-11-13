# Plan de Implementación: Sistema de Recompensas Mejorado

## 1. Resumen Ejecutivo

Este plan detalla la implementación de un sistema de recompensas completo con:
- **Inventario de items acumulables** (salvavidas, multipliers)
- **Cooldown por usuario** (30 días por tipo de recompensa)
- **Efectos temporales automáticos** (token multipliers activos 7 días)
- **Consumo automático inteligente** (salvavidas al perder racha)
- **Notificaciones de consumo** (sistema de notificaciones existente)
- **Recompensas exclusivas Premium**
- **Stock ilimitado** para recompensas permanentes

---

## 2. Arquitectura de Datos

### 2.1. Nueva Tabla: `user_reward_inventory`

Almacena items acumulables que el usuario posee pero no ha consumido.

```sql
CREATE TABLE user_reward_inventory (
  id_inventory INT PRIMARY KEY AUTO_INCREMENT,
  id_user_profile INT NOT NULL,
  id_reward INT NOT NULL,
  item_type ENUM('streak_saver', 'token_multiplier') NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  max_stack INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
  FOREIGN KEY (id_reward) REFERENCES reward(id_reward) ON DELETE CASCADE,
  UNIQUE KEY unique_user_reward_item (id_user_profile, id_reward, item_type),
  INDEX idx_inventory_user (id_user_profile),
  INDEX idx_inventory_type (item_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Propósito:**
- Trackear cantidad de items acumulados por usuario
- Prevenir exceso de acumulación (max_stack)
- Permitir consultas rápidas por tipo de item

### 2.2. Nueva Tabla: `active_user_effects`

Trackea efectos temporales activos (multiplicadores de tokens).

```sql
CREATE TABLE active_user_effects (
  id_effect INT PRIMARY KEY AUTO_INCREMENT,
  id_user_profile INT NOT NULL,
  effect_type ENUM('token_multiplier') NOT NULL,
  multiplier_value DECIMAL(3,1) NOT NULL, -- 2.0, 3.0, 5.0
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_consumed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
  INDEX idx_effect_user_active (id_user_profile, expires_at, is_consumed),
  INDEX idx_effect_type (effect_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Propósito:**
- Trackear multiplicadores activos y su tiempo de expiración
- Permitir múltiples efectos activos simultáneamente (hasta 3)
- Consultar rápidamente si un usuario tiene efectos activos

### 2.3. Nueva Tabla: `reward_cooldown`

Trackea cooldown por usuario y tipo de recompensa.

```sql
CREATE TABLE reward_cooldown (
  id_cooldown INT PRIMARY KEY AUTO_INCREMENT,
  id_user_profile INT NOT NULL,
  id_reward INT NOT NULL,
  last_claimed_at TIMESTAMP NOT NULL,
  can_claim_again_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
  FOREIGN KEY (id_reward) REFERENCES reward(id_reward) ON DELETE CASCADE,
  UNIQUE KEY unique_user_reward_cooldown (id_user_profile, id_reward),
  INDEX idx_cooldown_user (id_user_profile),
  INDEX idx_cooldown_claim_time (can_claim_again_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Propósito:**
- Evitar que usuarios reclamen la misma recompensa antes del cooldown
- Cooldown es por usuario (no global)
- Consultar rápidamente disponibilidad

### 2.4. Modificaciones a Tabla `reward`

Agregar columnas para nuevas funcionalidades:

```sql
ALTER TABLE reward
  ADD COLUMN reward_type ENUM(
    'descuento',
    'pase_gratis',
    'producto',
    'servicio',
    'merchandising',
    'token_multiplier',  -- NUEVO
    'streak_saver',      -- NUEVO
    'otro'
  ) AFTER description,

  ADD COLUMN cooldown_days INT DEFAULT 0 COMMENT 'Días de cooldown entre reclamos (0 = sin cooldown)',
  ADD COLUMN is_unlimited BOOLEAN DEFAULT FALSE COMMENT 'Stock ilimitado, no se decrementa',
  ADD COLUMN requires_premium BOOLEAN DEFAULT FALSE COMMENT 'Requiere suscripción Premium',
  ADD COLUMN is_stackable BOOLEAN DEFAULT FALSE COMMENT 'Se puede acumular en inventario',
  ADD COLUMN max_stack INT DEFAULT 1 COMMENT 'Máximo acumulable (si is_stackable=true)',
  ADD COLUMN duration_days INT DEFAULT NULL COMMENT 'Duración del efecto en días (para multipliers)';
```

**Cambios:**
- Expandir ENUM `reward_type` con 'token_multiplier' y 'streak_saver'
- `cooldown_days`: Define el período de cooldown (30 días para todas las nuevas recompensas)
- `is_unlimited`: Si es true, no se decrementa el stock al reclamar
- `requires_premium`: Si es true, solo usuarios Premium pueden reclamar
- `is_stackable`: Si es true, se acumula en inventario
- `max_stack`: Límite de acumulación (5 para salvavidas, 3 para multipliers)
- `duration_days`: Duración del efecto (7 días para multipliers)

### 2.5. Modificación a Tabla `streak`

La tabla ya tiene el campo necesario:

```sql
-- Ya existe en la tabla:
recovery_items INT DEFAULT 0 COMMENT 'Salvavidas de racha disponibles'
```

**Uso:**
- Se incrementa cuando el usuario compra un salvavidas
- Se decrementa automáticamente cuando se usa
- Consultar antes de resetear racha

---

## 3. Recompensas Iniciales (Seed Data)

### 3.1. Recompensas a Agregar

Agregar en `backend/node/seed/initial-data.js` después de los achievements:

```javascript
// ============================================
// REWARDS SEED DATA
// ============================================
console.log('📦 Seeding rewards...');

const rewards = [
  // --- Premium Passes ---
  {
    name: 'Premium 1 día',
    description: 'Accede a todas las funciones Premium por 1 día',
    reward_type: 'pase_gratis',
    effect_value: 1, // días de premium
    token_cost: 1500,
    stock: null, // ilimitado
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: false,
    is_stackable: false,
    max_stack: 1,
    is_active: true,
    id_gym: null // global
  },
  {
    name: 'Premium 7 días',
    description: 'Accede a todas las funciones Premium por 7 días',
    reward_type: 'pase_gratis',
    effect_value: 7,
    token_cost: 5000,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: false,
    is_stackable: false,
    max_stack: 1,
    is_active: true,
    id_gym: null
  },
  {
    name: 'Premium 30 días',
    description: 'Accede a todas las funciones Premium por 30 días completos',
    reward_type: 'pase_gratis',
    effect_value: 30,
    token_cost: 20000,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: false,
    is_stackable: false,
    max_stack: 1,
    is_active: true,
    id_gym: null
  },

  // --- Token Multipliers (Premium Only, Stackable hasta 3) ---
  {
    name: 'Tokens x2 (7 días)',
    description: 'Duplica todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
    reward_type: 'token_multiplier',
    effect_value: 2, // multiplicador
    token_cost: 3500,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: true, // SOLO PREMIUM
    is_stackable: true,
    max_stack: 3, // máximo 3 activos simultáneamente
    duration_days: 7,
    is_active: true,
    id_gym: null
  },
  {
    name: 'Tokens x3 (7 días)',
    description: 'Triplica todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
    reward_type: 'token_multiplier',
    effect_value: 3,
    token_cost: 6000,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: true,
    is_stackable: true,
    max_stack: 3,
    duration_days: 7,
    is_active: true,
    id_gym: null
  },
  {
    name: 'Tokens x5 (7 días)',
    description: 'Multiplica por 5 todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
    reward_type: 'token_multiplier',
    effect_value: 5,
    token_cost: 10000,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: true,
    is_stackable: true,
    max_stack: 3,
    duration_days: 7,
    is_active: true,
    id_gym: null
  },

  // --- Streak Saver (Stackable hasta 5) ---
  {
    name: 'Salvavidas de Racha',
    description: 'Protege tu racha automáticamente si fallas un día. Se usa automáticamente cuando sea necesario. Acumulable hasta 5 veces.',
    reward_type: 'streak_saver',
    effect_value: 1, // cantidad de salvavidas
    token_cost: 800,
    stock: null,
    is_unlimited: true,
    cooldown_days: 30,
    requires_premium: false,
    is_stackable: true,
    max_stack: 5, // máximo 5 en inventario
    is_active: true,
    id_gym: null
  }
];

// Insertar rewards
for (const reward of rewards) {
  await sequelize.query(
    `INSERT INTO reward (
      id_gym, name, description, reward_type, effect_value,
      token_cost, stock, is_unlimited, cooldown_days,
      requires_premium, is_stackable, max_stack, duration_days, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      replacements: [
        reward.id_gym,
        reward.name,
        reward.description,
        reward.reward_type,
        reward.effect_value,
        reward.token_cost,
        reward.stock,
        reward.is_unlimited,
        reward.cooldown_days,
        reward.requires_premium,
        reward.is_stackable,
        reward.max_stack,
        reward.duration_days || null,
        reward.is_active
      ],
      transaction
    }
  );
}

console.log(`✅ Seeded ${rewards.length} rewards`);
```

---

## 4. Lógica de Backend

### 4.1. Nuevos Modelos

#### 4.1.1. `backend/node/models/UserRewardInventory.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRewardInventory = sequelize.define(
  'UserRewardInventory',
  {
    id_inventory: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_profile',
        key: 'id_user_profile'
      }
    },
    id_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reward',
        key: 'id_reward'
      }
    },
    item_type: {
      type: DataTypes.ENUM('streak_saver', 'token_multiplier'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_stack: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: 'user_reward_inventory',
    timestamps: true,
    underscored: true
  }
);

module.exports = UserRewardInventory;
```

#### 4.1.2. `backend/node/models/ActiveUserEffect.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActiveUserEffect = sequelize.define(
  'ActiveUserEffect',
  {
    id_effect: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_profile',
        key: 'id_user_profile'
      }
    },
    effect_type: {
      type: DataTypes.ENUM('token_multiplier'),
      allowNull: false
    },
    multiplier_value: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_consumed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'active_user_effects',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = ActiveUserEffect;
```

#### 4.1.3. `backend/node/models/RewardCooldown.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RewardCooldown = sequelize.define(
  'RewardCooldown',
  {
    id_cooldown: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_profile',
        key: 'id_user_profile'
      }
    },
    id_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reward',
        key: 'id_reward'
      }
    },
    last_claimed_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    can_claim_again_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'reward_cooldown',
    timestamps: true,
    underscored: true
  }
);

module.exports = RewardCooldown;
```

### 4.2. Actualizar `backend/node/models/index.js`

Agregar las asociaciones:

```javascript
// Import new models
const UserRewardInventory = require('./UserRewardInventory');
const ActiveUserEffect = require('./ActiveUserEffect');
const RewardCooldown = require('./RewardCooldown');

// Associations
UserProfile.hasMany(UserRewardInventory, { foreignKey: 'id_user_profile' });
UserRewardInventory.belongsTo(UserProfile, { foreignKey: 'id_user_profile' });
UserRewardInventory.belongsTo(Reward, { foreignKey: 'id_reward' });

UserProfile.hasMany(ActiveUserEffect, { foreignKey: 'id_user_profile' });
ActiveUserEffect.belongsTo(UserProfile, { foreignKey: 'id_user_profile' });

UserProfile.hasMany(RewardCooldown, { foreignKey: 'id_user_profile' });
RewardCooldown.belongsTo(UserProfile, { foreignKey: 'id_user_profile' });
RewardCooldown.belongsTo(Reward, { foreignKey: 'id_reward' });

// Export
module.exports = {
  // ... existing exports
  UserRewardInventory,
  ActiveUserEffect,
  RewardCooldown
};
```

### 4.3. Modificar `backend/node/services/reward-service.js`

#### 4.3.1. Agregar funciones auxiliares

```javascript
const UserRewardInventory = require('../models/UserRewardInventory');
const ActiveUserEffect = require('../models/ActiveUserEffect');
const RewardCooldown = require('../models/RewardCooldown');
const notificationService = require('./notification-service');

/**
 * Verifica si el usuario puede reclamar una recompensa
 * Valida: cooldown, premium requirement, inventario lleno
 */
async function canClaimReward(userId, reward, options = {}) {
  const transaction = options.transaction;

  // 1. Verificar si requiere Premium
  if (reward.requires_premium) {
    const userProfile = await UserProfile.findByPk(userId, { transaction });
    if (!userProfile || userProfile.app_tier !== 'PREMIUM') {
      return {
        canClaim: false,
        reason: 'Esta recompensa es exclusiva para usuarios Premium'
      };
    }
  }

  // 2. Verificar cooldown
  if (reward.cooldown_days > 0) {
    const cooldown = await RewardCooldown.findOne({
      where: {
        id_user_profile: userId,
        id_reward: reward.id_reward
      },
      transaction
    });

    if (cooldown) {
      const now = new Date();
      if (now < new Date(cooldown.can_claim_again_at)) {
        const hoursLeft = Math.ceil(
          (new Date(cooldown.can_claim_again_at) - now) / (1000 * 60 * 60)
        );
        return {
          canClaim: false,
          reason: `Debes esperar ${hoursLeft} horas para reclamar esta recompensa nuevamente`,
          cooldownEndsAt: cooldown.can_claim_again_at
        };
      }
    }
  }

  // 3. Si es stackable, verificar límite de inventario
  if (reward.is_stackable) {
    const inventory = await UserRewardInventory.findOne({
      where: {
        id_user_profile: userId,
        id_reward: reward.id_reward,
        item_type: reward.reward_type
      },
      transaction
    });

    if (inventory && inventory.quantity >= reward.max_stack) {
      return {
        canClaim: false,
        reason: `Ya tienes el máximo de ${reward.max_stack} de este item`
      };
    }
  }

  return { canClaim: true };
}

/**
 * Actualiza o crea el cooldown para una recompensa
 */
async function updateCooldown(userId, rewardId, cooldownDays, options = {}) {
  const transaction = options.transaction;
  const now = new Date();
  const canClaimAgain = new Date(now);
  canClaimAgain.setDate(canClaimAgain.getDate() + cooldownDays);

  await RewardCooldown.upsert(
    {
      id_user_profile: userId,
      id_reward: rewardId,
      last_claimed_at: now,
      can_claim_again_at: canClaimAgain
    },
    { transaction }
  );
}

/**
 * Agrega un item al inventario del usuario
 */
async function addToInventory(userId, reward, quantity = 1, options = {}) {
  const transaction = options.transaction;

  const [inventory, created] = await UserRewardInventory.findOrCreate({
    where: {
      id_user_profile: userId,
      id_reward: reward.id_reward,
      item_type: reward.reward_type
    },
    defaults: {
      quantity: quantity,
      max_stack: reward.max_stack
    },
    transaction
  });

  if (!created) {
    inventory.quantity += quantity;
    await inventory.save({ transaction });
  }

  return inventory;
}

/**
 * Activa un efecto de multiplicador de tokens
 */
async function activateTokenMultiplier(userId, multiplierValue, durationDays, options = {}) {
  const transaction = options.transaction;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const effect = await ActiveUserEffect.create(
    {
      id_user_profile: userId,
      effect_type: 'token_multiplier',
      multiplier_value: multiplierValue,
      started_at: now,
      expires_at: expiresAt,
      is_consumed: false
    },
    { transaction }
  );

  return effect;
}

/**
 * Obtiene el multiplicador total activo de un usuario
 * Si tiene múltiples multipliers, se suman (ej: 2x + 3x = 5x)
 */
async function getActiveMultiplier(userId, options = {}) {
  const transaction = options.transaction;
  const now = new Date();

  const activeEffects = await ActiveUserEffect.findAll({
    where: {
      id_user_profile: userId,
      effect_type: 'token_multiplier',
      expires_at: { [Op.gt]: now },
      is_consumed: false
    },
    transaction
  });

  if (activeEffects.length === 0) {
    return 1; // Sin multiplicador
  }

  // Sumar todos los multiplicadores activos
  const totalMultiplier = activeEffects.reduce(
    (sum, effect) => sum + parseFloat(effect.multiplier_value),
    0
  );

  return totalMultiplier;
}
```

#### 4.3.2. Modificar función `claimReward`

Actualizar la función existente para incluir las nuevas validaciones:

```javascript
async function claimReward(command) {
  const transaction = await sequelize.transaction();

  try {
    const { idReward, idUserProfile, tokensSpent, expiresAt, code } = command;

    // 1. Obtener reward con todos los campos nuevos
    const reward = await Reward.findByPk(idReward, { transaction });
    if (!reward) {
      throw new AppError('Recompensa no encontrada', 404);
    }

    // 2. Validar si puede reclamar (cooldown, premium, inventario)
    const validation = await canClaimReward(idUserProfile, reward, { transaction });
    if (!validation.canClaim) {
      throw new AppError(validation.reason, 400);
    }

    // 3. Validar tokens suficientes
    const userProfile = await UserProfile.findByPk(idUserProfile, { transaction });
    if (userProfile.tokens < reward.token_cost) {
      throw new AppError('Tokens insuficientes', 400);
    }

    // ... resto de validaciones existentes (stock, dates, etc.)

    // 4. Crear registro de recompensa reclamada
    const claimedReward = await ClaimedReward.create(
      {
        id_user_profile: idUserProfile,
        id_reward: idReward,
        tokens_spent: reward.token_cost,
        status: 'active',
        expires_at: expiresAt || null
      },
      { transaction }
    );

    // 5. Descontar tokens
    await tokenLedgerService.createEntry(
      {
        id_user_profile: idUserProfile,
        delta: -reward.token_cost,
        reason: 'REWARD_CLAIM',
        description: `Reclamó: ${reward.name}`,
        reference_type: 'REWARD',
        reference_id: reward.id_reward
      },
      { transaction }
    );

    // 6. Actualizar stock (solo si NO es ilimitado)
    if (!reward.is_unlimited && reward.stock !== null) {
      await Reward.update(
        { stock: reward.stock - 1 },
        { where: { id_reward: idReward }, transaction }
      );
    }

    // 7. Actualizar cooldown
    if (reward.cooldown_days > 0) {
      await updateCooldown(idUserProfile, idReward, reward.cooldown_days, { transaction });
    }

    // 8. Aplicar efecto según tipo de recompensa
    if (reward.is_stackable) {
      // Items acumulables → agregar a inventario
      if (reward.reward_type === 'streak_saver') {
        await addToInventory(idUserProfile, reward, 1, { transaction });

        // También incrementar recovery_items en streak
        await sequelize.query(
          `UPDATE streak SET recovery_items = recovery_items + 1
           WHERE id_user_profile = ?`,
          { replacements: [idUserProfile], transaction }
        );
      } else if (reward.reward_type === 'token_multiplier') {
        // Token multipliers van a inventario Y se activan inmediatamente
        await addToInventory(idUserProfile, reward, 1, { transaction });
        await activateTokenMultiplier(
          idUserProfile,
          reward.effect_value,
          reward.duration_days,
          { transaction }
        );
      }
    } else {
      // Efectos no acumulables → aplicar inmediatamente
      await applyRewardEffect(
        idUserProfile,
        reward.reward_type,
        reward.effect_value,
        { transaction }
      );
    }

    await transaction.commit();
    return claimedReward;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 4.4. Integrar Multiplicadores en Servicios de Tokens

Modificar todos los servicios que otorgan tokens para aplicar el multiplicador activo.

#### 4.4.1. `backend/node/services/attendance-service.js`

```javascript
// Al final de la función processAttendance, antes de crear el token ledger entry:

const baseTokens = 100; // o el valor que corresponda
const multiplier = await rewardService.getActiveMultiplier(idUserProfile, { transaction });
const finalTokens = Math.floor(baseTokens * multiplier);

await tokenLedgerService.createEntry({
  id_user_profile: idUserProfile,
  delta: finalTokens,
  reason: 'GYM_ATTENDANCE',
  description: multiplier > 1
    ? `Asistencia al gym (${baseTokens} × ${multiplier} = ${finalTokens} tokens)`
    : 'Asistencia al gym'
}, { transaction });
```

#### 4.4.2. `backend/node/services/workout-service.js`

```javascript
// En completeWorkoutSession, al otorgar tokens:

const baseTokens = calculateWorkoutTokens(session); // función que calcula tokens base
const multiplier = await rewardService.getActiveMultiplier(idUserProfile, { transaction });
const finalTokens = Math.floor(baseTokens * multiplier);

await tokenLedgerService.createEntry({
  id_user_profile: idUserProfile,
  delta: finalTokens,
  reason: 'WORKOUT_COMPLETED',
  description: multiplier > 1
    ? `Rutina completada (${baseTokens} × ${multiplier} = ${finalTokens} tokens)`
    : 'Rutina completada'
}, { transaction });
```

#### 4.4.3. `backend/node/services/achievement-service.js`

```javascript
// En unlockAchievement, al otorgar tokens:

const baseTokens = achievement.token_reward || 0;
if (baseTokens > 0) {
  const multiplier = await rewardService.getActiveMultiplier(idUserProfile, { transaction });
  const finalTokens = Math.floor(baseTokens * multiplier);

  await tokenLedgerService.createEntry({
    id_user_profile: idUserProfile,
    delta: finalTokens,
    reason: 'ACHIEVEMENT_UNLOCKED',
    description: multiplier > 1
      ? `Logro: ${achievement.name} (${baseTokens} × ${multiplier} = ${finalTokens} tokens)`
      : `Logro: ${achievement.name}`
  }, { transaction });
}
```

#### 4.4.4. `backend/node/services/daily-challenge-service.js`

```javascript
// En completeDailyChallenge, al otorgar tokens:

const baseTokens = challenge.token_reward;
const multiplier = await rewardService.getActiveMultiplier(userId, { transaction });
const finalTokens = Math.floor(baseTokens * multiplier);

await tokenLedgerService.createEntry({
  id_user_profile: userId,
  delta: finalTokens,
  reason: 'DAILY_CHALLENGE_COMPLETED',
  description: multiplier > 1
    ? `Desafío: ${challenge.name} (${baseTokens} × ${multiplier} = ${finalTokens} tokens)`
    : `Desafío: ${challenge.name}`
}, { transaction });
```

### 4.5. Integrar Salvavidas en Sistema de Racha

#### 4.5.1. Modificar `backend/node/services/streak-service.js`

En la función `updateStreak`, cuando se detecta que la racha se va a perder:

```javascript
// Dentro de updateStreak, donde se verifica si continúa la racha:

if (!continuaRacha) {
  // No continúa la racha - verificar items de recuperación
  if (streak.recovery_items > 0) {
    // ✅ Usa automáticamente un salvavidas
    payload.recovery_items = streak.recovery_items - 1;
    // Mantiene el value actual (la racha se salva)

    console.log(`[StreakService] 🛟 Salvavidas usado para userId=${userId}. Quedan ${payload.recovery_items}`);

    // 🔔 NUEVO: Enviar notificación al usuario
    try {
      await notificationService.createNotification({
        id_user_profile: userId,
        type: 'CHALLENGE',
        title: '🛟 ¡Salvavidas usado!',
        message: `Se usó automáticamente tu salvavidas para proteger tu racha de ${streak.value} días. Te quedan ${payload.recovery_items} salvavidas.`,
        data: {
          streakValue: streak.value,
          recoveryItemsRemaining: payload.recovery_items,
          action: 'streak_saved'
        },
        priority: 'HIGH'
      }, { transaction });
    } catch (notifError) {
      console.error('[StreakService] Error enviando notificación de salvavidas:', notifError);
      // No fallar la operación si falla la notificación
    }

  } else {
    // ❌ Pierde la racha
    payload.last_value = streak.value;
    payload.value = 1;

    console.log(`[StreakService] ❌ Racha perdida para userId=${userId}. Era ${streak.value} días.`);
  }
}
```

---

## 5. Endpoints de API

### 5.1. Nuevos Endpoints

#### 5.1.1. `GET /api/rewards/inventory/me`

Obtiene el inventario de items del usuario actual.

**Response:**
```json
{
  "inventory": [
    {
      "id_inventory": 1,
      "item_type": "streak_saver",
      "quantity": 3,
      "max_stack": 5,
      "reward": {
        "id_reward": 7,
        "name": "Salvavidas de Racha",
        "description": "Protege tu racha..."
      }
    },
    {
      "id_inventory": 2,
      "item_type": "token_multiplier",
      "quantity": 1,
      "max_stack": 3,
      "reward": {
        "id_reward": 4,
        "name": "Tokens x2 (7 días)"
      }
    }
  ]
}
```

#### 5.1.2. `GET /api/rewards/effects/active`

Obtiene los efectos activos del usuario actual.

**Response:**
```json
{
  "effects": [
    {
      "id_effect": 1,
      "effect_type": "token_multiplier",
      "multiplier_value": 2.0,
      "expires_at": "2025-11-17T10:00:00Z",
      "hours_remaining": 156
    },
    {
      "id_effect": 2,
      "effect_type": "token_multiplier",
      "multiplier_value": 3.0,
      "expires_at": "2025-11-18T10:00:00Z",
      "hours_remaining": 180
    }
  ],
  "total_multiplier": 5.0
}
```

#### 5.1.3. `GET /api/rewards/available`

Modificar endpoint existente para incluir información de cooldown y restricciones.

**Response:**
```json
{
  "rewards": [
    {
      "id_reward": 1,
      "name": "Premium 1 día",
      "token_cost": 1500,
      "cooldown_days": 30,
      "requires_premium": false,
      "is_stackable": false,
      "can_claim": true,
      "cooldown_ends_at": null
    },
    {
      "id_reward": 4,
      "name": "Tokens x2 (7 días)",
      "token_cost": 3500,
      "cooldown_days": 30,
      "requires_premium": true,
      "is_stackable": true,
      "max_stack": 3,
      "current_stack": 1,
      "can_claim": false,
      "cooldown_ends_at": "2025-12-10T10:00:00Z",
      "reason": "Debes esperar 720 horas para reclamar esta recompensa nuevamente"
    }
  ]
}
```

### 5.2. Actualizar Rutas

En `backend/node/routes/reward-routes.js`:

```javascript
// Nuevas rutas
router.get('/inventory/me', authenticate, rewardController.getUserInventory);
router.get('/effects/active', authenticate, rewardController.getActiveEffects);
router.get('/available', authenticate, rewardController.getAvailableRewards); // modificar existente
```

---

## 6. Frontend - Admin UI

### 6.1. Formulario de Creación/Edición de Recompensas

Agregar campos en el formulario de admin para recompensas:

```typescript
interface RewardFormData {
  // ... campos existentes

  // Nuevos campos
  reward_type: 'descuento' | 'pase_gratis' | 'producto' | 'servicio' | 'merchandising' | 'token_multiplier' | 'streak_saver' | 'otro';
  cooldown_days: number; // 0 = sin cooldown
  is_unlimited: boolean; // stock ilimitado
  requires_premium: boolean; // solo Premium
  is_stackable: boolean; // acumulable en inventario
  max_stack: number; // límite de acumulación
  duration_days?: number; // duración del efecto (para multipliers)
}
```

**Campos del formulario:**
1. **Tipo de Recompensa** (dropdown con nuevos tipos)
2. **Cooldown (días)** (number input, default: 0)
3. **Stock Ilimitado** (checkbox)
4. **Requiere Premium** (checkbox)
5. **Acumulable** (checkbox)
6. **Máximo Acumulable** (number input, habilitado si is_stackable=true)
7. **Duración (días)** (number input, solo para token_multipliers)

---

## 7. Frontend - Mobile UI

### 7.1. Pantalla de Recompensas

#### 7.1.1. Card de Recompensa

Mostrar badges y estados:

```tsx
<RewardCard reward={reward}>
  {/* Badge Premium Only */}
  {reward.requires_premium && (
    <Badge variant="premium">Solo Premium</Badge>
  )}

  {/* Badge Acumulable */}
  {reward.is_stackable && (
    <Badge variant="info">
      Acumulable {currentStack}/{reward.max_stack}
    </Badge>
  )}

  {/* Cooldown Status */}
  {reward.cooldown_ends_at && (
    <CooldownTimer endsAt={reward.cooldown_ends_at} />
  )}

  {/* Botón de reclamo */}
  <Button
    disabled={!reward.can_claim}
    onPress={() => handleClaim(reward)}
  >
    {reward.can_claim ? `Canjear ${reward.token_cost} tokens` : 'En cooldown'}
  </Button>
</RewardCard>
```

#### 7.1.2. Sección de Inventario

Nueva tab o sección para mostrar el inventario:

```tsx
<InventorySection>
  <H2>Mi Inventario</H2>

  {inventory.map(item => (
    <InventoryItem key={item.id_inventory}>
      <ItemIcon type={item.item_type} />
      <ItemName>{item.reward.name}</ItemName>
      <ItemQuantity>{item.quantity}/{item.max_stack}</ItemQuantity>

      {item.item_type === 'token_multiplier' && (
        <Button onPress={() => activateMultiplier(item)}>
          Activar
        </Button>
      )}
    </InventoryItem>
  ))}
</InventorySection>
```

#### 7.1.3. Indicador de Efectos Activos

Banner flotante o sección superior mostrando multiplicadores activos:

```tsx
<ActiveEffectsBanner>
  {effects.map(effect => (
    <EffectChip key={effect.id_effect}>
      🔥 {effect.multiplier_value}x tokens
      <Timer expiresAt={effect.expires_at} />
    </EffectChip>
  ))}

  {effects.length > 1 && (
    <TotalMultiplier>
      Total: {totalMultiplier}x
    </TotalMultiplier>
  )}
</ActiveEffectsBanner>
```

#### 7.1.4. Notificaciones

Integrar con el sistema de notificaciones existente para mostrar:
- "🛟 Salvavidas usado - Tu racha de X días está protegida"
- "🔥 Multiplicador x2 activado - Gana el doble de tokens por 7 días"
- "⏰ Tu multiplicador x3 expirará en 2 horas"

---

## 8. Migration File

### 8.1. Modificar `backend/node/migrations/20260106-create-rewards-challenges.js`

Agregar al final del `up` function, antes del `commit`:

```javascript
// ============================================
// REWARD SYSTEM ENHANCEMENTS
// ============================================
console.log('📦 Enhancing reward system with inventory & cooldowns...');

// 1. Expandir ENUM de reward_type
await queryInterface.sequelize.query(`
  ALTER TABLE reward
  MODIFY COLUMN reward_type ENUM(
    'descuento',
    'pase_gratis',
    'producto',
    'servicio',
    'merchandising',
    'token_multiplier',
    'streak_saver',
    'otro'
  )
`);

// 2. Agregar columnas nuevas a reward
await queryInterface.addColumn('reward', 'cooldown_days', {
  type: Sequelize.INTEGER,
  defaultValue: 0,
  comment: 'Días de cooldown entre reclamos (0 = sin cooldown)'
}, { transaction });

await queryInterface.addColumn('reward', 'is_unlimited', {
  type: Sequelize.BOOLEAN,
  defaultValue: false,
  comment: 'Stock ilimitado, no se decrementa'
}, { transaction });

await queryInterface.addColumn('reward', 'requires_premium', {
  type: Sequelize.BOOLEAN,
  defaultValue: false,
  comment: 'Requiere suscripción Premium'
}, { transaction });

await queryInterface.addColumn('reward', 'is_stackable', {
  type: Sequelize.BOOLEAN,
  defaultValue: false,
  comment: 'Se puede acumular en inventario'
}, { transaction });

await queryInterface.addColumn('reward', 'max_stack', {
  type: Sequelize.INTEGER,
  defaultValue: 1,
  comment: 'Máximo acumulable (si is_stackable=true)'
}, { transaction });

await queryInterface.addColumn('reward', 'duration_days', {
  type: Sequelize.INTEGER,
  allowNull: true,
  comment: 'Duración del efecto en días (para multipliers)'
}, { transaction });

// 3. Crear tabla user_reward_inventory
await queryInterface.createTable('user_reward_inventory', {
  id_inventory: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user_profile: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profile',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE'
  },
  id_reward: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'reward',
      key: 'id_reward'
    },
    onDelete: 'CASCADE'
  },
  item_type: {
    type: Sequelize.ENUM('streak_saver', 'token_multiplier'),
    allowNull: false
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  max_stack: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }
}, { transaction });

await queryInterface.addConstraint('user_reward_inventory', {
  fields: ['id_user_profile', 'id_reward', 'item_type'],
  type: 'unique',
  name: 'unique_user_reward_item',
  transaction
});

await queryInterface.addIndex('user_reward_inventory', ['id_user_profile'], {
  name: 'idx_inventory_user',
  transaction
});

await queryInterface.addIndex('user_reward_inventory', ['item_type'], {
  name: 'idx_inventory_type',
  transaction
});

// 4. Crear tabla active_user_effects
await queryInterface.createTable('active_user_effects', {
  id_effect: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user_profile: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profile',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE'
  },
  effect_type: {
    type: Sequelize.ENUM('token_multiplier'),
    allowNull: false
  },
  multiplier_value: {
    type: Sequelize.DECIMAL(3, 1),
    allowNull: false
  },
  started_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  expires_at: {
    type: Sequelize.DATE,
    allowNull: false
  },
  is_consumed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { transaction });

await queryInterface.addIndex('active_user_effects', ['id_user_profile', 'expires_at', 'is_consumed'], {
  name: 'idx_effect_user_active',
  transaction
});

await queryInterface.addIndex('active_user_effects', ['effect_type'], {
  name: 'idx_effect_type',
  transaction
});

// 5. Crear tabla reward_cooldown
await queryInterface.createTable('reward_cooldown', {
  id_cooldown: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user_profile: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profile',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE'
  },
  id_reward: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'reward',
      key: 'id_reward'
    },
    onDelete: 'CASCADE'
  },
  last_claimed_at: {
    type: Sequelize.DATE,
    allowNull: false
  },
  can_claim_again_at: {
    type: Sequelize.DATE,
    allowNull: false
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }
}, { transaction });

await queryInterface.addConstraint('reward_cooldown', {
  fields: ['id_user_profile', 'id_reward'],
  type: 'unique',
  name: 'unique_user_reward_cooldown',
  transaction
});

await queryInterface.addIndex('reward_cooldown', ['id_user_profile'], {
  name: 'idx_cooldown_user',
  transaction
});

await queryInterface.addIndex('reward_cooldown', ['can_claim_again_at'], {
  name: 'idx_cooldown_claim_time',
  transaction
});

console.log('✅ Reward system enhancements complete');
```

**Agregar al `down` function:**

```javascript
// Rollback reward enhancements
await queryInterface.dropTable('reward_cooldown', { transaction });
await queryInterface.dropTable('active_user_effects', { transaction });
await queryInterface.dropTable('user_reward_inventory', { transaction });

await queryInterface.removeColumn('reward', 'duration_days', { transaction });
await queryInterface.removeColumn('reward', 'max_stack', { transaction });
await queryInterface.removeColumn('reward', 'is_stackable', { transaction });
await queryInterface.removeColumn('reward', 'requires_premium', { transaction });
await queryInterface.removeColumn('reward', 'is_unlimited', { transaction });
await queryInterface.removeColumn('reward', 'cooldown_days', { transaction });

// Revertir ENUM (opcional - puede dejarse extendido)
```

---

## 9. Testing & Validación

### 9.1. Casos de Prueba - Cooldown

1. **Usuario reclama recompensa por primera vez** → Éxito, cooldown se crea
2. **Usuario intenta reclamar antes del cooldown** → Error 400, mensaje de horas restantes
3. **Usuario espera 30 días** → Puede reclamar nuevamente
4. **Usuario A reclama, Usuario B intenta** → Usuario B puede reclamar (cooldown es por usuario)

### 9.2. Casos de Prueba - Premium Requirement

1. **Usuario Free intenta reclamar Token x2** → Error 400, "Exclusiva para Premium"
2. **Usuario Premium reclama Token x2** → Éxito
3. **Usuario Premium downgrade a Free, tiene multiplier activo** → Multiplier sigue funcionando hasta expirar

### 9.3. Casos de Prueba - Inventario

1. **Usuario reclama salvavidas (quantity=0)** → quantity=1
2. **Usuario reclama 5to salvavidas** → quantity=5 (max_stack)
3. **Usuario intenta reclamar 6to salvavidas** → Error 400, "Ya tienes el máximo de 5"
4. **Usuario pierde racha con 2 salvavidas** → recovery_items se decrementa, notificación enviada

### 9.4. Casos de Prueba - Multiplicadores

1. **Usuario activa multiplier x2** → Gana 200 tokens en vez de 100 en siguiente asistencia
2. **Usuario activa x2 y x3 simultáneamente** → Gana 500 tokens (100 × 5) en asistencia
3. **Usuario tiene 3 multipliers activos, intenta reclamar 4to** → Error 400, "Ya tienes el máximo"
4. **Multiplier expira** → Próxima ganancia de tokens vuelve a valor base

### 9.5. Casos de Prueba - Salvavidas

1. **Usuario pierde racha sin salvavidas** → Racha se resetea a 1
2. **Usuario pierde racha con salvavidas** → Racha se mantiene, salvavidas se consume, notificación enviada
3. **Notificación contiene datos correctos** → streakValue y recoveryItemsRemaining correctos

---

## 10. Cronograma de Implementación

### Fase 1: Base de Datos (2-3 horas)
- ✅ Modificar migration 20260106
- ✅ Crear modelos (UserRewardInventory, ActiveUserEffect, RewardCooldown)
- ✅ Actualizar modelo Reward
- ✅ Actualizar models/index.js con asociaciones

### Fase 2: Backend Core (3-4 horas)
- ✅ Implementar funciones auxiliares en reward-service.js
- ✅ Modificar claimReward con validaciones
- ✅ Implementar getActiveMultiplier
- ✅ Modificar streak-service.js con salvavidas automático

### Fase 3: Integración de Multiplicadores (2 horas)
- ✅ Modificar attendance-service.js
- ✅ Modificar workout-service.js
- ✅ Modificar achievement-service.js
- ✅ Modificar daily-challenge-service.js

### Fase 4: API Endpoints (1-2 horas)
- ✅ Crear controller methods
- ✅ Agregar rutas nuevas
- ✅ Modificar endpoint /available con cooldown info

### Fase 5: Seed Data (30 min)
- ✅ Agregar rewards a initial-data.js

### Fase 6: Frontend Admin (2 horas)
- ✅ Actualizar formulario de rewards
- ✅ Agregar campos nuevos
- ✅ Validaciones de frontend

### Fase 7: Frontend Mobile (3-4 horas)
- ✅ Actualizar RewardCard con badges
- ✅ Crear sección de inventario
- ✅ Crear banner de efectos activos
- ✅ Integrar notificaciones

### Fase 8: Testing (2-3 horas)
- ✅ Ejecutar casos de prueba
- ✅ Validar cooldowns
- ✅ Validar multiplicadores
- ✅ Validar salvavidas automático
- ✅ Validar notificaciones

**Total estimado: 16-21 horas**

---

## 11. Comandos de Despliegue

```bash
# 1. Bajar contenedores
docker-compose down

# 2. Eliminar volumen de base de datos (CUIDADO: Borra todos los datos)
docker volume rm gympoint_db_data

# 3. Reconstruir imagen de backend (si hay cambios en package.json)
docker-compose build backend

# 4. Levantar contenedores
docker-compose up -d

# 5. Verificar que las migrations se ejecutaron
docker-compose logs backend | grep "Migration"

# 6. Verificar que el seed se ejecutó
docker-compose logs backend | grep "Seeding"

# 7. Verificar tablas creadas
docker-compose exec db mysql -uroot -pmitre280 gympoint -e "SHOW TABLES LIKE '%reward%';"

# 8. Verificar recompensas insertadas
docker-compose exec db mysql -uroot -pmitre280 gympoint -e "SELECT id_reward, name, token_cost, cooldown_days, is_stackable, max_stack FROM reward;"
```

---

## 12. Notas Importantes

### 12.1. Comportamiento de Multiplicadores

- **Acumulables hasta 3 simultáneos**: El usuario puede tener hasta 3 multipliers activos al mismo tiempo
- **Suma de multiplicadores**: Si tiene x2 + x3 activos, el total es x5 (no x6)
- **Cooldown independiente**: El cooldown es por recompensa, no por tipo. Puedes reclamar x2 y luego x3 el mismo día.

### 12.2. Comportamiento de Salvavidas

- **Consumo automático**: Se usa automáticamente cuando se detecta pérdida de racha
- **Notificación prioritaria**: Usa tipo 'CHALLENGE' con prioridad 'HIGH'
- **Acumulable hasta 5**: El usuario puede tener hasta 5 salvavidas en inventario
- **Sincronización**: `recovery_items` en tabla `streak` y `quantity` en `user_reward_inventory` deben estar sincronizados

### 12.3. Consideraciones de Performance

- **Índices críticos**:
  - `idx_effect_user_active` para consultas rápidas de multiplicadores
  - `idx_cooldown_claim_time` para verificaciones de cooldown
  - `idx_inventory_user` para consultas de inventario

- **Limpieza automática**: Considerar implementar un cron job que:
  - Marque efectos expirados como `is_consumed=true`
  - Archive cooldowns antiguos (>90 días)

### 12.4. Seguridad

- **Validación de Premium en múltiples capas**:
  1. Frontend: Ocultar recompensas premium para Free users
  2. Backend: Validar en `canClaimReward`
  3. Database: Constraint check (opcional)

- **Prevención de race conditions**:
  - Usar transacciones en todas las operaciones
  - UNIQUE constraints en cooldown y inventory

---

## 13. Preguntas Frecuentes

**Q: ¿Qué pasa si un usuario tiene un multiplier activo y luego activa otro?**
A: Se suman. Si tiene x2 activo y activa x3, ganará x5 por el período que se solapen.

**Q: ¿Los salvavidas se pueden usar manualmente?**
A: No, se consumen automáticamente cuando se detecta pérdida de racha.

**Q: ¿Qué pasa si el usuario tiene un multiplier activo y se le vence el Premium?**
A: El multiplier sigue funcionando hasta que expire naturalmente.

**Q: ¿El cooldown es global o por tipo de recompensa?**
A: Por recompensa individual. Si reclamas "Premium 7 días", no puedes reclamar esa misma recompensa por 30 días, pero puedes reclamar "Premium 1 día" inmediatamente.

**Q: ¿Qué pasa si hay un error al enviar la notificación de salvavidas?**
A: El salvavidas se consume igual. La notificación es informativa, no crítica para la operación.

---

## 14. Contacto y Soporte

Para dudas sobre la implementación:
- Revisar este documento primero
- Consultar código existente en servicios similares
- Verificar logs de Docker para errores de migration

---

**Documento generado**: 2025-11-10
**Versión**: 1.0
**Estado**: Listo para implementación
