'use strict';

/**
 * MIGRACIÓN 7: Media, Notifications and External Payments
 *
 * Esta migración crea las tablas de soporte:
 * - media: Gestión de archivos multimedia
 * - notification: Notificaciones para usuarios
 * - user_notification_settings: Preferencias de notificaciones
 * - user_device_token: Tokens de dispositivos para push notifications
 * - mercadopago_payment: Transacciones de MercadoPago
 *
 * Esta es la última migración del set base consolidado
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' [7/7] Creando tablas de media, notificaciones y pagos...\n');

      // ========================================
      // TABLA: media
      // ========================================
      console.log(' Creando tabla "media"...');
      await queryInterface.createTable('media', {
        id_media: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        entity_type: {
          type: Sequelize.ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS', 'REVIEW'),
          allowNull: false,
          comment: 'Tipo de entidad a la que pertenece'
        },
        entity_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'ID de la entidad'
        },
        media_type: {
          type: Sequelize.ENUM('IMAGE', 'VIDEO'),
          allowNull: false,
          defaultValue: 'IMAGE'
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        thumbnail_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Tamaño en bytes'
        },
        mime_type: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        width: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        height: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        is_primary: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si es la imagen principal'
        },
        display_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        uploaded_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('media', ['entity_type', 'entity_id'], {
        name: 'idx_media_entity',
        transaction
      });
      await queryInterface.addIndex('media', ['entity_type', 'entity_id', 'is_primary'], {
        name: 'idx_media_primary',
        transaction
      });
      console.log(' Tabla "media" creada con 2 índices\n');

      // ========================================
      // TABLA: notification
      // ========================================
      console.log(' Creando tabla "notification"...');
      await queryInterface.createTable('notification', {
        id_notification: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        type: {
          type: Sequelize.ENUM('REMINDER', 'ACHIEVEMENT', 'REWARD', 'GYM_UPDATE', 'PAYMENT', 'SOCIAL', 'SYSTEM', 'CHALLENGE'),
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        data: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Datos adicionales (deep links, etc.)'
        },
        priority: {
          type: Sequelize.ENUM('LOW', 'NORMAL', 'HIGH'),
          allowNull: false,
          defaultValue: 'NORMAL'
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        read_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        scheduled_for: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha programada de envío'
        },
        sent_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha real de envío'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('notification', ['id_user_profile', 'is_read', 'created_at'], {
        name: 'idx_notification_user_read',
        transaction
      });
      await queryInterface.addIndex('notification', ['scheduled_for', 'sent_at'], {
        name: 'idx_notification_scheduled',
        transaction
      });
      await queryInterface.addIndex('notification', ['type'], {
        name: 'idx_notification_type',
        transaction
      });
      console.log(' Tabla "notification" creada con 3 índices\n');

      // ========================================
      // TABLA: user_notification_settings
      // ========================================
      console.log(' Creando tabla "user_notification_settings"...');
      await queryInterface.createTable('user_notification_settings', {
        id_setting: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        reminders_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        achievements_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        rewards_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        gym_updates_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        payment_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        social_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        system_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        challenge_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        push_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Push notifications globales'
        },
        email_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        quiet_hours_start: {
          type: Sequelize.TIME,
          allowNull: true,
          comment: 'Inicio de horario silencioso'
        },
        quiet_hours_end: {
          type: Sequelize.TIME,
          allowNull: true,
          comment: 'Fin de horario silencioso'
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

      await queryInterface.addIndex('user_notification_settings', ['id_user_profile'], {
        unique: true,
        name: 'idx_notif_settings_user',
        transaction
      });
      console.log(' Tabla "user_notification_settings" creada con índice único\n');

      // ========================================
      // TABLA: user_device_token
      // ========================================
      console.log(' Creando tabla "user_device_token"...');
      await queryInterface.createTable('user_device_token', {
        id_device_token: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        token: {
          type: Sequelize.STRING(500),
          allowNull: false,
          unique: true,
          comment: 'Token del dispositivo (FCM, APNS)'
        },
        platform: {
          type: Sequelize.ENUM('IOS', 'ANDROID', 'WEB'),
          allowNull: false
        },
        device_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'ID único del dispositivo'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        last_used_at: {
          type: Sequelize.DATE,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('user_device_token', ['id_user_profile', 'is_active'], {
        name: 'idx_device_token_user_active',
        transaction
      });
      await queryInterface.addIndex('user_device_token', ['token'], {
        unique: true,
        name: 'idx_device_token_token',
        transaction
      });
      console.log(' Tabla "user_device_token" creada con 2 índices\n');

      // ========================================
      // TABLA: mercadopago_payment
      // ========================================
      console.log(' Creando tabla "mercadopago_payment"...');
      await queryInterface.createTable('mercadopago_payment', {
        id_mp_payment: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'Gimnasio si el pago es por suscripción'
        },
        payment_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true,
          comment: 'ID del pago en MercadoPago'
        },
        preference_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'ID de la preferencia de pago'
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'APPROVED', 'AUTHORIZED', 'IN_PROCESS', 'IN_MEDIATION', 'REJECTED', 'CANCELLED', 'REFUNDED', 'CHARGED_BACK'),
          allowNull: false,
          defaultValue: 'PENDING'
        },
        status_detail: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.STRING(3),
          allowNull: false,
          defaultValue: 'ARS',
          comment: 'Código de moneda (ISO 4217)'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        subscription_type: {
          type: Sequelize.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
          allowNull: true
        },
        payment_method_id: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        payment_type_id: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        payer_email: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        external_reference: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Referencia externa del negocio'
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Información adicional del pago'
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

      await queryInterface.addIndex('mercadopago_payment', ['payment_id'], {
        unique: true,
        name: 'idx_mp_payment_id',
        transaction
      });
      await queryInterface.addIndex('mercadopago_payment', ['preference_id'], {
        name: 'idx_mp_preference_id',
        transaction
      });
      await queryInterface.addIndex('mercadopago_payment', ['status'], {
        name: 'idx_mp_status',
        transaction
      });
      await queryInterface.addIndex('mercadopago_payment', ['id_user_profile', 'id_gym'], {
        name: 'idx_mp_user_gym',
        transaction
      });
      console.log(' Tabla "mercadopago_payment" creada con 4 índices\n');

      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 7 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 5');
      console.log('   - media');
      console.log('   - notification, user_notification_settings');
      console.log('   - user_device_token');
      console.log('   - mercadopago_payment');
      console.log(' Índices creados: 12');
      console.log('========================================\n');
      console.log(' TODAS LAS MIGRACIONES CONSOLIDADAS COMPLETADAS 🎉');
      console.log('========================================');
      console.log(' RESUMEN TOTAL:');
      console.log('   - 7 archivos de migración');
      console.log('   - 51 tablas creadas');
      console.log('   - Todas las PKs, FKs e índices configurados');
      console.log('   - Base de datos lista para producción');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 7:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 7...\n');

      // Eliminar en orden inverso
      await queryInterface.dropTable('mercadopago_payment', { transaction });
      await queryInterface.dropTable('user_device_token', { transaction });
      await queryInterface.dropTable('user_notification_settings', { transaction });
      await queryInterface.dropTable('notification', { transaction });
      await queryInterface.dropTable('media', { transaction });

      await transaction.commit();
      console.log(' Migración 7 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 7:', error);
      throw error;
    }
  }
};
