/**
 * Migración: Crear tabla password_reset_tokens
 *
 * Gestiona tokens de restablecimiento de contraseña con UUID.
 * Similar a email_verification_tokens pero con expiración más corta (1 hora).
 *
 * Características:
 * - Tokens UUID únicos y single-use
 * - Expiración de 1 hora (seguridad mayor)
 * - Rastreo de IP y user agent (auditoría)
 * - Cleanup automático de tokens expirados/usados
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[MIGRATION] Creando tabla password_reset_tokens...');

    await queryInterface.createTable('password_reset_tokens', {
      id_reset_token: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único del token de reset'
      },
      id_account: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id_account'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Cuenta que solicitó el reset'
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Token UUID para reset de contraseña'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del token (1 hora)'
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Fecha en que se usó el token (NULL si no usado)'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP desde donde se solicitó el reset (IPv4/IPv6)'
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'User agent del navegador/app'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del token'
      }
    });

    // Índices para performance
    await queryInterface.addIndex('password_reset_tokens', ['id_account'], {
      name: 'idx_password_reset_account'
    });

    await queryInterface.addIndex('password_reset_tokens', ['token'], {
      name: 'idx_password_reset_token',
      unique: true
    });

    await queryInterface.addIndex('password_reset_tokens', ['expires_at'], {
      name: 'idx_password_reset_expiration'
    });

    console.log('[MIGRATION] ✓ Tabla password_reset_tokens creada exitosamente');
  },

  async down(queryInterface, Sequelize) {
    console.log('[MIGRATION] Eliminando tabla password_reset_tokens...');

    await queryInterface.dropTable('password_reset_tokens');

    console.log('[MIGRATION] ✓ Tabla password_reset_tokens eliminada');
  }
};
