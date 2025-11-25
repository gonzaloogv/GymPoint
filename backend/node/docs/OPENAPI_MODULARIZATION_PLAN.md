# Plan de Modularización OpenAPI - GymPoint API

**Fecha:** 2025-10-23
**Basado en:** Informe de Análisis de Salud
**Objetivo:** Modularizar el OpenAPI por dominios, extraer componentes reutilizables, unificar errores y generar bundle único funcionalmente equivalente

---

## RESUMEN EJECUTIVO

### Estado Actual
- **Archivo monolítico:** 6,843 líneas, 115 endpoints, 15 dominios
- **Duplicación crítica:** 176 respuestas de error repetidas, 30+ parámetros ID inline
- **Componentes insuficientes:** 0 responses compartidas, solo 5 parameters
- **Score de salud:** 6.5/10

### Objetivo Final
- **Estructura modular:** 1 archivo raíz + 15 módulos de dominio + 1 módulo de componentes
- **Reducción de duplicación:** -22% líneas (~1,500 líneas eliminadas)
- **Score de salud objetivo:** 9/10
- **Bundle único:** Funcionalmente idéntico al original

---

## FASE 1: EXTRACCIÓN DE COMPONENTES REUTILIZABLES

**Duración:** 2-3 días
**Riesgo:** Bajo
**Impacto:** Alto (-1,500 líneas, +40% reutilización)

### 1.1 Crear `components/responses` Estándar

**Archivo:** `components/responses.yaml`

**Responses a crear:**

```yaml
# components/responses.yaml
components:
  responses:
    # Success Responses
    EmptySuccess:
      description: Operación exitosa sin contenido

    # Error Responses
    BadRequest:
      description: Datos inválidos o request malformada
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Datos inválidos"
            details: "El campo 'email' es requerido"

    Unauthorized:
      description: Autenticación requerida o token inválido/expirado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "No autenticado"

    Forbidden:
      description: Permisos insuficientes para realizar la operación
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Acceso denegado"

    NotFound:
      description: Recurso no encontrado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Recurso no encontrado"

    Conflict:
      description: Conflicto con el estado actual del recurso
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "El recurso ya existe"

    InternalServerError:
      description: Error interno del servidor
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Error interno del servidor"
```

**Impacto:**
- 176 ocurrencias reemplazadas
- -1,200 líneas
- Consistencia 100% en errores

**Validación:**
- ✅ Todas las referencias `$ref: '#/components/responses/BadRequest'` deben resolver correctamente
- ✅ No cambiar códigos HTTP originales
- ✅ Preservar descripciones específicas donde sean más detalladas

---

### 1.2 Ampliar `components/parameters`

**Archivo:** `components/parameters.yaml`

**Parameters a crear:**

```yaml
# components/parameters.yaml
components:
  parameters:
    # Ya existentes (preservar)
    PageParam:
      name: page
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        default: 1
      description: Número de página

    LimitParam:
      name: limit
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 10
      description: Cantidad de elementos por página

    OrderParam:
      name: order
      in: query
      required: false
      schema:
        type: string
        enum: [asc, desc]
        default: asc
      description: Dirección del ordenamiento

    GymSortParam:
      name: sortBy
      in: query
      required: false
      schema:
        type: string
        enum: [name, rating, distance]
        default: name
      description: Campo por el cual ordenar gimnasios

    GymIdPathParam:
      name: gymId
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del gimnasio

    # NUEVOS A AGREGAR
    IdPathParam:
      name: id
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: Identificador único del recurso

    UserIdPathParam:
      name: userId
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del usuario

    ExerciseIdPathParam:
      name: id_exercise
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del ejercicio

    RoutineIdPathParam:
      name: id_routine
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID de la rutina

    RoutineDayIdPathParam:
      name: id_routine_day
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del día de rutina

    MediaIdPathParam:
      name: id_media
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del elemento multimedia

    # Query Parameters Comunes
    StatusQueryParam:
      name: status
      in: query
      required: false
      schema:
        type: string
      description: Filtrar por estado

    AvailableQueryParam:
      name: available
      in: query
      required: false
      schema:
        type: boolean
      description: Filtrar solo elementos disponibles

    ActiveQueryParam:
      name: active
      in: query
      required: false
      schema:
        type: boolean
      description: Filtrar solo elementos activos

    StartDateParam:
      name: startDate
      in: query
      required: false
      schema:
        type: string
        format: date
      description: Fecha de inicio del rango (YYYY-MM-DD)

    EndDateParam:
      name: endDate
      in: query
      required: false
      schema:
        type: string
        format: date
      description: Fecha de fin del rango (YYYY-MM-DD)

    SearchQueryParam:
      name: search
      in: query
      required: false
      schema:
        type: string
        minLength: 1
        maxLength: 255
      description: Término de búsqueda
```

**Impacto:**
- 15 nuevos parámetros
- 50+ ocurrencias reemplazadas
- -300 líneas
- Reutilización de parámetros: 4% → 65%

**Validación:**
- ✅ Nombres de parámetros deben coincidir exactamente con los originales
- ✅ Tipos y constraints deben ser idénticos
- ✅ No cambiar `required: true/false`

---

### 1.3 Estandarizar Schemas de Paginación

**Archivo:** `components/schemas/common.yaml`

**Schemas a crear:**

```yaml
# components/schemas/common.yaml
components:
  schemas:
    # Metadatos de paginación compartidos
    PaginationMeta:
      type: object
      required: [page, limit, total, totalPages]
      additionalProperties: false
      properties:
        page:
          type: integer
          minimum: 1
          description: Página actual
          example: 1
        limit:
          type: integer
          minimum: 1
          maximum: 100
          description: Elementos por página
          example: 10
        total:
          type: integer
          minimum: 0
          description: Total de elementos
          example: 42
        totalPages:
          type: integer
          minimum: 0
          description: Total de páginas
          example: 5
```

