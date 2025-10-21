const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

// Directorio de rutas
const routesDir = path.join(__dirname, '../routes');
const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

log(colors.cyan, '📋 VALIDACIÓN DE DOCUMENTACIÓN SWAGGER\n');
log(colors.bright, `Analizando ${routeFiles.length} archivos de rutas...\n`);

let totalRoutes = 0;
let documentedRoutes = 0;
let undocumentedRoutes = [];
let problemBlocks = [];
let totalSwaggerBlocks = 0;

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Extraer bloques Swagger con su contenido
  const swaggerBlocks = [];
  let inBlock = false;
  let currentBlock = [];
  let blockStartLine = 0;
  let isSwaggerBlock = false;
  
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('/**')) {
      inBlock = true;
      blockStartLine = idx;
      currentBlock = [line];
      isSwaggerBlock = false;
    } else if (inBlock) {
      currentBlock.push(line);
      
      if (line.includes('@swagger')) {
        isSwaggerBlock = true;
      }
      
      if (line.includes('*/')) {
        inBlock = false;
        
        if (isSwaggerBlock) {
          swaggerBlocks.push({
            content: currentBlock.join('\n'),
            startLine: blockStartLine,
            endLine: idx
          });
        }
        
        currentBlock = [];
      }
    }
  });
  
  // Extraer rutas documentadas de los bloques Swagger
  const documentedPaths = new Map(); // key: "METHOD:/path", value: line number
  
  swaggerBlocks.forEach(block => {
    const blockText = block.content;
    
    // Ignorar bloques que solo definen tags, components, schemas, etc.
    if (blockText.includes('* tags:') || 
        blockText.includes('* components:') || 
        blockText.includes('* schemas:')) {
      return; // Estos no documentan rutas, solo definen metadatos
    }
    
    // Extraer el path (línea que tiene /api/... o /health, /ready, etc.)
    const pathMatch = blockText.match(/\*\s+(\/[^\s:]+):/);
    if (!pathMatch) {
      // Bloque sin path
      problemBlocks.push({
        file,
        line: block.startLine,
        issue: 'No se encontró path en bloque Swagger'
      });
      return;
    }
    
    const fullPath = pathMatch[1]; // ej: /api/auth/register o /health
    
    // Extraer TODOS los métodos HTTP del bloque (puede haber múltiples)
    const methodRegex = /\*\s+(get|post|put|patch|delete):/gi;
    const methods = [];
    let methodMatch;
    
    while ((methodMatch = methodRegex.exec(blockText)) !== null) {
      methods.push(methodMatch[1].toUpperCase());
    }
    
    if (methods.length === 0) {
      problemBlocks.push({
        file,
        line: block.startLine,
        issue: 'No se encontró método HTTP en bloque Swagger'
      });
      return;
    }
    
    // Verificar que tenga responses
    if (!blockText.includes('responses:')) {
      problemBlocks.push({
        file,
        line: block.startLine,
        issue: 'Falta sección "responses" en bloque Swagger'
      });
    }
    
    // Registrar todos los métodos documentados para este path
    methods.forEach(method => {
      documentedPaths.set(`${method}:${fullPath}`, block.startLine);
    });
  });
  
  // Extraer rutas del código
  const codeRoutes = [];
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];
    const lineNum = content.substring(0, match.index).split('\n').length;
    
    codeRoutes.push({
      method,
      path: routePath,
      line: lineNum
    });
  }
  
  // Mapeo completo de archivos a prefijos de ruta
  const routePrefixMap = {
    'admin-rewards-routes.js': '/api/admin',  // Rutas empiezan con /rewards y /gyms
    'admin-routes.js': '/api/admin',
    'assistance-routes.js': '/api/assistances',
    'auth-routes.js': '/api/auth',
    'body-metrics-routes.js': '/api/users/me/body-metrics',  // Montado como subruta en user-routes
    'challenge-routes.js': '/api/challenges',
    'exercise-routes.js': '/api/exercises',
    'frequency-routes.js': '/api/frequency',
    'gym-payment-routes.js': '/api/gym-payments',
    'gym-routes.js': '/api/gyms',
    'gym-schedule-routes.js': '/api/schedules',
    'gym-special-schedule-routes.js': '/api/special-schedules',
    'health-routes.js': null,  // Usa directamente el path sin prefijo (ej: /health, /ready)
    'location-routes.js': '/api/location',
    'media-routes.js': '/api/media',
    'notification-routes.js': '/api/users/me/notifications',
    'payment-routes.js': '/api/payments',
    'progress-routes.js': '/api/progress',
    'review-routes.js': '/api/reviews',
    'reward-code-routes.js': '/api/reward-codes',
    'reward-routes.js': '/api/rewards',
    'routine-routes.js': '/api/routines',
    'streak-routes.js': '/api/streak',
    'test-routes.js': '/api/test',
    'token-routes.js': '/api/tokens',
    'transaction-routes.js': '/api/transactions',
    'user-gym-routes.js': '/api/user-gym',
    'user-routes.js': '/api/users',
    'user-routine-routes.js': '/api/user-routines',
    'webhook-routes.js': '/api/webhooks',
    'workout-routes.js': '/api/workouts',
  };
  
  const basePrefix = routePrefixMap.hasOwnProperty(file) 
    ? (routePrefixMap[file] === null ? '' : routePrefixMap[file])
    : '/api/' + file.replace('-routes.js', '');
  
  if (codeRoutes.length > 0) {
    log(colors.blue, `📄 ${file}`);
    console.log(`   Rutas en código: ${codeRoutes.length}`);
    console.log(`   Bloques Swagger: ${swaggerBlocks.length}`);
    
    totalRoutes += codeRoutes.length;
    
    let documented = 0;
    let notDocumented = 0;
    
    codeRoutes.forEach(route => {
      // Construir el path completo esperado
      let fullPath;
      if (basePrefix === '') {
        // Sin prefijo, usar el path directamente
        fullPath = route.path;
      } else if (route.path === '/') {
        fullPath = basePrefix;
      } else {
        fullPath = basePrefix + route.path;
      }
      
      // Normalizar parámetros de ruta (:id -> {id})
      const fullPathNormalized = fullPath.replace(/:(\w+)/g, '{$1}');
      
      // Buscar si está documentado
      const key1 = `${route.method}:${fullPath}`;
      const key2 = `${route.method}:${fullPathNormalized}`;
      
      const isDocumented = documentedPaths.has(key1) || documentedPaths.has(key2);
      
      if (isDocumented) {
        documented++;
      } else {
        notDocumented++;
        undocumentedRoutes.push({
          file,
          method: route.method,
          path: route.path,
          fullPath: fullPath,
          line: route.line
        });
      }
    });
    
    documentedRoutes += documented;
    totalSwaggerBlocks += swaggerBlocks.length;
    
    const coverage = Math.round((documented / codeRoutes.length) * 100);
    
    if (coverage === 100) {
      log(colors.green, `   100% documentado`);
    } else if (coverage >= 80) {
      log(colors.yellow, `   ${coverage}% documentado (${notDocumented} ruta(s) sin documentar)`);
    } else {
      log(colors.red, `   ${coverage}% documentado (${notDocumented} ruta(s) sin documentar)`);
    }
    
    console.log('');
  }
});

