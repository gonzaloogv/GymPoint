# Legacy Aliases - Documentación de Refactorización

## Propósito de este documento

Este documento registra los **legacy aliases** (alias heredados) que existen en los servicios para mantener compatibilidad con código existente. Estos aliases apuntan a métodos modernos pero mantienen nombres antiguos en español para evitar romper dependencias.

## Estado actual: Enero 2025

### frequency-service.js

**Legacy aliases activos** (en uso en producción):

| Legacy Alias | Método Moderno | Usado En | Ubicación | Puede Refactorizarse |
|--------------|----------------|----------|-----------|---------------------|
| `crearMetaSemanal` | `createWeeklyGoal` | Controller | `frequency-controller.js:17` | ✅ Sí |
| `actualizarAsistenciaSemanal` | `incrementAssistance` | Service | `assistance-service.js:325,584,842` | ✅ Sí |
| `archivarFrecuencias` | `resetWeek` | Job | `cleanup-job.js:60` | ✅ Sí |
| `reiniciarSemana` | `resetWeek` | Controller | `frequency-controller.js:48` | ✅ Sí |
| `consultarMetaSemanal` | `getUserFrequency` | Controller | `frequency-controller.js:33` | ✅ Sí |

**Legacy aliases eliminados** (ya no existen):

| Legacy Alias | Fecha Eliminación | Razón |
|--------------|-------------------|--------|
| `actualizarUsuarioFrecuencia` | 2025-01-28 | No usado en ninguna parte del código |

### Otros servicios

_(Agregar aquí cuando se descubran más legacy aliases en otros servicios)_

## Plan de Refactorización

### Fase 1: Documentación ✅ COMPLETADO
- [x] Identificar todos los legacy aliases
- [x] Documentar dónde se usan
- [x] Crear este documento

### Fase 2: Preparación (Recomendado para próximo sprint)

1. **Crear Issue/Ticket** para refactorización de legacy aliases
2. **Estimar impacto**:
   - 5 archivos afectados (frequency-controller, assistance-service, cleanup-job, frequency-routes)
   - Riesgo: BAJO (cambio directo de nombres de función)
   - Testing: Existente (37 tests cubren el 90% del código)

### Fase 3: Implementación

#### Paso 1: Refactorizar Controllers
```javascript
// ANTES:
const meta = await frequencyService.crearMetaSemanal({ id_user, goal });

// DESPUÉS:
const meta = await frequencyService.createWeeklyGoal({
  idUserProfile: id_user,
  goal
});
```

**Archivos a modificar**:
- `backend/node/controllers/frequency-controller.js`
  - Línea 17: `crearMetaSemanal` → `createWeeklyGoal`
  - Línea 33: `consultarMetaSemanal` → `getUserFrequency`
  - Línea 48: `reiniciarSemana` → `resetWeek`

#### Paso 2: Refactorizar Services
```javascript
// ANTES:
const weeklyProgress = await frequencyService.actualizarAsistenciaSemanal(idUserProfile);

// DESPUÉS:
const weeklyProgress = await frequencyService.incrementAssistance(idUserProfile);
```

**Archivos a modificar**:
- `backend/node/services/assistance-service.js`
  - Línea 325: `actualizarAsistenciaSemanal` → `incrementAssistance`
  - Línea 584: `actualizarAsistenciaSemanal` → `incrementAssistance`
  - Línea 842: `actualizarAsistenciaSemanal` → `incrementAssistance`

#### Paso 3: Refactorizar Jobs
```javascript
// ANTES:
await frequencyService.archivarFrecuencias(now);

// DESPUÉS:
await frequencyService.resetWeek({ referenceDate: now });
```

**Archivos a modificar**:
- `backend/node/jobs/cleanup-job.js`
  - Línea 60: `archivarFrecuencias` → `resetWeek`

#### Paso 4: Eliminar Legacy Aliases
Una vez refactorizados todos los usos, eliminar de `frequency-service.js`:
```javascript
// ELIMINAR estas líneas (400-412):
const crearMetaSemanal = ({ id_user, goal }, options = {}) =>
  createWeeklyGoal({ idUserProfile: id_user, goal, transaction: options.transaction });

const actualizarAsistenciaSemanal = (idUserProfile) =>
  incrementAssistance({ idUserProfile });

const archivarFrecuencias = (referenceDate) =>
  resetWeek({ referenceDate });

const reiniciarSemana = () =>
  resetWeek();

const consultarMetaSemanal = (idUserProfile) =>
  getUserFrequency({ idUserProfile });

// Y eliminar de module.exports (líneas 428-432):
  crearMetaSemanal,
  actualizarAsistenciaSemanal,
  archivarFrecuencias,
  reiniciarSemana,
  consultarMetaSemanal,
```

#### Paso 5: Actualizar Routes
**Archivos a modificar**:
- `backend/node/routes/frequency-routes.js`
  - Línea 102: Actualizar comentario si es necesario
  - Línea 129: Actualizar comentario si es necesario

### Fase 4: Testing y Validación

1. **Tests unitarios**: Deben seguir pasando (37 tests)
   ```bash
   npm test -- tests/unit/service/frequency-service
   ```

2. **Tests de integración**: Ejecutar tests E2E si existen
   ```bash
   npm test -- tests/integration
   ```

3. **Testing manual**:
   - Crear meta semanal (POST /frequency)
   - Consultar meta (GET /frequency/me)
   - Verificar incremento de asistencia al registrar entrada
   - Verificar reset semanal (PUT /frequency/reset - admin)
   - Verificar cron job de limpieza

### Fase 5: Deployment

1. **Deploy en staging**: Probar funcionalidad completa
2. **Monitoreo**: Verificar logs, no debe haber errores de "método no encontrado"
3. **Deploy en producción**: Si staging está OK
4. **Rollback plan**: Tener commit listo para revertir si hay problemas

## Beneficios de la Refactorización

✅ **Código más limpio**: Nombres consistentes en inglés
✅ **Mejor mantenibilidad**: Reducir confusión entre nombres antiguos y modernos
✅ **Menos código**: Eliminar ~40 líneas de código redundante
✅ **Mejor experiencia de desarrollo**: Autocompletado más claro en IDEs
✅ **Preparación para internacionalización**: Todo el código en inglés

## Notas Importantes

⚠️ **NO eliminar legacy aliases sin refactorizar primero**: Romperá producción
⚠️ **Tests existentes cubren métodos modernos**: No hay tests específicos de legacy aliases
⚠️ **Impacto de negocio**: NINGUNO (cambio técnico interno sin afectar funcionalidad)

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-01-28 | Creación del documento | Gonzalo |
| 2025-01-28 | Eliminación de `actualizarUsuarioFrecuencia` (no usado) | Gonzalo |

---

**Última actualización**: 2025-01-28
**Estado**: Legacy aliases documentados y listos para refactorización
**Prioridad sugerida**: Media (no urgente, pero mejora calidad de código)
