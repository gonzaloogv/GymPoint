# GymPoint Mobile - Roadmap de Fases 9+ (Análisis Completo)

**Fecha**: Noviembre 2, 2025
**Estado Actual**: Fases 1-8 COMPLETADAS
**Próxima**: Fase 9 - Correcciones Críticas

---

## 📋 Resumen Ejecutivo

Las Fases 1-8 han implementado exitosamente el sistema de ejecución de rutinas con:
- ✅ 8+ características funcionales
- ✅ Arquitectura Clean Architecture sólida
- ✅ 0 errores de TypeScript en código nuevo
- ✅ UI completa con dark mode
- ❌ **1 BUG CRÍTICO**: Ejercicios no se guardan en historial
- ❌ **0 integración real con API** (todo es mock)
- ❌ **0 tests unitarios**

**BLOQUEADORES ANTES DE PRODUCCIÓN**:
- Arreglar mapeo de ejercicios al guardar
- Implementar integración real con API
- Agregar cobertura de tests

---

## 🔴 ISSUES CRÍTICOS A RESOLVER INMEDIATAMENTE

### Issue #1: Exercise Logs Siempre Vacíos (Data Loss)

**Archivo**: `src/features/routines/presentation/hooks/useSaveRoutineSession.ts:22`

**Problema**:
```typescript
// ACTUAL (ROTO):
logs: [], // TODO: Esto debería venir de los exerciseStates completados
```

**Impacto**:
- Cuando el usuario completa una sesión, NO se guardan los datos individuales de sets
- El historial muestra duración/volumen total pero NO qué peso/reps hizo en cada set
- Imposible trackear progreso detallado
- **Pérdida de datos crítica**

**Solución Requerida**:
```typescript
// CORRECTO:
logs: Object.values(stats.exerciseStates || {}).flatMap(exerciseState =>
  exerciseState.sets
    .filter(set => set.isDone)
    .map(set => ({
      exerciseId: exerciseState.exerciseId,
      setNumber: set.setNumber,
      reps: set.currentReps,
      weightKg: set.currentWeight,
      previousReps: set.previousReps,
      previousWeightKg: set.previousWeight,
    }))
),
```

**Costo**: ~2 horas (incluyendo testing)

---

### Issue #2: Crear Rutina Incompleta

**Archivo**: `src/features/routines/presentation/hooks/useCreateRoutine.ts:65`

**Problema**:
```typescript
// TODO: Implementar lógica de guardado
```

**Impacto**:
- Usuarios NO pueden crear rutinas nuevas
- Botón "Crear Rutina" no funciona
- Feature completamente bloqueada

**Solución Requerida**:
- Hook debe llamar a `DI.createRoutine.execute()`
- Necesita crear use case `CreateRoutine` en domain
- Necesita integración con API backend

**Costo**: ~4 horas (sin API real), ~8 horas (con API)

---

### Issue #3: Todo es Mock (Sin API Real)

**Archivos Afectados**:
- `src/features/routines/data/datasources/RoutineLocal.ts`
- `src/features/routines/data/RoutineRepositoryImpl.ts`

**Problema**:
- Todos los datos vienen de `RoutineLocal` (in-memory mock)
- No hay llamadas HTTP reales
- Las rutinas guardadas se pierden al cerrar la app
- NO hay autenticación/validación backend

**Impacto**:
- App no funciona sin backend real
- Imposible deployar a producción
- Usuarios perderán datos

**Solución Requerida**:
- Reemplazar `RoutineLocal` con datasource HTTP real
- Crear mappers para DTOs backend
- Integrar con API endpoints (aún por definir)

**Costo**: ~16 horas (depende de API backend)

---

## 📊 ESTADO ACTUAL DETALLADO

### Features Completamente Funcionales ✅ (8)

1. **Listar Rutinas** - RoutinesScreen
   - Muestra todas las rutinas
   - Dos botones: Detalle + Empezar
   - Dark mode completo

2. **Ver Detalle de Rutina** - RoutineDetailScreen
   - Muestra ejercicios, sets, rest time
   - Metadata (duración, dificultad)
   - Historial link

3. **Ejecutar Rutina** - RoutineExecutionScreen
   - Expandible/collapsible exercises
   - Editable sets (peso/reps)
   - Real-time stats (duración, volumen, series)
   - Persistencia automática a AsyncStorage

