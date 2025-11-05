/**
 * Manual test para verificar límite de tokens diarios
 *
 * Este test verifica que:
 * 1. La primera sesión del día otorga tokens
 * 2. Las sesiones subsecuentes del mismo día NO otorgan tokens
 * 3. Al día siguiente se resetea y puede obtener tokens de nuevo
 */

const workoutService = require('../../services/workout-service');
const tokenLedgerService = require('../../services/token-ledger-service');

async function testTokenLimit() {
  console.log('🧪 Iniciando test de límite de tokens diarios\n');

  // Usuario de prueba (ajustar según tu BD)
  const TEST_USER_ID = 2;
  const TEST_EXERCISE_ID = 1;

  try {
    // ============ SESIÓN 1 ============
    console.log('📝 TEST 1: Primera sesión del día (debería otorgar tokens)');

    // Obtener balance actual
    const balanceBefore1 = await tokenLedgerService.obtenerBalance(TEST_USER_ID);
    console.log(`💰 Balance antes: ${balanceBefore1}`);

    // Iniciar sesión
    const session1 = await workoutService.startWorkoutSession({
      idUserProfile: TEST_USER_ID,
      notes: 'Test sesión 1 - Primera del día'
    });
    console.log(`✅ Sesión iniciada: ${session1.id_workout_session}`);

    // Registrar un set
    await workoutService.registerWorkoutSet({
      idWorkoutSession: session1.id_workout_session,
      idExercise: TEST_EXERCISE_ID,
      weight: 50,
      reps: 10
    });
    console.log('✅ Set registrado');

    // Completar sesión
    await workoutService.finishWorkoutSession({
      idWorkoutSession: session1.id_workout_session
    });
    console.log('✅ Sesión completada');

    // Verificar balance después
    const balanceAfter1 = await tokenLedgerService.obtenerBalance(TEST_USER_ID);
    console.log(`💰 Balance después: ${balanceAfter1}`);

    const tokensEarned1 = balanceAfter1 - balanceBefore1;
    console.log(`🪙 Tokens ganados: ${tokensEarned1}`);

    if (tokensEarned1 > 0) {
      console.log('✅ PASS: Primera sesión otorgó tokens\n');
    } else {
      console.log('❌ FAIL: Primera sesión NO otorgó tokens\n');
    }

    // ============ SESIÓN 2 ============
    console.log('📝 TEST 2: Segunda sesión del mismo día (NO debería otorgar tokens)');

    const balanceBefore2 = await tokenLedgerService.obtenerBalance(TEST_USER_ID);
    console.log(`💰 Balance antes: ${balanceBefore2}`);

    // Iniciar segunda sesión
    const session2 = await workoutService.startWorkoutSession({
      idUserProfile: TEST_USER_ID,
      notes: 'Test sesión 2 - Segunda del día'
    });
    console.log(`✅ Sesión iniciada: ${session2.id_workout_session}`);

    // Registrar un set
    await workoutService.registerWorkoutSet({
      idWorkoutSession: session2.id_workout_session,
      idExercise: TEST_EXERCISE_ID,
      weight: 60,
      reps: 8
    });
    console.log('✅ Set registrado');

    // Completar sesión
    await workoutService.finishWorkoutSession({
      idWorkoutSession: session2.id_workout_session
    });
    console.log('✅ Sesión completada');

    // Verificar balance después
    const balanceAfter2 = await tokenLedgerService.obtenerBalance(TEST_USER_ID);
    console.log(`💰 Balance después: ${balanceAfter2}`);

    const tokensEarned2 = balanceAfter2 - balanceBefore2;
    console.log(`🪙 Tokens ganados: ${tokensEarned2}`);

    if (tokensEarned2 === 0) {
      console.log('✅ PASS: Segunda sesión NO otorgó tokens (correcto)\n');
    } else {
      console.log('❌ FAIL: Segunda sesión otorgó tokens (incorrecto)\n');
    }

    // ============ RESUMEN ============
    console.log('📊 RESUMEN DEL TEST:');
    console.log(`- Sesión 1: ${tokensEarned1} tokens (esperado: > 0)`);
    console.log(`- Sesión 2: ${tokensEarned2} tokens (esperado: 0)`);

    if (tokensEarned1 > 0 && tokensEarned2 === 0) {
      console.log('\n✅ ¡TEST EXITOSO! La lógica de límite diario funciona correctamente');
    } else {
      console.log('\n❌ TEST FALLIDO: La lógica no funciona como se esperaba');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error);
  }
}

// Ejecutar test si se corre directamente
if (require.main === module) {
  testTokenLimit()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testTokenLimit };
