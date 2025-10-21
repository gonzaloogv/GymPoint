# GymPoint - Documentación del Esquema de Base de Datos

## Índice
- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Migraciones](#migraciones)
- [Tablas por Dominio](#tablas-por-dominio)
- [Diagrama de Relaciones](#diagrama-de-relaciones)
- [Setup y Mantenimiento](#setup-y-mantenimiento)

---

## Visión General

GymPoint utiliza MySQL 8.4+ con un esquema modular y bien estructurado. El sistema se divide en 7 dominios principales, cada uno con su propia migración consolidada.

### Estadísticas del Esquema
- **Total de Tablas:** 51
- **Migraciones:** 7 archivos consolidados
- **Foreign Keys:** ~60 relaciones
- **Índices:** ~70 índices optimizados
- **ENUMs:** 15+ tipos enumerados

---

## Arquitectura

### Principios de Diseño

1. **Separación de Concerns:**
   - Autenticación (`accounts`) separada de datos de dominio (`profiles`)
   - Usuarios de app vs. Administradores en tablas diferentes
   - Integridad referencial completa

2. **Soft Deletes:**
   - Columna `deleted_at` en tablas principales
   - Permite recuperación de datos
   - No afecta consultas normales (usar `WHERE deleted_at IS NULL`)

3. **Timestamps:**
   - `created_at` en todas las tablas
   - `updated_at` con `ON UPDATE CURRENT_TIMESTAMP`
   - Histórico completo de cambios

4. **Normalización:**
   - Tercera forma normal (3NF)
   - Tablas de unión para relaciones many-to-many
   - Catálogos separados (roles, amenities, etc.)

---

## Migraciones

Las migraciones están consolidadas en 7 archivos organizados por dominio:

### 📄 `20260101-create-core-auth-tables.js`
**Tablas:** 4
**Dominio:** Autenticación y Autorización

- `accounts` - Credenciales de login (email/password, OAuth)
- `roles` - Catálogo de roles (USER, ADMIN, GYM_OWNER)
- `account_roles` - RBAC (many-to-many)
- `refresh_token` - Tokens JWT para sesiones

**Características:**
- Soporte para Google OAuth
- Email verification
- Account activation/deactivation
- Role-based access control

---

### 📄 `20260102-create-profile-tables.js`
**Tablas:** 3
**Dominio:** Perfiles de Usuario

- `user_profiles` - Perfil de usuario de la app
- `admin_profiles` - Perfil de administrador
- `account_deletion_request` - Solicitudes de eliminación de cuenta

**Características:**
- Relación 1:1 con `accounts`
- Campos de fitness (tokens, racha, suscripción)
- Datos personales (nombre, género, localidad)
- Soft delete en `user_profiles`

---

### 📄 `20260103-create-gym-ecosystem.js`
**Tablas:** 12
**Dominio:** Gimnasios y Reviews

- `gym_type` - Tipos de gimnasios
- `gym` - Información principal de gimnasios
- `gym_schedule` - Horarios regulares
- `gym_special_schedule` - Horarios especiales/feriados
- `gym_amenity` - Catálogo de amenidades
- `gym_gym_amenity` - Relación many-to-many
- `gym_geofence` - Configuración de geolocalización
- `gym_review` - Reseñas de usuarios
- `gym_rating_stats` - Estadísticas consolidadas
- `review_helpful` - Votos útiles en reseñas
- `user_favorite_gym` - Favoritos de usuarios
- `gym_payment` - Histórico de pagos

**Características:**
- Geolocalización (latitude/longitude)
- Reviews con ratings detallados (limpieza, equipamiento, personal, valor)
- Stats consolidadas para performance
- Soft delete en `gym`

---

### 📄 `20260104-create-fitness-tracking.js`
**Tablas:** 5
**Dominio:** Asistencia y Tracking

- `frequency` - Metas de frecuencia semanal
- `frequency_history` - Histórico de cumplimiento
- `streak` - Rachas de asistencia
- `user_gym` - Suscripción a gimnasio
- `assistance` - Check-in/check-out

**Características:**
- Auto check-in por geofence
- Tracking de duración de sesiones
- Sistema de rachas con recovery items
- Metas de frecuencia semanales

---

### 📄 `20260105-create-exercise-routines.js`
**Tablas:** 11
**Dominio:** Ejercicios y Entrenamientos

- `exercise` - Catálogo de ejercicios
- `routine` - Rutinas de entrenamiento
- `routine_day` - Días de una rutina
- `routine_exercise` - Ejercicios en rutina
- `user_routine` - Rutinas activas del usuario
- `user_imported_routine` - Histórico de imports
- `workout_session` - Sesiones de entrenamiento
- `workout_set` - Sets realizados
- `progress` - Progreso general
- `progress_exercise` - PRs por ejercicio
- `user_body_metrics` - Métricas corporales

**Características:**
- Rutinas pre-diseñadas (templates)
- Tracking de PRs (personal records)
- Métricas corporales (peso, grasa, músculo, etc.)
- Soft delete en `exercise` y `routine`

---

### 📄 `20260106-create-rewards-challenges.js`
**Tablas:** 10
**Dominio:** Gamificación

- `reward` - Catálogo de recompensas
- `reward_code` - Códigos canjeables
- `claimed_reward` - Recompensas reclamadas
- `token_ledger` - Ledger de tokens (doble entrada)
- `reward_gym_stats_daily` - Stats diarias
- `daily_challenge` - Desafíos diarios
- `user_daily_challenge` - Progreso en desafíos
- `achievement_definition` - Definición de logros
- `user_achievement` - Logros desbloqueados
- `user_achievement_event` - Histórico de eventos

**Características:**
- Sistema de tokens (ganancias/gastos)
- Desafíos diarios con tipos variados
- Sistema de logros con categorías
- Soft delete en `reward`

---

### 📄 `20260107-create-media-notifications.js`
**Tablas:** 5
**Dominio:** Soporte y Comunicación

- `media` - Gestión de multimedia
- `notification` - Notificaciones
- `user_notification_settings` - Preferencias
- `user_device_token` - Tokens para push
- `mercadopago_payment` - Pagos externos

**Características:**
- Media polimórfica (pertenece a diferentes entidades)
- Notificaciones programadas
- Configuración granular de preferencias
- Integración con MercadoPago

---

## Tablas por Dominio

### 🔐 Autenticación (4 tablas)

#### `accounts`
```sql
PK: id_account
Campos principales:
  - email (UNIQUE)
  - password_hash
  - auth_provider (local, google)
  - google_id (UNIQUE)
  - email_verified
  - is_active
Índices: email, google_id, is_active
```

#### `roles`
```sql
PK: id_role
Campos: role_name (UNIQUE), description
Datos iniciales: USER, ADMIN, GYM_OWNER
```

---

### 👤 Perfiles (3 tablas)

#### `user_profiles`
```sql
PK: id_user_profile
FK: id_account → accounts (1:1, CASCADE)
FK: id_streak → streak (SET NULL)
Campos fitness:
  - subscription (FREE, PREMIUM)
  - tokens (balance actual)
  - birth_date
  - gender (M, F, O)
Soft Delete: deleted_at
```

---

### 🏋️ Gimnasios (12 tablas)

#### `gym`
```sql
PK: id_gym
FK: id_type → gym_type (SET NULL)
Campos principales:
  - name, description, address, city
  - latitude, longitude (DECIMAL)
  - equipment (JSON)
  - services (JSON)
  - social_media (JSON)
  - verified, featured
Soft Delete: deleted_at
Índices: city, (latitude, longitude), (verified, featured)
```

#### `gym_review`
```sql
PK: id_review
FK: id_gym → gym (CASCADE)
FK: id_user_profile → user_profiles (CASCADE)
Constraint: UNIQUE(id_user_profile, id_gym)
Campos:
  - rating (DECIMAL 2,1)
  - cleanliness_rating, equipment_rating, staff_rating, value_rating
  - helpful_count
```

---

### 📊 Fitness Tracking (5 tablas)

#### `assistance`
```sql
PK: id_assistance
FK: id_user_profile → user_profiles (CASCADE)
FK: id_gym → gym (CASCADE)
FK: id_streak → streak (CASCADE)
Campos:
  - date, check_in_time, check_out_time
  - duration_minutes
  - auto_checkin (BOOLEAN)
  - distance_meters
Índices: (id_user_profile, date), (id_gym, date), (auto_checkin, date)
```

#### `streak`
```sql
PK: id_streak
FK: id_user_profile → user_profiles (CASCADE)
FK: id_frequency → frequency (CASCADE)
Campos:
  - value (racha actual)
  - last_value
  - max_value (récord histórico)
  - recovery_items
```

---

### 💪 Ejercicios (11 tablas)

#### `exercise`
```sql
PK: id_exercise
FK: created_by → user_profiles (SET NULL)
Campos:
  - exercise_name
  - muscular_group
  - secondary_muscles (JSON)
  - equipment_needed (JSON)
  - difficulty_level (BEGINNER, INTERMEDIATE, ADVANCED)
Soft Delete: deleted_at
```

#### `workout_session`
```sql
PK: id_workout_session
FK: id_user_profile → user_profiles (CASCADE)
FK: id_routine → routine (SET NULL)
FK: id_routine_day → routine_day (SET NULL)
Campos:
  - status (IN_PROGRESS, COMPLETED, CANCELLED)
  - started_at, ended_at
  - total_sets, total_reps, total_weight
Índices: (id_user_profile, status), started_at
```

---

### 🎁 Gamificación (10 tablas)

#### `token_ledger`
```sql
PK: id_ledger (BIGINT)
FK: id_user_profile → user_profiles (CASCADE)
Campos:
  - delta (INT, positivo=ganancia, negativo=gasto)
  - balance_after
  - reason (ATTENDANCE, REWARD_CLAIM, etc.)
  - ref_type, ref_id (referencia polimórfica)
  - metadata (JSON)
Índices: (id_user_profile, created_at), reason, (ref_type, ref_id)
```

#### `achievement_definition`
```sql
PK: id_achievement_definition
Campos:
  - code (UNIQUE)
  - category (ONBOARDING, STREAK, FREQUENCY, etc.)
  - metric_type (STREAK_DAYS, ASSISTANCE_TOTAL, etc.)
  - target_value
  - metadata (JSON)
```

#### `user_achievement`
```sql
PK: id_user_achievement (BIGINT)
FK: id_user_profile → user_profiles (CASCADE)
FK: id_achievement_definition → achievement_definition (CASCADE)
Constraint: UNIQUE(id_user_profile, id_achievement_definition)
Campos:
  - progress_value, progress_denominator
  - unlocked, unlocked_at
```

---

### 📱 Soporte (5 tablas)

#### `media`
```sql
PK: id_media
Polimórfica:
  - entity_type (USER_PROFILE, GYM, EXERCISE, etc.)
  - entity_id
Campos:
  - media_type (IMAGE, VIDEO)
  - url, thumbnail_url
  - is_primary, display_order
Índices: (entity_type, entity_id), (entity_type, entity_id, is_primary)
```

#### `notification`
```sql
PK: id_notification
FK: id_user_profile → user_profiles (CASCADE)
Campos:
  - type (REMINDER, ACHIEVEMENT, REWARD, etc.)
  - priority (LOW, NORMAL, HIGH)
  - is_read, read_at
  - scheduled_for, sent_at
  - data (JSON)
Índices: (id_user_profile, is_read, created_at), (scheduled_for, sent_at)
```

---

## Diagrama de Relaciones

```
accounts (BASE)
├─ account_roles ──→ roles
├─ refresh_token
├─ user_profiles (1:1)
│  ├─ user_gym ──→ gym
│  ├─ user_routine ──→ routine
│  ├─ frequency
│  │  └─ streak ──→ user_profiles.id_streak
│  ├─ assistance ──→ gym, streak
│  ├─ workout_session ──→ routine, routine_day
│  ├─ token_ledger
│  ├─ user_achievement ──→ achievement_definition
│  ├─ user_daily_challenge ──→ daily_challenge
│  ├─ claimed_reward ──→ reward ──→ gym
│  ├─ gym_review ──→ gym
│  ├─ user_favorite_gym ──→ gym
│  ├─ notification
│  └─ mercadopago_payment ──→ gym
│
└─ admin_profiles (1:1)

gym (BASE)
├─ gym_type
├─ gym_schedule
├─ gym_special_schedule
├─ gym_gym_amenity ──→ gym_amenity
├─ gym_geofence (1:1)
├─ gym_review
├─ gym_rating_stats (1:1)
├─ gym_payment
└─ reward

routine (BASE, creada por user_profiles)
├─ routine_day
│  └─ routine_exercise ──→ exercise
│     └─ workout_set ──→ workout_session
└─ user_imported_routine

exercise (BASE)
├─ routine_exercise
├─ workout_set
└─ progress_exercise ──→ progress
```

---

## Setup y Mantenimiento

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd GymPoint/backend/node

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar migraciones
node migrate.js

# 5. Ejecutar seed de datos iniciales
node seed/initial-data.js
```

### Docker Setup

```bash
# Levantar servicios
docker-compose up -d

# Las migraciones se ejecutan automáticamente al iniciar el backend
# Ver logs
docker-compose logs -f backend
```

### Comandos Útiles

```bash
# Crear backup
node backup-db.js

# Verificar estado de migraciones
node migrate.js --check

# Revertir última migración (NO RECOMENDADO en producción)
# Editar migrator.js para usar .down()

# Re-ejecutar seed (requiere DB limpia)
node seed/initial-data.js
```

### Buenas Prácticas

1. **Nunca modificar migraciones existentes**
   - Crear nuevas migraciones para cambios
   - Las migraciones son históricas

2. **Usar transacciones**
   - Todas las migraciones usan transacciones
   - Rollback automático en caso de error

3. **Índices**
   - Agregar índices para columnas en WHERE, JOIN, ORDER BY
   - Evitar sobre-indexación

4. **Soft Deletes**
   - Usar `deleted_at IS NULL` en queries
   - Considerar cleanup periódico de datos antiguos

5. **Foreign Keys**
   - Siempre definir ON DELETE y ON UPDATE
   - CASCADE para dependencias fuertes
   - SET NULL para referencias opcionales

---

## Mantenimiento y Evolución

### Agregar Nueva Funcionalidad

1. Crear nueva migración: `YYYYMMDD-descripcion.js`
2. Seguir patrón de migraciones existentes
3. Agregar índices necesarios
4. Documentar en este archivo
5. Actualizar seed si es necesario

### Performance

- Monitorear queries lentas con `EXPLAIN`
- Revisar índices faltantes
- Considerar particionamiento para tablas grandes (>10M rows)
- Usar vistas materializadas para stats complejas

### Backup

- Backup diario automático (configurar en producción)
- Retención de 30 días
- Backup pre-migración obligatorio
- Backups en storage externo (S3, etc.)

---

## Contacto y Soporte

Para dudas sobre el esquema:
- Revisar código de migraciones
- Consultar este documento
- Abrir issue en el repositorio

**Última actualización:** 2026-01-01
**Versión del esquema:** 1.0.0
**Compatibilidad:** MySQL 8.4+
