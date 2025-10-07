'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Agregando campo photo_url a tabla gym...\n');

      const columns = await queryInterface.describeTable('gym');

      if (!columns.photo_url) {
        await queryInterface.addColumn('gym', 'photo_url', {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL de la foto principal del gimnasio'
        }, { transaction });

        console.log('   ✓ Campo photo_url agregado');
      } else {
        console.log('   ℹ Campo photo_url ya existe, omitiendo');
      }

      await transaction.commit();
      console.log('\n✅ Migración completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('gym', 'photo_url', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
