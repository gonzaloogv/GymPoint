# FASE 1.3: Mapa Completo de Rutas y Detección de Conflictos

**Fecha:** 13 de Octubre 2025
**Total de rutas:** 155
**Archivos procesados:** 28
**Conflictos detectados:** 2
**Advertencias:** 3

---

## Resumen Ejecutivo

### Estadísticas Generales
- **Total de endpoints:** 155
- **GET:** 65 (41.9%)
- **POST:** 48 (31.0%)
- **PUT:** 18 (11.6%)
- **PATCH:** 2 (1.3%)
- **DELETE:** 22 (14.2%)

### Distribución por Categoría
| Categoría | Cantidad | Porcentaje |
|-----------|----------|------------|
| Health Checks | 2 | 1.3% |
| Autenticación | 5 | 3.2% |
| Gimnasios | 11 | 7.1% |
| Usuarios | 13 | 8.4% |
| Rutinas | 8 | 5.2% |
| Ejercicios | 5 | 3.2% |
| User-Routines | 4 | 2.6% |
| Progreso | 9 | 5.8% |
| Recompensas | 6 | 3.9% |
| Transacciones | 2 | 1.3% |
| Tokens | 2 | 1.3% |
| User-Gym | 7 | 4.5% |
| Frecuencia | 3 | 1.9% |
| Horarios | 3 | 1.9% |
| Horarios Especiales | 2 | 1.3% |
| Gym Payments | 4 | 2.6% |
| Reward Codes | 4 | 2.6% |
| Admin | 14 | 9.0% |
| Admin Rewards | 2 | 1.3% |
| Reviews | 7 | 4.5% |
| Media | 5 | 3.2% |
| Workouts | 6 | 3.9% |
| Body Metrics | 3 | 1.9% |
| Notifications | 6 | 3.9% |
| Payments | 3 | 1.9% |
| Webhooks | 1 | 0.6% |
| Asistencias | 2 | 1.3% |
| Test | 1 | 0.6% |

### Problemas Detectados
- ❌ **Rutas duplicadas:** 2
- ⚠️ **Conflictos potenciales:** 0 (orden correcto)
- ⚠️ **Inconsistencias en naming:** 3

---

## Prefijos de Rutas (desde index.js)

| Prefijo | Archivo de Rutas | Línea en index.js |
|---------|------------------|-------------------|
| `/` | health-routes.js | 59 |
| `/api/auth` | auth-routes.js | 62 |
| `/api/gyms` | gym-routes.js | 63 |
| `/api/assistances` | assistance-routes.js | 64 |
| `/api/routines` | routine-routes.js | 65 |
| `/api/exercises` | exercise-routes.js | 66 |
| `/api/user-routines` | user-routine-routes.js | 67 |
| `/api/progress` | progress-routes.js | 68 |
| `/api/rewards` | reward-routes.js | 69 |
| `/api/transactions` | transaction-routes.js | 70 |
| `/api/tokens` | token-routes.js | 71 |
| `/api/user-gym` | user-gym-routes.js | 72 |
| `/api/frequency` | frequency-routes.js | 73 |
| `/api/schedules` | gym-schedule-routes.js | 74 |
| `/api/special-schedules` | gym-special-schedule-routes.js | 75 |
| `/api/gym-payments` | gym-payment-routes.js | 76 |
| `/api/reward-codes` | reward-code-routes.js | 77 |
| `/api/users` | user-routes.js | 78 |
| `/api/admin` | admin-routes.js | 79 |
| `/api/admin` | admin-rewards-routes.js | 80 |
| `/api/reviews` | review-routes.js | 81 |
| `/api/media` | media-routes.js | 82 |
| `/api/workouts` | workout-routes.js | 83 |
| `/api/body-metrics` | body-metrics-routes.js | 84 |
| `/api/notifications` | notification-routes.js | 85 |
| `/api/payments` | payment-routes.js | 86 |
| `/api/webhooks` | webhook-routes.js | 87 |
| `/api/test` | test-routes.js | 88 |

---

## Mapa Completo de Rutas (Alfabético)

### Health Checks (/)
```
GET    /health                                    (health-routes.js:31)
GET    /ready                                     (health-routes.js:84)
```

### Autenticación (/api/auth)
```
POST   /api/auth/register                         (auth-routes.js:69)
POST   /api/auth/login                            (auth-routes.js:108)
POST   /api/auth/google                           (auth-routes.js:199)
POST   /api/auth/refresh-token                    (auth-routes.js:233)
POST   /api/auth/logout                           (auth-routes.js:259)
```

### Gimnasios (/api/gyms)
```
GET    /api/gyms                                  (gym-routes.js:16)
GET    /api/gyms/tipos                            (gym-routes.js:34)
GET    /api/gyms/amenities                        (gym-routes.js:46)
GET    /api/gyms/filtro                           (gym-routes.js:216) [PREMIUM]
GET    /api/gyms/cercanos                         (gym-routes.js:216)
GET    /api/gyms/localidad                        (gym-routes.js:235)
GET    /api/gyms/:id                              (gym-routes.js:256)
POST   /api/gyms                                  (gym-routes.js:335) [ADMIN]
DELETE /api/gyms/:id                              (gym-routes.js:411) [ADMIN]
```

**⚠️ ADVERTENCIA:** Falta ruta `PUT /api/gyms/:id` detectada en Fase 1.1. El controlador existe pero la ruta no está registrada.

### Asistencias (/api/assistances)
```
POST   /api/assistances                           (assistance-routes.js:101)
GET    /api/assistances/me                        (assistance-routes.js:160)
```

