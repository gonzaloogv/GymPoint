# Cómo Agregar Rutas Nuevas al OpenAPI

**Guía paso a paso con ejemplos reales**

---

## 🎯 Proceso Completo

### Paso 1: Identificar el Dominio

**Pregunta:** ¿A qué dominio pertenece tu nueva ruta?

**Ejemplos:**
- `/api/auth/verify-email` → Dominio: **auth**
- `/api/users/me/settings` → Dominio: **users**
- `/api/gyms/{gymId}/classes` → Dominio: **gyms**
- `/api/workouts/templates` → Dominio: **workouts**

**Mapeo de dominios existentes:**

| Prefijo de Ruta | Dominio | Archivo |
|-----------------|---------|---------|
| `/api/auth/*` | auth | `openapi/paths/auth.yaml` |
| `/api/users/*` | users | `openapi/paths/users.yaml` |
| `/api/gyms/*` | gyms | `openapi/paths/gyms.yaml` |
| `/api/exercises/*` | exercises | `openapi/paths/exercises.yaml` |
| `/api/routines/*` | routines | `openapi/paths/routines.yaml` |
| `/api/user-routines/*` | user-routines | `openapi/paths/user-routines.yaml` |
| `/api/workouts/*` | workouts | `openapi/paths/workouts.yaml` |
| `/api/progress/*` | progress | `openapi/paths/progress.yaml` |
| `/api/media/*` | media | `openapi/paths/media.yaml` |
| `/api/streak/*` | streak | `openapi/paths/streak.yaml` |
| `/api/frequency/*` | frequency | `openapi/paths/frequency.yaml` |
| `/api/challenges/*` | challenges | `openapi/paths/challenges.yaml` |
| `/api/rewards/*` | rewards | `openapi/paths/rewards.yaml` |
| `/api/achievements/*` | achievements | `openapi/paths/achievements.yaml` |

**Si tu ruta NO encaja en ningún dominio existente:**
→ Crear nuevo dominio (ver Caso 4 más abajo)

---

## 📝 Caso 1: Agregar Ruta a Dominio Existente (LO MÁS COMÚN)

### Ejemplo: Agregar `POST /api/users/me/avatar`

#### 1.1. Crear los Schemas (si son nuevos)

**Archivo:** `openapi/components/schemas/users.yaml`

```yaml
# Agregar al final del archivo, antes del cierre
components:
  schemas:
    # ... schemas existentes ...

    UpdateAvatarRequest:
      type: object
      required:
        - avatar_url
      additionalProperties: false
      properties:
        avatar_url:
          type: string
          format: uri
          maxLength: 500
          description: URL de la imagen del avatar
          example: "https://cdn.gympoint.com/avatars/user123.jpg"

    AvatarUpdateResponse:
      type: object
      required:
        - id_user_profile
        - avatar_url
        - updated_at
      additionalProperties: false
      properties:
        id_user_profile:
          type: integer
          description: ID del perfil de usuario
          example: 42
        avatar_url:
          type: string
          format: uri
          description: URL del nuevo avatar
          example: "https://cdn.gympoint.com/avatars/user123.jpg"
        updated_at:
          type: string
          format: date-time
          description: Fecha de actualización
          example: "2025-10-23T10:30:00Z"
```

#### 1.2. Agregar el Endpoint

**Archivo:** `openapi/paths/users.yaml`

```yaml
paths:
  # ... paths existentes ...

  /api/users/me/avatar:
    post:
      summary: Actualizar avatar del usuario
      description: |
        Permite al usuario actualizar la URL de su avatar.
        Requiere autenticación.
      operationId: updateUserAvatar
      tags:
        - users
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '../components/schemas/users.yaml#/components/schemas/UpdateAvatarRequest'
            example:
              avatar_url: "https://cdn.gympoint.com/avatars/user123.jpg"
      responses:
        '200':
          description: Avatar actualizado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Avatar actualizado exitosamente"
                  data:
                    $ref: '../components/schemas/users.yaml#/components/schemas/AvatarUpdateResponse'
              example:
                message: "Avatar actualizado exitosamente"
                data:
                  id_user_profile: 42
                  avatar_url: "https://cdn.gympoint.com/avatars/user123.jpg"
                  updated_at: "2025-10-23T10:30:00Z"
        '400':
          $ref: '../components/responses.yaml#/components/responses/BadRequest'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'
        '404':
          $ref: '../components/responses.yaml#/components/responses/NotFound'
```

