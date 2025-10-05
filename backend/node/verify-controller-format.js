/**
 * Script para verificar formato de respuestas en controladores
 * Busca:
 * 1. res.json() sin { message, data } o sin { error: { code, message } }
 * 2. req.user.id en lugar de req.user.id_user_profile
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log('\n========================================');
console.log(' VERIFICACIÓN DE FORMATO EN CONTROLADORES');
console.log('========================================\n');

let totalIssues = 0;
const report = [];

files.forEach(fileName => {
  const filePath = path.join(controllersDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const issues = {
    fileName,
    wrongResponseFormat: [],
    wrongErrorFormat: [],
    wrongUserId: [],
    missingMessage: []
  };
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Buscar res.json() sin formato correcto
    if (line.includes('res.json(') && !line.includes('//')) {
      // Verificar si es una respuesta de éxito (status 2xx)
      const prevLines = lines.slice(Math.max(0, idx - 5), idx).join(' ');
      const isSuccess = prevLines.includes('res.status(20') || 
                        prevLines.includes('res.status(201)') ||
                        (!prevLines.includes('res.status(4') && !prevLines.includes('res.status(5'));
      
      // Verificar formato correcto
      if (isSuccess) {
        // Respuesta exitosa debe tener { message, data }
        if (!line.includes('message:') && !line.includes('message')) {
          // Excepción: puede ser solo { message: '...' } sin data
          if (!line.match(/res\.json\(\s*{\s*message:/)) {
            issues.missingMessage.push({ line: lineNum, code: line.trim() });
          }
        }
      } else {
        // Respuesta de error debe tener { error: { code, message } }
        if (line.includes('error:') && !line.includes('error: {')) {
          // Formato antiguo: { error: 'mensaje' } o { error: err.message }
          issues.wrongErrorFormat.push({ line: lineNum, code: line.trim() });
        }
      }
    }
    
    // Buscar req.user.id (debería ser req.user.id_user_profile o req.user.id_account)
    if (line.includes('req.user.id') && 
        !line.includes('req.user.id_user_profile') &&
        !line.includes('req.user.id_account') &&
        !line.includes('req.user.id_admin_profile') &&
        !line.includes('//')) {
      // Verificar que no sea solo un comentario o parte de otro identificador
      if (line.match(/req\.user\.id(?![_a-z])/)) {
        issues.wrongUserId.push({ line: lineNum, code: line.trim() });
      }
    }
  });
  
  // Contar issues totales
  const fileIssueCount = 
    issues.wrongResponseFormat.length +
    issues.wrongErrorFormat.length +
    issues.wrongUserId.length +
    issues.missingMessage.length;
  
  if (fileIssueCount > 0) {
    totalIssues += fileIssueCount;
    report.push(issues);
  }
});

// Imprimir reporte
if (report.length === 0) {
  console.log('✅ Todos los controladores tienen el formato correcto!\n');
} else {
  console.log(`⚠️  Encontrados ${totalIssues} problemas en ${report.length} archivos:\n`);
  
  report.forEach(({ fileName, wrongResponseFormat, wrongErrorFormat, wrongUserId, missingMessage }) => {
    console.log(`\n📁 ${fileName}`);
    
    if (wrongUserId.length > 0) {
      console.log(`  ❌ req.user.id incorrecto (${wrongUserId.length}):`);
      wrongUserId.forEach(({ line, code }) => {
        console.log(`     Línea ${line}: ${code}`);
      });
    }
    
    if (wrongErrorFormat.length > 0) {
      console.log(`  ❌ Formato de error incorrecto (${wrongErrorFormat.length}):`);
      wrongErrorFormat.forEach(({ line, code }) => {
        console.log(`     Línea ${line}: ${code}`);
      });
    }
    
    if (missingMessage.length > 0) {
      console.log(`  ⚠️  Respuesta sin { message, data } (${missingMessage.length}):`);
      missingMessage.forEach(({ line, code }) => {
        console.log(`     Línea ${line}: ${code}`);
      });
    }
  });
  
  console.log('\n========================================');
  console.log(`\nRESUMEN:`);
  console.log(`  Total de archivos con problemas: ${report.length}/${files.length}`);
  console.log(`  Total de problemas encontrados: ${totalIssues}`);
  console.log('\n========================================\n');
}

