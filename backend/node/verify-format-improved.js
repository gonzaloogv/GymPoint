/**
 * Script mejorado para verificar formato en controladores
 * Versión 2.0 - Detecta correctamente message y data en múltiples líneas
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

console.log('\n========================================');
console.log(' VERIFICACIÓN MEJORADA DE FORMATO');
console.log('========================================\n');

let totalIssues = 0;
const report = [];

files.forEach(fileName => {
  const filePath = path.join(controllersDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const issues = {
    fileName,
    missingFormat: []
  };
  
  // Buscar todos los res.json
  const regex = /res\.json\(\s*(\{[^}]*|[^);]+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const startPos = match.index;
    const lineNum = content.substring(0, startPos).split('\n').length;
    
    // Obtener el contenido completo del res.json (puede ser multilínea)
    let openBraces = 0;
    let endPos = startPos + match[0].length;
    let hasOpenBrace = match[1].includes('{');
    
    if (hasOpenBrace) {
      openBraces = 1;
      for (let i = endPos; i < content.length && openBraces > 0; i++) {
        if (content[i] === '{') openBraces++;
        if (content[i] === '}') openBraces--;
        endPos = i;
      }
    } else {
      // Es un res.json simple sin {}
      const endMatch = content.substring(endPos).match(/[;)]/);
      if (endMatch) {
        endPos += endMatch.index;
      }
    }
    
    const fullContent = content.substring(startPos, endPos + 10);
    
    // Verificar si es un error (skip)
    const prevContext = content.substring(Math.max(0, startPos - 100), startPos);
    if (prevContext.includes('catch') || prevContext.includes('error')) {
      continue;
    }
    
    // Verificar si tiene message y data
    const hasMessage = fullContent.includes('message:') || fullContent.includes('message ');
    const hasData = fullContent.includes('data:') || fullContent.includes('data ');
    
    // Verificar si es solo un simple valor
    const isSimpleValue = !hasOpenBrace || (!hasMessage && !hasData);
    
    if (!hasMessage && !isSimpleValue) {
      // Extraer snippet para mostrar
      const lines = content.split('\n');
      const snippet = lines[lineNum - 1]?.trim();
      
      issues.missingFormat.push({
        line: lineNum,
        snippet,
        hasMessage,
        hasData
      });
    }
  }
  
  if (issues.missingFormat.length > 0) {
    totalIssues += issues.missingFormat.length;
    report.push(issues);
  }
});

// Imprimir reporte
if (report.length === 0) {
  console.log('✅ ¡Todos los controladores tienen el formato correcto!\n');
} else {
  console.log(`⚠️  Encontrados ${totalIssues} problemas reales en ${report.length} archivos:\n`);
  
  report.forEach(({ fileName, missingFormat }) => {
    console.log(`\n📁 ${fileName} (${missingFormat.length} problemas)`);
    
    missingFormat.forEach(({ line, snippet, hasMessage, hasData }) => {
      console.log(`  Línea ${line}: ${snippet}`);
      console.log(`    Message: ${hasMessage ? '✓' : '✗'} | Data: ${hasData ? '✓' : '✗'}`);
    });
  });
  
  console.log('\n========================================');
  console.log(`\nRESUMEN:`);
  console.log(`  Archivos con problemas: ${report.length}/${files.length}`);
  console.log(`  Problemas reales encontrados: ${totalIssues}`);
  console.log('========================================\n');
}