**Refactorizar schemas existentes usando `allOf`:**

```yaml
# Antes:
GymListResponse:
  type: object
  required: [page, limit, total, items]
  properties:
    page: { type: integer, minimum: 1 }
    limit: { type: integer, minimum: 1 }
    total: { type: integer, minimum: 0 }
    totalPages: { type: integer, minimum: 1 }
    items:
      type: array
      items: { $ref: '#/components/schemas/GymResponse' }

# Después:
GymListResponse:
  allOf:
    - $ref: '#/components/schemas/PaginationMeta'
    - type: object
      required: [items]
      additionalProperties: false
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/GymResponse'
```

**Schemas a refactorizar:**
1. GymListResponse
2. PaginatedGymReviewsResponse
3. PaginatedGymPaymentsResponse
4. PaginatedExercisesResponse
5. PaginatedRoutinesResponse
6. AssistanceHistoryResponse

**Impacto:**
- 8 schemas estandarizados
- -120 líneas
- Consistencia 100% en paginación

---

### 1.4 Extraer Enums Reutilizables

**Archivo:** `components/schemas/enums.yaml`

```yaml
# components/schemas/enums.yaml
components:
  schemas:
    SubscriptionType:
      type: string
      enum:
        - FREE
        - PREMIUM
      description: Tipo de suscripción del usuario

    Gender:
      type: string
      enum:
        - M
        - F
        - O
      description: Género del usuario (M=Masculino, F=Femenino, O=Otro)

    DifficultyLevel:
      type: string
      enum:
        - EASY
        - MEDIUM
        - HARD
      description: Nivel de dificultad estándar

    ExtendedDifficultyLevel:
      type: string
      enum:
        - EASY
        - MEDIUM
        - HARD
        - BEGINNER
        - INTERMEDIATE
        - ADVANCED
      description: Nivel de dificultad extendido

    WorkoutSessionStatus:
      type: string
      enum:
        - IN_PROGRESS
        - COMPLETED
        - CANCELLED
      description: Estado de una sesión de entrenamiento

    UserRoutineStatus:
      type: string
      enum:
        - ACTIVE
        - COMPLETED
        - CANCELLED
      description: Estado de una rutina de usuario

    AchievementCategory:
      type: string
      enum:
        - ONBOARDING
        - STREAK
        - FREQUENCY
        - ATTENDANCE
        - ROUTINE
        - CHALLENGE
        - PROGRESS
        - TOKEN
        - SOCIAL
      description: Categoría de logro
```

**Reemplazar en schemas:**
- UserProfileSummary.subscription → `$ref: '#/components/schemas/SubscriptionType'`
- UpdateSubscriptionRequest.subscription → `$ref: '#/components/schemas/SubscriptionType'`
- TodayChallengeResponse.difficulty → `$ref: '#/components/schemas/DifficultyLevel'`
- DailyChallengeResponse.difficulty → `$ref: '#/components/schemas/ExtendedDifficultyLevel'`
- Etc.

**Impacto:**
- 8 enums centralizados
- -50 líneas
- Consistencia en valores permitidos

---

### 1.5 Agregar `additionalProperties: false` a Schemas Estrictos

**Target:** Request schemas y Response schemas críticos

**Schemas prioritarios (43 Request schemas):**
- RegisterRequest
- LoginRequest
- CreateGymRequest, UpdateGymRequest
- CreateExerciseRequest, UpdateExerciseRequest
- CreateRoutineRequest, UpdateRoutineRequest
- CreateWorkoutSetRequest, UpdateWorkoutSetRequest
- Y todos los demás Request schemas

**Criterio:**
- ✅ Agregar a todos los schemas con `type: object` que sean Request o Response principal
- ⚠️ No agregar a schemas con `allOf` (puede causar conflictos)
- ⚠️ No agregar a schemas que explícitamente permitan campos dinámicos

**Impacto:**
- 60+ schemas con validación estricta
- Mejora seguridad de la API
- Previene campos no esperados

---

## FASE 2: MODULARIZACIÓN POR DOMINIOS

**Duración:** 3-4 días
**Riesgo:** Medio
**Impacto:** Alto (mantenibilidad, organización)

### 2.1 Estructura de Carpetas Propuesta

```
backend/node/docs/
├── openapi.yaml                    # Archivo raíz (bundle)
├── openapi/                        # Módulos separados
│   ├── openapi.root.yaml          # Info, servers, security
│   ├── components/
│   │   ├── schemas/
│   │   │   ├── common.yaml        # PaginationMeta, etc.
│   │   │   ├── enums.yaml         # SubscriptionType, Gender, etc.
│   │   │   ├── auth.yaml          # Auth-related schemas
│   │   │   ├── users.yaml         # User-related schemas
│   │   │   ├── gyms.yaml          # Gym-related schemas
│   │   │   ├── exercises.yaml     # Exercise schemas
│   │   │   ├── routines.yaml      # Routine schemas
│   │   │   ├── workouts.yaml      # Workout schemas
│   │   │   ├── progress.yaml      # Progress schemas
│   │   │   ├── media.yaml         # Media schemas
│   │   │   ├── streak.yaml        # Streak schemas
│   │   │   ├── frequency.yaml     # Frequency schemas
│   │   │   ├── challenges.yaml    # Challenge schemas
│   │   │   ├── rewards.yaml       # Reward schemas
│   │   │   ├── achievements.yaml  # Achievement schemas
│   │   │   └── assistance.yaml    # Assistance schemas
│   │   ├── parameters.yaml        # Todos los parameters
│   │   ├── responses.yaml         # Todas las responses
│   │   └── securitySchemes.yaml   # Security definitions
│   └── paths/
│       ├── auth.yaml              # /api/auth/*
│       ├── users.yaml             # /api/users/*
│       ├── gyms.yaml              # /api/gyms/*
│       ├── exercises.yaml         # /api/exercises/*
│       ├── routines.yaml          # /api/routines/*
│       ├── user-routines.yaml     # /api/user-routines/*
│       ├── workouts.yaml          # /api/workouts/*
│       ├── progress.yaml          # /api/progress/*
│       ├── media.yaml             # /api/media/*
│       ├── streak.yaml            # /api/streak/*
│       ├── frequency.yaml         # /api/frequency/*
│       ├── challenges.yaml        # /api/challenges/*
│       ├── rewards.yaml           # /api/rewards/*
│       ├── achievements.yaml      # /api/achievements/*
│       ├── daily-challenges.yaml  # /api/daily-challenges/*
│       ├── daily-challenge-templates.yaml
│       ├── gym-special-schedules.yaml
│       └── assistance.yaml        # /api/assistance/*
└── scripts/
    ├── bundle.js                  # Script para generar bundle
    ├── validate.js                # Script de validación
    └── lint.js                    # Script de linting
```