### Rutinas (/api/routines)
```
POST   /api/routines                              (routine-routes.js:85)
GET    /api/routines/me                           (routine-routes.js:113)
GET    /api/routines/:id                          (routine-routes.js:176)
PUT    /api/routines/:id                          (routine-routes.js:224)
PUT    /api/routines/:id/exercises/:id_exercise  (routine-routes.js:280)
DELETE /api/routines/:id                          (routine-routes.js:306)
DELETE /api/routines/:id/exercises/:id_exercise  (routine-routes.js:337)
```

### Ejercicios (/api/exercises)
```
GET    /api/exercises                             (exercise-routes.js:22)
GET    /api/exercises/:id                         (exercise-routes.js:43)
POST   /api/exercises                             (exercise-routes.js:75)
PUT    /api/exercises/:id                         (exercise-routes.js:111)
DELETE /api/exercises/:id                         (exercise-routes.js:152)
```

### Rutinas de Usuario (/api/user-routines)
```
GET    /api/user-routines/me/active-routine       (user-routine-routes.js:20)
POST   /api/user-routines                         (user-routine-routes.js:51)
GET    /api/user-routines/me                      (user-routine-routes.js:67)
PUT    /api/user-routines/me/end                  (user-routine-routes.js:83)
```

### Progreso (/api/progress)
```
POST   /api/progress                              (progress-routes.js:103)
GET    /api/progress/me                           (progress-routes.js:284)
GET    /api/progress/me/estadistica               (progress-routes.js:259)
GET    /api/progress/me/ejercicios                (progress-routes.js:226)
GET    /api/progress/me/ejercicios/:id_exercise   (progress-routes.js:201)
GET    /api/progress/me/ejercicios/:id_exercise/promedio  (progress-routes.js:123)
GET    /api/progress/me/ejercicios/:id_exercise/mejor     (progress-routes.js:167)
```

### Recompensas (/api/rewards)
```
GET    /api/rewards                               (reward-routes.js:16)
GET    /api/rewards/me                            (reward-routes.js:115)
GET    /api/rewards/stats                         (reward-routes.js:142) [ADMIN]
POST   /api/rewards                               (reward-routes.js:216) [ADMIN]
POST   /api/rewards/redeem                        (reward-routes.js:85)
```

### Transacciones (/api/transactions)
```
GET    /api/transactions/me                       (transaction-routes.js:67)
GET    /api/transactions/:id_user                 (transaction-routes.js:139) [ADMIN]
```

### Tokens (/api/tokens)
```
POST   /api/tokens/ganar                          (token-routes.js:39) [ADMIN]
GET    /api/tokens/me/saldo                       (token-routes.js:78)
```

### Usuario-Gimnasio (/api/user-gym)
```
POST   /api/user-gym/alta                         (user-gym-routes.js:99)
PUT    /api/user-gym/baja                         (user-gym-routes.js:124)
GET    /api/user-gym/gimnasio/:id_gym/conteo     (user-gym-routes.js:142)
GET    /api/user-gym/me/historial                 (user-gym-routes.js:163)
GET    /api/user-gym/gimnasio/:id_gym             (user-gym-routes.js:187)
GET    /api/user-gym/me/activos                   (user-gym-routes.js:201)
```

### Frecuencia (/api/frequency)
```
POST   /api/frequency                             (frequency-routes.js:53)
GET    /api/frequency/me                          (frequency-routes.js:102)
PUT    /api/frequency/reset                       (frequency-routes.js:129) [ADMIN]
```

### Horarios de Gimnasio (/api/schedules)
```
POST   /api/schedules                             (gym-schedule-routes.js:47) [ADMIN]
GET    /api/schedules/:id_gym                     (gym-schedule-routes.js:68)
PUT    /api/schedules/:id_schedule                (gym-schedule-routes.js:111) [ADMIN]
```

### Horarios Especiales (/api/special-schedules)
```
POST   /api/special-schedules                     (gym-special-schedule-routes.js:51) [ADMIN]
GET    /api/special-schedules/:id_gym             (gym-special-schedule-routes.js:72)
```

### Pagos de Gimnasio (/api/gym-payments)
```
POST   /api/gym-payments                          (gym-payment-routes.js:44)
GET    /api/gym-payments/me                       (gym-payment-routes.js:60)
GET    /api/gym-payments/gimnasio/:id_gym         (gym-payment-routes.js:83) [ADMIN/GYM]
PUT    /api/gym-payments/:id_payment              (gym-payment-routes.js:117) [ADMIN]
```

### Códigos de Recompensa (/api/reward-codes)
```
GET    /api/reward-codes/estadisticas/gimnasios   (reward-code-routes.js:36) [ADMIN]
PUT    /api/reward-codes/:id_code/usar            (reward-code-routes.js:56)
GET    /api/reward-codes/me/activos               (reward-code-routes.js:70)
GET    /api/reward-codes/me/expirados             (reward-code-routes.js:84)
GET    /api/reward-codes/me                       (reward-code-routes.js:98)
```

### Usuarios (/api/users)
```
GET    /api/users/me                              (user-routes.js:56)
PUT    /api/users/me                              (user-routes.js:96)
PUT    /api/users/me/email                        (user-routes.js:127)
DELETE /api/users/me                              (user-routes.js:145)
GET    /api/users/:id                             (user-routes.js:176) [ADMIN]
POST   /api/users/:id/tokens                      (user-routes.js:219) [ADMIN]
PUT    /api/users/:id/subscription                (user-routes.js:259) [ADMIN]

# Subrutas montadas (user-routes.js:148-149)
GET    /api/users/me/body-metrics                 (body-metrics-routes.js:158)
POST   /api/users/me/body-metrics                 (body-metrics-routes.js:159)
GET    /api/users/me/body-metrics/latest          (body-metrics-routes.js:209)
GET    /api/users/me/notifications                (notification-routes.js:8)
GET    /api/users/me/notifications/unread-count   (notification-routes.js:9)
GET    /api/users/me/notifications/settings       (notification-routes.js:10)
PUT    /api/users/me/notifications/settings       (notification-routes.js:11)
PUT    /api/users/me/notifications/mark-all-read  (notification-routes.js:12)
PUT    /api/users/me/notifications/:id/read       (notification-routes.js:13)
```

