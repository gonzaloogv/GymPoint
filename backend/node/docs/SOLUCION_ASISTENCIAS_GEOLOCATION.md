# 🔧 SOLUCIONES: Sistema de Asistencias y Geolocalización

**Fecha:** 2025-10-15  
**Relacionado con:** `AUDITORIA_ASISTENCIAS_GEOLOCATION.md`

---

## 📋 Índice de Soluciones

1. [Migración SQL para Presence](#1-migración-sql-para-presence)
2. [Consolidación de Servicios](#2-consolidación-de-servicios)
3. [Controladores Faltantes](#3-controladores-faltantes)
4. [Módulo Geo Compartido](#4-módulo-geo-compartido)
5. [Correcciones en GeolocationService](#5-correcciones-en-geolocationservice)
6. [Testing](#6-testing)

---

## 1. Migración SQL para Presence

### ✅ ACTUALIZADO: Migración Corregida

La migración **ya fue actualizada** con el esquema correcto en:
- `backend/db/migrations/20251015_create_presence_table.sql`

### 📋 Pasos de Ejecución

#### Opción A: Si la tabla NO existe aún (RECOMENDADO)

```bash
# Simplemente ejecutar la migración
mysql -u root -p gympoint_db < backend/db/migrations/20251015_create_presence_table.sql
```

#### Opción B: Si la tabla YA existe con esquema antiguo

```bash
# 1. Borrar tabla antigua
mysql -u root -p gympoint_db < backend/db/migrations/20251015_01_drop_old_presence_table.sql

# 2. Crear tabla con esquema correcto
mysql -u root -p gympoint_db < backend/db/migrations/20251015_create_presence_table.sql
```

### 🔍 Verificar Migración Exitosa

```sql
-- Verificar que la tabla existe con el esquema correcto
DESC presence;

-- Debe mostrar:
-- id_presence           BIGINT
-- id_user_profile       INT
-- id_gym                INT
-- first_seen_at         DATETIME
-- last_seen_at          DATETIME
-- exited_at             DATETIME (NULL)
-- status                ENUM('DETECTING','CONFIRMED','EXITED')
-- converted_to_assistance TINYINT(1)
-- id_assistance         INT (NULL)
-- distance_meters       DECIMAL(6,2) (NULL)
-- accuracy_meters       DECIMAL(6,2) (NULL)
-- location_updates_count INT
-- created_at            DATETIME
-- updated_at            DATETIME

-- Verificar foreign keys
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'presence'
AND TABLE_SCHEMA = DATABASE();

-- Debe mostrar 3 foreign keys:
-- fk_presence_user_profile  → user_profiles(id_user_profile)
-- fk_presence_gym           → gym(id_gym)
-- fk_presence_assistance    → assistance(id_assistance)
```

### ⚠️ IMPORTANTE: Diferencias con Esquema Antiguo

| Campo Antiguo | Campo Nuevo | Tipo |
|---------------|-------------|------|
| `id_user` ❌ | `id_user_profile` ✅ | INT |
| `entry_time` ❌ | `first_seen_at` ✅ | DATETIME |
| N/A | `last_seen_at` ✅ | DATETIME (nuevo) |
| `exit_time` ❌ | `exited_at` ✅ | DATETIME |
| `completed` ❌ | `status` ✅ | ENUM |
| N/A | `converted_to_assistance` ✅ | BOOLEAN (nuevo) |
| N/A | `id_assistance` ✅ | INT (nuevo) |
| N/A | `distance_meters` ✅ | DECIMAL (nuevo) |
| N/A | `accuracy_meters` ✅ | DECIMAL (nuevo) |
| N/A | `location_updates_count` ✅ | INT (nuevo) |

---

## 2. Consolidación de Servicios

### Opción A: Actualizar `geolocation-service.js` (RECOMENDADO)

**Agregar otorgamiento de tokens y correcciones:**

```javascript
// backend/node/services/geolocation-service.js

const Presence = require('../models/Presence');
const Gym = require('../models/Gym');
const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const Frequency = require('../models/Frequency');
const { UserProfile } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const tokenLedgerService = require('./token-ledger-service');
const frequencyService = require('./frequency-service');
const { TOKENS, TOKEN_REASONS, PROXIMITY_METERS } = require('../config/constants');
const { calculateDistance } = require('../utils/geo');  // ✅ Usar función compartida

class GeolocationService {
  
  /**
   * MÉTODO PRINCIPAL: Actualizar ubicación del usuario
   * Este método hace TODO automáticamente
   */
  async updateLocation(userId, latitude, longitude, accuracy = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Buscar gyms cercanos
      const nearbyGyms = await this.findNearbyGyms(latitude, longitude, 500);
      
      // 2. Filtrar gyms con auto-checkin habilitado y en geofence
      const gymsInRange = nearbyGyms.filter(gym => 
        gym.auto_checkin_enabled && gym.in_geofence
      );
      
      let autoCheckinResult = null;
      
      // 3. Procesar cada gym en rango
      for (const gym of gymsInRange) {
        const result = await this._processPresence(
          userId, 
          gym, 
          latitude, 
          longitude, 
          accuracy,
          transaction
        );
        
        if (result && result.auto_checkin) {
          autoCheckinResult = result;
          break; // Solo un auto check-in a la vez
        }
      }
      
      // 4. Marcar como EXITED presencias que ya no están en rango
      await this._markExitedPresences(userId, gymsInRange, transaction);
      
      await transaction.commit();
      
      return {
        nearby_gyms: nearbyGyms,
        auto_checkin: autoCheckinResult
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Buscar gimnasios cercanos
   */
  async findNearbyGyms(userLat, userLon, maxDistance = 5000) {
    const gyms = await Gym.findAll({
      where: {
        deleted_at: null,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null }
      }
    });
    
    const nearby = gyms
      .map(gym => {
        const distance = calculateDistance(
          userLat, userLon,
          parseFloat(gym.latitude),
          parseFloat(gym.longitude)
        );
        return { 
          ...gym.toJSON(), 
          distance,
          in_geofence: distance <= (gym.geofence_radius_meters || PROXIMITY_METERS)
        };
      })
      .filter(gym => gym.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    return nearby;
  }
  
  /**
   * Procesar presencia en un gym específico
   */
  async _processPresence(userId, gym, latitude, longitude, accuracy, transaction) {
    const now = new Date();
    
    // Buscar presencia activa
    let presence = await Presence.findOne({
      where: {
        id_user_profile: userId,
        id_gym: gym.id_gym,
        status: { [Op.in]: ['DETECTING', 'CONFIRMED'] }
      },
      transaction
    });
    
    if (!presence) {
      // Crear nueva presencia
      presence = await Presence.create({
        id_user_profile: userId,
        id_gym: gym.id_gym,
        first_seen_at: now,
        last_seen_at: now,
        status: 'DETECTING',
        distance_meters: gym.distance,
        accuracy_meters: accuracy,
        location_updates_count: 1
      }, { transaction });
      
      return { presence, auto_checkin: null };
    }
    
    // Actualizar presencia existente
    presence.last_seen_at = now;
    presence.distance_meters = gym.distance;
    presence.accuracy_meters = accuracy;
    presence.location_updates_count += 1;
    await presence.save({ transaction });
    
    // Calcular duración
    const durationMinutes = (now - presence.first_seen_at) / 60000;
    
    // Si ya convirtió a assistance, no hacer nada más
    if (presence.converted_to_assistance) {
      return { presence, auto_checkin: null };
    }
    
    // Si cumple permanencia mínima, auto check-in
    const minStay = gym.min_stay_minutes || 10;
    if (durationMinutes >= minStay) {
      const assistance = await this._createAutoCheckIn(
        userId, 
        gym, 
        presence,
        transaction
      );
      
      return {
        presence,
        auto_checkin: {
          id_assistance: assistance.id_assistance,
          gym_name: gym.name,
          duration_minutes: Math.round(durationMinutes),
          check_in_time: assistance.check_in_time,
          tokens_awarded: TOKENS.ATTENDANCE,
          streak_value: assistance.streak_value
        }
      };
    }
    
    return { presence, auto_checkin: null };
  }
  
  /**
   * Crear auto check-in (asistencia)
   * ✅ CORREGIDO: Ahora otorga tokens y actualiza streak/frecuencia
   */
  async _createAutoCheckIn(userId, gym, presence, transaction) {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar que no tenga asistencia hoy
    const existingAssistance = await Assistance.findOne({
      where: {
        id_user: userId,
        date: today
      },
      transaction
    });
    
    if (existingAssistance) {
      throw new Error('Ya tienes una asistencia registrada hoy');
    }
    
    // ✅ Obtener UserProfile para id_streak
    const userProfile = await UserProfile.findByPk(userId, { transaction });
    if (!userProfile) throw new Error('Usuario no encontrado');
    
    // ✅ Obtener o crear streak
    let streak = await Streak.findByPk(userProfile.id_streak, { transaction });
    if (!streak) {
      const frequency = await this._getOrCreateFrequency(userId, transaction);
      streak = await Streak.create({
        id_user: userId,
        id_frequency: frequency.id_frequency,
        value: 0,
        last_value: 0,
        recovery_items: 0
      }, { transaction });
      
      // Actualizar UserProfile con el nuevo streak
      await userProfile.update({ id_streak: streak.id_streak }, { transaction });
    }
    
    // ✅ Actualizar racha
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().split('T')[0];
    
    const ultimaAsistencia = await Assistance.findOne({
      where: { id_user: userId, date: fechaAyer },
      transaction
    });
    
    if (ultimaAsistencia) {
      streak.value += 1;
    } else {
      if (streak.recovery_items > 0) {
        streak.recovery_items -= 1;
      } else {
        streak.last_value = streak.value;
        streak.value = 1;
      }
    }
    await streak.save({ transaction });
    
    // Crear asistencia
    const now = new Date();
    const checkInTime = now.toTimeString().slice(0, 8);
    
    const assistance = await Assistance.create({
      id_user: userId,
      id_gym: gym.id_gym,
      id_streak: streak.id_streak,  // ✅ CORREGIDO: Ahora incluye id_streak
      date: today,
      hour: checkInTime, // legacy
      check_in_time: checkInTime,
      auto_checkin: true,
      distance_meters: presence.distance_meters,
      verified: true
    }, { transaction });
    
    // Actualizar presence
    presence.status = 'CONFIRMED';
    presence.converted_to_assistance = true;
    presence.id_assistance = assistance.id_assistance;
    await presence.save({ transaction });
    
    // ✅ NUEVO: Otorgar tokens
    await tokenLedgerService.registrarMovimiento({
      userId,
      delta: TOKENS.ATTENDANCE,
      reason: TOKEN_REASONS.ATTENDANCE,
      refType: 'assistance',
      refId: assistance.id_assistance,
      transaction
    });
    
    // ✅ NUEVO: Actualizar frecuencia semanal
    await frequencyService.actualizarAsistenciaSemanal(userId, transaction);
    
    // Agregar valor de streak para retornar
    assistance.streak_value = streak.value;
    
    return assistance;
  }
  
  /**
   * Marcar presencias que salieron del rango como EXITED
   */
  async _markExitedPresences(userId, gymsInRange, transaction) {
    const gymIdsInRange = gymsInRange.map(g => g.id_gym);
    
    await Presence.update(
      {
        status: 'EXITED',
        exited_at: new Date()
      },
      {
        where: {
          id_user_profile: userId,
          status: 'DETECTING',
          id_gym: { [Op.notIn]: gymIdsInRange.length ? gymIdsInRange : [0] },
          last_seen_at: { [Op.lt]: new Date(Date.now() - 5 * 60000) } // 5 min sin updates
        },
        transaction
      }
    );
  }
  
  /**
   * Obtener o crear frequency del usuario
   */
  async _getOrCreateFrequency(userId, transaction) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    let frequency = await Frequency.findOne({
      where: {
        id_user: userId,
        week_start_date: weekStartStr
      },
      transaction
    });
    
    if (!frequency) {
      frequency = await Frequency.create({
        id_user: userId,
        goal: 3,
        assist: 0,
        achieved_goal: false,
        week_start_date: weekStartStr,
        week_number: this._getWeekNumber(today),
        year: today.getFullYear()
      }, { transaction });
    }
    
    return frequency;
  }
  
  /**
   * Obtener número de semana
   */
  _getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

module.exports = new GeolocationService();
```

---

## 3. Controladores Faltantes

**Actualizar:** `backend/node/controllers/assistance-controller.js`

```javascript
const assistanceService = require('../services/assistance-service');
const geolocationService = require('../services/geolocation-service');  // ✅ NUEVO

/**
 * Registrar presencia del usuario en el rango geofence
 * @route POST /api/assistances/presence
 * @access Private (Usuario app)
 */
const registrarPresencia = async (req, res) => {
  try {
    const { id_gym, latitude, longitude, accuracy } = req.body;
    const id_user_profile = req.user.id_user_profile;

    if (id_gym == null || latitude == null || longitude == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: id_gym, latitude, longitude'
        }
      });
    }

    // ✅ USAR geolocation-service
    const resultado = await geolocationService.updateLocation(
      id_user_profile,
      latitude,
      longitude,
      accuracy
    );

    return res.status(201).json({
      message: 'Presencia registrada con éxito',
      data: resultado
    });
  } catch (err) {
    console.error('Error en registrarPresencia:', err.message);
    return res.status(400).json({
      error: {
        code: 'PRESENCE_REGISTRATION_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Verificar y registrar auto check-in si usuario cumplió permanencia mínima
 * @route POST /api/assistances/auto-checkin
 * @access Private (Usuario app)
 */
const verificarAutoCheckIn = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    const id_user_profile = req.user.id_user_profile;

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: latitude, longitude'
        }
      });
    }

    // ✅ USAR geolocation-service
    const resultado = await geolocationService.updateLocation(
      id_user_profile,
      latitude,
      longitude,
      accuracy
    );

    if (resultado.auto_checkin) {
      return res.status(201).json({
        message: 'Auto check-in registrado con éxito',
        data: resultado.auto_checkin
      });
    } else {
      return res.status(200).json({
        message: 'Presencia actualizada, permanencia insuficiente',
        data: {
          nearby_gyms: resultado.nearby_gyms,
          auto_checkin: null
        }
      });
    }
  } catch (err) {
    console.error('Error en verificarAutoCheckIn:', err.message);
    return res.status(400).json({
      error: {
        code: 'AUTO_CHECKIN_VERIFICATION_FAILED',
        message: err.message
      }
    });
  }
};

// ✅ EXPORTAR nuevas funciones
module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  autoCheckIn,
  checkOut,
  registrarPresencia,      // ✅ NUEVO
  verificarAutoCheckIn     // ✅ NUEVO
};
```

---

## 4. Módulo Geo Compartido

**Crear:** `backend/node/utils/geo.js`

```javascript
/**
 * Utilidades de Geolocalización
 * @module utils/geo
 */

/**
 * Calcular distancia entre dos coordenadas usando fórmula Haversine
 * @param {number} lat1 - Latitud punto 1 (grados)
 * @param {number} lon1 - Longitud punto 1 (grados)
 * @param {number} lat2 - Latitud punto 2 (grados)
 * @param {number} lon2 - Longitud punto 2 (grados)
 * @returns {number} Distancia en metros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distancia en metros
}

/**
 * Validar coordenadas GPS
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {boolean} true si son válidas
 */
function isValidCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  return (
    !isNaN(lat) && 
    !isNaN(lon) &&
    lat >= -90 && 
    lat <= 90 &&
    lon >= -180 && 
    lon <= 180
  );
}

/**
 * Validar precisión GPS
 * @param {number} accuracy - Precisión en metros
 * @param {number} maxAccuracy - Precisión máxima aceptable
 * @returns {boolean} true si es aceptable
 */
function isAcceptableAccuracy(accuracy, maxAccuracy) {
  if (accuracy == null) return true; // Si no se envía, aceptar
  const acc = parseFloat(accuracy);
  return !isNaN(acc) && acc >= 0 && acc <= maxAccuracy;
}

module.exports = {
  calculateDistance,
  isValidCoordinates,
  isAcceptableAccuracy
};
```

---

## 5. Correcciones en GeolocationService

**Reemplazar en `assistance-service.js`:**

```javascript
// ❌ ANTES
const { NotFoundError, ConflictError, BusinessError, ValidationError } = require('../utils/errors');
const { PROXIMITY_METERS, ACCURACY_MAX_METERS, TOKENS, TOKEN_REASONS } = require('../config/constants');

// Utilidad para validar distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6378137;
  // ... código duplicado
}

// ✅ DESPUÉS
const { NotFoundError, ConflictError, BusinessError, ValidationError } = require('../utils/errors');
const { PROXIMITY_METERS, ACCURACY_MAX_METERS, TOKENS, TOKEN_REASONS } = require('../config/constants');
const { calculateDistance, isAcceptableAccuracy } = require('../utils/geo');  // ✅ Usar módulo compartido

// ✅ Eliminar función calcularDistancia local

// ✅ En registrarAsistencia, línea 60:
const distancia = calculateDistance(latitude, longitude, gym.latitude, gym.longitude);

// ✅ En autoCheckIn, línea 259:
const distancia = calculateDistance(latitude, longitude, gym.latitude, gym.longitude);
```

---

## 6. Testing

**Crear:** `backend/node/tests/services/geolocation-service.test.js`

```javascript
const geolocationService = require('../../services/geolocation-service');
const { UserProfile, Gym, Presence, Assistance, Streak } = require('../../models');
const sequelize = require('../../config/database');

describe('GeolocationService', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('updateLocation', () => {
    it('debe crear presencia cuando usuario entra en geofence', async () => {
      // Crear usuario y gym de prueba
      const user = await UserProfile.create({
        id_account: 1,
        name: 'Test',
        lastname: 'User'
      });

      const gym = await Gym.create({
        name: 'Test Gym',
        latitude: -34.603722,
        longitude: -58.38159,
        auto_checkin_enabled: true,
        geofence_radius_meters: 100,
        min_stay_minutes: 10
      });

      // Ubicación cercana al gym
      const result = await geolocationService.updateLocation(
        user.id_user_profile,
        -34.603722,
        -58.38159,
        20
      );

      expect(result.nearby_gyms).toHaveLength(1);
      expect(result.auto_checkin).toBeNull(); // Todavía no cumple permanencia mínima

      // Verificar que se creó presencia
      const presence = await Presence.findOne({
        where: {
          id_user_profile: user.id_user_profile,
          id_gym: gym.id_gym
        }
      });

      expect(presence).not.toBeNull();
      expect(presence.status).toBe('DETECTING');
    });

    it('debe crear asistencia después de permanencia mínima', async () => {
      // TODO: Implementar test con mock de tiempo
    });

    it('debe otorgar tokens en auto check-in', async () => {
      // TODO: Implementar test de tokens
    });

    it('debe actualizar streak en auto check-in', async () => {
      // TODO: Implementar test de streak
    });
  });
});
```

---

## 📋 Checklist de Implementación

### Fase 1: Base de Datos
- [ ] Ejecutar migración `20251015_02_migrate_presence_to_new_schema.sql`
- [ ] Verificar que tabla `presence` tiene esquema nuevo
- [ ] Verificar Foreign Keys correctas

### Fase 2: Código Compartido
- [ ] Crear `utils/geo.js`
- [ ] Actualizar `assistance-service.js` para usar `utils/geo.js`
- [ ] Actualizar `geolocation-service.js` para usar `utils/geo.js`

### Fase 3: Servicio de Geolocalización
- [ ] Actualizar `geolocation-service.js` con correcciones
- [ ] Agregar otorgamiento de tokens
- [ ] Agregar actualización de streak/frecuencia
- [ ] Agregar `id_streak` en creación de asistencia

### Fase 4: Controladores
- [ ] Agregar `registrarPresencia` en `assistance-controller.js`
- [ ] Agregar `verificarAutoCheckIn` en `assistance-controller.js`
- [ ] Exportar nuevas funciones

### Fase 5: Limpieza
- [ ] Marcar funciones antiguas como `@deprecated` en `assistance-service.js`
- [ ] Agregar comentarios de migración
- [ ] Documentar cambios en CHANGELOG

### Fase 6: Testing
- [ ] Crear tests unitarios
- [ ] Probar flujo completo de auto check-in
- [ ] Verificar otorgamiento de tokens
- [ ] Verificar actualización de métricas
- [ ] Testing en ambiente de desarrollo

### Fase 7: Documentación
- [ ] Actualizar documentación de API
- [ ] Actualizar Swagger/OpenAPI
- [ ] Documentar cambios para frontend

---

## 🚀 Orden de Ejecución Recomendado

1. **Base de Datos** (10 min)
   - Ejecutar migración SQL
   - Verificar esquema

2. **Utilidades** (15 min)
   - Crear `utils/geo.js`
   - Actualizar imports

3. **Geolocation Service** (2-3 horas)
   - Implementar correcciones
   - Agregar tokens y streak

4. **Controladores** (30 min)
   - Agregar funciones faltantes

5. **Testing** (2-3 horas)
   - Tests unitarios
   - Tests de integración

6. **Documentación** (1 hora)
   - Actualizar docs
   - Swagger

**Total estimado:** 6-8 horas

---

**Próximos pasos:**
1. ✅ Revisar y aprobar soluciones
2. ✅ Ejecutar migración de BD
3. ✅ Implementar cambios en código
4. ✅ Ejecutar tests
5. ✅ Deploy a desarrollo para validación

---

**Elaborado por:** Desarrollador Backend Senior  
**Fecha:** 2025-10-15  
**Versión:** 1.0

