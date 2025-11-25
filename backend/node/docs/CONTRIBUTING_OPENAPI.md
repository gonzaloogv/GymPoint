# Guía de Contribución - OpenAPI GymPoint

**Última actualización:** 2025-10-23

Esta guía te enseña cómo trabajar con el OpenAPI modularizado de GymPoint.

---

## 📁 Estructura del Proyecto

```
backend/node/docs/
├── openapi.yaml                    # ⭐ Bundle único (generado automáticamente)
├── openapi.original.yaml           # Backup del original
├── api-docs.html                   # Documentación navegable
├── openapi/                        # 📂 Módulos (EDITA AQUÍ)
│   ├── components/
│   │   ├── common.yaml             # Enums y schemas comunes
│   │   ├── parameters.yaml         # Parámetros reutilizables
│   │   ├── responses.yaml          # Respuestas HTTP estándar
│   │   ├── securitySchemes.yaml    # Configuración de seguridad
│   │   └── schemas/                # Schemas por dominio
│   │       ├── auth.yaml
│   │       ├── users.yaml
│   │       ├── gyms.yaml
│   │       └── ...
│   └── paths/                      # Endpoints por dominio
│       ├── auth.yaml
│       ├── users.yaml
│       ├── gyms.yaml
│       └── ...
└── scripts/
    ├── bundle.js                   # Genera bundle único
    ├── validate.js                 # Valida sintaxis
    ├── lint.js                     # Verifica calidad
    └── compare.js                  # Compara con original
```

---

## 🚀 Quick Start

### 1. Hacer un Cambio

```bash
# Editar schemas de un dominio
code backend/node/docs/openapi/components/schemas/users.yaml

# Editar endpoints de un dominio
code backend/node/docs/openapi/paths/users.yaml
```

### 2. Regenerar Bundle

```bash
cd backend/node/docs
node scripts/bundle.js
```

**Output esperado:**
```
✅ Bundle generado exitosamente!
  • Schemas:     113
  • Parameters:  20
  • Responses:   6
  • Paths:       76
  • Operations:  110
```

### 3. Validar

```bash
# Validar sintaxis
node scripts/validate.js

# Lint de calidad
node scripts/lint.js
```

### 4. Generar Documentación

```bash
npx @redocly/cli build-docs openapi.yaml --output api-docs.html
```

---

## ✏️ Cómo Agregar un Nuevo Endpoint

### Paso 1: Identificar el Dominio

Determina a qué dominio pertenece tu endpoint:
- `/api/auth/*` → `paths/auth.yaml`
- `/api/users/*` → `paths/users.yaml`
- `/api/gyms/*` → `paths/gyms.yaml`
- etc.

### Paso 2: Definir Schemas (si es necesario)

Si tu endpoint requiere schemas nuevos:

1. Abre el archivo de schemas correspondiente:
   ```bash
   code backend/node/docs/openapi/components/schemas/users.yaml
   ```

2. Agrega tu schema siguiendo la convención:
   ```yaml
   CreateFooRequest:
     type: object
     required:
       - name
     additionalProperties: false
     properties:
       name:
         type: string
         minLength: 1
         maxLength: 255
         description: Nombre del foo
       type:
         $ref: '../common.yaml#/components/schemas/FooType'
   ```

### Paso 3: Reutilizar Components

**ANTES de crear algo nuevo, verifica si ya existe:**

#### Parameters Comunes
```yaml
# En paths/users.yaml
parameters:
  - $ref: '../components/parameters.yaml#/components/parameters/IdPathParam'
  - $ref: '../components/parameters.yaml#/components/parameters/PageParam'
  - $ref: '../components/parameters.yaml#/components/parameters/LimitParam'
```

**Parámetros disponibles:**
- IdPathParam, UserIdPathParam, GymIdPathParam, etc.
- PageParam, LimitParam, OrderParam
- StartDateParam, EndDateParam
- StatusQueryParam, AvailableQueryParam, ActiveQueryParam

#### Responses de Error
```yaml
responses:
  '400':
    $ref: '../components/responses.yaml#/components/responses/BadRequest'
  '401':
    $ref: '../components/responses.yaml#/components/responses/Unauthorized'
  '404':
    $ref: '../components/responses.yaml#/components/responses/NotFound'
```

**Responses disponibles:**
- BadRequest (400)
- Unauthorized (401)
- Forbidden (403)
- NotFound (404)
- Conflict (409)
- InternalServerError (500)

#### Enums
```yaml
# En schemas
gender:
  $ref: '../common.yaml#/components/schemas/Gender'
subscription:
  $ref: '../common.yaml#/components/schemas/SubscriptionType'
difficulty:
  $ref: '../common.yaml#/components/schemas/DifficultyLevel'
```

