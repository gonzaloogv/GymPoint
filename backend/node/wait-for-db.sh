#!/bin/sh

echo "Esperando que MySQL este disponible en $DB_HOST:$DB_PORT..."

# Espera activa al puerto hasta que este accesible
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "MySQL esta disponible."
echo "Ejecutando migraciones..."

# Ejecutar migraciones
node migrate.js

echo "Ejecutando seed de usuario admin..."

# Ejecutar seed de admin
node scripts/seed-admin.js

echo "Iniciando el servidor..."

# Ejecuta el comando por defecto del contenedor (el backend)
exec "$@"
