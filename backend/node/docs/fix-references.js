const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'openapi');

// Primero, necesitamos encontrar dónde está el schema "Error"
// Vamos a leer el openapi.yaml original para encontrarlo
const openapiPath = path.join(__dirname, 'openapi.yaml');
const content = fs.readFileSync(openapiPath, 'utf8');

// Buscar el schema Error
const errorMatch = content.match(/    Error:\s*\n((?:      .*\n)*)/);
if (errorMatch) {
  console.log('Found Error schema - needs to be added to common.yaml');
}

// Cargar el reporte para saber qué schemas están en cada dominio
const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'modularization-report.json'), 'utf8'));

// Crear un mapa de schema -> archivo
const schemaMap = {};
Object.keys(report.schemasDistribution).forEach(domain => {
  report.schemasDistribution[domain].forEach(schema => {
    if (domain === 'common') {
      schemaMap[schema] = '../common.yaml';
    } else {
      schemaMap[schema] = `schemas/${domain}.yaml`;
    }
  });
});

// Añadir Error a common (debería estar ahí)
schemaMap['Error'] = '../common.yaml';

console.log('\n=== FIXING SCHEMA REFERENCES ===\n');

// Corregir referencias en archivos de schemas
const schemaDirs = ['auth', 'users', 'gyms', 'exercises', 'routines'];

schemaDirs.forEach(domain => {
  const filePath = path.join(baseDir, 'components', 'schemas', `${domain}.yaml`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Buscar referencias internas que aún usan el formato antiguo
  const refPattern = /\$ref: '#\/components\/schemas\/(\w+)'/g;
  const matches = [...content.matchAll(refPattern)];

  matches.forEach(match => {
    const schemaName = match[1];
    const oldRef = match[0];

    // Si el schema está en el mismo dominio, usar referencia interna
    if (report.schemasDistribution[domain].includes(schemaName)) {
      const newRef = `$ref: '#/components/schemas/${schemaName}'`;
      content = content.replace(oldRef, newRef);
      changes++;
    } else if (schemaMap[schemaName]) {
      // Si está en otro archivo, usar ruta relativa
      const targetFile = schemaMap[schemaName];
      const newRef = `$ref: '${targetFile}#/components/schemas/${schemaName}'`;
      content = content.replace(oldRef, newRef);
      changes++;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${changes} references in schemas/${domain}.yaml`);
  }
});

console.log('\n=== FIXING PATH REFERENCES ===\n');

// Corregir referencias en archivos de paths
schemaDirs.forEach(domain => {
  const filePath = path.join(baseDir, 'paths', `${domain}.yaml`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Buscar referencias que aún usan el formato antiguo
  const refPattern = /\$ref: '#\/components\/schemas\/(\w+)'/g;
  const matches = [...content.matchAll(refPattern)];

  matches.forEach(match => {
    const schemaName = match[1];
    const oldRef = match[0];

    if (schemaMap[schemaName]) {
      const targetFile = schemaMap[schemaName];
      let newRef;

      if (targetFile === '../common.yaml') {
        newRef = `$ref: '../components/common.yaml#/components/schemas/${schemaName}'`;
      } else {
        newRef = `$ref: '../components/${targetFile}#/components/schemas/${schemaName}'`;
      }

      content = content.replace(oldRef, newRef);
      changes++;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${changes} references in paths/${domain}.yaml`);
  }
});

// Ahora añadir Error schema a common.yaml si no está
const commonPath = path.join(baseDir, 'components', 'common.yaml');
let commonContent = fs.readFileSync(commonPath, 'utf8');

if (!commonContent.includes('Error:')) {
  console.log('\n=== ADDING ERROR SCHEMA TO COMMON ===\n');

  const errorSchema = `
    Error:
      type: object
      required:
        - error
      additionalProperties: false
      properties:
        error:
          type: string
          description: Mensaje de error descriptivo
          example: Ha ocurrido un error
`;

  commonContent += errorSchema;
  fs.writeFileSync(commonPath, commonContent);
  console.log('✓ Added Error schema to common.yaml');
}

console.log('\n=== DONE ===\n');