**Enums disponibles:**
- Gender, SubscriptionType, DifficultyLevel, ExtendedDifficultyLevel
- WorkoutSessionStatus, UserRoutineStatus
- AchievementCategory, MuscleGroup, ChallengeType
- MediaType, EntityType, RewardCategory, PaymentStatus

### Paso 4: Definir el Endpoint

Abre el archivo de paths correspondiente:

```yaml
# paths/foos.yaml
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

### Paso 5: Validar

```bash
cd backend/node/docs

# Regenerar bundle
node scripts/bundle.js

# Validar
node scripts/validate.js

# Lint
node scripts/lint.js
```

### Paso 6: Probar Documentación

```bash
# Generar HTML
npx @redocly/cli build-docs openapi.yaml --output api-docs.html

# Abrir en navegador
start api-docs.html  # Windows
# o
open api-docs.html   # macOS/Linux
```

---

## 📋 Checklist de Validación

Antes de hacer commit, verifica:

**Obligatorio:**
- [ ] El endpoint tiene `summary` y `description`
- [ ] El endpoint tiene `operationId` único (camelCase)
- [ ] El endpoint tiene `tags` apropiados
- [ ] El endpoint tiene `security` (si requiere auth)
- [ ] El requestBody tiene `schema` y `example`
- [ ] Todas las responses tienen `description` y `schema`
- [ ] Se reutilizan components existentes (parameters, responses, enums)
- [ ] Los Request schemas tienen `additionalProperties: false`
- [ ] `node scripts/bundle.js` ejecuta sin errores
- [ ] `node scripts/validate.js` pasa sin errores

**Recomendado:**
- [ ] Los campos tienen `minLength/maxLength` o `minimum/maximum`
- [ ] Los campos tienen `description`
- [ ] Hay al menos un `example` por schema
- [ ] `node scripts/lint.js` no tiene errores críticos
- [ ] La documentación HTML se ve correcta

---

## 🔧 Convenciones

### Naming

**Schemas:**
- Request schemas: `{Entity}{Action}Request` (ej: `CreateUserRequest`)
- Response schemas: `{Entity}Response` (ej: `UserResponse`)
- Paginados: `Paginated{Entity}Response` (ej: `PaginatedUsersResponse`)

**operationId:**
- camelCase obligatorio (ej: `createFoo`, `getFoo`, `updateFoo`)

**Properties:**
- snake_case (ya establecido en el proyecto)

**Tags:**
- lowercase con guiones (ej: `auth`, `users`, `gym-schedules`)

### Referencias

**Desde paths a schemas del mismo dominio:**
```yaml
$ref: '../components/schemas/auth.yaml#/components/schemas/LoginRequest'
```

**Desde paths a schemas de otro dominio:**
```yaml
$ref: '../components/schemas/users.yaml#/components/schemas/UserProfileResponse'
```

**Desde schemas a common:**
```yaml
$ref: '../common.yaml#/components/schemas/Gender'
```

**Desde paths a parameters:**
```yaml
$ref: '../components/parameters.yaml#/components/parameters/IdPathParam'
```

**Desde paths a responses:**
```yaml
$ref: '../components/responses.yaml#/components/responses/BadRequest'
```

### Security

**Endpoints públicos (no auth):**
```yaml
post:
  summary: Registrar nuevo usuario
  # NO incluir security
```

**Endpoints protegidos:**
```yaml
get:
  summary: Obtener perfil del usuario
  security:
    - bearerAuth: []
```

**Endpoints de admin:**
```yaml
delete:
  summary: Eliminar gimnasio
  description: Requiere permisos de administrador
  security:
    - bearerAuth: []
  # Documentar en description que requiere rol admin
```

---

## ⚠️ Errores Comunes

### Error: "Reference cannot be resolved"

**Causa:** La ruta del `$ref` es incorrecta.

**Solución:** Verifica que la ruta relativa sea correcta desde el archivo donde estás.

```yaml
# ❌ Incorrecto (desde paths/foos.yaml)
$ref: './components/schemas/foos.yaml#/components/schemas/FooResponse'

# ✅ Correcto
$ref: '../components/schemas/foos.yaml#/components/schemas/FooResponse'
```

### Error: "Duplicate operationId"

**Causa:** Dos endpoints tienen el mismo `operationId`.

**Solución:** Cambia el `operationId` a uno único:
```yaml
operationId: createFoo    # ✅ Único
operationId: updateFoo    # ✅ Único
operationId: create       # ❌ Genérico, puede duplicarse
```

### Warning: "Missing example"

**Causa:** Un schema o response no tiene `example`.

**Solución:** Agrega un ejemplo realista:
```yaml
schema:
  $ref: '#/...'
