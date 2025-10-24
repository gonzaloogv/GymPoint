const SwaggerParser = require('@apidevtools/swagger-parser');
const path = require('path');

const OPENAPI_FILE = path.join(__dirname, '..', 'openapi.yaml');

console.log('🔍 Validando OpenAPI bundle...\n');
console.log(`📄 Archivo: ${OPENAPI_FILE}\n`);

SwaggerParser.validate(OPENAPI_FILE)
  .then(api => {
    console.log('✅ Validación exitosa!\n');
    console.log('📊 Resumen del API:\n');
    console.log(`  • Título:      ${api.info.title}`);
    console.log(`  • Versión:     ${api.info.version}`);
    console.log(`  • OpenAPI:     ${api.openapi}`);
    console.log(`  • Paths:       ${Object.keys(api.paths).length}`);
    console.log(`  • Schemas:     ${Object.keys(api.components?.schemas || {}).length}`);
    console.log(`  • Parameters:  ${Object.keys(api.components?.parameters || {}).length}`);
    console.log(`  • Responses:   ${Object.keys(api.components?.responses || {}).length}`);

    let totalOps = 0;
    for (const path of Object.values(api.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        if (path[method]) totalOps++;
      }
    }
    console.log(`  • Operations:  ${totalOps}\n`);

    console.log('🎉 El bundle es válido y está listo para usar!\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de validación:\n');
    console.error(err.message);
    console.error('\n');
    process.exit(1);
  });