#### 1.3. Regenerar Bundle

```bash
cd backend/node/docs
node scripts/bundle.js
```

**Output esperado:**
```
✅ Bundle generado exitosamente!
📊 Estadísticas del bundle:
  • Schemas:     115  (antes: 113)
  • Operations:  111  (antes: 110)
```

#### 1.4. Validar

```bash
node scripts/validate.js
```

**Output esperado:**
```
✅ Validación exitosa!
```

#### 1.5. Verificar en Swagger UI

```bash
npm run dev
```

Abrí: `http://localhost:3000/docs`

Deberías ver tu nuevo endpoint en la sección "users".

---

## 📝 Caso 2: Agregar Ruta con Parámetros de Path

### Ejemplo: Agregar `GET /api/gyms/{gymId}/instructors/{instructorId}`

#### 2.1. Usar Parámetros Existentes

**Verifica primero si ya existen:**

```bash
# Ver parámetros disponibles
cat openapi/components/parameters.yaml
```

**Parámetros disponibles:**
- `IdPathParam` - ID genérico
- `GymIdPathParam` - ID de gimnasio
- `UserIdPathParam` - ID de usuario
- etc.

**Si el parámetro NO existe, créalo:**

```yaml
# openapi/components/parameters.yaml
components:
  parameters:
    # ... parámetros existentes ...

    InstructorIdPathParam:
      name: instructorId
      in: path
      required: true
      schema:
        type: integer
        minimum: 1
      description: ID del instructor
```

#### 2.2. Crear Schema de Response

```yaml
# openapi/components/schemas/gyms.yaml
components:
  schemas:
    # ... schemas existentes ...

    InstructorResponse:
      type: object
      required:
        - id_instructor
        - name
        - specialties
      additionalProperties: false
      properties:
        id_instructor:
          type: integer
          example: 5
        name:
          type: string
          maxLength: 100
          example: "Juan Pérez"
        specialties:
          type: array
          items:
            type: string
          example: ["CrossFit", "Yoga"]
        bio:
          type: string
          maxLength: 500
          example: "Instructor certificado con 10 años de experiencia"
        avatar_url:
          type: string
          format: uri
          example: "https://cdn.gympoint.com/instructors/juan.jpg"
```

#### 2.3. Agregar el Endpoint

```yaml
# openapi/paths/gyms.yaml
paths:
  # ... paths existentes ...

  /api/gyms/{gymId}/instructors/{instructorId}:
    get:
      summary: Obtener instructor de un gimnasio
      description: Retorna información detallada de un instructor específico
      operationId: getGymInstructor
      tags:
        - gyms
      security:
        - bearerAuth: []
      parameters:
        - $ref: '../components/parameters.yaml#/components/parameters/GymIdPathParam'
        - $ref: '../components/parameters.yaml#/components/parameters/InstructorIdPathParam'
      responses:
        '200':
          description: Instructor encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '../components/schemas/gyms.yaml#/components/schemas/InstructorResponse'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'
        '404':
          $ref: '../components/responses.yaml#/components/responses/NotFound'
```

#### 2.4. Regenerar y Validar

```bash
node scripts/bundle.js && node scripts/validate.js
```

---

## 📝 Caso 3: Agregar Ruta con Query Parameters

### Ejemplo: Agregar `GET /api/workouts/sessions?status=COMPLETED&startDate=2025-01-01`

#### 3.1. Usar Query Parameters Existentes

**Verificar disponibles:**

```bash
grep "QueryParam" openapi/components/parameters.yaml
```

