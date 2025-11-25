#!/usr/bin/env node

/**
 * Script de validación de rutas y controladores
 *
 * Verifica que:
 * 1. Todas las rutas carguen sin errores
 * 2. Todas las funciones referenciadas en rutas estén exportadas en controladores
 * 3. No haya referencias a undefined
 *
 * Uso:
 *   node scripts/validate-routes.js
 *
 * Exit codes:
 *   0 - Todo OK
 *   1 - Errores encontrados
 */

const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '..', 'routes');
const CONTROLLERS_DIR = path.join(__dirname, '..', 'controllers');

console.log('🔍 Validando rutas y controladores...\n');

let hasErrors = false;

// 1. Obtener todos los archivos de rutas
const routeFiles = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('-routes.js'));

console.log(`📁 Encontrados ${routeFiles.length} archivos de rutas\n`);

// 2. Validar cada archivo de rutas
for (const routeFile of routeFiles) {
  const routePath = path.join(ROUTES_DIR, routeFile);
  const controllerName = routeFile.replace('-routes.js', '-controller.js');
  const controllerPath = path.join(CONTROLLERS_DIR, controllerName);

  console.log(`\n━━━ ${routeFile} ━━━`);

  // 2.1 Intentar cargar la ruta
  try {
    require(routePath);
    console.log('  ✅ Ruta carga correctamente');
  } catch (error) {
    console.error(`  ❌ Error al cargar ruta: ${error.message}`);
    console.error(`     Stack: ${error.stack.split('\n')[1].trim()}`);
    hasErrors = true;
    continue;
  }

  // 2.2 Verificar que el controlador exista
  if (!fs.existsSync(controllerPath)) {
    console.warn(`  ⚠️  Controlador no encontrado: ${controllerName}`);
    continue;
  }

  // 2.3 Cargar el controlador
  let controller;
  try {
    controller = require(controllerPath);
    console.log(`  ✅ Controlador carga correctamente`);
  } catch (error) {
    console.error(`  ❌ Error al cargar controlador: ${error.message}`);
    hasErrors = true;
    continue;
  }

  // 2.4 Extraer referencias a funciones del controlador en el archivo de rutas
  const routeContent = fs.readFileSync(routePath, 'utf8');
  const matches = routeContent.matchAll(/controller\.(\w+)/g);
  const referencedFunctions = new Set();

  for (const match of matches) {
    referencedFunctions.add(match[1]);
  }

  // 2.5 Verificar que todas las funciones referenciadas existan
  console.log(`  📋 Funciones referenciadas: ${referencedFunctions.size}`);

  let missingFunctions = 0;
  for (const fn of referencedFunctions) {
    if (!controller[fn]) {
      console.error(`     ❌ Función faltante: controller.${fn} (undefined)`);
      hasErrors = true;
      missingFunctions++;
    } else if (typeof controller[fn] !== 'function') {
      console.error(`     ❌ No es función: controller.${fn} (tipo: ${typeof controller[fn]})`);
      hasErrors = true;
      missingFunctions++;
    } else {
      console.log(`     ✅ controller.${fn}`);
    }
  }

  // 2.6 Verificar que no haya funciones undefined en el controlador
  const exportedFunctions = Object.keys(controller);
  let undefinedExports = 0;

  for (const fn of exportedFunctions) {
    if (controller[fn] === undefined) {
      console.error(`     ❌ Exportación undefined: ${fn}`);
      hasErrors = true;
      undefinedExports++;
    }
  }

  // 2.7 Resumen
  if (missingFunctions === 0 && undefinedExports === 0) {
    console.log(`  ✅ Todas las funciones están correctamente exportadas`);
  }
}

// 3. Resumen final
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Resumen de Validación\n');

if (hasErrors) {
  console.log('❌ SE ENCONTRARON ERRORES');
  console.log('\nAcciones recomendadas:');
  console.log('  1. Verifica que todas las funciones estén exportadas en module.exports');
  console.log('  2. Verifica que los nombres en las rutas coincidan con los del controlador');
  console.log('  3. Ejecuta: node -e "require(\'./routes/NOMBRE-routes\')" para debug específico');
  console.log('\nVer documentación: docs/DOCKER_TROUBLESHOOTING.md');
  process.exit(1);
} else {
  console.log('✅ TODAS LAS VALIDACIONES PASARON');
  console.log(`\n   • ${routeFiles.length} archivos de rutas validados`);
  console.log('   • Todas las funciones correctamente exportadas');
  console.log('   • No hay referencias a undefined');
  console.log('\n¡Listo para deploy! 🚀');
  process.exit(0);
}
