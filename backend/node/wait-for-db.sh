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

echo "Ejecutando seeds de datos iniciales..."

# Ejecutar seed de admin (deprecated - ahora está en initial-data.js)
# node scripts/seed-admin.js

# Ejecutar seed completo con amenidades, ejercicios, logros y admin
node seed/initial-data.js

echo "Iniciando el servidor..."

# Ejecuta el comando por defecto del contenedor (el backend)
exec "$@"