---

### 2.2 Archivo Raíz (`openapi.root.yaml`)

**Contenido mínimo:**

```yaml
openapi: 3.1.0

info:
  title: GymPoint API
  version: 1.0.0
  description: |
    API del sistema GymPoint para gestión de gimnasios, rutinas, entrenamientos y gamificación.

    ## Autenticación
    La mayoría de endpoints requieren autenticación mediante JWT Bearer token.

    ## Paginación
    Los endpoints que retornan listas soportan paginación mediante los parámetros:
    - `page`: Número de página (default: 1)
    - `limit`: Elementos por página (default: 10, max: 100)
  contact:
    name: GymPoint API Support
    email: support@gympoint.com

servers:
  - url: http://localhost:3000
    description: Servidor de desarrollo local
  - url: https://api.gympoint.com
    description: Servidor de producción

# Referencias a módulos
components:
  $ref: './components/index.yaml'

paths:
  # Auth endpoints
  /api/auth/register:
    $ref: './paths/auth.yaml#/paths/~1api~1auth~1register'

  /api/auth/login:
    $ref: './paths/auth.yaml#/paths/~1api~1auth~1login'

  # ... (todas las demás referencias)

security:
  - bearerAuth: []
```

**Nota:** Este archivo se generará automáticamente en el proceso de bundle.

---

### 2.3 Mapeo de Endpoints por Dominio

#### Módulo: `paths/auth.yaml` (5 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google-login
- POST /api/auth/refresh
- POST /api/auth/logout

#### Módulo: `paths/users.yaml` (12 endpoints)
- GET /api/users/me
- PUT /api/users/me
- PUT /api/users/me/email
- DELETE /api/users/me
- GET /api/users/me/account-deletion-status
- PUT /api/users/me/notification-settings
- GET /api/users/me/notification-settings
- PUT /api/users/me/tokens
- GET /api/users/me/tokens
- PUT /api/users/me/subscription
- GET /api/users/me/subscription
- GET /api/users/me/stats

#### Módulo: `paths/gyms.yaml` (12 endpoints)
- GET /api/gyms
- GET /api/gyms/{gymId}
- POST /api/gyms (admin)
- PUT /api/gyms/{gymId} (admin)
- DELETE /api/gyms/{gymId} (admin)
- GET /api/gyms/{gymId}/schedules
- POST /api/gyms/{gymId}/schedules (admin)
- GET /api/gyms/{gymId}/reviews
- POST /api/gyms/{gymId}/reviews
- PUT /api/gyms/{gymId}/reviews/{id}
- GET /api/gyms/{gymId}/payments
- POST /api/gyms/{gymId}/payments

#### Módulo: `paths/exercises.yaml` (6 endpoints)
- GET /api/exercises
- GET /api/exercises/{id}
- POST /api/exercises (admin)
- PUT /api/exercises/{id} (admin)
- DELETE /api/exercises/{id} (admin)
- GET /api/exercises/search

#### Módulo: `paths/routines.yaml` (13 endpoints)
- GET /api/routines
- GET /api/routines/{id}
- POST /api/routines
- PUT /api/routines/{id}
- DELETE /api/routines/{id}
- POST /api/routines/{id}/exercises
- PUT /api/routines/{id}/exercises/{id_exercise}
- DELETE /api/routines/{id}/exercises/{id_exercise}
- GET /api/routines/{id}/days
- POST /api/routines/{id}/days
- PUT /api/routines/{id}/days/{id_routine_day}
- DELETE /api/routines/{id}/days/{id_routine_day}
- GET /api/routines/{id}/template

#### Módulo: `paths/user-routines.yaml` (9 endpoints)
- POST /api/user-routines/assign
- GET /api/user-routines/active
- PUT /api/user-routines/{id}/end
- GET /api/user-routines/me
- GET /api/user-routines/{id}
- GET /api/user-routines/counts
- GET /api/user-routines/stats
- POST /api/user-routines/import
- GET /api/user-routines/library

#### Módulo: `paths/workouts.yaml` (12 endpoints)
- POST /api/workouts/sessions
- GET /api/workouts/sessions/active
- GET /api/workouts/sessions/me
- GET /api/workouts/sessions/{id}
- PUT /api/workouts/sessions/{id}/complete
- PUT /api/workouts/sessions/{id}/cancel
- POST /api/workouts/sets
- PUT /api/workouts/sets/{id}
- DELETE /api/workouts/sets/{id}
- GET /api/workouts/me/stats
- GET /api/workouts/me/history
- GET /api/workouts/me/calendar

