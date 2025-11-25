const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const original = yaml.load(fs.readFileSync(path.join(__dirname, '..', 'openapi.original.yaml'), 'utf8'));
const bundle = yaml.load(fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8'));

const originalSchemas = Object.keys(original.components?.schemas || {});
const bundleSchemas = Object.keys(bundle.components?.schemas || {});

const missing = originalSchemas.filter(s => !bundleSchemas.includes(s));

if (missing.length > 0) {
  console.log(`\n❌ Faltan ${missing.length} schemas:\n`);
  missing.forEach(s => console.log(`  - ${s}`));
} else {
  console.log('\n✅ Todos los schemas están presentes!\n');
}