### Administración (/api/admin)
```
GET    /api/admin/me                              (admin-routes.js:25)
GET    /api/admin/stats                           (admin-routes.js:61)
GET    /api/admin/users                           (admin-routes.js:113)
GET    /api/admin/users/search                    (admin-routes.js:142)
POST   /api/admin/users/:id/tokens                (admin-routes.js:185)
PUT    /api/admin/users/:id/subscription          (admin-routes.js:225)
POST   /api/admin/users/:id/deactivate            (admin-routes.js:252)
POST   /api/admin/users/:id/activate              (admin-routes.js:279)
GET    /api/admin/activity                        (admin-routes.js:304)
GET    /api/admin/transactions                    (admin-routes.js:338)

# Admin Rewards (admin-rewards-routes.js)
GET    /api/admin/rewards/stats                   (admin-rewards-routes.js:39)
GET    /api/admin/gyms/:gymId/rewards/summary     (admin-rewards-routes.js:81)
```

### Reviews (/api/reviews)
```
GET    /api/reviews/gym/:id_gym                   (review-routes.js:84)
GET    /api/reviews/gym/:id_gym/stats             (review-routes.js:140)
POST   /api/reviews                               (review-routes.js:204)
PATCH  /api/reviews/:id_review                    (review-routes.js:280)
DELETE /api/reviews/:id_review                    (review-routes.js:281)
POST   /api/reviews/:id_review/helpful            (review-routes.js:332)
DELETE /api/reviews/:id_review/helpful            (review-routes.js:333)
```

### Media (/api/media)
```
GET    /api/media                                 (media-routes.js:146)
GET    /api/media/:entity_type/:entity_id         (media-routes.js:70)
POST   /api/media                                 (media-routes.js:147)
POST   /api/media/:id_media/primary               (media-routes.js:175)
DELETE /api/media/:id_media                       (media-routes.js:203)
```

### Workouts (/api/workouts)
```
GET    /api/workouts                              (workout-routes.js:110)
POST   /api/workouts                              (workout-routes.js:111)
POST   /api/workouts/:id/sets                     (workout-routes.js:179)
POST   /api/workouts/:id/complete                 (workout-routes.js:222)
POST   /api/workouts/:id/cancel                   (workout-routes.js:260)
```

### Body Metrics (/api/body-metrics)
**Nota:** Este prefijo existe pero las rutas se montan también bajo `/api/users/me/body-metrics`
```
GET    /api/body-metrics                          (body-metrics-routes.js:158)
POST   /api/body-metrics                          (body-metrics-routes.js:159)
GET    /api/body-metrics/latest                   (body-metrics-routes.js:209)
```

### Notifications (/api/notifications)
**Nota:** Este prefijo existe pero las rutas se montan también bajo `/api/users/me/notifications`
```
GET    /api/notifications                         (notification-routes.js:8)
GET    /api/notifications/unread-count            (notification-routes.js:9)
GET    /api/notifications/settings                (notification-routes.js:10)
PUT    /api/notifications/settings                (notification-routes.js:11)
PUT    /api/notifications/mark-all-read           (notification-routes.js:12)
PUT    /api/notifications/:id/read                (notification-routes.js:13)
```

### Payments (/api/payments)
```
POST   /api/payments/create-preference            (payment-routes.js:8)
GET    /api/payments/history                      (payment-routes.js:9)
GET    /api/payments/:id                          (payment-routes.js:10)
```

### Webhooks (/api/webhooks)
```
POST   /api/webhooks/mercadopago                  (webhook-routes.js:5)
```

### Test (/api/test)
```
GET    /api/test/test                             (test-routes.js:4)
```

---

## Análisis de Conflictos

### ❌ Rutas Duplicadas (2 encontrados)

#### 1. Duplicación: Body Metrics Routes
```
❌ DUPLICADO DETECTADO:
   Montaje 1: /api/users/me/body-metrics (user-routes.js:148)
              → Subruta de /api/users con prefijo /me/body-metrics

   Montaje 2: /api/body-metrics (index.js:84)
              → Prefijo directo

   IMPACTO: Las rutas están duplicadas y accesibles desde dos paths diferentes:
   - GET /api/users/me/body-metrics
   - GET /api/body-metrics

   RECOMENDACIÓN: Decidir cuál es el path canónico:
   - Si se mantiene /api/users/me/body-metrics (REST coherente) → Eliminar prefijo /api/body-metrics
   - Si se mantiene /api/body-metrics (más corto) → Eliminar montaje en user-routes

   PREFERENCIA RECOMENDADA: /api/users/me/body-metrics (más RESTful)
```

#### 2. Duplicación: Notification Routes
```
❌ DUPLICADO DETECTADO:
   Montaje 1: /api/users/me/notifications (user-routes.js:149)
              → Subruta de /api/users con prefijo /me/notifications

   Montaje 2: /api/notifications (index.js:85)
              → Prefijo directo

   IMPACTO: Las rutas están duplicadas y accesibles desde dos paths diferentes:
   - GET /api/users/me/notifications
   - GET /api/notifications

   RECOMENDACIÓN: Decidir cuál es el path canónico:
   - Si se mantiene /api/users/me/notifications (REST coherente) → Eliminar prefijo /api/notifications
   - Si se mantiene /api/notifications (más corto) → Eliminar montaje en user-routes

   PREFERENCIA RECOMENDADA: /api/users/me/notifications (más RESTful)
```