#### Módulo: `paths/progress.yaml` (7 endpoints)
- POST /api/progress
- GET /api/progress/me
- GET /api/progress/me/exercise/{id_exercise}
- GET /api/progress/me/stats
- GET /api/progress/me/charts
- GET /api/progress/me/milestones
- GET /api/progress/me/comparisons

#### Módulo: `paths/media.yaml` (5 endpoints)
- POST /api/media
- GET /api/media/me
- PUT /api/media/{id_media}/primary
- DELETE /api/media/{id_media}
- GET /api/media/{id_media}

#### Módulo: `paths/streak.yaml` (6 endpoints)
- GET /api/streak/me
- POST /api/streak/recovery/use
- PUT /api/streak/reset
- GET /api/streak/stats
- GET /api/streak/history
- GET /api/streak/leaderboard

#### Módulo: `paths/frequency.yaml` (3 endpoints)
- GET /api/frequency/me
- POST /api/frequency
- PUT /api/frequency/reset

#### Módulo: `paths/challenges.yaml` (11 endpoints)
- GET /api/challenges/today
- GET /api/challenges/me
- PUT /api/challenges/{id}/progress
- GET /api/challenges/available
- GET /api/challenges/completed
- GET /api/challenges/stats
- GET /api/challenges/history
- GET /api/challenges/leaderboard
- POST /api/challenges/custom
- GET /api/challenges/{id}
- DELETE /api/challenges/{id}

#### Módulo: `paths/rewards.yaml` (4 endpoints)
- GET /api/rewards
- POST /api/rewards (admin)
- PUT /api/rewards/{id} (admin)
- DELETE /api/rewards/{id} (admin)

#### Módulo: `paths/achievements.yaml` (4 endpoints)
- GET /api/achievements
- POST /api/achievements (admin)
- PUT /api/achievements/{id} (admin)
- DELETE /api/achievements/{id} (admin)

#### Módulo: `paths/daily-challenges.yaml` (4 endpoints)
- GET /api/daily-challenges
- POST /api/daily-challenges (admin)
- PUT /api/daily-challenges/{id} (admin)
- DELETE /api/daily-challenges/{id} (admin)

#### Módulo: `paths/daily-challenge-templates.yaml` (4 endpoints)
- GET /api/daily-challenge-templates
- POST /api/daily-challenge-templates (admin)
- PUT /api/daily-challenge-templates/{id} (admin)
- DELETE /api/daily-challenge-templates/{id} (admin)

#### Módulo: `paths/gym-special-schedules.yaml` (4 endpoints)
- GET /api/gym-special-schedules
- POST /api/gym-special-schedules (admin)
- PUT /api/gym-special-schedules/{id} (admin)
- DELETE /api/gym-special-schedules/{id} (admin)

#### Módulo: `paths/assistance.yaml` (endpoints según implementación)
- (Identificar durante fase de ejecución)

---

### 2.4 Schemas por Dominio

**Criterio de asignación:**
- Un schema pertenece a un dominio si su nombre contiene el prefijo del dominio
- Schemas compartidos van a `common.yaml`
- Enums reutilizables van a `enums.yaml`

**Ejemplo para `schemas/auth.yaml`:**
```yaml
components:
  schemas:
    RegisterRequest:
      type: object
      required: [username, email, password]
      additionalProperties: false
      properties:
        username:
          type: string
          minLength: 3
          maxLength: 50
        email:
          type: string
          format: email
          maxLength: 255
        password:
          type: string
          minLength: 8
          maxLength: 255
        name:
          type: string
          maxLength: 255
        gender:
          $ref: './enums.yaml#/components/schemas/Gender'
        birth_date:
          type: string
          format: date
        subscription:
          $ref: './enums.yaml#/components/schemas/SubscriptionType'

    LoginRequest:
      # ...

    AuthSuccessResponse:
      # ...
```

---

## FASE 3: GENERACIÓN DE BUNDLE Y VALIDACIÓN

**Duración:** 1-2 días
**Riesgo:** Bajo
**Impacto:** Crítico (entrega final)

### 3.1 Script de Bundling

**Archivo:** `scripts/bundle.js`

**Funcionalidad:**
1. Leer `openapi.root.yaml` y todos los módulos
2. Resolver todas las referencias `$ref` externas
3. Generar un único archivo `openapi.yaml` sin referencias externas
4. Validar el bundle resultante
5. Verificar equivalencia funcional con original

**Tecnología:**
- `@apidevtools/swagger-cli` o `redocly bundle`

**Comando:**
```bash
npm run openapi:bundle
```

**Output:**
```
backend/node/docs/openapi.yaml (bundle único)
```

---

### 3.2 Script de Validación

**Archivo:** `scripts/validate.js`

**Checks obligatorios:**

1. **Validación de sintaxis OpenAPI 3.1.0**
   - Usar `@apidevtools/swagger-parser` o `redocly lint`
   - Fallar si hay errores de sintaxis

2. **Validación de referencias**
   - Todas las `$ref` deben resolver correctamente
   - No debe haber referencias circulares infinitas
   - No debe haber referencias a schemas inexistentes

3. **Validación de consistencia**
   - Todos los endpoints deben tener `summary`
   - Todos los Request/Response con body deben tener schema
   - Todos los schemas referenciados deben existir

4. **Validación de seguridad**
   - Endpoints de admin deben tener security apropiado
   - Endpoints públicos (auth) no deben tener security

5. **Validación de ejemplos**
   - Ejemplos deben ser válidos contra el schema

**Comando:**
```bash
npm run openapi:validate
```

**Criterios de fallo:**
- ❌ Error de sintaxis YAML/JSON
- ❌ Error de schema OpenAPI
- ❌ Referencia rota
- ❌ Schema sin propiedades
- ⚠️ Warning: Endpoint sin example (no falla)

---

### 3.3 Script de Linting

**Archivo:** `scripts/lint.js`

