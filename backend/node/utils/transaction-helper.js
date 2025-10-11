const sequelize = require('../config/database');

const RETRYABLE_ERROR_CODES = new Set([
  'ER_LOCK_WAIT_TIMEOUT',
  'ER_LOCK_DEADLOCK'
]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractErrorCode = (error) => {
  if (!error) {
    return undefined;
  }

  if (typeof error.code === 'string') {
    return error.code;
  }

  if (typeof error.parent?.code === 'string') {
    return error.parent.code;
  }

  if (typeof error.original?.code === 'string') {
    return error.original.code;
  }

  return undefined;
};

const isRetryableLockError = (error) => {
  const code = extractErrorCode(error);
  return code ? RETRYABLE_ERROR_CODES.has(code) : false;
};

/**
 * Ejecuta una transaccion con reintentos cuando MySQL devuelve un bloqueo
 * de tipo deadlock o lock wait timeout.
 *
 * @param {Function} operation - Funcion que recibe la transaccion y retorna una promesa.
 * @param {Object} [options]
 * @param {number} [options.attempts=3] - Intentos totales (incluye el primero).
 * @param {number} [options.backoffMs=100] - Tiempo base de espera entre reintentos.
 */
const runWithRetryableTransaction = async (operation, { attempts = 3, backoffMs = 100 } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const transaction = await sequelize.transaction();

    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      lastError = error;

      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Si el rollback tambien falla, exponemos el error mas reciente.
        throw rollbackError;
      }

      if (!isRetryableLockError(error) || attempt === attempts) {
        throw error;
      }

      const delay = backoffMs * attempt;
      await wait(delay);
    }
  }

  throw lastError;
};

module.exports = {
  runWithRetryableTransaction
};