// Resumen
log(colors.cyan, '='.repeat(60));
log(colors.cyan, '\n RESUMEN DE VALIDACIÓN\n');

const coverage = totalRoutes > 0 ? Math.round((documentedRoutes / totalRoutes) * 100) : 0;

console.log(`Total de rutas encontradas: ${totalRoutes}`);
console.log(`Rutas documentadas: ${documentedRoutes}`);
console.log(`Rutas sin documentar: ${undocumentedRoutes.length}`);
console.log('');

if (coverage >= 95) {
  log(colors.green, ` Cobertura de documentación: ${coverage}% - EXCELENTE`);
} else if (coverage >= 80) {
  log(colors.yellow, `  Cobertura de documentación: ${coverage}% - BUENO`);
} else {
  log(colors.red, ` Cobertura de documentación: ${coverage}% - NECESITA MEJORA`);
}

if (undocumentedRoutes.length > 0) {
  console.log('');
  log(colors.yellow, '  Rutas sin documentación Swagger:\n');
  
  // Agrupar por archivo
  const byFile = {};
  undocumentedRoutes.forEach(route => {
    if (!byFile[route.file]) byFile[route.file] = [];
    byFile[route.file].push(route);
  });
  
  Object.keys(byFile).sort().forEach(file => {
    log(colors.blue, `   ${file}:`);
    byFile[file].forEach(route => {
      console.log(`      - ${route.method} ${route.path} (línea ${route.line})`);
    });
    console.log('');
  });
}

// Problemas en bloques
log(colors.cyan, '='.repeat(60));
log(colors.cyan, '\n VALIDACIÓN DE BLOQUES SWAGGER\n');

console.log(`Total bloques Swagger: ${totalSwaggerBlocks}`);
console.log(`Bloques válidos: ${totalSwaggerBlocks - problemBlocks.length}`);
console.log(`Bloques con problemas: ${problemBlocks.length}`);

if (problemBlocks.length > 0) {
  console.log('');
  log(colors.yellow, '  Bloques con problemas:\n');
  problemBlocks.forEach(block => {
    console.log(`   ${block.file} (línea ${block.line + 1}):`);
    console.log(`      - ${block.issue}`);
  });
}

// Calificación final
log(colors.cyan, '\n' + '='.repeat(60));
log(colors.cyan, '\n CALIFICACIÓN FINAL\n');

let rating = 0;
if (coverage >= 95 && problemBlocks.length === 0) rating = 100;
else if (coverage >= 95 && problemBlocks.length <= 2) rating = 95;
else if (coverage >= 90 && problemBlocks.length <= 3) rating = 90;
else if (coverage >= 80 && problemBlocks.length <= 5) rating = 85;
else if (coverage >= 70) rating = 75;
else if (coverage >= 50) rating = 60;
else rating = Math.max(coverage / 2, 30);

rating = Math.round(rating);

if (rating >= 90) {
  log(colors.green, `Calificación: ${rating}/100 - EXCELENTE `);
} else if (rating >= 75) {
  log(colors.yellow, `Calificación: ${rating}/100 - BUENO `);
} else {
  log(colors.red, `Calificación: ${rating}/100 - NECESITA MEJORA `);
}

console.log('');
log(colors.cyan, '='.repeat(60));

// Exit code según resultado
process.exit(rating >= 80 ? 0 : 1);
