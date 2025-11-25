-- ============================================
-- GymPoint MVP Cleanup Migrations - CORRECTED VERSION
-- Fecha: 2025-10-14
-- Versión: 1.0 CORREGIDA
--
-- IMPORTANTE: Este script corrige los errores del script original
-- Ejecutar DESPUÉS del dump actual (gympoint_dump_20251014_214612.sql)
-- ============================================

-- ============================================
-- PRE-CHECKS: Verificar estado actual
-- ============================================

-- Verificar que gym_geofence existe
SELECT 'VERIFICACION: gym_geofence existe' as status,
       COUNT(*) as total_registros
FROM gym_geofence;

-- Verificar que gym NO tiene los campos aún
SELECT 'VERIFICACION: Estructura actual de gym' as info,
       COLUMN_NAME,
       DATA_TYPE,
       IS_NULLABLE,
       COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'gym'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('auto_checkin_enabled', 'geofence_radius_meters', 'min_stay_minutes');

-- ============================================
-- MIGRACIÓN 1A: AGREGAR campos a gym (NUEVO)
-- ============================================

-- Paso 1A: Agregar columnas nuevas a gym
ALTER TABLE gym
ADD COLUMN auto_checkin_enabled TINYINT(1) DEFAULT NULL COMMENT 'Auto check-in habilitado',
ADD COLUMN geofence_radius_meters INT DEFAULT NULL COMMENT 'Radio de geofence en metros',
ADD COLUMN min_stay_minutes INT DEFAULT NULL COMMENT 'Tiempo mínimo de estadía en minutos';

SELECT 'PASO 1A COMPLETADO: Campos agregados a gym' as status;

-- ============================================
-- MIGRACIÓN 1B: Migrar datos gym_geofence → gym
-- ============================================

-- Paso 1B: Copiar datos existentes de gym_geofence a gym
UPDATE gym g
INNER JOIN gym_geofence gg ON gg.id_gym = g.id_gym
SET
  g.auto_checkin_enabled = gg.auto_checkin_enabled,
  g.geofence_radius_meters = gg.radius_meters,
  g.min_stay_minutes = gg.min_stay_minutes;

SELECT 'PASO 1B COMPLETADO: Datos copiados de gym_geofence' as status;

-- Paso 1C: Establecer defaults para gyms sin geofence
UPDATE gym
SET
  auto_checkin_enabled = COALESCE(auto_checkin_enabled, TRUE),
  geofence_radius_meters = COALESCE(geofence_radius_meters, 150),
  min_stay_minutes = COALESCE(min_stay_minutes, 30)
WHERE auto_checkin_enabled IS NULL
   OR geofence_radius_meters IS NULL
   OR min_stay_minutes IS NULL;

SELECT 'PASO 1C COMPLETADO: Defaults aplicados' as status;

-- Paso 1D: Hacer NOT NULL los campos (ahora que tienen valores)
ALTER TABLE gym
MODIFY COLUMN auto_checkin_enabled TINYINT(1) NOT NULL DEFAULT TRUE,
MODIFY COLUMN geofence_radius_meters INT NOT NULL DEFAULT 150,
MODIFY COLUMN min_stay_minutes INT NOT NULL DEFAULT 30;

SELECT 'PASO 1D COMPLETADO: Campos marcados como NOT NULL' as status;

-- Paso 1E: ELIMINAR datos de gym_geofence antes de eliminar tabla
-- (Esto es redundante con DROP TABLE, pero hace el proceso más explícito)
DELETE FROM gym_geofence;

SELECT 'PASO 1E COMPLETADO: Datos de gym_geofence eliminados' as status,
       ROW_COUNT() as registros_eliminados;

-- Paso 1F: ELIMINAR tabla gym_geofence (ya no necesaria)
DROP TABLE IF EXISTS gym_geofence;

SELECT 'PASO 1F COMPLETADO: Tabla gym_geofence eliminada' as status;

-- ============================================
-- MIGRACIÓN 2: Limpiar assistance timestamps
-- ============================================

