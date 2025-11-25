const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const ORIGINAL_FILE = path.join(__dirname, '..', 'openapi.original.yaml');
const BUNDLE_FILE = path.join(__dirname, '..', 'openapi.yaml');

console.log('🔍 Comparando bundle con original...\n');

try {
  // Leer archivos
  const original = yaml.load(fs.readFileSync(ORIGINAL_FILE, 'utf8'));
  const bundle = yaml.load(fs.readFileSync(BUNDLE_FILE, 'utf8'));

  const diffs = [];
  const warnings = [];

  // Comparar info
  if (original.info.title !== bundle.info.title) {
    diffs.push(`Título diferente: "${original.info.title}" vs "${bundle.info.title}"`);
  }
  if (original.info.version !== bundle.info.version) {
    diffs.push(`Versión diferente: "${original.info.version}" vs "${bundle.info.version}"`);
  }

  // Comparar schemas
  const originalSchemas = Object.keys(original.components?.schemas || {});
  const bundleSchemas = Object.keys(bundle.components?.schemas || {});

  const missingSchemas = originalSchemas.filter(s => !bundleSchemas.includes(s));
  const extraSchemas = bundleSchemas.filter(s => !originalSchemas.includes(s));

  if (missingSchemas.length > 0) {
    diffs.push(`Faltan ${missingSchemas.length} schemas: ${missingSchemas.join(', ')}`);
  }
  if (extraSchemas.length > 0) {
    warnings.push(`Schemas extra: ${extraSchemas.join(', ')}`);
  }

  // Comparar parameters
  const originalParams = Object.keys(original.components?.parameters || {});
  const bundleParams = Object.keys(bundle.components?.parameters || {});

  const missingParams = originalParams.filter(p => !bundleParams.includes(p));
  const extraParams = bundleParams.filter(p => !originalParams.includes(p));

  if (missingParams.length > 0) {
    diffs.push(`Faltan ${missingParams.length} parameters: ${missingParams.join(', ')}`);
  }
  if (extraParams.length > 0) {
    warnings.push(`Parameters extra: ${extraParams.join(', ')}`);
  }

  // Comparar responses
  const originalResponses = Object.keys(original.components?.responses || {});
  const bundleResponses = Object.keys(bundle.components?.responses || {});

  const missingResponses = originalResponses.filter(r => !bundleResponses.includes(r));
  const extraResponses = bundleResponses.filter(r => !originalResponses.includes(r));

  if (missingResponses.length > 0) {
    diffs.push(`Faltan ${missingResponses.length} responses: ${missingResponses.join(', ')}`);
  }
  if (extraResponses.length > 0) {
    warnings.push(`Responses extra: ${extraResponses.join(', ')}`);
  }

  // Comparar paths
  const originalPaths = Object.keys(original.paths || {});
  const bundlePaths = Object.keys(bundle.paths || {});

  const missingPaths = originalPaths.filter(p => !bundlePaths.includes(p));
  const extraPaths = bundlePaths.filter(p => !originalPaths.includes(p));

  if (missingPaths.length > 0) {
    diffs.push(`Faltan ${missingPaths.length} paths: ${missingPaths.join(', ')}`);
  }
  if (extraPaths.length > 0) {
    warnings.push(`Paths extra: ${extraPaths.join(', ')}`);
  }

  // Comparar operaciones por path
  let missingOps = 0;
  let extraOps = 0;

  for (const pathUrl of originalPaths) {
    if (bundlePaths.includes(pathUrl)) {
      const origPath = original.paths[pathUrl];
      const bundlePath = bundle.paths[pathUrl];

      for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        if (origPath[method] && !bundlePath[method]) {
          missingOps++;
        }
        if (!origPath[method] && bundlePath[method]) {
          extraOps++;
        }
      }
    }
  }

  if (missingOps > 0) {
    diffs.push(`Faltan ${missingOps} operaciones HTTP`);
  }
  if (extraOps > 0) {
    warnings.push(`${extraOps} operaciones HTTP extra`);
  }

  // Mostrar resultados
  console.log('📊 Resultados de la Comparación:\n');

  console.log('📈 Métricas:\n');
  console.log(`  Original:`);
  console.log(`    • Schemas:     ${originalSchemas.length}`);
  console.log(`    • Parameters:  ${originalParams.length}`);
  console.log(`    • Responses:   ${originalResponses.length}`);
  console.log(`    • Paths:       ${originalPaths.length}`);

  console.log(`\n  Bundle:`);
  console.log(`    • Schemas:     ${bundleSchemas.length}`);
  console.log(`    • Parameters:  ${bundleParams.length}`);
  console.log(`    • Responses:   ${bundleResponses.length}`);
  console.log(`    • Paths:       ${bundlePaths.length}\n`);

  if (diffs.length > 0) {
    console.log(`❌ Diferencias Críticas: ${diffs.length}\n`);
    diffs.forEach(diff => console.log(`  • ${diff}`));
    console.log('');
  } else {
    console.log('✅ Sin diferencias críticas\n');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Advertencias: ${warnings.length}\n`);
    warnings.forEach(warn => console.log(`  • ${warn}`));
    console.log('');
  }

  // Conclusión
  if (diffs.length === 0) {
    console.log('✅ EQUIVALENCIA FUNCIONAL: 100%\n');
    console.log('El bundle es funcionalmente equivalente al original.\n');
    process.exit(0);
  } else {
    console.log('❌ EQUIVALENCIA FUNCIONAL: NO COMPLETA\n');
    console.log('El bundle tiene diferencias con el original.\n');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error comparando archivos:\n');
  console.error(error.message);
  console.error('\n');
  process.exit(1);
}
