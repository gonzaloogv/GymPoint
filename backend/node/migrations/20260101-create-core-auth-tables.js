'use strict';

/**
 * MIGRACIÓN 1: Core Authentication Tables
 *
 * Esta migración crea la base del sistema de autenticación:
 * - accounts: Credenciales de login (email/password, Google OAuth)
 * - roles: Catálogo de roles del sistema (USER, ADMIN)
 * - account_roles: Relación many-to-many entre cuentas y roles (RBAC)
 * - refresh_token: Tokens JWT para refresh de sesiones
 *
 * IMPORTANTE: Esta es la base sobre la que se construyen los perfiles de usuario
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('[1/7] Creando tablas de autenticación...\n');

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
      // TABLA: accounts
      // ========================================
      if (!(await tableExists('accounts'))) {
        console.log('Creando tabla "accounts"...');
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
        }, { transaction });
        console.log('Tabla "accounts" creada');
      } else {
        console.log('Tabla "accounts" ya existe, omitiendo creación');
      }

      // Índice para búsquedas frecuentes (email y google_id ya tienen índices únicos automáticos)
      if (!(await indexExists('accounts', 'idx_accounts_is_active'))) {
        await queryInterface.addIndex('accounts', ['is_active'], {
          name: 'idx_accounts_is_active',
          transaction
        });
        console.log('Índice idx_accounts_is_active creado\n');
      } else {
        console.log('Índice idx_accounts_is_active ya existe, omitiendo\n');
      }

      // ========================================
      // TABLA: roles
      // ========================================
      if (!(await tableExists('roles'))) {
        console.log('Creando tabla "roles"...');
        await queryInterface.createTable('roles', {
          id_role: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del rol'
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
        console.log('Tabla "roles" creada\n');
      } else {
        console.log('Tabla "roles" ya existe, omitiendo creación\n');
      }

      // ========================================
      // TABLA: account_roles (RBAC)
      // ========================================
      if (!(await tableExists('account_roles'))) {
        console.log('Creando tabla "account_roles"...');
        await queryInterface.createTable('account_roles', {
          id_account_role: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único de la asignación'
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
            comment: 'Cuenta asociada'
          },
          id_role: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'roles',
              key: 'id_role'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Rol asignado'
          },
          assigned_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });
        console.log('Tabla "account_roles" creada');
      } else {
        console.log('Tabla "account_roles" ya existe, omitiendo creación');
      }

      // Índice único para evitar duplicados
      if (!(await indexExists('account_roles', 'unique_account_role'))) {
        await queryInterface.addIndex('account_roles', ['id_account', 'id_role'], {
          unique: true,
          name: 'unique_account_role',
          transaction
        });
        console.log('Índice unique_account_role creado\n');
      } else {
        console.log('Índice unique_account_role ya existe, omitiendo\n');
      }

      // ========================================
      // TABLA: refresh_token
      // ========================================
      if (!(await tableExists('refresh_token'))) {
        console.log('Creando tabla "refresh_token"...');
        await queryInterface.createTable('refresh_token', {
          id_refresh_token: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del refresh token'
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
            comment: 'Cuenta asociada'
          },
          token: {
            type: Sequelize.STRING(500),
            allowNull: false,
            unique: true,
            comment: 'Refresh token JWT'
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: false,
            comment: 'Fecha de expiración'
          },
          is_revoked: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Si el token ha sido revocado'
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });
        console.log('Tabla "refresh_token" creada');
      } else {
        console.log('Tabla "refresh_token" ya existe, omitiendo creación');
      }

      // Índices para búsquedas por cuenta y expiración (token ya tiene índice único automático)
      if (!(await indexExists('refresh_token', 'idx_refresh_token_account'))) {
        await queryInterface.addIndex('refresh_token', ['id_account'], {
          name: 'idx_refresh_token_account',
          transaction
        });
        console.log('Índice idx_refresh_token_account creado');
      } else {
        console.log('Índice idx_refresh_token_account ya existe, omitiendo');
      }

      if (!(await indexExists('refresh_token', 'idx_refresh_token_expiration'))) {
        await queryInterface.addIndex('refresh_token', ['expires_at', 'is_revoked'], {
          name: 'idx_refresh_token_expiration',
          transaction
        });
        console.log('Índice idx_refresh_token_expiration creado\n');
      } else {
        console.log('Índice idx_refresh_token_expiration ya existe, omitiendo\n');
      }

      // ========================================
      // DATOS INICIALES: Roles del sistema
      // ========================================
      const existingRoles = await queryInterface.sequelize.query(
        'SELECT role_name FROM roles',
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      const existingRoleNames = existingRoles.map(r => r.role_name);

      const rolesToInsert = [
        {
          role_name: 'USER',
          description: 'Usuario normal de la aplicación móvil',
          created_at: new Date()
        },
        {
          role_name: 'ADMIN',
          description: 'Administrador del sistema con acceso total',
          created_at: new Date()
        },
        {
          role_name: 'GYM_OWNER',
          description: 'Propietario de gimnasio con permisos de gestión',
          created_at: new Date()
        }
      ].filter(role => !existingRoleNames.includes(role.role_name));

      if (rolesToInsert.length > 0) {
        console.log(`Insertando ${rolesToInsert.length} roles iniciales...`);
        await queryInterface.bulkInsert('roles', rolesToInsert, { transaction });
        console.log(`${rolesToInsert.length} roles iniciales insertados\n`);
      } else {
        console.log('Roles iniciales ya existen, omitiendo inserción\n');
      }

      await transaction.commit();
      console.log('========================================');
      console.log('MIGRACIÓN 1 COMPLETADA');
      console.log('========================================');
      console.log('Tablas creadas: 4');
      console.log('   - accounts');
      console.log('   - roles');
      console.log('   - account_roles');
      console.log('   - refresh_token');
      console.log('Índices creados: 7 (3 únicos automáticos + 4 adicionales)');
      console.log('Roles iniciales: 3 (USER, ADMIN, GYM_OWNER)');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error('Error en migración 1:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Revirtiendo migración 1...\n');

      // Eliminar en orden inverso por las FK
      await queryInterface.dropTable('refresh_token', { transaction });
      console.log('Tabla "refresh_token" eliminada');

      await queryInterface.dropTable('account_roles', { transaction });
      console.log('Tabla "account_roles" eliminada');

      await queryInterface.dropTable('roles', { transaction });
      console.log('Tabla "roles" eliminada');

      await queryInterface.dropTable('accounts', { transaction });
      console.log('Tabla "accounts" eliminada');

      await transaction.commit();
      console.log('Migración 1 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error('Error al revertir migración 1:', error);
      throw error;
    }
  }
};
