#!/usr/bin/env node

/**
 * Script de validación de sincronización OpenAPI
 * 
 * Verifica que:
 * 1. El bundle de OpenAPI esté actualizado
 * 2. Los tipos generados estén sincronizados
 * 3. No haya inconsistencias entre schemas modulares y bundle
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

console.log('🔍 Validando sincronización de OpenAPI...\n');

// Rutas
const OPENAPI_YAML = path.join(__dirname, '..', 'docs', 'openapi.yaml');
const OPENAPI_BACKUP = path.join(__dirname, '..', 'docs', 'openapi.yaml.bundle-backup');
const SCHEMAS_DIR = path.join(__dirname, '..', 'docs', 'openapi', 'components', 'schemas');
const GENERATED_TYPES = path.join(__dirname, '..', '..', '..', 'frontend', 'gympoint-admin', 'src', 'data', 'dto', 'generated', 'api.types.ts');

let hasErrors = false;

// ============================================================================
// 1. Verificar que el bundle existe
// ============================================================================
console.log('📦 Verificando bundle...');
if (!fs.existsSync(OPENAPI_YAML)) {
  console.error('  ❌ openapi.yaml no existe. Ejecuta: npm run openapi:bundle');
  hasErrors = true;
} else {
  console.log('  ✓ openapi.yaml existe');
}

// ============================================================================
// 2. Verificar que los schemas modulares existen
// ============================================================================
console.log('\n📁 Verificando schemas modulares...');
if (!fs.existsSync(SCHEMAS_DIR)) {
  console.error('  ❌ Directorio de schemas no existe');
  hasErrors = true;
} else {
  const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.yaml'));
  console.log(`  ✓ ${schemaFiles.length} archivos de schema encontrados`);
  
  // Verificar que cada schema es válido YAML
  let invalidSchemas = 0;
  schemaFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(SCHEMAS_DIR, file), 'utf8');
      yaml.load(content);
    } catch (error) {
      console.error(`  ❌ ${file}: YAML inválido - ${error.message}`);
      invalidSchemas++;
      hasErrors = true;
    }
  });
  
  if (invalidSchemas === 0) {
    console.log('  ✓ Todos los schemas son YAML válido');
  }
}

// ============================================================================
// 3. Verificar que el bundle está actualizado
// ============================================================================
console.log('\n🔄 Verificando si el bundle está actualizado...');
const bundleStats = fs.statSync(OPENAPI_YAML);
const schemasStats = fs.readdirSync(SCHEMAS_DIR)
  .filter(f => f.endsWith('.yaml'))
  .map(f => fs.statSync(path.join(SCHEMAS_DIR, f)))
  .sort((a, b) => b.mtime - a.mtime)[0];

if (schemasStats && schemasStats.mtime > bundleStats.mtime) {
  console.warn('  ⚠️  Los schemas modulares son más recientes que el bundle');
  console.warn('  💡 Ejecuta: npm run openapi:bundle');
  hasErrors = true;
} else {
  console.log('  ✓ Bundle está actualizado');
}

// ============================================================================
// 4. Verificar tipos generados
// ============================================================================
console.log('\n📝 Verificando tipos TypeScript generados...');
if (!fs.existsSync(GENERATED_TYPES)) {
  console.warn('  ⚠️  Tipos TypeScript no generados');
  console.warn('  💡 Ejecuta: npm run openapi:generate-types');
} else {
  const typesStats = fs.statSync(GENERATED_TYPES);
  if (bundleStats.mtime > typesStats.mtime) {
    console.warn('  ⚠️  El bundle es más reciente que los tipos generados');
    console.warn('  💡 Ejecuta: npm run openapi:generate-types');
  } else {
    console.log('  ✓ Tipos TypeScript están actualizados');
  }
}

// ============================================================================
// 5. Validar el schema con Redocly
// ============================================================================
console.log('\n✅ Validando schema OpenAPI con Redocly...');
try {
  execSync('npm run openapi:lint', { stdio: 'inherit' });
  console.log('  ✓ Schema OpenAPI es válido');
} catch (error) {
  console.error('  ❌ Schema OpenAPI tiene errores');
  hasErrors = true;
}

// ============================================================================
// Resumen
// ============================================================================
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ Validación FALLIDA - Se encontraron errores');
  console.log('\n💡 Comandos útiles:');
  console.log('  • npm run openapi:bundle          - Regenerar bundle');
  console.log('  • npm run openapi:generate-types  - Regenerar tipos TS');
  console.log('  • npm run openapi:sync            - Hacer ambos');
  process.exit(1);
} else {
  console.log('✅ Validación EXITOSA - Todo está sincronizado');
  console.log('\n📊 Estado:');
  console.log('  • Bundle OpenAPI: ✓');
  console.log('  • Schemas modulares: ✓');
  console.log('  • Tipos TypeScript: ✓');
  console.log('  • Validación Redocly: ✓');
}
console.log('='.repeat(60) + '\n');

