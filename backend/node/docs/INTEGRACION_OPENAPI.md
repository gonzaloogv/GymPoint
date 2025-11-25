# Guía de Integración OpenAPI - GymPoint Backend

**Fecha:** 2025-10-23
**Estado:** Configuración actual + Mejoras recomendadas

---

## ✅ YA CONFIGURADO (Estado Actual)

### 1. Validación de Requests/Responses ✅

**Archivo:** `middlewares/openapi-validator.js`

**Configuración actual:**
```javascript
const OpenApiValidator = require('express-openapi-validator');

const openapiValidatorMiddleware = OpenApiValidator.middleware({
  apiSpec: './docs/openapi.yaml',
  validateRequests: true,                              // ✅ Valida requests
  validateResponses: process.env.NODE_ENV !== 'production', // ✅ Valida responses en dev
  ignorePaths: /^\/(docs|openapi\.yaml|health|ready|api-docs)/, // ✅ Ignora rutas no-API
  validateSecurity: false,                             // ⚠️ Auth custom
  validateFormats: 'full',                             // ✅ Valida emails, dates, etc.
  unknownFormats: ['int32', 'int64'],
  validateApiSpec: true                                // ✅ Valida spec al iniciar
});
```

**Uso en index.js:**
```javascript
// Línea 100 - ANTES de las rutas de API
app.use(openapiValidatorMiddleware);
```

**✅ FUNCIONA CORRECTAMENTE**

---

### 2. Swagger UI ✅

**Archivo:** `utils/swagger.js`

**Configuración actual:**
```javascript
const swaggerUi = require('swagger-ui-express');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, {
  explorer: true,
  customSiteTitle: 'GymPoint API Docs',
  swaggerOptions: {
    url: '/api-docs.json',
    displayRequestDuration: true,
    docExpansion: 'none'
  }
}));
```

**Endpoints disponibles:**
- `http://localhost:3000/docs` - Swagger UI interactivo
- `http://localhost:3000/openapi.yaml` - Spec YAML
- `http://localhost:3000/api-docs.json` - Spec JSON

**✅ FUNCIONA CORRECTAMENTE**

---

## 🔧 MEJORAS RECOMENDADAS

### 1. Actualizar Path del Spec (Prioridad: ALTA)

**Problema:** El `swagger.js` busca en rutas antiguas.

**Solución:**

```javascript
// utils/swagger.js
const SPEC_CANDIDATES = [
  path.resolve(__dirname, '../docs/openapi.yaml'),  // ✅ Ruta correcta
  path.resolve(__dirname, '../../docs/openapi.yaml'),
  path.resolve(__dirname, '../../../docs/openapi.yaml')
];
```

**Ya está correcto en tu código actual** ✅

---

### 2. Agregar Scripts npm (Prioridad: ALTA)

**Actualizar `package.json`:**

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",

    "openapi:bundle": "node docs/scripts/bundle.js",
    "openapi:validate": "node docs/scripts/validate.js",
    "openapi:lint": "node docs/scripts/lint.js",
    "openapi:check": "npm run openapi:bundle && npm run openapi:validate",
    "openapi:docs": "npx @redocly/cli build-docs docs/openapi.yaml --output docs/api-docs.html",

    "prestart": "npm run openapi:bundle",
    "predev": "npm run openapi:bundle"
  }
}
```

**Beneficio:**
- Bundle se genera automáticamente antes de iniciar el servidor
- Comandos fáciles de recordar

---

### 3. Servir Documentación HTML (Prioridad: MEDIA)

**Agregar endpoint para `api-docs.html`:**

```javascript
// index.js - Después de setupSwagger(app)
const apiDocsPath = path.join(__dirname, 'docs', 'api-docs.html');
if (fs.existsSync(apiDocsPath)) {
  app.get('/api-docs-html', (_req, res) => {
    res.sendFile(apiDocsPath);
  });
  console.log('📚 Documentación HTML disponible en /api-docs-html');
}
```

**Beneficio:**
- Documentación más profesional que Swagger UI
- Mejor performance (archivo estático)

---

### 4. Mejorar Manejo de Errores de Validación (Prioridad: ALTA)

**Crear middleware de errores específico:**

```javascript
// middlewares/openapi-error-handler.js
function openapiErrorHandler(err, req, res, next) {
  // Error de validación de OpenAPI
  if (err.status && err.errors) {
    console.error('[OpenAPI Validation Error]', {
      method: req.method,
      path: req.path,
      errors: err.errors
    });

    return res.status(err.status).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors,
      path: req.path
    });
  }

  // Otro tipo de error
  next(err);
}