-- ESTRATEGIA RECOMENDADA: Migrar hour → check_in_time
-- Paso 2A: Copiar datos de hour a check_in_time (para registros sin check_in_time)
UPDATE assistance
SET check_in_time = hour
WHERE check_in_time IS NULL AND hour IS NOT NULL;

SELECT 'PASO 2A COMPLETADO: Datos migrados de hour a check_in_time' as status;

-- Paso 2B: Hacer check_in_time NOT NULL
ALTER TABLE assistance
MODIFY COLUMN check_in_time TIME NOT NULL;

SELECT 'PASO 2B COMPLETADO: check_in_time ahora es NOT NULL' as status;

-- Paso 2C: DEPRECAR columna hour (la mantenemos por compatibilidad temporal)
-- NOTA: En una futura migración, eliminar la columna 'hour' completamente
-- ALTER TABLE assistance DROP COLUMN hour;  -- DESCOMENTAR en fase 2

SELECT 'PASO 2C INFO: Columna hour mantenida temporalmente por compatibilidad' as info;

-- ============================================
-- MIGRACIÓN 3: Agregar ÍNDICES CRÍTICOS
-- ============================================

-- Índice para búsquedas de geofencing (muy usado)
CREATE INDEX IF NOT EXISTS idx_gym_geofence_config
ON gym(auto_checkin_enabled, geofence_radius_meters, latitude, longitude)
WHERE deleted_at IS NULL AND auto_checkin_enabled = TRUE;

-- Índice para búsquedas de check-in/out (CRÍTICO)
CREATE INDEX IF NOT EXISTS idx_assistance_checkin_checkout
ON assistance(id_user, date, check_in_time, check_out_time);

-- Índice para reportes de duración
CREATE INDEX IF NOT EXISTS idx_assistance_duration_stats
ON assistance(id_gym, date, duration_minutes)
WHERE duration_minutes IS NOT NULL;

-- Índice para buscar records sin check-out (sesiones abiertas)
CREATE INDEX IF NOT EXISTS idx_assistance_open_sessions
ON assistance(id_user, date, check_out_time)
WHERE check_out_time IS NULL AND check_in_time IS NOT NULL;

-- Índice para desafíos pendientes (muy usado)
CREATE INDEX IF NOT EXISTS idx_user_daily_challenge_pending
ON user_daily_challenge(completed, id_user_profile, id_challenge)
WHERE completed = FALSE;

-- Índice para estadísticas de rutinas plantilla
CREATE INDEX IF NOT EXISTS idx_routine_templates_discovery
ON routine(is_template, recommended_for, template_order)
WHERE is_template = TRUE AND deleted_at IS NULL;

-- Índice para frecuencia semanal
CREATE INDEX IF NOT EXISTS idx_frequency_week_stats
ON frequency(id_user, year, week_number)
WHERE achieved_goal = TRUE;

SELECT 'PASO 3 COMPLETADO: Índices críticos creados' as status;

-- ============================================
-- MIGRACIÓN 4: Eliminar duplicación en user_profiles
-- ============================================

-- Sincronizar app_tier con subscription ANTES de eliminar (por seguridad)
UPDATE user_profiles
SET subscription = app_tier
WHERE subscription != app_tier AND app_tier IS NOT NULL;

SELECT 'PASO 4A COMPLETADO: subscription sincronizado con app_tier' as status;

-- Eliminar columna app_tier (duplicada, usar solo subscription)
ALTER TABLE user_profiles
DROP COLUMN app_tier;

SELECT 'PASO 4B COMPLETADO: Columna app_tier eliminada' as status;

-- ============================================
-- MIGRACIÓN 5: Seed Data para Rutinas Plantilla
-- ============================================

-- LIMPIAR rutinas plantilla mal seeded (ids 7-11)
DELETE FROM routine WHERE id_routine IN (7, 8, 9, 10, 11);

SELECT 'PASO 5A COMPLETADO: Rutinas plantilla duplicadas eliminadas' as status;

