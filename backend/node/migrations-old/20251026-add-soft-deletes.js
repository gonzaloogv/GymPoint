'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando soft deletes...\n');

      const tables = ['gym', 'reward', 'routine', 'exercise'];

      for (const table of tables) {
        const columns = await queryInterface.describeTable(table);

        if (!columns.deleted_at) {
          console.log(`   → ${table}.deleted_at...`);
          await queryInterface.addColumn(table, 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction });

          // Crear índice para queries eficientes
          await queryInterface.addIndex(table, ['deleted_at'], {
            name: `idx_${table}_deleted_at`,
            transaction
          });
        }
      }

      await transaction.commit();
      console.log('\n✅ Soft deletes agregados\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tables = ['gym', 'reward', 'routine', 'exercise'];

      for (const table of tables) {
        await queryInterface.removeIndex(table, `idx_${table}_deleted_at`, { transaction });
        await queryInterface.removeColumn(table, 'deleted_at', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
