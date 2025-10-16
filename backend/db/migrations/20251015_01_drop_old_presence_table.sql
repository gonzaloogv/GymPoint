-- ============================================
-- Pre-migración: Eliminar tabla presence antigua
-- Fecha: 2025-10-15
-- ============================================
-- 
-- ADVERTENCIA: Este script ELIMINA la tabla presence y TODOS sus datos.
-- Ejecutar SOLO si:
-- 1. La tabla presence existe con el esquema ANTIGUO (id_user, entry_time, completed)
-- 2. NO hay datos importantes en la tabla, O ya se respaldaron
-- 
-- RECOMENDACIÓN: Ejecutar este script ANTES de ejecutar 20251015_create_presence_table.sql
-- ============================================

-- PASO 1: Verificar si la tabla existe
-- SELECT COUNT(*) FROM information_schema.tables 
-- WHERE table_schema = DATABASE() 
-- AND table_name = 'presence';

-- PASO 2: (OPCIONAL) Respaldar datos si es necesario
-- CREATE TABLE presence_backup_20251015 AS SELECT * FROM presence;

-- PASO 3: Eliminar la tabla antigua
DROP TABLE IF EXISTS presence;

-- PASO 4: Verificar que se eliminó
-- SELECT COUNT(*) FROM information_schema.tables 
-- WHERE table_schema = DATABASE() 
-- AND table_name = 'presence';
-- (Debe retornar 0)

-- ============================================
-- SIGUIENTE PASO:
-- Ejecutar: 20251015_create_presence_table.sql
-- ============================================

