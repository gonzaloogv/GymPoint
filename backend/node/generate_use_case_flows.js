const fs = require('fs');
const path = require('path');

// Leer los casos de uso
const useCases = JSON.parse(fs.readFileSync('./use_cases_clean.json', 'utf8'));

// Función para buscar el código fuente de un operationId
function findSourceCode(operationId) {
  const searchDirs = ['./services', './controllers', './routes'];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Buscar el operationId en el contenido
      if (content.includes(operationId)) {
        return {
          file: filePath,
          found: true
        };
      }
    }
  }

  return { found: false };
}

// Función para generar un flujo genérico basado en el método HTTP y la descripción
function generateGenericFlow(useCase) {
  const { method, path, summary, description } = useCase;

  // Detectar tipo de operación
  const isCreate = method === 'POST' && !path.includes('/sync') && !path.includes('/approve') && !path.includes('/reject');
  const isUpdate = method === 'PUT' || method === 'PATCH';
  const isDelete = method === 'DELETE';
  const isList = method === 'GET' && (path.endsWith('s') || path.includes('/me') || path.includes('/search'));
  const isGetById = method === 'GET' && path.includes('{id}');
  const isLogin = path.includes('/login') || path.includes('/register');
  const isSync = path.includes('/sync');
  const isApprove = path.includes('/approve');
  const isReject = path.includes('/reject');
  const isCheckIn = path.includes('/check') || path.includes('/assistance');

  let flow = [];

  if (isLogin) {
    flow = [
      'Valida las credenciales proporcionadas',
      'Verifica que el usuario exista en la base de datos',
      'Genera un token de autenticación JWT',
      'Devuelve el token y la información del usuario'
    ];
  } else if (isCreate) {
    flow = [
      'Valida los datos de entrada',
      'Verifica permisos del usuario autenticado',
      'Crea el nuevo registro en la base de datos',
      'Devuelve el recurso creado con código 201'
    ];
  } else if (isUpdate) {
    flow = [
      'Valida los datos de entrada',
      'Verifica que el recurso exista',
      'Verifica permisos del usuario autenticado',
      'Actualiza el registro en la base de datos',
      'Devuelve el recurso actualizado'
    ];
  } else if (isDelete) {
    flow = [
      'Verifica que el recurso exista',
      'Verifica permisos del usuario autenticado',
      'Elimina el registro (soft delete o hard delete)',
      'Devuelve confirmación de eliminación'
    ];
  } else if (isList) {
    flow = [
      'Verifica permisos del usuario autenticado',
      'Aplica filtros y paginación según parámetros',
      'Consulta la base de datos',
      'Devuelve la lista de recursos con metadata de paginación'
    ];
  } else if (isGetById) {
    flow = [
      'Verifica permisos del usuario autenticado',
      'Busca el recurso por ID en la base de datos',
      'Valida que el recurso exista',
      'Devuelve los detalles del recurso'
    ];
  } else if (isSync) {
    flow = [
      'Obtiene los datos actuales del usuario',
      'Recalcula métricas o estado según lógica de negocio',
      'Actualiza los registros en la base de datos',
      'Devuelve los datos sincronizados'
    ];
  } else if (isApprove || isReject) {
    flow = [
      'Verifica que el recurso exista',
      'Verifica permisos de administrador',
      `Actualiza el estado a ${isApprove ? 'aprobado' : 'rechazado'}`,
      'Devuelve confirmación de la operación'
    ];
  } else if (isCheckIn) {
    flow = [
      'Valida la ubicación o condiciones de check-in',
      'Registra la asistencia en la base de datos',
      'Actualiza estadísticas del usuario',
      'Devuelve confirmación del registro'
    ];
  } else {
    // Flujo genérico por defecto
    flow = [
      'Verifica autenticación y permisos del usuario',
      'Procesa la solicitud según lógica de negocio',
      'Interactúa con la base de datos según sea necesario',
      'Devuelve la respuesta apropiada'
    ];
  }

  return flow;
}

// Generar el documento Markdown
let output = `# Casos de Uso - GymPoint API

Este documento describe los casos de uso de alto nivel extraídos de la API de GymPoint.

**Fecha de generación:** ${new Date().toISOString().split('T')[0]}
**Total de casos de uso:** ${useCases.length}

---

`;

// Agrupar por módulo/tag
const byModule = {};
useCases.forEach(uc => {
  const module = uc.tags[0] || 'General';
  if (!byModule[module]) {
    byModule[module] = [];
  }
  byModule[module].push(uc);
});

// Generar casos de uso por módulo
for (const [module, cases] of Object.entries(byModule).sort()) {
  output += `## Módulo: ${module}\n\n`;

  for (const useCase of cases) {
    const flow = generateGenericFlow(useCase);

    output += `**Caso de Uso:** ${useCase.summary}\n`;
    output += `* **Actor:** ${useCase.actor}\n`;
    output += `* **Disparador:** ${useCase.method} ${useCase.path}\n`;
    output += `* **Operation ID:** \`${useCase.operationId}\`\n`;
    output += `* **Flujo General:**\n`;
    flow.forEach((step, i) => {
      output += `    ${i + 1}. ${step}\n`;
    });
    output += `\n---\n\n`;
  }
}

// Guardar el documento
fs.writeFileSync('./CASOS_DE_USO.md', output);
console.log('✅ Documento generado: CASOS_DE_USO.md');
console.log(`📊 Total de casos de uso: ${useCases.length}`);
console.log(`📁 Total de módulos: ${Object.keys(byModule).length}`);
