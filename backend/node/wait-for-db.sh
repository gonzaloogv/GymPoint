#!/bin/sh

echo "⏳ Esperando que MySQL esté disponible en $DB_HOST:$DB_PORT..."

# Espera activa al puerto hasta que esté accesible
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "✅ MySQL está disponible. Iniciando el servidor..."

# Ejecuta el comando por defecto del contenedor (el backend)
exec "$@"
