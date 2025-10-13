'use strict';

/**
 * Migración: Agregar ownership a exercises
 * 
 * Agrega columna created_by para control de permisos
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Agregando columna created_by a exercise...\n');
      
      // Verificar si la columna ya existe
      const [columns] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM exercise LIKE 'created_by';`,
        { transaction }
      );
      
      if (columns.length === 0) {
        await queryInterface.addColumn('exercise', 'created_by', {
          type: Sequelize.INTEGER,
          allowNull: true, // NULL = ejercicio del sistema
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
        
        console.log('✅ Columna created_by agregada');
      } else {
        console.log('✅ Columna created_by ya existe');
      }
      
      await transaction.commit();
      console.log('\n✅ Migración completada con éxito\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.removeColumn('exercise', 'created_by', { transaction });
      
      await transaction.commit();
      console.log('✅ Rollback completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error.message);
      throw error;
    }
  }
};
