const migrator = require('./migrator');
const sequelize = require('./config/database');

/**
 * Script para ejecutar migraciones pendientes
 * Se ejecuta automáticamente al iniciar el servidor
 */
async function runMigrations() {
  try {
    console.log('Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente');

    console.log('Verificando migraciones pendientes...');
    const pending = await migrator.pending();
    
    if (pending.length === 0) {
      console.log('No hay migraciones pendientes');
      return { executed: [], pending: [] };
    }

    console.log(`Migraciones pendientes: ${pending.length}`);
    pending.forEach(migration => {
      console.log(`   - ${migration.name}`);
    });

    console.log('Ejecutando migraciones...');
    const executed = await migrator.up();

    console.log('Migraciones completadas exitosamente');
    executed.forEach(migration => {
      console.log(`   ✓ ${migration.name}`);
    });

    return { executed, pending: [] };
  } catch (error) {
    console.error('Error en migraciones:', error.message);
    throw error;
  }
}

/**
 * Función para verificar estado de migraciones sin ejecutarlas
 */
async function checkMigrations() {
  try {
    await sequelize.authenticate();
    const pending = await migrator.pending();
    const executed = await migrator.executed();
    
    return {
      pending: pending.map(m => m.name),
      executed: executed.map(m => m.name),
    };
  } catch (error) {
    console.error('Error al verificar migraciones:', error.message);
    throw error;
  }
}

// Si se ejecuta directamente desde CLI
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Proceso de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fallo en migraciones:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations, checkMigrations, migrator };