example:
  id: 1
  name: "Ejemplo"
  created_at: "2025-10-23T10:00:00Z"
```

### Error: Bundle generation failed

**Causa:** Sintaxis YAML inválida en algún módulo.

**Solución:** Valida el YAML con un linter:
```bash
# Instalar yamllint
pip install yamllint

# Validar archivo
yamllint backend/node/docs/openapi/paths/foos.yaml
```

---

## 🔄 Workflow de Desarrollo

### Desarrollo Local

```bash
# 1. Crear rama
git checkout -b feature/add-foos-endpoint

# 2. Editar módulos
code backend/node/docs/openapi/paths/foos.yaml
code backend/node/docs/openapi/components/schemas/foos.yaml

# 3. Regenerar bundle
cd backend/node/docs
node scripts/bundle.js

# 4. Validar
node scripts/validate.js
node scripts/lint.js

# 5. Probar documentación
npx @redocly/cli build-docs openapi.yaml --output api-docs.html
start api-docs.html

# 6. Commit
git add docs/openapi/
git commit -m "feat(api): add POST /api/foos endpoint"
```

### Pull Request

1. El CI ejecutará automáticamente:
   - Bundle generation
   - Validation
   - Linting
   - Comparison
   - Documentation generation

2. Revisa los artifacts del CI:
   - Bundle generado
   - Documentación HTML

3. Si todo pasa, mergea el PR

### Después del Merge

El bundle `openapi.yaml` se actualiza automáticamente en la rama main.

---

## 📚 Recursos

### Documentación Interna
- [FASE_1_EXTRACCION_COMPONENTES_COMPLETADA.md](./FASE_1_EXTRACCION_COMPONENTES_COMPLETADA.md)
- [FASE_2_MODULARIZACION_COMPLETADA.md](./FASE_2_MODULARIZACION_COMPLETADA.md)
- [OPENAPI_MODULARIZATION_PLAN.md](./OPENAPI_MODULARIZATION_PLAN.md)

### Documentación Externa
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger Editor](https://editor.swagger.io/)
- [Redocly CLI](https://redocly.com/docs/cli/)

### Herramientas Útiles
- [Swagger Editor Online](https://editor.swagger.io/) - Validar y previsualizar
- [OpenAPI Generator](https://openapi-generator.tech/) - Generar clientes
- [Postman](https://www.postman.com/) - Importar y probar

---

## 💡 Tips

### Acelerar el Desarrollo

**Usa snippets de VSCode:**
```json
// .vscode/openapi.code-snippets
{
  "OpenAPI Endpoint": {
    "prefix": "oapipath",
    "body": [
      "  /api/${1:resource}:",
      "    ${2:get}:",
      "      summary: ${3:Get resource}",
      "      description: ${4:Description}",
      "      operationId: ${5:getResource}",
      "      tags:",
      "        - ${6:resource}",
      "      security:",
      "        - bearerAuth: []",
      "      responses:",
      "        '200':",
      "          description: Success",
      "        '401':",
      "          \\$ref: '../components/responses.yaml#/components/responses/Unauthorized'"
    ]
  }
}
```

### Validar Referencias Rápido

```bash
# Ver referencias rotas
grep -r "\$ref:" backend/node/docs/openapi/ | grep -v "#/components"
```

### Comparar Cambios

```bash
# Ver diferencias antes/después
git diff backend/node/docs/openapi/paths/users.yaml
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo editar directamente `openapi.yaml`?**
R: No. El `openapi.yaml` es generado automáticamente. Edita los módulos en `openapi/`.

**P: ¿Cómo sé a qué archivo va mi schema?**
R: Si el schema se llama `CreateUserRequest`, va a `schemas/users.yaml`.

**P: ¿Puedo agregar un nuevo dominio?**
R: Sí. Crea `schemas/{dominio}.yaml` y `paths/{dominio}.yaml`, y el script de bundling los incluirá automáticamente.

**P: ¿El bundle se genera en cada commit?**
R: Sí, en el CI. Localmente debes ejecutar `node scripts/bundle.js`.

**P: ¿Qué hago si el CI falla?**
R: Revisa los logs del CI, ejecuta los scripts localmente para reproducir el error, y corrige.

---

## 📞 Soporte

**Problemas con el OpenAPI:**
- Abre un issue en GitHub con el tag `openapi`
- Incluye el error completo del CI o del script
- Menciona qué archivo estabas editando

**Dudas sobre modelado:**
- Consulta al equipo de Backend
- Revisa ejemplos en archivos existentes
- Consulta la [documentación oficial de OpenAPI](https://spec.openapis.org/oas/v3.1.0)

---

**Última actualización:** 2025-10-23
**Mantenedor:** Equipo de Backend GymPoint
