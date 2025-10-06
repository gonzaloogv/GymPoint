# 📋 PLAN DE MEJORA GRADUAL - GYMPOINT BACKEND

> **Estado actual:** BD: 78/100 | Backend: 72/100
> **Meta:** BD: 95/100 | Backend: 95/100
> **Tiempo estimado:** 3-5 días de trabajo

---

## 📊 ÍNDICE

1. [Fase 0: Preparación y auditoría](#fase-0-preparación-y-auditoría)
2. [Fase 1: Correcciones críticas (Prioridad ALTA)](#fase-1-correcciones-críticas-prioridad-alta)
3. [Fase 2: Limpieza de código legacy (Prioridad ALTA)](#fase-2-limpieza-de-código-legacy-prioridad-alta)
4. [Fase 3: Sincronización BD-Modelos (Prioridad MEDIA)](#fase-3-sincronización-bd-modelos-prioridad-media)
5. [Fase 4: Testing y cobertura (Prioridad MEDIA)](#fase-4-testing-y-cobertura-prioridad-media)
6. [Fase 5: Error handling robusto (Prioridad MEDIA)](#fase-5-error-handling-robusto-prioridad-media)
7. [Fase 6: Optimizaciones finales (Prioridad BAJA)](#fase-6-optimizaciones-finales-prioridad-baja)
8. [Fase 7: Documentación y OpenAPI (Prioridad BAJA)](#fase-7-documentación-y-openapi-prioridad-baja)

---

## FASE 0: Preparación y auditoría

### ✅ Checklist inicial

```bash
# 1. Crear backup completo ANTES de cualquier cambio
docker exec project-gympoint-db-1 mysqldump -uroot -pmitre280 \
  --databases gympoint --add-drop-table --routines --triggers --events \
  > backend/backup/gympoint_pre_mejoras_$(date +%Y%m%d).sql

# 2. Crear rama de trabajo
git checkout -b mejoras/cleanup-y-optimizacion

# 3. Documentar estado actual
docker exec project-gympoint-db-1 mysql -uroot -pmitre280 -D gympoint \
  -e "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'gympoint'" \
  > docs/estado_inicial_bd.txt

# 4. Listar todos los archivos del proyecto
find backend/node -path "*/node_modules" -prune -o -name "*.js" -type f -print \
  > docs/archivos_backend_inicial.txt
```

**Tiempo estimado:** 30 minutos

---

## FASE 1: Correcciones críticas (Prioridad ALTA)

### 🔴 1.1 Completar migración transaction → token_ledger

**Problema:**
- ✅ Tabla `token_ledger` creada pero VACÍA
- ❌ Tabla `transaction` legacy sigue existiendo con 6 registros
- ❌ Controladores y servicios usan `transaction` en lugar de `token_ledger`

**Solución:**

#### **1.1.1 Crear migración manual de datos**

```bash
# Crear archivo:
backend/node/migrations/20251020-complete-transaction-migration.js
```

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Completando migración transaction → token_ledger...\n');

      // 1. Verificar si token_ledger tiene datos
      const [ledgerCount] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM token_ledger',
        { transaction }
      );

      if (ledgerCount[0].count > 0) {
        console.log('⚠️  token_ledger ya tiene datos, saltando migración...');
        await transaction.commit();
        return;
      }

      // 2. Limpiar transactions huérfanas
      console.log('   → Limpiando transactions huérfanas...');
      const [deleted] = await queryInterface.sequelize.query(
        `DELETE FROM transaction
         WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)`,
        { transaction }
      );
      console.log(`   ✓ ${deleted.affectedRows || 0} registros huérfanos eliminados`);

      // 3. Migrar datos
      console.log('   → Migrando datos desde transaction...');
      await queryInterface.sequelize.query(
        `INSERT INTO token_ledger
         (id_user_profile, delta, reason, ref_type, ref_id, balance_after, created_at)
         SELECT
           t.id_user,
           CASE
             WHEN t.movement_type = 'GANANCIA' THEN t.amount
             WHEN t.movement_type = 'GASTO' THEN -t.amount
             ELSE 0
           END as delta,
           COALESCE(t.motive,
             CASE
               WHEN t.movement_type = 'GANANCIA' THEN 'LEGACY_GAIN'
               ELSE 'LEGACY_SPEND'
             END
           ) as reason,
           CASE
             WHEN t.id_reward IS NOT NULL THEN 'claimed_reward'
             ELSE NULL
           END as ref_type,
           t.id_reward as ref_id,
           t.result_balance as balance_after,
           TIMESTAMP(t.date) as created_at
         FROM transaction t
         ORDER BY t.id_transaction ASC`,
        { transaction }
      );

      const [migrated] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM token_ledger',
        { transaction }
      );
      console.log(`   ✓ ${migrated[0].count} registros migrados`);

      // 4. Eliminar tabla transaction
      console.log('   → Eliminando tabla transaction...');
      await queryInterface.dropTable('transaction', { transaction });

      await transaction.commit();
      console.log('\n✅ Migración completada exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Recrear transaction desde token_ledger
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('transaction', {
        id_transaction: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        id_user: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        movement_type: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        result_balance: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        motive: {
          type: Sequelize.STRING(255),
          allowNull: true
        }
      }, { transaction });

      await queryInterface.sequelize.query(
        `INSERT INTO transaction
         (id_user, movement_type, amount, date, id_reward, result_balance, motive)
         SELECT
           id_user_profile,
           CASE WHEN delta > 0 THEN 'GANANCIA' ELSE 'GASTO' END,
           ABS(delta),
           DATE(created_at),
           CASE WHEN ref_type = 'claimed_reward' THEN ref_id ELSE NULL END,
           balance_after,
           reason
         FROM token_ledger
         ORDER BY id_ledger ASC`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Ejecutar:**
```bash
docker-compose restart backend
docker logs -f project-gympoint-backend-1 | grep "Migración"
```

**Verificar:**
```bash
docker exec project-gympoint-db-1 mysql -uroot -pmitre280 -D gympoint \
  -e "SELECT COUNT(*) as ledger_count FROM token_ledger; SHOW TABLES LIKE 'transaction';"
```

**Resultado esperado:**
```
ledger_count
2

Empty set (transaction no debe existir)
```

**Tiempo estimado:** 1 hora

---

#### **1.1.2 Eliminar modelo Transaction.js**

```bash
# Eliminar archivo
rm backend/node/models/Transaction.js
```

**Verificar que no rompa nada:**
```bash
grep -r "require.*Transaction" backend/node --exclude-dir=node_modules
grep -r "from.*Transaction" backend/node --exclude-dir=node_modules
```

Si hay imports, reemplazarlos por `TokenLedger`.

**Tiempo estimado:** 30 minutos

---

#### **1.1.3 Crear/actualizar token-ledger-service.js**

```bash
# Crear si no existe:
backend/node/services/token-ledger-service.js
```

```javascript
const { TokenLedger, UserProfile } = require('../models');
const sequelize = require('../config/database');

/**
 * Registrar movimiento de tokens en el ledger
 * @param {Object} params
 * @param {number} params.userId - ID del user_profile
 * @param {number} params.delta - Cantidad (positivo=ganancia, negativo=gasto)
 * @param {string} params.reason - Motivo (ATTENDANCE, REWARD_CLAIM, etc.)
 * @param {string} params.refType - Tipo de referencia (opcional)
 * @param {number} params.refId - ID de referencia (opcional)
 * @param {Object} params.transaction - Transacción Sequelize (opcional)
 * @returns {Promise<Object>} Registro del ledger creado
 */
const registrarMovimiento = async ({ userId, delta, reason, refType = null, refId = null, transaction = null }) => {
  const t = transaction || await sequelize.transaction();

  try {
    // 1. Obtener balance actual con SELECT FOR UPDATE
    const userProfile = await UserProfile.findByPk(userId, {
      attributes: ['tokens'],
      lock: true,
      transaction: t
    });

    if (!userProfile) {
      throw new Error(`UserProfile ${userId} no encontrado`);
    }

    const currentBalance = userProfile.tokens;
    const newBalance = currentBalance + delta;

    // 2. Validar que no quede negativo
    if (newBalance < 0) {
      throw new Error(`Saldo insuficiente. Actual: ${currentBalance}, Intento: ${delta}`);
    }

    // 3. Crear registro en ledger
    const ledgerEntry = await TokenLedger.create({
      id_user_profile: userId,
      delta,
      reason,
      ref_type: refType,
      ref_id: refId,
      balance_after: newBalance
    }, { transaction: t });

    // 4. Actualizar balance en user_profile
    await userProfile.update({ tokens: newBalance }, { transaction: t });

    // 5. Commit si no es transacción externa
    if (!transaction) {
      await t.commit();
    }

    return {
      ledgerEntry,
      previousBalance: currentBalance,
      newBalance
    };
  } catch (error) {
    if (!transaction) {
      await t.rollback();
    }
    throw error;
  }
};

/**
 * Obtener historial de movimientos de un usuario
 */
const obtenerHistorial = async (userId, { limit = 50, offset = 0 } = {}) => {
  return await TokenLedger.findAll({
    where: { id_user_profile: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

/**
 * Obtener balance actual de un usuario
 */
const obtenerBalance = async (userId) => {
  const userProfile = await UserProfile.findByPk(userId, {
    attributes: ['tokens']
  });
  return userProfile ? userProfile.tokens : 0;
};

/**
 * Verificar idempotencia de operación
 */
const existeMovimiento = async (refType, refId) => {
  const existing = await TokenLedger.findOne({
    where: {
      ref_type: refType,
      ref_id: refId
    }
  });
  return !!existing;
};

module.exports = {
  registrarMovimiento,
  obtenerHistorial,
  obtenerBalance,
  existeMovimiento
};
```

**Tiempo estimado:** 1 hora

---

#### **1.1.4 Migrar transaction-service.js → token-ledger-service.js**

```bash
# 1. Renombrar archivo
mv backend/node/services/transaction-service.js backend/node/services/transaction-service.OLD.js

# 2. Buscar todos los usos
grep -r "transaction-service" backend/node --exclude-dir=node_modules
```

**Reemplazar imports:**
```javascript
// ANTES:
const transactionService = require('../services/transaction-service');

// DESPUÉS:
const tokenLedgerService = require('../services/token-ledger-service');
```

**Tiempo estimado:** 1 hora

---

#### **1.1.5 Actualizar transaction-controller.js**

```bash
# Renombrar
mv backend/node/controllers/transaction-controller.js \
   backend/node/controllers/token-ledger-controller.js
```

**Contenido nuevo:**
```javascript
const tokenLedgerService = require('../services/token-ledger-service');

/**
 * GET /api/tokens/history
 * Obtener historial de movimientos del usuario autenticado
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // Del middleware auth
    const { limit = 50, offset = 0 } = req.query;

    const history = await tokenLedgerService.obtenerHistorial(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const balance = await tokenLedgerService.obtenerBalance(userId);

    res.json({
      balance,
      history,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tokens/balance
 * Obtener balance actual del usuario
 */
const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const balance = await tokenLedgerService.obtenerBalance(userId);

    res.json({ balance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  getBalance
};
```

**Actualizar rutas:**
```javascript
// backend/node/routes/token-routes.js (crear si no existe)
const express = require('express');
const router = express.Router();
const tokenLedgerController = require('../controllers/token-ledger-controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.get('/history', authMiddleware, tokenLedgerController.getHistory);
router.get('/balance', authMiddleware, tokenLedgerController.getBalance);

module.exports = router;
```

**Tiempo estimado:** 1 hora

---

### 🔴 1.2 Sincronizar user_gym.plan (BD vs Modelo)

**Problema:**
```sql
-- En BD:
plan VARCHAR(250)

-- En modelo:
plan: ENUM('MENSUAL', 'SEMANAL', 'ANUAL')
```

**Solución:**

#### **Migración 20251021-fix-user-gym-plan-type.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Corrigiendo tipo de user_gym.plan...\n');

      // 1. Verificar datos actuales
      const [rows] = await queryInterface.sequelize.query(
        `SELECT DISTINCT plan FROM user_gym`,
        { transaction }
      );

      console.log('   Valores actuales:', rows.map(r => r.plan));

      // 2. Normalizar datos inválidos
      await queryInterface.sequelize.query(
        `UPDATE user_gym
         SET plan = CASE
           WHEN plan LIKE '%mensual%' OR plan LIKE '%MES%' THEN 'MENSUAL'
           WHEN plan LIKE '%semanal%' OR plan LIKE '%SEMANA%' THEN 'SEMANAL'
           WHEN plan LIKE '%anual%' OR plan LIKE '%AÑO%' THEN 'ANUAL'
           ELSE 'MENSUAL'
         END`,
        { transaction }
      );

      // 3. Cambiar tipo de columna
      await queryInterface.changeColumn('user_gym', 'plan', {
        type: Sequelize.ENUM('MENSUAL', 'SEMANAL', 'ANUAL'),
        allowNull: false,
        defaultValue: 'MENSUAL'
      }, { transaction });

      await transaction.commit();
      console.log('\n✅ Tipo de columna corregido\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn('user_gym', 'plan', {
        type: Sequelize.STRING(250),
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Tiempo estimado:** 30 minutos

---

### 🔴 1.3 Agregar constraints de validación

**Problema:** No hay validación a nivel DB de reglas de negocio.

**Solución:**

#### **Migración 20251022-add-validation-constraints.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando constraints de validación...\n');

      // 1. user_profiles.tokens >= 0
      console.log('   → Constraint: tokens no negativos...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_profiles
         ADD CONSTRAINT chk_tokens_positive CHECK (tokens >= 0)`,
        { transaction }
      );

      // 2. user_gym: finish_date >= start_date
      console.log('   → Constraint: fechas válidas en user_gym...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_gym
         ADD CONSTRAINT chk_gym_dates CHECK (finish_date IS NULL OR finish_date >= start_date)`,
        { transaction }
      );

      // 3. user_routine: finish_date >= start_date
      console.log('   → Constraint: fechas válidas en user_routine...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_routine
         ADD CONSTRAINT chk_routine_dates CHECK (finish_date IS NULL OR finish_date >= start_date)`,
        { transaction }
      );

      // 4. frequency: goal > 0
      console.log('   → Constraint: goal positivo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE frequency
         ADD CONSTRAINT chk_goal_positive CHECK (goal > 0)`,
        { transaction }
      );

      // 5. gym: coordenadas válidas
      console.log('   → Constraint: coordenadas válidas...');
      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         ADD CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90 AND 90)`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         ADD CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180 AND 180)`,
        { transaction }
      );

      await transaction.commit();
      console.log('\n✅ Constraints agregados exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE user_profiles DROP CONSTRAINT chk_tokens_positive',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE user_gym DROP CONSTRAINT chk_gym_dates',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE user_routine DROP CONSTRAINT chk_routine_dates',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE frequency DROP CONSTRAINT chk_goal_positive',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE gym DROP CONSTRAINT chk_latitude',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE gym DROP CONSTRAINT chk_longitude',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Tiempo estimado:** 45 minutos

---

**Total Fase 1:** ~6 horas
**BD mejora:** 78 → 85
**Backend mejora:** 72 → 78

---

## FASE 2: Limpieza de código legacy (Prioridad ALTA)

### 🔴 2.1 Eliminar archivos obsoletos

```bash
# Lista de archivos a eliminar:
rm backend/node/models/User.js
rm backend/node/models/Transaction.js
rm backend/node/services/transaction-service.OLD.js
rm backend/node/services/reward-stats-service-backup.js
```

**Verificar imports rotos:**
```bash
# Buscar referencias
grep -r "models/User" backend/node --exclude-dir=node_modules
grep -r "models/Transaction" backend/node --exclude-dir=node_modules
grep -r "reward-stats-service-backup" backend/node --exclude-dir=node_modules
```

**Si hay referencias, corregir:**
```javascript
// ANTES:
const User = require('./models/User');

// DESPUÉS:
const UserProfile = require('./models/UserProfile');
```

**Tiempo estimado:** 1 hora

---

### 🔴 2.2 Limpiar datos legacy de BD

#### **Migración 20251023-cleanup-legacy-data.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Limpiando datos legacy...\n');

      // 1. Eliminar refresh_tokens expirados
      console.log('   → Limpiando refresh tokens expirados...');
      const [deleted] = await queryInterface.sequelize.query(
        `DELETE FROM refresh_token
         WHERE expires_at < NOW() OR revoked = 1`,
        { transaction }
      );
      console.log(`   ✓ ${deleted.affectedRows || 0} tokens eliminados`);

      // 2. Marcar claimed_rewards pendientes antiguos como revocados
      console.log('   → Limpiando claimed_rewards pendientes antiguos...');
      await queryInterface.sequelize.query(
        `UPDATE claimed_reward
         SET status = 'revoked'
         WHERE status = 'pending'
         AND claimed_date < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        { transaction }
      );

      // 3. Limpiar gym_schedule vacíos
      console.log('   → Limpiando gym_schedule sin datos...');
      await queryInterface.sequelize.query(
        `DELETE FROM gym_schedule WHERE id_gym NOT IN (SELECT id_gym FROM gym)`,
        { transaction }
      );

      await transaction.commit();
      console.log('\n✅ Limpieza completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down() {
    // No hay rollback para limpieza de datos
    console.log('⚠️  No hay rollback para limpieza de datos');
  }
};
```

**Tiempo estimado:** 30 minutos

---

### 🟡 2.3 Crear cron job para limpieza automática

**Archivo:** `backend/node/jobs/cleanup-job.js`

```javascript
const cron = require('node-cron');
const { RefreshToken } = require('../models');
const { Op } = require('sequelize');

/**
 * Cron que se ejecuta diariamente a las 3 AM
 * Limpia refresh tokens expirados
 */
const startCleanupJob = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('🧹 Ejecutando limpieza automática...');

      const deleted = await RefreshToken.destroy({
        where: {
          [Op.or]: [
            { expires_at: { [Op.lt]: new Date() } },
            { revoked: true }
          ]
        }
      });

      console.log(`✅ Limpieza completada: ${deleted} tokens eliminados`);
    } catch (error) {
      console.error('❌ Error en limpieza automática:', error);
    }
  });

  console.log('🚀 Cron de limpieza iniciado (diario 3 AM)');
};

module.exports = { startCleanupJob };
```

**Agregar a index.js:**
```javascript
// backend/node/index.js
const { startCleanupJob } = require('./jobs/cleanup-job');

// ... después de app.listen()
startCleanupJob();
```

**Tiempo estimado:** 30 minutos

---

**Total Fase 2:** ~2 horas
**BD mejora:** 85 → 88
**Backend mejora:** 78 → 82

---

## FASE 3: Sincronización BD-Modelos (Prioridad MEDIA)

### 🟡 3.1 Convertir gym.equipment y social_media a JSON

**Problema:** Son TEXT, deberían ser JSON para queries estructuradas.

#### **Migración 20251024-gym-json-fields.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Convirtiendo campos a JSON...\n');

      // 1. Convertir equipment TEXT → JSON
      console.log('   → Convirtiendo equipment...');

      // Obtener datos actuales
      const [gyms] = await queryInterface.sequelize.query(
        `SELECT id_gym, equipment FROM gym`,
        { transaction }
      );

      // Convertir a JSON array
      for (const gym of gyms) {
        let equipmentArray = [];
        if (gym.equipment) {
          // Si es texto separado por comas
          equipmentArray = gym.equipment.split(',').map(e => e.trim());
        }

        await queryInterface.sequelize.query(
          `UPDATE gym SET equipment = ? WHERE id_gym = ?`,
          {
            replacements: [JSON.stringify(equipmentArray), gym.id_gym],
            transaction
          }
        );
      }

      // Cambiar tipo de columna
      await queryInterface.changeColumn('gym', 'equipment', {
        type: Sequelize.JSON,
        allowNull: false
      }, { transaction });

      // 2. Convertir social_media TEXT → JSON
      console.log('   → Convirtiendo social_media...');

      const [gyms2] = await queryInterface.sequelize.query(
        `SELECT id_gym, social_media FROM gym`,
        { transaction }
      );

      for (const gym of gyms2) {
        let socialObj = {};
        if (gym.social_media) {
          try {
            socialObj = JSON.parse(gym.social_media);
          } catch (e) {
            // Si no es JSON válido, crear objeto vacío
            socialObj = { legacy: gym.social_media };
          }
        }

        await queryInterface.sequelize.query(
          `UPDATE gym SET social_media = ? WHERE id_gym = ?`,
          {
            replacements: [JSON.stringify(socialObj), gym.id_gym],
            transaction
          }
        );
      }

      await queryInterface.changeColumn('gym', 'social_media', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await transaction.commit();
      console.log('\n✅ Conversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Convertir de vuelta a TEXT
      await queryInterface.changeColumn('gym', 'equipment', {
        type: Sequelize.TEXT,
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('gym', 'social_media', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Actualizar modelo Gym.js:**
```javascript
equipment: {
  type: DataTypes.JSON,
  allowNull: false,
  defaultValue: [],
  comment: 'Array de equipamiento disponible'
},
social_media: {
  type: DataTypes.JSON,
  allowNull: true,
  comment: '{"instagram": "@gym", "facebook": "..."}'
}
```

**Tiempo estimado:** 1.5 horas

---

### 🟡 3.2 Agregar campos created_at/updated_at faltantes

#### **Migración 20251025-add-timestamps.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando timestamps faltantes...\n');

      // user_gym
      const userGymCols = await queryInterface.describeTable('user_gym');
      if (!userGymCols.created_at) {
        console.log('   → user_gym.created_at...');
        await queryInterface.addColumn('user_gym', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!userGymCols.updated_at) {
        console.log('   → user_gym.updated_at...');
        await queryInterface.addColumn('user_gym', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      // user_routine
      const userRoutineCols = await queryInterface.describeTable('user_routine');
      if (!userRoutineCols.created_at) {
        console.log('   → user_routine.created_at...');
        await queryInterface.addColumn('user_routine', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!userRoutineCols.updated_at) {
        console.log('   → user_routine.updated_at...');
        await queryInterface.addColumn('user_routine', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      await transaction.commit();
      console.log('\n✅ Timestamps agregados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('user_gym', 'created_at', { transaction });
      await queryInterface.removeColumn('user_gym', 'updated_at', { transaction });
      await queryInterface.removeColumn('user_routine', 'created_at', { transaction });
      await queryInterface.removeColumn('user_routine', 'updated_at', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Actualizar modelos:**
```javascript
// UserGym.js y UserRoutine.js
{
  tableName: 'user_gym',
  timestamps: true,  // Cambiar de false a true
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}
```

**Tiempo estimado:** 1 hora

---

**Total Fase 3:** ~2.5 horas
**BD mejora:** 88 → 92

---

## FASE 4: Testing y cobertura (Prioridad MEDIA)

### 🟡 4.1 Setup de testing

**Instalar dependencias:**
```bash
npm install --save-dev jest supertest @faker-js/faker
```

**Configurar Jest:**
```json
// package.json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "services/**/*.js",
      "!services/**/*.test.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

**Tiempo estimado:** 30 minutos

---

### 🟡 4.2 Tests de auth-service

**Archivo:** `backend/node/tests/unit/auth-service.test.js`

```javascript
const authService = require('../../services/auth-service');
const { Account, UserProfile } = require('../../models');
const sequelize = require('../../config/database');

// Mock de bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn(() => Promise.resolve(true))
}));

describe('Auth Service', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('register', () => {
    it('debe crear usuario con todos los datos correctos', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        lastname: 'User',
        frequency_goal: 3
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('userProfile');
      expect(result.account.email).toBe('test@example.com');
      expect(result.userProfile.name).toBe('Test');
    });

    it('debe fallar si el email ya existe', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Test',
        lastname: 'User'
      };

      await authService.register(userData);

      await expect(
        authService.register(userData)
      ).rejects.toThrow('El email ya está registrado');
    });

    it('debe crear frequency y streak automáticamente', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New',
        lastname: 'User',
        frequency_goal: 4
      };

      const result = await authService.register(userData);

      const userProfile = await UserProfile.findByPk(result.userProfile.id_user_profile, {
        include: ['Streak', 'Frequency']
      });

      expect(userProfile.Streak).toBeDefined();
      expect(userProfile.Frequency.goal).toBe(4);
    });
  });

  describe('login', () => {
    it('debe retornar tokens para credenciales válidas', async () => {
      // TODO: implementar test
    });

    it('debe fallar con email inválido', async () => {
      // TODO: implementar test
    });

    it('debe fallar con password incorrecta', async () => {
      // TODO: implementar test
    });
  });
});
```

**Tiempo estimado:** 3 horas

---

### 🟡 4.3 Tests de token-ledger-service

**Archivo:** `backend/node/tests/unit/token-ledger-service.test.js`

```javascript
const tokenLedgerService = require('../../services/token-ledger-service');
const { UserProfile, TokenLedger } = require('../../models');
const sequelize = require('../../config/database');

describe('Token Ledger Service', () => {
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario de prueba
    testUser = await UserProfile.create({
      id_account: 1,
      name: 'Test',
      lastname: 'User',
      tokens: 100
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('registrarMovimiento', () => {
    it('debe agregar tokens correctamente', async () => {
      const result = await tokenLedgerService.registrarMovimiento({
        userId: testUser.id_user_profile,
        delta: 50,
        reason: 'TEST_GAIN'
      });

      expect(result.newBalance).toBe(150);
      expect(result.previousBalance).toBe(100);
    });

    it('debe restar tokens correctamente', async () => {
      const result = await tokenLedgerService.registrarMovimiento({
        userId: testUser.id_user_profile,
        delta: -30,
        reason: 'TEST_SPEND'
      });

      expect(result.newBalance).toBe(70);
    });

    it('debe fallar si saldo quedaría negativo', async () => {
      await expect(
        tokenLedgerService.registrarMovimiento({
          userId: testUser.id_user_profile,
          delta: -1000,
          reason: 'TEST_OVERSPEND'
        })
      ).rejects.toThrow('Saldo insuficiente');
    });

    it('debe crear registro en ledger', async () => {
      await tokenLedgerService.registrarMovimiento({
        userId: testUser.id_user_profile,
        delta: 10,
        reason: 'TEST',
        refType: 'test_ref',
        refId: 123
      });

      const ledgerEntry = await TokenLedger.findOne({
        where: { ref_type: 'test_ref', ref_id: 123 }
      });

      expect(ledgerEntry).toBeDefined();
      expect(ledgerEntry.delta).toBe(10);
      expect(ledgerEntry.reason).toBe('TEST');
    });
  });

  describe('obtenerHistorial', () => {
    it('debe retornar historial ordenado por fecha', async () => {
      // TODO: implementar
    });

    it('debe respetar limit y offset', async () => {
      // TODO: implementar
    });
  });

  describe('existeMovimiento', () => {
    it('debe detectar movimientos duplicados', async () => {
      await tokenLedgerService.registrarMovimiento({
        userId: testUser.id_user_profile,
        delta: 5,
        reason: 'UNIQUE_TEST',
        refType: 'unique_type',
        refId: 999
      });

      const exists = await tokenLedgerService.existeMovimiento('unique_type', 999);
      expect(exists).toBe(true);

      const notExists = await tokenLedgerService.existeMovimiento('unique_type', 888);
      expect(notExists).toBe(false);
    });
  });
});
```

**Tiempo estimado:** 2 horas

---

### 🟡 4.4 Tests de gym-service (búsqueda geoespacial)

**Archivo:** `backend/node/tests/unit/gym-service.test.js`

```javascript
const gymService = require('../../services/gym-service');
const { Gym } = require('../../models');
const sequelize = require('../../config/database');

describe('Gym Service - Búsqueda geoespacial', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear gyms de prueba
    await Gym.bulkCreate([
      {
        name: 'Gym Cercano',
        description: 'Test',
        city: 'Test City',
        address: 'Test',
        latitude: -34.6037,
        longitude: -58.3816,
        registration_date: new Date(),
        equipment: JSON.stringify(['pesas']),
        month_price: 1000,
        week_price: 300
      },
      {
        name: 'Gym Lejano',
        description: 'Test',
        city: 'Test City',
        address: 'Test',
        latitude: -34.7037, // ~11 km de distancia
        longitude: -58.4816,
        registration_date: new Date(),
        equipment: JSON.stringify(['cardio']),
        month_price: 1500,
        week_price: 400
      }
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('buscarGimnasiosCercanos', () => {
    it('debe retornar gyms dentro del radio', async () => {
      const result = await gymService.buscarGimnasiosCercanos(
        -34.6037, // Palermo, Buenos Aires
        -58.3816,
        5 // 5 km de radio
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Gym Cercano');
    });

    it('debe ordenar por distancia (más cercano primero)', async () => {
      const result = await gymService.buscarGimnasiosCercanos(
        -34.6037,
        -58.3816,
        20 // Radio grande para obtener ambos
      );

      expect(result[0].name).toBe('Gym Cercano');
      expect(parseFloat(result[0].distance_km)).toBeLessThan(
        parseFloat(result[1].distance_km)
      );
    });

    it('debe respetar el límite de resultados', async () => {
      const result = await gymService.buscarGimnasiosCercanos(
        -34.6037,
        -58.3816,
        50,
        1 // limit
      );

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('debe validar coordenadas inválidas', async () => {
      await expect(
        gymService.buscarGimnasiosCercanos(999, 999, 5)
      ).rejects.toThrow();
    });
  });
});
```

**Tiempo estimado:** 2 horas

---

**Total Fase 4:** ~7.5 horas
**Backend mejora:** 82 → 88

---

## FASE 5: Error handling robusto (Prioridad MEDIA)

### 🟡 5.1 Crear clases de error personalizadas

**Archivo:** `backend/node/utils/errors.js`

```javascript
/**
 * Clase base para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Validación
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Error 401 - No autenticado
 */
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error 403 - Sin permisos
 */
class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos para esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error 404 - No encontrado
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

/**
 * Error 409 - Conflicto (duplicado, estado inválido)
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error de negocio (lógica de dominio)
 */
class BusinessError extends AppError {
  constructor(message, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BusinessError
};
```

**Tiempo estimado:** 30 minutos

---

### 🟡 5.2 Middleware de manejo de errores

**Archivo:** `backend/node/middlewares/error-handler.js`

```javascript
const { AppError } = require('../utils/errors');

/**
 * Middleware de manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  // Log del error (en producción usar logger como Winston)
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id
  });

  // Si es un error operacional conocido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined
      }
    });
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'El registro ya existe',
        details: err.errors.map(e => e.path)
      }
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Referencia inválida a otro registro'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado'
      }
    });
  }

  // Error no manejado (500)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message
    }
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
```

**Agregar a index.js:**
```javascript
// backend/node/index.js
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');

// ... después de todas las rutas
app.use(notFoundHandler);
app.use(errorHandler);
```

**Tiempo estimado:** 1 hora

---

### 🟡 5.3 Refactorizar services para usar errores personalizados

**Ejemplo en gym-service.js:**

```javascript
// ANTES:
const updateGym = async (id, data) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');
  // ...
};

// DESPUÉS:
const { NotFoundError } = require('../utils/errors');

const updateGym = async (id, data) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new NotFoundError('Gimnasio');
  // ...
};
```

**Archivos a refactorizar:**
- gym-service.js
- auth-service.js
- assistance-service.js
- reward-service.js
- user-service.js
- routine-service.js

**Tiempo estimado:** 2 horas

---

**Total Fase 5:** ~3.5 horas
**Backend mejora:** 88 → 91

---

## FASE 6: Optimizaciones finales (Prioridad BAJA)

### 🟢 6.1 Soft deletes para entidades principales

#### **Migración 20251026-add-soft-deletes.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando soft deletes...\n');

      const tables = ['gym', 'reward', 'routine', 'exercise'];

      for (const table of tables) {
        const columns = await queryInterface.describeTable(table);

        if (!columns.deleted_at) {
          console.log(`   → ${table}.deleted_at...`);
          await queryInterface.addColumn(table, 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction });

          // Crear índice para queries eficientes
          await queryInterface.addIndex(table, ['deleted_at'], {
            name: `idx_${table}_deleted_at`,
            transaction
          });
        }
      }

      await transaction.commit();
      console.log('\n✅ Soft deletes agregados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tables = ['gym', 'reward', 'routine', 'exercise'];

      for (const table of tables) {
        await queryInterface.removeIndex(table, `idx_${table}_deleted_at`, { transaction });
        await queryInterface.removeColumn(table, 'deleted_at', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Actualizar modelos:**
```javascript
// Ejemplo: Gym.js
const Gym = sequelize.define('Gym', {
  // ... campos existentes
}, {
  tableName: 'gym',
  timestamps: true,
  paranoid: true, // Habilita soft delete
  deletedAt: 'deleted_at'
});
```

**Tiempo estimado:** 1 hora

---

### 🟢 6.2 Índices adicionales para performance

#### **Migración 20251027-performance-indexes.js**

```javascript
'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando índices de performance...\n');

      // reward: filtros comunes
      await queryInterface.addIndex('reward', ['available', 'start_date', 'finish_date'], {
        name: 'idx_reward_availability',
        transaction
      });

      // claimed_reward: queries por usuario y estado
      await queryInterface.addIndex('claimed_reward', ['id_user', 'status', 'claimed_date'], {
        name: 'idx_claimed_status_date',
        transaction
      });

      // refresh_token: limpieza de expirados
      await queryInterface.addIndex('refresh_token', ['expires_at', 'revoked'], {
        name: 'idx_token_expiration',
        transaction
      });

      // gym_payment: búsquedas por usuario
      await queryInterface.addIndex('gym_payment', ['id_user', 'payment_date'], {
        name: 'idx_payment_user_date',
        transaction
      });

      await transaction.commit();
      console.log('\n✅ Índices de performance agregados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeIndex('reward', 'idx_reward_availability', { transaction });
      await queryInterface.removeIndex('claimed_reward', 'idx_claimed_status_date', { transaction });
      await queryInterface.removeIndex('refresh_token', 'idx_token_expiration', { transaction });
      await queryInterface.removeIndex('gym_payment', 'idx_payment_user_date', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

**Tiempo estimado:** 30 minutos

---

### 🟢 6.3 Normalizar constantes y configuración

**Crear archivo:** `backend/node/config/constants.js`

```javascript
module.exports = {
  // Tokens
  TOKENS: {
    ATTENDANCE: parseInt(process.env.TOKENS_ATTENDANCE || 5),
    ROUTINE_COMPLETE: parseInt(process.env.TOKENS_ROUTINE_COMPLETED || 10),
    WEEKLY_BONUS: parseInt(process.env.WEEKLY_GOAL_BONUS || 20)
  },

  // Proximity
  PROXIMITY_METERS: parseInt(process.env.PROXIMITY_M || 180),

  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  // Auth
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m',
  REFRESH_TOKEN_TTL_DAYS: 30,

  // Gym search
  MAX_SEARCH_RADIUS_KM: 100,
  DEFAULT_SEARCH_RADIUS_KM: 5,

  // Token reasons
  TOKEN_REASONS: {
    ATTENDANCE: 'ATTENDANCE',
    ROUTINE_COMPLETE: 'ROUTINE_COMPLETE',
    REWARD_CLAIM: 'REWARD_CLAIM',
    WEEKLY_BONUS: 'WEEKLY_BONUS',
    ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
    STREAK_RECOVERY: 'STREAK_RECOVERY'
  },

  // Reward providers
  REWARD_PROVIDERS: {
    SYSTEM: 'system',
    GYM: 'gym'
  }
};
```

**Usar en services:**
```javascript
const { TOKENS, TOKEN_REASONS } = require('../config/constants');

// En lugar de hardcoded:
const tokens = 5;

// Usar:
const tokens = TOKENS.ATTENDANCE;
```

**Tiempo estimado:** 1.5 horas

---

**Total Fase 6:** ~3 horas
**BD mejora:** 92 → 94
**Backend mejora:** 91 → 93

---

## FASE 7: Documentación y OpenAPI (Prioridad BAJA)

### 🟢 7.1 Actualizar OpenAPI para token_ledger

**Archivo:** `backend/node/docs/openapi.yaml` (o donde esté)

```yaml
paths:
  /api/tokens/balance:
    get:
      summary: Obtener balance de tokens del usuario
      tags: [Tokens]
      security:
        - bearerAuth: []
      responses:
        200:
          description: Balance actual
          content:
            application/json:
              schema:
                type: object
                properties:
                  balance:
                    type: integer
                    example: 150

  /api/tokens/history:
    get:
      summary: Historial de movimientos de tokens
      tags: [Tokens]
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            default: 50
        - in: query
          name: offset
          schema:
            type: integer
            default: 0
      responses:
        200:
          description: Historial de tokens
          content:
            application/json:
              schema:
                type: object
                properties:
                  balance:
                    type: integer
                  history:
                    type: array
                    items:
                      $ref: '#/components/schemas/TokenLedgerEntry'

components:
  schemas:
    TokenLedgerEntry:
      type: object
      properties:
        id_ledger:
          type: integer
        id_user_profile:
          type: integer
        delta:
          type: integer
          description: Positivo=ganancia, negativo=gasto
        reason:
          type: string
          enum: [ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS]
        ref_type:
          type: string
          nullable: true
        ref_id:
          type: integer
          nullable: true
        balance_after:
          type: integer
        created_at:
          type: string
          format: date-time
```

**Tiempo estimado:** 1 hora

---

### 🟢 7.2 Agregar JSDoc a services principales

**Ejemplo:**
```javascript
/**
 * Servicio de gestión de Token Ledger
 *
 * Implementa el patrón Ledger para rastrear todos los movimientos
 * de tokens de usuarios. Garantiza:
 * - Balance nunca negativo
 * - Auditoría completa de movimientos
 * - Idempotencia mediante ref_type/ref_id
 *
 * @module services/token-ledger-service
 */

/**
 * Registra un movimiento de tokens
 *
 * @async
 * @param {Object} params - Parámetros del movimiento
 * @param {number} params.userId - ID del user_profile
 * @param {number} params.delta - Cantidad (positivo=ganancia, negativo=gasto)
 * @param {string} params.reason - Motivo del movimiento
 * @param {string} [params.refType] - Tipo de referencia (opcional)
 * @param {number} [params.refId] - ID de referencia (opcional)
 * @param {Transaction} [params.transaction] - Transacción Sequelize (opcional)
 *
 * @returns {Promise<Object>} Resultado con ledgerEntry, previousBalance, newBalance
 *
 * @throws {Error} Si el usuario no existe
 * @throws {Error} Si el saldo quedaría negativo
 *
 * @example
 * const result = await registrarMovimiento({
 *   userId: 123,
 *   delta: 10,
 *   reason: 'ATTENDANCE',
 *   refType: 'assistance',
 *   refId: 456
 * });
 *
 * console.log(result.newBalance); // 110
 */
const registrarMovimiento = async ({ ... }) => { ... };
```

**Archivos a documentar:**
- token-ledger-service.js
- auth-service.js
- gym-service.js
- assistance-service.js

**Tiempo estimado:** 2 horas

---

### 🟢 7.3 Crear README de servicios

**Archivo:** `backend/node/services/README.md`

```markdown
# Services - Capa de Lógica de Negocio

Esta carpeta contiene todos los servicios de la aplicación. Los services implementan la lógica de dominio y orquestan operaciones complejas.

## Principios

1. **Sin dependencias HTTP**: Los services no deben depender de Express (req, res)
2. **Transaccionales**: Operaciones críticas deben usar transacciones DB
3. **Idempotentes**: Operaciones repetidas deben dar el mismo resultado
4. **Validación**: Usar Joi para validar parámetros de entrada

## Servicios principales

### auth-service.js
Gestión de autenticación y autorización.
- Registro de usuarios
- Login local y Google OAuth
- Generación de tokens JWT
- Refresh token rotation

### token-ledger-service.js
Sistema de ledger para tokens de usuarios.
- Registro de movimientos (ganancia/gasto)
- Garantía de balance no negativo
- Auditoría completa de transacciones

### gym-service.js
Gestión de gimnasios.
- CRUD de gimnasios
- **Búsqueda geoespacial** (bounding box + Haversine)
- Filtros por ciudad, tipo, precio

### assistance-service.js
Registro de asistencias a gimnasios.
- Validación de proximidad (GPS)
- Control de racha (streak)
- Otorgamiento de tokens

## Testing

Cada service debe tener su archivo `.test.js` correspondiente en `tests/unit/`.

Ver `tests/unit/token-ledger-service.test.js` como ejemplo.
```

**Tiempo estimado:** 30 minutos

---

**Total Fase 7:** ~3.5 horas
**Backend mejora:** 93 → 95

---

## 📅 CRONOGRAMA SUGERIDO

| Día | Fases | Horas | BD | Backend |
|-----|-------|-------|----|----|
| **Día 1** | Fase 0 + Fase 1 | 6.5h | 78→85 | 72→78 |
| **Día 2** | Fase 2 + Fase 3 | 4.5h | 85→92 | 78→82 |
| **Día 3** | Fase 4 (Testing) | 7.5h | 92 | 82→88 |
| **Día 4** | Fase 5 + Fase 6 | 6.5h | 92→94 | 88→93 |
| **Día 5** | Fase 7 + Testing final | 3.5h | 94→95 | 93→95 |

**Total:** ~28 horas de trabajo

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

Antes de dar por completado el plan, verificar:

### Base de Datos
- [ ] Tabla `transaction` eliminada
- [ ] Tabla `token_ledger` con datos migrados
- [ ] Constraints CHECK funcionando
- [ ] user_gym.plan es ENUM
- [ ] gym.equipment y social_media son JSON
- [ ] Todos los timestamps agregados
- [ ] Soft deletes en tablas principales
- [ ] Índices de performance creados

### Backend
- [ ] Modelos Transaction.js y User.js eliminados
- [ ] token-ledger-service.js implementado
- [ ] Errores personalizados en todos los services
- [ ] Coverage de tests >= 70%
- [ ] OpenAPI actualizado
- [ ] JSDoc en services principales
- [ ] Constantes centralizadas
- [ ] Cron jobs funcionando

### Pruebas Manuales
```bash
# 1. Tests pasan
npm test

# 2. Migraciones OK
docker-compose down && docker-compose up --build -d
docker logs -f project-gympoint-backend-1 | grep "Migración"

# 3. Endpoints funcionan
curl http://localhost:3000/health
curl http://localhost:3000/api/tokens/balance -H "Authorization: Bearer TOKEN"

# 4. Backup final
docker exec project-gympoint-db-1 mysqldump -uroot -pmitre280 \
  --databases gympoint > backend/backup/gympoint_FINAL.sql
```

---

## 🎯 RESULTADO ESPERADO

### Antes
- **BD:** 78/100
- **Backend:** 72/100

### Después
- **BD:** 95/100 ✨
- **Backend:** 95/100 ✨

### Mejoras clave
1. ✅ Sistema de ledger completo y auditado
2. ✅ Código legacy eliminado
3. ✅ Testing robusto (>70% coverage)
4. ✅ Error handling profesional
5. ✅ BD normalizada y optimizada
6. ✅ Documentación completa

---

## 📝 NOTAS FINALES

- Cada fase debe completarse **antes** de pasar a la siguiente
- Hacer **backup** antes de cada migración
- **Commitear** después de cada fase exitosa
- Ejecutar **tests** después de cada cambio mayor
- Mantener el servidor **corriendo** durante refactors

**¡Éxito con las mejoras! 🚀**
