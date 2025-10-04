// backend/node/migrations/20250925-add-logo-url-to-gyms.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la tabla existe y si la columna ya existe
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('gym')) {
      console.log('⚠️ Tabla "gym" no existe, saltando migración');
      return;
    }
    
    const tableDescription = await queryInterface.describeTable('gym');
    if (tableDescription.logo_url) {
      console.log('⚠️ Columna "logo_url" ya existe en "gym", saltando');
      return;
    }
    
    await queryInterface.addColumn('gym', 'logo_url', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
    console.log('✅ Columna "logo_url" agregada a "gym"');
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('gym')) {
      await queryInterface.removeColumn('gym', 'logo_url');
      console.log('✅ Columna "logo_url" eliminada de "gym"');
    }
  },
};
