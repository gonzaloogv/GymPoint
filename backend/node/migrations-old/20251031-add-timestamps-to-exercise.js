'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando timestamps a exercise...\n');

      // Verificar si la tabla exercise existe
      const tableExists = await queryInterface.describeTable('exercise');
      
      if (tableExists) {
        console.log('   → Verificando exercise...');
        
        // Agregar created_at si no existe
        if (!tableExists.created_at) {
          console.log('   → Agregando exercise.created_at...');
          await queryInterface.addColumn('exercise', 'created_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }, { transaction });
        }

        // Agregar updated_at si no existe
        if (!tableExists.updated_at) {
          console.log('   → Agregando exercise.updated_at...');
          await queryInterface.addColumn('exercise', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
          }, { transaction });
        }

        // Agregar deleted_at si no existe (para soft deletes)
        if (!tableExists.deleted_at) {
          console.log('   → Agregando exercise.deleted_at...');
          await queryInterface.addColumn('exercise', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction });
        }
      }

      await transaction.commit();
      console.log('\n✅ Timestamps agregados a exercise exitosamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Eliminando timestamps de exercise...\n');

      const tableExists = await queryInterface.describeTable('exercise');
      
      if (tableExists) {
        // Eliminar deleted_at
        if (tableExists.deleted_at) {
          await queryInterface.removeColumn('exercise', 'deleted_at', { transaction });
        }

        // Eliminar updated_at
        if (tableExists.updated_at) {
          await queryInterface.removeColumn('exercise', 'updated_at', { transaction });
        }

        // Eliminar created_at
        if (tableExists.created_at) {
          await queryInterface.removeColumn('exercise', 'created_at', { transaction });
        }
      }

      await transaction.commit();
      console.log('\n✅ Timestamps eliminados de exercise\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
