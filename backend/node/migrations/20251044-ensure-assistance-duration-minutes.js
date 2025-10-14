'use strict';

/**
 * Migración de compatibilidad: asegurar columna assistance.duration_minutes
 *
 * En algunos entornos MySQL, el intento anterior con IF NOT EXISTS pudo fallar.
 * Aquí nos aseguramos de crear la columna. Preferimos columna generada; si falla,
 * degradamos a INT normal (no generada).
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assistance' AND COLUMN_NAME = 'duration_minutes'`,
        { transaction }
      );

      if (rows.length === 0) {
        // Intentar columna generada (MySQL 5.7+)
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE assistance ADD COLUMN duration_minutes INT GENERATED ALWAYS AS (
              CASE
                WHEN check_out_time IS NOT NULL AND check_in_time IS NOT NULL
                THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
                ELSE NULL
              END
            ) STORED`,
            { transaction }
          );
        } catch (err) {
          // Fallback a una columna normal (no generada)
          await queryInterface.addColumn('assistance', 'duration_minutes', {
            type: Sequelize.INTEGER,
            allowNull: true
          }, { transaction });
        }
      }

      await transaction.commit();
      console.log('✓ duration_minutes asegurada en assistance');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error asegurando duration_minutes:', error.message);
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('assistance', 'duration_minutes', { transaction });
      await transaction.commit();
      console.log('✓ duration_minutes eliminada de assistance');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error en rollback duration_minutes:', error.message);
      throw error;
    }
  }
};

