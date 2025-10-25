#!/bin/bash

# Script para ejecutar las pruebas de Postman con Newman
# Uso: ./run-tests.sh [environment]
# Ejemplo: ./run-tests.sh local (por defecto)
#          ./run-tests.sh production

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que Newman esté instalado
if ! command -v newman &> /dev/null; then
    print_error "Newman no está instalado"
    print_info "Instálalo con: npm install -g newman"
    print_info "O localmente: npm install --save-dev newman"
    exit 1
fi

# Determinar el entorno
ENVIRONMENT=${1:-local}

if [ "$ENVIRONMENT" == "local" ]; then
    ENV_FILE="GymPoint-Local.postman_environment.json"
elif [ "$ENVIRONMENT" == "production" ]; then
    ENV_FILE="GymPoint-Production.postman_environment.json"
else
    print_error "Entorno no válido: $ENVIRONMENT"
    print_info "Usa 'local' o 'production'"
    exit 1
fi

# Verificar que los archivos existan
COLLECTION_FILE="GymPoint-API-Collection.postman_collection.json"

if [ ! -f "$COLLECTION_FILE" ]; then
    print_error "Archivo de colección no encontrado: $COLLECTION_FILE"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    print_error "Archivo de entorno no encontrado: $ENV_FILE"
    exit 1
fi

# Crear directorio para reportes si no existe
REPORT_DIR="test-reports"
mkdir -p "$REPORT_DIR"

# Timestamp para el reporte
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
HTML_REPORT="$REPORT_DIR/report_${ENVIRONMENT}_${TIMESTAMP}.html"
JSON_REPORT="$REPORT_DIR/report_${ENVIRONMENT}_${TIMESTAMP}.json"

print_info "Ejecutando pruebas en entorno: $ENVIRONMENT"
print_info "Colección: $COLLECTION_FILE"
print_info "Entorno: $ENV_FILE"
print_info ""

# Ejecutar Newman
newman run "$COLLECTION_FILE" \
    -e "$ENV_FILE" \
    --reporters cli,html,json \
    --reporter-html-export "$HTML_REPORT" \
    --reporter-json-export "$JSON_REPORT" \
    --delay-request 100 \
    --timeout-request 30000 \
    --color on \
    --bail

# Verificar el resultado
if [ $? -eq 0 ]; then
    print_info ""
    print_info "✅ Todas las pruebas pasaron exitosamente"
    print_info "Reporte HTML: $HTML_REPORT"
    print_info "Reporte JSON: $JSON_REPORT"
    
    # Abrir el reporte HTML automáticamente (opcional, comentado por defecto)
    # if command -v xdg-open &> /dev/null; then
    #     xdg-open "$HTML_REPORT"
    # elif command -v open &> /dev/null; then
    #     open "$HTML_REPORT"
    # fi
else
    print_error ""
    print_error "❌ Algunas pruebas fallaron"
    print_info "Revisa los reportes para más detalles"
    print_info "Reporte HTML: $HTML_REPORT"
    print_info "Reporte JSON: $JSON_REPORT"
    exit 1
fi

