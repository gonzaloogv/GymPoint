'use strict';

/**
 * MIGRACIÓN 2: User and Admin Profile Tables
 *
 * Esta migración crea los perfiles de usuario que extienden las cuentas:
 * - user_profiles: Perfil de usuario de la app (información fitness y personal)
 * - admin_profiles: Perfil de administrador del sistema
 *
 * ARQUITECTURA:
 * - Separación clara entre Autenticación (accounts) y Datos de Dominio (profiles)
 * - Relación 1:1 entre account y profile (un account puede tener user_profile O admin_profile)
 * - Los perfiles contienen toda la información específica del dominio
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 [2/7] Creando tablas de perfiles...\n');

      // ========================================
      // TABLA: user_profiles
      // ========================================
      console.log('📋 Creando tabla "user_profiles"...');
      await queryInterface.createTable('user_profiles', {
        id_user_profile: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'ID único del perfil de usuario'
        },
        id_account: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'accounts',
            key: 'id_account'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Relación 1:1 con account'
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Nombre del usuario'
        },
        lastname: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Apellido del usuario'
        },
        gender: {
          type: Sequelize.ENUM('M', 'F', 'O'),
          allowNull: false,
          defaultValue: 'O',
          comment: 'Género: M (Masculino), F (Femenino), O (Otro)'
        },
        birth_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Fecha de nacimiento (YYYY-MM-DD)'
        },
        locality: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Localidad/Ciudad del usuario'
        },
        app_tier: {
          type: Sequelize.ENUM('FREE', 'PREMIUM'),
          allowNull: false,
          defaultValue: 'FREE',
          comment: 'Tier de la aplicación (FREE o PREMIUM)'
        },
        premium_since: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha desde que el usuario es premium'
        },
        premium_expires: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de expiración del premium'
        },
        tokens: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Tokens acumulados (balance actual)'
        },
        profile_picture_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL de la foto de perfil'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Soft delete: fecha de eliminación lógica'
        }
      }, { transaction });

      // Índices para búsquedas frecuentes
      await queryInterface.addIndex('user_profiles', ['id_account'], {
        unique: true,
        name: 'idx_user_profiles_account',
        transaction
      });
      await queryInterface.addIndex('user_profiles', ['app_tier'], {
        name: 'idx_user_profiles_app_tier',
        transaction
      });
      await queryInterface.addIndex('user_profiles', ['premium_expires'], {
        name: 'idx_user_profiles_premium_expires',
        transaction
      });
      await queryInterface.addIndex('user_profiles', ['tokens'], {
        name: 'idx_user_profiles_tokens',
        transaction
      });
      await queryInterface.addIndex('user_profiles', ['deleted_at'], {
        name: 'idx_user_profiles_deleted',
        transaction
      });
      console.log(' Tabla "user_profiles" creada con 5 índices\n');

      // ========================================
      // TABLA: admin_profiles
      // ========================================
      console.log(' Creando tabla "admin_profiles"...');
      await queryInterface.createTable('admin_profiles', {
        id_admin_profile: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'ID único del perfil de administrador'
        },
        id_account: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'accounts',
            key: 'id_account'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Relación 1:1 con account'
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Nombre del administrador'
        },
        lastname: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Apellido del administrador'
        },
        department: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Departamento (IT, Support, Management, etc.)'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notas internas sobre el administrador'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // Índice único para account
      await queryInterface.addIndex('admin_profiles', ['id_account'], {
        unique: true,
        name: 'idx_admin_profiles_account',
        transaction
      });
      console.log(' Tabla "admin_profiles" creada con 1 índice\n');

      // ========================================
      // TABLA: account_deletion_request
      // ========================================
      console.log(' Creando tabla "account_deletion_request"...');
      await queryInterface.createTable('account_deletion_request', {
        id_request: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'ID unico de la solicitud'
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
          comment: 'Cuenta que solicita eliminacion'
        },
        reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Razon de la eliminacion (opcional)'
        },
        scheduled_deletion_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Fecha programada para eliminar la cuenta'
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'CANCELLED', 'COMPLETED'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Estado de la solicitud'
        },
        requested_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Fecha de solicitud'
        },
        cancelled_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de cancelacion'
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de completado'
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Datos adicionales de la solicitud'
        }
      }, { transaction });

      // Indices para busquedas
      await queryInterface.addIndex('account_deletion_request', ['id_account'], {
        name: 'idx_account_deletion_account',
        transaction
      });
      await queryInterface.addIndex('account_deletion_request', ['status', 'scheduled_deletion_date'], {
        name: 'idx_account_deletion_status_date',
        transaction
      });
      console.log(' Tabla "account_deletion_request" creada con 2 indices\n');


      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 2 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 3');
      console.log('   - user_profiles');
      console.log('   - admin_profiles');
      console.log('   - account_deletion_request');
      console.log(' Índices creados: 7');
      console.log(' FKs a accounts: 3');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 2:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 2...\n');

      // Eliminar en orden inverso por las FK
      await queryInterface.dropTable('account_deletion_request', { transaction });
      console.log(' Tabla "account_deletion_request" eliminada');

      await queryInterface.dropTable('admin_profiles', { transaction });
      console.log(' Tabla "admin_profiles" eliminada');

      await queryInterface.dropTable('user_profiles', { transaction });
      console.log(' Tabla "user_profiles" eliminada');

      await transaction.commit();
      console.log(' Migración 2 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 2:', error);
      throw error;
    }
  }
};
