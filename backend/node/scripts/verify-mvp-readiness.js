/**
 * Script de verificación: Base de datos lista para producción
 *
 * Verifica que todas las características del MVP estén implementadas
 * según gympoint_mvp_plan.md
 */

const sequelize = require('../config/database');

async function verifyMVPReadiness() {
  console.log('🔍 Verificando readiness de BD para producción MVP...\n');

  const results = {
    phase1_1: { name: 'Geolocalización y Auto Check-in', checks: [] },
    phase1_2: { name: 'Desafíos Diarios', checks: [] },
    phase1_3: { name: 'Rutinas Plantilla', checks: [] },
    phase1_4: { name: 'Campos Faltantes', checks: [] },
    critical: { name: 'Checks Críticos', checks: [] }
  };

  try {
    // ========== FASE 1.1: Geofencing y Auto Check-in ==========

    // Verificar tabla gym_geofence
    const [geofenceTable] = await sequelize.query("SHOW TABLES LIKE 'gym_geofence'");
    results.phase1_1.checks.push({
      check: 'Tabla gym_geofence existe',
      passed: geofenceTable.length > 0,
      critical: true
    });

    if (geofenceTable.length > 0) {
      const [geofenceCols] = await sequelize.query("DESCRIBE gym_geofence");
      const hasRadius = geofenceCols.some(c => c.Field === 'radius_meters');
      const hasAutoCheckin = geofenceCols.some(c => c.Field === 'auto_checkin_enabled');

      results.phase1_1.checks.push(
        { check: 'gym_geofence.radius_meters', passed: hasRadius, critical: true },
        { check: 'gym_geofence.auto_checkin_enabled', passed: hasAutoCheckin, critical: true }
      );
    }

    // Verificar columnas en assistance
    const [assistCols] = await sequelize.query("DESCRIBE assistance");
    const hasCheckInTime = assistCols.some(c => c.Field === 'check_in_time');
    const hasCheckOutTime = assistCols.some(c => c.Field === 'check_out_time');
    const hasDuration = assistCols.some(c => c.Field === 'duration_minutes');
    const hasDistance = assistCols.some(c => c.Field === 'distance_meters');
    const hasAutoCheckin = assistCols.some(c => c.Field === 'auto_checkin');

    results.phase1_1.checks.push(
      { check: 'assistance.check_in_time', passed: hasCheckInTime, critical: true },
      { check: 'assistance.check_out_time', passed: hasCheckOutTime, critical: true },
      { check: 'assistance.duration_minutes', passed: hasDuration, critical: true },
      { check: 'assistance.distance_meters', passed: hasDistance, critical: true },
      { check: 'assistance.auto_checkin', passed: hasAutoCheckin, critical: true }
    );

    // ========== FASE 1.2: Desafíos Diarios ==========

    const [dailyChallengeTable] = await sequelize.query("SHOW TABLES LIKE 'daily_challenge'");
    results.phase1_2.checks.push({
      check: 'Tabla daily_challenge existe',
      passed: dailyChallengeTable.length > 0,
      critical: true
    });

    const [userDailyChallengeTable] = await sequelize.query("SHOW TABLES LIKE 'user_daily_challenge'");
    results.phase1_2.checks.push({
      check: 'Tabla user_daily_challenge existe',
      passed: userDailyChallengeTable.length > 0,
      critical: true
    });

    // ========== FASE 1.3: Rutinas Plantilla ==========

    const [routineCols] = await sequelize.query("DESCRIBE routine");
    const hasIsTemplate = routineCols.some(c => c.Field === 'is_template');
    const hasRecommendedFor = routineCols.some(c => c.Field === 'recommended_for');
    const hasTemplateOrder = routineCols.some(c => c.Field === 'template_order');

    results.phase1_3.checks.push(
      { check: 'routine.is_template', passed: hasIsTemplate, critical: true },
      { check: 'routine.recommended_for', passed: hasRecommendedFor, critical: true },
      { check: 'routine.template_order', passed: hasTemplateOrder, critical: true }
    );

    const [userImportedTable] = await sequelize.query("SHOW TABLES LIKE 'user_imported_routine'");
    results.phase1_3.checks.push({
      check: 'Tabla user_imported_routine existe',
      passed: userImportedTable.length > 0,
      critical: true
    });

    // ========== FASE 1.4: Campos Faltantes ==========

    // Frequency
    const [frequencyCols] = await sequelize.query("DESCRIBE frequency");
    const hasWeekStartDate = frequencyCols.some(c => c.Field === 'week_start_date');
    const hasWeekNumber = frequencyCols.some(c => c.Field === 'week_number');
    const hasYear = frequencyCols.some(c => c.Field === 'year');

    results.phase1_4.checks.push(
      { check: 'frequency.week_start_date', passed: hasWeekStartDate, critical: false },
      { check: 'frequency.week_number', passed: hasWeekNumber, critical: false },
      { check: 'frequency.year', passed: hasYear, critical: false }
    );

    // Routine classification
    const hasCategory = routineCols.some(c => c.Field === 'category');
    const hasTargetGoal = routineCols.some(c => c.Field === 'target_goal');
    const hasEquipmentLevel = routineCols.some(c => c.Field === 'equipment_level');

    results.phase1_4.checks.push(
      { check: 'routine.category', passed: hasCategory, critical: false },
      { check: 'routine.target_goal', passed: hasTargetGoal, critical: false },
      { check: 'routine.equipment_level', passed: hasEquipmentLevel, critical: false }
    );

    // UserProfile onboarding
    const [userProfileCols] = await sequelize.query("DESCRIBE user_profiles");
    const hasOnboardingCompleted = userProfileCols.some(c => c.Field === 'onboarding_completed');
    const hasSubscription = userProfileCols.some(c => c.Field === 'subscription');

    results.phase1_4.checks.push(
      { check: 'user_profiles.onboarding_completed', passed: hasOnboardingCompleted, critical: false },
      { check: 'user_profiles.subscription (source of truth)', passed: hasSubscription, critical: false }
    );

    // TokenLedger metadata
    const [tokenLedgerCols] = await sequelize.query("DESCRIBE token_ledger");
    const hasMetadata = tokenLedgerCols.some(c => c.Field === 'metadata');

    results.phase1_4.checks.push({
      check: 'token_ledger.metadata',
      passed: hasMetadata,
      critical: false
    });

    // ========== CHECKS CRÍTICOS ==========

    // Verificar que existan gimnasios con geofences
    if (geofenceTable.length > 0) {
      const [geofenceCount] = await sequelize.query(
        "SELECT COUNT(*) as count FROM gym_geofence"
      );
      results.critical.checks.push({
        check: `Gimnasios con geofence configurado (${geofenceCount[0].count})`,
        passed: geofenceCount[0].count > 0,
        critical: false,
        note: 'Ejecutar seed si es 0'
      });
    }

    // Verificar que existan rutinas plantilla
    if (hasIsTemplate) {
      const [templateCount] = await sequelize.query(
        "SELECT COUNT(*) as count FROM routine WHERE is_template = 1"
      );
      results.critical.checks.push({
        check: `Rutinas plantilla creadas (${templateCount[0].count})`,
        passed: templateCount[0].count >= 3,
        critical: false,
        note: 'Se recomienda al menos 3-5 templates'
      });
    }

    // Verificar índices críticos
    const [indexes] = await sequelize.query("SHOW INDEX FROM assistance WHERE Key_name LIKE 'idx%'");
    const hasAutoIndex = indexes.some(idx => idx.Key_name === 'idx_assistance_auto_date');
    const hasDurationIndex = indexes.some(idx => idx.Key_name === 'idx_assistance_duration');

    results.critical.checks.push(
      { check: 'Índice idx_assistance_auto_date', passed: hasAutoIndex, critical: false },
      { check: 'Índice idx_assistance_duration', passed: hasDurationIndex, critical: false }
    );

  } catch (error) {
    console.error('❌ Error durante verificación:', error.message);
    throw error;
  }

  // ========== IMPRIMIR RESULTADOS ==========

  console.log('═══════════════════════════════════════════════════════════════\n');

  let totalChecks = 0;
  let passedChecks = 0;
  let criticalFails = 0;

  for (const [phase, data] of Object.entries(results)) {
    console.log(`📋 ${data.name}`);
    console.log('─'.repeat(65));

    for (const check of data.checks) {
      totalChecks++;
      const icon = check.passed ? '✅' : (check.critical ? '❌' : '⚠️ ');
      const status = check.passed ? 'OK' : (check.critical ? 'FALTA (CRÍTICO)' : 'FALTA (opcional)');

      console.log(`${icon} ${check.check}: ${status}`);

      if (check.note) {
        console.log(`   └─ Nota: ${check.note}`);
      }

      if (check.passed) passedChecks++;
      if (!check.passed && check.critical) criticalFails++;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 RESUMEN: ${passedChecks}/${totalChecks} checks pasados\n`);

  if (criticalFails === 0) {
    console.log('✅ BASE DE DATOS LISTA PARA PRODUCCIÓN MVP\n');
    console.log('Próximos pasos:');
    console.log('  1. Ejecutar seeds para geofences y rutinas plantilla');
    console.log('  2. Configurar cron job para desafíos diarios');
    console.log('  3. Ejecutar tests de integración');
    console.log('  4. Deploy a staging\n');
  } else {
    console.log(`❌ FALTAN ${criticalFails} CHECKS CRÍTICOS\n`);
    console.log('Acción requerida:');
    console.log('  1. Ejecutar migraciones faltantes');
    console.log('  2. Volver a ejecutar este script\n');
  }

  await sequelize.close();
}

// Ejecutar verificación
verifyMVPReadiness().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
