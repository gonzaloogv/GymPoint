const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'openapi.yaml');
const content = fs.readFileSync(openapiPath, 'utf8');
const lines = content.split('\n');

// Helper para obtener el nivel de indentación
function getIndentLevel(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

// Extrae una sección desde startLine hasta que la indentación vuelve al mismo nivel o menor
function extractSection(startLine, baseIndent) {
  const result = [lines[startLine]];

  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndentLevel(line);

    // Si es una línea vacía, incluirla
    if (line.trim() === '') {
      result.push(line);
      continue;
    }

    // Si la indentación es menor o igual al nivel base, terminamos
    if (indent <= baseIndent) {
      break;
    }

    result.push(line);
  }

  return result.join('\n');
}

// Encuentra y extrae securitySchemes
let securitySchemesStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  securitySchemes:') {
    securitySchemesStart = i;
    break;
  }
}

if (securitySchemesStart >= 0) {
  const section = extractSection(securitySchemesStart, 2);
  fs.writeFileSync(path.join(__dirname, 'extracted-securitySchemes.yaml'), section);
  console.log('✓ Extracted securitySchemes');
}

// Encuentra y extrae responses
let responsesStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  responses:') {
    responsesStart = i;
    break;
  }
}

if (responsesStart >= 0) {
  const section = extractSection(responsesStart, 2);
  fs.writeFileSync(path.join(__dirname, 'extracted-responses.yaml'), section);
  console.log('✓ Extracted responses');
}

// Encuentra y extrae parameters
let parametersStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  parameters:') {
    parametersStart = i;
    break;
  }
}

if (parametersStart >= 0) {
  const section = extractSection(parametersStart, 2);
  fs.writeFileSync(path.join(__dirname, 'extracted-parameters.yaml'), section);
  console.log('✓ Extracted parameters');
}

// Encuentra schemas
let schemasStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  schemas:') {
    schemasStart = i;
    break;
  }
}

console.log('schemas section starts at line:', schemasStart + 1);

// Lista de enums conocidos
const enumList = [
  'SubscriptionType',
  'Gender',
  'DifficultyLevel',
  'ExtendedDifficultyLevel',
  'WorkoutSessionStatus',
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

// Extraer cada schema individualmente
const schemas = {};
let currentSchema = null;
let currentSchemaLines = [];
let schemaIndent = 4; // Los schemas están a nivel 4 espacios

for (let i = schemasStart + 1; i < lines.length; i++) {
  const line = lines[i];
  const indent = getIndentLevel(line);

  // Si encontramos un schema nuevo (indent = 4 y termina en :)
  if (indent === schemaIndent && line.trim().endsWith(':')) {
    // Guardar el schema anterior si existe
    if (currentSchema) {
      schemas[currentSchema] = currentSchemaLines.join('\n');
    }

    // Iniciar nuevo schema
    currentSchema = line.trim().replace(':', '');
    currentSchemaLines = [line];
  } else if (currentSchema && (indent > schemaIndent || line.trim() === '')) {
    // Añadir línea al schema actual
    currentSchemaLines.push(line);
  } else if (indent <= 2) {
    // Salimos de la sección schemas
    if (currentSchema) {
      schemas[currentSchema] = currentSchemaLines.join('\n');
    }
    break;
  }
}

// Guardar el último schema
if (currentSchema && !schemas[currentSchema]) {
  schemas[currentSchema] = currentSchemaLines.join('\n');
}

console.log(`\nExtracted ${Object.keys(schemas).length} schemas`);

// Agrupar schemas por dominio
const domainSchemas = {
  auth: [],
  users: [],
  gyms: [],
  exercises: [],
  routines: []
};

Object.keys(schemas).forEach(schemaName => {
  const lower = schemaName.toLowerCase();

  if (lower.includes('auth') || lower.includes('register') || lower.includes('login') || lower.includes('token')) {
    domainSchemas.auth.push(schemaName);
  } else if (lower.includes('user') || lower.includes('profile')) {
    domainSchemas.users.push(schemaName);
  } else if (lower.includes('gym')) {
    domainSchemas.gyms.push(schemaName);
  } else if (lower.includes('exercise')) {
    domainSchemas.exercises.push(schemaName);
  } else if (lower.includes('routine')) {
    domainSchemas.routines.push(schemaName);
  }
});

// Guardar schemas por dominio
Object.keys(domainSchemas).forEach(domain => {
  const domainSchemaNames = domainSchemas[domain];
  const domainContent = domainSchemaNames.map(name => schemas[name]).join('\n');

  if (domainContent) {
    fs.writeFileSync(
      path.join(__dirname, `extracted-schemas-${domain}.yaml`),
      domainContent
    );
    console.log(`✓ Extracted ${domainSchemaNames.length} schemas for ${domain}`);
  }
});

// Guardar PaginationMeta y enums
const commonSchemas = ['PaginationMeta', ...enumList].filter(name => schemas[name]);
const commonContent = commonSchemas.map(name => schemas[name]).join('\n');
fs.writeFileSync(path.join(__dirname, 'extracted-schemas-common.yaml'), commonContent);
console.log(`✓ Extracted ${commonSchemas.length} common schemas (PaginationMeta + enums)`);

console.log('\nDone!');
