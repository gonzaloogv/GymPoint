/**
 * Migración: Agregar timestamps (created_at, updated_at) a tabla gym
 *
 * Necesario porque el modelo Gym tiene timestamps: true y paranoid: true,
 * pero la tabla no tiene las columnas created_at y updated_at.
 * La columna deleted_at ya fue agregada en migración 20251026-add-soft-deletes.js
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando timestamps a tabla gym...\n');

      // Verificar si las columnas ya existen
      const tableDesc = await queryInterface.describeTable('gym');

      // Agregar created_at si no existe
      if (!tableDesc.created_at) {
        await queryInterface.addColumn('gym', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
        console.log('   ✓ Columna created_at agregada');
      } else {
        console.log('   ℹ Columna created_at ya existe');
      }

      // Agregar updated_at si no existe
      if (!tableDesc.updated_at) {
        await queryInterface.addColumn('gym', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
        console.log('   ✓ Columna updated_at agregada');
      } else {
        console.log('   ℹ Columna updated_at ya existe');
      }

      // Agregar índice en created_at para consultas ordenadas
      const indexes = await queryInterface.showIndex('gym', { transaction });
      const hasCreatedAtIndex = indexes.some(idx => idx.name === 'idx_gym_created_at');

      if (!hasCreatedAtIndex && !tableDesc.created_at) {
        await queryInterface.addIndex('gym', ['created_at'], {
          name: 'idx_gym_created_at',
          transaction
        });
        console.log('   ✓ Índice en created_at agregado');
      }

      await transaction.commit();
      console.log('\n✅ Timestamps agregados a tabla gym\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error agregando timestamps a gym:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Removiendo timestamps de tabla gym...\n');

      // Remover índice
      const indexes = await queryInterface.showIndex('gym', { transaction });
      const hasCreatedAtIndex = indexes.some(idx => idx.name === 'idx_gym_created_at');

      if (hasCreatedAtIndex) {
        await queryInterface.removeIndex('gym', 'idx_gym_created_at', { transaction });
        console.log('   ✓ Índice removido');
      }

      // Remover columnas
      const tableDesc = await queryInterface.describeTable('gym');

      if (tableDesc.updated_at) {
        await queryInterface.removeColumn('gym', 'updated_at', { transaction });
        console.log('   ✓ Columna updated_at removida');
      }

      if (tableDesc.created_at) {
        await queryInterface.removeColumn('gym', 'created_at', { transaction });
        console.log('   ✓ Columna created_at removida');
      }

      await transaction.commit();
      console.log('\n✅ Timestamps removidos de tabla gym\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error removiendo timestamps:', error.message);
      throw error;
    }
  }
};
