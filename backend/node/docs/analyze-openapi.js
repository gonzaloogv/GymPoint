const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'openapi.yaml');
const content = fs.readFileSync(openapiPath, 'utf8');

// Parse YAML manualmente para obtener los nombres de schemas
const lines = content.split('\n');
let inSchemas = false;
let inComponents = false;
let currentIndent = 0;
const schemas = [];
const enums = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (line === 'components:') {
    inComponents = true;
    continue;
  }

  if (inComponents && line === '  schemas:') {
    inSchemas = true;
    continue;
  }

  if (inSchemas && line.match(/^    \w+:/)) {
    const schemaName = line.match(/^    (\w+):/)[1];
    schemas.push(schemaName);

    // Check if it's an enum by looking at next few lines
    for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
      if (lines[j].includes('enum:')) {
        if (!enums.includes(schemaName)) {
          enums.push(schemaName);
        }
        break;
      }
      // Stop if we reach another schema
      if (lines[j].match(/^    \w+:/)) break;
    }
  }

  // Exit schemas section
  if (inSchemas && line.match(/^  \w+:/) && !line.includes('schemas:')) {
    break;
  }
}

console.log('Total Schemas:', schemas.length);
console.log('Total Enums:', enums.length);
console.log('\n=== ENUMS ===');
enums.forEach(e => console.log(e));

console.log('\n=== SCHEMAS BY DOMAIN ===');

const domains = {
  auth: [],
  users: [],
  gyms: [],
  exercises: [],
  routines: [],
  other: []
};

schemas.forEach(schema => {
  const lower = schema.toLowerCase();
  if (lower.includes('auth') || lower.includes('register') || lower.includes('login') || lower.includes('token')) {
    domains.auth.push(schema);
  } else if (lower.includes('user') || lower.includes('profile')) {
    domains.users.push(schema);
  } else if (lower.includes('gym')) {
    domains.gyms.push(schema);
  } else if (lower.includes('exercise')) {
    domains.exercises.push(schema);
  } else if (lower.includes('routine')) {
    domains.routines.push(schema);
  } else {
    domains.other.push(schema);
  }
});

console.log('\nAuth:', domains.auth.length);
domains.auth.forEach(s => console.log('  -', s));

console.log('\nUsers:', domains.users.length);
domains.users.forEach(s => console.log('  -', s));

console.log('\nGyms:', domains.gyms.length);
domains.gyms.forEach(s => console.log('  -', s));

console.log('\nExercises:', domains.exercises.length);
domains.exercises.forEach(s => console.log('  -', s));

console.log('\nRoutines:', domains.routines.length);
domains.routines.forEach(s => console.log('  -', s));

console.log('\nOther:', domains.other.length);
domains.other.forEach(s => console.log('  -', s));
