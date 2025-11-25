@echo off
REM Script para ejecutar las pruebas de Postman con Newman en Windows
REM Uso: run-tests.bat [environment]
REM Ejemplo: run-tests.bat local (por defecto)
REM          run-tests.bat production

setlocal enabledelayedexpansion

REM Determinar el entorno
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=local

if "%ENVIRONMENT%"=="local" (
    set ENV_FILE=GymPoint-Local.postman_environment.json
) else if "%ENVIRONMENT%"=="production" (
    set ENV_FILE=GymPoint-Production.postman_environment.json
) else (
    echo [ERROR] Entorno no valido: %ENVIRONMENT%
    echo [INFO] Usa 'local' o 'production'
    exit /b 1
)

REM Verificar que Newman este instalado
where newman >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Newman no esta instalado
    echo [INFO] Instalalo con: npm install -g newman
    echo [INFO] O localmente: npm install --save-dev newman
    exit /b 1
)

REM Verificar que los archivos existan
set COLLECTION_FILE=GymPoint-API-Collection.postman_collection.json

if not exist "%COLLECTION_FILE%" (
    echo [ERROR] Archivo de coleccion no encontrado: %COLLECTION_FILE%
    exit /b 1
)

if not exist "%ENV_FILE%" (
    echo [ERROR] Archivo de entorno no encontrado: %ENV_FILE%
    exit /b 1
)

REM Crear directorio para reportes si no existe
set REPORT_DIR=test-reports
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

REM Timestamp para el reporte
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

set HTML_REPORT=%REPORT_DIR%\report_%ENVIRONMENT%_%TIMESTAMP%.html
set JSON_REPORT=%REPORT_DIR%\report_%ENVIRONMENT%_%TIMESTAMP%.json

echo [INFO] Ejecutando pruebas en entorno: %ENVIRONMENT%
echo [INFO] Coleccion: %COLLECTION_FILE%
echo [INFO] Entorno: %ENV_FILE%
echo.

REM Ejecutar Newman
newman run "%COLLECTION_FILE%" ^
    -e "%ENV_FILE%" ^
    --reporters cli,html,json ^
    --reporter-html-export "%HTML_REPORT%" ^
    --reporter-json-export "%JSON_REPORT%" ^
    --delay-request 100 ^
    --timeout-request 30000 ^
    --color on ^
    --bail

if %errorlevel% equ 0 (
    echo.
    echo [INFO] ✓ Todas las pruebas pasaron exitosamente
    echo [INFO] Reporte HTML: %HTML_REPORT%
    echo [INFO] Reporte JSON: %JSON_REPORT%
    
    REM Abrir el reporte HTML automaticamente (opcional)
    REM start "" "%HTML_REPORT%"
) else (
    echo.
    echo [ERROR] ✗ Algunas pruebas fallaron
    echo [INFO] Revisa los reportes para mas detalles
    echo [INFO] Reporte HTML: %HTML_REPORT%
    echo [INFO] Reporte JSON: %JSON_REPORT%
    exit /b 1
)

endlocal

