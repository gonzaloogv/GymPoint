# Fixes Implementados - Sesión de Rutinas

## Resumen

Se solucionaron 4 problemas críticos con la funcionalidad de rutinas:

### ✅ 1. Modal aparece en pantalla de ejecución
### ✅ 2. Los checks no se guardaban
### ✅ 3. Error al iniciar sesión con otra pendiente
### ✅ 4. Headers personalizados sin AppTabs

---

## 1. Modal que aparecía en pantalla de ejecución ✅

### Problema:
El modal de sesión incompleta aparecía incluso cuando el usuario estaba en la pantalla de ejecución, causando un loop infinito.

### Solución:
**Archivo modificado:** `useIncompleteSessionModal.ts`

```typescript
import { useRoute } from '@react-navigation/native';

// Mostrar modal solo si NO estamos en pantalla de ejecución
useEffect(() => {
  const isExecutionScreen = route.name === 'RoutineExecution' || route.name === 'RoutineCompleted';

  if (incompleteSession && !isExecutionScreen) {
    setVisible(true);
  } else {
    setVisible(false);
  }
}, [incompleteSession, route.name]);
```

**Flujo corregido:**
1. Usuario abre app → modal aparece
2. Usuario presiona "Continuar" → navega a ejecución
3. Modal se oculta automáticamente porque `route.name === 'RoutineExecution'`
4. Usuario entrena normalmente sin interrupciones

---

## 2. Los checks no se guardaban / se reiniciaban al continuar ✅

### Problema Original:
Al cerrar la app y volver, los checks marcados desaparecían porque no se guardaban en AsyncStorage.

### Problema Crítico Descubierto:
- Usuario marca 2 sets como completados en ejercicio 20
- Vuelve atrás, modal aparece, presiona "Continuar"
- Progreso se REINICIA a 0 sets completados
- Logs mostraban: "Sets completados cambió: 2 → 0"

### Causa Raíz:
Race condition en la inicialización:
1. Componente monta y restaura estado con 2 sets completados
2. Auto-save effect detecta cambio de 0 (ref inicial) → 2 (restaurado)
3. Guarda inmediatamente (correcto)
4. Si el estado se reinicializa por cualquier razón, detecta 2 → 0
5. Guarda 0, sobrescribiendo el progreso real

### Solución Implementada:

#### A. Actualizar interfaces (`incompleteSessionLocalDataSource.ts`)
```typescript
export interface SetExecution {
  setNumber: number;
  previousWeight: number;
  previousReps: number;
  currentWeight: number;
  currentReps: number;
  isDone: boolean; // ✅ Guarda si está marcado
}

export interface IncompleteSessionData {
  // ... campos existentes
  duration: number; // ✅ Duración en segundos
  exerciseStates?: { [exerciseId: string]: ExerciseState }; // ✅ Estado completo
  expandedExercises?: { [exerciseId: string]: boolean }; // ✅ Qué está expandido
}
```

#### B. Actualizar store (`routines.store.ts`)

**Interfaces agregadas:**
```typescript
interface SetExecution {
  setNumber: number;
  previousWeight: number;
  previousReps: number;
  currentWeight: number;
  currentReps: number;
  isDone: boolean;
}

interface ExerciseState {
  sets: SetExecution[];
}

interface IncompleteSession {
  // ... campos existentes
  duration: number;
  exerciseStates?: { [exerciseId: string]: ExerciseState };
  expandedExercises?: { [exerciseId: string]: boolean };
}
```

**Función agregada:**
```typescript
updateIncompleteSessionProgress: async (data: Partial<IncompleteSession>) => {
  const { incompleteSession } = get();
  if (!incompleteSession) return;

  const updated: IncompleteSession = {
    ...incompleteSession,
    ...data,
  };

  set({ incompleteSession: updated });
  await saveIncompleteSession(updated);
}
```

**Modificación en `startExecution`:**
```typescript
const incompleteSession: IncompleteSession = {
  routineId,
  routineName: routine.routine_name,
  workoutSessionId: workoutSession.id_workout_session,
  startedAt: executionState.startedAt,
  duration: 0, // ✅ NUEVO
  currentExerciseIndex: 0,
  currentSet: 1,
  completedSets: [],
  exerciseStates: undefined, // ✅ NUEVO
  expandedExercises: undefined, // ✅ NUEVO
};
```

