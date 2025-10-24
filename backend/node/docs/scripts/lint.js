const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const OPENAPI_FILE = path.join(__dirname, '..', 'openapi.yaml');

console.log('🔍 Linting OpenAPI bundle...\n');
console.log(`📄 Archivo: ${OPENAPI_FILE}\n`);

try {
  // Leer y parsear YAML
  const content = fs.readFileSync(OPENAPI_FILE, 'utf8');
  const api = yaml.load(content);

  const errors = [];
  const warnings = [];

  // Validación 1: Info requerida
  if (!api.info || !api.info.title || !api.info.version) {
    errors.push('Falta info.title o info.version');
  }

  // Validación 2: Paths debe existir
  if (!api.paths || Object.keys(api.paths).length === 0) {
    errors.push('No hay paths definidos');
  }

  // Validación 3: Cada operación debe tener summary y responses
  let opsWithoutSummary = 0;
  let opsWithoutDescription = 0;
  let opsWithoutTags = 0;
  let opsWithout200or201 = 0;

  for (const [pathUrl, pathObj] of Object.entries(api.paths || {})) {
    for (const [method, operation] of Object.entries(pathObj)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        if (!operation.summary) {
          opsWithoutSummary++;
        }
        if (!operation.description) {
          opsWithoutDescription++;
        }
        if (!operation.tags || operation.tags.length === 0) {
          opsWithoutTags++;
        }
        if (!operation.responses) {
          errors.push(`${method.toUpperCase()} ${pathUrl} no tiene responses`);
        } else {
          const hasSuccess = operation.responses['200'] || operation.responses['201'] || operation.responses['204'];
          if (!hasSuccess) {
            opsWithout200or201++;
          }
        }
      }
    }
  }

  if (opsWithoutSummary > 0) {
    warnings.push(`${opsWithoutSummary} operaciones sin summary`);
  }
  if (opsWithoutDescription > 0) {
    warnings.push(`${opsWithoutDescription} operaciones sin description`);
  }
  if (opsWithoutTags > 0) {
    warnings.push(`${opsWithoutTags} operaciones sin tags`);
  }
  if (opsWithout200or201 > 0) {
    warnings.push(`${opsWithout200or201} operaciones sin respuesta de éxito (200/201/204)`);
  }

  // Validación 4: Schemas deben tener propiedades o $ref
  let schemasWithoutProps = 0;
  for (const [schemaName, schema] of Object.entries(api.components?.schemas || {})) {
    if (schema.type === 'object' && !schema.properties && !schema.allOf && !schema.$ref) {
      schemasWithoutProps++;
    }
  }
  if (schemasWithoutProps > 0) {
    warnings.push(`${schemasWithoutProps} schemas de tipo object sin properties/allOf/$ref`);
  }

  // Validación 5: Naming conventions
  let badOperationIds = 0;
  for (const pathObj of Object.values(api.paths || {})) {
    for (const [method, operation] of Object.entries(pathObj)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        if (operation.operationId && !/^[a-z][a-zA-Z0-9]*$/.test(operation.operationId)) {
          badOperationIds++;
        }
      }
    }
  }
  if (badOperationIds > 0) {
    warnings.push(`${badOperationIds} operationIds no siguen camelCase`);
  }

  // Mostrar resultados
  console.log('📊 Resultados del Linting:\n');

  if (errors.length > 0) {
    console.log(`❌ Errores: ${errors.length}`);
    errors.forEach(err => console.log(`  • ${err}`));
    console.log('');
  } else {
    console.log('✅ Errores: 0');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(warn => console.log(`  • ${warn}`));
    console.log('');
  } else {
    console.log('✅ Warnings: 0');
  }

  // Estadísticas adicionales
  const totalOps = Object.values(api.paths || {}).reduce((sum, pathObj) => {
    return sum + Object.keys(pathObj).filter(k => ['get', 'post', 'put', 'patch', 'delete'].includes(k)).length;
  }, 0);

  console.log('📈 Estadísticas:\n');
  console.log(`  • Total operaciones: ${totalOps}`);
  console.log(`  • Total schemas: ${Object.keys(api.components?.schemas || {}).length}`);
  console.log(`  • Total paths: ${Object.keys(api.paths || {}).length}`);
  console.log(`  • Total parameters: ${Object.keys(api.components?.parameters || {}).length}`);
  console.log(`  • Total responses: ${Object.keys(api.components?.responses || {}).length}\n`);

  // Salir con código apropiado
  if (errors.length > 0) {
    console.log('❌ Linting FALLÓ: Se encontraron errores críticos\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Linting PASÓ con warnings\n');
    process.exit(0);
  } else {
    console.log('✅ Linting PASÓ sin errores ni warnings\n');
    process.exit(0);
  }

} catch (error) {
  console.error('❌ Error ejecutando linting:\n');
  console.error(error.message);
  console.error('\n');
  process.exit(1);
}