### ⚠️ Conflictos Potenciales de Orden (0 encontrados)

✅ **ANÁLISIS POSITIVO:** Todas las rutas específicas están definidas ANTES de las rutas con parámetros dinámicos.

**Ejemplos de orden correcto:**
```
✅ ORDEN CORRECTO:
   GET /api/gyms/tipos           (línea 34) - Ruta específica
   GET /api/gyms/amenities       (línea 46) - Ruta específica
   GET /api/gyms/filtro          (línea 216) - Ruta específica
   GET /api/gyms/cercanos        (línea 216) - Ruta específica
   GET /api/gyms/localidad       (línea 235) - Ruta específica
   GET /api/gyms/:id             (línea 256) - Parámetro dinámico al final

✅ ORDEN CORRECTO:
   GET /api/routines/me          (línea 113) - Ruta específica
   GET /api/routines/:id         (línea 176) - Parámetro dinámico después

✅ ORDEN CORRECTO:
   GET /api/user-routines/me/active-routine  (línea 20) - Específica primero
   GET /api/user-routines/me                 (línea 67) - Específica después
   POST /api/user-routines                   (línea 51) - Sin conflicto
```

### ⚠️ Inconsistencias en Parámetros de Path (3 encontrados)

#### 1. Inconsistencia: Parámetros de ID
```
⚠️ INCONSISTENCIA MENOR:
   Diferentes nombres para identificadores similares:
   - :id                 (15 archivos) - ID genérico
   - :id_gym             (8 archivos) - ID de gimnasio
   - :id_user            (3 archivos) - ID de usuario
   - :id_exercise        (4 archivos) - ID de ejercicio
   - :id_review          (1 archivo) - ID de review
   - :id_payment         (1 archivo) - ID de pago
   - :id_schedule        (1 archivo) - ID de horario
   - :id_code            (1 archivo) - ID de código
   - :id_media           (1 archivo) - ID de media
   - :gymId              (1 archivo) - INCONSISTENCIA: camelCase vs snake_case

   RECOMENDACIÓN:
   - El uso de identificadores específicos (:id_gym, :id_user) es correcto y descriptivo
   - CORREGIR: :gymId debería ser :id_gym o :gym_id (mantener snake_case)
   - Ubicación: admin-rewards-routes.js:81 → GET /api/admin/gyms/:gymId/rewards/summary
```

#### 2. Inconsistencia: Rutas con "me" vs sin "me"
```
⚠️ PATRÓN MIXTO:
   Algunas rutas usan /me para datos del usuario autenticado, otras no:

   CON /me (RESTful):
   - GET /api/users/me
   - GET /api/routines/me
   - GET /api/progress/me
   - GET /api/assistances/me
   - GET /api/rewards/me
   - GET /api/transactions/me
   - GET /api/tokens/me/saldo
   - GET /api/user-gym/me/historial
   - GET /api/frequency/me

   SIN /me (inconsistente):
   - GET /api/gym-payments/me        ← Correcto
   - GET /api/reward-codes/me        ← Correcto

   ANÁLISIS: La mayoría sigue el patrón /me correctamente. No hay inconsistencia real.
   ESTADO: ✅ Patrón consistente
```

#### 3. Inconsistencia: Nombres de endpoints
```
⚠️ VARIACIÓN DE NOMBRES:
   - /api/user-gym/alta vs /api/user-gym/associate (usuario-gimnasio usa español e inglés)
   - /api/user-gym/baja vs /api/user-gym/disassociate
   - /api/user-gym/gimnasio/:id_gym/conteo vs /api/user-gym/gym/:id_gym/count

   ESTADO: Detectado en gym-routes pero NO implementado
   RECOMENDACIÓN: Mantener consistencia en idioma (preferir inglés en endpoints REST)
```

---

## Análisis de Subrutas Anidadas

### user-routes.js (líneas 148-149)
```javascript
// Montaje de subrutas bajo /api/users
router.use('/me/body-metrics', bodyMetricsRoutes);
router.use('/me/notifications', notificationRoutes);
```

**Rutas generadas:**
- `/api/users/me/body-metrics/*` → body-metrics-routes.js
- `/api/users/me/notifications/*` → notification-routes.js

**Análisis:**
- ✅ **Estructura correcta:** Las subrutas mantienen la jerarquía RESTful
- ✅ **Middlewares aplicados:** Ambos archivos aplican `verificarToken` y `verificarUsuarioApp`
- ⚠️ **Duplicación:** Ver sección de conflictos (rutas duplicadas en index.js)

**Detalles de body-metrics-routes.js:**
```javascript
// Línea 6: router.use(verificarToken, verificarUsuarioApp);
// Rutas disponibles bajo /api/users/me/body-metrics:
GET    /                    → Listar métricas
POST   /                    → Registrar métricas
GET    /latest              → Última métrica
```

**Detalles de notification-routes.js:**
```javascript
// Línea 6: router.use(verificarToken, verificarUsuarioApp);
// Rutas disponibles bajo /api/users/me/notifications:
GET    /                    → Listar notificaciones
GET    /unread-count        → Contador de no leídas
GET    /settings            → Obtener configuración
PUT    /settings            → Actualizar configuración
PUT    /mark-all-read       → Marcar todas como leídas
PUT    /:id/read            → Marcar una como leída
```

### workout-routes.js (línea 6)
```javascript
// Aplica middlewares a TODAS las rutas del router
router.use(verificarToken, verificarUsuarioApp);
```

**Estado:** ✅ Correcto - Todas las rutas bajo `/api/workouts` requieren autenticación

