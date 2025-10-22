/**
 * Queries para el dominio Auth
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 */

/**
 * Query para obtener perfil de usuario por ID de cuenta
 *
 * @typedef {Object} GetUserProfileQuery
 * @property {number} accountId - ID de la cuenta
 */
class GetUserProfileQuery {
  constructor({ accountId }) {
    this.accountId = accountId;
  }
}

/**
 * Query para verificar si un email ya está registrado
 *
 * @typedef {Object} CheckEmailExistsQuery
 * @property {string} email - Email a verificar
 */
class CheckEmailExistsQuery {
  constructor({ email }) {
    this.email = email;
  }
}

/**
 * Query para obtener cuenta por email
 *
 * @typedef {Object} GetAccountByEmailQuery
 * @property {string} email - Email de la cuenta
 */
class GetAccountByEmailQuery {
  constructor({ email }) {
    this.email = email;
  }
}

/**
 * Query para obtener cuenta por Google ID
 *
 * @typedef {Object} GetAccountByGoogleIdQuery
 * @property {string} googleId - Google ID único
 */
class GetAccountByGoogleIdQuery {
  constructor({ googleId }) {
    this.googleId = googleId;
  }
}

/**
 * Query para validar refresh token
 *
 * @typedef {Object} ValidateRefreshTokenQuery
 * @property {string} refreshToken - Token de refresh a validar
 */
class ValidateRefreshTokenQuery {
  constructor({ refreshToken }) {
    this.refreshToken = refreshToken;
  }
}

module.exports = {
  GetUserProfileQuery,
  CheckEmailExistsQuery,
  GetAccountByEmailQuery,
  GetAccountByGoogleIdQuery,
  ValidateRefreshTokenQuery,
};
