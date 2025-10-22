const { migrator } = require('./migrate');
const sequelize = require('./config/database');

/**
 * Script para resetear la base de datos y ejecutar migraciones desde cero
 * Uso: node reset-db-temp.js
 */

async function resetDatabase() {
  try {
    console.log('============================================');
    console.log('  RESET Y MIGRACIÓN DE BASE DE DATOS');
    console.log('============================================\n');

    // 1. Verificar conexión
    console.log('📋 Paso 1: Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // 2. Revertir todas las migraciones
    console.log('📋 Paso 2: Revirtiendo migraciones...');
    try {
      const reverted = await migrator.down({ to: 0 });
      console.log(`✅ Migraciones revertidas: ${reverted.length}`);
      reverted.forEach(m => console.log(`   - ${m.name}`));
    } catch (error) {
      console.log('⚠️  No hay migraciones para revertir o error:', error.message);
    }
    console.log('');

    // 3. Ejecutar todas las migraciones
    console.log('📋 Paso 3: Ejecutando migraciones desde cero...');
    const executed = await migrator.up();
    console.log(`✅ Migraciones ejecutadas: ${executed.length}`);
    executed.forEach(m => console.log(`   ✓ ${m.name}`));
    console.log('');

    // 4. Verificar estructura de tablas
    console.log('📋 Paso 4: Verificando estructura de tablas...\n');

    // Verificar user_profiles
    console.log('🔍 Verificando user_profiles...');
    const [userProfilesColumns] = await sequelize.query('DESCRIBE user_profiles');

    const hasAppTier = userProfilesColumns.some(col => col.Field === 'app_tier');
    const hasPremiumSince = userProfilesColumns.some(col => col.Field === 'premium_since');
    const hasPremiumExpires = userProfilesColumns.some(col => col.Field === 'premium_expires');
    const hasIdStreak = userProfilesColumns.some(col => col.Field === 'id_streak');
    const hasSubscription = userProfilesColumns.some(col => col.Field === 'subscription');

    console.log(`   ${hasAppTier ? '✅' : '❌'} app_tier ${hasAppTier ? 'existe' : 'NO EXISTE'}`);
    console.log(`   ${hasPremiumSince ? '✅' : '❌'} premium_since ${hasPremiumSince ? 'existe' : 'NO EXISTE'}`);
    console.log(`   ${hasPremiumExpires ? '✅' : '❌'} premium_expires ${hasPremiumExpires ? 'existe' : 'NO EXISTE'}`);
    console.log(`   ${!hasIdStreak ? '✅' : '❌'} id_streak ${!hasIdStreak ? 'eliminado' : 'AÚN EXISTE ⚠️'}`);
    console.log(`   ${!hasSubscription ? '✅' : '❌'} subscription ${!hasSubscription ? 'eliminado' : 'AÚN EXISTE ⚠️'}`);

    // Verificar streak
    console.log('\n🔍 Verificando streak (índice único)...');
    const [streakIndexes] = await sequelize.query(
      "SHOW INDEXES FROM streak WHERE Column_name = 'id_user_profile'"
    );

    const hasUniqueIndex = streakIndexes.some(idx =>
      idx.Non_unique === 0 && idx.Key_name === 'idx_streak_user_unique'
    );

    console.log(`   ${hasUniqueIndex ? '✅' : '❌'} Índice único en id_user_profile ${hasUniqueIndex ? 'existe' : 'NO EXISTE'}`);

    // Verificar assistance
    console.log('\n🔍 Verificando assistance...');
    const [assistanceColumns] = await sequelize.query('DESCRIBE assistance');
    const assistanceHasIdStreak = assistanceColumns.some(col => col.Field === 'id_streak');

    console.log(`   ${!assistanceHasIdStreak ? '✅' : '❌'} id_streak ${!assistanceHasIdStreak ? 'eliminado' : 'AÚN EXISTE ⚠️'}`);

    // Verificar gym
    console.log('\n🔍 Verificando gym...');
    const [gymColumns] = await sequelize.query('DESCRIBE gym');
    const gymHasIdType = gymColumns.some(col => col.Field === 'id_type');

    console.log(`   ${!gymHasIdType ? '✅' : '❌'} id_type ${!gymHasIdType ? 'eliminado' : 'AÚN EXISTE ⚠️'}`);

    // 5. Resumen final
    console.log('\n============================================');
    console.log('  RESUMEN DE VERIFICACIÓN');
    console.log('============================================\n');

    const allGood =
      hasAppTier &&
      hasPremiumSince &&
      hasPremiumExpires &&
      !hasIdStreak &&
      !hasSubscription &&
      hasUniqueIndex &&
      !assistanceHasIdStreak &&
      !gymHasIdType;

    if (allGood) {
      console.log('✅ TODAS LAS VERIFICACIONES PASARON');
      console.log('✅ La base de datos está correctamente migrada');
    } else {
      console.log('⚠️  ALGUNAS VERIFICACIONES FALLARON');
      console.log('⚠️  Revisar los detalles arriba');
    }

    console.log('\n============================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
resetDatabase();