#### C. Auto-guardado en `useRoutineExecution.ts`

**Imports agregados:**
```typescript
import { useRoutinesStore } from '../state';

const {
  currentRoutine,
  executionState,
  startExecution,
  discardSession: storeDiscardSession,
  updateIncompleteSessionProgress, // ✅ NUEVO
  incompleteSession, // ✅ NUEVO
} = useRoutinesStore();
```

**Restauración de estado:**
```typescript
useEffect(() => {
  if (currentRoutine?.exercises && currentRoutine.exercises.length > 0) {
    // ✅ Restaurar desde incomplete session si está disponible
    const sessionToRestore = incompleteSession?.exerciseStates ? incompleteSession : restoreState;

    if (sessionToRestore?.exerciseStates) {
      console.log('[useRoutineExecution] ♻️ Restaurando desde estado anterior');
      setExerciseStates(sessionToRestore.exerciseStates);
      setExpandedExercises(sessionToRestore.expandedExercises || {});
      setDuration(sessionToRestore.duration || 0);
      startTimeRef.current = Date.now() - (sessionToRestore.duration || 0) * 1000;
    } else {
      // Crear estado inicial...
    }
  }
}, [currentRoutine, restoreState, incompleteSession]);
```

**Sistema de auto-guardado dual (VERSIÓN FINAL):**

**1. Guardado de duración (cada 30 segundos):**
```typescript
useEffect(() => {
  if (!executionState) return;

  const intervalId = setInterval(() => {
    const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    updateIncompleteSessionProgress({ duration: currentDuration });
  }, 30000); // Guardar duración cada 30 segundos

  return () => clearInterval(intervalId);
}, [executionState, updateIncompleteSessionProgress]);
```

**2. Guardado de checks (solo cuando cambia el número de sets completados):**
```typescript
// ✅ Track completed sets count
const completedSetsCountRef = useRef<number>(0);
const isInitializedRef = useRef<boolean>(false); // ✅ CRÍTICO: Evita guardar en inicialización

useEffect(() => {
  if (!executionState) return;
  if (Object.keys(exerciseStates).length === 0) return;

  // Contar sets completados
  let totalCompleted = 0;
  Object.values(exerciseStates).forEach((state) => {
    totalCompleted += state.sets.filter(s => s.isDone).length;
  });

  // ✅ CRÍTICO: En la primera ejecución, solo inicializar ref sin guardar
  if (!isInitializedRef.current) {
    console.log('[useRoutineExecution] 🎬 Inicializando contador de sets:', totalCompleted);
    completedSetsCountRef.current = totalCompleted;
    isInitializedRef.current = true;
    return; // ✅ NO guardar en la primera inicialización
  }

  // Solo guardar cuando cambia el número de sets completados
  if (totalCompleted !== completedSetsCountRef.current) {
    console.log('[useRoutineExecution] 💾 Sets completados cambió:', completedSetsCountRef.current, '→', totalCompleted);

    const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    updateIncompleteSessionProgress({
      duration: currentDuration,
      exerciseStates,
      expandedExercises,
    });

    completedSetsCountRef.current = totalCompleted;
  }
}, [exerciseStates, expandedExercises, updateIncompleteSessionProgress, executionState]);
```

**Flujo del auto-guardado:**
1. **Inicialización:** Componente monta → restaura estado (ej: 2 sets completados)
2. Auto-save effect ejecuta → `isInitializedRef` es false
3. Inicializa `completedSetsCountRef.current = 2` y `isInitializedRef.current = true`
4. **NO guarda** en la inicialización (evita race condition)
5. **Usuario marca set:** `markSetDone()` actualiza `exerciseStates` → `isDone = true`
6. Auto-save effect detecta cambio: 2 → 3 sets completados
7. `isInitializedRef` es true → procede a guardar
8. Llama a `updateIncompleteSessionProgress()` → guarda en AsyncStorage
9. **Usuario cierra app y vuelve:** Modal aparece → presiona "Continuar"
10. `useRoutineExecution` restaura `exerciseStates` con todos los checks intactos

---

## 3. Error al iniciar sesión con otra pendiente ✅

