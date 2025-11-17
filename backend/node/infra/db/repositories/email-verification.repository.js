const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Repositorio para Email Verification Tokens
 *
 * Gestiona la creación, validación y limpieza de tokens de verificación de email.
 */

const emailVerificationRepository = {
  /**
   * Crear un nuevo token de verificación
   *
   * @param {Object} data
   * @param {number} data.id_account - ID de la cuenta
   * @param {string} data.token - Token UUID
   * @param {Date} data.expires_at - Fecha de expiración
   * @param {Object} [options] - Opciones Sequelize (transaction, etc.)
   * @returns {Promise<Object>}
   */
  async createVerificationToken(data, options = {}) {
    const query = `
      INSERT INTO email_verification_tokens (id_account, token, expires_at)
      VALUES (:id_account, :token, :expires_at)
    `;

    await sequelize.query(query, {
      replacements: data,
      type: QueryTypes.INSERT,
      ...options,
    });

    // Retornar el token creado
    return this.findByToken(data.token, options);
  },

  /**
   * Buscar token de verificación por valor del token
   *
   * @param {string} token - Token UUID
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<Object|null>}
   */
  async findByToken(token, options = {}) {
    const query = `
      SELECT
        id_verification_token,
        id_account,
        token,
        expires_at,
        used_at,
        created_at
      FROM email_verification_tokens
      WHERE token = :token
      LIMIT 1
    `;

    const results = await sequelize.query(query, {
      replacements: { token },
      type: QueryTypes.SELECT,
      ...options,
    });

    return results[0] || null;
  },

  /**
   * Buscar tokens de una cuenta específica (todos, usado o no)
   *
   * @param {number} idAccount - ID de la cuenta
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<Array>}
   */
  async findByAccount(idAccount, options = {}) {
    const query = `
      SELECT
        id_verification_token,
        id_account,
        token,
        expires_at,
        used_at,
        created_at
      FROM email_verification_tokens
      WHERE id_account = :idAccount
      ORDER BY created_at DESC
    `;

    return sequelize.query(query, {
      replacements: { idAccount },
      type: QueryTypes.SELECT,
      ...options,
    });
  },

  /**
   * Marcar un token como usado
   *
   * @param {string} token - Token UUID
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  async markAsUsed(token, options = {}) {
    const query = `
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE token = :token
        AND used_at IS NULL
    `;

    // IMPORTANTE: QueryTypes.UPDATE devuelve OkPacket, no array
    const [result] = await sequelize.query(query, {
      replacements: { token },
      type: QueryTypes.UPDATE,
      ...options,
    });

    return result.affectedRows > 0;
  },

  /**
   * Revocar (eliminar) todos los tokens de verificación de una cuenta
   * Útil después de verificar exitosamente o al hacer logout
   *
   * @param {number} idAccount - ID de la cuenta
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<number>} Número de tokens eliminados
   */
  async revokeAllByAccount(idAccount, options = {}) {
    const query = `
      DELETE FROM email_verification_tokens
      WHERE id_account = :idAccount
    `;

    // IMPORTANTE: QueryTypes.DELETE devuelve OkPacket, no array
    const [result] = await sequelize.query(query, {
      replacements: { idAccount },
      type: QueryTypes.DELETE,
      ...options,
    });

    return result.affectedRows || 0;
  },

  /**
   * Validar si un token es válido (no expirado y no usado)
   *
   * @param {string} token - Token UUID
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<Object|null>} Token válido o null
   */
  async findValidToken(token, options = {}) {
    const query = `
      SELECT
        id_verification_token,
        id_account,
        token,
        expires_at,
        used_at,
        created_at
      FROM email_verification_tokens
      WHERE token = :token
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;

    const results = await sequelize.query(query, {
      replacements: { token },
      type: QueryTypes.SELECT,
      ...options,
    });

    return results[0] || null;
  },

  /**
   * Limpiar tokens expirados (tarea de mantenimiento)
   * Ejecutar periódicamente con cron job
   *
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<number>} Número de tokens eliminados
   */
  async cleanupExpiredTokens(options = {}) {
    const query = `
      DELETE FROM email_verification_tokens
      WHERE expires_at < NOW()
        OR (used_at IS NOT NULL AND used_at < DATE_SUB(NOW(), INTERVAL 7 DAY))
    `;

    // IMPORTANTE: QueryTypes.DELETE devuelve OkPacket, no array
    const [result] = await sequelize.query(query, {
      type: QueryTypes.DELETE,
      ...options,
    });

    const affectedRows = result.affectedRows || 0;

    if (affectedRows > 0) {
      console.log(`[EmailVerification] Limpiados ${affectedRows} tokens expirados/usados`);
    }

    return affectedRows;
  },
};

module.exports = emailVerificationRepository;