4. **Timer de Descanso** - RestTimer Component
   - 4 estados: initial → active → completed → idle
   - Countdown automático
   - Mensajes motivacionales
   - Skip button

5. **Pantalla de Finalización** - RoutineCompletedScreen
   - Resumen de sesión (duración, volumen, series)
   - Notas opcionales
   - Stats visuales
   - Guardado de sesión

6. **Recuperar Sesión Incompleta** - IncompleteSessionModal
   - Detecta sesión incompleta al abrir app
   - Modal con opciones: continuar/descartar
   - Restaura estado completamente

7. **Ver Historial** - RoutineHistoryScreen
   - Lista sesiones pasadas
   - Ordenadas por fecha
   - Expandible para ver detalles

8. **Agregar Ejercicio** - ExerciseSelector Modal
   - Modal para seleccionar ejercicios
   - Filtra ya agregados
   - Muestra info completa (sets, reps, rest, muscle groups)

### Features Parcialmente Implementadas ⚠️ (3)

1. **Crear Rutina** - CreateRoutineScreen
   - UI presente (wizard 3 pasos)
   - Hook existe pero incompleto (TODO: guardar)
   - No hay integración con API
   - **Estado**: 30% completado

2. **Importar Rutina** - ImportRoutineScreen
   - UI presente
   - No hay lógica de importación real
   - **Estado**: 10% completado

3. **Agregar Ejercicio Durante Ejecución** - ExerciseSelector
   - Modal existe y es bonito
   - Lógica de selección funciona
   - Pero NO valida si ejercicio ya está en la rutina
   - **Estado**: 85% completado

### Features Que NO Existen ✗ (5)

1. **Notificaciones Push** - Para sesiones incompletas
2. **Sincronización Offline/Online** - Sync cuando vuelve internet
3. **Métricas Avanzadas** - 1RM, 6RM, body weight tracking
4. **Gráficos de Progreso** - Charts de volumen, peso máximo
5. **Autenticación** - Validación backend, JWT tokens

---

## 🏗️ ARQUITECTURA ACTUAL

### Bien Hecho ✅

```
Clean Architecture:
├── Domain Layer (entities, use cases, repositories)
├── Data Layer (datasources, mappers, repository impl)
└── Presentation Layer (screens, components, hooks, state)

State Management:
└── Zustand con Immer middleware (funciona perfecto)

Styling:
└── NativeWind + Tailwind (dark mode completo)

Dependency Injection:
└── Manual DI container en src/di/container.ts

Type Safety:
└── TypeScript strict mode (pero con algunos `any`)
```

### Deuda Técnica ⚠️

```
Type Safety:
├── 15+ lugares con `any` types
├── route.params como `any`
├── navigation como `any`
└── layouts usan `any[]`

Testing:
└── 0 test files (0% coverage)

Error Handling:
├── No error boundaries
├── AsyncStorage errors silenciados
└── No notificaciones de error a usuario

Constants:
└── Magic numbers scattered (rest times, delays, etc)

Logging:
└── Logs básicos, sin estructura
```

---

## 📈 FASES RECOMENDADAS (9-15)

### **Fase 9: Correcciones Críticas** 🔴 (BLOQUEADOR)
**Duración**: 2-3 días
**Prioridad**: CRÍTICA

#### Tareas:
1. **Arreglar mapeo de ejercicios al guardar** (2h)
   - Modificar `useSaveRoutineSession.ts`
   - Mapear `exerciseStates` a `SetLog[]`
   - Testear manualmente que logs se guardan

2. **Crear datasource HTTP real** (4h)
   - Crear `RoutineRemote.ts` con Axios calls
   - Mappers para DTOs backend
   - Error handling para requests

3. **Reemplazar RoutineLocal con RoutineRemote** (3h)
   - Actualizar DI container
   - Handle loading states
   - Handle network errors

**Deliverable**: App guarda datos reales en backend

---

### **Fase 10: API Backend Integration**
**Duración**: 3-5 días
**Requisito**: Tener endpoints backend listos

#### Tareas:
1. Implementar todos los endpoints REST faltantes
2. Integración autenticación (JWT)
3. Validación de datos en backend
4. Error handling para casos edge

**Endpoints Necesarios**:
```
GET    /api/routines           # Listar
GET    /api/routines/:id       # Detalle
POST   /api/routines           # Crear
PUT    /api/routines/:id       # Actualizar
DELETE /api/routines/:id       # Eliminar
POST   /api/routines/:id/sessions  # Guardar sesión
GET    /api/routines/:id/sessions  # Historial
GET    /api/routines/:id/last-session  # Última sesión
```

