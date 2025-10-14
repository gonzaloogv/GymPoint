# Plan de Implementación MVP - GymPoint v2.0

## Resumen Ejecutivo

Este es un plan realista y enfocado para llevar GymPoint a producción sin over-engineering. Tu base de datos actual está al 90% completa. Solo necesitas agregar funcionalidades críticas del wireframe en 4-5 semanas.
---

## Estado Actual

Tu BD ya tiene:
- ✅ Sistema de autenticación completo
- ✅ Perfiles y roles
- ✅ Gimnasios con reviews y ratings
- ✅ Workout sessions y tracking
- ✅ Métricas corporales (IMC, peso)
- ✅ Sistema de tokens y recompensas
- ✅ Pagos con MercadoPago
- ✅ Notificaciones

Lo que falta para MVP:
- Geolocalización y auto check-in
- Desafíos diarios simples
- Rutinas plantilla/recomendadas
- 8 campos en 4 tablas

---

## FASE 1: Lo Esencial (2 semanas)

### 1.1 Geolocalización y Auto Check-in

**Por qué es crítico:**
- Wireframe muestra "Buscar gimnasios cercanos"
- Sin esto, usuario tiene que hacer check-in manual
- Auto check-in es diferenciador

**SQL Minimal:**

```sql
-- Tabla simple de geofence
CREATE TABLE gym_geofence (
    id_geofence INT PRIMARY KEY AUTO_INCREMENT,
    id_gym INT NOT NULL UNIQUE,
    radius_meters INT DEFAULT 150 COMMENT 'Radio para auto check-in',
    auto_checkin_enabled BOOLEAN DEFAULT TRUE,
    min_stay_minutes INT DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    INDEX idx_auto_checkin (auto_checkin_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración de geolocalización para auto check-in';

-- Agregar campos a ASSISTANCE
ALTER TABLE assistance
ADD COLUMN check_in_time TIME NULL AFTER hour COMMENT 'Hora exacta entrada',
ADD COLUMN check_out_time TIME NULL AFTER check_in_time COMMENT 'Hora exacta salida',
ADD COLUMN duration_minutes INT GENERATED ALWAYS AS (
    CASE 
        WHEN check_out_time IS NOT NULL AND check_in_time IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
        ELSE NULL 
    END
) STORED COMMENT 'Duración calculada',
ADD COLUMN distance_meters DECIMAL(6,2) NULL COMMENT 'Distancia al gimnasio',
ADD COLUMN auto_checkin BOOLEAN DEFAULT FALSE COMMENT 'Fue automático',
ADD UNIQUE KEY unique_user_gym_date (id_user_profile, id_gym, date);

-- Índices
CREATE INDEX idx_assistance_auto ON assistance(auto_checkin, date);
CREATE INDEX idx_assistance_duration ON assistance(duration_minutes);
```

**Backend Service:**

```javascript
// src/services/geolocation.service.js

class GeolocationService {
  // Validar proximidad a gimnasio
  async checkProximity(userId, latitude, longitude) {
    const gyms = await Gym.findAll({
      attributes: ['id_gym', 'latitude', 'longitude', 'name']
    });
    
    const nearby = gyms.filter(gym => {
      const distance = this.calculateDistance(
        latitude, longitude,
        gym.latitude, gym.longitude
      );
      return distance <= 150; // 150 metros
    });
    
    return nearby;
  }
  
  // Auto check-in
  async autoCheckIn(userId, gymId, latitude, longitude) {
    const geofence = await GymGeofence.findOne({ where: { id_gym: gymId } });
    
    if (!geofence || !geofence.auto_checkin_enabled) {
      return null;
    }
    
    const distance = this.calculateDistance(
      latitude, longitude,
      geofence.gym.latitude, geofence.gym.longitude
    );
    
    if (distance > geofence.radius_meters) {
      throw new Error('Fuera de rango para auto check-in');
    }
    
    // Crear check-in
    return await Assistance.create({
      id_user_profile: userId,
      id_gym: gymId,
      date: new Date(),
      check_in_time: new Date().toTimeString().slice(0, 8),
      auto_checkin: true,
      distance_meters: distance
    });
  }
  
  // Check-out
  async checkOut(assistanceId) {
    const assistance = await Assistance.findByPk(assistanceId);
    
    if (!assistance || assistance.check_out_time) {
      throw new Error('Check-out inválido');
    }
    
    await assistance.update({
      check_out_time: new Date().toTimeString().slice(0, 8)
    });
    
    // Calcular tokens por duración
    const durationMinutes = assistance.duration_minutes;
    let tokens = 5; // Base
    
    if (durationMinutes >= 60) tokens = 15;
    else if (durationMinutes >= 45) tokens = 12;
    else if (durationMinutes >= 30) tokens = 10;
    
    // Registrar tokens
    await TokenLedger.create({
      id_user_profile: assistance.id_user_profile,
      delta: tokens,
      reason: 'ASSISTANCE_COMPLETED',
      ref_type: 'assistance',
      ref_id: assistanceId,
      balance_after: (await UserProfile.findByPk(assistance.id_user_profile)).tokens + tokens
    });
    
    return assistance;
  }
  
  // Utilidad: Calcular distancia (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Retorna en metros
  }
}

module.exports = new GeolocationService();
```

