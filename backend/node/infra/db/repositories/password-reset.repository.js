const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Repositorio para Password Reset Tokens
 *
 * Gestiona la creación, validación y limpieza de tokens de restablecimiento de contraseña.
 * Tokens single-use con expiración de 1 hora para mayor seguridad.
 */

const passwordResetRepository = {
  /**
   * Crear un nuevo token de reset de contraseña
   *
   * @param {Object} data
   * @param {number} data.id_account - ID de la cuenta
   * @param {string} data.token - Token UUID
   * @param {Date} data.expires_at - Fecha de expiración (1 hora)
   * @param {string} [data.ip_address] - IP del solicitante (opcional)
   * @param {string} [data.user_agent] - User agent (opcional)
   * @param {Object} [options] - Opciones Sequelize (transaction, etc.)
   * @returns {Promise<Object>}
   */
  async createResetToken(data, options = {}) {
    const query = `
      INSERT INTO password_reset_tokens (id_account, token, expires_at, ip_address, user_agent)
      VALUES (:id_account, :token, :expires_at, :ip_address, :user_agent)
    `;

    await sequelize.query(query, {
      replacements: {
        id_account: data.id_account,
        token: data.token,
        expires_at: data.expires_at,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
      },
      type: QueryTypes.INSERT,
      ...options,
    });

    // Retornar el token creado
    return this.findByToken(data.token, options);
  },

  /**
   * Buscar token de reset por valor del token
   *
   * @param {string} token - Token UUID
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<Object|null>}
   */
  async findByToken(token, options = {}) {
    const query = `
      SELECT
        id_reset_token,
        id_account,
        token,
        expires_at,
        used_at,
        ip_address,
        user_agent,
        created_at
      FROM password_reset_tokens
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
        id_reset_token,
        id_account,
        token,
        expires_at,
        used_at,
        ip_address,
        user_agent,
        created_at
      FROM password_reset_tokens
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
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token = :token
        AND used_at IS NULL
    `;

    const [result] = await sequelize.query(query, {
      replacements: { token },
      type: QueryTypes.UPDATE,
      ...options,
    });

    return result.affectedRows > 0;
  },

  /**
   * Revocar (eliminar) todos los tokens de reset de una cuenta
   * Útil al generar un nuevo token (solo 1 activo por cuenta)
   *
   * @param {number} idAccount - ID de la cuenta
   * @param {Object} [options] - Opciones Sequelize
   * @returns {Promise<number>} Número de tokens eliminados
   */
  async revokeAllByAccount(idAccount, options = {}) {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE id_account = :idAccount
    `;

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
        id_reset_token,
        id_account,
        token,
        expires_at,
        used_at,
        ip_address,
        user_agent,
        created_at
      FROM password_reset_tokens
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
      DELETE FROM password_reset_tokens
      WHERE expires_at < NOW()
        OR (used_at IS NOT NULL AND used_at < DATE_SUB(NOW(), INTERVAL 7 DAY))
    `;

    const [result] = await sequelize.query(query, {
      type: QueryTypes.DELETE,
      ...options,
    });

    const affectedRows = result.affectedRows || 0;

    if (affectedRows > 0) {
      console.log(`[PasswordReset] Limpiados ${affectedRows} tokens expirados/usados`);
    }

    return affectedRows;
  },
};

module.exports = passwordResetRepository;
