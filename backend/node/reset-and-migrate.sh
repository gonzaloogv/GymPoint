#!/bin/bash

# Script para resetear BD y ejecutar migraciones desde cero
# Se ejecuta dentro del contenedor Docker

echo "============================================"
echo "  RESET Y MIGRACIÓN DE BASE DE DATOS"
echo "============================================"
echo ""

# 1. Conectar a MySQL y eliminar todas las tablas
echo "📋 Paso 1: Eliminando todas las tablas..."
docker-compose exec db mysql -u root -prootpassword gympoint_db -e "
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS SequelizeMeta;
DROP TABLE IF EXISTS user_device_tokens;
DROP TABLE IF EXISTS user_notification_settings;
DROP TABLE IF EXISTS user_achievement_events;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS user_daily_challenges;
DROP TABLE IF EXISTS daily_challenges;
DROP TABLE IF EXISTS daily_challenge_templates;
DROP TABLE IF EXISTS claimed_rewards;
DROP TABLE IF EXISTS token_ledger;
DROP TABLE IF EXISTS reward_codes;
DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS assistance;
DROP TABLE IF EXISTS frequency;
DROP TABLE IF EXISTS streak;
DROP TABLE IF EXISTS user_gyms;
DROP TABLE IF EXISTS gym_payments;
DROP TABLE IF EXISTS gym_reviews;
DROP TABLE IF EXISTS gym_photos;
DROP TABLE IF EXISTS gym_amenities;
DROP TABLE IF EXISTS gym_gym_type;
DROP TABLE IF EXISTS gym_special_schedule;
DROP TABLE IF EXISTS gym_schedule;
DROP TABLE IF EXISTS gym;
DROP TABLE IF EXISTS gym_type;
DROP TABLE IF EXISTS amenity;
DROP TABLE IF EXISTS achievement;
DROP TABLE IF EXISTS account_deletion_request;
DROP TABLE IF EXISTS admin_profiles;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS accounts;
SET FOREIGN_KEY_CHECKS = 1;
"

if [ $? -eq 0 ]; then
  echo "✅ Tablas eliminadas correctamente"
else
  echo "❌ Error al eliminar tablas"
  exit 1
fi

echo ""
echo "📋 Paso 2: Ejecutando migraciones..."
docker-compose exec backend npm run staging:migrate

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migraciones ejecutadas correctamente"
else
  echo ""
  echo "❌ Error al ejecutar migraciones"
  exit 1
fi

echo ""
echo "📋 Paso 3: Verificando estructura de tablas..."
echo ""

# Verificar user_profiles (no debe tener id_streak, debe tener app_tier)
echo "🔍 Verificando user_profiles..."
docker-compose exec db mysql -u root -prootpassword gympoint_db -e "DESCRIBE user_profiles;" | grep -E "(app_tier|premium_since|premium_expires|id_streak)"

# Verificar streak (debe tener índice único en id_user_profile)
echo ""
echo "🔍 Verificando streak (índice único)..."
docker-compose exec db mysql -u root -prootpassword gympoint_db -e "SHOW INDEXES FROM streak WHERE Column_name = 'id_user_profile';"

# Verificar assistance (no debe tener id_streak)
echo ""
echo "🔍 Verificando assistance..."
docker-compose exec db mysql -u root -prootpassword gympoint_db -e "DESCRIBE assistance;" | grep -E "id_streak"

# Verificar gym (no debe tener id_type)
echo ""
echo "🔍 Verificando gym..."
docker-compose exec db mysql -u root -prootpassword gympoint_db -e "DESCRIBE gym;" | grep -E "id_type"

echo ""
echo "============================================"
echo "  PROCESO COMPLETADO"
echo "============================================"
echo ""
echo "Campos que DEBEN existir:"
echo "  ✅ user_profiles.app_tier"
echo "  ✅ user_profiles.premium_since"
echo "  ✅ user_profiles.premium_expires"
echo ""
echo "Campos que NO deben existir:"
echo "  ❌ user_profiles.id_streak"
echo "  ❌ assistance.id_streak"
echo "  ❌ gym.id_type"
echo ""
echo "Índices únicos:"
echo "  ✅ streak.id_user_profile (UNIQUE)"
echo ""
