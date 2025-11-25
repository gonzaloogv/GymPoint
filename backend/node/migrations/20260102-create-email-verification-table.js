'use strict';

/**
 * MIGRACIÓN: Email Verification Tokens
 *
 * Esta migración crea la tabla para almacenar tokens de verificación de email:
 * - email_verification_tokens: Tokens temporales enviados por email para confirmar cuentas
 *
 * FLUJO:
 * 1. Usuario se registra → genera token → envía email
 * 2. Usuario hace clic en link → valida token → marca email_verified=true
 * 3. Tokens expiran en 24h
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('[Email Verification] Creando tabla email_verification_tokens...\n');

      // Helper para verificar si una tabla existe
      const tableExists = async (tableName) => {
        const tables = await queryInterface.showAllTables({ transaction });
        return tables.includes(tableName);
      };

      // Helper para verificar si un índice existe
      const indexExists = async (tableName, indexName) => {
        try {
          const indexes = await queryInterface.showIndex(tableName, { transaction });
          return indexes.some(idx => idx.name === indexName);
        } catch (error) {
          return false;
        }
      };

      // ========================================
      // TABLA: email_verification_tokens
      // ========================================
      if (!(await tableExists('email_verification_tokens'))) {
        console.log('Creando tabla "email_verification_tokens"...');
        await queryInterface.createTable('email_verification_tokens', {
          id_verification_token: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del token de verificación'
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
            comment: 'Cuenta asociada al token'
          },
          token: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Token UUID único para verificación'
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: false,
            comment: 'Fecha de expiración (24h por defecto)'
          },
          used_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Fecha en que fue usado (NULL si no usado)'
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });
        console.log('Tabla "email_verification_tokens" creada');
      } else {
        console.log('Tabla "email_verification_tokens" ya existe, omitiendo creación');
      }

      // Índice para búsquedas por cuenta
      if (!(await indexExists('email_verification_tokens', 'idx_verification_account'))) {
        await queryInterface.addIndex('email_verification_tokens', ['id_account'], {
          name: 'idx_verification_account',
          transaction
        });
        console.log('Índice idx_verification_account creado');
      } else {
        console.log('Índice idx_verification_account ya existe, omitiendo');
      }

      // Índice para búsquedas por token (ya tiene índice único automático)
      // Índice compuesto para limpieza de tokens expirados
      if (!(await indexExists('email_verification_tokens', 'idx_verification_expiration'))) {
        await queryInterface.addIndex('email_verification_tokens', ['expires_at', 'used_at'], {
          name: 'idx_verification_expiration',
          transaction
        });
        console.log('Índice idx_verification_expiration creado\n');
      } else {
        console.log('Índice idx_verification_expiration ya existe, omitiendo\n');
      }

      await transaction.commit();
      console.log('========================================');
      console.log('MIGRACIÓN EMAIL VERIFICATION COMPLETADA');
      console.log('========================================');
      console.log('Tabla creada: email_verification_tokens');
      console.log('Índices creados: 3 (1 único automático + 2 adicionales)');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error('Error en migración email verification:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Revirtiendo migración email verification...\n');

      await queryInterface.dropTable('email_verification_tokens', { transaction });
      console.log('Tabla "email_verification_tokens" eliminada');

      await transaction.commit();
      console.log('Migración email verification revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error('Error al revertir migración email verification:', error);
      throw error;
    }
  }
};
