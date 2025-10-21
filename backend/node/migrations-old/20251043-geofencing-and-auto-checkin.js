'use strict';

/**
 * Migración: Geofencing y Auto Check-in (Fase 1.1)
 *
 * - Crea tabla gym_geofence (config por gimnasio)
 * - Agrega columnas distance_meters y auto_checkin a assistance
 * - Agrega índices de soporte
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Crear tabla gym_geofence si no existe
      const [tables] = await queryInterface.sequelize.query(
        "SHOW TABLES LIKE 'gym_geofence';",
        { transaction }
      );

      if (tables.length === 0) {
        await queryInterface.sequelize.query(
          `CREATE TABLE gym_geofence (
            id_geofence INT PRIMARY KEY AUTO_INCREMENT,
            id_gym INT NOT NULL UNIQUE,
            radius_meters INT DEFAULT 150 COMMENT 'Radio para auto check-in',
            auto_checkin_enabled BOOLEAN DEFAULT TRUE,
            min_stay_minutes INT DEFAULT 30,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_gym_geofence_gym FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
            INDEX idx_auto_checkin (auto_checkin_enabled)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          COMMENT='Configuración de geolocalización para auto check-in';`,
          { transaction }
        );
      }

      // Agregar columnas a assistance si faltan
      await queryInterface.addColumn('assistance', 'distance_meters', {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Distancia al gimnasio (m)'
      }, { transaction }).catch(() => {});

      await queryInterface.addColumn('assistance', 'auto_checkin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si fue auto check-in'
      }, { transaction }).catch(() => {});

      // Índices de soporte
      await queryInterface.addIndex('assistance', {
        fields: ['auto_checkin', 'date'],
        name: 'idx_assistance_auto_date'
      }, { transaction }).catch(() => {});

      await queryInterface.addIndex('assistance', {
        fields: ['duration_minutes'],
        name: 'idx_assistance_duration'
      }, { transaction }).catch(() => {});

      await transaction.commit();
      console.log('\n✓ Geofencing y columnas de assistance aplicadas');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error en migración geofencing:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Quitar índices
      await queryInterface.removeIndex('assistance', 'idx_assistance_auto_date', { transaction }).catch(() => {});
      await queryInterface.removeIndex('assistance', 'idx_assistance_duration', { transaction }).catch(() => {});

      // Quitar columnas
      await queryInterface.removeColumn('assistance', 'distance_meters', { transaction }).catch(() => {});
      await queryInterface.removeColumn('assistance', 'auto_checkin', { transaction }).catch(() => {});

      // Eliminar tabla gym_geofence
      await queryInterface.sequelize.query(
        'DROP TABLE IF EXISTS gym_geofence;',
        { transaction }
      );

      await transaction.commit();
      console.log('✓ Rollback de geofencing completado');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error en rollback de geofencing:', error.message);
      throw error;
    }
  }
};

