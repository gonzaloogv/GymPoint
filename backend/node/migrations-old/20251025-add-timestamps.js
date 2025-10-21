'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando timestamps faltantes...\n');

      // user_gym
      console.log('   → Verificando user_gym...');
      const userGymCols = await queryInterface.describeTable('user_gym');

      if (!userGymCols.created_at) {
        console.log('   → Agregando user_gym.created_at...');
        await queryInterface.addColumn('user_gym', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!userGymCols.updated_at) {
        console.log('   → Agregando user_gym.updated_at...');
        await queryInterface.addColumn('user_gym', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      // user_routine
      console.log('   → Verificando user_routine...');
      const userRoutineCols = await queryInterface.describeTable('user_routine');

      if (!userRoutineCols.created_at) {
        console.log('   → Agregando user_routine.created_at...');
        await queryInterface.addColumn('user_routine', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!userRoutineCols.updated_at) {
        console.log('   → Agregando user_routine.updated_at...');
        await queryInterface.addColumn('user_routine', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      // frequency
      console.log('   → Verificando frequency...');
      const frequencyCols = await queryInterface.describeTable('frequency');

      if (!frequencyCols.created_at) {
        console.log('   → Agregando frequency.created_at...');
        await queryInterface.addColumn('frequency', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }

      if (!frequencyCols.updated_at) {
        console.log('   → Agregando frequency.updated_at...');
        await queryInterface.addColumn('frequency', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }

      await transaction.commit();
      console.log('\n✅ Timestamps agregados exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Eliminando timestamps...\n');

      // user_gym
      const userGymCols = await queryInterface.describeTable('user_gym');
      if (userGymCols.created_at) {
        await queryInterface.removeColumn('user_gym', 'created_at', { transaction });
      }
      if (userGymCols.updated_at) {
        await queryInterface.removeColumn('user_gym', 'updated_at', { transaction });
      }

      // user_routine
      const userRoutineCols = await queryInterface.describeTable('user_routine');
      if (userRoutineCols.created_at) {
        await queryInterface.removeColumn('user_routine', 'created_at', { transaction });
      }
      if (userRoutineCols.updated_at) {
        await queryInterface.removeColumn('user_routine', 'updated_at', { transaction });
      }

      // frequency
      const frequencyCols = await queryInterface.describeTable('frequency');
      if (frequencyCols.created_at) {
        await queryInterface.removeColumn('frequency', 'created_at', { transaction });
      }
      if (frequencyCols.updated_at) {
        await queryInterface.removeColumn('frequency', 'updated_at', { transaction });
      }

      await transaction.commit();
      console.log('\n✅ Timestamps eliminados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
