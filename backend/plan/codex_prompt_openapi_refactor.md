# Prompt para Codex — JS + Express 5 + Sequelize 6 + MySQL 8.4.6 (Docker) + OpenAPI/Swagger

**Rol:** Actuá como Arquitecto Backend Senior especializado en **JavaScript** (Node 18+), **Express 5**, **Sequelize 6** y **MySQL 8.4.6** en **Docker**. Debés introducir **OpenAPI (Swagger)** como fuente de verdad de los DTOs, validar requests/responses contra el spec, refactorizar **services** y **controllers** para alinearlos con los **53 modelos** existentes, y dejar tests E2E y unitarios mínimos.

---

## Contexto del proyecto
- Lenguaje: **JavaScript** (no TypeScript).
- Stack: **Node + Express 5 + Sequelize 6 + MySQL 8.4.6 (en contenedor Docker)**.
- No había OpenAPI; se debe **agregar**.
- Arquitectura en capas y estructura de carpetas actual:
```
backups/
config/
controllers/
docs/
jobs/
middlewares/
migrations/
migrations-old/
models/
routes/
scripts/
seed/
services/
tests/
utils/
index.js (entrypoint)
```
- `package.json` relevante (scripts y dependencias):
```json
{
  "name": "node",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests --testPathIgnorePatterns=tests/integration",
    "test:integration": "jest --testPathPattern=tests/integration",
    "staging:migrate": "node migrate.js",
    "staging:seed": "node seed/seed-staging.js",
    "staging:setup": "npm run staging:migrate && npm run staging:seed",
    "lint": "ESLINT_USE_FLAT_CONFIG=false eslint ."
  },
  "dependencies": {
    "@sentry/node": "^10.20.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "google-auth-library": "^9.15.1",
    "joi": "^18.0.1",
    "jsonwebtoken": "^9.0.2",
    "mercadopago": "^1.5.17",
    "mysql2": "^3.14.1",
    "node-cron": "^3.0.3",
    "sequelize": "^6.37.7",
    "silent": "^0.2.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "umzug": "^3.8.2"
  },
  "devDependencies": {
    "eslint": "^9.29.0",
    "jest": "^30.0.2",
    "nodemon": "^3.1.10",
    "supertest": "^7.1.1"
  }
}
```

**Modelos (Sequelize) disponibles**
```
Account.js, AccountDeletionRequest.js, AccountRole.js, AchievementDefinition.js, AdminProfile.js, Assistance.js,
ClaimedReward.js, DailyChallenge.js, DailyChallengeSettings.js, DailyChallengeTemplate.js, Exercise.js, Frequency.js,
FrequencyHistory.js, Gym.js, GymAmenity.js, GymGymAmenity.js, GymGymType.js, GymPayment.js, GymRatingStats.js,
GymReview.js, GymSchedule.js, GymSpecialSchedule.js, GymType.js, index.js, Media.js, MercadoPagoPayment.js,
Notification.js, plan.md, Presence.js, Progress.js, ProgressExercise.js, RefreshToken.js, ReviewHelpful.js, Reward.js,
RewardCode.js, RewardGymStatsDaily.js, Role.js, Routine.js, RoutineDay.js, RoutineExercise.js, Streak.js, TokenLedger.js,
UserAchievement.js, UserAchievementEvent.js, UserBodyMetric.js, UserDailyChallenge.js, UserDeviceToken.js,
UserFavoriteGym.js, UserGym.js, UserImportedRoutine.js, UserNotificationSetting.js, UserProfile.js, UserRoutine.js,
WorkoutSession.js, WorkoutSet.js
```

---

## Objetivo
1) **Agregar OpenAPI v3.1** (spec-first) y **Swagger UI**.  
2) Validar **requests y responses** con `express-openapi-validator`.  
3) Definir **DTOs** en `components.schemas` y **parameters** compartidos.  
4) Crear **Commands/Queries** y **mappers**.  
5) Refactorizar **services** para consumir Commands/Queries y devolver entidades/POJOs.  
6) Alinear **repos/infra** a los modelos (proyecciones seguras, sin mass assignment).  
7) Ajustar **controllers** para mapear DTO ↔ Commands/Queries y Entidad ↔ DTO.  
8) Dejar **tests** unitarios y E2E mínimos y **docs** sincronizadas.

---