**Endpoints API:**

```http
POST   /api/location/update
Body: { latitude, longitude, accuracy }
Response: { nearby_gyms: [...] }

POST   /api/assistance/auto-checkin
Body: { id_gym, latitude, longitude }
Response: { id_assistance, distance, status }

PUT    /api/assistance/:id/checkout
Response: { duration_minutes, tokens_earned }

GET    /api/gyms/nearby?lat=X&lng=Y&radius=5000
Response: { gyms: [...with distance...] }
```

---

### 1.2 Desafíos Diarios Simples

**Por qué es importante:**
- Gamificación básica
- Usuario tiene algo "diario" que hacer
- Aumenta engagement

**SQL Minimal:**

```sql
-- Desafíos diarios (uno por día para todos)
CREATE TABLE daily_challenge (
    id_challenge INT PRIMARY KEY AUTO_INCREMENT,
    challenge_date DATE NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    challenge_type ENUM('MINUTES', 'EXERCISES', 'FREQUENCY') NOT NULL,
    target_value INT NOT NULL,
    target_unit VARCHAR(20),
    tokens_reward INT DEFAULT 10,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active_date (challenge_date, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progreso de usuario
CREATE TABLE user_daily_challenge (
    id_user_profile INT NOT NULL,
    id_challenge INT NOT NULL,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME NULL,
    tokens_earned INT DEFAULT 0,
    PRIMARY KEY (id_user_profile, id_challenge),
    FOREIGN KEY (id_user_profile) REFERENCES user_profiles(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_challenge) REFERENCES daily_challenge(id_challenge) ON DELETE CASCADE,
    INDEX idx_completed (id_user_profile, completed, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend Service:**

```javascript
// src/services/challenge.service.js

class ChallengeService {
  // Obtener desafío de hoy
  async getTodayChallenge(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const challenge = await DailyChallenge.findOne({
      where: { 
        challenge_date: today,
        is_active: true
      }
    });
    
    if (!challenge) return null;
    
    const userProgress = await UserDailyChallenge.findOne({
      where: {
        id_user_profile: userId,
        id_challenge: challenge.id_challenge
      }
    });
    
    return {
      ...challenge.dataValues,
      progress: userProgress?.progress || 0,
      completed: userProgress?.completed || false
    };
  }
  
  // Actualizar progreso
  async updateProgress(userId, challengeId, value) {
    let [userChallenge, created] = await UserDailyChallenge.findOrCreate({
      where: { id_user_profile: userId, id_challenge: challengeId },
      defaults: { progress: 0 }
    });
    
    const challenge = await DailyChallenge.findByPk(challengeId);
    
    userChallenge.progress = Math.min(value, challenge.target_value);
    
    // Detectar completación
    if (userChallenge.progress >= challenge.target_value && !userChallenge.completed) {
      userChallenge.completed = true;
      userChallenge.completed_at = new Date();
      userChallenge.tokens_earned = challenge.tokens_reward;
      
      // Otorgar tokens
      const user = await UserProfile.findByPk(userId);
      await TokenLedger.create({
        id_user_profile: userId,
        delta: challenge.tokens_reward,
        reason: 'DAILY_CHALLENGE_COMPLETED',
        ref_type: 'daily_challenge',
        ref_id: challengeId,
        balance_after: user.tokens + challenge.tokens_reward
      });
      
      // Notificar
      await Notification.create({
        id_user_profile: userId,
        type: 'ACHIEVEMENT',
        title: 'Desafío completado',
        message: `+${challenge.tokens_reward} tokens`
      });
    }
    
    await userChallenge.save();
    return userChallenge;
  }
  
  // Crear desafío del día (cron job)
  async generateDailyChallenge() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar si ya existe
    const existing = await DailyChallenge.findOne({
      where: { challenge_date: today }
    });
    
    if (existing) return existing;
    