**Disponibles:**
- `StatusQueryParam`
- `StartDateParam`
- `EndDateParam`
- `PageParam`
- `LimitParam`
- `SearchQueryParam`
- etc.

#### 3.2. Agregar el Endpoint

```yaml
# openapi/paths/workouts.yaml
paths:
  # ... paths existentes ...

  /api/workouts/sessions:
    get:
      summary: Listar sesiones de entrenamiento
      description: |
        Retorna las sesiones de entrenamiento del usuario autenticado.
        Permite filtrar por estado y rango de fechas.
      operationId: getUserWorkoutSessions
      tags:
        - workouts
      security:
        - bearerAuth: []
      parameters:
        - $ref: '../components/parameters.yaml#/components/parameters/StatusQueryParam'
        - $ref: '../components/parameters.yaml#/components/parameters/StartDateParam'
        - $ref: '../components/parameters.yaml#/components/parameters/EndDateParam'
        - $ref: '../components/parameters.yaml#/components/parameters/PageParam'
        - $ref: '../components/parameters.yaml#/components/parameters/LimitParam'
      responses:
        '200':
          description: Lista de sesiones
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '../components/common.yaml#/components/schemas/PaginationMeta'
                  - type: object
                    required:
                      - items
                    properties:
                      items:
                        type: array
                        items:
                          $ref: '../components/schemas/workouts.yaml#/components/schemas/WorkoutSession'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'
```

---

## 📝 Caso 4: Crear Nuevo Dominio (Ruta que NO encaja en existentes)

### Ejemplo: Agregar `/api/nutrition/*` (nuevo dominio)

#### 4.1. Crear Archivo de Schemas

```bash
# Crear nuevo archivo
touch openapi/components/schemas/nutrition.yaml
```

```yaml
# openapi/components/schemas/nutrition.yaml
components:
  schemas:
    MealPlanResponse:
      type: object
      required:
        - id_meal_plan
        - name
        - calories_target
      additionalProperties: false
      properties:
        id_meal_plan:
          type: integer
          example: 1
        name:
          type: string
          maxLength: 100
          example: "Plan de definición"
        calories_target:
          type: integer
          minimum: 1000
          maximum: 5000
          example: 2500
        protein_grams:
          type: integer
          example: 150
        carbs_grams:
          type: integer
          example: 200
        fats_grams:
          type: integer
          example: 80

    CreateMealPlanRequest:
      type: object
      required:
        - name
        - calories_target
      additionalProperties: false
      properties:
        name:
          type: string
          minLength: 3
          maxLength: 100
        calories_target:
          type: integer
          minimum: 1000
          maximum: 5000
        protein_grams:
          type: integer
          minimum: 0
        carbs_grams:
          type: integer
          minimum: 0
        fats_grams:
          type: integer
          minimum: 0
```

#### 4.2. Crear Archivo de Paths

```bash
touch openapi/paths/nutrition.yaml
```

```yaml
# openapi/paths/nutrition.yaml
paths:
  /api/nutrition/meal-plans:
    get:
      summary: Listar planes de alimentación
      description: Retorna los planes de alimentación del usuario
      operationId: getUserMealPlans
      tags:
        - nutrition
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Lista de planes
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '../components/schemas/nutrition.yaml#/components/schemas/MealPlanResponse'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'

    post:
      summary: Crear plan de alimentación
      description: Crea un nuevo plan de alimentación para el usuario
      operationId: createMealPlan
      tags:
        - nutrition
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '../components/schemas/nutrition.yaml#/components/schemas/CreateMealPlanRequest'
      responses:
        '201':
          description: Plan creado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  data:
                    $ref: '../components/schemas/nutrition.yaml#/components/schemas/MealPlanResponse'
        '400':
          $ref: '../components/responses.yaml#/components/responses/BadRequest'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'

  /api/nutrition/meal-plans/{id}:
    get:
      summary: Obtener plan de alimentación
      operationId: getMealPlan
      tags:
        - nutrition
      security:
        - bearerAuth: []
      parameters:
        - $ref: '../components/parameters.yaml#/components/parameters/IdPathParam'
      responses:
        '200':
          description: Plan encontrado
          content:
            application/json:
              schema:
                $ref: '../components/schemas/nutrition.yaml#/components/schemas/MealPlanResponse'
        '401':
          $ref: '../components/responses.yaml#/components/responses/Unauthorized'
        '404':
          $ref: '../components/responses.yaml#/components/responses/NotFound'
```

