/**
 * Script para estandarizar formato en controladores automáticamente
 * Aplica transformaciones comunes para { message, data } y { error: { code, message } }
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');

// Mapeo de respuestas exitosas (patrón → mensaje)
const successMessages = {
  'obtenerEstadisticasGenerales': 'Estadísticas generales obtenidas con éxito',
  'obtenerUsuarios': 'Usuarios obtenidos con éxito',
  'obtenerUsuarioPorId': 'Usuario obtenido con éxito',
  'obtenerEstadisticasActividad': 'Estadísticas de actividad obtenidas con éxito',
  'obtenerTransacciones': 'Transacciones obtenidas con éxito',
  'obtenerAsistencias': 'Asistencias obtenidas con éxito',
  'obtenerResumenTokens': 'Resumen de tokens obtenido con éxito',
  'getGlobalRewardStats': 'Estadísticas globales de recompensas obtenidas con éxito',
  'getGymRewardStats': 'Estadísticas de recompensas del gimnasio obtenidas con éxito',
  'obtenerTodasAsistencias': 'Asistencias obtenidas con éxito',
  'buscarGimnasios': 'Gimnasios obtenidos con éxito',
  'obtenerGimnasioPorId': 'Gimnasio obtenido con éxito',
  'buscarGimnasiosCercanos': 'Gimnasios cercanos obtenidos con éxito',
  'obtenerTiposGimnasio': 'Tipos de gimnasio obtenidos con éxito',
  'obtenerPagosPorUsuario': 'Pagos obtenidos con éxito',
  'obtenerPagosPorGimnasio': 'Pagos del gimnasio obtenidos con éxito',
  'obtenerHorarios': 'Horarios obtenidos con éxito',
  'actualizarHorario': 'Horario actualizado con éxito',
  'crearHorarioEspecial': 'Horario especial creado con éxito',
  'registrarProgreso': 'Progreso registrado con éxito',
  'obtenerProgresoPorUsuario': 'Progreso obtenido con éxito',
  'obtenerEstadisticaPeso': 'Estadística de peso obtenida con éxito',
  'obtenerHistorialEjercicios': 'Historial de ejercicios obtenido con éxito',
  'obtenerHistorialPorEjercicio': 'Historial del ejercicio obtenido con éxito',
  'obtenerMejorLevantamiento': 'Mejor levantamiento obtenido con éxito',
  'obtenerPromedioLevantamiento': 'Promedio de levantamiento obtenido con éxito',
  'obtenerCodigos': 'Códigos obtenidos con éxito',
  'generarCodigoRecompensa': 'Código generado con éxito',
  'validarYReclamarCodigo': 'Código validado y reclamado con éxito',
  'obtenerCodigosPorGimnasio': 'Códigos del gimnasio obtenidos con éxito',
  'obtenerEstadisticasPorGimnasio': 'Estadísticas por gimnasio obtenidas con éxito',
  'listarRecompensas': 'Recompensas obtenidas con éxito',
  'obtenerRecompensasDisponibles': 'Recompensas disponibles obtenidas con éxito',
  'obtenerHistorialRecompensas': 'Historial de recompensas obtenido con éxito',
  'getRoutineWithExercises': 'Rutina obtenida con éxito',
  'updateRoutine': 'Rutina actualizada con éxito',
  'getRoutinesByUser': 'Rutinas obtenidas con éxito',
  'getActiveRoutineWithExercises': 'Rutina activa con ejercicios obtenida con éxito',
  'obtenerTransaccionesPorUsuario': 'Transacciones obtenidas con éxito',
  'obtenerTransaccionesAutenticado': 'Transacciones obtenidas con éxito',
  'obtenerUsuario': 'Usuario obtenido con éxito',
  'actualizarPerfil': 'Perfil actualizado con éxito',
  'actualizarEmail': 'Email actualizado con éxito',
  'obtenerPerfilPorId': 'Perfil obtenido con éxito',
  'obtenerMiPerfil': 'Perfil obtenido con éxito',
  'obtenerEstadisticasUsuario': 'Estadísticas del usuario obtenidas con éxito',
  'obtenerGimnasiosActivos': 'Gimnasios activos obtenidos con éxito',
  'obtenerHistorialGimnasiosPorUsuario': 'Historial de gimnasios obtenido con éxito',
  'obtenerUsuariosActivosEnGimnasio': 'Usuarios activos obtenidos con éxito',
  'getAllExercises': 'Ejercicios obtenidos con éxito',
  'obtenerFrecuenciaPorUsuario': 'Frecuencia obtenida con éxito'
};

// Archivos a procesar con sus funciones y líneas problemáticas
const fixes = [
  // auth-controller.js
  {
    file: 'auth-controller.js',
    changes: [
      {
        old: /res\.json\(\{\s*accessToken:\s*token,\s*refreshToken,\s*user\s*\}\);/,
        new: 'res.json({ message: \'Login exitoso\', data: { accessToken: token, refreshToken, user } });'
      }
    ]
  }
];

console.log('\n========================================');
console.log(' ESTANDARIZANDO FORMATO EN CONTROLADORES');
console.log('========================================\n');

let totalFixed = 0;
let filesModified = 0;

// Procesar cada archivo
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(fileName => {
  const filePath = path.join(controllersDir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fixCount = 0;

  // Patrón 1: res.json(data) → res.json({ message, data })
  // Solo si no está dentro de un error handler
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Detectar res.json simple (no de error)
    if (line.match(/^\s+res\.json\([^{]/) && 
        !line.includes('error') &&
        !line.includes('message:')) {
      
      // Buscar el contexto para determinar el mensaje
      const prevLines = lines.slice(Math.max(0, i - 10), i).join(' ');
      let message = 'Operación exitosa';
      
      // Buscar nombre de función
      for (const [funcName, msg] of Object.entries(successMessages)) {
        if (prevLines.includes(`const ${funcName} =`) || 
            prevLines.includes(`exports.${funcName} =`)) {
          message = msg;
          break;
        }
      }
      
      // Transformar la línea
      const match = line.match(/^(\s+)res\.json\((.+)\);$/);
      if (match) {
        const indent = match[1];
        const data = match[2].trim();
        line = `${indent}res.json({\n${indent}  message: '${message}',\n${indent}  data: ${data}\n${indent}});`;
        modified = true;
        fixCount++;
      }
    }
    
    // Patrón 2: { error: err.message } → { error: { code, message } }
    if (line.includes('{ error:') && 
        !line.includes('error: {') &&
        line.includes('.json(')) {
      
      const match = line.match(/^(\s+)res\.status\((\d+)\)\.json\(\{\s*error:\s*(.+?)\s*\}\);$/);
      if (match) {
        const indent = match[1];
        const status = match[2];
        const errorMsg = match[3];
        
        // Generar código de error basado en el status
        let errorCode = 'ERROR';
        if (status === '400') errorCode = 'BAD_REQUEST';
        else if (status === '401') errorCode = 'UNAUTHORIZED';
        else if (status === '403') errorCode = 'FORBIDDEN';
        else if (status === '404') errorCode = 'NOT_FOUND';
        else if (status === '500') errorCode = 'INTERNAL_ERROR';
        
        line = `${indent}res.status(${status}).json({\n${indent}  error: {\n${indent}    code: '${errorCode}',\n${indent}    message: ${errorMsg}\n${indent}  }\n${indent}});`;
        modified = true;
        fixCount++;
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    // Crear backup
    fs.writeFileSync(filePath + '.bak', content);
    
    // Escribir contenido modificado
    fs.writeFileSync(filePath, newLines.join('\n'));
    
    console.log(`✅ ${fileName} - ${fixCount} correcciones aplicadas`);
    filesModified++;
    totalFixed += fixCount;
  }
});

console.log('\n========================================');
console.log(`\nRESUMEN:`);
console.log(`  Archivos modificados: ${filesModified}`);
console.log(`  Correcciones aplicadas: ${totalFixed}`);
console.log(`\nBackups guardados con extensión .bak`);
console.log('========================================\n');

