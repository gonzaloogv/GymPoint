-- Script para verificar y corregir achievements sin tokens asignados
-- =====================================================================

-- 1. Ver todos los achievements y sus tokens actuales
SELECT
    id_achievement_definition,
    code,
    name,
    category,
    target_value,
    JSON_EXTRACT(metadata, '$.token_reward') as token_reward,
    JSON_EXTRACT(metadata, '$.unlock_message') as unlock_message,
    is_active
FROM achievement_definition
ORDER BY category, target_value;

-- 2. Identificar achievements SIN tokens asignados
SELECT
    id_achievement_definition,
    code,
    name,
    category,
    target_value,
    metadata
FROM achievement_definition
WHERE metadata IS NULL
   OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL
   OR JSON_EXTRACT(metadata, '$.token_reward') = 0;

-- 3. Script de actualización: Asignar tokens basados en categoría y dificultad
-- NOTA: Ejecutar solo después de revisar los resultados anteriores

-- ONBOARDING: 10-20 tokens (son logros de inicio)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward', 10,
    '$.unlock_message', CONCAT('¡Bienvenido! Has completado: ', name)
)
WHERE category = 'ONBOARDING'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- STREAK: 15-50 tokens (según días de racha)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 7 THEN 15
        WHEN target_value <= 30 THEN 25
        WHEN target_value <= 90 THEN 40
        ELSE 50
    END,
    '$.unlock_message', CONCAT('¡Increíble racha de ', target_value, ' días!')
)
WHERE category = 'STREAK'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- FREQUENCY: 20-40 tokens (según semanas)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 4 THEN 20
        WHEN target_value <= 12 THEN 30
        ELSE 40
    END,
    '$.unlock_message', CONCAT('¡Has cumplido tu objetivo ', target_value, ' semanas!')
)
WHERE category = 'FREQUENCY'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- ATTENDANCE: 10-35 tokens (según total de asistencias)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 10 THEN 10
        WHEN target_value <= 50 THEN 20
        WHEN target_value <= 100 THEN 30
        ELSE 35
    END,
    '$.unlock_message', CONCAT('¡Has asistido ', target_value, ' veces al gym!')
)
WHERE category = 'ATTENDANCE'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- ROUTINE: 15-40 tokens (según rutinas completadas)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 5 THEN 15
        WHEN target_value <= 20 THEN 25
        WHEN target_value <= 50 THEN 35
        ELSE 40
    END,
    '$.unlock_message', CONCAT('¡Has completado ', target_value, ' rutinas!')
)
WHERE category = 'ROUTINE'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- CHALLENGE: 20-50 tokens (según desafíos completados)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 5 THEN 20
        WHEN target_value <= 15 THEN 30
        WHEN target_value <= 30 THEN 40
        ELSE 50
    END,
    '$.unlock_message', CONCAT('¡Has completado ', target_value, ' desafíos!')
)
WHERE category = 'CHALLENGE'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- PROGRESS: 25-60 tokens (logros de progreso personal)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 5 THEN 25
        WHEN target_value <= 20 THEN 35
        WHEN target_value <= 50 THEN 50
        ELSE 60
    END,
    '$.unlock_message', CONCAT('¡Progreso increíble! ', name)
)
WHERE category = 'PROGRESS'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- TOKEN: 30-100 tokens (logros relacionados con tokens)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 100 THEN 30
        WHEN target_value <= 500 THEN 50
        WHEN target_value <= 1000 THEN 75
        ELSE 100
    END,
    '$.unlock_message', CONCAT('¡Has alcanzado ', target_value, ' tokens!')
)
WHERE category = 'TOKEN'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- SOCIAL: 20-40 tokens (logros sociales)
UPDATE achievement_definition
SET metadata = JSON_SET(
    COALESCE(metadata, JSON_OBJECT()),
    '$.token_reward',
    CASE
        WHEN target_value <= 5 THEN 20
        WHEN target_value <= 20 THEN 30
        ELSE 40
    END,
    '$.unlock_message', CONCAT('¡Logro social desbloqueado! ', name)
)
WHERE category = 'SOCIAL'
  AND (metadata IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') IS NULL OR JSON_EXTRACT(metadata, '$.token_reward') = 0);

-- 4. Verificar que todos los achievements ahora tienen tokens
SELECT
    id_achievement_definition,
    code,
    name,
    category,
    target_value,
    JSON_EXTRACT(metadata, '$.token_reward') as token_reward,
    JSON_EXTRACT(metadata, '$.unlock_message') as unlock_message
FROM achievement_definition
WHERE is_active = 1
ORDER BY category, target_value;

-- 5. Resumen por categoría
SELECT
    category,
    COUNT(*) as total_achievements,
    MIN(JSON_EXTRACT(metadata, '$.token_reward')) as min_tokens,
    MAX(JSON_EXTRACT(metadata, '$.token_reward')) as max_tokens,
    AVG(JSON_EXTRACT(metadata, '$.token_reward')) as avg_tokens
FROM achievement_definition
WHERE is_active = 1
GROUP BY category
ORDER BY category;