    // Desafíos rotando
    const challenges = [
      {
        title: 'Sesión de 60 minutos',
        description: 'Completa una sesión de entrenamiento de 60 minutos',
        challenge_type: 'MINUTES',
        target_value: 60,
        target_unit: 'minutos',
        tokens_reward: 15
      },
      {
        title: 'Entrena 45 minutos',
        description: 'Dedica 45 minutos al entrenamiento',
        challenge_type: 'MINUTES',
        target_value: 45,
        target_unit: 'minutos',
        tokens_reward: 12
      },
      {
        title: 'Ve al gimnasio',
        description: 'Haz al menos una asistencia hoy',
        challenge_type: 'FREQUENCY',
        target_value: 1,
        target_unit: 'asistencias',
        tokens_reward: 10
      }
    ];
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return await DailyChallenge.create({
      challenge_date: today,
      ...randomChallenge,
      is_active: true
    });
  }
}

module.exports = new ChallengeService();
```

**Cron Job:**

```javascript
// src/jobs/daily-challenge.job.js
const cron = require('node-cron');
const ChallengeService = require('../services/challenge.service');

// Crear desafío del día a las 00:01
cron.schedule('1 0 * * *', async () => {
  try {
    await ChallengeService.generateDailyChallenge();
    console.log('✅ Desafío diario creado');
  } catch (error) {
    console.error('❌ Error creando desafío:', error);
  }
});
```

**Endpoints:**

```http
GET    /api/challenges/today
Response: { title, description, target_value, progress, completed }

PUT    /api/challenges/:id/progress
Body: { value }
Response: { progress, completed, tokens_earned }
```

---

### 1.3 Rutinas Plantilla/Recomendadas

**Por qué es importante:**
- Onboarding: usuario elige rutina sugerida
- No empieza de cero
- Datos para empezar entrenamientos

**SQL Minimal:**

```sql
-- Marcar rutinas como plantillas recomendadas
ALTER TABLE routine
ADD COLUMN is_template BOOLEAN DEFAULT FALSE AFTER description,
ADD COLUMN recommended_for ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NULL,
ADD COLUMN template_order INT DEFAULT 0;