**Deliverable**: App completamente conectada a API real

---

### **Fase 11: Complete Create Routine Feature**
**Duración**: 2-3 días

#### Tareas:
1. Implementar `CreateRoutine` use case
2. Integrar API POST `/routines`
3. Form validation con Zod
4. Loading states y error handling
5. Success message y navegación

**Deliverable**: Usuarios pueden crear rutinas propias

---

### **Fase 12: Unit Testing**
**Duración**: 4-5 días

#### Tareas:
1. Tests para `useRoutineExecution` hook (core logic)
2. Tests para `useRoutineExecutionStats` hook
3. Tests para use cases (SaveRoutineSession, etc)
4. Component snapshot tests
5. Integration tests para flujo completo

**Target**: 60%+ code coverage en routines feature

**Deliverable**: Suite de tests confiable

---

### **Fase 13: UX Polish & Edge Cases**
**Duración**: 2-3 días

#### Tareas:
1. Loading indicators en todas las screens
2. Error boundaries para crash prevention
3. Mensajes de error claros para usuario
4. Optimistic updates (mostrar datos antes de confirmación)
5. Animations para transiciones
6. Empty states en listas vacías
7. Retry logic para network failures

**Deliverable**: App se siente pulida y confiable

---

### **Fase 14: Performance & Optimization**
**Duración**: 2-3 días

#### Tareas:
1. Memoización de componentes (React.memo)
2. Lazy loading de imágenes
3. Virtual scrolling para listas largas
4. Bundle size analysis y optimization
5. Redux DevTools / Zustand debugging setup
6. Network request caching

**Deliverable**: App rápida y responsiva

---

### **Fase 15: Advanced Features**
**Duración**: 3-5 días (elegir 2-3)

#### Opciones:
1. **Progress Tracking**
   - Gráficos de volumen/peso over time
   - 1RM estimado
   - PR tracking (personal records)

2. **Offline Support**
   - Sync local sessions cuando vuelve internet
   - Conflict resolution
   - Offline indicator

3. **Social Features**
   - Compartir logros
   - Comparar progress con amigos
   - Leaderboards

4. **Gamification**
   - Badges/achievements
   - Streak tracking (ya parcialmente implementado)
   - Level system

5. **Notifications**
   - Push para sesiones incompletas
   - Rest timer reminders
   - Workout reminders

**Deliverable**: Feature set más atractivo para usuarios

---

## 📊 MATRIZ DE DECISIONES

### Pregunta 1: ¿Tenemos API Backend?

**Si SÍ**:
- Fase 9 → 10 → 11 (3 semanas)
- Integración completa rápida

**Si NO**:
- Necesitamos diseñar API primero
- Backend development paralelo
- Fase 9 puede usar mock, luego migrar en Fase 10

### Pregunta 2: ¿Qué es Prioridad?

**Si robustez**:
- Fase 9 → 12 (tests) → 13 (polish)
- Producto confiable pero básico

**Si features**:
- Fase 9 → 10 → 11 → 15 (choose 2-3)
- Más features pero requiere testing

**Si velocidad a producción**:
- Fase 9 → 10 → 13
- Quick MVP, sin tests pero pulido

### Pregunta 3: ¿Qué backend stack tienen?

**Node.js/Express/TypeScript**:
- Reutilizar tipos en backend y frontend
- Código generator para DTOs

**Python/Django**:
- OpenAPI spec para tipos
- Codegen con openapi-generator

**Java/Spring**:
- REST clients generator
- Similar a Python

**Otro**:
- Usar OpenAPI spec
- Swagger/OpenAPI contracts

---

## 🎯 TIMELINE ESTIMADO

### Escenario A: MVP Rápido (3 semanas)
```
Semana 1:
├─ Fase 9: Correcciones críticas (2 días)
├─ Fase 10: API básica (3 días)
└─ Testing manual

Semana 2:
├─ Fase 13: UX Polish (2 días)
├─ Bug fixes from testing (2 días)
└─ QA

Semana 3:
├─ Fase 14: Performance (1 día)
├─ Final testing (2 días)
└─ Deployment prep
```