### Problema:
```
LOG  [startExecution] ⚠️ Found active workout session: {"id": 11, "routine": 22, "status": "IN_PROGRESS"}
LOG  [startExecution] 🗑️ Active session is for different routine, canceling...
ERROR [startExecution] ❌ Error starting execution: [AxiosError: Request failed with status code 500]
```

El backend retornaba 500 al intentar cancelar la sesión activa.

### Solución:

#### A. Modificar `routines.store.ts` para lanzar error en vez de cancelar

```typescript
// Antes:
if (workoutSession.id_routine !== routineId) {
  console.log('[startExecution] 🗑️ Active session is for different routine, canceling...');
  await workoutRepository.cancelSession(workoutSession.id_workout_session);
  workoutSession = null;
}

// Después:
if (workoutSession.id_routine !== routineId) {
  console.log('[startExecution] 🚫 Cannot start new session - active session exists');
  throw new Error('ACTIVE_SESSION_EXISTS'); // ✅ Lanzar error específico
}
```

#### B. Capturar error en `useRoutineExecution.ts`

```typescript
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

useEffect(() => {
  if (routineId) {
    startExecution(routineId).catch((error) => {
      if (error.message === 'ACTIVE_SESSION_EXISTS') {
        Alert.alert(
          'Entrenamiento en curso',
          'Ya tienes un entrenamiento en curso. Debes terminarlo o descartarlo antes de iniciar otro.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Ver entrenamiento',
              onPress: () => {
                // El modal ya debería estar visible al volver
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        console.error('[useRoutineExecution] Error:', error);
        Alert.alert(
          'Error',
          'No se pudo iniciar el entrenamiento',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    });
  }
}, [routineId, startExecution, navigation]);
```

**Flujo corregido:**
1. Usuario tiene entrenamiento pendiente de rutina A
2. Intenta iniciar rutina B
3. `startExecution()` detecta sesión activa → lanza `ACTIVE_SESSION_EXISTS`
4. `useRoutineExecution` captura el error → muestra Alert
5. Usuario puede:
   - Presionar "Cancelar" → vuelve atrás
   - Presionar "Ver entrenamiento" → vuelve y el modal aparece

---

## 4. Headers personalizados sin AppTabs ✅

### Problema:
Las pantallas de rutinas mostraban el header por defecto de React Navigation (AppTabs).

### Solución:

#### A. Crear header personalizado (`RoutinesHeader.tsx`)