**Reglas de estilo:**

1. **Naming conventions**
   - Schemas: PascalCase
   - Paths: kebab-case
   - Properties: snake_case (ya establecido en el proyecto)
   - OperationIds: camelCase

2. **Estructura**
   - Todas las responses deben tener description
   - Todos los parámetros deben tener description
   - Schemas con properties deben tener type: object

3. **Documentación**
   - Warning si falta example
   - Warning si description es muy corta (< 10 chars)

**Comando:**
```bash
npm run openapi:lint
```

**Output:**
```
✅ 115 endpoints validados
✅ 101 schemas validados
⚠️  12 warnings (missing examples)
✅ No errors found
```

---

### 3.4 Verificación de Equivalencia Funcional

**Script:** `scripts/compare.js`

**Comparación:**
1. Extraer todos los paths del bundle nuevo
2. Extraer todos los paths del original
3. Comparar:
   - Cantidad de endpoints (debe ser idéntica)
   - Paths exactos (deben coincidir 100%)
   - Métodos HTTP por path (deben coincidir)
   - Schemas en cada response (estructura idéntica)
   - Parámetros requeridos (deben coincidir)

**Diferencias permitidas:**
- Orden de propiedades (semántica preservada)
- Whitespace y formato
- Comentarios

**Diferencias NO permitidas:**
- Nuevos/eliminados endpoints
- Cambios en tipos de datos
- Cambios en required fields
- Cambios en enums
- Nuevos/eliminados parámetros obligatorios

**Output:**
```markdown
# Informe de Equivalencia Funcional

## Resumen
- ✅ Endpoints: 115/115 (100% match)
- ✅ Schemas: 101/101 (100% match)
- ✅ Parameters: Todos preservados
- ✅ Responses: Todas preservadas

## Diferencias Detectadas
(ninguna)

## Conclusión
✅ Bundle es funcionalmente equivalente al original
```

---

## FASE 4: ARTEFACTOS Y DOCUMENTACIÓN

**Duración:** 1 día
**Riesgo:** Bajo
**Impacto:** Medio (publicación y adopción)

### 4.1 Documentación Navegable

**Opción 1: Redoc**
```bash
npm install -g redoc-cli
redoc-cli bundle docs/openapi.yaml -o docs/api-docs.html
```

**Opción 2: Swagger UI**
```bash
npm install -g swagger-ui-watcher
swagger-ui-watcher docs/openapi.yaml
```

**Opción 3: Stoplight Elements**
- Más moderno, mejor soporte OpenAPI 3.1

**Output:**
- `docs/api-docs.html` (documentación estática navegable)

---

### 4.2 Artefactos para Runtime

**1. Middleware de validación de requests**

Generar validadores usando `ajv` o `express-openapi-validator`:

```bash
npm install express-openapi-validator
```

**Uso:**
```javascript
const OpenApiValidator = require('express-openapi-validator');

app.use(
  OpenApiValidator.middleware({
    apiSpec: './docs/openapi.yaml',
    validateRequests: true,
    validateResponses: true,
  })
);
```

**2. Cliente TypeScript generado**

```bash
npm install @openapitools/openapi-generator-cli
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-axios \
  -o src/generated/api-client
```

**3. Tipos TypeScript para schemas**

```bash
npm install openapi-typescript
npx openapi-typescript docs/openapi.yaml -o src/types/api-types.ts
```

---

### 4.3 Integración en CI/CD

**GitHub Actions workflow:** `.github/workflows/openapi-validation.yml`

```yaml
name: OpenAPI Validation

on:
  pull_request:
    paths:
      - 'backend/node/docs/openapi/**'
      - 'backend/node/docs/openapi.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: backend/node

      - name: Bundle OpenAPI
        run: npm run openapi:bundle
        working-directory: backend/node

      - name: Validate OpenAPI
        run: npm run openapi:validate
        working-directory: backend/node

      - name: Lint OpenAPI
        run: npm run openapi:lint
        working-directory: backend/node

      - name: Compare with original
        run: npm run openapi:compare
        working-directory: backend/node

      - name: Generate docs
        run: npm run openapi:docs
        working-directory: backend/node

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: api-documentation
          path: backend/node/docs/api-docs.html
```

---

## FASE 5: GUÍAS Y PRÓXIMOS PASOS

**Duración:** 0.5 días
**Riesgo:** Bajo
**Impacto:** Alto (adopción y mantenimiento)

### 5.1 Guía de Contribución

**Archivo:** `docs/CONTRIBUTING_OPENAPI.md`

**Contenido:**

