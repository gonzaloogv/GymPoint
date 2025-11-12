/**
 * Script de diagnóstico de achievements
 *
 * Verifica el estado de todos los achievements y detecta problemas:
 * - Achievements sin tokens
 * - User achievements con progreso incorrecto
 * - Métricas que no funcionan correctamente
 *
 * Uso:
 *   node scripts/diagnose-achievements.js
 *   node scripts/diagnose-achievements.js --user-id=123  (diagnóstico para un usuario específico)
 */

const sequelize = require('../config/database');
const { AchievementDefinition, UserAchievement, UserProfile } = require('../models');
const achievementService = require('../services/achievement-service');

const diagnoseAchievements = async (idUserProfile = null) => {
  console.log('\n========================================');
  console.log('DIAGNÓSTICO DE ACHIEVEMENTS');
  console.log('========================================\n');

  // 1. Verificar definiciones de achievements
  console.log('1. VERIFICANDO DEFINICIONES DE ACHIEVEMENTS...\n');

  const definitions = await AchievementDefinition.findAll({
    where: { is_active: true },
    order: [['category', 'ASC'], ['target_value', 'ASC']]
  });

  console.log(`Total de achievements activos: ${definitions.length}\n`);

  const withoutTokens = [];
  const withTokens = [];

  for (const definition of definitions) {
    const metadata = definition.metadata || {};
    const tokenReward = metadata.token_reward;

    if (!tokenReward || tokenReward === 0) {
      withoutTokens.push(definition);
      console.log(`⚠️  [${definition.code}] ${definition.name}`);
      console.log(`    Categoría: ${definition.category}, Target: ${definition.target_value}`);
      console.log(`    ❌ SIN TOKENS ASIGNADOS\n`);
    } else {
      withTokens.push(definition);
    }
  }

  console.log(`✅ Achievements con tokens: ${withTokens.length}`);
  console.log(`❌ Achievements SIN tokens: ${withoutTokens.length}\n`);

  // 2. Si se especificó un usuario, diagnosticar su progreso
  if (idUserProfile) {
    console.log(`\n2. DIAGNOSTICANDO PROGRESO PARA USUARIO ${idUserProfile}...\n`);

    const userProfile = await UserProfile.findByPk(idUserProfile);
    if (!userProfile) {
      console.log(`❌ Usuario ${idUserProfile} no encontrado\n`);
      return;
    }

    console.log(`Usuario: ${userProfile.name} ${userProfile.lastname || ''}`);
    console.log(`Email: ${userProfile.email || 'N/A'}`);
    console.log(`Tokens: ${userProfile.tokens || 0}\n`);

    // Obtener todos los user_achievements
    const userAchievements = await achievementService.getUserAchievements(idUserProfile);

    console.log(`Total de achievements: ${userAchievements.length}\n`);

    const unlocked = [];
    const readyToUnlock = [];
    const inProgress = [];
    const notStarted = [];

    for (const userAch of userAchievements) {
      const progress = userAch.progress;
      const definition = userAch.definition;

      if (userAch.unlocked) {
        unlocked.push(userAch);
      } else if (progress.percentage >= 1) {
        readyToUnlock.push(userAch);
        console.log(`🎯 LISTO PARA DESBLOQUEAR: [${definition.code}] ${definition.name}`);
        console.log(`   Progreso: ${progress.value} / ${progress.denominator} (${(progress.percentage * 100).toFixed(0)}%)`);
        console.log(`   Categoría: ${definition.category}`);
        console.log(`   Métrica: ${definition.metric_type}`);
        console.log(`   Tokens a ganar: ${definition.metadata?.token_reward || 0}\n`);
      } else if (progress.value > 0) {
        inProgress.push(userAch);
      } else {
        notStarted.push(userAch);
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`   🏆 Desbloqueados: ${unlocked.length}`);
    console.log(`   🎯 Listos para desbloquear: ${readyToUnlock.length}`);
    console.log(`   ⏳ En progreso: ${inProgress.length}`);
    console.log(`   ⚪ Sin comenzar: ${notStarted.length}\n`);

    // Mostrar logros en progreso
    if (inProgress.length > 0) {
      console.log(`\n⏳ LOGROS EN PROGRESO:\n`);
      for (const userAch of inProgress.slice(0, 10)) { // Mostrar solo los primeros 10
        const progress = userAch.progress;
        const definition = userAch.definition;
        console.log(`   [${definition.code}] ${definition.name}`);
        console.log(`   Progreso: ${progress.value} / ${progress.denominator} (${(progress.percentage * 100).toFixed(0)}%)`);
        console.log(`   Categoría: ${definition.category}`);
        console.log(`   Métrica: ${definition.metric_type}\n`);
      }
      if (inProgress.length > 10) {
        console.log(`   ... y ${inProgress.length - 10} más\n`);
      }
    }

    // Diagnosticar logros específicos problemáticos
    console.log(`\n3. DIAGNOSTICANDO LOGROS PROBLEMÁTICOS...\n`);

    // Buscar el logro FIRST_LOGIN
    const firstLoginAch = userAchievements.find(ach => ach.definition.code === 'FIRST_LOGIN');
    if (firstLoginAch) {
      console.log(`🔍 FIRST_LOGIN:`);
      console.log(`   Nombre: ${firstLoginAch.definition.name}`);
      console.log(`   Métrica: ${firstLoginAch.definition.metric_type}`);
      console.log(`   Target: ${firstLoginAch.definition.target_value}`);
      console.log(`   Progreso: ${firstLoginAch.progress.value} / ${firstLoginAch.progress.denominator}`);
      console.log(`   Unlocked: ${firstLoginAch.unlocked}`);
      console.log(`   Metadata: ${JSON.stringify(firstLoginAch.definition.metadata, null, 2)}`);

      // Verificar el campo en user_profile
      const field = firstLoginAch.definition.metadata?.field || 'onboarding_completed';
      console.log(`   Campo verificado: ${field}`);
      console.log(`   Valor en user_profile: ${userProfile[field]}\n`);
    }

    // Buscar logros con progreso >= 100 pero no desbloqueados
    const stuckAchievements = userAchievements.filter(
      ach => !ach.unlocked && ach.progress.percentage >= 1
    );

    if (stuckAchievements.length > 0) {
      console.log(`⚠️  LOGROS "ATASCADOS" (100% pero no desbloqueados): ${stuckAchievements.length}\n`);
      for (const ach of stuckAchievements) {
        console.log(`   [${ach.definition.code}] ${ach.definition.name}`);
        console.log(`   Progreso: ${ach.progress.value} / ${ach.progress.denominator}`);
        console.log(`   Tokens disponibles: ${ach.definition.metadata?.token_reward || 0}\n`);
      }
    }
  }

  console.log('\n========================================');
  console.log('DIAGNÓSTICO COMPLETADO');
  console.log('========================================\n');
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    let idUserProfile = null;

    // Buscar --user-id
    const userIdArg = args.find(arg => arg.startsWith('--user-id='));
    if (userIdArg) {
      idUserProfile = parseInt(userIdArg.split('=')[1]);
    }

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    await diagnoseAchievements(idUserProfile);

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

main();
