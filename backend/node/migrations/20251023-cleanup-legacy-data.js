'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Limpiando datos legacy...\n');

      // 1. Eliminar refresh_tokens expirados o revocados
      console.log('   → Limpiando refresh tokens expirados/revocados...');
      const [deletedTokens] = await queryInterface.sequelize.query(
        `DELETE FROM refresh_token
         WHERE expires_at < NOW() OR revoked = 1`,
        { transaction }
      );
      console.log(`   ✓ ${deletedTokens.affectedRows || 0} tokens eliminados`);

      // 2. Marcar claimed_rewards pendientes antiguos como revocados
      console.log('   → Limpiando claimed_rewards pendientes antiguos (>30 días)...');
      const [updatedRewards] = await queryInterface.sequelize.query(
        `UPDATE claimed_reward
         SET status = 'revoked'
         WHERE status = 'pending'
         AND claimed_date < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        { transaction }
      );
      console.log(`   ✓ ${updatedRewards.affectedRows || 0} rewards revocados`);

      // 3. Limpiar gym_schedule huérfanos (sin gimnasio asociado)
      console.log('   → Limpiando gym_schedule huérfanos...');
      const [deletedSchedules] = await queryInterface.sequelize.query(
        `DELETE FROM gym_schedule WHERE id_gym NOT IN (SELECT id_gym FROM gym)`,
        { transaction }
      );
      console.log(`   ✓ ${deletedSchedules.affectedRows || 0} schedules eliminados`);

      // 4. Limpiar gym_special_schedule huérfanos
      console.log('   → Limpiando gym_special_schedule huérfanos...');
      const [deletedSpecialSchedules] = await queryInterface.sequelize.query(
        `DELETE FROM gym_special_schedule WHERE id_gym NOT IN (SELECT id_gym FROM gym)`,
        { transaction }
      );
      console.log(`   ✓ ${deletedSpecialSchedules.affectedRows || 0} special schedules eliminados`);

      // 5. Limpiar assistance huérfanas (sin user_profile)
      console.log('   → Limpiando assistance huérfanas...');
      const [deletedAssistance] = await queryInterface.sequelize.query(
        `DELETE FROM assistance WHERE id_user NOT IN (SELECT id_user_profile FROM user_profiles)`,
        { transaction }
      );
      console.log(`   ✓ ${deletedAssistance.affectedRows || 0} assistance eliminadas`);

      await transaction.commit();
      console.log('\n✅ Limpieza completada exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down() {
    // No hay rollback para limpieza de datos legacy
    console.log('⚠️  No hay rollback para limpieza de datos legacy');
  }
};
