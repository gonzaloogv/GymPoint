'use strict';

/**
 * Migración: Mover campos de geofencing de gym_geofence a gym
 * 
 * Esta migración:
 * 1. Agrega columnas auto_checkin_enabled, geofence_radius_meters, min_stay_minutes a gym
 * 2. Migra datos desde gym_geofence a gym
 * 3. Establece valores por defecto
 * 4. Elimina la tabla gym_geofence (ya no necesaria)
 * 5. Crea índices para optimizar búsquedas
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('🔄 Iniciando migración de geofencing a tabla gym...');

      // Paso 1: Verificar si las columnas ya existen
      const [columns] = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME 
         FROM information_schema.COLUMNS 
         WHERE TABLE_NAME = 'gym' 
           AND TABLE_SCHEMA = DATABASE() 
           AND COLUMN_NAME IN ('auto_checkin_enabled', 'geofence_radius_meters', 'min_stay_minutes')`,
        { transaction }
      );

      if (columns.length > 0) {
        console.log('⚠️  Las columnas ya existen, saltando creación');
      } else {
        // Paso 1: Agregar columnas a gym
        console.log('📝 Agregando columnas a gym...');
        await queryInterface.sequelize.query(
          `ALTER TABLE gym
           ADD COLUMN auto_checkin_enabled TINYINT(1) DEFAULT NULL COMMENT 'Auto check-in habilitado',
           ADD COLUMN geofence_radius_meters INT DEFAULT NULL COMMENT 'Radio de geofence en metros',
           ADD COLUMN min_stay_minutes INT DEFAULT NULL COMMENT 'Tiempo mínimo de estadía en minutos'`,
          { transaction }
        );
        console.log('✅ Columnas agregadas');
      }

      // Paso 2: Verificar si existe tabla gym_geofence
      const [tables] = await queryInterface.sequelize.query(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'gym_geofence'`,
        { transaction }
      );

      if (tables.length > 0) {
        console.log('📦 Migrando datos desde gym_geofence...');
        
        // Migrar datos
        await queryInterface.sequelize.query(
          `UPDATE gym g
           INNER JOIN gym_geofence gg ON gg.id_gym = g.id_gym
           SET
             g.auto_checkin_enabled = gg.auto_checkin_enabled,
             g.geofence_radius_meters = gg.radius_meters,
             g.min_stay_minutes = gg.min_stay_minutes`,
          { transaction }
        );
        console.log('✅ Datos migrados desde gym_geofence');
      } else {
        console.log('ℹ️  Tabla gym_geofence no existe, saltando migración de datos');
      }

      // Paso 3: Establecer valores por defecto para gyms sin configuración
      console.log('🔧 Estableciendo valores por defecto...');
      const [result] = await queryInterface.sequelize.query(
        `UPDATE gym
         SET
           auto_checkin_enabled = COALESCE(auto_checkin_enabled, TRUE),
           geofence_radius_meters = COALESCE(geofence_radius_meters, 150),
           min_stay_minutes = COALESCE(min_stay_minutes, 10)
         WHERE auto_checkin_enabled IS NULL
            OR geofence_radius_meters IS NULL
            OR min_stay_minutes IS NULL`,
        { transaction }
      );
      console.log(`✅ Valores por defecto establecidos (${result.affectedRows || 0} registros)`);

      // Paso 4: Hacer columnas NOT NULL
      console.log('🔒 Convirtiendo columnas a NOT NULL...');
      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         MODIFY COLUMN auto_checkin_enabled TINYINT(1) NOT NULL DEFAULT TRUE,
         MODIFY COLUMN geofence_radius_meters INT NOT NULL DEFAULT 150,
         MODIFY COLUMN min_stay_minutes INT NOT NULL DEFAULT 10`,
        { transaction }
      );
      console.log('✅ Columnas convertidas a NOT NULL');

      // Paso 5: Eliminar tabla gym_geofence si existe
      if (tables.length > 0) {
        console.log('🗑️  Eliminando tabla gym_geofence...');
        await queryInterface.sequelize.query(
          'DROP TABLE IF EXISTS gym_geofence',
          { transaction }
        );
        console.log('✅ Tabla gym_geofence eliminada');
      }

      // Paso 6: Crear índice para búsquedas de geofencing
      console.log('📊 Creando índice para geofencing...');
      try {
        await queryInterface.addIndex('gym', {
          fields: ['auto_checkin_enabled', 'geofence_radius_meters', 'latitude', 'longitude'],
          name: 'idx_gym_geofence_config'
        }, { transaction });
        console.log('✅ Índice creado');
      } catch (err) {
        if (err.message.includes('Duplicate key name')) {
          console.log('ℹ️  Índice ya existe');
        } else {
          throw err;
        }
      }

      await transaction.commit();
      console.log('\n✅ MIGRACIÓN COMPLETADA - Geofencing movido a tabla gym');
      console.log('   La ruta /api/gyms ahora debería funcionar correctamente\n');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración de geofencing:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('🔄 Revirtiendo migración de geofencing...');

      // Recrear tabla gym_geofence
      console.log('📝 Recreando tabla gym_geofence...');
      await queryInterface.sequelize.query(
        `CREATE TABLE IF NOT EXISTS gym_geofence (
          id_geofence INT PRIMARY KEY AUTO_INCREMENT,
          id_gym INT NOT NULL UNIQUE,
          radius_meters INT DEFAULT 150 COMMENT 'Radio para auto check-in',
          auto_checkin_enabled TINYINT(1) DEFAULT 1,
          min_stay_minutes INT DEFAULT 10,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_gym_geofence_gym FOREIGN KEY (id_gym) REFERENCES gym(id_gym) ON DELETE CASCADE,
          INDEX idx_auto_checkin (auto_checkin_enabled)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        { transaction }
      );

      // Migrar datos de vuelta a gym_geofence
      console.log('📦 Migrando datos de vuelta a gym_geofence...');
      await queryInterface.sequelize.query(
        `INSERT INTO gym_geofence (id_gym, radius_meters, auto_checkin_enabled, min_stay_minutes)
         SELECT id_gym, geofence_radius_meters, auto_checkin_enabled, min_stay_minutes
         FROM gym
         WHERE auto_checkin_enabled IS NOT NULL`,
        { transaction }
      );

      // Eliminar índice
      console.log('🗑️  Eliminando índice...');
      await queryInterface.removeIndex('gym', 'idx_gym_geofence_config', { transaction })
        .catch(() => console.log('ℹ️  Índice no existe'));

      // Eliminar columnas de gym
      console.log('🗑️  Eliminando columnas de gym...');
      await queryInterface.sequelize.query(
        `ALTER TABLE gym
         DROP COLUMN auto_checkin_enabled,
         DROP COLUMN geofence_radius_meters,
         DROP COLUMN min_stay_minutes`,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Rollback completado - Geofencing restaurado a gym_geofence');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error.message);
      throw error;
    }
  }
};