## Reglas y convenciones obligatorias
- **OpenAPI es la fuente de verdad de los contratos**. El spec define DTOs y parámetros; `express-openapi-validator` valida request/response en `development` y `test`.
- **No exponer modelos Sequelize** en responses. Responder con **ResponseDTO**.
- **Nunca** hacer `Model.create(req.body)`. Mapear **campo a campo**.
- **Paginación/orden**: `page`, `limit`, `sortBy`, `order` con **whitelist** desde `components.parameters`.
- **Rutas**: mantener paths/métodos actuales. Si hay cambios rompientes, crear **/v2** y marcar **/v1** `deprecated`.
- **MySQL (Docker)**: usar host `mysql`, puerto `3306`, pool y TZ **UTC**.
- **Testing**: `jest` + `supertest`. El middleware cubre contract; agregar unit de services.

---

## Plan por fases (ejecutar en este orden)

### Fase 0 — Inventario y setup
**Tareas**
- Leer `models/index.js` y extraer asociaciones, PK/UK, timestamps, soft-delete.
- Generar `docs/inventory.md` con el catálogo y riesgos de mass assignment.
- Crear `docs/openapi.yaml` (o `openapi/openapi.yaml` si preferís carpeta separada).
- Instalar dependencias faltantes:
  - `npm i express-openapi-validator`
  - `npm i -D @redocly/cli` (lint del spec)
- Agregar scripts:
  - `"openapi:lint": "redocly lint docs/openapi.yaml"`

**Criterios de aceptación**
- `docs/inventory.md` existe.
- Proyecto sigue levantando con `npm run dev`.

---

### Fase 1 — OpenAPI base + DTOs compartidos
**Tareas**
- Crear `docs/openapi.yaml` (OpenAPI 3.1) con:
  - `info`, `servers`.
  - `components.parameters`: `Page`, `Limit`, `Order`, y `SortBy` por recurso con enums.
  - `components.schemas`: `Error`, `Paginated<T>`, y 2 dominios iniciales (p. ej. Auth/Accounts y Gyms) con `*Request`, `*Response`.
  - `paths` de los endpoints actuales de esos dominios con ejemplos válidos.
- Montar **Swagger UI** en `/docs` sirviendo `docs/openapi.yaml`.

**Criterios**
- `npm run openapi:lint` en verde.
- Swagger UI accesible y navegable.

---

### Fase 2 — Validación runtime (OpenAPI-first)
**Tareas**
- Crear `middlewares/openapi-validator.js` y montarlo **antes** de las rutas:
  - `validateRequests: true`
  - `validateResponses: process.env.NODE_ENV !== 'production'`
  - Ignorar `/docs` y `/openapi.yaml` en el validador.
- Crear `middlewares/error-handler.js` que devuelva `{ code, message, details }` según `components.schemas.Error`.
- Exponer `/openapi.yaml` con `res.sendFile`.

**Criterios**
- Requests inválidos responden 400/422 conforme al `Error` schema.
- Responses inválidas fallan en dev/test.

---

### Fase 3 — Commands/Queries y mappers
**Tareas**
- Crear:
  - `services/commands/` y `services/queries/` con `CreateXCommand`, `UpdateXCommand`, `GetXQuery`, `ListXQuery`.
  - `services/mappers/` para `RequestDTO → Command/Query` y `Entidad → ResponseDTO`.
- Helpers en `utils/`: `pagination.js`, `sort-whitelist.js` que lean enums desde el spec o una constante compartida.

**Criterios**
- Controllers no usan modelos Sequelize directamente.
- Commands/Queries (POJOs) y mappers centralizados.

---

### Fase 4 — Refactor de services
**Tareas**
- Actualizar **services** para:
  - Recibir **Commands/Queries** puros.
  - Aplicar reglas de negocio.
  - Devolver **entidades/POJOs** sin `req/res` ni modelos ORM.

**Criterios**
- Ningún service depende de Express ni de Sequelize.

---

### Fase 5 — Infra/Repos (Sequelize)
**Tareas**
- Crear/ajustar `infra/db/repositories/*`:
  - `attributes` explícitos, filtros validados.
  - `order` y `sortBy` solo desde whitelists.
  - `include` de asociaciones estrictamente necesarias.
- Crear `infra/db/mappers/*` para `Modelo ORM ↔ Entidad`.

**Criterios**
- No existe mass assignment.
- Consultas legibles y parametrizadas.

---

