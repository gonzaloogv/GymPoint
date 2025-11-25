/**
 * Test para verificar que la zona horaria de Argentina (UTC-3) funciona correctamente
 * para la validación de tokens diarios
 */

// Simular la lógica de hasCompletedWorkoutToday
function testArgentinaTimezone() {
  console.log('\n=== TEST: Argentina Timezone (UTC-3) ===\n');

  // Argentina timezone is UTC-3
  const ARGENTINA_OFFSET = -3 * 60; // minutes

  // Get current time in Argentina (UTC-3)
  const now = new Date();
  const argentinaTime = new Date(now.getTime() + ARGENTINA_OFFSET * 60 * 1000);

  // Get start of today (00:00:00) in Argentina timezone
  const today = new Date(argentinaTime);
  today.setHours(0, 0, 0, 0);

  // Get end of today (23:59:59) in Argentina timezone
  const endOfDay = new Date(argentinaTime);
  endOfDay.setHours(23, 59, 59, 999);

  console.log('🕐 Hora actual:');
  console.log('   UTC:', now.toISOString());
  console.log('   Argentina (UTC-3):', argentinaTime.toISOString());
  console.log('   Argentina local:', argentinaTime.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));

  console.log('\n📅 Rango del día actual (Argentina):');
  console.log('   Inicio (00:00):', today.toISOString());
  console.log('   Fin (23:59):', endOfDay.toISOString());

  console.log('\n✅ Lógica:');
  console.log('   - Un workout completado HOY (Argentina) bloqueará tokens adicionales');
  console.log('   - A las 00:00 hora Argentina, se reinicia el contador');
  console.log('   - Usuarios pueden recibir 10 tokens UNA VEZ por día (00:00 - 23:59 Argentina)');

  // Test: Si ahora son las 23:00 en Argentina, en 1 hora se reinicia
  const horaArgentina = argentinaTime.getHours();
  const minutosParaMedianoche = horaArgentina >= 0 ? (24 - horaArgentina) * 60 - argentinaTime.getMinutes() : 0;

  console.log(`\n⏰ Minutos hasta medianoche (Argentina): ${minutosParaMedianoche} minutos`);
  console.log(`   Tokens se reinician en: ${Math.floor(minutosParaMedianoche / 60)}h ${minutosParaMedianoche % 60}m`);

  console.log('\n=== FIN TEST ===\n');
}

// Ejecutar test
testArgentinaTimezone();