### Escenario B: Producto Robusto (5 semanas)
```
Semana 1: Fase 9 (correcciones)
Semana 2: Fase 10 (API backend)
Semana 3: Fase 11 (Create Routine)
Semana 4: Fase 12 (Tests)
Semana 5: Fase 13 (Polish) + Fase 14 (Performance)
```

### Escenario C: Premium (7+ semanas)
```
Semana 1-5: Scenarios B
Semana 6-7: Fase 15 (Advanced features) + refinement
```

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

Antes de deployar a producción:

- [ ] Fase 9 completada (bugs críticos arreglados)
- [ ] Fase 10 completada (API real integrada)
- [ ] Fase 11 completada (Create Routine funciona)
- [ ] Fase 12: Mínimo 40% test coverage
- [ ] Fase 13: Todas las screens tienen error handling
- [ ] Fase 14: App abre en <2 segundos
- [ ] No hay console.error en logs (clean console)
- [ ] Todos los TODO comments removidos o documentados
- [ ] Dark mode funciona en todas las screens
- [ ] Passwords/tokens nunca se guardan en logs
- [ ] API keys no están hardcodeadas
- [ ] AsyncStorage data encriptada (si sensible)
- [ ] App probada en Android y iOS
- [ ] App probada con internet lento (3G)
- [ ] App probada sin internet (offline)

---

## 💰 ESTIMACIÓN DE ESFUERZO TOTAL

| Fase | Duración | Complejidad | Riesgo |
|------|----------|-------------|--------|
| 9    | 2-3 d    | Baja       | Bajo   |
| 10   | 3-5 d    | Alta       | Alto   |
| 11   | 2-3 d    | Media      | Medio  |
| 12   | 4-5 d    | Media      | Bajo   |
| 13   | 2-3 d    | Baja       | Bajo   |
| 14   | 2-3 d    | Media      | Bajo   |
| 15   | 3-5 d    | Alta       | Medio  |

**Total Mínimo (9+10+13)**: 7-11 días = **1.5 semanas**
**Total Completo (9-14)**: 17-25 días = **3.5-5 semanas**
**Premium (9-15)**: 20-30 días = **4-6 semanas**

---

## 🚨 RIESGOS IDENTIFICADOS

1. **API Backend No Existe Aún**
   - Riesgo: Fase 10 bloqueada hasta que se diseñe API
   - Mitigation: Diseñar API spec paralelo, usar mocks temporalmente

2. **No Hay Tests**
   - Riesgo: Regresiones en Fases posteriores rompen features anteriores
   - Mitigation: Agregar tests en Fase 12, testing manual constante

3. **Deuda Técnica (`any` types)**
   - Riesgo: Difícil refactor, IDE no ayuda
   - Mitigation: Arreglar tipos en Fase 9 o paralelamente

4. **Memory Leaks en Hooks**
   - Riesgo: App se ralentiza con uso prolongado
   - Mitigation: Testing en Fase 14, profiling con DevTools

5. **Data Loss en Offline**
   - Riesgo: Usuario pierde sesión si se va internet
   - Mitigation: Implementar sync en Fase 15 o antes

---

## 📝 DECISION POINTS REQUERIDOS

**Antes de continuar, necesitamos decidir**:

1. ¿Cuál es la **prioridad**? (robustez vs features vs velocidad)
2. ¿**API backend** ya existe? ¿Cuál es el spec?
3. ¿**Timeline** para llegar a producción?
4. ¿**Team size**? (1 dev = diferente que 3 devs)
5. ¿**Autenticación** ya implementada en auth feature?
6. ¿**QA** manual o automated?
7. ¿**Deployment** automático o manual?

---

## 🎬 PRÓXIMOS PASOS INMEDIATOS

**Hoy/Esta semana**:
1. ✅ Revisar este documento
2. Decidir prioridades y timeline
3. Diseñar API spec (si no existe)
4. **COMENZAR Fase 9** (2 horas máximo para bug crítico)

**La próxima semana**:
1. Completar Fase 9
2. Comenzar Fase 10 (API integration)
3. Testing manual constante

---

## 📞 SUPPORT & ESCALATION

**Dudas**:
- Contactar para clarificar requirements
- Revisar commits previos (Fases 1-8) para entender patrones
- Usar CLAUDE.md como referencia de arquitectura

**Blockers**:
- API spec faltante → necesita Backend team
- Cambios en requirements → replanning necesario
- Performance issues → profiling requerido

---

**Este documento será actualizado conforme completemos fases.**

Última actualización: 2025-11-02
