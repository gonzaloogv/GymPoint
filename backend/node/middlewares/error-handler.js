const { AppError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Middleware de manejo centralizado de errores
 *
 * Este middleware captura todos los errores lanzados en la aplicación
 * y los formatea de manera consistente para el cliente.
 */
const errorHandler = (err, req, res, next) => {
  // Log del error con Winston
  logger.logError(err, {
    url: req.originalUrl,
    method: req.method,
    userId: req.account?.id_account || req.user?.id_user_profile || req.user?.id,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Errores de validación de OpenAPI (express-openapi-validator)
  if (err.status && err.errors) {
    return res.status(err.status).json({
      code: 'VALIDATION_ERROR',
      message: err.message || 'Error de validación contra el contrato OpenAPI',
      details: err.errors
    });
  }

  // Si es un error operacional conocido (AppError y sus subclases)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined
      }
    });
  }

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación de datos',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      }
    });
  }

  // Error de restricción única (duplicado)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'El registro ya existe',
        details: err.errors.map(e => ({
          field: e.path,
          value: e.value
        }))
      }
    });
  }

  // Error de foreign key (referencia inválida)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Referencia inválida a otro registro',
        details: {
          table: err.table,
          field: err.fields
        }
      }
    });
  }

  // Error de conexión a BD
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Error de conexión a la base de datos'
      }
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de autenticación inválido'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token de autenticación expirado'
      }
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'JSON malformado en el cuerpo de la petición'
      }
    });
  }

  // Error no manejado (500)
  // En producción no exponer detalles internos
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

/**
 * Middleware para rutas no encontradas (404)
 *
 * Debe colocarse después de todas las rutas definidas
 */
const notFoundHandler = (req, res) => {
  console.log('[404 NOT FOUND]', req.method, req.originalUrl);
  console.log('[404 NOT FOUND] Path:', req.path);
  console.log('[404 NOT FOUND] Headers:', req.headers);

  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`,
      availableEndpoints: process.env.NODE_ENV === 'development'
        ? 'Consulta /api-docs para ver los endpoints disponibles'
        : undefined
    }
  });
};

/**
 * Wrapper para funciones async en routes
 * Captura errores de funciones async y los pasa a next()
 *
 * Uso:
 *   router.get('/ruta', asyncHandler(async (req, res) => {
 *     const data = await service.getData();
 *     res.json(data);
 *   }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Sanitiza el body de la request para logging
 * Remueve campos sensibles como passwords, tokens, etc.
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'refreshToken', 'refresh_token'];
  const sanitized = { ...body };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