### Fase 6 — Controllers + Routes
**Tareas**
- Controllers en `controllers/` que:
  - Reciban req ya validado por middleware.
  - Transformen a Command/Query.
  - Llamen al service y mapeen a ResponseDTO.
- `routes/` mantiene paths/métodos; si hay breaking, crear `/v2`.

**Criterios**
- Endpoints operativos; responses pasan validación de OpenAPI.

---

### Fase 7 — OpenAPI final + Tests
**Tareas**
- Sincronizar `docs/openapi.yaml` con los responses reales y **agregar el resto de dominios**.
- Tests:
  - **Unit** de services (reglas de negocio).
  - **E2E** con `supertest` por dominio: 200/201/400/401/403/404/409/422 y casos de paginación/sort.
- `docs/migration-notes.md` con breaking changes y deprecaciones.

**Criterios**
- `jest` en verde. Coverage básico en paths críticos.
- Spec actualizado y lint en verde.

---

## Lotes por dominio (1 PR por lote)
1) **Auth & Accounts**: `Account, Role, AccountRole, RefreshToken, AdminProfile, AccountDeletionRequest, UserDeviceToken`  
2) **Users & Profiles**: `UserProfile, Presence, UserNotificationSetting`  
3) **Gyms & Catálogo**: `Gym, GymType, GymAmenity, GymGymType, GymGymAmenity, Media`  
4) **Horarios/Reseñas/Pagos Gym**: `GymSchedule, GymSpecialSchedule, GymPayment, GymReview, ReviewHelpful, GymRatingStats`  
5) **Rewards & Tokens**: `Reward, RewardCode, ClaimedReward, TokenLedger, RewardGymStatsDaily`  
6) **Challenges & Streaks & Frecuencia**: `DailyChallenge, DailyChallengeTemplate, DailyChallengeSettings, UserDailyChallenge, Streak, Frequency, FrequencyHistory, Assistance`  
7) **Routines & Workout**: `Exercise, Routine, RoutineDay, RoutineExercise, WorkoutSession, WorkoutSet, UserRoutine, UserImportedRoutine`  
8) **Progress & Métricas & Achievements**: `Progress, ProgressExercise, UserBodyMetric, AchievementDefinition, UserAchievement, UserAchievementEvent`  
9) **Pagos externos & Notifs & Fav/Afiliación**: `MercadoPagoPayment, Notification, UserFavoriteGym, UserGym`

---

## Implementación concreta

### 1) Montaje de Swagger y validador (`index.js`)
Servir `/docs` y exponer `/openapi.yaml`; montar `express-openapi-validator` antes de `routes/` y el error handler al final.
```js
// index.js
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const app = express();

app.use(express.json());

const specPath = path.join(__dirname, 'docs', 'openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: '/openapi.yaml' } }));
app.get('/openapi.yaml', (req, res) => res.sendFile(specPath));

app.use(OpenApiValidator.middleware({
  apiSpec: specPath,
  validateRequests: true,
  validateResponses: process.env.NODE_ENV !== 'production',
}));

app.use(require('./routes')); // tu index de rutas
app.use(require('./middlewares/error-handler'));

app.listen(process.env.PORT || 3000);
```

`middlewares/error-handler.js`
```js
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Unexpected error',
    details: err.errors || undefined
  });
};
```