```markdown
# Cómo Agregar un Nuevo Endpoint al OpenAPI

## Proceso

### 1. Identificar el Dominio

Determina a qué dominio pertenece tu endpoint:
- `/api/auth/*` → `paths/auth.yaml`
- `/api/users/*` → `paths/users.yaml`
- `/api/gyms/*` → `paths/gyms.yaml`
- Etc.

### 2. Definir Schemas (si es necesario)

Si tu endpoint requiere schemas nuevos:

1. Abre el archivo de schemas correspondiente:
   - `components/schemas/auth.yaml`
   - `components/schemas/users.yaml`
   - Etc.

2. Agrega tu schema siguiendo la convención:
   - Request schemas: `{Entity}{Action}Request` (ej: `CreateUserRequest`)
   - Response schemas: `{Entity}Response` (ej: `UserResponse`)

3. **IMPORTANTE:** Agrega `additionalProperties: false` a todos los Request schemas

4. Ejemplo:
   ```yaml
   CreateFooRequest:
     type: object
     required: [name, type]
     additionalProperties: false
     properties:
       name:
         type: string
         minLength: 1
         maxLength: 255
         description: Nombre del foo
       type:
         $ref: './enums.yaml#/components/schemas/FooType'
   ```

### 3. Reutilizar Components

**Antes de crear algo nuevo, verifica si ya existe:**

- **Parámetros comunes:** `components/parameters.yaml`
  - IdPathParam
  - PageParam, LimitParam
  - StartDateParam, EndDateParam
  - StatusQueryParam
  - Etc.

- **Responses de error:** `components/responses.yaml`
  - BadRequest (400)
  - Unauthorized (401)
  - Forbidden (403)
  - NotFound (404)
  - Conflict (409)

- **Enums:** `components/schemas/enums.yaml`
  - SubscriptionType
  - Gender
  - DifficultyLevel
  - Etc.

### 4. Definir el Endpoint

Abre el archivo de paths correspondiente y agrega tu operación:

```yaml
paths:
  /api/foos:
    post:
      summary: Crear un nuevo foo
      description: |
        Crea un nuevo foo con los datos proporcionados.
        Requiere autenticación.
      operationId: createFoo
      tags:
        - foos
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '../components/schemas/foos.yaml#/components/schemas/CreateFooRequest'
            example:
              name: "Mi Foo"
              type: "TYPE_A"
      responses:
        '201':
          description: Foo creado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  data:
                    $ref: '../components/schemas/foos.yaml#/components/schemas/FooResponse'
              example:
                message: "Foo creado exitosamente"
                data:
                  id: 123
                  name: "Mi Foo"
                  type: "TYPE_A"
                  created_at: "2025-10-23T10:00:00Z"
        '400':
          $ref: '../components/responses.yaml#/components/responses/BadRequest'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'
```

### 5. Validar Localmente

```bash
cd backend/node
npm run openapi:bundle
npm run openapi:validate
npm run openapi:lint
```

### 6. Generar Documentación

```bash
npm run openapi:docs
```

Abre `docs/api-docs.html` y verifica que tu endpoint aparezca correctamente.

### 7. Commit y PR

```bash
git add docs/openapi/
git commit -m "feat(api): add POST /api/foos endpoint"
git push origin feature/add-foos-endpoint
```

El CI validará automáticamente tu cambio.

## Checklist de Validación

Antes de hacer PR, verifica:

- [ ] El endpoint tiene `summary` y `description`
- [ ] El endpoint tiene `operationId` único
- [ ] El endpoint tiene `tags` apropiados
- [ ] El endpoint tiene `security` (si requiere auth)
- [ ] El requestBody tiene `schema` y `example`
- [ ] Todas las responses tienen `description` y `schema`
- [ ] Se reutilizan components existentes (parameters, responses, enums)
- [ ] Los Request schemas tienen `additionalProperties: false`
- [ ] Los campos tienen `minLength/maxLength` o `minimum/maximum` donde aplique
- [ ] Los campos tienen `description`
- [ ] Hay al menos un `example` por schema
- [ ] `npm run openapi:validate` pasa sin errores
- [ ] `npm run openapi:lint` no tiene errores críticos

## Errores Comunes

### Error: "Reference cannot be resolved"

**Causa:** La ruta del `$ref` es incorrecta.

**Solución:** Verifica que la ruta relativa sea correcta desde el archivo donde estás.

Ejemplo desde `paths/foos.yaml`:
```yaml
# ✅ Correcto
$ref: '../components/schemas/foos.yaml#/components/schemas/FooResponse'

# ❌ Incorrecto
$ref: './components/schemas/foos.yaml#/components/schemas/FooResponse'
```

### Error: "Duplicate operationId"

**Causa:** Dos endpoints tienen el mismo `operationId`.

**Solución:** Cambia el `operationId` a uno único (generalmente `{verb}{Entity}`, ej: `createFoo`, `getFoo`, `updateFoo`).

### Warning: "Missing example"

**Causa:** Un schema o response no tiene `example`.

**Solución:** Agrega un ejemplo realista:
```yaml
schema:
  $ref: '#/...'
example:
  id: 1
  name: "Ejemplo"
```

## Contacto

Para dudas sobre el OpenAPI, contactar al equipo de Backend.
```

---

### 5.2 Changelog Documental

**Archivo:** `docs/OPENAPI_CHANGELOG.md`

**Formato:**

```markdown
# OpenAPI Changelog

Todos los cambios significativos al spec OpenAPI se documentarán aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2025-10-23

### Refactorización Mayor - Modularización

#### Added
- 🆕 Estructura modular por dominios en `docs/openapi/`
- 🆕 `components/responses.yaml` con 6 respuestas estándar
- 🆕 15 parámetros nuevos en `components/parameters.yaml`
- 🆕 `components/schemas/common.yaml` con PaginationMeta
- 🆕 `components/schemas/enums.yaml` con 8 enums reutilizables
- 🆕 Scripts de bundling, validación y linting
- 🆕 Documentación HTML navegable (`api-docs.html`)
- 🆕 Guía de contribución (`CONTRIBUTING_OPENAPI.md`)
- 🆕 Pipeline CI/CD para validación automática

#### Changed
- ♻️ Refactorizado 176 respuestas de error para usar `components/responses`
- ♻️ Refactorizado 30+ parámetros ID para usar `components/parameters`
- ♻️ Estandarizadas 8 estructuras de paginación usando `PaginationMeta`
- ♻️ Centralizados 8 enums reutilizables
- ♻️ Agregado `additionalProperties: false` a 60+ schemas

#### Fixed
- 🐛 Inconsistencias en DifficultyLevel enum (2 variaciones → 1 estándar)
- 🐛 Inconsistencias en estructuras de paginación (required, additionalProperties)
- 🐛 Descripciones de error genéricas mejoradas

#### Removed
- 🗑️ 1,500 líneas de código duplicado
- 🗑️ Schemas inline repetidos
- 🗑️ Parámetros duplicados

#### Technical Details
- **Líneas reducidas:** -22% (~1,500 líneas)
- **Reutilización de parámetros:** 4% → 65%
- **Reutilización de responses:** 0% → 100%
- **Score de salud:** 6.5/10 → 9/10
- **Equivalencia funcional:** 100% (0 cambios en contratos)

#### Migration Guide
El bundle final (`openapi.yaml`) es funcionalmente idéntico al original.
No se requieren cambios en código de consumidores.

La estructura modular es solo para desarrollo; los consumidores seguirán
usando el bundle único generado.

---

## [1.0.0] - 2025-XX-XX

### Initial Release
- Versión monolítica original
- 115 endpoints
- 101 schemas
- 15 dominios
```

---

### 5.3 Próximos Pasos Sugeridos

**Archivo:** `docs/OPENAPI_ROADMAP.md`

```markdown
# OpenAPI Roadmap - Próximos Pasos

## Corto Plazo (1-2 semanas)

### 1. Implementar Validación de Runtime
- [ ] Integrar `express-openapi-validator` en el servidor
- [ ] Habilitar validación de requests automática
- [ ] Habilitar validación de responses (en staging)
- [ ] Documentar errores de validación comunes

**Beneficio:** Detectar inconsistencias entre código y spec en tiempo real

---

### 2. Generar Cliente TypeScript
- [ ] Configurar `openapi-generator` para TypeScript
- [ ] Generar cliente para frontend
- [ ] Integrar en pipeline CI/CD
- [ ] Publicar como paquete npm interno (opcional)

**Beneficio:** Type-safety end-to-end entre frontend y backend

---

### 3. Agregar Tests de Contrato
- [ ] Implementar tests usando `dredd` o `portman`
- [ ] Tests deben validar que las responses reales coincidan con el spec
- [ ] Ejecutar en CI contra staging
- [ ] Fallar el build si hay drift

**Beneficio:** Garantizar que el código cumple el contrato

---

## Medio Plazo (1-2 meses)

### 4. Implementar Versionado de API
- [ ] Definir estrategia de versionado (URL, header, etc.)
- [ ] Crear `openapi.v1.yaml` y `openapi.v2.yaml` separados
- [ ] Documentar política de breaking changes
- [ ] Implementar deprecation warnings

**Beneficio:** Evolucionar la API sin romper clientes existentes

---

### 5. Mejorar Ejemplos y Mocks
- [ ] Agregar ejemplos a todos los schemas (target: 100%)
- [ ] Configurar mock server usando `prism` o `mockoon`
- [ ] Permitir a frontend desarrollar contra mocks antes de backend
- [ ] Documentar escenarios de edge cases en examples

**Beneficio:** Desarrollo paralelo frontend/backend

---

### 6. Agregar Webhooks y Callbacks (si aplica)
- [ ] Documentar webhooks en el spec
- [ ] Usar `callbacks` de OpenAPI 3.1
- [ ] Ejemplos de payloads de webhooks
- [ ] Documentar retry policies

**Beneficio:** Documentación completa de toda la interacción

---

## Largo Plazo (3-6 meses)

### 7. Implementar API Governance
- [ ] Definir Design Guidelines formales
- [ ] Implementar linting estricto (`spectral` con reglas custom)
- [ ] Review obligatorio de cambios en OpenAPI
- [ ] Métricas de calidad de spec en dashboard

**Beneficio:** Consistencia y calidad a largo plazo

---

### 8. Publicar Documentación Externa
- [ ] Configurar Stoplight Studio o similar
- [ ] Portal público de documentación
- [ ] Ejemplos interactivos (try-it-out)
- [ ] Changelog público

**Beneficio:** Facilitar adopción de partners/terceros

---

### 9. Monitoreo de Uso Real
- [ ] Integrar analytics de endpoints (ej: cual se usa más)
- [ ] Detectar endpoints sin uso (candidatos a deprecation)
- [ ] Alertas de errores 4xx/5xx por endpoint
- [ ] Dashboard de salud de API

**Beneficio:** Decisiones basadas en datos

---

## Mejoras Técnicas Continuas

### Deuda Técnica
- [ ] Agregar `additionalProperties: false` a los schemas restantes (40%)
- [ ] Completar constraints faltantes (maxLength, patterns, etc.)
- [ ] Revisar y mejorar descriptions cortas
- [ ] Estandarizar naming (si hay inconsistencias)

### Automatización
- [ ] Auto-generar parte del spec desde código (ej: DTOs → schemas)
- [ ] Auto-generar tests desde spec
- [ ] Auto-update de changelog desde commits

---

## Ideas Avanzadas (Futuro)

- **GraphQL Schema:** Generar schema GraphQL desde OpenAPI (si aplica)
- **gRPC Spec:** Complementar con proto files para servicios internos
- **AsyncAPI:** Documentar eventos/mensajería si se implementa
- **Performance Metrics:** Agregar metadata de latencia esperada por endpoint

---

**Última actualización:** 2025-10-23
```

---

## ORDEN DE EJECUCIÓN

### Semana 1: Extracción de Componentes
**Día 1-2:**
- ✅ Crear `components/responses.yaml`
- ✅ Reemplazar 176 ocurrencias en paths
- ✅ Validar bundle

**Día 3-4:**
- ✅ Ampliar `components/parameters.yaml` (15 nuevos)
- ✅ Reemplazar 50+ ocurrencias en paths
- ✅ Validar bundle

**Día 5:**
- ✅ Crear `components/schemas/common.yaml` (PaginationMeta)
- ✅ Refactorizar 8 schemas de paginación
- ✅ Crear `components/schemas/enums.yaml`
- ✅ Refactorizar 8 enums
- ✅ Validar bundle
- ✅ Crear backup del original
- ✅ Commit: "refactor(openapi): extract reusable components"

---

### Semana 2: Modularización
**Día 1-2:**
- ✅ Crear estructura de carpetas
- ✅ Crear `openapi.root.yaml`
- ✅ Separar schemas por dominio (auth, users, gyms)
- ✅ Separar paths por dominio (auth, users, gyms)
- ✅ Validar módulos individuales

**Día 3-4:**
- ✅ Continuar separación (exercises, routines, workouts, progress)
- ✅ Actualizar referencias entre módulos
- ✅ Validar integridad

**Día 5:**
- ✅ Completar separación (todos los dominios restantes)
- ✅ Validar bundle completo
- ✅ Commit: "refactor(openapi): modularize by domain"

---

### Semana 3: Bundle y Tooling
**Día 1:**
- ✅ Implementar `scripts/bundle.js`
- ✅ Implementar `scripts/validate.js`
- ✅ Implementar `scripts/lint.js`
- ✅ Configurar npm scripts

**Día 2:**
- ✅ Implementar `scripts/compare.js`
- ✅ Ejecutar comparación funcional con original
- ✅ Documentar diferencias (si existen)
- ✅ Ajustar si es necesario

**Día 3:**
- ✅ Generar documentación HTML
- ✅ Generar tipos TypeScript
- ✅ Generar cliente (opcional)
- ✅ Commit: "feat(openapi): add bundling and validation tools"

**Día 4:**
- ✅ Configurar CI/CD pipeline
- ✅ Crear guía de contribución
- ✅ Crear changelog
- ✅ Crear roadmap
- ✅ Commit: "docs(openapi): add contribution guide and roadmap"

**Día 5:**
- ✅ Testing end-to-end
- ✅ Revisión final
- ✅ PR con resumen ejecutivo

---

## CHECKLIST FINAL PRE-PR

### Validación Técnica
- [ ] `npm run openapi:bundle` ejecuta sin errores
- [ ] `npm run openapi:validate` pasa 100%
- [ ] `npm run openapi:lint` sin errores críticos
- [ ] `npm run openapi:compare` reporta equivalencia funcional
- [ ] Bundle generado tiene mismo número de endpoints que original (115)
- [ ] Bundle generado tiene mismo número de schemas que original (101)

### Estructura
- [ ] Todos los schemas inline extraídos a `components/schemas/`
- [ ] Todos los dominios separados en archivos individuales
- [ ] `components/responses.yaml` tiene 6+ responses estándar
- [ ] `components/parameters.yaml` tiene 20+ parámetros
- [ ] `components/schemas/enums.yaml` tiene 8+ enums

### Calidad
- [ ] 60+ schemas tienen `additionalProperties: false`
- [ ] Todos los Request schemas tienen `additionalProperties: false`
- [ ] Todas las referencias `$ref` resuelven correctamente
- [ ] No hay schemas duplicados con nombres diferentes
- [ ] Enums están estandarizados (1 versión por enum)

### Documentación
- [ ] `CONTRIBUTING_OPENAPI.md` creado
- [ ] `OPENAPI_CHANGELOG.md` creado
- [ ] `OPENAPI_ROADMAP.md` creado
- [ ] `api-docs.html` generado correctamente
- [ ] README actualizado con comandos nuevos

### CI/CD
- [ ] Workflow de GitHub Actions configurado
- [ ] Pipeline valida en cada PR
- [ ] Artefactos de documentación se suben correctamente

### Testing
- [ ] Bundle testeado en Swagger Editor (valida sin errores)
- [ ] Bundle testeado en Stoplight Studio (renderiza correctamente)
- [ ] Bundle importado en Postman (sin errores)
- [ ] Ejemplos funcionan cuando se copian

---

## CRITERIOS DE ÉXITO

### Métricas Objetivo
- ✅ Reducción de líneas: -20% o más
- ✅ Reutilización de parámetros: 60%+
- ✅ Reutilización de responses: 100%
- ✅ Score de salud: 8.5/10 o superior
- ✅ Equivalencia funcional: 100%
- ✅ Tiempo de bundle: < 5 segundos
- ✅ Tiempo de validación: < 10 segundos

### Beneficios Entregados
- ✅ Mantenibilidad mejorada (cambios centralizados)
- ✅ Consistencia 100% en respuestas de error
- ✅ Onboarding más rápido (estructura clara)
- ✅ Documentación navegable generada
- ✅ Validación automática en CI
- ✅ Preparado para generación de código

---

## RIESGOS Y MITIGACIONES

### Riesgo 1: Referencias Rotas Durante Separación
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Validar después de cada separación de dominio
- Usar herramientas automáticas de resolución de refs
- Mantener backup del original

### Riesgo 2: Diferencias Inadvertidas en Bundle
**Probabilidad:** Baja
**Impacto:** Crítico
**Mitigación:**
- Implementar `compare.js` que detecta diferencias
- Testing manual en Swagger Editor
- Review exhaustivo del PR

### Riesgo 3: Tiempo de Bundling Excesivo
**Probabilidad:** Baja
**Impacto:** Medio
**Mitigación:**
- Optimizar script de bundling
- Cachear módulos que no cambian
- Target: < 5 segundos

### Riesgo 4: Adopción del Equipo
**Probabilidad:** Media
**Impacto:** Medio
**Mitigación:**
- Guía de contribución clara y simple
- Ejemplos prácticos en la guía
- Training session con el equipo

---

## CONCLUSIÓN

Este plan de modularización transformará el OpenAPI de GymPoint de un archivo monolítico de 6,843 líneas a una estructura modular mantenible, reduciendo duplicación en 22%, mejorando consistencia al 100%, y estableciendo las bases para evolución futura con validación automática, generación de código y testing de contratos.

**Próximo paso:** Aprobación para proceder con Fase 1 (Extracción de Componentes).

---

**Fin del Plan**