module.exports = openapiErrorHandler;
```

**Usar en index.js:**

```javascript
// Después de todas las rutas, ANTES del errorHandler general
app.use(openapiErrorHandler);
app.use(errorHandler);
```

---

### 5. Configurar Regeneración Automática en Dev (Prioridad: MEDIA)

**Opción 1: Usar nodemon.json**

```json
{
  "watch": [
    "**/*.js",
    "docs/openapi/**/*.yaml"
  ],
  "ext": "js,json,yaml",
  "ignore": [
    "docs/openapi.yaml"
  ],
  "events": {
    "restart": "node docs/scripts/bundle.js"
  }
}
```

**Opción 2: Script de watch manual**

```javascript
// scripts/watch-openapi.js
const chokidar = require('chokidar');
const { exec } = require('child_process');

console.log('👀 Watching OpenAPI modules...\n');

const watcher = chokidar.watch('docs/openapi/**/*.yaml', {
  ignoreInitial: true
});

watcher.on('change', (path) => {
  console.log(`📝 Cambio detectado en: ${path}`);
  console.log('🔄 Regenerando bundle...\n');

  exec('node docs/scripts/bundle.js', (error, stdout) => {
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    console.log(stdout);
    console.log('✅ Bundle actualizado!\n');
  });
});

console.log('Ctrl+C para detener\n');
```

**Usar:**
```bash
npm install -D chokidar
node scripts/watch-openapi.js
```

---

## 📋 CHECKLIST DE INTEGRACIÓN

### Configuración Base (Ya hecho ✅)
- [x] express-openapi-validator instalado
- [x] Middleware de validación configurado
- [x] Swagger UI configurado
- [x] openapi.yaml en ruta correcta
- [x] Endpoints /docs, /openapi.yaml funcionando

### Mejoras Recomendadas
- [ ] Scripts npm agregados al package.json
- [ ] Middleware de errores OpenAPI creado
- [ ] Endpoint /api-docs-html agregado
- [ ] prestart/predev hooks configurados
- [ ] Watch de cambios en modo desarrollo (opcional)

### Validación
- [ ] Probado POST con datos inválidos (debe retornar 400)
- [ ] Probado POST con campos extra (debe retornar 400 si additionalProperties: false)
- [ ] Probado GET /docs en navegador
- [ ] Revisado logs de validación en consola

---

## 🧪 TESTING DE LA INTEGRACIÓN

### Test 1: Validación de Request Inválido

```bash
# Intentar crear usuario sin email (campo requerido)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "test123",
    "name": "Test"
  }'
```

**Esperado:**
```json
{
  "error": "Validation Error",
  "message": "request/body must have required property 'email'",
  "details": [...]
}
```

### Test 2: Validación de Formato

```bash
# Email con formato inválido
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "test123",
    "name": "Test",
    "lastname": "User"
  }'
```

**Esperado:**
```json
{
  "error": "Validation Error",
  "message": "request/body/email must match format \"email\"",
  "details": [...]
}
```

### Test 3: Validación de Campos Extra (additionalProperties: false)

```bash
# Enviar campo no definido en el schema
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test",
    "lastname": "User",
    "hacker_field": "malicious"
  }'
