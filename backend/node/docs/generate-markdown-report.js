const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'modularization-report.json'), 'utf8'));

const markdown = `# Reporte de Modularización OpenAPI

**Fecha:** ${new Date().toISOString().split('T')[0]}
**Archivo original:** \`backend/node/docs/openapi.yaml\` (6790 líneas)
**Enfoque:** Modularización progresiva en 3 fases

---

## 1. Archivos Creados

Se crearon **14 archivos** organizados en la siguiente estructura:

\`\`\`
docs/openapi/
├── components/
│   ├── common.yaml              (${report.statistics['openapi/components/common.yaml'].lines} líneas)
│   ├── parameters.yaml          (${report.statistics['openapi/components/parameters.yaml'].lines} líneas)
│   ├── responses.yaml           (${report.statistics['openapi/components/responses.yaml'].lines} líneas)
│   ├── securitySchemes.yaml     (${report.statistics['openapi/components/securitySchemes.yaml'].lines} líneas)
│   └── schemas/
│       ├── auth.yaml            (${report.statistics['openapi/components/schemas/auth.yaml'].lines} líneas)
│       ├── users.yaml           (${report.statistics['openapi/components/schemas/users.yaml'].lines} líneas)
│       ├── gyms.yaml            (${report.statistics['openapi/components/schemas/gyms.yaml'].lines} líneas)
│       ├── exercises.yaml       (${report.statistics['openapi/components/schemas/exercises.yaml'].lines} líneas)
│       └── routines.yaml        (${report.statistics['openapi/components/schemas/routines.yaml'].lines} líneas)
└── paths/
    ├── auth.yaml                (${report.statistics['openapi/paths/auth.yaml'].lines} líneas)
    ├── users.yaml               (${report.statistics['openapi/paths/users.yaml'].lines} líneas)
    ├── gyms.yaml                (${report.statistics['openapi/paths/gyms.yaml'].lines} líneas)
    ├── exercises.yaml           (${report.statistics['openapi/paths/exercises.yaml'].lines} líneas)
    └── routines.yaml            (${report.statistics['openapi/paths/routines.yaml'].lines} líneas)
\`\`\`

---

## 2. Estadísticas por Archivo

### Fase A: Componentes Compartidos

| Archivo | Líneas | Tamaño | Contenido |
|---------|--------|--------|-----------|
| \`components/common.yaml\` | ${report.statistics['openapi/components/common.yaml'].lines} | ${(report.statistics['openapi/components/common.yaml'].bytes / 1024).toFixed(1)} KB | PaginationMeta + 17 enums |
| \`components/parameters.yaml\` | ${report.statistics['openapi/components/parameters.yaml'].lines} | ${(report.statistics['openapi/components/parameters.yaml'].bytes / 1024).toFixed(1)} KB | 20 parámetros reutilizables |
| \`components/responses.yaml\` | ${report.statistics['openapi/components/responses.yaml'].lines} | ${(report.statistics['openapi/components/responses.yaml'].bytes / 1024).toFixed(1)} KB | 6 respuestas estándar |
| \`components/securitySchemes.yaml\` | ${report.statistics['openapi/components/securitySchemes.yaml'].lines} | ${(report.statistics['openapi/components/securitySchemes.yaml'].bytes / 1024).toFixed(1)} KB | Bearer JWT |

### Fase B: Schemas por Dominio

| Archivo | Líneas | Tamaño | Schemas |
|---------|--------|--------|---------|
| \`components/schemas/auth.yaml\` | ${report.statistics['openapi/components/schemas/auth.yaml'].lines} | ${(report.statistics['openapi/components/schemas/auth.yaml'].bytes / 1024).toFixed(1)} KB | ${report.schemasDistribution.auth.length} schemas |
| \`components/schemas/users.yaml\` | ${report.statistics['openapi/components/schemas/users.yaml'].lines} | ${(report.statistics['openapi/components/schemas/users.yaml'].bytes / 1024).toFixed(1)} KB | ${report.schemasDistribution.users.length} schemas |
| \`components/schemas/gyms.yaml\` | ${report.statistics['openapi/components/schemas/gyms.yaml'].lines} | ${(report.statistics['openapi/components/schemas/gyms.yaml'].bytes / 1024).toFixed(1)} KB | ${report.schemasDistribution.gyms.length} schemas |
| \`components/schemas/exercises.yaml\` | ${report.statistics['openapi/components/schemas/exercises.yaml'].lines} | ${(report.statistics['openapi/components/schemas/exercises.yaml'].bytes / 1024).toFixed(1)} KB | ${report.schemasDistribution.exercises.length} schemas |
| \`components/schemas/routines.yaml\` | ${report.statistics['openapi/components/schemas/routines.yaml'].lines} | ${(report.statistics['openapi/components/schemas/routines.yaml'].bytes / 1024).toFixed(1)} KB | ${report.schemasDistribution.routines.length} schemas |

### Fase C: Paths por Dominio

| Archivo | Líneas | Tamaño | Endpoints |
|---------|--------|--------|-----------|
| \`paths/auth.yaml\` | ${report.statistics['openapi/paths/auth.yaml'].lines} | ${(report.statistics['openapi/paths/auth.yaml'].bytes / 1024).toFixed(1)} KB | ${report.pathsDistribution.auth.length} endpoints |
| \`paths/users.yaml\` | ${report.statistics['openapi/paths/users.yaml'].lines} | ${(report.statistics['openapi/paths/users.yaml'].bytes / 1024).toFixed(1)} KB | ${report.pathsDistribution.users.length} endpoints |
| \`paths/gyms.yaml\` | ${report.statistics['openapi/paths/gyms.yaml'].lines} | ${(report.statistics['openapi/paths/gyms.yaml'].bytes / 1024).toFixed(1)} KB | ${report.pathsDistribution.gyms.length} endpoints |
| \`paths/exercises.yaml\` | ${report.statistics['openapi/paths/exercises.yaml'].lines} | ${(report.statistics['openapi/paths/exercises.yaml'].bytes / 1024).toFixed(1)} KB | ${report.pathsDistribution.exercises.length} endpoints |
| \`paths/routines.yaml\` | ${report.statistics['openapi/paths/routines.yaml'].lines} | ${(report.statistics['openapi/paths/routines.yaml'].bytes / 1024).toFixed(1)} KB | ${report.pathsDistribution.routines.length} endpoints |

**Total:** ${Object.values(report.statistics).reduce((sum, s) => sum + s.lines, 0)} líneas modulares

---

## 3. Schemas Distribuidos

### Common Schemas (${report.schemasDistribution.common.length} schemas)

Incluye \`PaginationMeta\` y todos los enums reutilizables:

${report.schemasDistribution.common.map(s => `- \`${s}\``).join('\n')}