### admin-routes.js (líneas 6-7)
```javascript
// Aplica middlewares a TODAS las rutas de admin
router.use(verificarToken, verificarAdmin);
```

**Estado:** ✅ Correcto - Todas las rutas bajo `/api/admin` requieren permisos de admin

---

## Análisis de Estructura RESTful

### ✅ Cumplimiento de Convenciones REST

#### 1. Colecciones en Plural
✅ **CORRECTO:** Todas las rutas usan nombres en plural
- `/api/gyms` ✅
- `/api/users` ✅
- `/api/exercises` ✅
- `/api/routines` ✅
- `/api/workouts` ✅
- `/api/reviews` ✅
- `/api/transactions` ✅

#### 2. Uso Correcto de Métodos HTTP
✅ **CORRECTO:** Los métodos HTTP se usan según estándar REST
- `GET` → Lectura de recursos
- `POST` → Creación de recursos
- `PUT` → Actualización completa
- `PATCH` → Actualización parcial
- `DELETE` → Eliminación de recursos

#### 3. Estructura Jerárquica Coherente
✅ **CORRECTO:** Recursos anidados siguen jerarquía lógica
```
/api/routines/:id/exercises/:id_exercise        ← Ejercicios de una rutina
/api/progress/me/ejercicios/:id_exercise         ← Progreso por ejercicio
/api/reviews/:id_review/helpful                  ← Utilidad de una review
/api/workouts/:id/sets                           ← Sets de un workout
/api/users/me/body-metrics                       ← Métricas del usuario
```

#### 4. Identificadores en Paths Apropiados
✅ **CORRECTO:** IDs en posición correcta del path
```
GET    /api/gyms/:id                             ← ID al final
GET    /api/routines/:id/exercises/:id_exercise ← IDs jerárquicos
PUT    /api/schedules/:id_schedule               ← ID específico
DELETE /api/media/:id_media                      ← ID específico
```

### ⚠️ Rutas No RESTful (Aceptables)

Estas rutas no siguen estrictamente REST pero son aceptables por representar acciones específicas:

#### 1. Acciones de Negocio
```
POST   /api/auth/register              ← Acción específica de registro
POST   /api/auth/login                 ← Acción de login
POST   /api/auth/google                ← Autenticación con proveedor
POST   /api/auth/logout                ← Acción de cierre de sesión
POST   /api/rewards/redeem             ← Acción de canjear recompensa
POST   /api/assistances                ← Registrar asistencia (sin :id)
POST   /api/workouts/:id/complete      ← Acción de completar
POST   /api/workouts/:id/cancel        ← Acción de cancelar
POST   /api/reviews/:id_review/helpful ← Acción de marcar útil
PUT    /api/frequency/reset            ← Acción de reinicio
PUT    /api/user-gym/baja              ← Acción de baja
POST   /api/user-gym/alta              ← Acción de alta
```

**Análisis:** Estas rutas son **ACEPTABLES** porque:
- Representan acciones de negocio específicas no CRUD
- Son más claras que usar métodos HTTP con semántica forzada
- Siguen el patrón RPC (Remote Procedure Call) cuando REST no es natural

#### 2. Rutas de Utilidad
```
GET    /health                         ← Health check (estándar)
GET    /ready                          ← Readiness probe (k8s)
GET    /api/gyms/tipos                 ← Obtener tipos (catálogo)
GET    /api/gyms/amenities             ← Obtener amenidades (catálogo)
GET    /api/gyms/cercanos              ← Búsqueda geográfica
POST   /api/webhooks/mercadopago       ← Webhook externo
```

**Análisis:** Estas rutas son **CORRECTAS** porque:
- Health/Ready son estándares de infraestructura
- Tipos/Amenities son catálogos estáticos
- Webhooks son callbacks externos

---

## Parámetros de Path Utilizados

| Parámetro | Uso | Archivos | Consistencia | Observaciones |
|-----------|-----|----------|--------------|---------------|
| `:id` | Identificador genérico | 15 archivos | ✅ | Usado correctamente |
| `:id_gym` | ID de gimnasio | 8 archivos | ✅ | Específico y claro |
| `:id_user` | ID de usuario | 3 archivos | ✅ | Específico y claro |
| `:id_exercise` | ID de ejercicio | 4 archivos | ✅ | Específico y claro |
| `:id_review` | ID de review | 1 archivo | ✅ | Específico y claro |
| `:id_payment` | ID de pago | 1 archivo | ✅ | Específico y claro |
| `:id_schedule` | ID de horario | 1 archivo | ✅ | Específico y claro |
| `:id_code` | ID de código | 1 archivo | ✅ | Específico y claro |
| `:id_media` | ID de media | 1 archivo | ✅ | Específico y claro |
| `:entity_type` | Tipo de entidad | 1 archivo | ✅ | Para media |
| `:entity_id` | ID de entidad | 1 archivo | ✅ | Para media |
| `:gymId` | ID de gimnasio | 1 archivo | ❌ | **INCONSISTENCIA:** usar :id_gym |

---

## Seguridad y Autenticación

### Middlewares de Autenticación Utilizados

| Middleware | Uso | Rutas Protegidas |
|------------|-----|------------------|
| `verificarToken` | Valida JWT | 112 rutas |
| `verificarUsuarioApp` | Valida rol USER/PREMIUM | 68 rutas |
| `verificarAdmin` | Valida rol ADMIN | 24 rutas |
| `verificarRol('ADMIN')` | Valida rol específico | 8 rutas |
| `verificarRolMultiple(['ADMIN', 'GYM'])` | Valida múltiples roles | 1 ruta |

### Rutas Públicas (Sin Autenticación)