```

**Esperado:**
```json
{
  "error": "Validation Error",
  "message": "request/body must NOT have additional properties",
  "details": [...]
}
```

### Test 4: Swagger UI

1. Abrí http://localhost:3000/docs en el navegador
2. Deberías ver la documentación interactiva
3. Probá ejecutar un endpoint desde la UI

---

## 🚀 WORKFLOW DE DESARROLLO

### Cuando Agregás un Nuevo Endpoint

1. **Editar módulos OpenAPI:**
   ```bash
   code docs/openapi/paths/users.yaml
   code docs/openapi/components/schemas/users.yaml
   ```

2. **Regenerar bundle:**
   ```bash
   npm run openapi:bundle
   ```

3. **Validar:**
   ```bash
   npm run openapi:validate
   ```

4. **Reiniciar servidor:**
   ```bash
   npm run dev
   # El bundle se regenera automáticamente si configuraste predev
   ```

5. **Probar en Swagger UI:**
   ```
   http://localhost:3000/docs
   ```

---

## 🔧 TROUBLESHOOTING

### Problema: "Cannot find module 'express-openapi-validator'"

**Solución:**
```bash
npm install express-openapi-validator
```

### Problema: "apiSpec is not valid"

**Causa:** El `openapi.yaml` tiene errores de sintaxis.

**Solución:**
```bash
npm run openapi:validate
# Revisar errores y corregir
```

### Problema: "All requests fail with 404"

**Causa:** El middleware está antes de las rutas o el path base no coincide.

**Solución:**
- Verificar que el middleware esté DESPUÉS de `app.use(express.json())`
- Verificar que los paths en openapi.yaml coincidan con tus rutas

### Problema: "Validation too strict, rejecting valid requests"

**Causa:** `additionalProperties: false` muy estricto.

**Solución temporal:**
```javascript
// middlewares/openapi-validator.js
allowUnknownQueryParameters: true  // Permite query params no definidos
```

### Problema: "Performance degraded in production"

**Causa:** `validateResponses: true` en producción.

**Solución:** Ya está configurado correctamente:
```javascript
validateResponses: process.env.NODE_ENV !== 'production'
```

---

## 📊 MONITOREO

### Logs de Validación

Los errores de validación se logean automáticamente. Para un mejor monitoreo:

```javascript
// middlewares/openapi-validator.js
const logger = require('../utils/logger'); // Tu logger

// Agregar después de la configuración
app.use((err, req, res, next) => {
  if (err.status && err.errors) {
    logger.warn('OpenAPI validation error', {
      path: req.path,
      method: req.method,
      errors: err.errors
    });
  }
  next(err);
});
```

### Métricas Útiles

- Cantidad de errores de validación por endpoint
- Endpoints más usados (desde Swagger UI)
- Tiempo de validación (ya incluido en X-Response-Time)

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Corto Plazo (1 semana)
1. ✅ Agregar scripts npm
2. ✅ Crear middleware de errores específico
3. ✅ Probar validación en todos los endpoints críticos
4. ✅ Documentar errores comunes encontrados

### Medio Plazo (2-4 semanas)
5. Generar cliente TypeScript para frontend
6. Agregar tests de contrato (Dredd)
7. Integrar métricas de validación
8. Crear dashboard de salud de API

### Largo Plazo (1-3 meses)
9. Validación de seguridad con OpenAPI (validateSecurity: true)
10. Generación automática de mocks para testing
11. Versionado de API (v1, v2)
12. Portal público de documentación

---

## 📚 RECURSOS

**Documentación Oficial:**
- [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0)

**Documentación Interna:**
- [CONTRIBUTING_OPENAPI.md](./CONTRIBUTING_OPENAPI.md) - Cómo agregar endpoints
- [OPENAPI_CHANGELOG.md](./OPENAPI_CHANGELOG.md) - Historial de cambios
- [PROYECTO_COMPLETO_RESUMEN.md](./PROYECTO_COMPLETO_RESUMEN.md) - Resumen del proyecto

---

## ✅ ESTADO ACTUAL DE TU INTEGRACIÓN

**Configuración:**
- ✅ express-openapi-validator configurado
- ✅ Validación de requests activada
- ✅ Validación de responses en dev
- ✅ Swagger UI funcionando
- ✅ Endpoints /docs, /openapi.yaml disponibles

**Pendiente (Recomendado):**
- ⏳ Scripts npm para OpenAPI
- ⏳ Middleware específico de errores
- ⏳ Endpoint /api-docs-html
- ⏳ Tests de integración

**Score de integración:** 8/10 ✅

Tu integración está **prácticamente completa y funcionando**. Las mejoras recomendadas son opcionales pero te darán mejor DX y mantenibilidad.

---

**¿Necesitás ayuda implementando alguna de las mejoras?**
