'use strict';

/**
 * MIGRACIÓN 5: Exercise and Routines System
 *
 * Esta migración crea el sistema de ejercicios, rutinas y entrenamientos:
 * - exercise: Catálogo de ejercicios
 * - routine: Rutinas de entrenamiento
 * - routine_day: Días dentro de una rutina
 * - routine_exercise: Ejercicios en una rutina
 * - user_routine: Rutinas asignadas/activas del usuario
 * - user_imported_routine: Histórico de rutinas importadas
 * - workout_session: Sesiones de entrenamiento del usuario
 * - workout_set: Sets realizados en una sesión
 * - progress: Progreso general del usuario
 * - progress_exercise: PRs y progreso por ejercicio
 * - user_body_metrics: Métricas corporales (peso, grasa, etc.)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' [5/7] Creando tablas de ejercicios y rutinas...\n');

      // ========================================
      // TABLA: exercise
      // ========================================
      console.log(' Creando tabla "exercise"...');
      await queryInterface.createTable('exercise', {
        id_exercise: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        exercise_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        muscular_group: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Grupo muscular principal'
        },
        secondary_muscles: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Músculos secundarios trabajados'
        },
        equipment_needed: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Equipamiento necesario'
        },
        difficulty_level: {
          type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        instructions: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Instrucciones del ejercicio'
        },
        video_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'Usuario que creó el ejercicio (NULL = sistema)'
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

      await queryInterface.addIndex('exercise', ['muscular_group'], {
        name: 'idx_exercise_muscle_group',
        transaction
      });
      await queryInterface.addIndex('exercise', ['difficulty_level'], {
        name: 'idx_exercise_difficulty',
        transaction
      });
      await queryInterface.addIndex('exercise', ['deleted_at'], {
        name: 'idx_exercise_deleted',
        transaction
      });
      console.log(' Tabla "exercise" creada con 3 índices\n');

      // ========================================
      // TABLA: routine
      // ========================================
      console.log(' Creando tabla "routine"...');
      await queryInterface.createTable('routine', {
        id_routine: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        routine_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'Usuario que creó la rutina (NULL = sistema/plantilla)'
        },
        is_template: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si es una plantilla pre-diseñada'
        },
        recommended_for: {
          type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
          allowNull: true,
          comment: 'Nivel recomendado'
        },
        classification: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Clasificación (STRENGTH, CARDIO, HYBRID, etc.)'
        },
        template_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Orden de visualización en plantillas'
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

      await queryInterface.addIndex('routine', ['is_template', 'template_order'], {
        name: 'idx_routine_template',
        transaction
      });
      await queryInterface.addIndex('routine', ['created_by'], {
        name: 'idx_routine_created_by',
        transaction
      });
      await queryInterface.addIndex('routine', ['deleted_at'], {
        name: 'idx_routine_deleted',
        transaction
      });
      console.log(' Tabla "routine" creada con 3 índices\n');

      // ========================================
      // TABLA: routine_day
      // ========================================
      console.log(' Creando tabla "routine_day"...');
      await queryInterface.createTable('routine_day', {
        id_routine_day: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_routine: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        day_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Número del día en la rutina (1, 2, 3...)'
        },
        day_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Nombre del día (ej: "Pecho y Tríceps")'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        rest_day: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }, { transaction });

      await queryInterface.addConstraint('routine_day', {
        fields: ['id_routine', 'day_number'],
        type: 'unique',
        name: 'uniq_routine_day_number'
      }, { transaction });

      await queryInterface.addIndex('routine_day', ['id_routine'], {
        name: 'idx_routine_day_routine',
        transaction
      });
      console.log(' Tabla "routine_day" creada con constraint único e índice\n');

      // ========================================
      // TABLA: routine_exercise
      // ========================================
      console.log(' Creando tabla "routine_exercise"...');
      await queryInterface.createTable('routine_exercise', {
        id_routine_exercise: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_routine: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Rutina a la que pertenece el ejercicio'
        },
        id_routine_day: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'routine_day',
            key: 'id_routine_day'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'Día de la rutina (NULL para rutinas sin días específicos)'
        },
        id_exercise: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'exercise',
            key: 'id_exercise'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        exercise_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Orden del ejercicio en el día'
        },
        sets: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        reps: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        rest_seconds: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Descanso entre series en segundos'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('routine_exercise', ['id_routine'], {
        name: 'idx_routine_exercise_routine',
        transaction
      });
      await queryInterface.addIndex('routine_exercise', ['id_routine_day', 'exercise_order'], {
        name: 'idx_routine_exercise_day_order',
        transaction
      });
      await queryInterface.addIndex('routine_exercise', ['id_exercise'], {
        name: 'idx_routine_exercise_exercise',
        transaction
      });
      console.log(' Tabla "routine_exercise" creada con 3 índices\n');

      // ========================================
      // TABLA: user_routine
      // ========================================
      console.log(' Creando tabla "user_routine"...');
      await queryInterface.createTable('user_routine', {
        id_user_routine: {
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
        id_routine: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('user_routine', ['id_user_profile', 'is_active'], {
        name: 'idx_user_routine_user_active',
        transaction
      });
      console.log(' Tabla "user_routine" creada con índice\n');

      // ========================================
      // TABLA: user_imported_routine
      // ========================================
      console.log(' Creando tabla "user_imported_routine"...');
      await queryInterface.createTable('user_imported_routine', {
        id_import: {
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
        id_template_routine: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_user_routine: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'Copia de la rutina para el usuario'
        },
        imported_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('user_imported_routine', ['id_user_profile'], {
        name: 'idx_imported_routine_user',
        transaction
      });
      console.log(' Tabla "user_imported_routine" creada con índice\n');

      // ========================================
      // TABLA: workout_session
      // ========================================
      console.log(' Creando tabla "workout_session"...');
      await queryInterface.createTable('workout_session', {
        id_workout_session: {
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
        id_routine: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'routine',
            key: 'id_routine'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        id_routine_day: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'routine_day',
            key: 'id_routine_day'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        status: {
          type: Sequelize.ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'IN_PROGRESS'
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        ended_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        duration_seconds: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        total_sets: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        total_reps: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        total_weight: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0
        },
        notes: {
          type: Sequelize.TEXT,
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

      await queryInterface.addIndex('workout_session', ['id_user_profile', 'status'], {
        name: 'idx_workout_session_user_status',
        transaction
      });
      await queryInterface.addIndex('workout_session', ['started_at'], {
        name: 'idx_workout_session_started',
        transaction
      });
      console.log(' Tabla "workout_session" creada con 2 índices\n');

      // ========================================
      // TABLA: workout_set
      // ========================================
      console.log(' Creando tabla "workout_set"...');
      await queryInterface.createTable('workout_set', {
        id_workout_set: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_workout_session: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'workout_session',
            key: 'id_workout_session'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_exercise: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'exercise',
            key: 'id_exercise'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        set_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Número de serie del ejercicio'
        },
        reps: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        weight_kg: {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: true
        },
        duration_seconds: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Para ejercicios de tiempo'
        },
        rest_seconds: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        is_pr: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si es un récord personal'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('workout_set', ['id_workout_session'], {
        name: 'idx_workout_set_session',
        transaction
      });
      await queryInterface.addIndex('workout_set', ['id_exercise', 'is_pr'], {
        name: 'idx_workout_set_exercise_pr',
        transaction
      });
      console.log(' Tabla "workout_set" creada con 2 índices\n');

      // ========================================
      // TABLA: progress
      // ========================================
      console.log(' Creando tabla "progress"...');
      await queryInterface.createTable('progress', {
        id_progress: {
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
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        total_weight_lifted: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true
        },
        total_reps: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        total_sets: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('progress', ['id_user_profile', 'date'], {
        unique: true,
        name: 'idx_progress_user_date',
        transaction
      });
      console.log(' Tabla "progress" creada con índice único\n');

      // ========================================
      // TABLA: progress_exercise
      // ========================================
      console.log(' Creando tabla "progress_exercise"...');
      await queryInterface.createTable('progress_exercise', {
        id_progress_exercise: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_progress: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'progress',
            key: 'id_progress'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_exercise: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'exercise',
            key: 'id_exercise'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        max_weight: {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: true,
          comment: 'Peso máximo levantado (PR)'
        },
        max_reps: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Repeticiones máximas'
        },
        total_volume: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          comment: 'Volumen total (peso × reps × series)'
        }
      }, { transaction });

      await queryInterface.addIndex('progress_exercise', ['id_progress'], {
        name: 'idx_progress_exercise_progress',
        transaction
      });
      await queryInterface.addIndex('progress_exercise', ['id_exercise', 'max_weight'], {
        name: 'idx_progress_exercise_max',
        transaction
      });
      console.log(' Tabla "progress_exercise" creada con 2 índices\n');

      // ========================================
      // TABLA: user_body_metrics
      // ========================================
      console.log(' Creando tabla "user_body_metrics"...');
      await queryInterface.createTable('user_body_metrics', {
        id_metric: {
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
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        weight_kg: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        height_cm: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        body_fat_percentage: {
          type: Sequelize.DECIMAL(4, 2),
          allowNull: true
        },
        muscle_mass_kg: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        bmi: {
          type: Sequelize.DECIMAL(4, 2),
          allowNull: true,
          comment: 'Índice de masa corporal'
        },
        waist_cm: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        chest_cm: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        arms_cm: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('user_body_metrics', ['id_user_profile', 'date'], {
        name: 'idx_body_metrics_user_date',
        transaction
      });
      console.log(' Tabla "user_body_metrics" creada con índice\n');

      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 5 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 11');
      console.log('   - exercise, routine, routine_day, routine_exercise');
      console.log('   - user_routine, user_imported_routine');
      console.log('   - workout_session, workout_set');
      console.log('   - progress, progress_exercise');
      console.log('   - user_body_metrics');
      console.log(' Índices creados: 19');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 5:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 5...\n');

      // Eliminar en orden inverso
      await queryInterface.dropTable('user_body_metrics', { transaction });
      await queryInterface.dropTable('progress_exercise', { transaction });
      await queryInterface.dropTable('progress', { transaction });
      await queryInterface.dropTable('workout_set', { transaction });
      await queryInterface.dropTable('workout_session', { transaction });
      await queryInterface.dropTable('user_imported_routine', { transaction });
      await queryInterface.dropTable('user_routine', { transaction });
      await queryInterface.dropTable('routine_exercise', { transaction });
      await queryInterface.dropTable('routine_day', { transaction });
      await queryInterface.dropTable('routine', { transaction });
      await queryInterface.dropTable('exercise', { transaction });

      await transaction.commit();
      console.log(' Migración 5 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 5:', error);
      throw error;
    }
  }
};