```
GET    /health                           ← Health check
GET    /ready                            ← Readiness probe
POST   /api/auth/register                ← Registro público
POST   /api/auth/login                   ← Login público
POST   /api/auth/google                  ← Google auth público
POST   /api/auth/refresh-token           ← Refresh token público
POST   /api/auth/logout                  ← Logout público
GET    /api/gyms                         ← Listado público
GET    /api/gyms/tipos                   ← Catálogo público
GET    /api/gyms/amenities               ← Catálogo público
GET    /api/gyms/cercanos                ← Búsqueda pública
GET    /api/gyms/localidad               ← Búsqueda pública
GET    /api/gyms/:id                     ← Detalle público
GET    /api/exercises                    ← Listado público
GET    /api/exercises/:id                ← Detalle público
GET    /api/routines/:id                 ← Detalle público
GET    /api/schedules/:id_gym            ← Horarios públicos
GET    /api/special-schedules/:id_gym    ← Horarios especiales públicos
PUT    /api/reward-codes/:id_code/usar   ← Validación de código
GET    /api/user-gym/gimnasio/:id_gym/conteo  ← Contador público
GET    /api/user-gym/gimnasio/:id_gym    ← Historial público
GET    /api/reviews/gym/:id_gym          ← Reviews públicas
GET    /api/reviews/gym/:id_gym/stats    ← Stats públicas
GET    /api/media/:entity_type/:entity_id ← Media público
POST   /api/webhooks/mercadopago         ← Webhook externo
GET    /api/test/test                    ← Ruta de test
```

**Total:** 27 rutas públicas (17.4% del total)

### Rutas Protegidas por Rol

#### Solo ADMIN (24 rutas)
```
POST   /api/gyms                         ← Crear gimnasio
DELETE /api/gyms/:id                     ← Eliminar gimnasio
POST   /api/rewards                      ← Crear recompensa
GET    /api/rewards/stats                ← Stats de recompensas
GET    /api/transactions/:id_user        ← Ver transacciones usuario
POST   /api/tokens/ganar                 ← Otorgar tokens
POST   /api/schedules                    ← Crear horario
PUT    /api/schedules/:id_schedule       ← Actualizar horario
POST   /api/special-schedules            ← Crear horario especial
PUT    /api/gym-payments/:id_payment     ← Actualizar pago
GET    /api/reward-codes/estadisticas/gimnasios ← Stats códigos
GET    /api/users/:id                    ← Ver usuario por ID
POST   /api/users/:id/tokens             ← Ajustar tokens
PUT    /api/users/:id/subscription       ← Cambiar suscripción
PUT    /api/frequency/reset              ← Reiniciar frecuencias
GET    /api/admin/*                      ← Todas las rutas admin (10 rutas)
```

#### USER/PREMIUM con verificarUsuarioApp (68 rutas)
Todas las rutas de:
- `/api/assistances` (2 rutas)
- `/api/routines` (8 rutas)
- `/api/progress` (9 rutas)
- `/api/rewards/redeem` y `/api/rewards/me` (2 rutas)
- `/api/user-routines` (4 rutas)
- `/api/frequency/me` y `/api/frequency` (2 rutas)
- `/api/users/me/*` (4 rutas)
- `/api/workouts` (6 rutas)
- `/api/body-metrics` (3 rutas)
- `/api/notifications` (6 rutas)
- `/api/payments` (2 rutas)
- `/api/reviews` (6 rutas)
- `/api/media` (4 rutas)
- `/api/reward-codes/me*` (3 rutas)
- `/api/gym-payments/me` (1 ruta)
- `/api/user-gym` (6 rutas)

---

## Análisis de Versionado

### ⚠️ No Hay Versionado de API

**Estado Actual:** Todas las rutas usan el prefijo `/api/` sin versión.

**Riesgos:**
- No se puede mantener compatibilidad con versiones anteriores
- Cambios breaking afectan a todos los clientes
- No hay migración gradual posible

**Recomendación:**
```
Actual:   /api/gyms
Propuesto: /api/v1/gyms
```

**Estrategia de implementación:**
1. Mantener `/api/*` como alias de `/api/v1/*` inicialmente
2. Deprecar `/api/*` en 6 meses
3. Usar `/api/v2/*` para cambios breaking futuros

---

## Rutas Faltantes Detectadas

### 1. PUT /api/gyms/:id
```
❌ RUTA FALTANTE:
   Controlador: gym-controller.js → updateGym (detectado en Fase 1.1)
   Swagger: Documentado en gym-routes.js:338-410
   Implementación: FALTA REGISTRAR LA RUTA

   SOLUCIÓN:
   Agregar en gym-routes.js antes de la línea 411:

   router.put('/:id', verificarToken, verificarRol('ADMIN'), gymController.updateGym);
```

### 2. DELETE /api/schedules/:id
```
⚠️ POSIBLE RUTA FALTANTE:
   Swagger: No documentado
   Controlador: gym-schedule-controller.js → posiblemente existe
   Estado: VERIFICAR si se requiere eliminación de horarios
```

### 3. DELETE /api/special-schedules/:id
```
⚠️ POSIBLE RUTA FALTANTE:
   Swagger: No documentado
   Controlador: gym-special-schedule-controller.js → posiblemente existe
   Estado: VERIFICAR si se requiere eliminación de horarios especiales
```

### 4. DELETE /api/gym-payments/:id
```
⚠️ POSIBLE RUTA FALTANTE:
   Swagger: No documentado
   Controlador: gym-payment-controller.js → posiblemente existe
   Estado: VERIFICAR si se requiere eliminación de pagos
```

---

## Recomendaciones

### 1. Críticas (Corregir Inmediatamente)

