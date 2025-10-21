'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('achievement_definition', {
      id_achievement_definition: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.ENUM(
          'ONBOARDING',
          'STREAK',
          'FREQUENCY',
          'ATTENDANCE',
          'ROUTINE',
          'CHALLENGE',
          'PROGRESS',
          'TOKEN',
          'SOCIAL'
        ),
        allowNull: false,
        defaultValue: 'ONBOARDING'
      },
      metric_type: {
        type: DataTypes.ENUM(
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
        type: DataTypes.INTEGER,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      icon_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('user_achievement', {
      id_user_achievement: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_achievement_definition: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'achievement_definition',
          key: 'id_achievement_definition'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      progress_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      progress_denominator: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      unlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      unlocked_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_source_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      last_source_id: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addConstraint('user_achievement', {
      fields: ['id_user_profile', 'id_achievement_definition'],
      type: 'unique',
      name: 'uniq_user_achievement_definition'
    });

    await queryInterface.addIndex('user_achievement', ['id_user_profile', 'unlocked', 'updated_at'], {
      name: 'idx_user_achievement_user_status'
    });

    await queryInterface.createTable('user_achievement_event', {
      id_user_achievement_event: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_user_achievement: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'user_achievement',
          key: 'id_user_achievement'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      event_type: {
        type: DataTypes.ENUM('PROGRESS', 'UNLOCKED', 'RESET'),
        allowNull: false
      },
      delta: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      snapshot_value: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      source_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      source_id: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('user_achievement_event', ['id_user_achievement', 'created_at'], {
      name: 'idx_user_achievement_event_timeline'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_achievement_event');
    await queryInterface.dropTable('user_achievement');
    await queryInterface.dropTable('achievement_definition');
  }
};