### 2) Esqueleto `docs/openapi.yaml`
Arrancá con Gyms como ejemplo y parámetros compartidos.
```yaml
openapi: 3.1.0
info: { title: GymPoint API, version: 1.0.0 }
servers: [{ url: http://localhost:3000 }]
paths:
  /gyms:
    get:
      summary: List gyms
      parameters:
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Order'
        - $ref: '#/components/parameters/GymSortBy'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/PaginatedGyms' }
    post:
      summary: Create gym
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateGymRequest' }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/GymResponse' }
components:
  parameters:
    Page:  { in: query, name: page,  schema: { type: integer, minimum: 1, default: 1 } }
    Limit: { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
    Order: { in: query, name: order, schema: { type: string, enum: [ASC, DESC], default: DESC } }
    GymSortBy: { in: query, name: sortBy, schema: { type: string, enum: [name, city, created_at], default: created_at } }
  schemas:
    Error:
      type: object
      additionalProperties: false
      properties: { code: { type: string }, message: { type: string }, details: { type: array, items: { type: object } } }
    CreateGymRequest:
      type: object
      additionalProperties: false
      required: [name, city, address, latitude, longitude, month_price]
      properties:
        name: { type: string, minLength: 2, maxLength: 80 }
        city: { type: string }
        address: { type: string }
        latitude: { type: number, minimum: -90, maximum: 90 }
        longitude:{ type: number, minimum: -180, maximum: 180 }
        month_price: { type: number, minimum: 0 }
        geofence_radius_meters: { type: integer, minimum: 10, maximum: 2000, default: 100 }
        min_stay_minutes: { type: integer, minimum: 5, maximum: 240, default: 30 }
    GymResponse:
      type: object
      properties:
        id_gym: { type: integer }
        name: { type: string }
        city: { type: string }
        address: { type: string }
        month_price: { type: number }
        geofence_radius_meters: { type: integer }
        min_stay_minutes: { type: integer }
        created_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }
    PaginatedGyms:
      type: object
      properties:
        page: { type: integer }
        limit:{ type: integer }
        total:{ type: integer }
        items:{ type: array, items: { $ref: '#/components/schemas/GymResponse' } }
```

### 3) Repos/Services/Controllers — patrones
Repositorio (proyección explícita, orden seguro):
```js
// infra/db/repositories/gym.repo.js
const { Gym } = require('../../models');
const safeSort = new Set(['name','city','created_at']);
const safeOrder = new Set(['ASC','DESC']);

exports.list = async ({ page, limit, sortBy='created_at', order='DESC', city }) => {
  const offset = (page - 1) * limit;
  const orderCol = safeSort.has(sortBy) ? sortBy : 'created_at';
  const orderDir = safeOrder.has(order) ? order : 'DESC';
  const where = city ? { city } : {};
  const { rows, count } = await Gym.findAndCountAll({
    where, limit, offset,
    order: [[orderCol, orderDir]],
    attributes: ['id_gym','name','city','address','month_price','geofence_radius_meters','min_stay_minutes','created_at','updated_at']
  });
  return { items: rows, total: count, page, limit };
};
```

Service (Command/Query → entidad/POJO):
```js
// services/gym.service.js
const gymRepo = require('../infra/db/repositories/gym.repo');

exports.list = async (query) => {
  const page = await gymRepo.list(query);
  return {
    ...page,
    items: page.items.map(g => ({
      id_gym: g.id_gym,
      name: g.name,
      city: g.city,
      address: g.address,
      month_price: g.month_price,
      geofence_radius_meters: g.geofence_radius_meters,
      min_stay_minutes: g.min_stay_minutes,
      created_at: g.created_at.toISOString(),
      updated_at: g.updated_at.toISOString()
    }))
  };
};
```

Controller (req validado por OpenAPI → Query → Service → ResponseDTO):
```js
// controllers/gym.controller.js
const gymService = require('../services/gym.service');

exports.list = async (req, res, next) => {
  try {
    const result = await gymService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sortBy: req.query.sortBy,
      order: req.query.order,
      city: req.query.city
    });
    res.json(result);
  } catch (e) { next(e); }
};
```

---

## Convenciones clave
- **Error schema único**: `{ code, message, details? }`.
- **Timestamps** en ISO 8601.
- **Rate limit** activo en rutas públicas.
- **Sin secretos** en responses (`password`, `token`, `recovery_code`, etc.).
- **Pool y TZ** en Sequelize (UTC). Retries de conexión al iniciar si MySQL tarda en levantar.

---

## Entregables y commits por fase
1) `docs: inventory of models + relations`  
2) `docs(openapi): base spec + shared components`  
3) `feat(docs): swagger ui + openapi validator wired`  
4) `feat(app): commands/queries + mappers scaffolding`  
5) `refactor(service): switch to commands/queries for <dominio>`  
6) `feat(infra): repositories + orm mappers for <dominio>`  
7) `feat(http): controllers mapped to dto for <dominio>`  
8) `test(e2e): <dominio> happy + edge + pagination/sort`  
9) `docs(openapi): sync spec + examples for <dominio>`  
10) `docs: migration notes + deprecations`

---

## Acción
Ejecutá las fases en orden, **lote por lote**. No cambies rutas salvo necesidad contractual; si hay rompientes, versioná `/v2` y documentá deprecaciones en `docs/migration-notes.md`. El spec es la ley: si el middleware se queja, el contrato está roto y se corrige antes de mergear.