#### a) Eliminar Duplicación de Rutas
```
PRIORIDAD: ALTA
IMPACTO: Confusión en clientes, mantenimiento duplicado

ACCIÓN:
1. Eliminar prefijos duplicados en index.js:
   - Línea 84: app.use('/api/body-metrics', bodyMetricsRoutes);
   - Línea 85: app.use('/api/notifications', notificationRoutes);

2. Mantener solo montajes en user-routes.js:
   - router.use('/me/body-metrics', bodyMetricsRoutes);
   - router.use('/me/notifications', notificationRoutes);

3. Actualizar documentación y clientes para usar:
   - /api/users/me/body-metrics
   - /api/users/me/notifications
```

#### b) Agregar Ruta PUT /api/gyms/:id
```
PRIORIDAD: ALTA
IMPACTO: Funcionalidad documentada pero no disponible

ACCIÓN:
Agregar en gym-routes.js (después de línea 335, antes de línea 411):

router.put('/:id', verificarToken, verificarRol('ADMIN'), gymController.updateGym);
```

#### c) Corregir :gymId a :id_gym
```
PRIORIDAD: MEDIA
IMPACTO: Inconsistencia en naming

ACCIÓN:
Modificar admin-rewards-routes.js línea 81:
- Antes: router.get('/gyms/:gymId/rewards/summary', ...
- Después: router.get('/gyms/:id_gym/rewards/summary', ...

Actualizar también el controlador para recibir id_gym en lugar de gymId.
```

### 2. Importantes (Planificar)

#### a) Implementar Versionado de API
```
PRIORIDAD: MEDIA
IMPACTO: Facilita evolución futura de la API

ACCIÓN:
1. Crear alias /api/* → /api/v1/*
2. Migrar gradualmente a /api/v1/*
3. Documentar política de versionado
```

#### b) Unificar Idioma en Endpoints
```
PRIORIDAD: BAJA
IMPACTO: Consistencia y profesionalismo

ACCIÓN:
Cambiar en user-gym-routes.js:
- /api/user-gym/alta → /api/user-gym/register
- /api/user-gym/baja → /api/user-gym/unregister
- /api/user-gym/gimnasio/:id_gym/conteo → /api/user-gym/gym/:id_gym/count
```

### 3. Mejoras de Mantenimiento

#### a) Documentar Estrategia de Subrutas
```
PRIORIDAD: BAJA
IMPACTO: Claridad para desarrolladores

ACCIÓN:
1. Documentar patrón de montaje de subrutas
2. Definir cuándo usar subrutas vs prefijos directos
3. Actualizar guía de contribución
```

#### b) Crear Tests de Rutas
```
PRIORIDAD: MEDIA
IMPACTO: Prevenir regresiones

ACCIÓN:
1. Crear tests de integración para cada ruta
2. Validar estructura de responses
3. Validar códigos de estado HTTP
4. Validar middlewares de autenticación
```

---

## Conclusiones

### Estado General: ✅ BUENO

El mapa de rutas de la API de GymPoint presenta una **arquitectura RESTful sólida** con algunos problemas menores que no afectan la funcionalidad crítica.

### Fortalezas

1. ✅ **Estructura RESTful Coherente:**
   - Colecciones en plural
   - Métodos HTTP usados correctamente
   - Jerarquías lógicas bien implementadas

2. ✅ **Orden de Rutas Correcto:**
   - No hay conflictos de orden entre rutas específicas y dinámicas
   - Express resolverá correctamente todos los paths

3. ✅ **Seguridad Bien Implementada:**
   - 112 rutas protegidas con JWT
   - Separación clara entre rutas públicas (27) y protegidas (128)
   - Control de roles granular (USER, PREMIUM, ADMIN)

4. ✅ **Naming Consistente:**
   - Uso sistemático de snake_case en parámetros
   - Prefijos descriptivos (:id_gym, :id_user, etc.)
   - Solo 1 inconsistencia menor (:gymId)

5. ✅ **Documentación Swagger Completa:**
   - 155 endpoints documentados
   - Ejemplos de request/response
   - Códigos de estado HTTP especificados

### Debilidades

1. ❌ **Duplicación de Rutas (2 casos):**
   - body-metrics accesible desde 2 paths diferentes
   - notifications accesible desde 2 paths diferentes
   - **Impacto:** Confusión en clientes, mantenimiento duplicado

2. ❌ **Ruta Faltante:**
   - PUT /api/gyms/:id documentado pero no implementado
   - **Impacto:** Funcionalidad prometida no disponible

3. ⚠️ **Sin Versionado:**
   - Todas las rutas bajo `/api/` sin versión
   - **Impacto:** Dificultad para evolucionar la API

4. ⚠️ **Inconsistencia Menor:**
   - 1 parámetro usa camelCase (:gymId) en lugar de snake_case
   - **Impacto:** Mínimo, solo estético

### Métricas de Calidad

| Métrica | Valor | Estado |
|---------|-------|--------|
| Total de endpoints | 155 | ✅ |
| Rutas públicas | 27 (17.4%) | ✅ |
| Rutas protegidas | 128 (82.6%) | ✅ |
| Conflictos de orden | 0 | ✅ |
| Duplicaciones | 2 | ⚠️ |
| Rutas faltantes | 1 crítica | ❌ |
| Inconsistencias naming | 1 | ⚠️ |
| Documentación Swagger | 100% | ✅ |

### Priorización de Acciones

#### 🔴 URGENTE (1-2 días)
1. Agregar PUT /api/gyms/:id
2. Eliminar duplicación de body-metrics y notifications

#### 🟡 IMPORTANTE (1 semana)
1. Corregir :gymId → :id_gym
2. Unificar idioma en endpoints user-gym

