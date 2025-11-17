/**
 * Migración: Agregar campo profile_completed para onboarding de Google OAuth
 *
 * Agrega el campo profile_completed a accounts para trackear si el usuario
 * completó el onboarding inicial (frecuencia, fecha nacimiento, género).
 *
 * Estrategia:
 * - Cuentas locales: profile_completed = true (ya completaron registro)
 * - Cuentas Google con datos completos (birth_date NOT NULL): true
 * - Cuentas Google sin datos: profile_completed = false (necesitan onboarding)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[MIGRATION] Agregando profile_completed a accounts...');

    // 1. Agregar columna profile_completed con default FALSE
    await queryInterface.addColumn('accounts', 'profile_completed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si el usuario completó el onboarding inicial',
      after: 'email_verification_deadline'
    });

    // 2. Marcar cuentas locales como completas (ya hicieron registro tradicional)
    const [localResults] = await queryInterface.sequelize.query(`
      UPDATE accounts
      SET profile_completed = TRUE
      WHERE auth_provider = 'local'
    `);
    console.log(`[MIGRATION] ✓ ${localResults.affectedRows || 0} cuentas locales marcadas como completas`);

    // 3. Marcar cuentas Google con datos completos (birth_date NOT NULL Y frecuencia configurada)
    const [googleResults] = await queryInterface.sequelize.query(`
      UPDATE accounts a
      SET a.profile_completed = TRUE
      WHERE a.auth_provider = 'google'
        AND EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id_account = a.id_account
            AND up.birth_date IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM frequency f
              WHERE f.id_user_profile = up.id_user_profile
                AND f.goal IS NOT NULL
                AND f.goal > 0
            )
        )
    `);
    console.log(`[MIGRATION] ✓ ${googleResults.affectedRows || 0} cuentas Google con datos completos marcadas`);

    // 4. Las cuentas Google sin birth_date quedan con profile_completed = FALSE
    // y serán redirigidas al onboarding
    const [incompleteCount] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count
      FROM accounts a
      WHERE a.auth_provider = 'google'
        AND a.profile_completed = FALSE
    `);
    console.log(`[MIGRATION] ✓ ${incompleteCount[0]?.count || 0} cuentas Google necesitan onboarding`);

    console.log('[MIGRATION] ✓ profile_completed agregado exitosamente');
  },

  async down(queryInterface, Sequelize) {
    console.log('[MIGRATION] Revertiendo profile_completed...');

    await queryInterface.removeColumn('accounts', 'profile_completed');

    console.log('[MIGRATION] ✓ profile_completed removido');
  }
};
