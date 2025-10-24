const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Script para generar bundle único del OpenAPI modular
 *
 * Lee todos los módulos de openapi/ y genera un único archivo openapi.yaml
 * funcionalmente equivalente al original.
 */

const OPENAPI_DIR = path.join(__dirname, '..', 'openapi');
const OUTPUT_FILE = path.join(__dirname, '..', 'openapi.yaml');
const BACKUP_FILE = path.join(__dirname, '..', 'openapi.yaml.bundle-backup');

// Directorios de módulos
const COMPONENTS_DIR = path.join(OPENAPI_DIR, 'components');
const SCHEMAS_DIR = path.join(COMPONENTS_DIR, 'schemas');
const PATHS_DIR = path.join(OPENAPI_DIR, 'paths');

console.log('🔄 Iniciando bundling de OpenAPI...\n');

// Función para leer archivo YAML
function readYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`❌ Error leyendo ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Función para escribir YAML
function writeYaml(filePath, data) {
  try {
    const yamlStr = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    fs.writeFileSync(filePath, yamlStr, 'utf8');
  } catch (error) {
    console.error(`❌ Error escribiendo ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Crear backup si existe archivo previo
if (fs.existsSync(OUTPUT_FILE)) {
  console.log('📦 Creando backup del bundle anterior...');
  fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
}

// Inicializar bundle
const bundle = {
  openapi: '3.1.0',
  info: {
    title: 'GymPoint API',
    version: '1.0.0',
    description: 'API del sistema GymPoint para gestión de gimnasios, rutinas, entrenamientos y gamificación.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo local'
    }
  ],
  components: {
    securitySchemes: {},
    responses: {},
    parameters: {},
    schemas: {}
  },
  paths: {},
  security: [{ bearerAuth: [] }]
};

console.log('📥 Cargando componentes compartidos...\n');

// 1. Cargar securitySchemes
const securityFile = path.join(COMPONENTS_DIR, 'securitySchemes.yaml');
if (fs.existsSync(securityFile)) {
  const securityData = readYaml(securityFile);
  bundle.components.securitySchemes = securityData.components.securitySchemes;
  console.log('  ✓ securitySchemes.yaml');
}

// 2. Cargar responses
const responsesFile = path.join(COMPONENTS_DIR, 'responses.yaml');
if (fs.existsSync(responsesFile)) {
  const responsesData = readYaml(responsesFile);
  bundle.components.responses = responsesData.components.responses;
  console.log('  ✓ responses.yaml');
}

// 3. Cargar parameters
const parametersFile = path.join(COMPONENTS_DIR, 'parameters.yaml');
if (fs.existsSync(parametersFile)) {
  const parametersData = readYaml(parametersFile);
  bundle.components.parameters = parametersData.components.parameters;
  console.log('  ✓ parameters.yaml');
}

// 4. Cargar common schemas (enums, PaginationMeta)
const commonFile = path.join(COMPONENTS_DIR, 'common.yaml');
if (fs.existsSync(commonFile)) {
  const commonData = readYaml(commonFile);
  Object.assign(bundle.components.schemas, commonData.components.schemas);
  console.log('  ✓ common.yaml');
}

console.log('\n📥 Cargando schemas por dominio...\n');

// 5. Cargar schemas de dominios
if (fs.existsSync(SCHEMAS_DIR)) {
  const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.yaml'));
  schemaFiles.forEach(file => {
    const filePath = path.join(SCHEMAS_DIR, file);
    const schemaData = readYaml(filePath);
    Object.assign(bundle.components.schemas, schemaData.components.schemas);
    console.log(`  ✓ schemas/${file}`);
  });
}

console.log('\n📥 Cargando paths por dominio...\n');

// 6. Cargar paths de dominios
if (fs.existsSync(PATHS_DIR)) {
  const pathFiles = fs.readdirSync(PATHS_DIR).filter(f => f.endsWith('.yaml'));
  pathFiles.forEach(file => {
    const filePath = path.join(PATHS_DIR, file);
    const pathData = readYaml(filePath);
    Object.assign(bundle.paths, pathData.paths);
    console.log(`  ✓ paths/${file}`);
  });
}

console.log('\n🔧 Resolviendo referencias relativas...\n');

// Función recursiva para resolver referencias
function resolveRefs(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(resolveRefs);
  }

  const resolved = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      // Convertir referencias relativas a referencias internas
      let ref = value;

      // Referencias a common.yaml
      ref = ref.replace(/\.\.\/common\.yaml#\/components\/schemas\//g, '#/components/schemas/');
      ref = ref.replace(/\.\.\/components\/common\.yaml#\/components\/schemas\//g, '#/components/schemas/');

      // Referencias a schemas de dominios
      ref = ref.replace(/\.\.\/components\/schemas\/[^#]+\.yaml#\/components\/schemas\//g, '#/components/schemas/');
      ref = ref.replace(/\.\.\/schemas\/[^#]+\.yaml#\/components\/schemas\//g, '#/components/schemas/');
      ref = ref.replace(/[^\/]+\.yaml#\/components\/schemas\//g, '#/components/schemas/');

      // Referencias a parameters
      ref = ref.replace(/\.\.\/components\/parameters\.yaml#\/components\/parameters\//g, '#/components/parameters/');
      ref = ref.replace(/\.\.\/parameters\.yaml#\/components\/parameters\//g, '#/components/parameters/');

      // Referencias a responses
      ref = ref.replace(/\.\.\/components\/responses\.yaml#\/components\/responses\//g, '#/components/responses/');
      ref = ref.replace(/\.\.\/responses\.yaml#\/components\/responses\//g, '#/components/responses/');

      resolved[key] = ref;
    } else {
      resolved[key] = resolveRefs(value);
    }
  }
  return resolved;
}

bundle.paths = resolveRefs(bundle.paths);
bundle.components.schemas = resolveRefs(bundle.components.schemas);

console.log('  ✓ Referencias resueltas\n');

// 7. Escribir bundle
console.log('💾 Generando bundle único...\n');
writeYaml(OUTPUT_FILE, bundle);

// 8. Estadísticas
const stats = {
  schemas: Object.keys(bundle.components.schemas).length,
  parameters: Object.keys(bundle.components.parameters).length,
  responses: Object.keys(bundle.components.responses).length,
  paths: Object.keys(bundle.paths).length,
  operations: 0
};

// Contar operaciones
for (const pathObj of Object.values(bundle.paths)) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    if (pathObj[method]) stats.operations++;
  }
}

console.log('✅ Bundle generado exitosamente!\n');
console.log('📊 Estadísticas del bundle:\n');
console.log(`  • Schemas:     ${stats.schemas}`);
console.log(`  • Parameters:  ${stats.parameters}`);
console.log(`  • Responses:   ${stats.responses}`);
console.log(`  • Paths:       ${stats.paths}`);
console.log(`  • Operations:  ${stats.operations}`);
console.log(`\n📄 Archivo generado: ${OUTPUT_FILE}`);
console.log(`📦 Backup anterior:  ${BACKUP_FILE}`);
console.log('\n🎉 ¡Proceso completado!\n');
