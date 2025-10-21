'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando índices de performance...\n');

      // reward: filtros comunes
      await queryInterface.addIndex('reward', ['available', 'start_date', 'finish_date'], {
        name: 'idx_reward_availability',
        transaction
      });

      // claimed_reward: queries por usuario y estado
      await queryInterface.addIndex('claimed_reward', ['id_user', 'status', 'claimed_date'], {
        name: 'idx_claimed_status_date',
        transaction
      });

      // refresh_token: limpieza de expirados
      await queryInterface.addIndex('refresh_token', ['expires_at', 'revoked'], {
        name: 'idx_token_expiration',
        transaction
      });

      // gym_payment: búsquedas por usuario
      await queryInterface.addIndex('gym_payment', ['id_user', 'payment_date'], {
        name: 'idx_payment_user_date',
        transaction
      });

      await transaction.commit();
      console.log('\n✅ Índices de performance agregados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeIndex('reward', 'idx_reward_availability', { transaction });
      await queryInterface.removeIndex('claimed_reward', 'idx_claimed_status_date', { transaction });
      await queryInterface.removeIndex('refresh_token', 'idx_token_expiration', { transaction });
      await queryInterface.removeIndex('gym_payment', 'idx_payment_user_date', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
