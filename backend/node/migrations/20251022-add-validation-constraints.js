'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando constraints de validación...\n');

      // 1. user_profiles.tokens >= 0
      console.log('   → Constraint: tokens no negativos...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_profiles
         ADD CONSTRAINT chk_tokens_positive CHECK (tokens >= 0)`,
        { transaction }
      );

      // 2. user_gym: finish_date >= start_date
      console.log('   → Constraint: fechas válidas en user_gym...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_gym
         ADD CONSTRAINT chk_gym_dates CHECK (finish_date IS NULL OR finish_date >= start_date)`,
        { transaction }
      );

      // 3. user_routine: finish_date >= start_date
      console.log('   → Constraint: fechas válidas en user_routine...');
      await queryInterface.sequelize.query(
        `ALTER TABLE user_routine
         ADD CONSTRAINT chk_routine_dates CHECK (finish_date IS NULL OR finish_date >= start_date)`,
        { transaction }
      );

      // 4. frequency: goal > 0
      console.log('   → Constraint: goal positivo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE frequency
         ADD CONSTRAINT chk_goal_positive CHECK (goal > 0)`,
        { transaction }
      );

      // 5. gym: coordenadas válidas
      console.log('   → Constraint: coordenadas válidas (latitude)...');
      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         ADD CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90 AND 90)`,
        { transaction }
      );

      console.log('   → Constraint: coordenadas válidas (longitude)...');
      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         ADD CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180 AND 180)`,
        { transaction }
      );

      // 6. token_ledger: balance_after >= 0
      console.log('   → Constraint: balance_after no negativo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE token_ledger
         ADD CONSTRAINT chk_balance_positive CHECK (balance_after >= 0)`,
        { transaction }
      );

      // 7. reward: cost_tokens > 0
      console.log('   → Constraint: cost_tokens positivo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE reward
         ADD CONSTRAINT chk_cost_positive CHECK (cost_tokens > 0)`,
        { transaction }
      );

      // 8. reward: stock >= 0
      console.log('   → Constraint: stock no negativo...');
      await queryInterface.sequelize.query(
        `ALTER TABLE reward
         ADD CONSTRAINT chk_stock_positive CHECK (stock >= 0)`,
        { transaction }
      );

      // 9. reward: finish_date >= start_date
      console.log('   → Constraint: fechas válidas en reward...');
      await queryInterface.sequelize.query(
        `ALTER TABLE reward
         ADD CONSTRAINT chk_reward_dates CHECK (finish_date >= start_date)`,
        { transaction }
      );

      await transaction.commit();
      console.log('\n✅ Constraints agregados exitosamente');
      console.log('   ✓ chk_tokens_positive');
      console.log('   ✓ chk_gym_dates');
      console.log('   ✓ chk_routine_dates');
      console.log('   ✓ chk_goal_positive');
      console.log('   ✓ chk_latitude');
      console.log('   ✓ chk_longitude');
      console.log('   ✓ chk_balance_positive');
      console.log('   ✓ chk_cost_positive');
      console.log('   ✓ chk_stock_positive');
      console.log('   ✓ chk_reward_dates\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔄 Eliminando constraints de validación...\n');

      await queryInterface.sequelize.query(
        'ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_tokens_positive',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE user_gym DROP CONSTRAINT IF EXISTS chk_gym_dates',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE user_routine DROP CONSTRAINT IF EXISTS chk_routine_dates',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE frequency DROP CONSTRAINT IF EXISTS chk_goal_positive',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE gym DROP CONSTRAINT IF EXISTS chk_latitude',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE gym DROP CONSTRAINT IF EXISTS chk_longitude',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE token_ledger DROP CONSTRAINT IF EXISTS chk_balance_positive',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE reward DROP CONSTRAINT IF EXISTS chk_cost_positive',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE reward DROP CONSTRAINT IF EXISTS chk_stock_positive',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE reward DROP CONSTRAINT IF EXISTS chk_reward_dates',
        { transaction }
      );

      await transaction.commit();
      console.log('\n✅ Constraints eliminados\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR en rollback:', error.message);
      throw error;
    }
  }
};
