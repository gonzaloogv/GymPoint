const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'openapi.yaml');
const content = fs.readFileSync(openapiPath, 'utf8');
const lines = content.split('\n');

// Crear estructura de carpetas
const baseDir = path.join(__dirname, 'openapi');
const componentsDir = path.join(baseDir, 'components');
const schemasDir = path.join(componentsDir, 'schemas');
const pathsDir = path.join(baseDir, 'paths');

[baseDir, componentsDir, schemasDir, pathsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper para obtener nivel de indentación
function getIndent(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

// Extraer una sección completa dado el inicio y nivel base
function extractBlock(startIdx, baseLevel) {
  const block = [lines[startIdx]];

  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndent(line);

    if (line.trim() === '') {
      block.push(line);
      continue;
    }

    if (indent <= baseLevel) {
      break;
    }

    block.push(line);
  }

  return block;
}

// ====================================
// FASE A: COMPONENTES COMPARTIDOS
// ====================================

console.log('\n=== FASE A: COMPONENTES COMPARTIDOS ===\n');

// 1. Extraer securitySchemes
let idx = lines.findIndex(l => l === '  securitySchemes:');
if (idx >= 0) {
  const block = extractBlock(idx, 2);
  const yamlContent = `components:\n${block.join('\n')}`;
  fs.writeFileSync(path.join(componentsDir, 'securitySchemes.yaml'), yamlContent);
  console.log('✓ Created: openapi/components/securitySchemes.yaml');
}

// 2. Extraer responses
idx = lines.findIndex(l => l === '  responses:');
if (idx >= 0) {
  const block = extractBlock(idx, 2);
  const yamlContent = `components:\n${block.join('\n')}`;
  fs.writeFileSync(path.join(componentsDir, 'responses.yaml'), yamlContent);
  console.log('✓ Created: openapi/components/responses.yaml');
}

// 3. Extraer parameters
idx = lines.findIndex(l => l === '  parameters:');
if (idx >= 0) {
  const block = extractBlock(idx, 2);
  const yamlContent = `components:\n${block.join('\n')}`;
  fs.writeFileSync(path.join(componentsDir, 'parameters.yaml'), yamlContent);
  console.log('✓ Created: openapi/components/parameters.yaml');
}

// 4. Extraer schemas y crear common.yaml
const schemasStartIdx = lines.findIndex(l => l === '  schemas:');

// Lista de schemas comunes
const enumSchemas = [
  'SubscriptionType',
  'Gender',
  'DifficultyLevel',
  'ExtendedDifficultyLevel',
  'WorkoutSessionStatus',
  'UserRoutineStatus',
  'AchievementCategory',
  'MuscleGroup',
  'ChallengeType',
  'ChallengeProgressStatus',
  'MediaType',
  'EntityType',
  'RewardCategory',
  'PaymentStatus',
  'AccountDeletionStatus',
  'AchievementMetric',
  'ChallengeMetric'
];

const commonSchemas = ['PaginationMeta', ...enumSchemas];

// Extraer todos los schemas
const allSchemas = {};
let currentSchemaName = null;
let currentSchemaLines = [];

for (let i = schemasStartIdx + 1; i < lines.length; i++) {
  const line = lines[i];
  const indent = getIndent(line);

  // Detectar inicio de nuevo schema
  if (indent === 4 && line.match(/^    \w+:$/)) {
    // Guardar schema anterior
    if (currentSchemaName) {
      allSchemas[currentSchemaName] = currentSchemaLines;
    }

    // Iniciar nuevo schema
    currentSchemaName = line.trim().replace(':', '');
    currentSchemaLines = [line];
  } else if (currentSchemaName) {
    if (indent > 4 || line.trim() === '' || line.trim().startsWith('#')) {
      currentSchemaLines.push(line);
    } else if (indent <= 2) {
      // Fin de sección schemas
      allSchemas[currentSchemaName] = currentSchemaLines;
      break;
    }
  }
}

// Guardar último schema
if (currentSchemaName && !allSchemas[currentSchemaName]) {
  allSchemas[currentSchemaName] = currentSchemaLines;
}

console.log(`\nTotal schemas extracted: ${Object.keys(allSchemas).length}`);

// Crear common.yaml
const commonLines = ['components:', '  schemas:'];
commonSchemas.forEach(schemaName => {
  if (allSchemas[schemaName]) {
    commonLines.push(...allSchemas[schemaName]);
  }
});
fs.writeFileSync(path.join(componentsDir, 'common.yaml'), commonLines.join('\n'));
console.log(`✓ Created: openapi/components/common.yaml (${commonSchemas.length} schemas)`);

// ====================================
// FASE B: SCHEMAS POR DOMINIO
// ====================================

console.log('\n=== FASE B: SCHEMAS POR DOMINIO ===\n');

const domainMappings = {
  auth: ['Auth', 'Register', 'Login', 'Token', 'Refresh'],
  users: ['User', 'Profile'],
  gyms: ['Gym'],
  exercises: ['Exercise'],
  routines: ['Routine']
};

const domainSchemas = {
  auth: [],
  users: [],
  gyms: [],
  exercises: [],
  routines: []
};

// Clasificar schemas
Object.keys(allSchemas).forEach(schemaName => {
  // Saltar schemas comunes
  if (commonSchemas.includes(schemaName)) return;

  let assigned = false;

  // Intentar asignar a un dominio
  for (const [domain, keywords] of Object.entries(domainMappings)) {
    if (keywords.some(kw => schemaName.includes(kw))) {
      domainSchemas[domain].push(schemaName);
      assigned = true;
      break;
    }
  }

  if (!assigned) {
    // console.log(`  (skipped: ${schemaName})`);
  }
});

// Crear archivos de schemas por dominio
Object.keys(domainSchemas).forEach(domain => {
  const schemas = domainSchemas[domain];

  if (schemas.length > 0) {
    const domainLines = ['components:', '  schemas:'];

    schemas.forEach(schemaName => {
      const schemaLines = allSchemas[schemaName];

      // Actualizar referencias a enums y PaginationMeta
      const updatedLines = schemaLines.map(line => {
        let updated = line;

        // Referencias a enums
        enumSchemas.forEach(enumName => {
          const oldRef = `$ref: '#/components/schemas/${enumName}'`;
          const newRef = `$ref: '../common.yaml#/components/schemas/${enumName}'`;
          updated = updated.replace(oldRef, newRef);
        });

        // Referencias a PaginationMeta
        updated = updated.replace(
          `$ref: '#/components/schemas/PaginationMeta'`,
          `$ref: '../common.yaml#/components/schemas/PaginationMeta'`
        );

        return updated;
      });

      domainLines.push(...updatedLines);
    });

    fs.writeFileSync(
      path.join(schemasDir, `${domain}.yaml`),
      domainLines.join('\n')
    );
    console.log(`✓ Created: openapi/components/schemas/${domain}.yaml (${schemas.length} schemas)`);
  }
});

// ====================================
// FASE C: PATHS POR DOMINIO
// ====================================

console.log('\n=== FASE C: PATHS POR DOMINIO ===\n');

const pathsStartIdx = lines.findIndex(l => l === 'paths:');

// Extraer todos los paths
const allPaths = {};
let currentPath = null;
let currentPathLines = [];

for (let i = pathsStartIdx + 1; i < lines.length; i++) {
  const line = lines[i];
  const indent = getIndent(line);

  // Detectar nuevo path
  if (indent === 2 && line.match(/^  \/api\/\w+/)) {
    // Guardar path anterior
    if (currentPath) {
      allPaths[currentPath] = currentPathLines;
    }

    // Iniciar nuevo path
    currentPath = line.trim().replace(':', '');
    currentPathLines = [line];
  } else if (currentPath) {
    if (indent > 2 || line.trim() === '' || line.trim().startsWith('#')) {
      currentPathLines.push(line);
    } else if (line === 'components:') {
      // Fin de sección paths
      allPaths[currentPath] = currentPathLines;
      break;
    }
  }
}

console.log(`\nTotal paths extracted: ${Object.keys(allPaths).length}`);

// Clasificar paths por dominio
const domainPaths = {
  auth: [],
  users: [],
  gyms: [],
  exercises: [],
  routines: []
};

Object.keys(allPaths).forEach(pathUrl => {
  if (pathUrl.startsWith('/api/auth/')) {
    domainPaths.auth.push(pathUrl);
  } else if (pathUrl.startsWith('/api/users/')) {
    domainPaths.users.push(pathUrl);
  } else if (pathUrl.startsWith('/api/gyms/')) {
    domainPaths.gyms.push(pathUrl);
  } else if (pathUrl.startsWith('/api/exercises/')) {
    domainPaths.exercises.push(pathUrl);
  } else if (pathUrl.startsWith('/api/routines/')) {
    domainPaths.routines.push(pathUrl);
  }
});

// Crear archivos de paths por dominio
Object.keys(domainPaths).forEach(domain => {
  const paths = domainPaths[domain];

  if (paths.length > 0) {
    const domainLines = ['paths:'];

    paths.forEach(pathUrl => {
      const pathLines = allPaths[pathUrl];

      // Actualizar referencias
      const updatedLines = pathLines.map(line => {
        let updated = line;

        // Referencias a schemas del mismo dominio
        domainSchemas[domain].forEach(schemaName => {
          const oldRef = `$ref: '#/components/schemas/${schemaName}'`;
          const newRef = `$ref: '../components/schemas/${domain}.yaml#/components/schemas/${schemaName}'`;
          updated = updated.replace(oldRef, newRef);
        });

        // Referencias a parameters
        updated = updated.replace(
          /\$ref: '#\/components\/parameters\/(\w+)'/g,
          `$ref: '../components/parameters.yaml#/components/parameters/$1'`
        );

        // Referencias a responses
        updated = updated.replace(
          /\$ref: '#\/components\/responses\/(\w+)'/g,
          `$ref: '../components/responses.yaml#/components/responses/$1'`
        );

        // Referencias a schemas de otros dominios (tendrán que ajustarse manualmente)
        // Por ahora, solo las del mismo dominio

        return updated;
      });

      domainLines.push(...updatedLines);
    });

    fs.writeFileSync(
      path.join(pathsDir, `${domain}.yaml`),
      domainLines.join('\n')
    );
    console.log(`✓ Created: openapi/paths/${domain}.yaml (${paths.length} paths)`);
  }
});

console.log('\n=== MODULARIZATION COMPLETE ===\n');

// Generar reporte
const report = {
  filesCreated: [],
  statistics: {},
  schemasDistribution: {},
  pathsDistribution: {}
};

// Archivos creados
const files = [
  'openapi/components/common.yaml',
  'openapi/components/parameters.yaml',
  'openapi/components/responses.yaml',
  'openapi/components/securitySchemes.yaml',
  'openapi/components/schemas/auth.yaml',
  'openapi/components/schemas/users.yaml',
  'openapi/components/schemas/gyms.yaml',
  'openapi/components/schemas/exercises.yaml',
  'openapi/components/schemas/routines.yaml',
  'openapi/paths/auth.yaml',
  'openapi/paths/users.yaml',
  'openapi/paths/gyms.yaml',
  'openapi/paths/exercises.yaml',
  'openapi/paths/routines.yaml'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
    report.filesCreated.push(file);
    report.statistics[file] = { bytes: stats.size, lines };
  }
});

// Distribución de schemas
Object.keys(domainSchemas).forEach(domain => {
  report.schemasDistribution[domain] = domainSchemas[domain];
});
report.schemasDistribution.common = commonSchemas;

// Distribución de paths
Object.keys(domainPaths).forEach(domain => {
  report.pathsDistribution[domain] = domainPaths[domain];
});

// Guardar reporte
fs.writeFileSync(
  path.join(__dirname, 'modularization-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('Report saved to: modularization-report.json');