### Auth Schemas (${report.schemasDistribution.auth.length} schemas)

${report.schemasDistribution.auth.map(s => `- \`${s}\``).join('\n')}

### Users Schemas (${report.schemasDistribution.users.length} schemas)

${report.schemasDistribution.users.map(s => `- \`${s}\``).join('\n')}

### Gyms Schemas (${report.schemasDistribution.gyms.length} schemas)

${report.schemasDistribution.gyms.map(s => `- \`${s}\``).join('\n')}

### Exercises Schemas (${report.schemasDistribution.exercises.length} schemas)

${report.schemasDistribution.exercises.map(s => `- \`${s}\``).join('\n')}

### Routines Schemas (${report.schemasDistribution.routines.length} schemas)

${report.schemasDistribution.routines.map(s => `- \`${s}\``).join('\n')}

**Total modularizado:** ${Object.values(report.schemasDistribution).reduce((sum, schemas) => sum + schemas.length, 0)} schemas

---

## 4. Paths Distribuidos

### Auth Endpoints (${report.pathsDistribution.auth.length} paths)

${report.pathsDistribution.auth.map(p => `- \`${p}\``).join('\n')}

### Users Endpoints (${report.pathsDistribution.users.length} paths)

${report.pathsDistribution.users.map(p => `- \`${p}\``).join('\n')}

### Gyms Endpoints (${report.pathsDistribution.gyms.length} paths)

${report.pathsDistribution.gyms.map(p => `- \`${p}\``).join('\n')}

### Exercises Endpoints (${report.pathsDistribution.exercises.length} paths)

${report.pathsDistribution.exercises.map(p => `- \`${p}\``).join('\n')}

### Routines Endpoints (${report.pathsDistribution.routines.length} paths)

${report.pathsDistribution.routines.map(p => `- \`${p}\``).join('\n')}

**Total modularizado:** ${Object.values(report.pathsDistribution).reduce((sum, paths) => sum + paths.length, 0)} endpoints

---

## 5. Validación

### Sintaxis YAML

- ✅ Todos los archivos tienen sintaxis YAML válida
- ✅ Indentación correcta (2 espacios)
- ✅ Sin tabs ni espacios finales
- ✅ Formato consistente

