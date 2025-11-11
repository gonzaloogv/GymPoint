const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Script de Seed: Datos Iniciales para Desarrollo
 *
 * Este script crea datos de prueba para facilitar el desarrollo:
 * - Cuenta de administrador
 * - Logros base del sistema
 * - Amenidades comunes de gimnasios
 * - Ejercicios básicos
 *
 * USO:
 *   node seed/initial-data.js
 */

async function seedInitialData() {
  const transaction = await sequelize.transaction();

  try {
    console.log('Iniciando seed de datos iniciales...\n');

    let amenitiesSummaryCount = 0;
    let exercisesSummaryCount = 0;
    let achievementsSummaryCount = 0;

    // ========================================
    // 1. CREAR CUENTA DE ADMINISTRADOR (SI NO EXISTE)
    // ========================================
    console.log('Verificando cuenta de administrador...');

    const [existingAdmin] = await sequelize.query(`
      SELECT id_account FROM accounts WHERE email = 'admin@gympoint.com'
    `, { transaction });

    let adminAccountId;

    if (existingAdmin.length > 0) {
      adminAccountId = existingAdmin[0].id_account;
      console.log(`✓ Cuenta admin ya existe (ID: ${adminAccountId})`);
    } else {
      const passwordHash = await bcrypt.hash('admin123', 10);

      const [accountResult] = await sequelize.query(`
        INSERT INTO accounts (email, password_hash, auth_provider, email_verified, is_active, created_at, updated_at)
        VALUES ('admin@gympoint.com', ?, 'local', TRUE, TRUE, NOW(), NOW())
      `, {
        replacements: [passwordHash],
        transaction
      });

      adminAccountId = accountResult;
      console.log(`✓ Cuenta admin creada (ID: ${adminAccountId})`);

      // Asignar rol ADMIN
      await sequelize.query(`
        INSERT INTO account_roles (id_account, id_role, assigned_at)
        SELECT ?, id_role, NOW()
        FROM roles WHERE role_name = 'ADMIN'
      `, {
        replacements: [adminAccountId],
        transaction
      });
      console.log('✓ Rol ADMIN asignado');

      // Crear perfil de administrador
      await sequelize.query(`
        INSERT INTO admin_profiles (id_account, name, lastname, department, created_at, updated_at)
        VALUES (?, 'Admin', 'Sistema', 'IT', NOW(), NOW())
      `, {
        replacements: [adminAccountId],
        transaction
      });
      console.log('✓ Perfil de administrador creado');
    }
    console.log();

    // ========================================
    // 2. CREAR AMENIDADES COMUNES (SI NO EXISTEN)
    // ========================================
    console.log('Verificando amenidades comunes...');

    const [existingAmenitiesCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM gym_amenity
    `, { transaction });

    if (existingAmenitiesCount[0].count > 0) {
      console.log(`✓ Ya existen ${existingAmenitiesCount[0].count} amenidades en la BD`);
      amenitiesSummaryCount = existingAmenitiesCount[0].count;
    } else {
      const amenities = [
        { name: 'Duchas', category: 'FACILITY', icon: 'shower' },
        { name: 'Lockers', category: 'FACILITY', icon: 'locker' },
        { name: 'WiFi', category: 'FACILITY', icon: 'wifi' },
        { name: 'Estacionamiento', category: 'FACILITY', icon: 'parking' },
        { name: 'Aire Acondicionado', category: 'FACILITY', icon: 'ac' },
        { name: 'Vestuarios', category: 'FACILITY', icon: 'changing-room' },
        { name: 'Agua Potable', category: 'FACILITY', icon: 'water' },
        { name: 'Entrenador Personal', category: 'SERVICE', icon: 'trainer' },
        { name: 'Clases Grupales', category: 'SERVICE', icon: 'group-class' },
        { name: 'Nutricionista', category: 'SERVICE', icon: 'nutrition' },
        { name: 'Sauna', category: 'FACILITY', icon: 'sauna' },
        { name: 'Piscina', category: 'FACILITY', icon: 'pool' },
        { name: 'Máquinas Cardio', category: 'EQUIPMENT', icon: 'cardio' },
        { name: 'Pesas Libres', category: 'EQUIPMENT', icon: 'weights' },
        { name: 'Máquinas de Fuerza', category: 'EQUIPMENT', icon: 'machines' },
        { name: 'Área Funcional', category: 'EQUIPMENT', icon: 'functional' },
        { name: 'Barras y Discos', category: 'EQUIPMENT', icon: 'barbell' },
        { name: 'Mancuernas', category: 'EQUIPMENT', icon: 'dumbbell' }
      ];

      for (const amenity of amenities) {
        await sequelize.query(`
          INSERT INTO gym_amenity (name, category, icon_name, created_at)
          VALUES (?, ?, ?, NOW())
        `, {
          replacements: [amenity.name, amenity.category, amenity.icon],
          transaction
        });
      }
      console.log(`✓ ${amenities.length} amenidades creadas`);
      amenitiesSummaryCount = amenities.length;
    }
    console.log();

    // ========================================
    // 3. CREAR EJERCICIOS BÁSICOS (SI NO EXISTEN)
    // ========================================
    console.log('Verificando ejercicios básicos...');

    const [existingExercisesCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM exercise
    `, { transaction });

    if (existingExercisesCount[0].count > 0) {
      console.log(`✓ Ya existen ${existingExercisesCount[0].count} ejercicios en la BD\n`);
      exercisesSummaryCount = existingExercisesCount[0].count;
    } else {

    const exercises = [
      // Pecho
      { name: 'Press de Banca', group: 'PECHO', difficulty: 'INTERMEDIATE' },
      { name: 'Press Inclinado con Mancuernas', group: 'PECHO', difficulty: 'INTERMEDIATE' },
      { name: 'Fondos en Paralelas', group: 'PECHO', difficulty: 'INTERMEDIATE' },
      { name: 'Aperturas con Mancuernas', group: 'PECHO', difficulty: 'BEGINNER' },

      // Espalda
      { name: 'Dominadas', group: 'ESPALDA', difficulty: 'INTERMEDIATE' },
      { name: 'Remo con Barra', group: 'ESPALDA', difficulty: 'INTERMEDIATE' },
      { name: 'Peso Muerto', group: 'ESPALDA', difficulty: 'ADVANCED' },
      { name: 'Jalón al Pecho', group: 'ESPALDA', difficulty: 'BEGINNER' },
      { name: 'Remo con Mancuerna', group: 'ESPALDA', difficulty: 'BEGINNER' },

      // Piernas
      { name: 'Sentadilla con Barra', group: 'PIERNAS', difficulty: 'INTERMEDIATE' },
      { name: 'Prensa de Piernas', group: 'PIERNAS', difficulty: 'BEGINNER' },
      { name: 'Zancadas', group: 'PIERNAS', difficulty: 'INTERMEDIATE' },
      { name: 'Extensión de Cuádriceps', group: 'PIERNAS', difficulty: 'BEGINNER' },
      { name: 'Curl Femoral', group: 'PIERNAS', difficulty: 'BEGINNER' },
      { name: 'Elevación de Pantorrillas', group: 'PIERNAS', difficulty: 'BEGINNER' },

      // Hombros
      { name: 'Press Militar', group: 'HOMBROS', difficulty: 'INTERMEDIATE' },
      { name: 'Elevaciones Laterales', group: 'HOMBROS', difficulty: 'BEGINNER' },
      { name: 'Elevaciones Frontales', group: 'HOMBROS', difficulty: 'BEGINNER' },
      { name: 'Pájaros', group: 'HOMBROS', difficulty: 'BEGINNER' },

      // Brazos
      { name: 'Curl de Bíceps con Barra', group: 'BRAZOS', difficulty: 'BEGINNER' },
      { name: 'Curl Martillo', group: 'BRAZOS', difficulty: 'BEGINNER' },
      { name: 'Extensiones de Tríceps', group: 'BRAZOS', difficulty: 'BEGINNER' },
      { name: 'Fondos para Tríceps', group: 'BRAZOS', difficulty: 'INTERMEDIATE' },

      // Core
      { name: 'Plancha', group: 'CORE', difficulty: 'BEGINNER' },
      { name: 'Crunches', group: 'CORE', difficulty: 'BEGINNER' },
      { name: 'Elevación de Piernas', group: 'CORE', difficulty: 'INTERMEDIATE' },
      { name: 'Mountain Climbers', group: 'CORE', difficulty: 'INTERMEDIATE' }
    ];

    for (const exercise of exercises) {
      await sequelize.query(`
        INSERT INTO exercise (exercise_name, muscular_group, difficulty_level, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `, {
        replacements: [exercise.name, exercise.group, exercise.difficulty],
        transaction
      });
    }
      console.log(`✓ ${exercises.length} ejercicios creados\n`);
      exercisesSummaryCount = exercises.length;
    }

    // ========================================
    // 4. CREAR LOGROS BÁSICOS (SI NO EXISTEN)
    // ========================================
    console.log('Verificando logros básicos...');

    const [existingAchievementsCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM achievement_definition
    `, { transaction });

    if (existingAchievementsCount[0].count > 0) {
      console.log(`✓ Ya existen ${existingAchievementsCount[0].count} logros en la BD\n`);
      achievementsSummaryCount = existingAchievementsCount[0].count;
    } else {

    const achievements = [
      // Onboarding
      {
        code: 'FIRST_LOGIN',
        name: 'Bienvenido a GymPoint',
        description: 'Iniciaste sesión por primera vez',
        category: 'ONBOARDING',
        metric: 'ONBOARDING_STEP_COMPLETED',
        target: 1
      },
      // Streak
      {
        code: 'STREAK_3_DAYS',
        name: 'Racha de 3 días',
        description: 'Mantuviste una racha de 3 días consecutivos',
        category: 'STREAK',
        metric: 'STREAK_DAYS',
        target: 3
      },
      {
        code: 'STREAK_7_DAYS',
        name: 'Racha de 7 días',
        description: 'Mantuviste una racha de una semana',
        category: 'STREAK',
        metric: 'STREAK_DAYS',
        target: 7
      },
      {
        code: 'STREAK_30_DAYS',
        name: 'Racha de 30 días',
        description: 'Un mes completo de consistencia',
        category: 'STREAK',
        metric: 'STREAK_DAYS',
        target: 30
      },

      // Asistencia
      {
        code: 'FIRST_WORKOUT',
        name: 'Primera Asistencia',
        description: 'Registraste tu primera asistencia al gym',
        category: 'ATTENDANCE',
        metric: 'ASSISTANCE_TOTAL',
        target: 1
      },
      {
        code: 'WORKOUT_10',
        name: '10 Entrenamientos',
        description: 'Completaste 10 sesiones de entrenamiento',
        category: 'ATTENDANCE',
        metric: 'ASSISTANCE_TOTAL',
        target: 10
      },
      {
        code: 'WORKOUT_50',
        name: '50 Entrenamientos',
        description: 'Completaste 50 sesiones de entrenamiento',
        category: 'ATTENDANCE',
        metric: 'ASSISTANCE_TOTAL',
        target: 50
      },
      {
        code: 'WORKOUT_100',
        name: 'Centenario',
        description: '100 entrenamientos completados',
        category: 'ATTENDANCE',
        metric: 'ASSISTANCE_TOTAL',
        target: 100
      },

      // Frecuencia
      {
        code: 'FREQUENCY_1_WEEK',
        name: 'Meta Semanal',
        description: 'Cumpliste tu meta de frecuencia semanal',
        category: 'FREQUENCY',
        metric: 'FREQUENCY_WEEKS_MET',
        target: 1
      },
      {
        code: 'FREQUENCY_4_WEEKS',
        name: 'Mes Completo',
        description: 'Cumpliste tu meta 4 semanas seguidas',
        category: 'FREQUENCY',
        metric: 'FREQUENCY_WEEKS_MET',
        target: 4
      },

      // Desafíos
      {
        code: 'CHALLENGE_1',
        name: 'Primer Desafío',
        description: 'Completaste tu primer desafío diario',
        category: 'CHALLENGE',
        metric: 'DAILY_CHALLENGE_COMPLETED_COUNT',
        target: 1
      },
      {
        code: 'CHALLENGE_7',
        name: 'Semana de Desafíos',
        description: 'Completaste 7 desafíos diarios',
        category: 'CHALLENGE',
        metric: 'DAILY_CHALLENGE_COMPLETED_COUNT',
        target: 7
      },

      // Tokens
      {
        code: 'TOKENS_100',
        name: 'Ahorrador',
        description: 'Acumulaste 100 tokens',
        category: 'TOKEN',
        metric: 'TOKEN_BALANCE_REACHED',
        target: 100
      },
      {
        code: 'TOKENS_500',
        name: 'Coleccionista',
        description: 'Acumulaste 500 tokens',
        category: 'TOKEN',
        metric: 'TOKEN_BALANCE_REACHED',
        target: 500
      }
    ];

    for (const achievement of achievements) {
      await sequelize.query(`
        INSERT INTO achievement_definition
        (code, name, description, category, metric_type, target_value, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
      `, {
        replacements: [
          achievement.code,
          achievement.name,
          achievement.description,
          achievement.category,
          achievement.metric,
          achievement.target
        ],
        transaction
      });
    }
      console.log(`✓ ${achievements.length} logros creados\n`);
      achievementsSummaryCount = achievements.length;
    }

    // ============================================
    // REWARDS SEED DATA
    // ============================================
    let rewardsSummaryCount = 0;

    const [rewardsCountResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM reward',
      { transaction }
    );
    const rewardsCount = rewardsCountResult[0].count;

    if (rewardsCount === 0) {
      console.log('📦 Creando recompensas iniciales...');

      const rewards = [
        // --- Premium Passes ---
        {
          name: 'Premium 1 día',
          description: 'Accede a todas las funciones Premium por 1 día',
          reward_type: 'pase_gratis',
          effect_value: 1,
          token_cost: 1500,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: false,
          is_stackable: false,
          max_stack: 1,
          duration_days: null,
          is_active: true,
          id_gym: null
        },
        {
          name: 'Premium 7 días',
          description: 'Accede a todas las funciones Premium por 7 días',
          reward_type: 'pase_gratis',
          effect_value: 7,
          token_cost: 5000,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: false,
          is_stackable: false,
          max_stack: 1,
          duration_days: null,
          is_active: true,
          id_gym: null
        },
        {
          name: 'Premium 30 días',
          description: 'Accede a todas las funciones Premium por 30 días completos',
          reward_type: 'pase_gratis',
          effect_value: 30,
          token_cost: 20000,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: false,
          is_stackable: false,
          max_stack: 1,
          duration_days: null,
          is_active: true,
          id_gym: null
        },

        // --- Token Multipliers (Premium Only, Stackable hasta 3) ---
        {
          name: 'Tokens x2 (7 días)',
          description: 'Duplica todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
          reward_type: 'token_multiplier',
          effect_value: 2,
          token_cost: 3500,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: true,
          is_stackable: true,
          max_stack: 3,
          duration_days: 7,
          is_active: true,
          id_gym: null
        },
        {
          name: 'Tokens x3 (7 días)',
          description: 'Triplica todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
          reward_type: 'token_multiplier',
          effect_value: 3,
          token_cost: 6000,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: true,
          is_stackable: true,
          max_stack: 3,
          duration_days: 7,
          is_active: true,
          id_gym: null
        },
        {
          name: 'Tokens x5 (7 días)',
          description: 'Multiplica por 5 todos los tokens que ganes durante 7 días. Acumulable hasta 3 veces.',
          reward_type: 'token_multiplier',
          effect_value: 5,
          token_cost: 10000,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: true,
          is_stackable: true,
          max_stack: 3,
          duration_days: 7,
          is_active: true,
          id_gym: null
        },

        // --- Streak Saver (Stackable hasta 5) ---
        {
          name: 'Salvavidas de Racha',
          description: 'Protege tu racha automáticamente si fallas un día. Se usa automáticamente cuando sea necesario. Acumulable hasta 5 veces.',
          reward_type: 'streak_saver',
          effect_value: 1,
          token_cost: 800,
          stock: null,
          is_unlimited: true,
          cooldown_days: 30,
          requires_premium: false,
          is_stackable: true,
          max_stack: 5,
          duration_days: null,
          is_active: true,
          id_gym: null
        }
      ];

      for (const reward of rewards) {
        await sequelize.query(
          `INSERT INTO reward (
            id_gym, name, description, reward_type, effect_value,
            token_cost, stock, is_unlimited, cooldown_days,
            requires_premium, is_stackable, max_stack, duration_days, is_active,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          {
            replacements: [
              reward.id_gym,
              reward.name,
              reward.description,
              reward.reward_type,
              reward.effect_value,
              reward.token_cost,
              reward.stock,
              reward.is_unlimited,
              reward.cooldown_days,
              reward.requires_premium,
              reward.is_stackable,
              reward.max_stack,
              reward.duration_days,
              reward.is_active
            ],
            transaction
          }
        );
      }

      console.log(`✓ ${rewards.length} recompensas creadas\n`);
      rewardsSummaryCount = rewards.length;
    }

    await transaction.commit();

    console.log('========================================');
    console.log(' SEED COMPLETADO EXITOSAMENTE');
    console.log('========================================');
    console.log(' Datos creados:');
    console.log(`   - 1 cuenta de administrador (admin@gympoint.com / admin123)`);
    console.log(`   - ${amenitiesSummaryCount} amenidades de gimnasios`);
    console.log(`   - ${exercisesSummaryCount} ejercicios básicos`);
    console.log(`   - ${achievementsSummaryCount} logros del sistema`);
    console.log(`   - ${rewardsSummaryCount} recompensas disponibles`);
    console.log('========================================\n');
    console.log(' Próximos pasos:');
    console.log('   1. Accede con admin@gympoint.com / admin123');
    console.log('   2. Crea gimnasios desde el panel de administrador');
    console.log('   3. Crea usuarios de prueba desde la app móvil');
    console.log('========================================\n');

  } catch (error) {
    // Solo hacer rollback si la transacción no ha sido finalizada
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error en seed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedInitialData()
    .then(() => {
      console.log('Proceso de seed finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fallo en seed:', error);
      process.exit(1);
    });
}

module.exports = { seedInitialData };
