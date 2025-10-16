# Plan de Acción: Mejoras a GymPoint Database

## Análisis de la Situación Actual

### Arquitectura Existente (Ya Implementada)

- Backend Node.js con estructura services/controllers/routes
- Sequelize ORM con migraciones
- RBAC con accounts, roles, account_roles
- Sistema de tokens con token_ledger
- Integración básica con gimnasios, rutinas, ejercicios
- Sistema de asistencias y frecuencia semanal

### Filosofía de Diseño a Mantener

- Base de datos: Solo estructura, constraints e índices
- Backend: Toda la lógica de negocio
- Campos calculados simples en DB (GENERATED columns)
- Sin triggers ni stored procedures complejos

## Fase 1: Nuevas Tablas Core (Prioridad Alta)

### 1.1 Sistema de Reviews y Rating

Crear migraciones y modelos para:

- `gym_review` - Reviews de usuarios sobre gimnasios
- `gym_rating_stats` - Estadísticas precalculadas de ratings
- `review_helpful` - Marcas de "útil" en reviews

**Servicios a crear:**

- `review-service.js` - Crear/editar reviews, validar asistencia previa, recalcular stats
- Integrar con `token-service.js` para otorgar tokens por dejar review

**Controladores y rutas:**

- `review-controller.js`
- `routes/review-routes.js`

### 1.2 Sistema de Medios (Media)

Crear migración y modelo para:

- `media` - Gestión centralizada de imágenes/videos

**Servicios a crear:**

- `media-service.js` - Upload a Cloudinary/S3, generar thumbnails, limpiar huérfanos
- Integrar con multer middleware existente

**Uso:**

- Fotos de perfil de usuarios
- Imágenes de gimnasios
- Fotos de progreso
- Imágenes de ejercicios

### 1.3 Sistema de Favoritos

Crear migración para:

- `user_favorite_gym` - Gimnasios favoritos por usuario

**Servicios:**

- Extender `gym-service.js` con métodos toggle favorite

## Fase 2: Workout Sessions y Body Metrics (Prioridad Alta)

### 2.1 Sesiones de Entrenamiento

Crear migraciones y modelos:

- `workout_session` - Sesiones de entrenamiento
- `workout_set` - Series individuales por ejercicio
- `routine_day` - Días de rutinas

**Servicios a crear:**

- `workout-service.js` - Iniciar sesión, registrar sets, completar, calcular tokens

**Modificaciones:**

- Extender `routine-service.js` para manejar días de rutinas
- Actualizar tabla `routine_exercise` con `id_routine_day`

### 2.2 Métricas Corporales

Crear migración y modelo:

- `user_body_metrics` - Peso, altura, IMC (calculado), medidas

**Servicios:**

- Extender `user-service.js` con métodos de body metrics
- Validaciones de valores razonables
- Otorgar tokens por registro consistente

## Fase 3: Sistema de Notificaciones (Prioridad Media)

### 3.1 Notificaciones

Crear migraciones y modelos:

- `notification` - Notificaciones del sistema
- `user_notification_settings` - Preferencias por usuario

**Servicios a crear:**

- `notification-service.js` - Crear, enviar push (Firebase), email, marcar leídas

**Cron Jobs:**

- `jobs/scheduled-notifications-job.js` - Enviar notificaciones programadas cada 15 min

## Fase 4: Integración MercadoPago (Prioridad Media)

### 4.1 Pagos

Crear migración y modelo:

- `mercadopago_payment` - Registro completo de pagos

**Servicios a crear:**

- `payment-service.js` - Crear preferencia, procesar webhooks, activar membresías

**Rutas:**

- `routes/payment-routes.js` - Endpoints de pago
- `routes/webhook-routes.js` - Webhook de MercadoPago

**Modificaciones:**

- Actualizar tabla `user_gym` con `id_payment`, `subscription_type`, `auto_renew`

## Fase 5: Amenidades y Mejoras a Tablas Existentes (Prioridad Baja)

### 5.1 Amenidades de Gimnasios

Crear migraciones:

- `gym_amenity` - Catálogo de servicios
- `gym_gym_amenity` - Relación many-to-many

**Servicios:**

- Extender `gym-service.js`

### 5.2 Mejoras a Tablas Existentes

Crear migración única con ALTER TABLE:

- `gym`: + whatsapp, instagram, facebook, google_maps_url, max_capacity, area_sqm, verified, featured
- `user_profile`: + premium_since, premium_expires, onboarding_completed, preferred_language, timezone
- `assistance`: + check_in_time, check_out_time, duration_minutes (GENERATED), verified
- `frequency`: + week_start_date, week_number (GENERATED), year (GENERATED)
- `token_ledger`: + metadata (JSON), expires_at

### 5.3 Histórico de Frecuencias

Crear migración:

- `frequency_history` - Archivo de frecuencias semanales

**Cron Job:**

- Modificar `jobs/cleanup-job.js` para archivar frecuencias cada lunes

## Fase 6: Gestión de Cuentas (Prioridad Baja)

### 6.1 Eliminación de Cuentas

Crear migración:

