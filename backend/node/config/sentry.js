const Sentry = require('@sentry/node');

/**
 * Configuración de Sentry para monitoring y error tracking
 * 
 * Para obtener tu DSN:
 * 1. Crear cuenta en https://sentry.io
 * 2. Crear proyecto Node.js
 * 3. Copiar el DSN
 * 4. Agregar SENTRY_DSN a .env
 */

const initSentry = (app) => {
  const sentryDsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Solo inicializar en producción o si hay DSN configurado
  if (!sentryDsn || sentryDsn === 'your-sentry-dsn-here') {
    console.log('📊 Sentry no configurado (modo development)');
    return false;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      
      // Capturar % de transacciones para performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      
      // Integración con Express
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app })
      ],

      // Filtrar información sensible
      beforeSend(event) {
        // No enviar passwords, tokens, etc.
        if (event.request) {
          if (event.request.data) {
            delete event.request.data.password;
            delete event.request.data.access_token;
            delete event.request.data.refresh_token;
          }
          if (event.request.headers) {
            delete event.request.headers.authorization;
          }
        }
        return event;
      }
    });

    console.log('✅ Sentry inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Sentry:', error.message);
    return false;
  }
};

// Middleware para capturar request context
const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

// Middleware para capturar errores
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler();
};

// Función para capturar errores manualmente
const captureException = (error, context = {}) => {
  if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your-sentry-dsn-here') {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    // En desarrollo, solo log
    console.error('Error captured (Sentry not configured):', error.message, context);
  }
};

// Función para capturar mensajes informativos
const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your-sentry-dsn-here') {
    Sentry.captureMessage(message, {
      level,
      extra: context
    });
  }
};

module.exports = {
  initSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  Sentry
};

