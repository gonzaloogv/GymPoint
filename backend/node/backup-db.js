const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Script para crear backup de la base de datos
 * Compatible con Docker y instalación local de MySQL
 */

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'mitre280';
const DB_NAME = process.env.DB_NAME || 'gympoint';
const DB_PORT = process.env.DB_PORT || '3308';
const DOCKER_CONTAINER = process.env.DB_CONTAINER || 'gympoint-db';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const backupFile = path.join(__dirname, 'backups', `gympoint-backup-${timestamp}.sql`);

// Crear directorio de backups si no existe
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('🔄 Creando backup de la base de datos...');
console.log(`📁 Archivo: ${backupFile}`);

/**
 * Detectar si estamos usando Docker
 */
function isDockerRunning(callback) {
  exec('docker ps', (error) => {
    callback(!error);
  });
}

/**
 * Backup usando Docker
 */
function backupWithDocker() {
  console.log(`🐳 Usando Docker (contenedor: ${DOCKER_CONTAINER})`);

  const command = `docker exec ${DOCKER_CONTAINER} mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al crear backup:', error.message);
      console.log('\n💡 Asegúrate de que:');
      console.log('   1. Docker está corriendo: docker ps');
      console.log(`   2. El contenedor existe: docker ps -a | findstr ${DOCKER_CONTAINER}`);
      console.log('   3. Las credenciales son correctas en .env');
      process.exit(1);
    }

    if (stderr && !stderr.includes('Warning') && !stderr.includes('Using a password')) {
      console.error('⚠️  Advertencias:', stderr);
    }

    // Verificar que el archivo se creó
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      console.log(`Backup creado exitosamente (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`Ubicación: ${backupFile}`);
      console.log('\n Para restaurar este backup, ejecuta:');
      console.log(`   docker exec -i ${DOCKER_CONTAINER} mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${backupFile}"`);
    } else {
      console.error('El archivo de backup no se creó');
      process.exit(1);
    }
  });
}

/**
 * Backup usando mysqldump local
 */
function backupWithLocal() {
  console.log('💻 Usando mysqldump local');

  const command = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al crear backup:', error.message);
      console.log('\n💡 mysqldump no está disponible. Opciones:');
      console.log('   1. Instalar MySQL client');
      console.log('   2. Usar Docker (ejecutar docker-compose up -d)');
      process.exit(1);
    }

    if (stderr && !stderr.includes('Warning') && !stderr.includes('Using a password')) {
      console.error('⚠️  Advertencias:', stderr);
    }

    const stats = fs.statSync(backupFile);
    console.log(`Backup creado exitosamente (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log(`📍 Ubicación: ${backupFile}`);
    console.log('\n💡 Para restaurar este backup, ejecuta:');
    console.log(`   mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${backupFile}"`);
  });
}

// Detectar entorno y ejecutar backup apropiado
isDockerRunning((dockerAvailable) => {
  if (dockerAvailable) {
    // Verificar si el contenedor existe
    exec(`docker ps -a --format "{{.Names}}" | findstr /C:"${DOCKER_CONTAINER}"`, (error) => {
      if (error) {
        console.log(`⚠️  Contenedor ${DOCKER_CONTAINER} no encontrado`);
        console.log('💡 Intentando con mysqldump local...\n');
        backupWithLocal();
      } else {
        backupWithDocker();
      }
    });
  } else {
    backupWithLocal();
  }
});
