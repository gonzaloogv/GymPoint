const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'openapi');

console.log('\n=== FIXING CROSS-DOMAIN REFERENCES ===\n');

// Leer el archivo auth.yaml y corregir la referencia a UserProfileSummary
const authSchemaPath = path.join(baseDir, 'components', 'schemas', 'auth.yaml');
let authContent = fs.readFileSync(authSchemaPath, 'utf8');

// Corregir la ruta incorrecta
const incorrectRef = `$ref: 'schemas/users.yaml#/components/schemas/UserProfileSummary'`;
const correctRef = `$ref: 'users.yaml#/components/schemas/UserProfileSummary'`;

if (authContent.includes(incorrectRef)) {
  authContent = authContent.replace(incorrectRef, correctRef);
  fs.writeFileSync(authSchemaPath, authContent);
  console.log('✓ Fixed cross-reference in auth.yaml');
} else {
  console.log('  No incorrect references found in auth.yaml');
}

// Revisar todos los archivos de schemas para buscar referencias cruzadas incorrectas
const schemaDomains = ['auth', 'users', 'gyms', 'exercises', 'routines'];

schemaDomains.forEach(domain => {
  const filePath = path.join(baseDir, 'components', 'schemas', `${domain}.yaml`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Buscar referencias que incluyan "schemas/" en la ruta
  const badPattern = /\$ref: 'schemas\/(\w+)\.yaml#/g;
  if (badPattern.test(content)) {
    content = content.replace(/\$ref: 'schemas\/(\w+)\.yaml#/g, "$ref: '$1.yaml#");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed cross-references in schemas/${domain}.yaml`);
  }
});

console.log('\n=== DONE ===\n');
