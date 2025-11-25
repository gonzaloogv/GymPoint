const rateLimit = require('express-rate-limit');

/**
 * Rate Limiters para diferentes endpoints
 * Protege contra ataques de fuerza bruta y DDoS
 */

// Limiter general para todas las rutas de API (100 req/15min por IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por ventana (aumentado para desarrollo)
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados requests desde esta IP, intenta nuevamente en 15 minutos'
    }
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  validate: { trustProxy: false }, // Desactivar validación de trust proxy para desarrollo
  skip: (req) => {
    // No aplicar rate limit a health checks
    return req.path === '/health' || req.path === '/ready';
  }
});

// Limiter estricto para autenticación (5 intentos/15min por IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 5 intentos
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

// Limiter para registro (3 registros/hora por IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 3 registros por hora
  message: {
    error: {
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

// Limiter para webhooks de Mercado Pago (más permisivo)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto (Mercado Pago puede enviar varios webhooks)
  message: {
    error: {
      code: 'TOO_MANY_WEBHOOK_REQUESTS',
      message: 'Webhook rate limit exceeded'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

// Limiter para endpoints de pago (10 requests/minuto)
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10,
  message: {
    error: {
      code: 'TOO_MANY_PAYMENT_REQUESTS',
      message: 'Demasiados requests de pago. Intenta nuevamente en 1 minuto'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  webhookLimiter,
  paymentLimiter
};

