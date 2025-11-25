-- ============================================
-- Migración: Crear tabla presence para auto check-in con geofencing
-- Fecha: 2025-10-15
-- Versión: 2.0 (Esquema Correcto)
-- ============================================

-- IMPORTANTE: Si la tabla ya existe con el esquema antiguo, eliminarla primero
-- DROP TABLE IF EXISTS presence;

-- Crear tabla con esquema correcto (coincide con modelo Sequelize)
CREATE TABLE IF NOT EXISTS presence (
  -- IDs
  id_presence BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la presencia',
  id_user_profile INT NOT NULL COMMENT 'ID del perfil de usuario (user_profiles)',
  id_gym INT NOT NULL COMMENT 'ID del gimnasio',
  
  -- Timestamps de presencia
  first_seen_at DATETIME NOT NULL COMMENT 'Primera detección en geofence',
  last_seen_at DATETIME NOT NULL COMMENT 'Última actualización de ubicación',
  exited_at DATETIME NULL COMMENT 'Cuándo salió del geofence',
  
  -- Estado de la presencia
  status ENUM('DETECTING', 'CONFIRMED', 'EXITED') NOT NULL DEFAULT 'DETECTING'
    COMMENT 'DETECTING: detectando permanencia, CONFIRMED: check-in confirmado, EXITED: salió del área',
  
  -- Conversión a asistencia
  converted_to_assistance TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Si ya se convirtió en asistencia (evita duplicados)',
  id_assistance INT NULL COMMENT 'ID de la asistencia creada (si existe)',
  
  -- Metadata de geolocalización
  distance_meters DECIMAL(6, 2) NULL COMMENT 'Distancia al gimnasio en metros',
  accuracy_meters DECIMAL(6, 2) NULL COMMENT 'Precisión GPS en metros',
  location_updates_count INT NOT NULL DEFAULT 1
    COMMENT 'Cantidad de actualizaciones de ubicación recibidas',
  
  -- Timestamps del sistema
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Cuándo se creó el registro',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    COMMENT 'Última actualización del registro',
  
  -- Índices para optimización de queries
  INDEX idx_user_gym_status (id_user_profile, id_gym, status)
    COMMENT 'Buscar presencias activas de un usuario en un gym',
  INDEX idx_status_last_seen (status, last_seen_at)
    COMMENT 'Buscar presencias antiguas para marcar como EXITED',
  INDEX idx_converted (converted_to_assistance)
    COMMENT 'Filtrar presencias ya convertidas',
  
  -- Foreign Keys con nombres explícitos
  CONSTRAINT fk_presence_user_profile 
    FOREIGN KEY (id_user_profile) 
    REFERENCES user_profiles(id_user_profile)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_presence_gym 
    FOREIGN KEY (id_gym) 
    REFERENCES gym(id_gym)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_presence_assistance 
    FOREIGN KEY (id_assistance) 
    REFERENCES assistance(id_assistance)
    ON DELETE SET NULL
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de presencias en geofence para auto check-in';

-- ============================================
-- Rollback: Eliminar tabla presence
-- ============================================
-- DROP TABLE IF EXISTS presence;