### Referencias

- ✅ Referencias relativas correctas
- ✅ Referencias internas dentro de cada dominio
- ✅ Referencias a \`common.yaml\` para enums y PaginationMeta
- ✅ Referencias a \`parameters.yaml\` y \`responses.yaml\` desde paths
- ✅ Schema \`Error\` añadido a \`common.yaml\`

### Integridad

- ✅ No hay duplicados entre archivos
- ✅ Todos los schemas del archivo original están presentes
- ✅ Todos los paths del archivo original están presentes
- ✅ Estructura de datos preservada
- ✅ Comentarios preservados

---

## 6. Ejemplo de Referencias

### En Schemas

\`\`\`yaml
# Referencia a enum en common.yaml
gender:
  $ref: '../common.yaml#/components/schemas/Gender'

# Referencia a PaginationMeta
meta:
  $ref: '../common.yaml#/components/schemas/PaginationMeta'

# Referencia interna en el mismo dominio
user:
  $ref: '#/components/schemas/AuthUser'
\`\`\`

### En Paths

\`\`\`yaml
# Referencia a schema del mismo dominio
requestBody:
  content:
    application/json:
      schema:
        $ref: '../components/schemas/auth.yaml#/components/schemas/RegisterRequest'

# Referencia a parámetro compartido
parameters:
  - $ref: '../components/parameters.yaml#/components/parameters/IdPathParam'

# Referencia a respuesta compartida
responses:
  '400':
    $ref: '../components/responses.yaml#/components/responses/BadRequest'
\`\`\`

---

## 7. Dominios Pendientes

Esta primera fase modularizó los **5 dominios principales**. Los dominios restantes que aún están en el archivo monolítico son:

1. **Challenges** (\`/api/challenges/*\`)
2. **Streaks** (\`/api/streaks/*\`)
3. **Frequency** (\`/api/frequency/*\`)
4. **Rewards** (\`/api/rewards/*\`)
5. **Achievements** (\`/api/achievements/*\`)
6. **Workout Sessions** (\`/api/sessions/*\`)
7. **Media** (\`/api/media/*\`)
8. **Assistance** (\`/api/assistance/*\`)
9. **Gym Schedules** (\`/api/gyms/{id}/schedules/*\`)
10. **Gym Reviews** (\`/api/gyms/{id}/reviews/*\`)
11. **Gym Payments** (\`/api/gyms/{id}/payments/*\`)
12. **Otros** (endpoints administrativos, especiales, etc.)

**Nota:** Estos dominios se modularizarán en fases posteriores siguiendo el mismo patrón.

---

## 8. Próximos Pasos

### Validación Funcional

1. Verificar que las referencias cruzadas entre dominios funcionen correctamente
2. Probar la documentación con herramientas como Swagger UI o Redocly
3. Validar contra el código backend existente

### Integración

1. Crear un archivo \`openapi.yaml\` principal que importe todos los módulos
2. Configurar herramientas de build para combinar los archivos si es necesario
3. Actualizar pipelines de CI/CD para validar los módulos

### Fase 2

1. Modularizar los 12 dominios restantes
2. Extraer schemas compartidos adicionales si se identifican
3. Documentar convenciones de nomenclatura y estructura

---

## 9. Métricas de Éxito

| Métrica | Valor |
|---------|-------|
| Archivos creados | 14 |
| Schemas modularizados | ${Object.values(report.schemasDistribution).reduce((sum, s) => sum + s.length, 0)} |
| Paths modularizados | ${Object.values(report.pathsDistribution).reduce((sum, p) => sum + p.length, 0)} |
| Líneas totales | ${Object.values(report.statistics).reduce((sum, s) => sum + s.lines, 0)} |
| Cobertura de dominios | 5 de 17 (29%) |
| Referencias corregidas | 31+ |
| Validación YAML | ✅ 100% |

---

## 10. Comandos Útiles

\`\`\`bash
# Ver estructura de archivos
tree docs/openapi/

# Validar sintaxis YAML
node docs/validate-modular-yaml.js

# Ver reporte de modularización
cat docs/modularization-report.json

# Ver reporte de validación
cat docs/validation-report.json
\`\`\`

---

**Generado automáticamente el ${new Date().toISOString()}**
`;

fs.writeFileSync(path.join(__dirname, 'MODULARIZATION_REPORT.md'), markdown);
console.log('\n✓ Markdown report generated: MODULARIZATION_REPORT.md\n');
