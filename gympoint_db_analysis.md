# Base de Datos GymPoint - Separación BD vs Backend

## 🎯 FILOSOFÍA DE DISEÑO

### Base de Datos: Solo Estructura y Constraints
- ✅ Tablas, columnas, tipos de datos
- ✅ Primary Keys, Foreign Keys, Unique Constraints
- ✅ Índices para performance
- ✅ Campos calculados simples (GENERATED columns)
- ❌ NO triggers complejos
- ❌ NO procedimientos almacenados de lógica de negocio
- ❌ NO cálculos complejos en BD

### Backend (Node.js): Toda la Lógica de Negocio
- ✅ Validaciones de negocio
- ✅ Cálculo de tokens
- ✅ Actualización de stats
- ✅ Envío de notificaciones
- ✅ Integración con MercadoPago
- ✅ Procesamiento de imágenes
- ✅ Manejo de transacciones

---

## 📋 ESTRUCTURA DE BASE DE DATOS LIMPIA

### 1. MEDIA - Sistema de Archivos

```sql
CREATE TABLE media (
    id_media INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS') NOT NULL,
    entity_id INT NOT NULL,
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    file_size INT NULL COMMENT 'Bytes',
    mime_type VARCHAR(100) NULL,
    width INT NULL,
    height INT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_primary (entity_type, entity_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Upload a S3/Cloudinary
- Generar thumbnails
- Validar tamaños y formatos
- Limpiar archivos huérfanos

---

### 2. GYM_REVIEW - Sistema de Valoraciones

```sql
CREATE TABLE gym_review (
    id_review INT PRIMARY KEY AUTO_INCREMENT,
    id_gym INT NOT NULL,
    id_user_profile INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    title VARCHAR(100) NULL,
    comment TEXT NULL,
    cleanliness_rating TINYINT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
    equipment_rating TINYINT NULL CHECK (equipment_rating BETWEEN 1 AND 5),
    staff_rating TINYINT NULL CHECK (staff_rating BETWEEN 1 AND 5),
    value_rating TINYINT NULL CHECK (value_rating BETWEEN 1 AND 5),
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    reported BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    UNIQUE KEY unique_user_gym_review (id_user_profile, id_gym),
    INDEX idx_gym_rating (id_gym, rating DESC),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gym_rating_stats (
    id_gym INT PRIMARY KEY,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    rating_5_count INT DEFAULT 0,
    rating_4_count INT DEFAULT 0,
    rating_3_count INT DEFAULT 0,
    rating_2_count INT DEFAULT 0,
    rating_1_count INT DEFAULT 0,
    avg_cleanliness DECIMAL(3,2) DEFAULT 0,
    avg_equipment DECIMAL(3,2) DEFAULT 0,
    avg_staff DECIMAL(3,2) DEFAULT 0,
    avg_value DECIMAL(3,2) DEFAULT 0,
    last_review_date DATETIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    INDEX idx_rating (avg_rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE review_helpful (
    id_review INT NOT NULL,
    id_user_profile INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_review, id_user_profile),
    FOREIGN KEY (id_review) REFERENCES gym_review(id_review) ON DELETE CASCADE,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Validar que usuario asistió antes de dejar review
- Recalcular estadísticas al crear/actualizar/eliminar review
- Moderar reviews reportadas
- Notificar al gimnasio de nuevas reviews

---

### 3. USER_FAVORITE_GYM - Favoritos

```sql
CREATE TABLE user_favorite_gym (
    id_user_profile INT NOT NULL,
    id_gym INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_user_profile, id_gym),
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    INDEX idx_user_favorites (id_user_profile, created_at),
    INDEX idx_gym_favorites (id_gym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Toggle favorito (agregar/quitar)
- Límite de favoritos por usuario (opcional)

---

### 4. GYM_AMENITY - Servicios del Gimnasio

```sql
CREATE TABLE gym_amenity (
    id_amenity INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NULL,
    category ENUM('FACILITY', 'SERVICE', 'EQUIPMENT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gym_gym_amenity (
    id_gym INT NOT NULL,
    id_amenity INT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    notes VARCHAR(255) NULL,
    PRIMARY KEY (id_gym, id_amenity),
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    FOREIGN KEY (id_amenity) REFERENCES gym_amenity(id_amenity) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- CRUD de amenities
- Asignar amenities a gimnasios
- Seed data inicial

---

### 5. MERCADOPAGO_PAYMENT - Integración de Pagos

```sql
CREATE TABLE mercadopago_payment (
    id_mp_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    id_gym INT NOT NULL,
    
    -- IDs de MercadoPago
    preference_id VARCHAR(100) NULL,
    payment_id VARCHAR(100) NULL,
    merchant_order_id VARCHAR(100) NULL,
    
    -- Detalles
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    description VARCHAR(255) NULL,
    payment_method VARCHAR(50) NULL,
    payment_type VARCHAR(50) NULL,
    
    -- Estado
    status ENUM('PENDING', 'APPROVED', 'AUTHORIZED', 'IN_PROCESS', 
                'IN_MEDIATION', 'REJECTED', 'CANCELLED', 'REFUNDED', 
                'CHARGED_BACK') NOT NULL DEFAULT 'PENDING',
    status_detail VARCHAR(100) NULL,
    
    -- Fechas
    payment_date DATETIME NULL,
    approved_at DATETIME NULL,
    
    -- Metadata
    external_reference VARCHAR(100) NULL,
    
    -- Información del comprador
    payer_email VARCHAR(100) NULL,
    
    -- Webhook
    webhook_received_at DATETIME NULL,
    raw_response JSON NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile),
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym),
    
    INDEX idx_payment_id (payment_id),
    INDEX idx_preference_id (preference_id),
    INDEX idx_status (status),
    INDEX idx_user_gym (id_user_profile, id_gym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Crear preferencia de pago en MercadoPago
- Procesar webhooks de MercadoPago
- Actualizar estado de pagos
- Activar membresía al aprobar pago
- Manejar reembolsos

---

### 6. USER_BODY_METRICS - Métricas Corporales con IMC

```sql
CREATE TABLE user_body_metrics (
    id_metric INT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    recorded_date DATE NOT NULL,
    recorded_time TIME DEFAULT (CURTIME()),
    
    -- Métricas básicas
    weight DECIMAL(5,2) NULL COMMENT 'kg',
    height DECIMAL(5,2) NULL COMMENT 'cm',
    body_fat_percentage DECIMAL(4,2) NULL,
    muscle_mass DECIMAL(5,2) NULL COMMENT 'kg',
    
    -- IMC calculado automáticamente
    bmi DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN height > 0 THEN weight / POWER(height / 100, 2)
            ELSE NULL 
        END
    ) STORED,
    
    bmi_category VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN weight / POWER(height / 100, 2) < 18.5 THEN 'UNDERWEIGHT'
            WHEN weight / POWER(height / 100, 2) < 25 THEN 'NORMAL'
            WHEN weight / POWER(height / 100, 2) < 30 THEN 'OVERWEIGHT'
            ELSE 'OBESE'
        END
    ) STORED,
    
    -- Medidas opcionales
    neck_cm DECIMAL(5,2) NULL,
    chest_cm DECIMAL(5,2) NULL,
    waist_cm DECIMAL(5,2) NULL,
    hips_cm DECIMAL(5,2) NULL,
    biceps_cm DECIMAL(5,2) NULL,
    thighs_cm DECIMAL(5,2) NULL,
    calves_cm DECIMAL(5,2) NULL,
    
    notes TEXT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (id_user_profile, recorded_date),
    INDEX idx_user_date (id_user_profile, recorded_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Validar valores razonables
- Calcular tendencias y progreso
- Otorgar tokens por registro consistente
- Generar gráficos de progreso

---

### 7. FREQUENCY - Frecuencia Semanal Mejorada

```sql
-- Tabla actual mejorada
ALTER TABLE frequency 
ADD COLUMN week_start_date DATE NOT NULL AFTER id_user,
ADD COLUMN week_number TINYINT GENERATED ALWAYS AS (WEEK(week_start_date, 1)) STORED,
ADD COLUMN year YEAR GENERATED ALWAYS AS (YEAR(week_start_date)) STORED,
ADD UNIQUE KEY unique_user_week (id_user, year, week_number);

-- Histórico de frecuencias
CREATE TABLE frequency_history (
    id_history INT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    goal TINYINT NOT NULL,
    achieved TINYINT NOT NULL,
    goal_met BOOLEAN NOT NULL,
    tokens_earned INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    INDEX idx_user_date (id_user_profile, week_start_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Resetear contador cada lunes
- Archivar semana anterior en history
- Calcular si cumplió meta
- Otorgar tokens por cumplir frecuencia

---

### 8. WORKOUT_SESSION - Sesiones de Entrenamiento

```sql
CREATE TABLE workout_session (
    id_session BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    id_routine INT NULL,
    id_gym INT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NULL,
    
    duration_minutes INT GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, start_time, end_time)
            ELSE NULL 
        END
    ) STORED,
    
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') DEFAULT 'IN_PROGRESS',
    
    total_exercises INT DEFAULT 0,
    completed_exercises INT DEFAULT 0,
    total_sets INT DEFAULT 0,
    completed_sets INT DEFAULT 0,
    
    notes TEXT NULL,
    rating TINYINT NULL CHECK (rating BETWEEN 1 AND 5),
    tokens_earned INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_routine) REFERENCES routine(id_routine) ON DELETE SET NULL,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE SET NULL,
    
    INDEX idx_user_date (id_user_profile, session_date DESC),
    INDEX idx_status (status),
    INDEX idx_routine (id_routine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE workout_set (
    id_set BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_session BIGINT NOT NULL,
    id_exercise INT NOT NULL,
    set_number TINYINT NOT NULL,
    reps INT NOT NULL,
    weight DECIMAL(6,2) NULL COMMENT 'kg',
    rest_seconds INT NULL,
    difficulty ENUM('EASY', 'MODERATE', 'HARD', 'MAXIMAL') NULL,
    notes VARCHAR(255) NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_session) REFERENCES workout_session(id_session) ON DELETE CASCADE,
    FOREIGN KEY (id_exercise) REFERENCES exercise(id_exercise) ON DELETE CASCADE,
    
    INDEX idx_session (id_session),
    INDEX idx_exercise_date (id_exercise, completed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Crear sesión al empezar entrenamiento
- Registrar sets en tiempo real
- Calcular totales al finalizar
- Otorgar tokens según duración y completitud
- Actualizar récords personales

---

### 9. ROUTINE - Estructura con Días

```sql
-- Mejoras a ROUTINE existente
ALTER TABLE routine
ADD COLUMN category ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'FUNCTIONAL', 'MIXED') NULL AFTER difficulty,
ADD COLUMN target_goal ENUM('MUSCLE_GAIN', 'WEIGHT_LOSS', 'ENDURANCE', 'DEFINITION', 'GENERAL_FITNESS') NULL,
ADD COLUMN equipment_level ENUM('NO_EQUIPMENT', 'BASIC', 'FULL_GYM') NULL,
ADD COLUMN estimated_duration_minutes INT NULL,
ADD COLUMN times_completed INT DEFAULT 0,
ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN id_gym INT NULL,
ADD FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE SET NULL;

-- Tabla para días de rutina
CREATE TABLE routine_day (
    id_routine_day INT PRIMARY KEY AUTO_INCREMENT,
    id_routine INT NOT NULL,
    day_number TINYINT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    day_name VARCHAR(50) NULL,
    description TEXT NULL,
    rest_day BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_routine) REFERENCES routine(id_routine) ON DELETE CASCADE,
    UNIQUE KEY unique_routine_day (id_routine, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modificar ROUTINE_EXERCISE
ALTER TABLE routine_exercise
ADD COLUMN id_routine_day INT NULL AFTER id_routine,
ADD COLUMN id_routine_exercise INT PRIMARY KEY AUTO_INCREMENT FIRST,
ADD FOREIGN KEY (id_routine_day) REFERENCES routine_day(id_routine_day) ON DELETE CASCADE;
```

**Backend responsable de:**
- CRUD de rutinas
- Asignar ejercicios a días
- Calcular duración estimada
- Importar rutinas de gimnasio
- Recomendar rutinas según objetivo

---

### 10. NOTIFICATION - Sistema de Notificaciones

```sql
CREATE TABLE notification (
    id_notification BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    type ENUM('REMINDER', 'ACHIEVEMENT', 'REWARD', 'GYM_UPDATE', 'PAYMENT', 'SOCIAL', 'SYSTEM') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500) NULL,
    icon VARCHAR(50) NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    
    priority ENUM('LOW', 'NORMAL', 'HIGH') DEFAULT 'NORMAL',
    scheduled_for DATETIME NULL,
    sent_at DATETIME NULL,
    expires_at DATETIME NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    
    INDEX idx_user_unread (id_user_profile, is_read, created_at DESC),
    INDEX idx_scheduled (scheduled_for, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_notification_settings (
    id_user_profile INT PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    achievement_enabled BOOLEAN DEFAULT TRUE,
    reward_enabled BOOLEAN DEFAULT TRUE,
    gym_news_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME NULL,
    quiet_hours_end TIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Crear notificaciones
- Enviar push notifications (Firebase/OneSignal)
- Enviar emails (si habilitado)
- Procesar notificaciones programadas (cron job)
- Respetar quiet hours
- Limpiar notificaciones expiradas

---

### 11. ACCOUNT_DELETION_REQUEST - Eliminación de Cuenta

```sql
CREATE TABLE account_deletion_request (
    id_request INT PRIMARY KEY AUTO_INCREMENT,
    id_account INT NOT NULL,
    reason TEXT NULL,
    scheduled_deletion_date DATE NOT NULL,
    status ENUM('PENDING', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE,
    INDEX idx_status_date (status, scheduled_deletion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Backend responsable de:**
- Programar eliminación (ej: +30 días)
- Permitir cancelar solicitud
- Ejecutar eliminación real (cron job)
- Anonimizar datos antes de eliminar
- Enviar email de confirmación

---

### 12. Mejoras a Tablas Existentes

```sql
-- GYM
ALTER TABLE gym
ADD COLUMN whatsapp VARCHAR(20) NULL AFTER phone,
ADD COLUMN instagram VARCHAR(100) NULL AFTER social_media,
ADD COLUMN facebook VARCHAR(100) NULL AFTER instagram,
ADD COLUMN google_maps_url VARCHAR(500) NULL AFTER longitude,
ADD COLUMN max_capacity INT NULL,
ADD COLUMN area_sqm DECIMAL(10,2) NULL,
ADD COLUMN verified BOOLEAN DEFAULT FALSE,
ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- USER_GYM
ALTER TABLE user_gym
ADD COLUMN id_payment BIGINT NULL,
ADD COLUMN subscription_type ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL') NOT NULL,
ADD COLUMN auto_renew BOOLEAN DEFAULT FALSE,
ADD FOREIGN KEY (id_payment) REFERENCES mercadopago_payment(id_mp_payment);

-- USER_PROFILE
ALTER TABLE user_profile
CHANGE subscription app_tier ENUM('FREE','PREMIUM') NOT NULL DEFAULT 'FREE',
ADD COLUMN premium_since DATE NULL AFTER app_tier,
ADD COLUMN premium_expires DATE NULL AFTER premium_since,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'es',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires';

-- ASSISTANCE
ALTER TABLE assistance
ADD UNIQUE KEY unique_user_gym_date (id_user, id_gym, date),
ADD COLUMN check_in_time TIME NULL AFTER hour,
ADD COLUMN check_out_time TIME NULL AFTER check_in_time,
ADD COLUMN duration_minutes INT GENERATED ALWAYS AS (
    CASE 
        WHEN check_out_time IS NOT NULL AND check_in_time IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
        ELSE NULL 
    END
) STORED,
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- TOKEN_LEDGER
ALTER TABLE token_ledger
ADD COLUMN metadata JSON NULL,
ADD COLUMN expires_at DATETIME NULL,
ADD INDEX idx_user_balance (id_user_profile, created_at DESC);
```

---

## 🎯 ARQUITECTURA BACKEND (Node.js)

### Estructura de Servicios

```
src/
├── controllers/       # Endpoints HTTP
│   ├── controllers/             # Controladores HTTP
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── gym.controller.js
│   │   ├── routine.controller.js
│   │   ├── workout.controller.js
│   │   ├── assistance.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   ├── notification.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/                # Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── gym.service.js
│   │   ├── routine.service.js
│   │   ├── workout.service.js
│   │   ├── assistance.service.js
│   │   ├── payment.service.js
│   │   ├── review.service.js
│   │   ├── token.service.js       # ⭐ Cálculo de tokens
│   │   ├── frequency.service.js   # ⭐ Frecuencia semanal
│   │   ├── streak.service.js      # ⭐ Rachas
│   │   ├── notification.service.js
│   │   ├── media.service.js
│   │   └── stats.service.js
│   │
│   ├── repositories/            # Acceso a datos
│   │   ├── user.repository.js
│   │   ├── gym.repository.js
│   │   ├── workout.repository.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT validation
│   │   ├── validate.middleware.js  # Request validation
│   │   ├── error.middleware.js     # Error handler
│   │   └── upload.middleware.js    # Multer config
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── gym.routes.js
│   │   ├── routine.routes.js
│   │   ├── workout.routes.js
│   │   ├── payment.routes.js
│   │   ├── webhook.routes.js
│   │   └── admin.routes.js
│   │
│   ├── jobs/                    # Cron Jobs
│   │   ├── index.js
│   │   ├── frequency-reset.job.js
│   │   ├── notifications.job.js
│   │   ├── account-deletion.job.js
│   │   └── stats-calculation.job.js
│   │
│   ├── integrations/           # APIs externas
│   │   ├── mercadopago.js
│   │   ├── cloudinary.js
│   │   ├── s3.js
│   │   ├── firebase.js
│   │   └── email.js
│   │
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── logger.js
│   │
│   └── app.js                  # Express app
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 EJEMPLO DE ENDPOINTS API

### Auth Routes
```javascript
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Login
POST   /api/auth/google            # Login con Google
POST   /api/auth/refresh-token     # Refresh JWT
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Recuperar contraseña
```

### User Routes
```javascript
GET    /api/users/me                    # Perfil actual
PUT    /api/users/me                    # Actualizar perfil
POST   /api/users/me/avatar             # Subir foto de perfil
GET    /api/users/me/dashboard          # Dashboard completo
POST   /api/users/me/body-metrics       # Registrar métricas
GET    /api/users/me/body-metrics       # Historial de métricas
GET    /api/users/me/frequency          # Frecuencia actual
PUT    /api/users/me/frequency/goal     # Actualizar meta
GET    /api/users/me/notifications      # Notificaciones
PUT    /api/users/me/notifications/:id  # Marcar como leída
DELETE /api/users/me                    # Solicitar eliminación
```

### Gym Routes
```javascript
GET    /api/gyms                   # Listar gimnasios
GET    /api/gyms/search            # Buscar por ubicación/nombre
GET    /api/gyms/:id               # Detalle de gimnasio
GET    /api/gyms/:id/reviews       # Reviews del gym
POST   /api/gyms/:id/reviews       # Crear review
PUT    /api/gyms/:id/reviews/:reviewId  # Editar review
POST   /api/gyms/:id/favorite      # Agregar a favoritos
DELETE /api/gyms/:id/favorite      # Quitar de favoritos
GET    /api/gyms/:id/schedules     # Horarios
GET    /api/gyms/:id/amenities     # Servicios
```

### Workout Routes
```javascript
POST   /api/workouts/start              # Iniciar sesión
POST   /api/workouts/:id/sets           # Registrar set
PUT    /api/workouts/:id/complete       # Finalizar sesión
GET    /api/workouts/:id                # Detalle de sesión
GET    /api/workouts/history            # Historial
GET    /api/workouts/progress/:exerciseId  # Progreso por ejercicio
```

### Assistance Routes
```javascript
POST   /api/assistance/check-in     # Registrar entrada
PUT    /api/assistance/:id/check-out # Registrar salida
GET    /api/assistance/history       # Historial de asistencias
GET    /api/assistance/stats         # Estadísticas
```

### Routine Routes
```javascript
GET    /api/routines                    # Listar rutinas
GET    /api/routines/recommended        # Rutinas recomendadas
GET    /api/routines/gym/:gymId         # Rutinas del gimnasio
POST   /api/routines                    # Crear rutina
GET    /api/routines/:id                # Detalle de rutina
PUT    /api/routines/:id                # Editar rutina
DELETE /api/routines/:id                # Eliminar rutina
POST   /api/routines/:id/assign         # Asignar a usuario
```

### Payment Routes
```javascript
POST   /api/payments/create-preference  # Crear pago MP
GET    /api/payments/:id                # Estado de pago
GET    /api/payments/history            # Historial
POST   /webhooks/mercadopago            # Webhook MP
```

### Rewards Routes
```javascript
GET    /api/rewards                # Listar recompensas
POST   /api/rewards/:id/claim      # Canjear recompensa
GET    /api/rewards/claimed        # Mis recompensas
```

### Admin Routes
```javascript
GET    /api/admin/stats                 # Estadísticas generales
GET    /api/admin/users                 # Lista de usuarios
GET    /api/admin/gyms                  # Gestión de gyms
GET    /api/admin/transactions          # Transacciones
GET    /api/admin/rewards               # Gestión de rewards
```

---

## 📝 EJEMPLO DE PACKAGE.JSON

```json
{
  "name": "gympoint-backend",
  "version": "2.0.0",
  "description": "Backend API for GymPoint",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "mysql2": "^3.6.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "aws-sdk": "^2.1491.0",
    "mercadopago": "^1.5.17",
    "firebase-admin": "^12.0.0",
    "nodemailer": "^6.9.7",
    "node-cron": "^3.0.3",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "sequelize-cli": "^6.6.2"
  }
}
```

---

## 🔐 EJEMPLO DE .ENV

```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gympoint
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key

# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (alternativa a Cloudinary)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=gympoint-media

# Firebase (push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📊 RESUMEN FINAL

### ✅ BASE DE DATOS
- **16 tablas nuevas** creadas
- **8 tablas existentes** mejoradas
- **2 tablas obsoletas** (PROGRESS, PROGRESS_EXERCISE) → migrar a nuevas
- **Todas las columnas calculadas** (IMC, duración) en BD
- **Sin triggers ni stored procedures** complejos
- **Constraints y FK** bien definidos

### ✅ BACKEND (Node.js)
- **Toda la lógica de negocio** en servicios
- **Cálculo de tokens** en `token.service.js`
- **Frecuencia semanal** en `frequency.service.js`
- **Integración MercadoPago** en `payment.service.js`
- **Sistema de notificaciones** completo
- **Cron jobs** para automatizaciones
- **APIs REST** bien estructuradas

### ✅ SEPARACIÓN DE RESPONSABILIDADES
| Responsabilidad | Dónde |
|----------------|-------|
| Estructura de datos | Base de Datos |
| Constraints e integridad | Base de Datos |
| Campos calculados simples | Base de Datos (GENERATED) |
| Validaciones de negocio | Backend |
| Cálculo de tokens | Backend |
| Integración con APIs | Backend |
| Notificaciones | Backend |
| Transacciones complejas | Backend |
| Estadísticas | Backend (con vistas DB) |

---

## 🎯 PRÓXIMOS PASOS

### 1. **Ejecutar Script SQL**
```bash
mysql -u root -p gympoint < migration.sql
```

### 2. **Configurar Backend**
```bash
cd gympoint-backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 3. **Implementar Servicios** (en orden)
1. ✅ `auth.service.js` - Login/registro
2. ✅ `user.service.js` - Gestión de usuarios
3. ✅ `gym.service.js` - CRUD gimnasios
4. ✅ `review.service.js` - Sistema de reviews
5. ✅ `assistance.service.js` - Check-in/out con tokens
6. ✅ `frequency.service.js` - Control semanal
7. ✅ `streak.service.js` - Manejo de rachas
8. ✅ `workout.service.js` - Sesiones de entrenamiento
9. ✅ `payment.service.js` - Integración MercadoPago
10. ✅ `notification.service.js` - Push notifications

### 4. **Configurar Cron Jobs**
```javascript
// src/jobs/index.js
require('./frequency-reset.job');      // Lunes 00:01
require('./notifications.job');        // Cada 15 min
require('./account-deletion.job');     // Diario 02:00
```

### 5. **Testing**
```bash
npm test
```

---

## 🎉 BENEFICIOS DE ESTA ARQUITECTURA

### 🔄 Mantenibilidad
- Lógica de negocio centralizada en backend
- Fácil de testear (unit tests)
- Cambios sin tocar BD

### 📈 Escalabilidad
- Backend puede escalar horizontalmente
- BD optimizada con índices
- Cron jobs separados del API

### 🔒 Seguridad
- Validaciones en backend
- Tokens manejados en servidor
- Transacciones atómicas

### 🚀 Performance
- Queries optimizados
- Vistas materializadas (stats)
- Campos calculados en BD (IMC)

### 🧪 Testeable
- Services aislados
- Mock de dependencias fácil
- Integration tests simples

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (1 día)
- [ ] Ejecutar script de migración
- [ ] Verificar constraints
- [ ] Seed data de amenities
- [ ] Backup de BD actual

### Fase 2: Backend Core (1 semana)
- [ ] Setup proyecto Node.js
- [ ] Configurar Sequelize models
- [ ] Auth service (JWT)
- [ ] User service
- [ ] Gym service
- [ ] Media service (upload)

### Fase 3: Features Principales (1 semana)
- [ ] Assistance service (check-in/out)
- [ ] Token service (cálculo)
- [ ] Frequency service (semanal)
- [ ] Streak service
- [ ] Review service
- [ ] Payment service (MercadoPago)

### Fase 4: Workout & Routines (4 días)
- [ ] Workout session service
- [ ] Progress tracking
- [ ] Routine CRUD
- [ ] Body metrics

### Fase 5: Notificaciones (2 días)
- [ ] Notification service
- [ ] Firebase setup
- [ ] Email service
- [ ] Scheduled notifications

### Fase 6: Cron Jobs (1 día)
- [ ] Frequency reset
- [ ] Account deletion
- [ ] Stats calculation
- [ ] Notification scheduler

### Fase 7: Admin Dashboard (3 días)
- [ ] Stats service
- [ ] Admin endpoints
- [ ] Transaction reports
- [ ] User management

### Fase 8: Testing & Deploy (1 semana)
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Deploy a producción

---

**Total estimado: 4-5 semanas** de desarrollo backend completo.

¿Quieres que genere ahora algún servicio específico en código completo o prefieres empezar con el setup inicial del proyecto?── auth.controller.js
│   ├── gym.controller.js
│   ├── routine.controller.js
│   ├── workout.controller.js
│   ├── payment.controller.js
│   └── user.controller.js
│
├── services/         # Lógica de negocio
│   ├── auth.service.js
│   ├── gym.service.js
│   ├── routine.service.js
│   ├── workout.service.js
│   ├── payment.service.js
│   ├── token.service.js        # ← Cálculo de tokens
│   ├── frequency.service.js    # ← Manejo de frecuencia
│   ├── streak.service.js       # ← Manejo de streaks
│   ├── notification.service.js
│   └── media.service.js
│
├── repositories/     # Acceso a BD (queries)
│   ├── gym.repository.js
│   ├── user.repository.js
│   ├── workout.repository.js
│   └── ...
│
├── integrations/    # APIs externas
│   ├── mercadopago.js
│   ├── cloudinary.js
│   ├── firebase.js
│   └── email.js
│
├── jobs/           # Cron jobs
│   ├── weekly-frequency-reset.job.js
│   ├── scheduled-notifications.job.js
│   ├── account-deletion.job.js
│   └── stats-calculation.job.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
│
├── models/         # Sequelize/TypeORM models
│   ├── User.model.js
│   ├── Gym.model.js
│   └── ...
│
└── utils/
    ├── token-calculator.js
    └── validators.js
```

---

## 📝 EJEMPLOS DE LÓGICA EN BACKEND

### 1. Servicio de Tokens (token.service.js)

```javascript
class TokenService {
  // Calcular tokens por asistencia
  async calculateAttendanceTokens(userId, gymId) {
    const streakService = new StreakService();
    const streak = await streakService.getCurrentStreak(userId);
    
    let tokens = 5; // Base
    
    // Bonus por streak
    if (streak % 7 === 0) tokens += 10;  // Semanal
    if (streak % 30 === 0) tokens += 50; // Mensual
    
    return tokens;
  }
  
  // Calcular tokens por completar workout
  async calculateWorkoutTokens(sessionData) {
    const { duration_minutes, completed_exercises, total_exercises } = sessionData;
    
    let tokens = 0;
    
    // Por duración
    if (duration_minutes >= 60) tokens = 15;
    else if (duration_minutes >= 45) tokens = 12;
    else if (duration_minutes >= 30) tokens = 10;
    else tokens = 5;
    
    // Bonus por completar todo
    if (completed_exercises === total_exercises) {
      tokens += 5;
    }
    
    return tokens;
  }
  
  // Registrar tokens
  async awardTokens(userId, amount, reason, refType, refId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const user = await UserProfile.findByPk(userId, { transaction });
      const newBalance = user.tokens + amount;
      
      // Crear registro en ledger
      await TokenLedger.create({
        id_user_profile: userId,
        delta: amount,
        reason,
        ref_type: refType,
        ref_id: refId,
        balance_after: newBalance
      }, { transaction });
      
      // Actualizar balance de usuario
      await user.update({ tokens: newBalance }, { transaction });
      
      await transaction.commit();
      return newBalance;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

### 2. Servicio de Asistencia (assistance.service.js)

```javascript
class AssistanceService {
  async checkIn(userId, gymId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // 1. Validar que no tenga check-in hoy
      const existingToday = await Assistance.findOne({
        where: {
          id_user: userId,
          id_gym: gymId,
          date: new Date()
        }
      });
      
      if (existingToday) {
        throw new Error('Ya registraste asistencia hoy en este gimnasio');
      }
      
      // 2. Obtener o crear streak
      const streakService = new StreakService();
      const streak = await streakService.updateStreak(userId, transaction);
      
      // 3. Registrar asistencia
      const assistance = await Assistance.create({
        id_user: userId,
        id_gym: gymId,
        date: new Date(),
        hour: new Date(),
        check_in_time: new Date().toTimeString().slice(0, 8),
        id_streak: streak.id_streak
      }, { transaction });
      
      // 4. Actualizar frecuencia semanal
      const frequencyService = new FrequencyService();
      await frequencyService.incrementWeeklyCount(userId, transaction);
      
      // 5. Calcular y otorgar tokens
      const tokenService = new TokenService();
      const tokens = await tokenService.calculateAttendanceTokens(userId, gymId);
      await tokenService.awardTokens(
        userId, 
        tokens, 
        `ATTENDANCE_STREAK_${streak.value}`,
        'assistance',
        assistance.id_assistance,
        transaction
      );
      
      // 6. Crear notificación
      await NotificationService.create({
        id_user_profile: userId,
        type: 'ACHIEVEMENT',
        title: '¡Check-in registrado!',
        message: `Ganaste ${tokens} tokens. Racha actual: ${streak.value} días`,
        icon: 'fire'
      }, { transaction });
      
      await transaction.commit();
      
      return {
        assistance,
        tokens_earned: tokens,
        streak: streak.value
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async checkOut(assistanceId) {
    const assistance = await Assistance.findByPk(assistanceId);
    
    if (!assistance) {
      throw new Error('Asistencia no encontrada');
    }
    
    if (assistance.check_out_time) {
      throw new Error('Ya registraste salida');
    }
    
    await assistance.update({
      check_out_time: new Date().toTimeString().slice(0, 8)
    });
    
    return assistance;
  }
}
```

### 3. Servicio de Frecuencia (frequency.service.js)

```javascript
class FrequencyService {
  // Obtener inicio de semana (lunes)
  getWeekStart(date = new Date()) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }
  
  // Incrementar contador semanal
  async incrementWeeklyCount(userId, transaction) {
    const weekStart = this.getWeekStart();
    const year = weekStart.getFullYear();
    const weekNumber = this.getWeekNumber(weekStart);
    
    // Buscar o crear frecuencia de esta semana
    const [frequency, created] = await Frequency.findOrCreate({
      where: {
        id_user: userId,
        year,
        week_number: weekNumber
      },
      defaults: {
        week_start_date: weekStart,
        goal: 3, // Default
        assist: 1,
        achieved_goal: false
      },
      transaction
    });
    
    if (!created) {
      // Incrementar asistencias
      await frequency.increment('assist', { transaction });
      await frequency.reload({ transaction });
      
      // Verificar si cumplió meta
      if (frequency.assist >= frequency.goal && !frequency.achieved_goal) {
        await frequency.update({ achieved_goal: true }, { transaction });
        
        // Otorgar tokens por cumplir frecuencia
        const tokenService = new TokenService();
        await tokenService.awardTokens(
          userId,
          20, // Bonus por cumplir frecuencia
          'WEEKLY_FREQUENCY_ACHIEVED',
          'frequency',
          frequency.id_frequency,
          transaction
        );
        
        // Notificar
        await NotificationService.create({
          id_user_profile: userId,
          type: 'ACHIEVEMENT',
          title: '¡Meta semanal cumplida!',
          message: `Completaste ${frequency.goal} entrenamientos esta semana. +20 tokens`,
          icon: 'trophy'
        }, { transaction });
      }
    }
    
    return frequency;
  }
  
  // Reset semanal (cron job - cada lunes)
  async resetWeeklyFrequencies() {
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeek = await Frequency.findAll({
      where: {
        week_start_date: lastWeekStart
      }
    });
    
    // Archivar en history
    for (const freq of lastWeek) {
      const weekEnd = new Date(freq.week_start_date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      await FrequencyHistory.create({
        id_user_profile: freq.id_user,
        week_start_date: freq.week_start_date,
        week_end_date: weekEnd,
        goal: freq.goal,
        achieved: freq.assist,
        goal_met: freq.achieved_goal,
        tokens_earned: freq.achieved_goal ? 20 : 0
      });
    }
    
    console.log(`Archived ${lastWeek.length} weekly frequencies`);
  }
  
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
```

### 4. Servicio de Workout (workout.service.js)

```javascript
class WorkoutService {
  // Iniciar sesión
  async startSession(userId, routineId = null, gymId = null) {
    const session = await WorkoutSession.create({
      id_user_profile: userId,
      id_routine: routineId,
      id_gym: gymId,
      session_date: new Date(),
      start_time: new Date().toTimeString().slice(0, 8),
      status: 'IN_PROGRESS'
    });
    
    // Si tiene rutina, cargar ejercicios
    if (routineId) {
      const exercises = await RoutineExercise.findAll({
        where: { id_routine: routineId },
        include: [{ model: Exercise }]
      });
      
      await session.update({
        total_exercises: exercises.length,
        total_sets: exercises.reduce((sum, ex) => sum + ex.series, 0)
      });
    }
    
    return session;
  }
  
  // Registrar set
  async logSet(sessionId, exerciseId, setData) {
    const { set_number, reps, weight, rest_seconds, difficulty } = setData;
    
    const workoutSet = await WorkoutSet.create({
      id_session: sessionId,
      id_exercise: exerciseId,
      set_number,
      reps,
      weight,
      rest_seconds,
      difficulty,
      completed: true
    });
    
    // Actualizar contadores de sesión
    const session = await WorkoutSession.findByPk(sessionId);
    await session.increment('completed_sets');
    
    // Verificar si completó todos los sets del ejercicio
    const totalSetsForExercise = await WorkoutSet.count({
      where: {
        id_session: sessionId,
        id_exercise: exerciseId
      }
    });
    
    // Si hay rutina, verificar cuántos sets debería tener
    if (session.id_routine) {
      const routineExercise = await RoutineExercise.findOne({
        where: {
          id_routine: session.id_routine,
          id_exercise: exerciseId
        }
      });
      
      if (routineExercise && totalSetsForExercise >= routineExercise.series) {
        await session.increment('completed_exercises');
      }
    }
    
    return workoutSet;
  }
  
  // Finalizar sesión
  async completeSession(sessionId, rating = null) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const session = await WorkoutSession.findByPk(sessionId, { transaction });
      
      if (session.status === 'COMPLETED') {
        throw new Error('La sesión ya fue completada');
      }
      
      // Actualizar sesión
      await session.update({
        end_time: new Date().toTimeString().slice(0, 8),
        status: 'COMPLETED',
        completed_at: new Date(),
        rating
      }, { transaction });
      
      await session.reload({ transaction });
      
      // Calcular tokens
      const tokenService = new TokenService();
      const tokens = await tokenService.calculateWorkoutTokens({
        duration_minutes: session.duration_minutes,
        completed_exercises: session.completed_exercises,
        total_exercises: session.total_exercises
      });
      
      await session.update({ tokens_earned: tokens }, { transaction });
      
      // Otorgar tokens
      await tokenService.awardTokens(
        session.id_user_profile,
        tokens,
        'WORKOUT_COMPLETED',
        'workout_session',
        sessionId,
        transaction
      );
      
      // Actualizar récords personales
      await this.updatePersonalRecords(sessionId, transaction);
      
      // Si completó rutina, incrementar contador
      if (session.id_routine) {
        await Routine.increment('times_completed', {
          where: { id_routine: session.id_routine },
          transaction
        });
      }
      
      // Notificar
      await NotificationService.create({
        id_user_profile: session.id_user_profile,
        type: 'ACHIEVEMENT',
        title: '¡Entrenamiento completado!',
        message: `Duración: ${session.duration_minutes} min. Ganaste ${tokens} tokens`,
        icon: 'checkmark-circle'
      }, { transaction });
      
      await transaction.commit();
      return session;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Actualizar récords personales
  async updatePersonalRecords(sessionId, transaction) {
    const sets = await WorkoutSet.findAll({
      where: { id_session: sessionId },
      transaction
    });
    
    // Por cada ejercicio, verificar si es récord
    const exerciseGroups = {};
    sets.forEach(set => {
      if (!exerciseGroups[set.id_exercise]) {
        exerciseGroups[set.id_exercise] = [];
      }
      exerciseGroups[set.id_exercise].push(set);
    });
    
    // Aquí podrías crear una tabla de récords personales
    // o simplemente hacer queries para comparar
  }
  
  // Obtener progreso por ejercicio
  async getExerciseProgress(userId, exerciseId, limit = 10) {
    const sets = await WorkoutSet.findAll({
      include: [{
        model: WorkoutSession,
        where: { id_user_profile: userId },
        attributes: ['session_date']
      }],
      where: { id_exercise: exerciseId },
      order: [['completed_at', 'DESC']],
      limit
    });
    
    return {
      recent_sessions: sets,
      personal_record_weight: Math.max(...sets.map(s => s.weight || 0)),
      personal_record_reps: Math.max(...sets.map(s => s.reps)),
      avg_weight: sets.reduce((sum, s) => sum + (s.weight || 0), 0) / sets.length,
      total_volume: sets.reduce((sum, s) => sum + (s.reps * (s.weight || 0)), 0)
    };
  }
}
```

### 5. Servicio de Pagos (payment.service.js)

```javascript
const mercadopago = require('mercadopago');

class PaymentService {
  constructor() {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
  }
  
  // Crear preferencia de pago
  async createPreference(userId, gymId, subscriptionType) {
    const user = await UserProfile.findByPk(userId, {
      include: [{ model: Account }]
    });
    
    const gym = await Gym.findByPk(gymId);
    
    if (!gym) {
      throw new Error('Gimnasio no encontrado');
    }
    
    // Determinar precio según tipo de suscripción
    let amount;
    let description;
    
    switch (subscriptionType) {
      case 'MONTHLY':
        amount = gym.month_price;
        description = `Membresía mensual - ${gym.name}`;
        break;
      case 'WEEKLY':
        amount = gym.week_price;
        description = `Membresía semanal - ${gym.name}`;
        break;
      default:
        throw new Error('Tipo de suscripción no válido');
    }
    
    // Crear registro en BD (estado PENDING)
    const payment = await MercadoPagoPayment.create({
      id_user_profile: userId,
      id_gym: gymId,
      amount,
      description,
      status: 'PENDING',
      external_reference: `GYM_${gymId}_USER_${userId}_${Date.now()}`
    });
    
    // Crear preferencia en MercadoPago
    const preference = {
      items: [{
        title: description,
        quantity: 1,
        unit_price: parseFloat(amount),
        currency_id: 'ARS'
      }],
      payer: {
        email: user.Account.email,
        name: user.name,
        surname: user.lastname
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: payment.external_reference,
      notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
    };
    
    const response = await mercadopago.preferences.create(preference);
    
    // Actualizar registro con preference_id
    await payment.update({
      preference_id: response.body.id
    });
    
    return {
      payment_id: payment.id_mp_payment,
      preference_id: response.body.id,
      init_point: response.body.init_point, // URL para pagar
      sandbox_init_point: response.body.sandbox_init_point
    };
  }
  
  // Procesar webhook de MercadoPago
  async processWebhook(data) {
    const { type, data: webhookData } = data;
    
    if (type !== 'payment') {
      return; // Solo procesamos pagos
    }
    
    const paymentId = webhookData.id;
    
    // Obtener info del pago desde MP
    const mpPayment = await mercadopago.payment.get(paymentId);
    const paymentInfo = mpPayment.body;
    
    // Buscar registro en BD por external_reference
    const payment = await MercadoPagoPayment.findOne({
      where: { external_reference: paymentInfo.external_reference }
    });
    
    if (!payment) {
      console.error('Pago no encontrado:', paymentInfo.external_reference);
      return;
    }
    
    const transaction = await db.sequelize.transaction();
    
    try {
      // Actualizar registro de pago
      await payment.update({
        payment_id: paymentInfo.id,
        status: paymentInfo.status.toUpperCase(),
        status_detail: paymentInfo.status_detail,
        payment_method: paymentInfo.payment_method_id,
        payment_type: paymentInfo.payment_type_id,
        payment_date: paymentInfo.date_approved,
        approved_at: paymentInfo.date_approved,
        payer_email: paymentInfo.payer.email,
        transaction_amount: paymentInfo.transaction_amount,
        net_received_amount: paymentInfo.transaction_details.net_received_amount,
        webhook_received_at: new Date(),
        raw_response: paymentInfo
      }, { transaction });
      
      // Si fue aprobado, activar membresía
      if (paymentInfo.status === 'approved') {
        await this.activateMembership(payment, transaction);
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Activar membresía
  async activateMembership(payment, transaction) {
    const { id_user_profile, id_gym } = payment;
    
    // Calcular fechas según tipo de suscripción
    const startDate = new Date();
    let finishDate = new Date();
    
    // Asumir MONTHLY por defecto (ajustar según subscriptionType en user_gym)
    finishDate.setMonth(finishDate.getMonth() + 1);
    
    // Crear o actualizar membresía
    const [userGym, created] = await UserGym.findOrCreate({
      where: {
        id_user: id_user_profile,
        id_gym: id_gym
      },
      defaults: {
        start_date: startDate,
        finish_date: finishDate,
        active: true,
        subscription_type: 'MONTHLY',
        id_payment: payment.id_mp_payment
      },
      transaction
    });
    
    if (!created) {
      // Extender membresía existente
      await userGym.update({
        finish_date: finishDate,
        active: true,
        id_payment: payment.id_mp_payment
      }, { transaction });
    }
    
    // Notificar al usuario
    await NotificationService.create({
      id_user_profile,
      type: 'PAYMENT',
      title: '¡Pago aprobado!',
      message: 'Tu membresía ha sido activada exitosamente',
      icon: 'checkmark-circle'
    }, { transaction });
    
    // Otorgar tokens de bienvenida (si es primera vez)
    if (created) {
      const tokenService = new TokenService();
      await tokenService.awardTokens(
        id_user_profile,
        50,
        'NEW_MEMBERSHIP',
        'user_gym',
        userGym.id_user,
        transaction
      );
    }
  }
}
```

### 6. Servicio de Reviews (review.service.js)

```javascript
class ReviewService {
  // Crear review
  async createReview(userId, gymId, reviewData) {
    const { rating, title, comment, cleanliness_rating, equipment_rating, staff_rating, value_rating } = reviewData;
    
    const transaction = await db.sequelize.transaction();
    
    try {
      // Verificar que el usuario asistió al gimnasio
      const hasAttended = await Assistance.count({
        where: {
          id_user: userId,
          id_gym: gymId
        }
      });
      
      // Crear review
      const review = await GymReview.create({
        id_gym: gymId,
        id_user_profile: userId,
        rating,
        title,
        comment,
        cleanliness_rating,
        equipment_rating,
        staff_rating,
        value_rating,
        is_verified: hasAttended > 0
      }, { transaction });
      
      // Recalcular estadísticas
      await this.recalculateGymStats(gymId, transaction);
      
      // Otorgar tokens por dejar review
      const tokenService = new TokenService();
      await tokenService.awardTokens(
        userId,
        10,
        'GYM_REVIEW',
        'gym_review',
        review.id_review,
        transaction
      );
      
      await transaction.commit();
      return review;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Recalcular estadísticas del gimnasio
  async recalculateGymStats(gymId, transaction) {
    const reviews = await GymReview.findAll({
      where: { id_gym: gymId },
      transaction
    });
    
    const stats = {
      avg_rating: 0,
      total_reviews: reviews.length,
      rating_5_count: 0,
      rating_4_count: 0,
      rating_3_count: 0,
      rating_2_count: 0,
      rating_1_count: 0,
      avg_cleanliness: 0,
      avg_equipment: 0,
      avg_staff: 0,
      avg_value: 0,
      last_review_date: null
    };
    
    if (reviews.length > 0) {
      stats.avg_rating = reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.length;
      
      reviews.forEach(r => {
        const ratingFloor = Math.floor(r.rating);
        stats[`rating_${ratingFloor}_count`]++;
      });
      
      // Promedios de aspectos específicos
      const cleanlinessReviews = reviews.filter(r => r.cleanliness_rating);
      const equipmentReviews = reviews.filter(r => r.equipment_rating);
      const staffReviews = reviews.filter(r => r.staff_rating);
      const valueReviews = reviews.filter(r => r.value_rating);
      
      if (cleanlinessReviews.length > 0) {
        stats.avg_cleanliness = cleanlinessReviews.reduce((sum, r) => sum + r.cleanliness_rating, 0) / cleanlinessReviews.length;
      }
      
      if (equipmentReviews.length > 0) {
        stats.avg_equipment = equipmentReviews.reduce((sum, r) => sum + r.equipment_rating, 0) / equipmentReviews.length;
      }
      
      if (staffReviews.length > 0) {
        stats.avg_staff = staffReviews.reduce((sum, r) => sum + r.staff_rating, 0) / staffReviews.length;
      }
      
      if (valueReviews.length > 0) {
        stats.avg_value = valueReviews.reduce((sum, r) => sum + r.value_rating, 0) / valueReviews.length;
      }
      
      stats.last_review_date = reviews[reviews.length - 1].created_at;
    }
    
    // Upsert en stats
    await GymRatingStats.upsert({
      id_gym: gymId,
      ...stats
    }, { transaction });
  }
  
  // Marcar review como útil
  async markHelpful(reviewId, userId) {
    const [helpful, created] = await ReviewHelpful.findOrCreate({
      where: {
        id_review: reviewId,
        id_user_profile: userId
      }
    });
    
    if (created) {
      await GymReview.increment('helpful_count', {
        where: { id_review: reviewId }
      });
    }
    
    return created;
  }
}
```

### 7. Servicio de Notificaciones (notification.service.js)

```javascript
const admin = require('firebase-admin');

class NotificationService {
  // Crear notificación
  static async create(notificationData, transaction = null) {
    const { id_user_profile, type, title, message, action_url, icon, priority } = notificationData;
    
    // Verificar preferencias del usuario
    const settings = await UserNotificationSettings.findByPk(id_user_profile, { transaction });
    
    if (!settings) {
      // Crear configuración por defecto
      await UserNotificationSettings.create({
        id_user_profile
      }, { transaction });
    }
    
    // Verificar si el tipo de notificación está habilitado
    const typeEnabled = this.isTypeEnabled(type, settings);
    
    if (!typeEnabled) {
      return null; // Usuario tiene deshabilitado este tipo
    }
    
    // Crear notificación en BD
    const notification = await Notification.create({
      id_user_profile,
      type,
      title,
      message,
      action_url,
      icon,
      priority: priority || 'NORMAL'
    }, { transaction });
    
    // Enviar push notification (async, no esperar)
    if (settings && settings.push_enabled) {
      this.sendPushNotification(id_user_profile, title, message, action_url)
        .catch(err => console.error('Error sending push:', err));
    }
    
    return notification;
  }
  
  // Verificar si tipo está habilitado
  static isTypeEnabled(type, settings) {
    if (!settings) return true;
    
    const typeMap = {
      'REMINDER': 'reminder_enabled',
      'ACHIEVEMENT': 'achievement_enabled',
      'REWARD': 'reward_enabled',
      'GYM_UPDATE': 'gym_news_enabled'
    };
    
    const settingKey = typeMap[type];
    return settingKey ? settings[settingKey] : true;
  }
  
  // Enviar push notification
  static async sendPushNotification(userId, title, body, url) {
    // Obtener token FCM del usuario (requiere tabla adicional)
    const fcmToken = await this.getUserFCMToken(userId);
    
    if (!fcmToken) {
      return;
    }
    
    const message = {
      notification: {
        title,
        body
      },
      data: {
        click_action: url || '/',
        type: 'gympoint_notification'
      },
      token: fcmToken
    };
    
    try {
      await admin.messaging().send(message);
    } catch (error) {
      console.error('FCM Error:', error);
      // Si el token es inválido, eliminarlo
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        await this.removeInvalidToken(userId);
      }
    }
  }
  
  static async getUserFCMToken(userId) {
    // Implementar tabla user_device_tokens
    // const device = await UserDevice.findOne({
    //   where: { id_user_profile: userId, is_active: true }
    // });
    // return device?.fcm_token;
    return null; // Placeholder
  }
  
  static async removeInvalidToken(userId) {
    // await UserDevice.update(
    //   { is_active: false },
    //   { where: { id_user_profile: userId } }
    // );
  }
  
  // Marcar como leída
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id_notification: notificationId,
        id_user_profile: userId
      }
    });
    
    if (!notification) {
      throw new Error('Notificación no encontrada');
    }
    
    if (notification.is_read) {
      return notification;
    }
    
    await notification.update({
      is_read: true,
      read_at: new Date()
    });
    
    return notification;
  }
  
  // Obtener notificaciones no leídas
  static async getUnreadCount(userId) {
    return await Notification.count({
      where: {
        id_user_profile: userId,
        is_read: false
      }
    });
  }
}
```

---

## 🔄 CRON JOBS

### 1. Reset Semanal de Frecuencias (jobs/weekly-frequency-reset.job.js)

```javascript
const cron = require('node-cron');

// Ejecutar cada lunes a las 00:01
cron.schedule('1 0 * * 1', async () => {
  console.log('Running weekly frequency reset...');
  
  const frequencyService = new FrequencyService();
  await frequencyService.resetWeeklyFrequencies();
  
  console.log('Weekly frequency reset completed');
});
```

### 2. Notificaciones Programadas (jobs/scheduled-notifications.job.js)

```javascript
const cron = require('node-cron');

// Ejecutar cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  
  // Buscar notificaciones pendientes
  const pending = await Notification.findAll({
    where: {
      scheduled_for: {
        [Op.lte]: now
      },
      sent_at: null
    },
    limit: 100
  });
  
  for (const notification of pending) {
    try {
      await NotificationService.sendPushNotification(
        notification.id_user_profile,
        notification.title,
        notification.message,
        notification.action_url
      );
      
      await notification.update({ sent_at: now });
    } catch (error) {
      console.error(`Error sending notification ${notification.id_notification}:`, error);
    }
  }
  
  console.log(`Sent ${pending.length} scheduled notifications`);
});
```

### 3. Eliminación de Cuentas (jobs/account-deletion.job.js)

```javascript
const cron = require('node-cron');

// Ejecutar diariamente a las 02:00
cron.schedule('0 2 * * *', async () => {
  const today = new Date();
  
  const pendingDeletions = await AccountDeletionRequest.findAll({
    where: {
      status: 'PENDING',
      scheduled_deletion_date: {
        [Op.lte]: today
      }
    },
    include: [{ model: Account }]
  });
  
  for (const request of pendingDeletions) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const account = request.Account;
      
      // Anonimizar datos sensibles
      await UserProfile.update({
        name: 'Usuario',
        lastname: 'Eliminado',
        phone: null,
        birth_date: null
      }, {
        where: { id_account: account.id_account },
        transaction
      });
      
      await account.update({
        email: `deleted_${account.id_account}@deleted.com`,
        password_hash: null,
        google_id: null,
        is_active: false
      }, { transaction });
      
      // Marcar como completado
      await request.update({
        status: 'COMPLETED',
        completed_at: new Date()
      }, { transaction });
      
      await transaction.commit();
      console.log(`Account ${account.id_account} anonymized`);
    } catch (error) {
      await transaction.rollback();
      console.error(`Error deleting account:`, error);
    }
  }
});
```

---

## 📊 RESUMEN FINAL

### ✅ Base de Datos
- **Solo estructura y constraints**
- **Campos calculados simples** (GENERATED columns para IMC, duración, etc.)
- **Sin triggers ni stored procedures complejos**
- **Índices para performance**

### ✅ Backend (Node.js)
- **Toda la lógica de negocio**
- **Cálculo de tokens**
- **Manejo de transacciones**
- **Integración con MercadoPago**
- **Sistema de notificaciones**
- **Cron jobs**
- **Validaciones**

### 📦 Tablas a Crear
1. ✅ `media`
2. ✅ `gym_review`
3. ✅ `gym_rating_stats`
4. ✅ `review_helpful`
5. ✅ `user_favorite_gym`
6. ✅ `gym_amenity`
7. ✅ `gym_gym_amenity`
8. ✅ `mercadopago_payment`
9. ✅ `user_body_metrics`
10. ✅ `frequency_history`
11. ✅ `workout_session`
12. ✅ `workout_set`
13. ✅ `routine_day`
14. ✅ `notification`
15. ✅ `user_notification_settings`
16. ✅ `account_deletion_request`

### 🔧 Tablas a Modificar
1. ✅ `frequency` (+ control semanal)
2. ✅ `gym` (+ campos contacto)
3. ✅ `user_gym` (+ payment)
4. ✅ `routine` (+ categorías)
5. ✅ `routine_exercise` (+ días)
6. ✅ `user_profile` (+ onboarding)
7. ✅ `assistance` (+ checkout)
8. ✅ `token_ledger` (+ metadata)

---

## 🎯 SCRIPT SQL COMPLETO DE MIGRACIÓN

```sql
-- ============================================
-- GYMPOINT DATABASE MIGRATION
-- De BD actual a BD optimizada
-- ============================================

USE gympoint;

START TRANSACTION;

-- ============================================
-- 1. NUEVAS TABLAS
-- ============================================

-- Tabla: MEDIA
CREATE TABLE IF NOT EXISTS media (
    id_media INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS') NOT NULL,
    entity_id INT NOT NULL,
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    file_size INT NULL COMMENT 'Bytes',
    mime_type VARCHAR(100) NULL,
    width INT NULL,
    height INT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_primary (entity_type, entity_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacenamiento de imágenes y videos';

-- Tabla: GYM_REVIEW
CREATE TABLE IF NOT EXISTS gym_review (
    id_review INT PRIMARY KEY AUTO_INCREMENT,
    id_gym INT NOT NULL,
    id_user_profile INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    title VARCHAR(100) NULL,
    comment TEXT NULL,
    cleanliness_rating TINYINT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
    equipment_rating TINYINT NULL CHECK (equipment_rating BETWEEN 1 AND 5),
    staff_rating TINYINT NULL CHECK (staff_rating BETWEEN 1 AND 5),
    value_rating TINYINT NULL CHECK (value_rating BETWEEN 1 AND 5),
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    reported BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    UNIQUE KEY unique_user_gym_review (id_user_profile, id_gym),
    INDEX idx_gym_rating (id_gym, rating DESC),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reviews y calificaciones de gimnasios';

-- Tabla: GYM_RATING_STATS
CREATE TABLE IF NOT EXISTS gym_rating_stats (
    id_gym INT PRIMARY KEY,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    rating_5_count INT DEFAULT 0,
    rating_4_count INT DEFAULT 0,
    rating_3_count INT DEFAULT 0,
    rating_2_count INT DEFAULT 0,
    rating_1_count INT DEFAULT 0,
    avg_cleanliness DECIMAL(3,2) DEFAULT 0,
    avg_equipment DECIMAL(3,2) DEFAULT 0,
    avg_staff DECIMAL(3,2) DEFAULT 0,
    avg_value DECIMAL(3,2) DEFAULT 0,
    last_review_date DATETIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    INDEX idx_rating (avg_rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estadísticas precalculadas de ratings';

-- Tabla: REVIEW_HELPFUL
CREATE TABLE IF NOT EXISTS review_helpful (
    id_review INT NOT NULL,
    id_user_profile INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_review, id_user_profile),
    FOREIGN KEY (id_review) REFERENCES gym_review(id_review) ON DELETE CASCADE,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reviews marcadas como útiles';

-- Tabla: USER_FAVORITE_GYM
CREATE TABLE IF NOT EXISTS user_favorite_gym (
    id_user_profile INT NOT NULL,
    id_gym INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_user_profile, id_gym),
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    INDEX idx_user_favorites (id_user_profile, created_at),
    INDEX idx_gym_favorites (id_gym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gimnasios favoritos por usuario';

-- Tabla: GYM_AMENITY
CREATE TABLE IF NOT EXISTS gym_amenity (
    id_amenity INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NULL,
    category ENUM('FACILITY', 'SERVICE', 'EQUIPMENT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de servicios y amenidades';

-- Tabla: GYM_GYM_AMENITY
CREATE TABLE IF NOT EXISTS gym_gym_amenity (
    id_gym INT NOT NULL,
    id_amenity INT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    notes VARCHAR(255) NULL,
    PRIMARY KEY (id_gym, id_amenity),
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
    FOREIGN KEY (id_amenity) REFERENCES gym_amenity(id_amenity) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Servicios disponibles por gimnasio';

-- Tabla: MERCADOPAGO_PAYMENT
CREATE TABLE IF NOT EXISTS mercadopago_payment (
    id_mp_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    id_gym INT NOT NULL,
    preference_id VARCHAR(100) NULL,
    payment_id VARCHAR(100) NULL,
    merchant_order_id VARCHAR(100) NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    description VARCHAR(255) NULL,
    payment_method VARCHAR(50) NULL,
    payment_type VARCHAR(50) NULL,
    status ENUM('PENDING', 'APPROVED', 'AUTHORIZED', 'IN_PROCESS', 
                'IN_MEDIATION', 'REJECTED', 'CANCELLED', 'REFUNDED', 
                'CHARGED_BACK') NOT NULL DEFAULT 'PENDING',
    status_detail VARCHAR(100) NULL,
    payment_date DATETIME NULL,
    approved_at DATETIME NULL,
    external_reference VARCHAR(100) NULL,
    payer_email VARCHAR(100) NULL,
    webhook_received_at DATETIME NULL,
    raw_response JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile),
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym),
    INDEX idx_payment_id (payment_id),
    INDEX idx_preference_id (preference_id),
    INDEX idx_status (status),
    INDEX idx_user_gym (id_user_profile, id_gym)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagos procesados por MercadoPago';

-- Tabla: USER_BODY_METRICS
CREATE TABLE IF NOT EXISTS user_body_metrics (
    id_metric INT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    recorded_date DATE NOT NULL,
    recorded_time TIME DEFAULT (CURTIME()),
    weight DECIMAL(5,2) NULL COMMENT 'kg',
    height DECIMAL(5,2) NULL COMMENT 'cm',
    body_fat_percentage DECIMAL(4,2) NULL,
    muscle_mass DECIMAL(5,2) NULL COMMENT 'kg',
    bmi DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN height > 0 THEN weight / POWER(height / 100, 2)
            ELSE NULL 
        END
    ) STORED,
    bmi_category VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN weight / POWER(height / 100, 2) < 18.5 THEN 'UNDERWEIGHT'
            WHEN weight / POWER(height / 100, 2) < 25 THEN 'NORMAL'
            WHEN weight / POWER(height / 100, 2) < 30 THEN 'OVERWEIGHT'
            ELSE 'OBESE'
        END
    ) STORED,
    neck_cm DECIMAL(5,2) NULL,
    chest_cm DECIMAL(5,2) NULL,
    waist_cm DECIMAL(5,2) NULL,
    hips_cm DECIMAL(5,2) NULL,
    biceps_cm DECIMAL(5,2) NULL,
    thighs_cm DECIMAL(5,2) NULL,
    calves_cm DECIMAL(5,2) NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (id_user_profile, recorded_date),
    INDEX idx_user_date (id_user_profile, recorded_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Métricas corporales con IMC calculado';

-- Tabla: FREQUENCY_HISTORY
CREATE TABLE IF NOT EXISTS frequency_history (
    id_history INT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    goal TINYINT NOT NULL,
    achieved TINYINT NOT NULL,
    goal_met BOOLEAN NOT NULL,
    tokens_earned INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    INDEX idx_user_date (id_user_profile, week_start_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Histórico de frecuencias semanales';

-- Tabla: WORKOUT_SESSION
CREATE TABLE IF NOT EXISTS workout_session (
    id_session BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    id_routine INT NULL,
    id_gym INT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NULL,
    duration_minutes INT GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, start_time, end_time)
            ELSE NULL 
        END
    ) STORED,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') DEFAULT 'IN_PROGRESS',
    total_exercises INT DEFAULT 0,
    completed_exercises INT DEFAULT 0,
    total_sets INT DEFAULT 0,
    completed_sets INT DEFAULT 0,
    notes TEXT NULL,
    rating TINYINT NULL CHECK (rating BETWEEN 1 AND 5),
    tokens_earned INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    FOREIGN KEY (id_routine) REFERENCES routine(id_routine) ON DELETE SET NULL,
    FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE SET NULL,
    INDEX idx_user_date (id_user_profile, session_date DESC),
    INDEX idx_status (status),
    INDEX idx_routine (id_routine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones de entrenamiento';

-- Tabla: WORKOUT_SET
CREATE TABLE IF NOT EXISTS workout_set (
    id_set BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_session BIGINT NOT NULL,
    id_exercise INT NOT NULL,
    set_number TINYINT NOT NULL,
    reps INT NOT NULL,
    weight DECIMAL(6,2) NULL COMMENT 'kg',
    rest_seconds INT NULL,
    difficulty ENUM('EASY', 'MODERATE', 'HARD', 'MAXIMAL') NULL,
    notes VARCHAR(255) NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_session) REFERENCES workout_session(id_session) ON DELETE CASCADE,
    FOREIGN KEY (id_exercise) REFERENCES exercise(id_exercise) ON DELETE CASCADE,
    INDEX idx_session (id_session),
    INDEX idx_exercise_date (id_exercise, completed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Series individuales por ejercicio';

-- Tabla: ROUTINE_DAY
CREATE TABLE IF NOT EXISTS routine_day (
    id_routine_day INT PRIMARY KEY AUTO_INCREMENT,
    id_routine INT NOT NULL,
    day_number TINYINT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    day_name VARCHAR(50) NULL,
    description TEXT NULL,
    rest_day BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_routine) REFERENCES routine(id_routine) ON DELETE CASCADE,
    UNIQUE KEY unique_routine_day (id_routine, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Días de las rutinas';

-- Tabla: NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    id_notification BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL,
    type ENUM('REMINDER', 'ACHIEVEMENT', 'REWARD', 'GYM_UPDATE', 'PAYMENT', 'SOCIAL', 'SYSTEM') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500) NULL,
    icon VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH') DEFAULT 'NORMAL',
    scheduled_for DATETIME NULL,
    sent_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE,
    INDEX idx_user_unread (id_user_profile, is_read, created_at DESC),
    INDEX idx_scheduled (scheduled_for, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sistema de notificaciones';

-- Tabla: USER_NOTIFICATION_SETTINGS
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id_user_profile INT PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    achievement_enabled BOOLEAN DEFAULT TRUE,
    reward_enabled BOOLEAN DEFAULT TRUE,
    gym_news_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME NULL,
    quiet_hours_end TIME NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_profile) REFERENCES user_profile(id_user_profile) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Preferencias de notificaciones';

-- Tabla: ACCOUNT_DELETION_REQUEST
CREATE TABLE IF NOT EXISTS account_deletion_request (
    id_request INT PRIMARY KEY AUTO_INCREMENT,
    id_account INT NOT NULL,
    reason TEXT NULL,
    scheduled_deletion_date DATE NOT NULL,
    status ENUM('PENDING', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (id_account) REFERENCES account(id_account) ON DELETE CASCADE,
    INDEX idx_status_date (status, scheduled_deletion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de eliminación de cuenta';

-- ============================================
-- 2. MODIFICACIONES A TABLAS EXISTENTES
-- ============================================

-- GYM: Agregar campos
ALTER TABLE gym
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20) NULL AFTER phone,
ADD COLUMN IF NOT EXISTS instagram VARCHAR(100) NULL AFTER social_media,
ADD COLUMN IF NOT EXISTS facebook VARCHAR(100) NULL AFTER instagram,
ADD COLUMN IF NOT EXISTS google_maps_url VARCHAR(500) NULL AFTER longitude,
ADD COLUMN IF NOT EXISTS max_capacity INT NULL COMMENT 'Capacidad máxima',
ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10,2) NULL COMMENT 'Área en m²',
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- USER_GYM: Vincular con pagos
ALTER TABLE user_gym
ADD COLUMN IF NOT EXISTS id_payment BIGINT NULL,
ADD COLUMN IF NOT EXISTS subscription_type ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL') NULL,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;

-- Agregar FK solo si no existe
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                  WHERE CONSTRAINT_NAME = 'fk_user_gym_payment' 
                  AND TABLE_NAME = 'user_gym');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE user_gym ADD CONSTRAINT fk_user_gym_payment 
     FOREIGN KEY (id_payment) REFERENCES mercadopago_payment(id_mp_payment)',
    'SELECT "FK already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ROUTINE: Agregar categorización
ALTER TABLE routine
ADD COLUMN IF NOT EXISTS category ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'FUNCTIONAL', 'MIXED') NULL AFTER difficulty,
ADD COLUMN IF NOT EXISTS target_goal ENUM('MUSCLE_GAIN', 'WEIGHT_LOSS', 'ENDURANCE', 'DEFINITION', 'GENERAL_FITNESS') NULL,
ADD COLUMN IF NOT EXISTS equipment_level ENUM('NO_EQUIPMENT', 'BASIC', 'FULL_GYM') NULL,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT NULL,
ADD COLUMN IF NOT EXISTS times_completed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS id_gym INT NULL;

-- Agregar FK de gym en routine
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                  WHERE CONSTRAINT_NAME = 'fk_routine_gym' 
                  AND TABLE_NAME = 'routine');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE routine ADD CONSTRAINT fk_routine_gym 
     FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE SET NULL',
    'SELECT "FK already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ROUTINE_EXERCISE: Agregar día
ALTER TABLE routine_exercise
ADD COLUMN IF NOT EXISTS id_routine_day INT NULL AFTER id_routine,
ADD COLUMN IF NOT EXISTS id_routine_exercise INT AUTO_INCREMENT FIRST,
ADD PRIMARY KEY IF NOT EXISTS (id_routine_exercise);

-- Agregar FK de routine_day
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                  WHERE CONSTRAINT_NAME = 'fk_routine_exercise_day' 
                  AND TABLE_NAME = 'routine_exercise');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE routine_exercise ADD CONSTRAINT fk_routine_exercise_day 
     FOREIGN KEY (id_routine_day) REFERENCES routine_day(id_routine_day) ON DELETE CASCADE',
    'SELECT "FK already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- USER_PROFILE: Mejorar campos
ALTER TABLE user_profile
MODIFY COLUMN subscription ENUM('FREE','PREMIUM') NOT NULL DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS app_tier ENUM('FREE','PREMIUM') NOT NULL DEFAULT 'FREE' AFTER subscription,
ADD COLUMN IF NOT EXISTS premium_since DATE NULL AFTER app_tier,
ADD COLUMN IF NOT EXISTS premium_expires DATE NULL AFTER premium_since,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'es',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires';

-- Migrar datos de subscription a app_tier
UPDATE user_profile SET app_tier = subscription WHERE app_tier = 'FREE';

-- ASSISTANCE: Agregar checkout
ALTER TABLE assistance
ADD COLUMN IF NOT EXISTS check_in_time TIME NULL AFTER hour,
ADD COLUMN IF NOT EXISTS check_out_time TIME NULL AFTER check_in_time,
ADD COLUMN IF NOT EXISTS duration_minutes INT GENERATED ALWAYS AS (
    CASE 
        WHEN check_out_time IS NOT NULL AND check_in_time IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
        ELSE NULL 
    END
) STORED,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Agregar constraint de unicidad
ALTER TABLE assistance
ADD UNIQUE KEY IF NOT EXISTS unique_user_gym_date (id_user, id_gym, date);

-- FREQUENCY: Agregar control semanal
ALTER TABLE frequency
ADD COLUMN IF NOT EXISTS week_start_date DATE NULL AFTER id_user,
ADD COLUMN IF NOT EXISTS week_number TINYINT GENERATED ALWAYS AS (WEEK(week_start_date, 1)) STORED,
ADD COLUMN IF NOT EXISTS year YEAR GENERATED ALWAYS AS (YEAR(week_start_date)) STORED;

-- Agregar constraint de unicidad semanal
ALTER TABLE frequency
ADD UNIQUE KEY IF NOT EXISTS unique_user_week (id_user, year, week_number);

-- TOKEN_LEDGER: Agregar metadata
ALTER TABLE token_ledger
ADD COLUMN IF NOT EXISTS metadata JSON NULL,
ADD COLUMN IF NOT EXISTS expires_at DATETIME NULL;

-- Agregar índice para balance
CREATE INDEX IF NOT EXISTS idx_user_balance ON token_ledger(id_user_profile, created_at DESC);

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Amenidades por defecto
INSERT IGNORE INTO gym_amenity (name, category, icon) VALUES
('Estacionamiento', 'FACILITY', 'car'),
('Vestuarios', 'FACILITY', 'shirt'),
('Duchas', 'FACILITY', 'water'),
('WiFi Gratuito', 'FACILITY', 'wifi'),
('Aire Acondicionado', 'FACILITY', 'snow'),
('Agua Potable', 'FACILITY', 'water-outline'),
('Casilleros', 'FACILITY', 'lock-closed'),
('Clases Grupales', 'SERVICE', 'people'),
('Entrenador Personal', 'SERVICE', 'person'),
('Nutricionista', 'SERVICE', 'nutrition'),
('Fisioterapeuta', 'SERVICE', 'medical'),
('Sauna', 'FACILITY', 'flame'),
('Pesas Libres', 'EQUIPMENT', 'barbell'),
('Máquinas', 'EQUIPMENT', 'construct'),
('Cardio', 'EQUIPMENT', 'fitness'),
('Funcional', 'EQUIPMENT', 'body');

COMMIT;

-- ============================================
-- 4. VISTAS ÚTILES
-- ============================================

-- Vista: Dashboard completo del usuario
CREATE OR REPLACE VIEW vw_user_dashboard AS
SELECT 
    up.id_user_profile,
    up.name,
    up.lastname,
    CONCAT(up.name, ' ', up.lastname) as full_name,
    up.tokens,
    up.app_tier,
    a.email,
    (SELECT weight FROM user_body_metrics 
     WHERE id_user_profile = up.id_user_profile 
     ORDER BY recorded_date DESC LIMIT 1) as current_weight,
    (SELECT height FROM user_body_metrics 
     WHERE id_user_profile = up.id_user_profile 
     ORDER BY recorded_date DESC LIMIT 1) as current_height,
    (SELECT bmi FROM user_body_metrics 
     WHERE id_user_profile = up.id_user_profile 
     ORDER BY recorded_date DESC LIMIT 1) as current_bmi,
    (SELECT goal FROM frequency 
     WHERE id_user = up.id_user_profile 
     ORDER BY created_at DESC LIMIT 1) as weekly_goal,
    (SELECT assist FROM frequency 
     WHERE id_user = up.id_user_profile 
     ORDER BY created_at DESC LIMIT 1) as weekly_assists,
    (SELECT value FROM streak 
     WHERE id_user = up.id_user_profile 
     ORDER BY updated_at DESC LIMIT 1) as current_streak,
    (SELECT COUNT(*) FROM user_gym 
     WHERE id_user = up.id_user_profile AND active = TRUE) as active_gyms,
    (SELECT COUNT(*) FROM assistance 
     WHERE id_user = up.id_user_profile) as total_attendances,
    (SELECT COUNT(*) FROM workout_session 
     WHERE id_user_profile = up.id_user_profile AND status = 'COMPLETED') as completed_workouts,
    up.created_at as member_since
FROM user_profile up
JOIN account a ON up.id_account = a.id_account
WHERE a.is_active = TRUE;

-- Vista: Gimnasios con stats completos
CREATE OR REPLACE VIEW vw_gym_complete AS
SELECT 
    g.*,
    COALESCE(grs.avg_rating, 0) as rating,
    COALESCE(grs.total_reviews, 0) as reviews_count,
    (SELECT COUNT(DISTINCT id_user) 
     FROM user_gym 
     WHERE id_gym = g.id_gym AND active = TRUE) as active_members,
    (SELECT COUNT(*) 
     FROM assistance 
     WHERE id_gym = g.id_gym 
     AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as monthly_visits,
    (SELECT COUNT(*) 
     FROM user_favorite_gym 
     WHERE id_gym = g.id_gym) as favorites_count,
    (SELECT url FROM media 
     WHERE entity_type = 'GYM' 
     AND entity_id = g.id_gym 
     AND is_primary = TRUE 
     LIMIT 1) as main_image
FROM gym g
LEFT JOIN gym_rating_stats grs ON g.id_gym = grs.id_gym
WHERE g.is_active = TRUE;

SELECT 'Migration completed successfully!' as status;
```

---

## 📁 ESTRUCTURA DE ARCHIVOS BACKEND

```
gympoint-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Sequelize config
│   │   ├── mercadopago.js       # MP config
│   │   ├── firebase.js          # Firebase Admin SDK
│   │   └── env.js               # Variables de entorno
│   │
│   ├── models/                  # Modelos Sequelize
│   │   ├── index.js
│   │   ├── Account.js
│   │   ├── UserProfile.js
│   │   ├── Gym.js
│   │   ├── GymReview.js
│   │   ├── Assistance.js
│   │   ├── WorkoutSession.js
│   │   ├── WorkoutSet.js
│   │   ├── Routine.js
│   │   ├── Frequency.js
│   │   ├── Notification.js
│   │   ├── MercadoPagoPayment.js
│   │   └── ...
│   │
│   ├