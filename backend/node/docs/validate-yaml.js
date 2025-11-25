const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_DIR = path.join(__dirname, 'openapi');

function validateYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    yaml.load(content);
    return { valid: true, file: filePath };
  } catch (error) {
    return { valid: false, file: filePath, error: error.message };
  }
}

function getAllYamlFiles(dir) {
  const files = [];

  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        files.push(fullPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

async function main() {
  console.log('Validando sintaxis YAML de archivos modularizados...\n');

  const files = getAllYamlFiles(BASE_DIR);
  const results = files.map(validateYamlFile);

  const valid = results.filter(r => r.valid);
  const invalid = results.filter(r => !r.valid);

  console.log(`Total de archivos: ${results.length}`);
  console.log(`✓ Válidos: ${valid.length}`);

  if (invalid.length > 0) {
    console.log(`✗ Inválidos: ${invalid.length}\n`);
    console.log('Errores encontrados:');
    invalid.forEach(r => {
      const relativePath = path.relative(BASE_DIR, r.file);
      console.log(`  ✗ ${relativePath}`);
      console.log(`    ${r.error}\n`);
    });
  } else {
    console.log('\n✅ Todos los archivos tienen sintaxis YAML válida!');
  }

  return invalid.length === 0;
}

main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error durante la validación:', error);
  process.exit(1);
});
