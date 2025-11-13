'use strict';

/**
 * MIGRACIÓN 6: Rewards, Challenges and Achievements System
 *
 * Esta migración crea el sistema de gamificación:
 * - reward: Catálogo de recompensas disponibles
 * - reward_code: Códigos para canjear recompensas
 * - claimed_reward: Recompensas reclamadas por usuarios
 * - token_ledger: Ledger de movimientos de tokens (ingresos/gastos)
 * - reward_gym_stats_daily: Estadísticas diarias de recompensas por gym
 * - daily_challenge_template: Plantillas reutilizables de desafíos
 * - daily_challenge_settings: Configuración global del sistema
 * - daily_challenge: Desafíos diarios disponibles
 * - user_daily_challenge: Progreso del usuario en desafíos
 * - achievement_definition: Definición de logros disponibles
 * - user_achievement: Logros del usuario
 * - user_achievement_event: Histórico de eventos de logros
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' [6/7] Creando tablas de recompensas, desafíos y logros...\n');

      // ========================================
      // TABLA: reward
      // ========================================
      console.log(' Creando tabla "reward"...');
      await queryInterface.createTable('reward', {
        id_reward: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Gimnasio que ofrece la recompensa (NULL = recompensa global)'
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        reward_type: {
          type: Sequelize.ENUM(
            'descuento',
            'pase_gratis',
            'producto',
            'servicio',
            'merchandising',
            'token_multiplier',
            'streak_saver',
            'otro'
          ),
          allowNull: true,
          comment: 'Tipo de recompensa: descuento, pase_gratis, producto, servicio, merchandising, token_multiplier, streak_saver, otro'
        },
        effect_value: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Valor del efecto (ej: días de premium, % descuento, etc)'
        },
        cooldown_days: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Días de cooldown entre reclamos (0 = sin cooldown)'
        },
        is_unlimited: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Indica si no se decrementa el stock al reclamar'
        },
        requires_premium: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Solo usuarios premium pueden reclamarla'
        },
        is_stackable: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Permite acumularla en inventario'
        },
        max_stack: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'Cantidad máxima acumulable'
        },
        duration_days: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Duración del efecto en días (para multiplicadores)'
        },
        token_cost: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Costo en tokens'
        },
        discount_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
          comment: 'Porcentaje de descuento si aplica'
        },
        discount_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          comment: 'Monto fijo de descuento'
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Stock disponible (NULL = ilimitado)'
        },
        valid_from: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        valid_until: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        image_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL de la imagen de la recompensa'
        },
        terms: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Términos y condiciones de la recompensa'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('reward', ['id_gym', 'is_active'], {
        name: 'idx_reward_gym_active',
        transaction
      });
      await queryInterface.addIndex('reward', ['token_cost'], {
        name: 'idx_reward_cost',
        transaction
      });
      await queryInterface.addIndex('reward', ['deleted_at'], {
        name: 'idx_reward_deleted',
        transaction
      });
      console.log(' Tabla "reward" creada con 3 índices\n');

      // ========================================
      // TABLA: user_reward_inventory
      // ========================================
      console.log(' Creando tabla "user_reward_inventory"...');
      await queryInterface.createTable('user_reward_inventory', {
        id_inventory: {
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
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'reward',
            key: 'id_reward'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        item_type: {
          type: Sequelize.ENUM('streak_saver', 'token_multiplier'),
          allowNull: false
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        max_stack: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
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

      await queryInterface.addConstraint('user_reward_inventory', {
        fields: ['id_user_profile', 'id_reward', 'item_type'],
        type: 'unique',
        name: 'uniq_user_reward_inventory_per_reward',
        transaction
      });

      await queryInterface.addIndex('user_reward_inventory', ['id_user_profile'], {
        name: 'idx_user_reward_inventory_user',
        transaction
      });

      await queryInterface.addIndex('user_reward_inventory', ['item_type'], {
        name: 'idx_user_reward_inventory_type',
        transaction
      });
      console.log(' Tabla "user_reward_inventory" creada con índices');

      // ========================================
      // TABLA: active_user_effects
      // ========================================
      console.log(' Creando tabla "active_user_effects"...');
      await queryInterface.createTable('active_user_effects', {
        id_effect: {
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
        effect_type: {
          type: Sequelize.ENUM('token_multiplier'),
          allowNull: false
        },
        multiplier_value: {
          type: Sequelize.DECIMAL(3, 1),
          allowNull: false
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        is_consumed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('active_user_effects', ['id_user_profile', 'expires_at', 'is_consumed'], {
        name: 'idx_active_effects_user_expires',
        transaction
      });

      await queryInterface.addIndex('active_user_effects', ['effect_type'], {
        name: 'idx_active_effects_type',
        transaction
      });
      console.log(' Tabla "active_user_effects" creada con índices');

      // ========================================
      // TABLA: reward_cooldown
      // ========================================
      console.log(' Creando tabla "reward_cooldown"...');
      await queryInterface.createTable('reward_cooldown', {
        id_cooldown: {
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
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'reward',
            key: 'id_reward'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        last_claimed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        can_claim_again_at: {
          type: Sequelize.DATE,
          allowNull: false
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

      await queryInterface.addConstraint('reward_cooldown', {
        fields: ['id_user_profile', 'id_reward'],
        type: 'unique',
        name: 'uniq_reward_cooldown_user_reward',
        transaction
      });

      await queryInterface.addIndex('reward_cooldown', ['id_user_profile'], {
        name: 'idx_reward_cooldown_user',
        transaction
      });

      await queryInterface.addIndex('reward_cooldown', ['can_claim_again_at'], {
        name: 'idx_reward_cooldown_time',
        transaction
      });
      console.log(' Tabla "reward_cooldown" creada con índices');

      // ========================================
      // TABLA: reward_code
      // ========================================
      console.log(' Creando tabla "reward_code"...');
      await queryInterface.createTable('reward_code', {
        id_code: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'reward',
            key: 'id_reward'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: 'Código único de la recompensa'
        },
        is_used: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('reward_code', ['code'], {
        unique: true,
        name: 'idx_reward_code_code',
        transaction
      });
      await queryInterface.addIndex('reward_code', ['id_reward', 'is_used'], {
        name: 'idx_reward_code_reward_used',
        transaction
      });
      console.log(' Tabla "reward_code" creada con 2 índices\n');

      // ========================================
      // TABLA: claimed_reward
      // ========================================
      console.log(' Creando tabla "claimed_reward"...');
      await queryInterface.createTable('claimed_reward', {
        id_claimed_reward: {
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
        id_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'reward',
            key: 'id_reward'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_code: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'reward_code',
            key: 'id_code'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        claimed_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'ACTIVE', 'USED', 'EXPIRED'),
          allowNull: false,
          defaultValue: 'PENDING'
        },
        tokens_spent: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Tokens gastados en esta recompensa'
        },
        used_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Cuándo se usó/canjeó la recompensa'
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha y hora de expiración de la recompensa'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('claimed_reward', ['id_user_profile', 'claimed_date'], {
        name: 'idx_claimed_reward_user_date',
        transaction
      });
      await queryInterface.addIndex('claimed_reward', ['status'], {
        name: 'idx_claimed_reward_status',
        transaction
      });
      await queryInterface.addIndex('claimed_reward', ['expires_at', 'status'], {
        name: 'idx_claimed_reward_expires',
        transaction
      });
      console.log(' Tabla "claimed_reward" creada con 3 índices\n');

      // ========================================
      // TABLA: token_ledger
      // ========================================
      console.log(' Creando tabla "token_ledger"...');
      await queryInterface.createTable('token_ledger', {
        id_ledger: {
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
          onUpdate: 'CASCADE'
        },
        delta: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Cambio en tokens (positivo=ganancia, negativo=gasto)'
        },
        balance_after: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Balance después de aplicar el delta'
        },
        reason: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, DAILY_CHALLENGE, etc.'
        },
        ref_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Tipo de referencia (assistance, claimed_reward, user_daily_challenge, etc.)'
        },
        ref_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          comment: 'ID de la entidad referenciada'
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Información adicional'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('token_ledger', ['id_user_profile', 'created_at'], {
        name: 'idx_token_ledger_user_date',
        transaction
      });
      await queryInterface.addIndex('token_ledger', ['reason'], {
        name: 'idx_token_ledger_reason',
        transaction
      });
      await queryInterface.addIndex('token_ledger', ['ref_type', 'ref_id'], {
        name: 'idx_token_ledger_ref',
        transaction
      });
      console.log(' Tabla "token_ledger" creada con 3 índices\n');

      // ========================================
      // TABLA: reward_gym_stats_daily
      // ========================================
      console.log(' Creando tabla "reward_gym_stats_daily"...');
      await queryInterface.createTable('reward_gym_stats_daily', {
        id_stat: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
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
        day: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        total_rewards_claimed: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        total_tokens_spent: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        unique_users: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addConstraint('reward_gym_stats_daily', {
        fields: ['id_gym', 'day'],
        type: 'unique',
        name: 'uniq_reward_stats_gym_day'
      }, { transaction });

      await queryInterface.addIndex('reward_gym_stats_daily', ['day'], {
        name: 'idx_reward_stats_day',
        transaction
      });
      console.log(' Tabla "reward_gym_stats_daily" creada con constraint único e índice\n');

      // ========================================
      // TABLA: daily_challenge_template
      // ========================================
      console.log(' Creando tabla "daily_challenge_template"...');
      await queryInterface.createTable('daily_challenge_template', {
        id_template: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Título de la plantilla'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Descripción del desafío'
        },
        challenge_type: {
          type: Sequelize.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY'),
          allowNull: false,
          comment: 'Tipo de desafío'
        },
        target_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Valor objetivo (ej: 30 minutos, 5 ejercicios)'
        },
        target_unit: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Unidad del objetivo (minutos, ejercicios, días)'
        },
        tokens_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
          comment: 'Tokens que se otorgan al completar'
        },
        difficulty: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'MEDIUM',
          comment: 'Dificultad: EASY, MEDIUM, HARD'
        },
        rotation_weight: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'Peso para selección aleatoria (mayor = más probable)'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Si está activo para rotación'
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID del admin que creó la plantilla'
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

      await queryInterface.addIndex('daily_challenge_template', ['is_active'], {
        name: 'idx_template_active',
        transaction
      });
      console.log(' Tabla "daily_challenge_template" creada con 1 índice\n');

      // ========================================
      // TABLA: daily_challenge_settings
      // ========================================
      console.log(' Creando tabla "daily_challenge_settings"...');
      await queryInterface.createTable('daily_challenge_settings', {
        id_config: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          defaultValue: 1,
          comment: 'Singleton: solo existe id=1'
        },
        auto_rotation_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Si la rotación automática está habilitada'
        },
        rotation_cron: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: '1 0 * * *',
          comment: 'Cron expression para rotación (default: 00:01 diario)'
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // Insertar configuración inicial
      await queryInterface.sequelize.query(
        `INSERT INTO daily_challenge_settings (id_config, auto_rotation_enabled, rotation_cron)
         VALUES (1, true, '1 0 * * *')
         ON DUPLICATE KEY UPDATE id_config = id_config`,
        { transaction }
      );
      console.log(' Tabla "daily_challenge_settings" creada con config inicial\n');

      // ========================================
      // TABLA: daily_challenge
      // ========================================
      console.log(' Creando tabla "daily_challenge"...');
      await queryInterface.createTable('daily_challenge', {
        id_challenge: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        challenge_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          unique: true,
          comment: 'Fecha del desafío'
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        challenge_type: {
          type: Sequelize.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY', 'SETS', 'REPS'),
          allowNull: false,
          comment: 'Tipo de desafío'
        },
        target_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Valor objetivo del desafío'
        },
        target_unit: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Unidad (minutos, ejercicios, etc.)'
        },
        tokens_reward: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
          comment: 'Tokens otorgados al completar'
        },
        difficulty: {
          type: Sequelize.ENUM('EASY', 'MEDIUM', 'HARD'),
          allowNull: false,
          defaultValue: 'MEDIUM'
        },
        id_template: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'daily_challenge_template',
            key: 'id_template'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'Plantilla de donde se generó (NULL si es manual)'
        },
        auto_generated: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si fue generado automáticamente por rotación'
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID del admin que lo creó (NULL si es auto-generado)'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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

      await queryInterface.addIndex('daily_challenge', ['challenge_date', 'is_active'], {
        name: 'idx_daily_challenge_date_active',
        transaction
      });
      console.log(' Tabla "daily_challenge" creada con índice\n');

      // ========================================
      // TABLA: user_daily_challenge
      // ========================================
      console.log(' Creando tabla "user_daily_challenge"...');
      await queryInterface.createTable('user_daily_challenge', {
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
        id_challenge: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'daily_challenge',
            key: 'id_challenge'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        progress: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Progreso actual del usuario'
        },
        completed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        tokens_earned: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, { transaction });

      await queryInterface.addConstraint('user_daily_challenge', {
        fields: ['id_user_profile', 'id_challenge'],
        type: 'primary key',
        name: 'pk_user_daily_challenge'
      }, { transaction });

      await queryInterface.addIndex('user_daily_challenge', ['id_user_profile', 'completed', 'completed_at'], {
        name: 'idx_user_daily_challenge_completed',
        transaction
      });
      console.log(' Tabla "user_daily_challenge" creada con PK compuesta e índice\n');

      // ========================================
      // TABLA: achievement_definition
      // ========================================
      console.log(' Creando tabla "achievement_definition"...');
      await queryInterface.createTable('achievement_definition', {
        id_achievement_definition: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: 'Código único del logro (ej: FIRST_WORKOUT, STREAK_7_DAYS)'
        },
        name: {
          type: Sequelize.STRING(120),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        category: {
          type: Sequelize.ENUM('ONBOARDING', 'STREAK', 'FREQUENCY', 'ATTENDANCE', 'ROUTINE', 'CHALLENGE', 'PROGRESS', 'TOKEN', 'SOCIAL'),
          allowNull: false,
          defaultValue: 'ONBOARDING'
        },
        metric_type: {
          type: Sequelize.ENUM(
            'STREAK_DAYS',
            'STREAK_RECOVERY_USED',
            'ASSISTANCE_TOTAL',
            'FREQUENCY_WEEKS_MET',
            'ROUTINE_COMPLETED_COUNT',
            'WORKOUT_SESSION_COMPLETED',
            'DAILY_CHALLENGE_COMPLETED_COUNT',
            'PR_RECORD_COUNT',
            'BODY_WEIGHT_PROGRESS',
            'TOKEN_BALANCE_REACHED',
            'TOKEN_SPENT_TOTAL',
            'ONBOARDING_STEP_COMPLETED'
          ),
          allowNull: false
        },
        target_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Valor objetivo para desbloquear'
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Información adicional'
        },
        icon_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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

      await queryInterface.addIndex('achievement_definition', ['code'], {
        unique: true,
        name: 'idx_achievement_def_code',
        transaction
      });
      await queryInterface.addIndex('achievement_definition', ['category'], {
        name: 'idx_achievement_def_category',
        transaction
      });
      console.log(' Tabla "achievement_definition" creada con 2 índices\n');

      // ========================================
      // TABLA: user_achievement
      // ========================================
      console.log(' Creando tabla "user_achievement"...');
      await queryInterface.createTable('user_achievement', {
        id_user_achievement: {
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
          onUpdate: 'CASCADE'
        },
        id_achievement_definition: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'achievement_definition',
            key: 'id_achievement_definition'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        progress_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Progreso actual'
        },
        progress_denominator: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Valor objetivo (copia del target_value)'
        },
        unlocked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        unlocked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        last_source_type: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        last_source_id: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSON,
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

      await queryInterface.addConstraint('user_achievement', {
        fields: ['id_user_profile', 'id_achievement_definition'],
        type: 'unique',
        name: 'uniq_user_achievement_definition'
      }, { transaction });

      await queryInterface.addIndex('user_achievement', ['id_user_profile', 'unlocked', 'updated_at'], {
        name: 'idx_user_achievement_user_status',
        transaction
      });
      console.log(' Tabla "user_achievement" creada con constraint único e índice\n');

      // ========================================
      // TABLA: user_achievement_event
      // ========================================
      console.log(' Creando tabla "user_achievement_event"...');
      await queryInterface.createTable('user_achievement_event', {
        id_user_achievement_event: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_achievement: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'user_achievement',
            key: 'id_user_achievement'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        event_type: {
          type: Sequelize.ENUM('PROGRESS', 'UNLOCKED', 'RESET'),
          allowNull: false
        },
        delta: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Cambio en el progreso'
        },
        snapshot_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Valor del progreso después del evento'
        },
        source_type: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        source_id: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('user_achievement_event', ['id_user_achievement', 'created_at'], {
        name: 'idx_user_achievement_event_timeline',
        transaction
      });
      console.log(' Tabla "user_achievement_event" creada con índice\n');

      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 6 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 15');
      console.log('   - reward, reward_code, claimed_reward (con expiración)');
      console.log('   - token_ledger, reward_gym_stats_daily');
      console.log('   - daily_challenge_template, daily_challenge_settings');
      console.log('   - daily_challenge, user_daily_challenge');
      console.log('   - achievement_definition, user_achievement');
      console.log('   - user_achievement_event');
      console.log(' Índices creados: 26');
      console.log(' Sistema de plantillas y rotación automática integrado');
      console.log(' Campos adicionales: used_at, expires_at en claimed_reward');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 6:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 6...\n');

      // Eliminar en orden inverso
      await queryInterface.dropTable('user_achievement_event', { transaction });
      await queryInterface.dropTable('user_achievement', { transaction });
      await queryInterface.dropTable('achievement_definition', { transaction });
      await queryInterface.dropTable('user_daily_challenge', { transaction });
      await queryInterface.dropTable('daily_challenge', { transaction });
      await queryInterface.dropTable('daily_challenge_settings', { transaction });
      await queryInterface.dropTable('daily_challenge_template', { transaction });
      await queryInterface.dropTable('reward_gym_stats_daily', { transaction });
      await queryInterface.dropTable('token_ledger', { transaction });
      await queryInterface.dropTable('claimed_reward', { transaction });
      await queryInterface.dropTable('reward_cooldown', { transaction });
      await queryInterface.dropTable('active_user_effects', { transaction });
      await queryInterface.dropTable('user_reward_inventory', { transaction });
      await queryInterface.dropTable('reward_code', { transaction });
      await queryInterface.dropTable('reward', { transaction });

      await transaction.commit();
      console.log(' Migración 6 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 6:', error);
      throw error;
    }
  }
};
