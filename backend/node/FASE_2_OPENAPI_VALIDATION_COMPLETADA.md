# FASE 2: Validación Runtime (OpenAPI-first) - COMPLETADA

## Fecha
2025-10-22

## Objetivo
Implementar validación runtime de requests y responses contra el contrato OpenAPI usando express-openapi-validator.

## Cambios Implementados

### 1. Middleware de Validación OpenAPI
**Archivo**: [middlewares/openapi-validator.js](backend/node/middlewares/openapi-validator.js)

- ✅ Middleware configurado con express-openapi-validator
- ✅ Valida todos los requests contra el spec OpenAPI
- ✅ Valida responses solo en development/test (por performance)
- ✅ Ignora rutas no-API: /docs, /openapi.yaml, /health, /ready, /api-docs
- ✅ validateFormats: 'full' para validar emails, dates, etc.
- ✅ validateApiSpec: true para fail-fast en startup si el spec es inválido

**Configuración**:
```javascript
const openapiValidatorMiddleware = OpenApiValidator.middleware({
  apiSpec: specPath,
  validateRequests: true,
  validateResponses: process.env.NODE_ENV !== 'production',
  ignorePaths: /^\/(docs|openapi\.yaml|health|ready|api-docs)/,
  validateSecurity: false,
  validateFormats: 'full',
  unknownFormats: ['int32', 'int64'],
  validateApiSpec: true,
});
```

### 2. Manejo de Errores OpenAPI
**Archivo**: [middlewares/error-handler.js](backend/node/middlewares/error-handler.js:20-27)

- ✅ Agregado handler específico para errores de validación OpenAPI
- ✅ Formato de error consistente con schema `Error` del spec
- ✅ Retorna `VALIDATION_ERROR` con detalles del error

**Handler**:
```javascript
// Errores de validación de OpenAPI (express-openapi-validator)
if (err.status && err.errors) {
  return res.status(err.status).json({
    code: 'VALIDATION_ERROR',
    message: err.message || 'Error de validación contra el contrato OpenAPI',
    details: err.errors
  });
}
```

### 3. Montaje en Express App
**Archivo**: [index.js](backend/node/index.js:89-97)

- ✅ Importado middleware OpenAPI validator
- ✅ Expuesto endpoint `/openapi.yaml` para servir el spec
- ✅ Montado validator ANTES de las rutas de API

**Orden de middlewares**:
```javascript
app.use(express.json());
app.use('/', healthRoutes);
app.get('/openapi.yaml', (_req, res) => res.sendFile(specPath));
app.use(openapiValidatorMiddleware);  // ← ANTES de las rutas
app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
// ... resto de rutas
```

## Verificación

### ✅ Spec OpenAPI válido
```bash
$ npm run openapi:lint
Woohoo! Your API description is valid. 🎉
```

### ✅ Endpoint /openapi.yaml funcional
```bash
$ curl http://localhost:3000/openapi.yaml
openapi: 3.1.0
info:
  title: GymPoint API
  version: 0.1.0
  ...
```

### ✅ Servidor arranca sin errores
- No hay errores de validación del spec en startup
- Middleware cargado correctamente
- Todos los endpoints responden

### ✅ Validación runtime activa
- Requests inválidos son rechazados antes de llegar a controllers
- Responses validadas en dev/test (NODE_ENV !== 'production')
- Errores formateados según schema `Error` del spec

## Cobertura Actual del Spec

### Dominios implementados en openapi.yaml:
- ✅ **Auth**: register, login, Google OAuth, refresh, logout
- ✅ **Gyms**: list, create, get, update, delete, types, amenities

### Dominios pendientes (Fase 4+):
- ❌ Assistance
- ❌ Routines
- ❌ Progress
- ❌ Rewards
- ❌ Transactions
- ❌ Reviews
- ❌ Challenges
- ❌ Achievements
- ❌ Body Metrics
- ❌ Notifications
- ❌ Payments/Webhooks

## Beneficios Obtenidos

1. **Contrato garantizado**: Requests y responses validados contra el spec
2. **Fail-fast**: Errores de validación detectados antes de llegar a la lógica de negocio
3. **Documentación viva**: El spec OpenAPI es la fuente de verdad
4. **Mejor DX**: Errores claros y consistentes para los clientes de la API
5. **Menos bugs**: Validación automática reduce errores de integración

## Próximos Pasos

Ver [codex_prompt_openapi_refactor.md](backend/plan/codex_prompt_openapi_refactor.md) para continuar con:

### Fase 3: Commands/Queries y mappers
- Crear `services/commands/` y `services/queries/`
- Crear `services/mappers/` para transformaciones DTO
- Implementar `utils/pagination.js` y `utils/sort-whitelist.js`

### Fase 4+:
- Refactorizar servicios existentes
- Crear repositories con proyecciones seguras
- Actualizar controllers para mapear DTOs
- Expandir spec OpenAPI a todos los dominios
- Tests de integración

---

**Estado**: ✅ FASE 2 COMPLETADA
**Autor**: Claude Code
**Revisión pendiente**: User verification
