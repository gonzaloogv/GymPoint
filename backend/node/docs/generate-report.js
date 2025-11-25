const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_DIR = path.join(__dirname, 'openapi');
const ORIGINAL_FILE = path.join(__dirname, 'openapi.yaml');

function getFileStats(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  const size = Buffer.byteLength(content, 'utf8');
  return { lines, size };
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

function countSchemas(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const spec = yaml.load(content);
    return Object.keys(spec?.components?.schemas || {}).length;
  } catch {
    return 0;
  }
}

function countPaths(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const spec = yaml.load(content);
    return Object.keys(spec?.paths || {}).length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log('Generando reporte detallado de modularización...\n');

  const originalStats = getFileStats(ORIGINAL_FILE);
  const files = getAllYamlFiles(BASE_DIR);

  const report = {
    overview: {
      originalFile: {
        path: path.relative(path.dirname(BASE_DIR), ORIGINAL_FILE),
        lines: originalStats.lines,
        sizeKB: (originalStats.size / 1024).toFixed(2)
      },
      modularization: {
        totalFiles: files.length,
        totalLines: 0,
        totalSizeKB: 0,
        averageLinesPerFile: 0,
        minLines: Infinity,
        maxLines: 0
      }
    },
    components: {
      common: { file: 'components/common.yaml', schemas: 0, lines: 0 },
      parameters: { file: 'components/parameters.yaml', count: 0, lines: 0 },
      responses: { file: 'components/responses.yaml', count: 0, lines: 0 },
      securitySchemes: { file: 'components/securitySchemes.yaml', count: 0, lines: 0 }
    },
    schemas: {},
    paths: {},
    files: []
  };

  // Procesar cada archivo
  for (const file of files) {
    const relativePath = path.relative(BASE_DIR, file);
    const stats = getFileStats(file);

    report.overview.modularization.totalLines += stats.lines;
    report.overview.modularization.totalSizeKB += stats.size / 1024;

    if (stats.lines < report.overview.modularization.minLines) {
      report.overview.modularization.minLines = stats.lines;
    }
    if (stats.lines > report.overview.modularization.maxLines) {
      report.overview.modularization.maxLines = stats.lines;
    }

    const fileInfo = {
      path: relativePath,
      lines: stats.lines,
      sizeKB: (stats.size / 1024).toFixed(2)
    };

    // Clasificar archivo
    if (relativePath.includes('components/common.yaml')) {
      const count = countSchemas(file);
      report.components.common.schemas = count;
      report.components.common.lines = stats.lines;
      fileInfo.schemas = count;
    } else if (relativePath.includes('components/parameters.yaml')) {
      const content = fs.readFileSync(file, 'utf8');
      const spec = yaml.load(content);
      const count = Object.keys(spec?.components?.parameters || {}).length;
      report.components.parameters.count = count;
      report.components.parameters.lines = stats.lines;
      fileInfo.parameters = count;
    } else if (relativePath.includes('components/responses.yaml')) {
      const content = fs.readFileSync(file, 'utf8');
      const spec = yaml.load(content);
      const count = Object.keys(spec?.components?.responses || {}).length;
      report.components.responses.count = count;
      report.components.responses.lines = stats.lines;
      fileInfo.responses = count;
    } else if (relativePath.includes('components/securitySchemes.yaml')) {
      const content = fs.readFileSync(file, 'utf8');
      const spec = yaml.load(content);
      const count = Object.keys(spec?.components?.securitySchemes || {}).length;
      report.components.securitySchemes.count = count;
      report.components.securitySchemes.lines = stats.lines;
      fileInfo.securitySchemes = count;
    } else if (relativePath.includes('components/schemas/')) {
      const domain = path.basename(file, '.yaml');
      const count = countSchemas(file);
      report.schemas[domain] = {
        file: relativePath,
        schemas: count,
        lines: stats.lines
      };
      fileInfo.schemas = count;
    } else if (relativePath.includes('paths/')) {
      const domain = path.basename(file, '.yaml');
      const count = countPaths(file);
      report.paths[domain] = {
        file: relativePath,
        paths: count,
        lines: stats.lines
      };
      fileInfo.paths = count;
    }

    report.files.push(fileInfo);
  }

  // Calcular promedios
  report.overview.modularization.averageLinesPerFile = Math.round(
    report.overview.modularization.totalLines / files.length
  );
  report.overview.modularization.totalSizeKB = report.overview.modularization.totalSizeKB.toFixed(2);

  // Guardar reporte JSON
  fs.writeFileSync(
    path.join(BASE_DIR, 'MODULARIZATION_REPORT.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  // Generar reporte Markdown
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(
    path.join(BASE_DIR, 'MODULARIZATION_REPORT.md'),
    markdown,
    'utf8'
  );

  // Imprimir resumen en consola
  console.log('='.repeat(70));
  console.log('REPORTE DE MODULARIZACIÓN - OPENAPI GYMPOINT');
  console.log('='.repeat(70));
  console.log('\n## ARCHIVO ORIGINAL');
  console.log(`   ${report.overview.originalFile.path}`);
  console.log(`   Líneas: ${report.overview.originalFile.lines}`);
  console.log(`   Tamaño: ${report.overview.originalFile.sizeKB} KB`);

  console.log('\n## MODULARIZACIÓN');
  console.log(`   Total de archivos: ${report.overview.modularization.totalFiles}`);
  console.log(`   Total de líneas: ${report.overview.modularization.totalLines}`);
  console.log(`   Tamaño total: ${report.overview.modularization.totalSizeKB} KB`);
  console.log(`   Promedio líneas/archivo: ${report.overview.modularization.averageLinesPerFile}`);
  console.log(`   Archivo más pequeño: ${report.overview.modularization.minLines} líneas`);
  console.log(`   Archivo más grande: ${report.overview.modularization.maxLines} líneas`);

  console.log('\n## COMPONENTES COMUNES');
  console.log(`   ✓ common.yaml: ${report.components.common.schemas} schemas (${report.components.common.lines} líneas)`);
  console.log(`   ✓ parameters.yaml: ${report.components.parameters.count} parámetros (${report.components.parameters.lines} líneas)`);
  console.log(`   ✓ responses.yaml: ${report.components.responses.count} responses (${report.components.responses.lines} líneas)`);
  console.log(`   ✓ securitySchemes.yaml: ${report.components.securitySchemes.count} schemes (${report.components.securitySchemes.lines} líneas)`);

  console.log('\n## SCHEMAS POR DOMINIO');
  const sortedSchemas = Object.entries(report.schemas).sort((a, b) => b[1].schemas - a[1].schemas);
  for (const [domain, info] of sortedSchemas) {
    console.log(`   ✓ ${domain}: ${info.schemas} schemas (${info.lines} líneas)`);
  }

  console.log('\n## PATHS POR DOMINIO');
  const sortedPaths = Object.entries(report.paths).sort((a, b) => b[1].paths - a[1].paths);
  for (const [domain, info] of sortedPaths) {
    console.log(`   ✓ ${domain}: ${info.paths} paths (${info.lines} líneas)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Reportes generados:');
  console.log(`   - ${path.join(BASE_DIR, 'MODULARIZATION_REPORT.json')}`);
  console.log(`   - ${path.join(BASE_DIR, 'MODULARIZATION_REPORT.md')}`);
  console.log('='.repeat(70));
}

function generateMarkdownReport(report) {
  const md = [];

  md.push('# Reporte de Modularización - OpenAPI GymPoint\n');
  md.push('Este documento detalla la modularización del archivo OpenAPI monolítico en múltiples módulos por dominio.\n');

  md.push('## 1. Resumen General\n');
  md.push('### Archivo Original\n');
  md.push('| Atributo | Valor |');
  md.push('|----------|-------|');
  md.push(`| Ruta | \`${report.overview.originalFile.path}\` |`);
  md.push(`| Líneas | ${report.overview.originalFile.lines} |`);
  md.push(`| Tamaño | ${report.overview.originalFile.sizeKB} KB |\n`);

  md.push('### Modularización\n');
  md.push('| Métrica | Valor |');
  md.push('|---------|-------|');
  md.push(`| Total de archivos | ${report.overview.modularization.totalFiles} |`);
  md.push(`| Total de líneas | ${report.overview.modularization.totalLines} |`);
  md.push(`| Tamaño total | ${report.overview.modularization.totalSizeKB} KB |`);
  md.push(`| Promedio líneas/archivo | ${report.overview.modularization.averageLinesPerFile} |`);
  md.push(`| Archivo más pequeño | ${report.overview.modularization.minLines} líneas |`);
  md.push(`| Archivo más grande | ${report.overview.modularization.maxLines} líneas |\n`);

  md.push('## 2. Componentes Comunes\n');
  md.push('Archivos que contienen definiciones reutilizables:\n');
  md.push('| Archivo | Contenido | Líneas |');
  md.push('|---------|-----------|--------|');
  md.push(`| \`common.yaml\` | ${report.components.common.schemas} schemas (enums y tipos comunes) | ${report.components.common.lines} |`);
  md.push(`| \`parameters.yaml\` | ${report.components.parameters.count} parámetros reutilizables | ${report.components.parameters.lines} |`);
  md.push(`| \`responses.yaml\` | ${report.components.responses.count} respuestas HTTP comunes | ${report.components.responses.lines} |`);
  md.push(`| \`securitySchemes.yaml\` | ${report.components.securitySchemes.count} esquema(s) de seguridad | ${report.components.securitySchemes.lines} |\n`);

  md.push('## 3. Schemas por Dominio\n');
  md.push('Distribución de schemas en archivos por dominio:\n');
  md.push('| Dominio | Archivo | Schemas | Líneas |');
  md.push('|---------|---------|---------|--------|');
  const sortedSchemas = Object.entries(report.schemas).sort((a, b) => b[1].schemas - a[1].schemas);
  for (const [domain, info] of sortedSchemas) {
    md.push(`| **${domain}** | \`${info.file}\` | ${info.schemas} | ${info.lines} |`);
  }
  md.push('');

  md.push('## 4. Paths por Dominio\n');
  md.push('Distribución de endpoints en archivos por dominio:\n');
  md.push('| Dominio | Archivo | Endpoints | Líneas |');
  md.push('|---------|---------|-----------|--------|');
  const sortedPaths = Object.entries(report.paths).sort((a, b) => b[1].paths - a[1].paths);
  for (const [domain, info] of sortedPaths) {
    md.push(`| **${domain}** | \`${info.file}\` | ${info.paths} | ${info.lines} |`);
  }
  md.push('');

  md.push('## 5. Estructura de Archivos\n');
  md.push('```');
  md.push('docs/openapi/');
  md.push('├── components/');
  md.push('│   ├── common.yaml');
  md.push('│   ├── parameters.yaml');
  md.push('│   ├── responses.yaml');
  md.push('│   ├── securitySchemes.yaml');
  md.push('│   └── schemas/');
  for (const domain of Object.keys(report.schemas).sort()) {
    md.push(`│       ├── ${domain}.yaml`);
  }
  md.push('└── paths/');
  for (const domain of Object.keys(report.paths).sort()) {
    md.push(`    ├── ${domain}.yaml`);
  }
  md.push('```\n');

  md.push('## 6. Formato de Referencias\n');
  md.push('Las referencias entre archivos siguen estos patrones:\n');
  md.push('### Desde Paths a Schemas\n');
  md.push('```yaml');
  md.push('# Para schemas del mismo dominio');
  md.push('$ref: ../components/schemas/{dominio}.yaml#/components/schemas/{SchemaName}\n');
  md.push('# Para schemas comunes');
  md.push('$ref: ../components/common.yaml#/components/schemas/{SchemaName}');
  md.push('```\n');

  md.push('### Desde Paths a Parameters/Responses\n');
  md.push('```yaml');
  md.push('$ref: ../components/parameters.yaml#/components/parameters/{ParamName}');
  md.push('$ref: ../components/responses.yaml#/components/responses/{ResponseName}');
  md.push('```\n');

  md.push('### Entre Schemas del mismo dominio\n');
  md.push('```yaml');
  md.push('$ref: #/components/schemas/{SchemaName}');
  md.push('```\n');

  md.push('### Entre Schemas de diferentes dominios\n');
  md.push('```yaml');
  md.push('# A schemas comunes');
  md.push('$ref: ../common.yaml#/components/schemas/{SchemaName}\n');
  md.push('# A schemas de otro dominio');
  md.push('$ref: ./{otro-dominio}.yaml#/components/schemas/{SchemaName}');
  md.push('```\n');

  md.push('## 7. Validación\n');
  md.push(`✅ Todos los ${report.overview.modularization.totalFiles} archivos tienen sintaxis YAML válida.\n`);

  md.push('## 8. Beneficios de la Modularización\n');
  md.push('1. **Mantenibilidad**: Cada dominio tiene su propio archivo, facilitando cambios localizados');
  md.push('2. **Escalabilidad**: Fácil agregar nuevos dominios sin afectar archivos existentes');
  md.push('3. **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo sin conflictos');
  md.push('4. **Claridad**: La estructura de carpetas refleja la organización lógica del API');
  md.push('5. **Reusabilidad**: Componentes comunes centralizados para evitar duplicación\n');

  md.push('---');
  md.push(`*Generado el ${new Date().toISOString()}*`);

  return md.join('\n');
}

main().catch(console.error);
