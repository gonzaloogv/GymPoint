'use strict';

/**
 * MIGRACIÓN 4: Fitness Tracking System
 *
 * Esta migración crea las tablas para el seguimiento de asistencia y fitness:
 * - frequency: Metas de frecuencia semanal del usuario por gimnasio
 * - frequency_history: Histórico de cumplimiento de metas
 * - streak: Rachas de asistencia del usuario
 * - assistance: Registros de check-in/check-out a gimnasios
 * - user_gym: Suscripción del usuario a un gimnasio específico
 *
 * IMPORTANTE: Esta migración también agrega la FK de user_profiles.id_streak
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' [4/7] Creando tablas de fitness tracking...\n');

      // ========================================
      // TABLA: frequency
      // ========================================
      console.log(' Creando tabla "frequency"...');
      await queryInterface.createTable('frequency', {
        id_frequency: {
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
          onUpdate: 'CASCADE',
          comment: 'Usuario al que pertenece la frecuencia'
        },
        goal: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 3,
          comment: 'Meta de asistencias por semana'
        },
        assist: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Asistencias en la semana actual'
        },
        achieved_goal: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Cantidad de semanas con meta cumplida'
        },
        week_start_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Fecha de inicio de la semana actual'
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

      await queryInterface.addIndex('frequency', ['id_user_profile'], {
        name: 'idx_frequency_user',
        transaction
      });
      await queryInterface.addIndex('frequency', ['week_start_date'], {
        name: 'idx_frequency_week',
        transaction
      });
      console.log(' Tabla "frequency" creada con 2 índices\n');

      // ========================================
      // TABLA: frequency_history
      // ========================================
      console.log(' Creando tabla "frequency_history"...');
      await queryInterface.createTable('frequency_history', {
        id_history: {
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
        week_start_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Inicio de la semana'
        },
        week_end_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Fin de la semana'
        },
        goal: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Meta de la semana'
        },
        achieved: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Asistencias logradas'
        },
        goal_met: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si se cumplió la meta'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('frequency_history', ['id_user_profile', 'week_start_date'], {
        unique: true,
        name: 'idx_frequency_history_user_week',
        transaction
      });
      console.log(' Tabla "frequency_history" creada con índice único\n');

      // ========================================
      // TABLA: streak
      // ========================================
      console.log(' Creando tabla "streak"...');
      await queryInterface.createTable('streak', {
        id_streak: {
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
          onUpdate: 'CASCADE',
          comment: 'Usuario al que pertenece la racha'
        },
        id_frequency: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'frequency',
            key: 'id_frequency'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Frecuencia asociada'
        },
        value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Racha actual (días consecutivos)'
        },
        last_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Última racha (antes de perderla)'
        },
        max_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Racha máxima histórica'
        },
        recovery_items: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Ítems de recuperación de racha disponibles'
        },
        last_assistance_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Fecha de la última asistencia'
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

      await queryInterface.addIndex('streak', ['id_user_profile'], {
        name: 'idx_streak_user',
        transaction
      });
      await queryInterface.addIndex('streak', ['id_frequency'], {
        name: 'idx_streak_frequency',
        transaction
      });
      await queryInterface.addIndex('streak', ['value'], {
        name: 'idx_streak_value',
        transaction
      });
      console.log(' Tabla "streak" creada con 3 índices\n');

      // ========================================
      // TABLA: user_gym
      // ========================================
      console.log(' Creando tabla "user_gym"...');
      await queryInterface.createTable('user_gym', {
        id_user_gym: {
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
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        subscription_plan: {
          type: Sequelize.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
          allowNull: true,
          comment: 'Tipo de plan contratado'
        },
        subscription_start: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Inicio de la suscripción'
        },
        subscription_end: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Fin de la suscripción'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Si la suscripción está activa'
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

      await queryInterface.addIndex('user_gym', ['id_user_profile', 'id_gym'], {
        unique: true,
        name: 'idx_user_gym_user_gym',
        transaction
      });
      await queryInterface.addIndex('user_gym', ['is_active', 'subscription_end'], {
        name: 'idx_user_gym_active_end',
        transaction
      });
      console.log(' Tabla "user_gym" creada con 2 índices\n');

      // ========================================
      // TABLA: assistance
      // ========================================
      console.log(' Creando tabla "assistance"...');
      await queryInterface.createTable('assistance', {
        id_assistance: {
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
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_streak: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'streak',
            key: 'id_streak'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Fecha de la asistencia'
        },
        check_in_time: {
          type: Sequelize.TIME,
          allowNull: false,
          comment: 'Hora de entrada'
        },
        check_out_time: {
          type: Sequelize.TIME,
          allowNull: true,
          comment: 'Hora de salida'
        },
        duration_minutes: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Duración en minutos'
        },
        auto_checkin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si fue auto check-in por geofence'
        },
        distance_meters: {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: true,
          comment: 'Distancia en metros al momento del check-in'
        },
        verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si la asistencia fue verificada'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('assistance', ['id_user_profile', 'date'], {
        name: 'idx_assistance_user_date',
        transaction
      });
      await queryInterface.addIndex('assistance', ['id_gym', 'date'], {
        name: 'idx_assistance_gym_date',
        transaction
      });
      await queryInterface.addIndex('assistance', ['auto_checkin', 'date'], {
        name: 'idx_assistance_auto_date',
        transaction
      });
      await queryInterface.addIndex('assistance', ['duration_minutes'], {
        name: 'idx_assistance_duration',
        transaction
      });
      console.log(' Tabla "assistance" creada con 4 índices\n');

      // ========================================
      // AGREGAR FK: user_profiles.id_streak
      // ========================================
      console.log(' Agregando FK user_profiles.id_streak -> streak...');
      await queryInterface.sequelize.query(`
        ALTER TABLE \`user_profiles\`
        ADD CONSTRAINT \`fk_user_profile_streak\`
        FOREIGN KEY (\`id_streak\`)
        REFERENCES \`streak\` (\`id_streak\`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `, { transaction });
      console.log(' FK agregada\n');

      // ========================================
      // TABLA: presence (Auto Check-in System)
      // ========================================
      console.log(' Creando tabla "presence"...');
      await queryInterface.createTable('presence', {
        id_presence: {
          type: Sequelize.BIGINT,
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
          onUpdate: 'CASCADE',
          comment: 'Usuario detectado en geofence'
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Gimnasio donde se detectó presencia'
        },
        first_seen_at: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Primera detección en geofence'
        },
        last_seen_at: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Última actualización de ubicación'
        },
        exited_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Cuándo salió del geofence'
        },
        status: {
          type: Sequelize.ENUM('DETECTING', 'CONFIRMED', 'EXITED'),
          allowNull: false,
          defaultValue: 'DETECTING',
          comment: 'DETECTING: detectando presencia, CONFIRMED: check-in confirmado, EXITED: salió del gym'
        },
        converted_to_assistance: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si se convirtió en registro de asistencia'
        },
        id_assistance: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'assistance',
            key: 'id_assistance'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'ID de la asistencia creada (si se confirmó)'
        },
        distance_meters: {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: true,
          comment: 'Distancia al centro del gimnasio en metros'
        },
        accuracy_meters: {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: true,
          comment: 'Precisión del GPS en metros'
        },
        location_updates_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'Cantidad de actualizaciones de ubicación recibidas'
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

      await queryInterface.addIndex('presence', ['id_user_profile', 'id_gym'], {
        name: 'idx_presence_user_gym',
        transaction
      });
      await queryInterface.addIndex('presence', ['status'], {
        name: 'idx_presence_status',
        transaction
      });
      await queryInterface.addIndex('presence', ['id_assistance'], {
        name: 'idx_presence_assistance',
        transaction
      });
      console.log(' Tabla "presence" creada con 3 índices\n');

      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 4 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 6');
      console.log('   - frequency, frequency_history');
      console.log('   - streak');
      console.log('   - user_gym');
      console.log('   - assistance');
      console.log('   - presence (auto check-in system)');
      console.log(' Índices creados: 14');
      console.log(' FK user_profiles.id_streak agregada');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 4:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 4...\n');

      // Remover FK de user_profiles primero
      await queryInterface.sequelize.query(`
        ALTER TABLE \`user_profiles\`
        DROP FOREIGN KEY \`fk_user_profile_streak\`
      `, { transaction });

      // Eliminar tablas en orden inverso
      await queryInterface.dropTable('presence', { transaction });
      await queryInterface.dropTable('assistance', { transaction });
      await queryInterface.dropTable('user_gym', { transaction });
      await queryInterface.dropTable('streak', { transaction });
      await queryInterface.dropTable('frequency_history', { transaction });
      await queryInterface.dropTable('frequency', { transaction });

      await transaction.commit();
      console.log(' Migración 4 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 4:', error);
      throw error;
    }
  }
};