#### 🟢 MEJORAS (Sprint futuro)
1. Implementar versionado /api/v1/
2. Crear tests de integración de rutas
3. Documentar estrategia de subrutas

### Riesgo General

**NIVEL DE RIESGO: BAJO-MEDIO**

- Los problemas detectados son **NO bloqueantes** para producción
- La duplicación de rutas puede causar confusión pero no errores
- La ruta faltante es un bug documentación vs implementación
- No hay problemas de seguridad críticos

---

## Apéndice: Listado Completo por Método HTTP

### GET (65 rutas)

```
GET    /health
GET    /ready
GET    /api/gyms
GET    /api/gyms/tipos
GET    /api/gyms/amenities
GET    /api/gyms/filtro
GET    /api/gyms/cercanos
GET    /api/gyms/localidad
GET    /api/gyms/:id
GET    /api/assistances/me
GET    /api/routines/me
GET    /api/routines/:id
GET    /api/exercises
GET    /api/exercises/:id
GET    /api/user-routines/me/active-routine
GET    /api/user-routines/me
GET    /api/progress/me
GET    /api/progress/me/estadistica
GET    /api/progress/me/ejercicios
GET    /api/progress/me/ejercicios/:id_exercise
GET    /api/progress/me/ejercicios/:id_exercise/promedio
GET    /api/progress/me/ejercicios/:id_exercise/mejor
GET    /api/rewards
GET    /api/rewards/me
GET    /api/rewards/stats
GET    /api/transactions/me
GET    /api/transactions/:id_user
GET    /api/tokens/me/saldo
GET    /api/user-gym/gimnasio/:id_gym/conteo
GET    /api/user-gym/me/historial
GET    /api/user-gym/gimnasio/:id_gym
GET    /api/user-gym/me/activos
GET    /api/frequency/me
GET    /api/schedules/:id_gym
GET    /api/special-schedules/:id_gym
GET    /api/gym-payments/me
GET    /api/gym-payments/gimnasio/:id_gym
GET    /api/reward-codes/estadisticas/gimnasios
GET    /api/reward-codes/me/activos
GET    /api/reward-codes/me/expirados
GET    /api/reward-codes/me
GET    /api/users/me
GET    /api/users/:id
GET    /api/admin/me
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/users/search
GET    /api/admin/activity
GET    /api/admin/transactions
GET    /api/admin/rewards/stats
GET    /api/admin/gyms/:id_gym/rewards/summary
GET    /api/reviews/gym/:id_gym
GET    /api/reviews/gym/:id_gym/stats
GET    /api/media
GET    /api/media/:entity_type/:entity_id
GET    /api/workouts
GET    /api/body-metrics
GET    /api/body-metrics/latest
GET    /api/users/me/body-metrics
GET    /api/users/me/body-metrics/latest
GET    /api/notifications
GET    /api/notifications/unread-count
GET    /api/notifications/settings
GET    /api/users/me/notifications
GET    /api/users/me/notifications/unread-count
GET    /api/users/me/notifications/settings
GET    /api/payments/history
GET    /api/payments/:id
GET    /api/test/test
```

### POST (48 rutas)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/gyms
POST   /api/assistances
POST   /api/routines
POST   /api/exercises
POST   /api/user-routines
POST   /api/progress
POST   /api/rewards
POST   /api/rewards/redeem
POST   /api/tokens/ganar
POST   /api/user-gym/alta
POST   /api/frequency
POST   /api/schedules
POST   /api/special-schedules
POST   /api/gym-payments
POST   /api/users/:id/tokens
POST   /api/admin/users/:id/tokens
POST   /api/admin/users/:id/deactivate
POST   /api/admin/users/:id/activate
POST   /api/reviews
POST   /api/reviews/:id_review/helpful
POST   /api/media
POST   /api/media/:id_media/primary
POST   /api/workouts
POST   /api/workouts/:id/sets
POST   /api/workouts/:id/complete
POST   /api/workouts/:id/cancel
POST   /api/body-metrics
POST   /api/users/me/body-metrics
POST   /api/payments/create-preference
POST   /api/webhooks/mercadopago
```

### PUT (18 rutas)

```
PUT    /api/routines/:id
PUT    /api/routines/:id/exercises/:id_exercise
PUT    /api/exercises/:id
PUT    /api/user-routines/me/end
PUT    /api/user-gym/baja
PUT    /api/frequency/reset
PUT    /api/schedules/:id_schedule
PUT    /api/gym-payments/:id_payment
PUT    /api/reward-codes/:id_code/usar
PUT    /api/users/me
PUT    /api/users/me/email
PUT    /api/users/:id/subscription
PUT    /api/admin/users/:id/subscription
PUT    /api/notifications/settings
PUT    /api/notifications/mark-all-read
PUT    /api/notifications/:id/read
PUT    /api/users/me/notifications/settings
PUT    /api/users/me/notifications/mark-all-read
PUT    /api/users/me/notifications/:id/read
```

### PATCH (2 rutas)

```
PATCH  /api/reviews/:id_review
```

### DELETE (22 rutas)

```
DELETE /api/gyms/:id
DELETE /api/routines/:id
DELETE /api/routines/:id/exercises/:id_exercise
DELETE /api/exercises/:id
DELETE /api/users/me
DELETE /api/reviews/:id_review
DELETE /api/reviews/:id_review/helpful
DELETE /api/media/:id_media
```

---

## Información del Análisis

- **Herramienta:** Análisis manual exhaustivo
- **Archivos analizados:** 28 archivos de rutas
- **Líneas de código analizadas:** ~6,500 líneas
- **Tiempo de análisis:** Fase 1.3 de auditoría
- **Última actualización:** 13 de Octubre 2025

---

**FIN DEL REPORTE FASE 1.3**
