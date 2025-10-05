/**
 * Script para eliminar asociaciones de modelos individuales
 * Las asociaciones deben estar solo en models/index.js
 */

const fs = require('fs');
const path = require('path');

const modelsToFix = [
  'User.js',
  'Exercise.js',
  'Routine.js',
  'Progress.js'
];

const modelsDir = path.join(__dirname, 'models');

modelsToFix.forEach(fileName => {
  const filePath = path.join(modelsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} no existe, omitiendo...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Encontrar la posición de "module.exports"
  const exportMatch = content.match(/^module\.exports\s*=\s*\w+;$/m);
  
  if (!exportMatch) {
    console.log(`⚠️  ${fileName}: No se encontró module.exports`);
    return;
  }
  
  const exportIndex = exportMatch.index + exportMatch[0].length;
  
  // Eliminar todo después de module.exports
  const cleanedContent = content.substring(0, exportIndex) + '\n';
  
  // Backup del archivo original
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, content);
  
  // Escribir el contenido limpio
  fs.writeFileSync(filePath, cleanedContent);
  
  console.log(`✅ ${fileName} limpiado (backup guardado en ${path.basename(backupPath)})`);
});

console.log('\n✅ Modelos limpiados exitosamente');
console.log('💡 Las asociaciones están centralizadas en models/index.js');
console.log('💡 Los servicios deben importar: const { User, ... } = require("../models");');

