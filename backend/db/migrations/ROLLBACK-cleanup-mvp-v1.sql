-- ============================================
-- GymPoint MVP Cleanup Migrations - ROLLBACK
-- Fecha: 2025-10-14
-- Versión: 1.0
--
-- SCRIPT DE ROLLBACK para cleanup-mvp-v1-CORRECTED.sql
-- Ejecutar SOLO si necesitas revertir las migraciones
-- ============================================

-- ADVERTENCIA: Este rollback puede causar pérdida de datos si:
-- 1. Se crearon nuevos gyms después de la migración (perderán su config geofencing)
-- 2. Se agregaron nuevos device tokens (se perderán)
-- 3. Se modificaron rutinas plantilla (se revertirán a estado anterior)

START TRANSACTION;

-- ============================================
-- ROLLBACK 6: Eliminar user_device_tokens
-- ============================================

SELECT 'ROLLBACK 6: Eliminando user_device_tokens...' as status;

DROP TABLE IF EXISTS user_device_tokens;

-- ============================================
-- ROLLBACK 5: Revertir rutinas plantilla
-- ============================================

SELECT 'ROLLBACK 5: Revirtiendo rutinas plantilla...' as status;

-- Eliminar rutinas plantilla nuevas (las que agregamos)
DELETE FROM routine
WHERE is_template = TRUE
  AND routine_name IN (
    'Full Body Beginner',
    'Push Pull Legs',
    'HIIT 30 minutos',
    'Flexibilidad y Movilidad',
    'Upper Lower Split'
  )
  AND category IS NOT NULL;

-- Restaurar rutinas plantilla anteriores (duplicadas pero como estaban)
INSERT INTO routine (
  id_routine,
  routine_name,
  description,
  created_by,
  is_template,
  deleted_at,
  recommended_for,
  template_order,
  created_at,
  updated_at,
  category,
  target_goal,
  equipment_level
) VALUES
(7, 'Full Body Beginner', 'Cuerpo completo para iniciar', NULL, 1, NULL, 'BEGINNER', 1, '2025-10-14 04:33:26', '2025-10-14 04:33:26', NULL, NULL, NULL),
(8, 'Push Pull Legs', 'Dividida en 3 días', NULL, 1, NULL, 'INTERMEDIATE', 2, '2025-10-14 04:33:26', '2025-10-14 04:33:26', NULL, NULL, NULL),
(9, 'HIIT 30min', 'Cardio intenso 30 minutos', NULL, 1, NULL, 'INTERMEDIATE', 3, '2025-10-14 04:33:26', '2025-10-14 04:33:26', NULL, NULL, NULL),
(10, 'Flexibilidad', 'Estiramientos básicos', NULL, 1, NULL, 'BEGINNER', 4, '2025-10-14 04:33:26', '2025-10-14 04:33:26', NULL, NULL, NULL),
(11, 'Upper Lower', 'Split superior/inferior', NULL, 1, NULL, 'ADVANCED', 5, '2025-10-14 04:33:26', '2025-10-14 04:33:26', NULL, NULL, NULL);

-- ============================================
-- ROLLBACK 4: Restaurar app_tier en user_profiles
-- ============================================

SELECT 'ROLLBACK 4: Restaurando columna app_tier...' as status;

ALTER TABLE user_profiles
ADD COLUMN app_tier ENUM('FREE','PREMIUM') NOT NULL DEFAULT 'FREE';

-- Sincronizar app_tier con subscription
UPDATE user_profiles
SET app_tier = subscription;

-- ============================================
-- ROLLBACK 3: Eliminar índices críticos
-- ============================================

SELECT 'ROLLBACK 3: Eliminando índices...' as status;

DROP INDEX IF EXISTS idx_gym_geofence_config ON gym;
DROP INDEX IF EXISTS idx_assistance_checkin_checkout ON assistance;
DROP INDEX IF EXISTS idx_assistance_duration_stats ON assistance;
DROP INDEX IF EXISTS idx_assistance_open_sessions ON assistance;
DROP INDEX IF EXISTS idx_user_daily_challenge_pending ON user_daily_challenge;
DROP INDEX IF EXISTS idx_routine_templates_discovery ON routine;
DROP INDEX IF EXISTS idx_frequency_week_stats ON frequency;

-- ============================================
-- ROLLBACK 2: Revertir assistance.check_in_time
-- ============================================

SELECT 'ROLLBACK 2: Revirtiendo check_in_time a nullable...' as status;

ALTER TABLE assistance
MODIFY COLUMN check_in_time TIME NULL;

-- ============================================
-- ROLLBACK 1: Recrear gym_geofence y mover datos
-- ============================================

SELECT 'ROLLBACK 1: Recreando gym_geofence...' as status;

-- Recrear tabla gym_geofence
CREATE TABLE IF NOT EXISTS gym_geofence (
  id_geofence INT NOT NULL AUTO_INCREMENT,
  id_gym INT NOT NULL,
  radius_meters INT DEFAULT 150 COMMENT 'Radio para auto check-in',
  auto_checkin_enabled TINYINT(1) DEFAULT 1,
  min_stay_minutes INT DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_geofence),
  UNIQUE KEY id_gym (id_gym),
  KEY idx_auto_checkin (auto_checkin_enabled),
  CONSTRAINT fk_gym_geofence_gym FOREIGN KEY (id_gym) REFERENCES gym (id_gym) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración de geolocalización para auto check-in';

-- Copiar datos de gym a gym_geofence
INSERT INTO gym_geofence (id_gym, radius_meters, auto_checkin_enabled, min_stay_minutes)
SELECT
  id_gym,
  geofence_radius_meters,
  auto_checkin_enabled,
  min_stay_minutes
FROM gym
WHERE deleted_at IS NULL;

-- Eliminar campos de geofencing de gym
ALTER TABLE gym
DROP COLUMN auto_checkin_enabled,
DROP COLUMN geofence_radius_meters,
DROP COLUMN min_stay_minutes;

-- ============================================
-- VERIFICACIÓN POST-ROLLBACK
-- ============================================

SELECT 'VERIFICACIÓN 1: gym_geofence recreada' as test,
       CASE
         WHEN COUNT(*) = 1 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'gym_geofence';

SELECT 'VERIFICACIÓN 2: gym NO tiene campos geofencing' as test,
       CASE
         WHEN COUNT(*) = 0 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'gym'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('auto_checkin_enabled', 'geofence_radius_meters', 'min_stay_minutes');

SELECT 'VERIFICACIÓN 3: app_tier restaurado' as test,
       CASE
         WHEN COUNT(*) = 1 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'user_profiles'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'app_tier';

SELECT 'VERIFICACIÓN 4: user_device_tokens eliminada' as test,
       CASE
         WHEN COUNT(*) = 0 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'user_device_tokens';

-- ============================================
-- REPORTE FINAL
-- ============================================

SELECT '===========================================' as separator;
SELECT 'ROLLBACK COMPLETADO' as status;
SELECT NOW() as timestamp;
SELECT '===========================================' as separator;
SELECT 'Base de datos revertida al estado anterior a cleanup-mvp-v1-CORRECTED.sql' as info;
SELECT '===========================================' as separator;

-- Si todo está bien, hacer commit
-- Si algo falló, hacer ROLLBACK;

COMMIT;
-- ROLLBACK;  -- Descomentar si hubo errores
