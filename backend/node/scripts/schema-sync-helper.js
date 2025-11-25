#!/usr/bin/env node

/**
 * Schema Sync Helper
 * 
 * Herramienta interactiva para sincronizar schemas entre:
 * - OpenAPI schemas modulares
 * - Backend mappers
 * - Frontend types
 * 
 * Detecta inconsistencias y sugiere correcciones
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// Análisis de Schemas OpenAPI
// ============================================================================

function loadOpenAPISchemas() {
  const schemasDir = path.join(__dirname, '..', 'docs', 'openapi', 'components', 'schemas');
  const schemas = {};
  
  if (!fs.existsSync(schemasDir)) {
    log('❌ Directorio de schemas no encontrado', 'red');
    return schemas;
  }
  
  const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.yaml'));
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(schemasDir, file), 'utf8');
      const parsed = yaml.load(content);
      const schemaName = file.replace('.yaml', '');
      schemas[schemaName] = parsed;
    } catch (error) {
      log(`⚠️  Error al cargar ${file}: ${error.message}`, 'yellow');
    }
  });
  
  return schemas;
}

function extractFieldsFromSchema(schema) {
  const fields = {};
  
  if (schema && typeof schema === 'object') {
    Object.entries(schema).forEach(([schemaName, schemaDef]) => {
      if (schemaDef.properties) {
        fields[schemaName] = Object.keys(schemaDef.properties);
      }
    });
  }
  
  return fields;
}

// ============================================================================
// Análisis de Mappers Backend
// ============================================================================

function analyzeMapper(mapperPath) {
  if (!fs.existsSync(mapperPath)) {
    return null;
  }
  
  const content = fs.readFileSync(mapperPath, 'utf8');
  const fields = new Set();
  
  // Buscar asignaciones de campos: campo: dto.campo o campo: entity.campo
  const fieldRegex = /(\w+):\s*(?:dto|entity|gym|user|reward)\.(\w+)/g;
  let match;
  
  while ((match = fieldRegex.exec(content)) !== null) {
    fields.add(match[2]);
  }
  
  return Array.from(fields);
}

// ============================================================================
// Comparación y Detección de Inconsistencias
// ============================================================================

function compareSchemas(openAPIFields, mapperFields, schemaName) {
  const inconsistencies = [];
  
  if (!openAPIFields || !mapperFields) {
    return inconsistencies;
  }
  
  // Campos en OpenAPI pero no en mapper
  const missingInMapper = openAPIFields.filter(field => !mapperFields.includes(field));
  if (missingInMapper.length > 0) {
    inconsistencies.push({
      type: 'missing_in_mapper',
      fields: missingInMapper,
      message: `Campos en OpenAPI pero no en mapper: ${missingInMapper.join(', ')}`
    });
  }
  
  // Campos en mapper pero no en OpenAPI
  const missingInOpenAPI = mapperFields.filter(field => !openAPIFields.includes(field));
  if (missingInOpenAPI.length > 0) {
    inconsistencies.push({
      type: 'missing_in_openapi',
      fields: missingInOpenAPI,
      message: `Campos en mapper pero no en OpenAPI: ${missingInOpenAPI.join(', ')}`
    });
  }
  
  return inconsistencies;
}

// ============================================================================
// Reporte de Sincronización
// ============================================================================

function generateSyncReport() {
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 REPORTE DE SINCRONIZACIÓN DE SCHEMAS', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
  
  // Cargar schemas OpenAPI
  log('📦 Cargando schemas OpenAPI...', 'blue');
  const openAPISchemas = loadOpenAPISchemas();
  const openAPIFields = extractFieldsFromSchema(openAPISchemas);
  
  log(`   ✓ ${Object.keys(openAPISchemas).length} archivos de schema cargados\n`, 'green');
  
  // Analizar mappers
  log('🗺️  Analizando mappers backend...', 'blue');
  const mappersDir = path.join(__dirname, '..', 'services', 'mappers');
  const mappers = {
    gym: analyzeMapper(path.join(mappersDir, 'gym.mappers.js')),
    reward: analyzeMapper(path.join(mappersDir, 'reward.mappers.js')),
    user: analyzeMapper(path.join(mappersDir, 'user.mappers.js')),
  };
  
  log(`   ✓ ${Object.keys(mappers).filter(k => mappers[k]).length} mappers analizados\n`, 'green');
  
  // Comparar y reportar
  log('🔍 Buscando inconsistencias...\n', 'blue');
  
  let totalInconsistencies = 0;
  
  // Gyms
  if (openAPIFields.gyms && mappers.gym) {
    log('🏋️  GIMNASIOS', 'magenta');
    const gymInconsistencies = compareSchemas(
      openAPIFields.gyms?.GymResponse || [],
      mappers.gym,
      'Gym'
    );
    
    if (gymInconsistencies.length === 0) {
      log('   ✓ Sin inconsistencias', 'green');
    } else {
      gymInconsistencies.forEach(inc => {
        log(`   ⚠️  ${inc.message}`, 'yellow');
        totalInconsistencies++;
      });
    }
    log('');
  }
  
  // Rewards
  if (openAPIFields.rewards && mappers.reward) {
    log('🎁 RECOMPENSAS', 'magenta');
    const rewardInconsistencies = compareSchemas(
      openAPIFields.rewards?.RewardResponse || [],
      mappers.reward,
      'Reward'
    );
    
    if (rewardInconsistencies.length === 0) {
      log('   ✓ Sin inconsistencias', 'green');
    } else {
      rewardInconsistencies.forEach(inc => {
        log(`   ⚠️  ${inc.message}`, 'yellow');
        totalInconsistencies++;
      });
    }
    log('');
  }
  
  // Resumen
  log('='.repeat(70), 'cyan');
  if (totalInconsistencies === 0) {
    log('✅ SINCRONIZACIÓN PERFECTA - No se encontraron inconsistencias', 'green');
  } else {
    log(`⚠️  Se encontraron ${totalInconsistencies} inconsistencias`, 'yellow');
    log('\n💡 Recomendaciones:', 'cyan');
    log('   1. Revisa los campos faltantes en los mappers', 'cyan');
    log('   2. Actualiza los schemas OpenAPI si es necesario', 'cyan');
    log('   3. Ejecuta: npm run openapi:sync', 'cyan');
  }
  log('='.repeat(70) + '\n', 'cyan');
}

// ============================================================================
// Menú Interactivo
// ============================================================================

function showMenu() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🛠️  SCHEMA SYNC HELPER', 'cyan');
  log('='.repeat(70), 'cyan');
  log('\n1. 📊 Generar reporte de sincronización');
  log('2. 🔄 Sincronizar schemas (bundle + generate types)');
  log('3. ✅ Validar OpenAPI');
  log('4. 📚 Ver convenciones de nomenclatura');
  log('5. ❌ Salir\n');
  
  rl.question('Selecciona una opción: ', (answer) => {
    handleMenuChoice(answer.trim());
  });
}

function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      generateSyncReport();
      showMenu();
      break;
      
    case '2':
      log('\n🔄 Sincronizando schemas...', 'blue');
      const { execSync } = require('child_process');
      try {
        execSync('npm run openapi:sync', { stdio: 'inherit' });
        log('\n✅ Sincronización completada', 'green');
      } catch (error) {
        log('\n❌ Error en la sincronización', 'red');
      }
      showMenu();
      break;
      
    case '3':
      log('\n✅ Validando OpenAPI...', 'blue');
      try {
        execSync('npm run openapi:validate', { stdio: 'inherit' });
      } catch (error) {
        log('\n❌ Validación fallida', 'red');
      }
      showMenu();
      break;
      
    case '4':
      log('\n📚 Convenciones de Nomenclatura:', 'cyan');
      log('\n  Backend:');
      log('    • Archivos: kebab-case (gym-service.js)');
      log('    • Variables/Funciones: camelCase (createGym)');
      log('    • Clases: PascalCase (CreateGymCommand)');
      log('    • Constantes: UPPER_SNAKE_CASE (MAX_RETRIES)');
      log('\n  Base de Datos:');
      log('    • Tablas: snake_case (user_profile)');
      log('    • Columnas: snake_case (id_gym, created_at)');
      log('\n  API (OpenAPI):');
      log('    • Campos: snake_case (token_cost, is_active)');
      log('    • Endpoints: kebab-case (/api/special-schedules)');
      log('\n  Frontend:');
      log('    • Componentes: PascalCase (GymCard.tsx)');
      log('    • Hooks: camelCase (useGyms.ts)');
      log('    • Types: PascalCase (Gym, CreateGymDTO)');
      log('\n  Ver más: backend/node/docs/CONVENTIONS.md\n');
      showMenu();
      break;
      
    case '5':
      log('\n👋 ¡Hasta luego!', 'green');
      rl.close();
      process.exit(0);
      break;
      
    default:
      log('\n❌ Opción inválida', 'red');
      showMenu();
  }
}

// ============================================================================
// Main
// ============================================================================

if (require.main === module) {
  // Si se ejecuta directamente, mostrar menú
  if (process.argv.includes('--report')) {
    generateSyncReport();
    process.exit(0);
  } else {
    showMenu();
  }
}

module.exports = {
  loadOpenAPISchemas,
  extractFieldsFromSchema,
  analyzeMapper,
  compareSchemas,
  generateSyncReport
};