-- INSERTAR rutinas plantilla correctas con todos los campos
INSERT INTO routine (
  routine_name,
  description,
  is_template,
  recommended_for,
  template_order,
  category,
  target_goal,
  equipment_level,
  created_by,
  created_at,
  updated_at
) VALUES
(
  'Full Body Beginner',
  'Rutina para principiantes: cuerpo completo 3 días por semana. Ejercicios básicos y seguros para comenzar tu viaje fitness.',
  TRUE,
  'BEGINNER',
  1,
  'STRENGTH',
  'GENERAL_FITNESS',
  'FULL_GYM',
  1,
  NOW(),
  NOW()
),
(
  'Push Pull Legs',
  'Split clásico de 3 días: Push (pecho/hombros/tríceps), Pull (espalda/bíceps), Legs (piernas/glúteos). Ideal para hipertrofia.',
  TRUE,
  'INTERMEDIATE',
  2,
  'STRENGTH',
  'MUSCLE_GAIN',
  'FULL_GYM',
  1,
  NOW(),
  NOW()
),
(
  'HIIT 30 minutos',
  'Cardio de alta intensidad: 30 minutos de intervalos 40s trabajo intenso + 20s descanso. Sin equipo necesario, quema grasa efectiva.',
  TRUE,
  'INTERMEDIATE',
  3,
  'HIIT',
  'WEIGHT_LOSS',
  'NO_EQUIPMENT',
  1,
  NOW(),
  NOW()
),
(
  'Flexibilidad y Movilidad',
  'Estiramientos activos y movilidad articular. Ideal para recuperación, calentamiento o días de descanso activo.',
  TRUE,
  'BEGINNER',
  4,
  'FLEXIBILITY',
  'GENERAL_FITNESS',
  'NO_EQUIPMENT',
  1,
  NOW(),
  NOW()
),
(
  'Upper Lower Split',
  'Split avanzado de 4 días: Upper x2, Lower x2. Hipertrofia pura con volumen moderado-alto. Requiere experiencia.',
  TRUE,
  'ADVANCED',
  5,
  'STRENGTH',
  'MUSCLE_GAIN',
  'FULL_GYM',
  1,
  NOW(),
  NOW()
);

SELECT 'PASO 5B COMPLETADO: 5 rutinas plantilla insertadas correctamente' as status;

