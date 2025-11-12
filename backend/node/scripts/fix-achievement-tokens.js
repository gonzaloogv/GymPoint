/**
 * Script para verificar y corregir achievements sin tokens asignados
 *
 * Uso:
 *   node scripts/fix-achievement-tokens.js --verify  (solo ver achievements sin tokens)
 *   node scripts/fix-achievement-tokens.js --fix     (actualizar achievements sin tokens)
 */

const sequelize = require('../config/database');
const { AchievementDefinition } = require('../models');

const TOKEN_REWARDS_BY_CATEGORY = {
  ONBOARDING: (targetValue) => {
    return 10; // Logros de bienvenida, valor fijo
  },
  STREAK: (targetValue) => {
    if (targetValue <= 7) return 15;
    if (targetValue <= 30) return 25;
    if (targetValue <= 90) return 40;
    return 50;
  },
  FREQUENCY: (targetValue) => {
    if (targetValue <= 4) return 20;
    if (targetValue <= 12) return 30;
    return 40;
  },
  ATTENDANCE: (targetValue) => {
    if (targetValue <= 10) return 10;
    if (targetValue <= 50) return 20;
    if (targetValue <= 100) return 30;
    return 35;
  },
  ROUTINE: (targetValue) => {
    if (targetValue <= 5) return 15;
    if (targetValue <= 20) return 25;
    if (targetValue <= 50) return 35;
    return 40;
  },
  CHALLENGE: (targetValue) => {
    if (targetValue <= 5) return 20;
    if (targetValue <= 15) return 30;
    if (targetValue <= 30) return 40;
    return 50;
  },
  PROGRESS: (targetValue) => {
    if (targetValue <= 5) return 25;
    if (targetValue <= 20) return 35;
    if (targetValue <= 50) return 50;
    return 60;
  },
  TOKEN: (targetValue) => {
    if (targetValue <= 100) return 30;
    if (targetValue <= 500) return 50;
    if (targetValue <= 1000) return 75;
    return 100;
  },
  SOCIAL: (targetValue) => {
    if (targetValue <= 5) return 20;
    if (targetValue <= 20) return 30;
    return 40;
  }
};

const getUnlockMessage = (achievement) => {
  const { category, name, target_value } = achievement;

  switch (category) {
    case 'ONBOARDING':
      return `¡Bienvenido! Has completado: ${name}`;
    case 'STREAK':
      return `¡Increíble racha de ${target_value} días!`;
    case 'FREQUENCY':
      return `¡Has cumplido tu objetivo ${target_value} semanas!`;
    case 'ATTENDANCE':
      return `¡Has asistido ${target_value} veces al gym!`;
    case 'ROUTINE':
      return `¡Has completado ${target_value} rutinas!`;
    case 'CHALLENGE':
      return `¡Has completado ${target_value} desafíos!`;
    case 'PROGRESS':
      return `¡Progreso increíble! ${name}`;
    case 'TOKEN':
      return `¡Has alcanzado ${target_value} tokens!`;
    case 'SOCIAL':
      return `¡Logro social desbloqueado! ${name}`;
    default:
      return name;
  }
};

const verifyAchievements = async () => {
  console.log('\n========================================');
  console.log('VERIFICANDO ACHIEVEMENTS');
  console.log('========================================\n');

  const achievements = await AchievementDefinition.findAll({
    where: { is_active: true },
    order: [['category', 'ASC'], ['target_value', 'ASC']]
  });

  const withoutTokens = [];
  const withTokens = [];

  for (const achievement of achievements) {
    const metadata = achievement.metadata || {};
    const tokenReward = metadata.token_reward;

    if (!tokenReward || tokenReward === 0) {
      withoutTokens.push(achievement);
    } else {
      withTokens.push(achievement);
    }
  }

  console.log(`Total de achievements: ${achievements.length}`);
  console.log(`  ✓ Con tokens: ${withTokens.length}`);
  console.log(`  ✗ Sin tokens: ${withoutTokens.length}\n`);

  if (withoutTokens.length > 0) {
    console.log('Achievements SIN tokens asignados:\n');
    for (const achievement of withoutTokens) {
      console.log(`  - [${achievement.code}] ${achievement.name}`);
      console.log(`    Categoría: ${achievement.category}, Target: ${achievement.target_value}`);
      console.log(`    Metadata: ${JSON.stringify(achievement.metadata)}\n`);
    }
  }

  // Resumen por categoría
  console.log('\nResumen por categoría:\n');
  const categoryCounts = {};
  for (const achievement of achievements) {
    if (!categoryCounts[achievement.category]) {
      categoryCounts[achievement.category] = { total: 0, withTokens: 0, withoutTokens: 0 };
    }
    categoryCounts[achievement.category].total++;
    const metadata = achievement.metadata || {};
    if (metadata.token_reward && metadata.token_reward > 0) {
      categoryCounts[achievement.category].withTokens++;
    } else {
      categoryCounts[achievement.category].withoutTokens++;
    }
  }

  for (const [category, counts] of Object.entries(categoryCounts)) {
    console.log(`  ${category}:`);
    console.log(`    Total: ${counts.total}`);
    console.log(`    Con tokens: ${counts.withTokens}`);
    console.log(`    Sin tokens: ${counts.withoutTokens}`);
  }

  return withoutTokens;
};

const fixAchievements = async () => {
  console.log('\n========================================');
  console.log('CORRIGIENDO ACHIEVEMENTS');
  console.log('========================================\n');

  const withoutTokens = await verifyAchievements();

  if (withoutTokens.length === 0) {
    console.log('\n✓ Todos los achievements ya tienen tokens asignados.\n');
    return;
  }

  console.log(`\nActualizando ${withoutTokens.length} achievements...\n`);

  let updated = 0;
  for (const achievement of withoutTokens) {
    const calculatorFn = TOKEN_REWARDS_BY_CATEGORY[achievement.category];
    if (!calculatorFn) {
      console.log(`  ⚠ Categoría desconocida para ${achievement.code}: ${achievement.category}`);
      continue;
    }

    const tokenReward = calculatorFn(achievement.target_value);
    const unlockMessage = getUnlockMessage(achievement);

    const currentMetadata = achievement.metadata || {};
    const newMetadata = {
      ...currentMetadata,
      token_reward: tokenReward,
      unlock_message: unlockMessage
    };

    achievement.metadata = newMetadata;
    await achievement.save();

    console.log(`  ✓ [${achievement.code}] ${achievement.name}`);
    console.log(`    Tokens asignados: ${tokenReward}`);
    console.log(`    Mensaje: ${unlockMessage}\n`);

    updated++;
  }

  console.log(`\n✓ Se actualizaron ${updated} achievements exitosamente.\n`);

  // Verificar nuevamente
  console.log('Verificando después de la actualización...\n');
  await verifyAchievements();
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (!mode || (mode !== '--verify' && mode !== '--fix')) {
      console.log('\nUso:');
      console.log('  node scripts/fix-achievement-tokens.js --verify  (solo verificar)');
      console.log('  node scripts/fix-achievement-tokens.js --fix     (actualizar)\n');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    if (mode === '--verify') {
      await verifyAchievements();
    } else if (mode === '--fix') {
      await fixAchievements();
    }

    await sequelize.close();
    console.log('\n========================================');
    console.log('PROCESO COMPLETADO');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

main();