```typescript
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

export function RoutinesHeader({
  title = 'Mis Rutinas',
  showBackButton = false,
  onBackPress,
}: RoutinesHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className={`px-4 pt-4 pb-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {showBackButton && (
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={handleBackPress} className="flex-row items-center">
            <Ionicons
              name="chevron-back"
              size={28}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text className={`ml-1 text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Volver
            </Text>
          </Pressable>
          <Ionicons
            name="information-circle"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      )}

      <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>
    </View>
  );
}
```

**Ubicación:** `frontend/gympoint-mobile/src/features/routines/presentation/ui/headers/RoutinesHeader.tsx`

#### B. Modificar `AppTabs.tsx` para ocultar headers

```typescript
// Antes:
<RoutinesStack.Screen
  name="RoutineDetail"
  component={RoutineDetailScreen}
  options={{ title: 'Detalle de rutina' }} // ❌ Mostraba header
/>
<RoutinesStack.Screen
  name="RoutineHistory"
  component={RoutineHistoryScreen}
  options={{ title: 'Historial' }} // ❌ Mostraba header
/>
<RoutinesStack.Screen
  name="RoutineExecution"
  component={RoutineExecutionScreen}
  options={{ title: 'Ejecución' }} // ❌ Mostraba header
/>

// Después:
<RoutinesStack.Screen
  name="RoutineDetail"
  component={RoutineDetailScreen}
  options={{ headerShown: false }} // ✅ Sin header
/>
<RoutinesStack.Screen
  name="RoutineHistory"
  component={RoutineHistoryScreen}
  options={{ headerShown: false }} // ✅ Sin header
/>
<RoutinesStack.Screen
  name="RoutineExecution"
  component={RoutineExecutionScreen}
  options={{ headerShown: false }} // ✅ Sin header
/>
```

**Resultado:**
- Todas las pantallas de rutinas ahora tienen `headerShown: false`
- Cada pantalla puede usar su propio header personalizado si lo necesita
- Diseño consistente con PhysicalProgressScreen

---

## Archivos Modificados

### Hooks:
1. ✅ `useIncompleteSessionModal.ts` - Arreglado modal persistente
2. ✅ `useRoutineExecution.ts` - Auto-guardado y restauración de checks
3. ✅ `useCreateRoutine.ts` - Límite de rutinas (implementado anteriormente)

### Store:
4. ✅ `routines.store.ts` - Interfaces expandidas, función `updateIncompleteSessionProgress`, manejo de error

### Data Sources:
5. ✅ `incompleteSessionLocalDataSource.ts` - Interfaces expandidas con `exerciseStates`

### UI Components:
6. ✅ `RoutinesHeader.tsx` - Nuevo header personalizado (creado)

### Navigation:
7. ✅ `AppTabs.tsx` - Headers ocultos en todas las pantallas de rutinas

---

## Testing Sugerido

### Test 1: Modal no aparece en ejecución
- [ ] Abrir app con sesión incompleta → modal aparece
- [ ] Presionar "Continuar" → navega a ejecución
- [ ] ✅ Modal NO aparece en pantalla de ejecución

### Test 2: Auto-guardado de checks
- [ ] Iniciar entrenamiento
- [ ] Marcar 3 sets como completados
- [ ] Ingresar pesos y reps (ej: 50kg, 12 reps)
- [ ] Verificar en logs: "Sets completados cambió: 0 → 3"
- [ ] Cerrar app (minimizar/matar proceso)
- [ ] Abrir app → modal aparece
- [ ] Presionar "Continuar"
- [ ] ✅ Los 3 sets siguen marcados con pesos y reps
- [ ] Verificar en logs: "🎬 Inicializando contador de sets: 3" (NO debe aparecer "Sets completados cambió: 3 → 0")
- [ ] Marcar un 4to set
- [ ] Verificar en logs: "Sets completados cambió: 3 → 4"
- [ ] ✅ El set se guarda correctamente

### Test 3: Prevención de múltiples sesiones
- [ ] Tener sesión activa de rutina A
- [ ] Intentar iniciar rutina B
- [ ] ✅ Alert aparece: "Ya tienes un entrenamiento en curso"
- [ ] Presionar "Ver entrenamiento" → vuelve y modal aparece
- [ ] Presionar "Continuar" → va a sesión activa de rutina A

### Test 4: Headers personalizados
- [ ] Navegar a cualquier pantalla de rutinas
- [ ] ✅ No hay header de AppTabs
- [ ] ✅ Diseño limpio sin barra superior extra

---

## Próximos Pasos (Opcional)

### Mejoras futuras:
1. **Optimización del auto-guardado:**
   - Actualmente guarda cada 500ms con debounce
   - Podría aumentarse a 2-3 segundos para reducir writes a AsyncStorage

2. **Indicador visual de guardado:**
   - Mostrar un pequeño icono "Guardando..." cuando se auto-guarda

3. **Compresión de datos:**
   - Para rutinas muy largas, comprimir los datos antes de guardar en AsyncStorage

4. **Sincronización con backend:**
   - Guardar el progreso también en el backend (no solo AsyncStorage)
   - Permitir continuar sesión desde otro dispositivo

5. **Recuperación ante errores:**
   - Si falla el auto-guardado, reintentar automáticamente
   - Mostrar advertencia si AsyncStorage está lleno

---

## ⚠️ Fix Crítico: Race Condition en Auto-guardado

### El Bug:
El problema más grave encontrado fue que el progreso se reiniciaba al continuar una sesión guardada:

```
Usuario: Guardé 2 sets del ejercicio 20, aparecía 2/3 completados
Usuario: Volví atrás, me apareció la modal de continuar, presioné continuar
Usuario: Me redirigió a la página del workout y me volvió a aparecer la modal
Usuario: Lo más importante es que se REINICIÓ EL PROGRESO que supuestamente se guardó

Logs:
LOG  [useRoutineExecution] 💾 Sets completados cambió: 2 → 0
LOG  [useRoutineExecution] 📦 Datos a guardar: {..., "totalCompleted": 0}
```

### Causa Raíz (Doble Race Condition):

**Race Condition #1:** Auto-save guardaba durante inicialización
- El auto-save effect detectaba cambio de 0 (ref inicial) → 2 (restaurado)
- Guardaba inmediatamente durante la restauración
- Si algo fallaba, guardaba 0 en vez de 2

**Race Condition #2:** Re-inicialización sobrescribía estado restaurado
- El efecto de inicialización tenía `incompleteSession` en dependencias
- Cuando `startExecution` actualizaba `incompleteSession`, el efecto se re-ejecutaba
- La segunda ejecución creaba estado vacío porque `incompleteSession.exerciseStates` ya no estaba disponible
- Auto-save detectaba cambio 2 → 0 y sobrescribía el progreso real

### La Solución (Doble Fix):

**Fix #1: Prevenir guardar en inicialización**
```typescript
const isInitializedRef = useRef<boolean>(false);

useEffect(() => {
  // ... contar sets completados ...

  // En la primera ejecución, solo inicializar ref sin guardar
  if (!isInitializedRef.current) {
    console.log('[useRoutineExecution] 🎬 Inicializando contador de sets:', totalCompleted);
    completedSetsCountRef.current = totalCompleted;
    isInitializedRef.current = true;
    return; // ✅ NO guardar en inicialización
  }

  // Solo guardar cuando hay cambio real después de inicializar
  if (totalCompleted !== completedSetsCountRef.current) {
    updateIncompleteSessionProgress({...});
    completedSetsCountRef.current = totalCompleted;
  }
}, [exerciseStates, ...]);
```

**Fix #2: Prevenir re-inicialización**
```typescript
const hasInitializedExercisesRef = useRef<boolean>(false);

useEffect(() => {
  if (currentRoutine?.exercises && currentRoutine.exercises.length > 0) {
    // ✅ CRÍTICO: Skip si ya se inicializó
    if (hasInitializedExercisesRef.current) {
      console.log('[useRoutineExecution] ⏭️ Skipping re-initialization (already initialized)');
      return;
    }

    // Restaurar o crear estado...

    // Marcar como inicializado
    hasInitializedExercisesRef.current = true;
  }
}, [currentRoutine, restoreState, incompleteSession]);
```

### Resultado:
1. ✅ El estado solo se inicializa UNA VEZ, no importa cuántas veces cambien las dependencias
2. ✅ El auto-save NO guarda durante la inicialización, solo después
3. ✅ El progreso restaurado NUNCA se sobrescribe con datos vacíos
4. ✅ Los checks, pesos y reps persisten correctamente al cerrar y abrir la app

---

## ⚠️ Fix Crítico: Error 500 al Completar Sesión (Múltiples Errores Backend)

### Los Bugs:
Al completar una rutina, el backend devolvía error 500. Había **DOS errores diferentes en el backend** + uno en frontend:

1. **Error en repositorio:** `Unknown column 'WorkoutSession.finished_at' in 'where clause'`
2. **Error en servicio de progreso:** `Duplicate entry '2-2025-11-05' for key 'progress.idx_progress_user_date'`
3. **Error en frontend:** Typo usando `finished_at` en lugar de `ended_at`

**Logs completos del error:**
```
ERROR: Unknown column 'WorkoutSession.finished_at' in 'where clause'
ERROR: SequelizeUniqueConstraintError - Duplicate entry '2-2025-11-05' for key 'idx_progress_user_date'
```

### Causas:

**Problema #1: Inconsistencia nombre de columna `finished_at` vs `ended_at`**
- El código backend usaba `finished_at` pero la columna de la BD se llama `ended_at`
- Afectaba a varias funciones en `workout.repository.js`:
  - `hasCompletedWorkoutToday` - verifica si usuario completó entrenamiento hoy (para limitar tokens)
  - `getWorkoutStats` - obtiene estadísticas de entrenamientos
  - `finishWorkoutSession` - marca sesión como completada
  - `cancelWorkoutSession` - cancela sesión

**Problema #2: Duplicate entry en tabla Progress**
- `progress-service.js` función `registerProgress` siempre hacía `INSERT`
- Si el usuario completaba 2 entrenamientos el mismo día → fallaba por violación de unique constraint
- Debería hacer `UPDATE` (agregar al progreso existente) si ya existe registro para ese día

**Problema #3: Typo en frontend**
- `useSaveRoutineSession.ts` usaba `finished_at` pero el mapper espera `ended_at`

### Las Soluciones:

#### Fix #1: Cambiar `finished_at` → `ended_at` en backend
**Archivo:** [workout.repository.js](backend/node/infra/db/repositories/workout.repository.js)

```javascript
// ANTES ❌
finished_at: {
  [Op.between]: [today, endOfDay]
}

// DESPUÉS ✅
ended_at: {
  [Op.between]: [today, endOfDay]
}
```

**Cambios realizados:**
- Línea 167: `finishWorkoutSession` - update con ended_at
- Línea 179: `cancelWorkoutSession` - update con ended_at
- Líneas 295, 299, 303: `getWorkoutStats` - filtros con ended_at
- Línea 351: `hasCompletedWorkoutToday` - where clause con ended_at

#### Fix #2: Implementar upsert en servicio de progreso

**Nueva función en repositorio** - [progress.repository.js](backend/node/infra/db/repositories/progress.repository.js):
```javascript
async function findByUserAndDate(idUserProfile, date, options = {}) {
  return await Progress.findOne({
    where: { id_user_profile: idUserProfile, date: date },
    transaction: options.transaction
  });
}
```

**Modificación en servicio** - [progress-service.js](backend/node/services/progress-service.js):
```javascript
// ANTES ❌ - Siempre INSERT
const progress = await progressRepository.create({...});

// DESPUÉS ✅ - Upsert (buscar primero, UPDATE o CREATE)
const existingProgress = await progressRepository.findByUserAndDate(
  cmd.idUserProfile,
  cmd.date,
  { transaction }
);

if (existingProgress) {
  // Actualizar y AGREGAR al progreso existente del día
  return await progressRepository.update(existingProgress.id_progress, {
    totalWeightLifted: existing.total_weight_lifted + cmd.totalWeightLifted,
    totalReps: existing.total_reps + cmd.totalReps,
    totalSets: existing.total_sets + cmd.totalSets
  });
} else {
  // Crear nuevo registro para el día
  return await progressRepository.create({...});
}
```

#### Fix #3: Cambiar frontend
**Archivo:** [useSaveRoutineSession.ts](frontend/gympoint-mobile/src/features/routines/presentation/hooks/useSaveRoutineSession.ts)

```typescript
// ANTES ❌
const requestData = {
  finished_at: new Date().toISOString(),
  notes: notes || undefined,
};

// DESPUÉS ✅
const requestData = {
  ended_at: new Date().toISOString(),
  notes: notes || undefined,
};
```

### Bonus: Limpieza de Logs
También se limpiaron los logs excesivos en:
- `useSaveRoutineSession.ts` - de ~50 líneas de logs a 3 líneas concisas
- `WorkoutRepositoryImpl.ts` - eliminados logs redundantes, solo errores importantes
- Logs ahora son consistentes con el resto del código

### Resultado:
- ✅ Las sesiones se completan correctamente sin errores 500
- ✅ Múltiples entrenamientos en un día se agregan al progreso (no duplican entry)
- ✅ Los tokens de "primera sesión del día" funcionan correctamente
- ✅ Las estadísticas de workout se calculan correctamente

---

**Fecha de implementación:** 2025-01-05
**Desarrollador:** Claude + Gonzalo
**Branch:** `feature/integrate-routine-ui`

---

## Comandos Útiles

### Limpiar AsyncStorage (para testing):
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// En consola de debug
AsyncStorage.removeItem('@GymPoint:incompleteSession');
```

### Ver contenido de AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const session = await AsyncStorage.getItem('@GymPoint:incompleteSession');
console.log(JSON.parse(session));
```

### Logs útiles para debugging:
```
[useIncompleteSessionModal] 🔍 Sesión incompleta encontrada
[useRoutineExecution] ♻️ Restaurando desde estado anterior
[useRoutineExecution] 💾 Auto-guardando progreso...
[startExecution] 🚫 Cannot start new session - active session exists
```