-- ============================================
-- MIGRACIÓN 6: Crear tabla user_device_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS user_device_tokens (
    id_device_token BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user_profile INT NOT NULL COMMENT 'Usuario propietario del dispositivo',
    platform ENUM('IOS', 'ANDROID', 'WEB') NOT NULL COMMENT 'Plataforma del dispositivo',
    device_id VARCHAR(255) NULL COMMENT 'ID único del dispositivo (opcional)',
    push_token VARCHAR(500) NOT NULL COMMENT 'Token de push notification',
    app_version VARCHAR(20) NULL COMMENT 'Versión de la app',
    os_version VARCHAR(50) NULL COMMENT 'Versión del sistema operativo',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Token activo para recibir notificaciones',
    last_seen_at DATETIME NULL COMMENT 'Última vez que se usó este token',
    revoked_at DATETIME NULL COMMENT 'Fecha de revocación del token',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `idx_device_tokens_push_token` (`push_token`),
    KEY `idx_device_tokens_user_active` (`id_user_profile`, `is_active`),
    KEY `idx_device_tokens_platform_active` (`platform`, `is_active`),
    KEY `idx_device_tokens_last_seen` (`last_seen_at`),

    CONSTRAINT `user_device_tokens_ibfk_1`
        FOREIGN KEY (`id_user_profile`)
        REFERENCES `user_profiles` (`id_user_profile`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de dispositivos para push notifications';

SELECT 'PASO 6 COMPLETADO: Tabla user_device_tokens creada' as status;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- 1. Verificar que gym_geofence se eliminó
SELECT 'VERIFICACIÓN 1: gym_geofence eliminada' as test,
       CASE
         WHEN COUNT(*) = 0 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'gym_geofence';

-- 2. Verificar que gym tiene los 3 campos nuevos
SELECT 'VERIFICACIÓN 2: gym tiene campos geofencing' as test,
       CASE
         WHEN COUNT(DISTINCT COLUMN_NAME) = 3 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'gym'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('auto_checkin_enabled', 'geofence_radius_meters', 'min_stay_minutes');

-- 3. Verificar que todos los gyms tienen valores en campos geofencing
SELECT 'VERIFICACIÓN 3: Todos los gyms tienen valores geofencing' as test,
       CASE
         WHEN COUNT(*) = (SELECT COUNT(*) FROM gym WHERE deleted_at IS NULL) THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM gym
WHERE deleted_at IS NULL
  AND auto_checkin_enabled IS NOT NULL
  AND geofence_radius_meters IS NOT NULL
  AND min_stay_minutes IS NOT NULL;

-- 4. Verificar índices nuevos creados
SELECT 'VERIFICACIÓN 4: Índices críticos creados' as test,
       CONCAT(COUNT(DISTINCT INDEX_NAME), ' índices creados') as resultado
FROM information_schema.STATISTICS
WHERE TABLE_NAME IN ('gym', 'assistance', 'user_daily_challenge', 'routine', 'frequency')
  AND TABLE_SCHEMA = DATABASE()
  AND INDEX_NAME LIKE 'idx_%'
  AND INDEX_NAME IN (
    'idx_gym_geofence_config',
    'idx_assistance_checkin_checkout',
    'idx_assistance_duration_stats',
    'idx_assistance_open_sessions',
    'idx_user_daily_challenge_pending',
    'idx_routine_templates_discovery',
    'idx_frequency_week_stats'
  );

-- 5. Verificar rutinas plantilla correctas
SELECT 'VERIFICACIÓN 5: Rutinas plantilla correctas' as test,
       CONCAT(COUNT(*), ' rutinas con metadata completa') as resultado
FROM routine
WHERE is_template = TRUE
  AND category IS NOT NULL
  AND target_goal IS NOT NULL
  AND equipment_level IS NOT NULL
  AND recommended_for IS NOT NULL;

-- 6. Verificar user_device_tokens existe
SELECT 'VERIFICACIÓN 6: user_device_tokens creada' as test,
       CASE
         WHEN COUNT(*) = 1 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'user_device_tokens';

-- 7. Verificar que assistance.check_in_time es NOT NULL
SELECT 'VERIFICACIÓN 7: assistance.check_in_time es NOT NULL' as test,
       CASE
         WHEN IS_NULLABLE = 'NO' THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'assistance'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'check_in_time';

-- 8. Verificar que app_tier fue eliminado de user_profiles
SELECT 'VERIFICACIÓN 8: app_tier eliminado de user_profiles' as test,
       CASE
         WHEN COUNT(*) = 0 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as resultado
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'user_profiles'
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'app_tier';

-- ============================================
-- REPORTE FINAL
-- ============================================

SELECT '===========================================' as separator;
SELECT 'MIGRACIÓN COMPLETADA' as status;
SELECT NOW() as timestamp;
SELECT '===========================================' as separator;

-- Mostrar rutinas plantilla creadas
SELECT
  'RUTINAS PLANTILLA:' as info,
  id_routine,
  routine_name,
  recommended_for,
  category,
  target_goal,
  equipment_level,
  template_order
FROM routine
WHERE is_template = TRUE
ORDER BY template_order;

-- Mostrar configuración geofencing de gyms
SELECT
  'CONFIGURACIÓN GEOFENCING:' as info,
  id_gym,
  name,
  auto_checkin_enabled,
  geofence_radius_meters,
  min_stay_minutes,
  latitude,
  longitude
FROM gym
WHERE deleted_at IS NULL
LIMIT 5;

SELECT '===========================================' as separator;
SELECT 'SIGUIENTE PASO: Actualizar modelos Sequelize' as accion;
SELECT '===========================================' as separator;
