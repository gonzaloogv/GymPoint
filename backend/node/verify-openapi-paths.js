const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}   Verificación de OpenAPI: Rutas y Schemas${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

// 1. Extraer todas las rutas del openapi.yaml compilado
console.log(`${colors.blue}[1] Extrayendo rutas de openapi.yaml compilado...${colors.reset}`);
const openapiContent = fs.readFileSync('docs/openapi.yaml', 'utf8');
const openapiDoc = yaml.load(openapiContent);
const openapiPaths = Object.keys(openapiDoc.paths || {});
console.log(`    ✓ Encontradas ${openapiPaths.length} rutas en openapi.yaml\n`);

// 2. Extraer todas las rutas de los archivos en la carpeta paths/
console.log(`${colors.blue}[2] Extrayendo rutas de archivos individuales en paths/...${colors.reset}`);
const pathsDir = path.join(__dirname, 'docs', 'openapi', 'paths');
const pathFiles = fs.readdirSync(pathsDir).filter(f => f.endsWith('.yaml'));

const pathFilesMap = new Map();
pathFiles.forEach(file => {
  const filePath = path.join(pathsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const doc = yaml.load(content);

  const paths = Object.keys(doc.paths || {});
  pathFilesMap.set(file, paths);
  console.log(`    - ${file}: ${paths.length} rutas`);
});

const allPathsFromFiles = Array.from(pathFilesMap.values()).flat();
console.log(`    ✓ Total de rutas en archivos paths/: ${allPathsFromFiles.length}\n`);

// 3. Comparar rutas
console.log(`${colors.blue}[3] Comparando rutas...${colors.reset}`);

const missingInFiles = openapiPaths.filter(p => !allPathsFromFiles.includes(p));
const extraInFiles = allPathsFromFiles.filter(p => !openapiPaths.includes(p));

if (missingInFiles.length === 0 && extraInFiles.length === 0) {
  console.log(`    ${colors.green}✓ ¡Todas las rutas coinciden perfectamente!${colors.reset}\n`);
} else {
  if (missingInFiles.length > 0) {
    console.log(`    ${colors.red}✗ Rutas en openapi.yaml pero NO en archivos paths/ (${missingInFiles.length}):${colors.reset}`);
    missingInFiles.forEach(p => console.log(`      - ${p}`));
    console.log('');
  }

  if (extraInFiles.length > 0) {
    console.log(`    ${colors.yellow}⚠ Rutas en archivos paths/ pero NO en openapi.yaml (${extraInFiles.length}):${colors.reset}`);
    extraInFiles.forEach(p => console.log(`      - ${p}`));
    console.log('');
  }
}

// 4. Verificar schemas referenciados
console.log(`${colors.blue}[4] Verificando schemas referenciados...${colors.reset}`);

// Extraer todos los schemas definidos en components
const definedSchemas = Object.keys(openapiDoc.components?.schemas || {});
console.log(`    ✓ Schemas definidos en components: ${definedSchemas.length}\n`);

// Buscar todas las referencias a schemas en el openapi.yaml
const schemaRefs = new Set();
const content = fs.readFileSync('docs/openapi.yaml', 'utf8');
const refPattern = /#\/components\/schemas\/(\w+)/g;
let match;
while ((match = refPattern.exec(content)) !== null) {
  schemaRefs.add(match[1]);
}

console.log(`    ✓ Schemas referenciados: ${schemaRefs.size}\n`);

// Verificar schemas faltantes
const missingSchemas = Array.from(schemaRefs).filter(s => !definedSchemas.includes(s));
const unusedSchemas = definedSchemas.filter(s => !schemaRefs.has(s));

if (missingSchemas.length === 0 && unusedSchemas.length === 0) {
  console.log(`    ${colors.green}✓ ¡Todos los schemas están correctamente definidos!${colors.reset}\n`);
} else {
  if (missingSchemas.length > 0) {
    console.log(`    ${colors.red}✗ Schemas referenciados pero NO definidos (${missingSchemas.length}):${colors.reset}`);
    missingSchemas.forEach(s => console.log(`      - ${s}`));
    console.log('');
  }

  if (unusedSchemas.length > 0) {
    console.log(`    ${colors.yellow}⚠ Schemas definidos pero NO usados (${unusedSchemas.length}):${colors.reset}`);
    unusedSchemas.forEach(s => console.log(`      - ${s}`));
    console.log('');
  }
}

// 5. Resumen final
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}   Resumen${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);

const pathsOk = missingInFiles.length === 0 && extraInFiles.length === 0;
const schemasOk = missingSchemas.length === 0;

console.log(`Rutas:   ${pathsOk ? colors.green + '✓ OK' : colors.red + '✗ ERRORES'} ${colors.reset}`);
console.log(`Schemas: ${schemasOk ? colors.green + '✓ OK' : colors.red + '✗ ERRORES'} ${colors.reset}`);

if (pathsOk && schemasOk) {
  console.log(`\n${colors.green}✓ ¡La documentación OpenAPI está completa y sincronizada!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Hay problemas que deben resolverse.${colors.reset}\n`);
  process.exit(1);
}
