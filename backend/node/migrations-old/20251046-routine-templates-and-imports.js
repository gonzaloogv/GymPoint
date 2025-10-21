'use strict';

/**
 * Migración: Rutinas plantilla y tabla de importaciones (Fase 1.3)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const { DataTypes } = Sequelize;

      // Agregar columnas a routine
      await queryInterface.addColumn('routine', 'is_template', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'created_by'
      }, { transaction }).catch(() => {});

      await queryInterface.addColumn('routine', 'recommended_for', {
        type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
        allowNull: true
      }, { transaction }).catch(() => {});

      await queryInterface.addColumn('routine', 'template_order', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }, { transaction }).catch(() => {});

      // Crear tabla user_imported_routine
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_imported_routine (
          id_import INT PRIMARY KEY AUTO_INCREMENT,
          id_user_profile INT NOT NULL,
          id_routine_original INT NOT NULL,
          id_routine_copy INT NOT NULL,
          imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_uir_user FOREIGN KEY (id_user_profile) REFERENCES user_profiles(id_user_profile) ON DELETE CASCADE,
          CONSTRAINT fk_uir_routine_orig FOREIGN KEY (id_routine_original) REFERENCES routine(id_routine) ON DELETE CASCADE,
          CONSTRAINT fk_uir_routine_copy FOREIGN KEY (id_routine_copy) REFERENCES routine(id_routine) ON DELETE CASCADE,
          INDEX idx_user_imports (id_user_profile)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { transaction });

      await transaction.commit();
      console.log('✓ Columnas de template en routine y tabla user_imported_routine creadas');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error en migración Fase 1.3:', error.message);
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS user_imported_routine;', { transaction });
      await queryInterface.removeColumn('routine', 'template_order', { transaction }).catch(() => {});
      await queryInterface.removeColumn('routine', 'recommended_for', { transaction }).catch(() => {});
      await queryInterface.removeColumn('routine', 'is_template', { transaction }).catch(() => {});
      await transaction.commit();
      console.log('✓ Revertida migración Fase 1.3');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error en rollback Fase 1.3:', error.message);
      throw error;
    }
  }
};

