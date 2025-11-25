/**
 * Migración: Agregar período de gracia para verificación de email
 *
 * Agrega el campo email_verification_deadline a accounts para permitir
 * un período de gracia de 7 días antes de bloquear el acceso.
 *
 * Estrategia:
 * - Usuarios nuevos: deadline = created_at + 7 días
 * - Usuarios existentes no verificados: deadline = NOW() + 7 días
 * - Usuarios ya verificados: deadline = NULL (no aplica)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[MIGRATION] Agregando email_verification_deadline a accounts...');

    // 1. Agregar columna email_verification_deadline
    await queryInterface.addColumn('accounts', 'email_verification_deadline', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha límite para verificar email (período de gracia de 7 días)',
      after: 'email_verified'
    });

    // 2. Setear deadline para cuentas locales no verificadas existentes
    // Solo aplica a auth_provider='local' y email_verified=false
    await queryInterface.sequelize.query(`
      UPDATE accounts
      SET email_verification_deadline = DATE_ADD(NOW(), INTERVAL 7 DAY)
      WHERE auth_provider = 'local'
        AND email_verified = false
        AND email_verification_deadline IS NULL
    `);

    // 3. Dejar NULL para cuentas ya verificadas o de Google OAuth
    // (no requieren deadline)

    console.log('[MIGRATION] ✓ email_verification_deadline agregado exitosamente');
    console.log('[MIGRATION] ✓ Cuentas locales no verificadas tienen 7 días de gracia');
  },

  async down(queryInterface, Sequelize) {
    console.log('[MIGRATION] Revertiendo email_verification_deadline...');

    await queryInterface.removeColumn('accounts', 'email_verification_deadline');

    console.log('[MIGRATION] ✓ email_verification_deadline removido');
  }
};
