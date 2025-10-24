const OpenApiValidator = require('express-openapi-validator');
const path = require('path');

/**
 * Middleware de validación OpenAPI
 *
 * Valida requests y responses contra el spec de OpenAPI.
 * - validateRequests: siempre activo
 * - validateResponses: solo en development y test (performance en prod)
 *
 * Ignorar rutas que no forman parte de la API:
 * - /docs (Swagger UI)
 * - /openapi.yaml (spec file)
 * - /health, /ready (healthchecks)
 */

const specPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');

const openapiValidatorMiddleware = OpenApiValidator.middleware({
  apiSpec: specPath,

  // Validar todos los requests
  validateRequests: true,

  // Validar responses solo en dev/test (impacto en performance en prod)
  validateResponses: process.env.NODE_ENV !== 'production',

  // Ignorar rutas que no están en el spec
  ignorePaths: /^\/(docs|openapi\.yaml|health|ready|api-docs|api\/admin.*)/,

  // Opciones adicionales
  validateSecurity: false, // Por ahora, auth lo manejamos custom
  validateFormats: 'full', // Validar formatos como email, date-time, etc.

  // Permitir unknown formats (por si agregamos customs en el futuro)
  unknownFormats: ['int32', 'int64'],

  // Serialización de errores
  validateApiSpec: true, // Validar el spec al iniciar (fail-fast)
});

module.exports = openapiValidatorMiddleware;