-- Crear tabla de importaciones
CREATE TABLE user_imported_routine (
    id_import INT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    id_routine_original INT NOT NULL COMMENT 'Rutina plantilla',
    id_routine_copy INT NOT NULL COMMENT 'Copia del usuario',
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profiles(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_routine_original) REFERENCES routine(id_routine_original) ON DELETE CASCADE,
    FOREIGN KEY (id_routine_copy) REFERENCES routine(id_routine) ON DELETE CASCADE,
    INDEX idx_user_imports (id_user_profile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend Service:**

```javascript
// src/services/template.service.js

class TemplateService {
  // Obtener rutinas recomendadas
  async getRecommendedRoutines(difficulty = 'BEGINNER', limit = 5) {
    return await Routine.findAll({
      where: {
        is_template: true,
        recommended_for: difficulty
      },
      order: [['template_order', 'ASC']],
      limit
    });
  }
  
  // Importar rutina plantilla a usuario
  async importTemplate(userId, templateRoutineId) {
    const template = await Routine.findByPk(templateRoutineId, {
      include: [{ model: RoutineExercise, include: [Exercise] }]
    });
    
    if (!template || !template.is_template) {
      throw new Error('Rutina no es una plantilla');
    }
    
    // Crear copia
    const copy = await Routine.create({
      routine_name: template.routine_name,
      description: template.description,
      difficulty: template.difficulty,
      created_by: userId,
      is_template: false,
      category: template.category,
      target_goal: template.target_goal,
      equipment_level: template.equipment_level
    });
    
    // Copiar ejercicios
    const exercises = await RoutineExercise.findAll({
      where: { id_routine: templateRoutineId }
    });
    
    for (const exercise of exercises) {
      await RoutineExercise.create({
        id_routine: copy.id_routine,
        id_exercise: exercise.id_exercise,
        series: exercise.series,
        reps: exercise.reps,
        order: exercise.order,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes
      });
    }
    
    // Registrar importación
    await UserImportedRoutine.create({
      id_user_profile: userId,
      id_routine_original: templateRoutineId,
      id_routine_copy: copy.id_routine
    });
    
    return copy;
  }
}

module.exports = new TemplateService();
```

**Endpoints:**

```http
GET    /api/routines/templates?difficulty=BEGINNER
Response: { routines: [...] }

POST   /api/routines/:id/import
Response: { id_routine_copy, name, exercises: [...] }
```

---

### 1.4 Campos Faltantes en Tablas Existentes

```sql
-- FREQUENCY: Control semanal
ALTER TABLE frequency
ADD COLUMN week_start_date DATE NULL AFTER id_user,
ADD COLUMN week_number TINYINT GENERATED ALWAYS AS (WEEK(week_start_date, 1)) STORED,
ADD COLUMN year YEAR GENERATED ALWAYS AS (YEAR(week_start_date)) STORED;

ALTER TABLE frequency
ADD UNIQUE KEY unique_user_week (id_user, year, week_number);

-- ROUTINE: Categorización
ALTER TABLE routine
ADD COLUMN category ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'FUNCTIONAL', 'MIXED') NULL,
ADD COLUMN target_goal ENUM('MUSCLE_GAIN', 'WEIGHT_LOSS', 'ENDURANCE', 'DEFINITION', 'GENERAL_FITNESS') NULL,
ADD COLUMN equipment_level ENUM('NO_EQUIPMENT', 'BASIC', 'FULL_GYM') NULL;

-- USER_PROFILE: Onboarding
ALTER TABLE user_profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN app_tier ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE';

-- TOKEN_LEDGER: Metadata
ALTER TABLE token_ledger
ADD COLUMN metadata JSON NULL;
```

---

## FASE 2: Polish y Testing (1 semana)

### 2.1 Validaciones

```javascript
// Validar:
- Distancia GPS debe estar dentro de rango
- Check-out solo si hay check-in
- Desafío de hoy debe existir
- Usuario puede importar máximo 10 rutinas (MVP)
```

### 2.2 Error Handling

```javascript
// Manejar:
- GPS inaccurate (accuracy > 100m)
- Gimnasio sin geofence configurado
- Rutina plantilla eliminada antes de copiar
- Concurrencia (dos check-in simultáneos)
```

### 2.3 Tests

```javascript
// Unit tests:
- calculateDistance()
- autoCheckIn() scenarios
- importTemplate()

// Integration tests:
- Flujo completo check-in → check-out → tokens
- Importar rutina → mostrar en usuario
- Completar desafío diario
```

---

## FASE 3: Deploy y Monitoreo (1 semana)

### 3.1 Staging

```bash
- Ejecutar migraciones
- Seed data: 3 desafíos, 5 rutinas plantilla
- Tests manuales del wireframe
```

### 3.2 Producción

```bash
- Backup pre-deploy
- Deploy por fases (10% → 50% → 100%)
- Monitorear: queries lentas, errores, latencia
```

---

## Datos Iniciales Necesarios

### Rutinas Plantilla

```sql
INSERT INTO routine (routine_name, description, difficulty, is_template, recommended_for, category, target_goal, equipment_level, created_by) VALUES
('Push Pull Legs', 'Clásica 3 días', 'INTERMEDIATE', TRUE, 'INTERMEDIATE', 'STRENGTH', 'MUSCLE_GAIN', 'FULL_GYM', 1),
('Full Body Beginner', 'Cuerpo completo', 'BEGINNER', TRUE, 'BEGINNER', 'STRENGTH', 'GENERAL_FITNESS', 'FULL_GYM', 1),
('HIIT 30min', 'Cardio intenso', 'INTERMEDIATE', TRUE, 'INTERMEDIATE', 'HIIT', 'WEIGHT_LOSS', 'NO_EQUIPMENT', 1),
('Flexibilidad', 'Estiramientos', 'BEGINNER', TRUE, 'BEGINNER', 'FLEXIBILITY', 'GENERAL_FITNESS', 'NO_EQUIPMENT', 1),
('Upper Lower', 'Avanzado split', 'ADVANCED', TRUE, 'ADVANCED', 'STRENGTH', 'MUSCLE_GAIN', 'FULL_GYM', 1);
```

### Geofences

```sql
INSERT INTO gym_geofence (id_gym, radius_meters, auto_checkin_enabled, min_stay_minutes) 
SELECT id_gym, 150, TRUE, 30 FROM gym;
```

---

## Timeline

| Semana | Qué | Entregable |
|--------|-----|-----------|
| Semana 1 | Geofence + auto check-in | Endpoints funcionando |
| Semana 1-2 | Desafíos diarios | Backend + cron |
| Semana 2 | Rutinas plantilla | Importación funciona |
| Semana 2 | Campos faltantes | SQL migration |
| Semana 2-3 | Testing | Unit + integration tests |
| Semana 3 | Staging | Deploy pre-prod |
| Semana 3-4 | Monitoreo | Prod ready |

**Total: 4 semanas**

---

## Qué NO Hacer Ahora

- ❌ Analytics predictivo (+ 6 meses de data)
- ❌ Índices complejos (optimiza cuando sea lento)
- ❌ QR codes (los pide el gimnasio después)
- ❌ Personal records complejos (después)
- ❌ Machine learning (año 2)
- ❌ Insights avanzados (cuando haya datos)

---

## Métricas de Éxito MVP

| Métrica | Meta |
|---------|------|
| Auto check-in accuracy | > 95% |
| Desafío completado por día | > 40% usuarios |
| Rutina importada en onboarding | > 60% usuarios nuevos |
| Query latency | < 200ms |
| Uptime | > 99.5% |

---