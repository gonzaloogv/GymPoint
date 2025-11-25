const fs = require('fs');
const path = require('path');

// Read the files
const originalOpenAPI = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
const lote7Paths = fs.readFileSync(path.join(__dirname, 'lote7-paths.yaml'), 'utf8');
const lote7Schemas = fs.readFileSync(path.join(__dirname, 'lote7-schemas.yaml'), 'utf8');

// Fix the references in lote7Paths
let fixedPaths = lote7Paths
  .replace(/\$ref: '#\/components\/responses\/BadRequest'/g,
    `description: Datos inválidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'`)
  .replace(/\$ref: '#\/components\/responses\/NotFound'/g,
    `description: Recurso no encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'`)
  .replace(/\$ref: '#\/components\/responses\/Forbidden'/g,
    `description: Acceso denegado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'`)
  .replace(/bearerAuth:/g, 'BearerAuth:');

// Find where components section starts
const componentsMatch = originalOpenAPI.match(/^components:/m);
if (!componentsMatch) {
  console.error('Could not find components section');
  process.exit(1);
}

const componentsIndex = componentsMatch.index;

// Split the OpenAPI file
const beforeComponents = originalOpenAPI.substring(0, componentsIndex);
const fromComponents = originalOpenAPI.substring(componentsIndex);

// Insert the paths before components
const newOpenAPI = beforeComponents + fixedPaths + '\n' + fromComponents;

// Now we need to add schemas at the end
const finalOpenAPI = newOpenAPI + '\n' + lote7Schemas;

// Write the result
fs.writeFileSync(path.join(__dirname, 'openapi.yaml'), finalOpenAPI);

console.log('OpenAPI file updated successfully');
console.log('Added', (lote7Paths.match(/operationId:/g) || []).length, 'new operations');
