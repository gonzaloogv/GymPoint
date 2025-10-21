'use strict';

/**
 * Migración: Separación de Cuentas y Perfiles
 * 
 * Esta migración implementa una arquitectura limpia que separa:
 * - Autenticación (accounts) de Datos de Dominio (profiles)
 * - Usuarios de la app (user_profiles) de Administradores (admin_profiles)
 * 
 * Estructura:
 * - accounts: Credenciales y autenticación
 * - roles: Catálogo de roles del sistema
 * - account_roles: Relación many-to-many entre accounts y roles
 * - user_profiles: Perfil de usuario de la app (fitness)
 * - admin_profiles: Perfil de administrador del sistema
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando migración de arquitectura de cuentas y perfiles...');
      
      // ========================================
      // 1. TABLA: accounts (Autenticación)
      // ========================================
      await queryInterface.createTable('accounts', {
        id_account: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'ID único de la cuenta'
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Email único para login'
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Hash de contraseña (NULL si es login social)'
        },
        auth_provider: {
          type: Sequelize.ENUM('local', 'google'),
          allowNull: false,
          defaultValue: 'local',
          comment: 'Proveedor de autenticación'
        },
        google_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true,
          comment: 'ID de Google (si usa Google OAuth)'
        },
        email_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si el email está verificado'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Si la cuenta está activa (no baneada)'
        },
        last_login: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Última fecha de login'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      await queryInterface.addIndex('accounts', ['email'], { 
        name: 'idx_accounts_email',
        transaction 
      });
      await queryInterface.addIndex('accounts', ['google_id'], { 
        name: 'idx_accounts_google_id',
        transaction 
      });
      await queryInterface.addIndex('accounts', ['is_active'], { 
        name: 'idx_accounts_is_active',
        transaction 
      });
      
      console.log('✅ Tabla "accounts" creada');

      // ========================================
      // 2. TABLA: roles (Catálogo de Roles)
      // ========================================
      await queryInterface.createTable('roles', {
        id_role: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        role_name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: 'Nombre del rol (USER, ADMIN, MODERATOR, etc.)'
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Descripción del rol'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      console.log('✅ Tabla "roles" creada');

      // ========================================
      // 3. TABLA: account_roles (RBAC)
      // ========================================
      await queryInterface.createTable('account_roles', {
        id_account_role: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_account: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'accounts',
            key: 'id_account'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_role: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id_role'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        assigned_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      // Índice único para evitar duplicados
      await queryInterface.addIndex('account_roles', ['id_account', 'id_role'], {
        unique: true,
        name: 'unique_account_role',
        transaction
      });
      
      console.log('✅ Tabla "account_roles" creada');

      // ========================================
      // 4. TABLA: user_profiles (Perfil Usuario App)
      // ========================================
      await queryInterface.createTable('user_profiles', {
        id_user_profile: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
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
          allowNull: false
        },
        lastname: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        gender: {
          type: Sequelize.ENUM('M', 'F', 'O'),
          allowNull: false,
          defaultValue: 'O'
        },
        age: {
          type: Sequelize.TINYINT,
          allowNull: true
        },
        locality: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        subscription: {
          type: Sequelize.ENUM('FREE', 'PREMIUM'),
          allowNull: false,
          defaultValue: 'FREE',
          comment: 'Nivel de suscripción del usuario'
        },
        tokens: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Tokens acumulados'
        },
        id_streak: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Racha actual del usuario'
        },
        profile_picture_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      await queryInterface.addIndex('user_profiles', ['subscription'], { 
        name: 'idx_user_profiles_subscription',
        transaction 
      });
      await queryInterface.addIndex('user_profiles', ['tokens'], { 
        name: 'idx_user_profiles_tokens',
        transaction 
      });
      
      console.log('✅ Tabla "user_profiles" creada');

      // ========================================
      // 5. TABLA: admin_profiles (Perfil Admin)
      // ========================================
      await queryInterface.createTable('admin_profiles', {
        id_admin_profile: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
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
          allowNull: false
        },
        lastname: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        department: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Departamento (IT, Support, Management, etc.)'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notas internas sobre el admin'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      console.log('✅ Tabla "admin_profiles" creada');

      // ========================================
      // 6. INSERTAR ROLES INICIALES
      // ========================================
      await queryInterface.bulkInsert('roles', [
        {
          role_name: 'USER',
          description: 'Usuario normal de la aplicación móvil',
          created_at: new Date()
        },
        {
          role_name: 'ADMIN',
          description: 'Administrador del sistema con acceso total',
          created_at: new Date()
        }
      ], { transaction });
      
      console.log('✅ Roles iniciales insertados');

      await transaction.commit();
      console.log('✅ Migración completada exitosamente\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revirtiendo migración...');
      
      // Eliminar en orden inverso por las FK
      await queryInterface.dropTable('admin_profiles', { transaction });
      console.log('✅ Tabla "admin_profiles" eliminada');
      
      await queryInterface.dropTable('user_profiles', { transaction });
      console.log('✅ Tabla "user_profiles" eliminada');
      
      await queryInterface.dropTable('account_roles', { transaction });
      console.log('✅ Tabla "account_roles" eliminada');
      
      await queryInterface.dropTable('roles', { transaction });
      console.log('✅ Tabla "roles" eliminada');
      
      await queryInterface.dropTable('accounts', { transaction });
      console.log('✅ Tabla "accounts" eliminada');
      
      await transaction.commit();
      console.log('✅ Migración revertida\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir:', error);
      throw error;
    }
  }
};

