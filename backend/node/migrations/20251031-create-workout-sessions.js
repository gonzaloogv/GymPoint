'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('routine_day', {
      id_routine_day: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_routine: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'routine',
          key: 'id_routine'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      day_number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: 'Número del día dentro de la rutina (1..7)'
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(255),
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

    await queryInterface.addIndex('routine_day', ['id_routine'], {
      name: 'idx_routine_day_routine'
    });
    await queryInterface.addConstraint('routine_day', {
      type: 'unique',
      fields: ['id_routine', 'day_number'],
      name: 'uq_routine_day_number'
    });

    await queryInterface.addColumn('routine_exercise', 'id_routine_day', {
      type: DataTypes.INTEGER,
      allowNull: true,
      after: 'order'
    });

    await queryInterface.addIndex('routine_exercise', ['id_routine_day'], {
      name: 'idx_routine_exercise_day'
    });

    await queryInterface.addConstraint('routine_exercise', {
      type: 'foreign key',
      fields: ['id_routine_day'],
      name: 'fk_routine_exercise_day',
      references: {
        table: 'routine_day',
        field: 'id_routine_day'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.createTable('workout_session', {
      id_workout_session: {
        type: DataTypes.INTEGER,
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
      id_routine: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'routine',
          key: 'id_routine'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      id_routine_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'routine_day',
          key: 'id_routine_day'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'IN_PROGRESS'
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_sets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_weight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: DataTypes.TEXT,
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

    await queryInterface.addIndex('workout_session', ['id_user_profile'], {
      name: 'idx_workout_session_user'
    });
    await queryInterface.addIndex('workout_session', ['status'], {
      name: 'idx_workout_session_status'
    });
    await queryInterface.addIndex('workout_session', ['started_at'], {
      name: 'idx_workout_session_started_at'
    });

    await queryInterface.createTable('workout_set', {
      id_workout_set: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_workout_session: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'workout_session',
          key: 'id_workout_session'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_exercise: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'exercise',
          key: 'id_exercise'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      set_number: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      reps: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      rpe: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        comment: 'Perceived exertion (RPE o RIR invertido)'
      },
      rest_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      is_warmup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      performed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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

    await queryInterface.addIndex('workout_set', ['id_workout_session'], {
      name: 'idx_workout_set_session'
    });
    await queryInterface.addIndex('workout_set', ['id_exercise'], {
      name: 'idx_workout_set_exercise'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('workout_set', 'idx_workout_set_exercise');
    await queryInterface.removeIndex('workout_set', 'idx_workout_set_session');
    await queryInterface.dropTable('workout_set');

    await queryInterface.removeIndex('workout_session', 'idx_workout_session_started_at');
    await queryInterface.removeIndex('workout_session', 'idx_workout_session_status');
    await queryInterface.removeIndex('workout_session', 'idx_workout_session_user');
    await queryInterface.dropTable('workout_session');

    await queryInterface.removeConstraint('routine_exercise', 'fk_routine_exercise_day');
    await queryInterface.removeIndex('routine_exercise', 'idx_routine_exercise_day');
    await queryInterface.removeColumn('routine_exercise', 'id_routine_day');

    await queryInterface.removeConstraint('routine_day', 'uq_routine_day_number');
    await queryInterface.removeIndex('routine_day', 'idx_routine_day_routine');
    await queryInterface.dropTable('routine_day');
  }
};