- `account_deletion_request` - Solicitudes de eliminación con período de gracia

**Servicios:**

- Extender `user-service.js` con métodos de eliminación

**Cron Job:**

- `jobs/account-deletion-job.js` - Anonimizar cuentas programadas diariamente

## Fase 7: Vistas y Optimizaciones

### 7.1 Vistas Útiles

Crear vistas SQL:

- `vw_user_dashboard` - Dashboard completo del usuario
- `vw_gym_complete` - Gimnasios con stats completos

### 7.2 Seed Data

Crear seeds:

- Amenidades por defecto
- Roles iniciales (si no existen)

## Orden de Implementación Recomendado

1. **Sistema de Reviews** (1-2 días)

   - Migración, modelo, servicio, controlador, rutas
   - Cálculo automático de estadísticas
   - Tokens por review

2. **Sistema de Medios** (1 día)

   - Migración, modelo, servicio
   - Integración con Cloudinary/S3
   - Aplicar a user_profile y gym

3. **Workout Sessions** (2-3 días)

   - Migraciones, modelos
   - Servicio completo con cálculo de tokens
   - Integración con rutinas y ejercicios

4. **Body Metrics** (1 día)

   - Migración con IMC calculado
   - Servicio simple de registro
   - Tokens por consistencia

5. **Notificaciones** (2 días)

   - Migraciones, modelos
   - Servicio con Firebase
   - Cron job de envíos programados

6. **MercadoPago** (2-3 días)

   - Migración, modelo
   - Servicio de preferencias y webhooks
   - Activación automática de membresías

7. **Amenidades y Mejoras** (1-2 días)

   - Todas las mejoras a tablas existentes
   - Amenidades
   - Favoritos
   - Frecuencia history

8. **Eliminación de Cuentas** (1 día)

   - Migración, servicio, cron job

9. **Vistas y Optimizaciones** (1 día)

   - Vistas SQL
   - Seeds
   - Índices adicionales

## Archivos Clave a Crear/Modificar

### Nuevos Archivos

```
backend/node/
├── models/
│   ├── GymReview.js
│   ├── GymRatingStats.js
│   ├── ReviewHelpful.js
│   ├── Media.js
│   ├── UserFavoriteGym.js
│   ├── WorkoutSession.js
│   ├── WorkoutSet.js
│   ├── RoutineDay.js
│   ├── UserBodyMetrics.js
│   ├── Notification.js
│   ├── UserNotificationSettings.js
│   ├── MercadoPagoPayment.js
│   ├── GymAmenity.js
│   ├── GymGymAmenity.js
│   ├── FrequencyHistory.js
│   └── AccountDeletionRequest.js
├── services/
│   ├── review-service.js
│   ├── media-service.js
│   ├── workout-service.js
│   ├── body-metrics-service.js
│   ├── notification-service.js
│   └── payment-service.js
├── controllers/
│   ├── review-controller.js
│   ├── media-controller.js
│   ├── workout-controller.js
│   ├── body-metrics-controller.js
│   ├── notification-controller.js
│   └── payment-controller.js
├── routes/
│   ├── review-routes.js
│   ├── media-routes.js
│   ├── workout-routes.js
│   ├── body-metrics-routes.js
│   ├── notification-routes.js
│   ├── payment-routes.js
│   └── webhook-routes.js
├── jobs/
│   ├── scheduled-notifications-job.js
│   └── account-deletion-job.js
└── migrations/
    ├── 20251101-create-reviews-system.js
    ├── 20251102-create-media-table.js
    ├── 20251103-create-workout-sessions.js
    ├── 20251104-create-body-metrics.js
    ├── 20251105-create-notifications.js
    ├── 20251106-create-mercadopago-payments.js
    ├── 20251107-create-amenities.js
    ├── 20251108-enhance-existing-tables.js
    ├── 20251109-create-frequency-history.js
    ├── 20251110-create-account-deletion.js
    └── 20251111-create-views.js
```

### Archivos a Modificar

```
backend/node/
├── services/
│   ├── gym-service.js (+ favoritos, amenidades)
│   ├── user-service.js (+ body metrics, eliminación)
│   ├── routine-service.js (+ días de rutina)
│   ├── frequency-service.js (+ lógica de history)
│   └── token-service.js (+ nuevas razones de tokens)
├── jobs/
│   └── cleanup-job.js (+ archivar frecuencias)
└── models/
    └── index.js (+ asociaciones de nuevos modelos)
```

## Variables de Entorno a Agregar

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Email (opcional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

## Testing por Fase

Cada fase debe incluir:

- Unit tests de servicios
- Integration tests de endpoints
- Pruebas manuales con Postman

## Estimación Total

- **Tiempo estimado:** 12-15 días de desarrollo
- **Complejidad:** Media-Alta
- **Riesgo:** Bajo (respeta arquitectura existente)

## Beneficios del Plan

1. **Incremental**: Se puede implementar por fases
2. **Compatible**: No rompe funcionalidad existente
3. **Escalable**: Sigue los patrones ya establecidos
4. **Testeable**: Cada servicio es aislado
5. **Documentado**: Migraciones como documentación de cambios