#### 4.3. El Script Detecta Automáticamente

**El script `bundle.js` detecta automáticamente:**
- Nuevos archivos en `openapi/components/schemas/`
- Nuevos archivos en `openapi/paths/`

**NO necesitas modificar bundle.js** ✅

#### 4.4. Regenerar Bundle

```bash
node scripts/bundle.js
```

**Output:**
```
📥 Cargando schemas por dominio...

  ✓ schemas/auth.yaml
  ✓ schemas/users.yaml
  ✓ schemas/nutrition.yaml  ⬅️ NUEVO DETECTADO AUTOMÁTICAMENTE
  ...

📥 Cargando paths por dominio...

  ✓ paths/auth.yaml
  ✓ paths/users.yaml
  ✓ paths/nutrition.yaml  ⬅️ NUEVO DETECTADO AUTOMÁTICAMENTE
  ...

✅ Bundle generado exitosamente!
  • Schemas:     116 (antes: 113)
  • Paths:       79 (antes: 76)
  • Operations:  113 (antes: 110)
```

---

## ✅ Checklist para Agregar Rutas

### Antes de Empezar
- [ ] Identificar el dominio correcto
- [ ] Verificar si los schemas ya existen
- [ ] Verificar si los parameters ya existen
- [ ] Leer rutas similares como ejemplo

### Durante la Creación
- [ ] Schema Request tiene `additionalProperties: false`
- [ ] Schema Request tiene `required` con campos obligatorios
- [ ] Campos tienen validaciones (`minLength`, `maxLength`, `minimum`, etc.)
- [ ] Campos tienen `description` y `example`
- [ ] Endpoint tiene `summary` y `description`
- [ ] Endpoint tiene `operationId` único (camelCase)
- [ ] Endpoint tiene `tags` apropiados
- [ ] Endpoint tiene `security` si requiere auth
- [ ] Todas las responses tienen schema
- [ ] Se reutilizan `components/responses` para errores comunes

### Después de Crear
- [ ] Ejecutar `node scripts/bundle.js`
- [ ] Ejecutar `node scripts/validate.js`
- [ ] Ejecutar `node scripts/lint.js`
- [ ] Verificar en Swagger UI (`/docs`)
- [ ] Probar el endpoint en Postman/curl
- [ ] Verificar que la validación funcione (enviar datos inválidos)

---

## 🚀 Comandos Rápidos

```bash
# 1. Editar archivos
code openapi/paths/users.yaml
code openapi/components/schemas/users.yaml

# 2. Regenerar bundle
npm run openapi:bundle
# O manualmente:
node scripts/bundle.js

# 3. Validar
npm run openapi:validate
# O manualmente:
node scripts/validate.js

# 4. Lint (opcional)
npm run openapi:lint
# O manualmente:
node scripts/lint.js

# 5. Ver en Swagger UI
npm run dev
# Abrir: http://localhost:3000/docs
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Reference cannot be resolved"

```
Error: $ref: '../components/schemas/user.yaml#/...' cannot be resolved
```

**Causa:** Ruta de referencia incorrecta

**Solución:**
```yaml
# ❌ Incorrecto (falta 's')
$ref: '../components/schemas/user.yaml#/...'

# ✅ Correcto
$ref: '../components/schemas/users.yaml#/...'
```

### Error: "Duplicate operationId"

```
Error: Duplicate operationId 'getUser'
```

**Causa:** Dos endpoints tienen el mismo operationId

**Solución:** Cambiar a un ID único
```yaml
# Antes
operationId: getUser

# Después
operationId: getUserProfile
```

### Error: "Schema not found"

```
Error: Schema 'UpdateAvatarRequest' not found
```

**Causa:** Olvidaste agregar el schema

**Solución:** Agregar el schema a `openapi/components/schemas/{dominio}.yaml`

### Warning: "Missing example"

```
Warning: Schema 'UpdateAvatarRequest' missing example
```

**Solución:** Agregar ejemplo a cada propiedad
```yaml
properties:
  avatar_url:
    type: string
    example: "https://cdn.gympoint.com/avatars/user.jpg"  # ⬅️ AGREGAR
```

---

## 📚 Ejemplos Completos por Tipo de Ruta

### GET con Paginación

```yaml
/api/exercises:
  get:
    summary: Listar ejercicios
    parameters:
      - $ref: '../components/parameters.yaml#/components/parameters/PageParam'
      - $ref: '../components/parameters.yaml#/components/parameters/LimitParam'
      - $ref: '../components/parameters.yaml#/components/parameters/SearchQueryParam'
    responses:
      '200':
        content:
          application/json:
            schema:
              allOf:
                - $ref: '../components/common.yaml#/components/schemas/PaginationMeta'
                - type: object
                  properties:
                    items:
                      type: array
                      items:
                        $ref: '../components/schemas/exercises.yaml#/components/schemas/Exercise'
```

### POST con Request Body

```yaml
/api/workouts/sessions:
  post:
    summary: Crear sesión de entrenamiento
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '../components/schemas/workouts.yaml#/components/schemas/CreateWorkoutSessionRequest'
    responses:
      '201':
        description: Sesión creada
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                data:
                  $ref: '../components/schemas/workouts.yaml#/components/schemas/WorkoutSession'
```

### PUT de Actualización

```yaml
/api/users/me:
  put:
    summary: Actualizar perfil
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '../components/schemas/users.yaml#/components/schemas/UpdateUserProfileRequest'
    responses:
      '200':
        description: Perfil actualizado
      '400':
        $ref: '../components/responses.yaml#/components/responses/BadRequest'
      '401':
        $ref: '../components/responses.yaml#/components/responses/Unauthorized'
```

### DELETE

```yaml
/api/media/{id_media}:
  delete:
    summary: Eliminar medio
    parameters:
      - $ref: '../components/parameters.yaml#/components/parameters/MediaIdPathParam'
    responses:
      '204':
        description: Medio eliminado exitosamente
      '401':
        $ref: '../components/responses.yaml#/components/responses/Unauthorized'
      '404':
        $ref: '../components/responses.yaml#/components/responses/NotFound'
```

---

## 🎓 Tips Avanzados

### 1. Reutilizar Schemas Parciales

```yaml
# Si varios Request tienen campos comunes
BaseUserFields:
  type: object
  properties:
    name:
      type: string
    email:
      type: string
      format: email

CreateUserRequest:
  allOf:
    - $ref: '#/components/schemas/BaseUserFields'
    - type: object
      required:
        - password
      properties:
        password:
          type: string
```

### 2. Usar Enums para Estados

```yaml
# Si el estado es específico del dominio, créalo en el archivo del dominio
# openapi/components/schemas/workouts.yaml
WorkoutSessionStatus:
  type: string
  enum:
    - IN_PROGRESS
    - COMPLETED
    - CANCELLED

# Usar en el schema
WorkoutSession:
  properties:
    status:
      $ref: '#/components/schemas/WorkoutSessionStatus'
```

### 3. Documentar Casos de Uso

```yaml
/api/gyms/{gymId}/check-in:
  post:
    summary: Check-in en gimnasio
    description: |
      Registra el ingreso del usuario al gimnasio.

      **Casos de uso:**
      - Usuario escanea QR del gimnasio
      - Sistema verifica suscripción activa
      - Se registra asistencia para racha y frecuencia

      **Validaciones:**
      - Usuario debe tener suscripción activa
      - No puede hacer check-in dos veces el mismo día
      - Gimnasio debe estar abierto según horarios
```

---

**¿Necesitás ayuda con algún caso específico de ruta que querés agregar?**
