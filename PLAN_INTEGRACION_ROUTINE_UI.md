# 📋 PLAN DE INTEGRACIÓN: Routine Execution Redesign UI → Rama Gonzalo

**Fecha:** 2025-01-03
**Objetivo:** Integrar la UI rediseñada de `origin/feature/routine-execution-redesign` en la rama `gonzalo` sin romper funcionalidad existente, adaptándola a los datos y APIs actuales.

---

## 🎯 ESTRATEGIA GENERAL

### Principios:
1. **NO TOCAR** domain/data/repositories/mappers existentes (están funcionando con backend real)
2. **REEMPLAZAR** presentation/ui completa (componentes, screens, layouts)
3. **ADAPTAR** hooks para usar repositories existentes
4. **ACTUALIZAR** navegación y tipos
5. **AGREGAR** componentes compartidos necesarios

### Enfoque:
**CHERRY-PICK SELECTIVO** - Solo traer archivos de UI, adaptar lógica

---

## 📊 ANÁLISIS DE DIFERENCIAS CRÍTICAS

### ✅ MANTENER (Rama gonzalo - Backend Real):

**Domain Layer:**
- ✅ `entities/Routine.ts` - Estructura real del backend
- ✅ `entities/UserRoutine.ts` - Relación usuario-rutina real
- ✅ `repositories/RoutineRepository.ts` - 8 métodos conectados a API
- ✅ `repositories/UserRoutineRepository.ts` - 5 métodos conectados a API

**Data Layer:**
- ✅ `dto/` - Todos los DTOs alineados con OpenAPI
- ✅ `mappers/` - Mappers funcionando con backend
- ✅ `remote/` - APIs conectadas a endpoints reales
- ✅ `RoutineRepositoryImpl.ts` - Implementación funcionando
- ✅ `UserRoutineRepositoryImpl.ts` - Implementación funcionando

### 🔄 REEMPLAZAR (Rama feature - UI Mejorada):

**Presentation Layer:**
- 🔄 `ui/screens/` - TODAS las screens (6 archivos)
- 🔄 `ui/components/` - TODOS los componentes (~35 archivos)
- 🔄 `ui/layouts/` - TODOS los layouts (4 archivos)
- 🔄 `ui/headers/` - TODOS los headers (3 archivos)
- 🔄 `ui/footers/` - TODOS los footers (2 archivos)
- 🔄 `ui/lists/` - TODOS los lists (2 archivos)
- 🔄 `ui/styles/` - TODOS los estilos (1 archivo)

### ⚠️ ADAPTAR (Requiere modificación):

**Hooks:**
- ⚠️ `useRoutine.ts` - Adaptar para usar `routineRepository.getMyRoutines()`
- ⚠️ `useRoutineById.ts` - Adaptar para usar `routineRepository.getById()`
- ⚠️ `useRoutineExecution.ts` - **CREAR NUEVO** (no existe en gonzalo)
- ⚠️ `useRoutineHistory.ts` - **CREAR NUEVO** (basado en sessions reales)
- ⚠️ `useCreateRoutine.ts` - Adaptar para usar `routineRepository.create()`
- ⚠️ Otros hooks nuevos de feature

**Store:**
- ⚠️ `routines.store.ts` - Fusionar ambos, usar repositories reales

**Entities Adicionales:**
- ⚠️ `Exercise.ts` - **DEPRECAR** (usar RoutineExercise del backend)
- ⚠️ `PredesignedRoutine.ts` - **MANTENER** (para importación)
- ⚠️ `RoutineHistory.ts` - **ADAPTAR** a estructura de sessions reales

### ➕ AGREGAR (No existe en gonzalo):

**Shared Components (~30 archivos):**
- ➕ `shared/components/ui/Button.tsx`
- ➕ `shared/components/ui/Card.tsx`
- ➕ `shared/components/ui/Input.tsx`
- ➕ `shared/components/ui/SetPill.tsx`
- ➕ `shared/components/ui/StatusPill.tsx`
- ➕ `shared/components/ui/MetaChip.tsx`
- ➕ `shared/components/ui/FloatingActionBar.tsx`
- ➕ Y ~23 componentes más...

**Datasources:**
- ➕ `data/datasources/incompleteSessionLocalDataSource.ts`

**Navegación:**
- ➕ Actualizar tipos de navegación
- ➕ Agregar screen `RoutineCompleted`
- ➕ Agregar wrapper `RoutinesScreenWrapper`

---

## 🔧 PROBLEMAS A RESOLVER

### 1. **Inconsistencia de IDs:** ✅ SOLUCIONADO
- **Gonzalo:** Usa `number` (id_routine, id_exercise) internamente
- **Feature:** Usa `string` (id en navegación)
- **Solución:** **Usar `string` en navegación (estándar React Navigation), convertir a `number` en screens**
  - ✅ Mejor para deep linking y URLs
  - ✅ Más flexible para UUIDs futuros
  - ✅ Estándar de la industria
  - **Patrón:** `string` en params → `parseInt()` en screen → `number` en hooks/backend

### 2. **Use Cases Rotos:**
- **Problema:** Use cases en gonzalo usan métodos inexistentes (`getAll()`, `getHistory()`, `saveSession()`)
- **Solución:** Eliminar use cases y usar repositories directamente en store/hooks

### 3. **Estructura de Exercise:**
- **Gonzalo:** `RoutineExercise` (del backend)
- **Feature:** `Exercise` (mock/legacy)
- **Solución:** Adaptar componentes UI para usar `RoutineExercise`

### 4. **RoutineHistory vs Sessions:**
- **Gonzalo:** NO tiene endpoints de historial implementados
- **Feature:** Usa `RoutineSession` con mock
- **Solución:** Mantener mock temporalmente hasta implementar backend

### 5. **PredesignedRoutines (Importación):**
- **Gonzalo:** Usa `routineRepository.getTemplates()` (backend real)
- **Feature:** Usa mock `TEMPLATE_ROUTINES` y `GYM_ROUTINES`
- **Solución:** Conectar a `getTemplates()` para plantillas, mantener mock para gimnasios

---

## 📝 PLAN DE EJECUCIÓN (11 FASES)

### **FASE 1: Preparación** ⏱️ 10 min

```bash
# Crear rama de integración desde gonzalo
git checkout gonzalo
git checkout -b feature/integrate-routine-ui

# Hacer backup
git tag backup-before-routine-ui-integration
```

**Archivos a crear:**
- `INTEGRATION_LOG.md` - Log de cambios durante integración
- `MIGRATION_NOTES.md` - Notas de adaptación

---

### **FASE 2: Agregar Componentes Compartidos** ⏱️ 30 min

**Objetivo:** Traer todos los componentes UI reutilizables

**Pasos:**
1. Cherry-pick componentes desde feature:
   ```bash
   git checkout origin/feature/routine-execution-redesign -- \
     frontend/gympoint-mobile/src/shared/components/ui/Button.tsx \
     frontend/gympoint-mobile/src/shared/components/ui/Card.tsx \
     frontend/gympoint-mobile/src/shared/components/ui/Input.tsx \
     frontend/gympoint-mobile/src/shared/components/ui/SetPill.tsx \
     frontend/gympoint-mobile/src/shared/components/ui/StatusPill.tsx \
     frontend/gympoint-mobile/src/shared/components/ui/MetaChip.tsx \
     # ... (todos los ~30 componentes)
   ```

2. Crear/actualizar barrel exports:
   ```typescript
   // shared/components/ui/index.ts
   export * from './Button';
   export * from './Card';
   // ... etc
   ```

3. Verificar imports y dependencias

**Validación:**
- [ ] Todos los componentes compilan sin errores
- [ ] Index.ts exporta correctamente
- [ ] No hay imports rotos

---

### **FASE 3: Actualizar Tema y Estilos** ⏱️ 15 min

**Objetivo:** Traer sistema de tema y tokens

**Pasos:**
1. Cherry-pick archivos de tema:
   ```bash
   git checkout origin/feature/routine-execution-redesign -- \
     frontend/gympoint-mobile/src/presentation/theme/theme.ts \
     frontend/gympoint-mobile/src/shared/styles/uiTokens.ts
   ```

2. Actualizar hook `useTheme` si es necesario

3. Verificar integración con componentes existentes

**Validación:**
- [ ] Tema compila correctamente
- [ ] useTheme funciona en componentes nuevos y viejos
- [ ] Colores y spacing consistentes

---

### **FASE 4: Traer UI de Routines (Estructura)** ⏱️ 20 min

**Objetivo:** Copiar estructura de carpetas UI

**Pasos:**
1. Cherry-pick estructura completa:
   ```bash
   git checkout origin/feature/routine-execution-redesign -- \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/screens/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/components/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/layouts/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/headers/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/footers/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/lists/ \
     frontend/gympoint-mobile/src/features/routines/presentation/ui/styles/
   ```

2. **NO compilará todavía** - esperado, faltan adaptar hooks

**Archivos traídos:**
- 6 screens
- ~35 componentes
- 4 layouts
- 3 headers
- 2 footers
- 2 lists
- 1 styles

---

### **FASE 5: Adaptar Entities** ⏱️ 30 min

**Objetivo:** Preparar entities para la nueva UI

**Pasos:**

1. **Mantener entities de gonzalo:**
   - ✅ `Routine.ts` (ya es correcto)
   - ✅ `UserRoutine.ts` (ya es correcto)

2. **Agregar entities de feature:**
   ```bash
   git checkout origin/feature/routine-execution-redesign -- \
     frontend/gympoint-mobile/src/features/routines/domain/entities/PredesignedRoutine.ts \
     frontend/gympoint-mobile/src/features/routines/domain/entities/RoutineHistory.ts
   ```

3. **Deprecar Exercise.ts:**
   ```typescript
   // entities/Exercise.ts
   /** @deprecated Use RoutineExercise from Routine.ts instead */
   export interface Exercise {
     // ... mantener para compatibilidad temporal
   }
   ```

4. **Crear adapter Exercise → RoutineExercise:**
   ```typescript
   // utils/exerciseAdapter.ts
   export function legacyExerciseToRoutineExercise(
     exercise: Exercise
   ): RoutineExercise {
     return {
       id_exercise: parseInt(exercise.id),
       exercise_name: exercise.name,
       series: typeof exercise.sets === 'number' ? exercise.sets : 3,
       reps: exercise.reps,
       // ...
     };
   }
   ```

**Validación:**
- [ ] Entities compilan
- [ ] No hay conflictos de tipos
- [ ] Adapter funciona correctamente

---

### **FASE 6: Actualizar Datasources** ⏱️ 20 min

**Objetivo:** Agregar datasource de sesión incompleta

**Pasos:**
1. Cherry-pick:
   ```bash
   git checkout origin/feature/routine-execution-redesign -- \
     frontend/gympoint-mobile/src/features/routines/data/datasources/incompleteSessionLocalDataSource.ts
   ```

2. Actualizar index de datasources

3. **MANTENER** mocks existentes de gonzalo

**Validación:**
- [ ] Datasource compila
- [ ] LocalStorage funciona
- [ ] No interfiere con otros datasources

---

### **FASE 7: Fusionar Store de Zustand** ⏱️ 45 min

**Objetivo:** Crear store unificado que use repositories reales

**Estrategia:** Combinar lo mejor de ambos

**Archivo:** `presentation/state/routines.store.ts`

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Routine, RoutineExercise, UserRoutine } from '../../domain/entities';
import { routineRepository } from '../../data/RoutineRepositoryImpl';
import { userRoutineRepository } from '../../data/UserRoutineRepositoryImpl';
import { incompleteSessionStorage } from '../../data/datasources/incompleteSessionLocalDataSource';

interface RoutinesState {
  // De gonzalo (conectado a backend)
  routines: Routine[];
  loading: boolean;
  error: string | null;

  // De feature (UI state)
  search: string;
  statusFilter: 'All' | 'Active' | 'Scheduled' | 'Completed';

  // Nuevo (para ejecución)
  activeRoutine: UserRoutine | null;
  executionState: ExecutionState | null;
  incompleteSession: IncompleteSession | null;

  // Actions - Usar repositories reales
  fetchMyRoutines: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchRoutineById: (id: number) => Promise<Routine>;
  fetchActiveRoutine: () => Promise<void>;

  // Execution actions
  startExecution: (routineId: number) => Promise<void>;
  completeSet: (exerciseId: number, setNumber: number) => void;
  saveSession: () => Promise<void>;
  discardSession: () => Promise<void>;

  // Filters
  setSearch: (search: string) => void;
  setStatusFilter: (status: 'All' | ...) => void;
}

export const useRoutinesStore = create<RoutinesState>()(
  immer((set, get) => ({
    // Initial state
    routines: [],
    loading: false,
    error: null,
    search: '',
    statusFilter: 'All',
    activeRoutine: null,
    executionState: null,
    incompleteSession: null,

    // Implementaciones usando repositories reales
    fetchMyRoutines: async () => {
      set({ loading: true, error: null });
      try {
        const routines = await routineRepository.getMyRoutines();
        set({ routines, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    fetchRoutineById: async (id: number) => {
      try {
        return await routineRepository.getById(id);
      } catch (error) {
        throw error;
      }
    },

    // ... resto de implementaciones
  }))
);
```

**Validación:**
- [ ] Store compila
- [ ] Usa routineRepository correctamente
- [ ] Usa userRoutineRepository correctamente
- [ ] Gestiona sesión incompleta

---

### **FASE 8: Adaptar Hooks** ⏱️ 60 min

**Objetivo:** Actualizar hooks para usar store y repositories reales

#### 8.1 **useRoutine.ts** (Actualizar)

```typescript
// hooks/useRoutine.ts
import { useEffect } from 'react';
import { useRoutinesStore } from '../state/routines.store';

export function useRoutines() {
  const {
    routines,
    loading,
    error,
    search,
    statusFilter,
    fetchMyRoutines,
    setSearch,
    setStatusFilter,
  } = useRoutinesStore();

  useEffect(() => {
    fetchMyRoutines();
  }, [fetchMyRoutines]);

  // Computed: filtrar rutinas
  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch = routine.routine_name
      .toLowerCase()
      .includes(search.toLowerCase());

    // TODO: Implementar filtro por status cuando backend lo soporte
    const matchesStatus = statusFilter === 'All' ? true : true;

    return matchesSearch && matchesStatus;
  });

  return {
    state: {
      list: filteredRoutines,
      loading,
      error: error !== null,
      search,
      status: statusFilter,
    },
    setSearch,
    setStatus: setStatusFilter,
  };
}
```

#### 8.2 **useRoutineById.ts** (Actualizar)

```typescript
// hooks/useRoutineById.ts
import { useState, useEffect } from 'react';
import { Routine } from '../../domain/entities';
import { useRoutinesStore } from '../state/routines.store';

export function useRoutineById(id?: number) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchRoutineById } = useRoutinesStore();

  useEffect(() => {
    if (!id) return;

    const loadRoutine = async () => {
      setLoading(true);
      try {
        const data = await fetchRoutineById(id); // recibe number
        setRoutine(data);
      } catch (error) {
        console.error('Error loading routine:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [id, fetchRoutineById]);

  return { routine, loading };
}
```

#### 8.3 **useRoutineExecution.ts** (CREAR NUEVO)

```typescript
// hooks/useRoutineExecution.ts
import { useState, useEffect, useCallback } from 'react';
import { useRoutinesStore } from '../state/routines.store';
import { RoutineExercise } from '../../domain/entities';

interface UseRoutineExecutionOptions {
  id: number; // recibe number (ya convertido en screen)
  onComplete?: () => void;
}

export function useRoutineExecution({ id, onComplete }: UseRoutineExecutionOptions) {
  const {
    activeRoutine,
    executionState,
    startExecution,
    completeSet,
    saveSession,
  } = useRoutinesStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    startExecution(id); // recibe number
  }, [id, startExecution]);

  const exercises = activeRoutine?.routine?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];

  const goToNext = useCallback(() => {
    if (currentSet < (currentExercise?.series || 3)) {
      setCurrentSet(prev => prev + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      // Última serie del último ejercicio
      onComplete?.();
    }
  }, [currentSet, currentExercise, currentExerciseIndex, exercises.length, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentSet > 1) {
      setCurrentSet(prev => prev - 1);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      const prevExercise = exercises[currentExerciseIndex - 1];
      setCurrentSet(prevExercise?.series || 3);
    }
  }, [currentSet, currentExerciseIndex, exercises]);

  const completeCurrentSet = useCallback(() => {
    if (currentExercise) {
      completeSet(currentExercise.id_exercise, currentSet);
      goToNext();
    }
  }, [currentExercise, currentSet, completeSet, goToNext]);

  return {
    routineName: activeRoutine?.routine?.routine_name || '',
    currentExercise,
    exerciseIndex: currentExerciseIndex,
    totalExercises: exercises.length,
    currentSet,
    totalSets: currentExercise?.series || 3,
    progressPct: ((currentExerciseIndex + currentSet / (currentExercise?.series || 3)) / exercises.length) * 100,
    goToNext,
    goToPrevious,
    completeSet: completeCurrentSet,
    saveSession,
  };
}
```

#### 8.4 **useRoutineHistory.ts** (CREAR NUEVO - Mock temporal)

```typescript
// hooks/useRoutineHistory.ts
import { useState, useEffect } from 'react';
import { RoutineSession } from '../../domain/entities/RoutineHistory';
import { mockRoutineHistory } from '../../data/datasources/routine-history.mock';

export function useRoutineHistory(routineId?: number) {
  const [items, setItems] = useState<RoutineSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routineId) return;

    // TODO: Conectar con backend cuando esté disponible
    // Por ahora usar mock
    setLoading(true);
    setTimeout(() => {
      const filtered = mockRoutineHistory.filter(
        session => session.routineId === routineId.toString() // mock usa string
      );
      setItems(filtered);
      setLoading(false);
    }, 500);
  }, [routineId]);

  return { items, loading };
}
```

#### 8.5 **useCreateRoutine.ts** (Actualizar)

```typescript
// hooks/useCreateRoutine.ts
import { useState, useCallback } from 'react';
import { CreateRoutineRequest } from '../../domain/entities';
import { routineRepository } from '../../data/RoutineRepositoryImpl';
import { useNavigation } from '@react-navigation/native';

export function useCreateRoutine() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [basicInfo, setBasicInfo] = useState({
    routine_name: '',
    description: '',
    muscleGroups: [] as string[],
  });
  const [exercises, setExercises] = useState([]);

  const handleNext = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      const request: CreateRoutineRequest = {
        routine_name: basicInfo.routine_name,
        description: basicInfo.description,
        exercises: exercises.map((ex, index) => ({
          id_exercise: ex.id_exercise,
          series: ex.series,
          reps: ex.reps,
          order: index + 1,
        })),
      };

      await routineRepository.create(request);

      // Navegar de vuelta a lista
      navigation.navigate('RoutinesList');
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  }, [basicInfo, exercises, navigation]);

  return {
    currentStep,
    basicInfo,
    setBasicInfo,
    exercises,
    setExercises,
    isStepValid: true, // TODO: Implementar validación
    handleNext,
    handleBack,
    handleSubmit,
  };
}
```

**Validación:**
- [ ] Todos los hooks compilan
- [ ] useRoutine carga rutinas del backend
- [ ] useRoutineById funciona con IDs numéricos
- [ ] useRoutineExecution gestiona estado correctamente
- [ ] useCreateRoutine crea rutinas en backend

---

### **FASE 9: Actualizar Navegación** ⏱️ 30 min

**Objetivo:** Integrar nueva navegación en AppTabs

**Pasos:**

1. **Actualizar tipos** (`navigation/types.ts`):
   ```typescript
   export type RoutinesStackParamList = {
     RoutinesList: undefined;
     CreateRoutine: undefined;
     ImportRoutine: undefined;
     RoutineDetail: { id: string }; // string (estándar React Navigation)
     RoutineHistory: { id: string };
     RoutineExecution: { id: string };
     RoutineCompleted: { routineId: string; sessionId: string }; // NUEVO
   };
   ```

2. **Actualizar AppTabs.tsx**:
   ```typescript
   // Importar screens nuevas
   import {
     RoutinesScreen,
     RoutinesScreenWrapper, // NUEVO - con modal de sesión incompleta
     RoutineDetailScreen,
     RoutineExecutionScreen,
     RoutineHistoryScreen,
     CreateRoutineScreen,
     ImportRoutineScreen,
     RoutineCompletedScreen, // NUEVO
   } from '@features/routines';

   function RoutinesStackNavigator() {
     return (
       <Stack.Navigator>
         <Stack.Screen
           name="RoutinesList"
           component={RoutinesScreenWrapper} // Usar wrapper
           options={{ headerShown: false }}
         />
         <Stack.Screen
           name="CreateRoutine"
           component={CreateRoutineScreen}
           options={{ headerShown: false }}
         />
         <Stack.Screen
           name="ImportRoutine"
           component={ImportRoutineScreen}
           options={{ headerShown: false }}
         />
         <Stack.Screen
           name="RoutineDetail"
           component={RoutineDetailScreen}
           options={{ title: 'Detalle de rutina' }}
         />
         <Stack.Screen
           name="RoutineHistory"
           component={RoutineHistoryScreen}
           options={{ title: 'Historial' }}
         />
         <Stack.Screen
           name="RoutineExecution"
           component={RoutineExecutionScreen}
           options={{ title: 'Ejecución' }}
         />
         <Stack.Screen
           name="RoutineCompleted"
           component={RoutineCompletedScreen}
           options={{ headerShown: false }}
         />
       </Stack.Navigator>
     );
   }
   ```

**Validación:**
- [ ] Navegación compila
- [ ] Tipos de params correctos
- [ ] RoutinesScreenWrapper muestra modal de sesión incompleta
- [ ] Todas las screens navegan correctamente

---

### **FASE 10: Adaptar Screens a Backend Real** ⏱️ 90 min

**Objetivo:** Ajustar screens para usar tipos y datos reales

#### 10.1 **RoutinesScreen.tsx**

**Cambios necesarios:**
1. Usar `useRoutines()` hook actualizado
2. Adaptar `RoutineCard` para recibir `Routine` (backend)
3. Ajustar navegación con `id.toString()`

```typescript
// screens/RoutinesScreen.tsx
import { useRoutines } from '../../hooks/useRoutine';

export function RoutinesScreen() {
  const { state, setSearch, setStatus } = useRoutines();

  const handleRoutinePress = (routine: Routine) => {
    navigation.navigate('RoutineDetail', {
      id: routine.id_routine.toString(), // convertir a string para navegación
    });
  };

  return (
    <RoutinesLayout>
      <RoutinesHeader
        search={state.search}
        onSearchChange={setSearch}
        status={state.status}
        onStatusChange={setStatus}
      />
      <RoutinesList
        routines={state.list}
        onRoutinePress={handleRoutinePress}
        loading={state.loading}
      />
      <FloatingActions
        onCreatePress={() => navigation.navigate('CreateRoutine')}
        onImportPress={() => navigation.navigate('ImportRoutine')}
      />
    </RoutinesLayout>
  );
}
```

#### 10.2 **RoutineCard.tsx**

**Cambios necesarios:**
1. Recibir prop `routine: Routine` (del backend)
2. Adaptar campos: `routine.routine_name`, `routine.description`
3. Extraer ejercicios de `routine.exercises`
4. Calcular duración estimada
5. Determinar dificultad (si no está en backend, usar default)

```typescript
// components/RoutineCard.tsx
import { Routine } from '../../../domain/entities';

interface RoutineCardProps {
  routine: Routine;
  onPress: () => void;
}

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  // Adaptar datos del backend
  const exerciseCount = routine.exercises?.length || 0;
  const muscleGroups = [
    ...new Set(
      routine.exercises?.map(ex => ex.muscular_group) || []
    )
  ];

  // Estimar duración (3 min por serie)
  const totalSets = routine.exercises?.reduce(
    (sum, ex) => sum + (ex.series || 3),
    0
  ) || 0;
  const estimatedMinutes = totalSets * 3;

  // Mock status (TODO: obtener de backend cuando esté disponible)
  const status = 'Active';

  return (
    <Card onPress={onPress}>
      <StatusPill status={status} />
      <Text>{routine.routine_name}</Text>
      <Text>{routine.description || 'Sin descripción'}</Text>
      <View>
        <Text>{exerciseCount} ejercicios</Text>
        <Text>~{estimatedMinutes} min</Text>
      </View>
      <View>
        {muscleGroups.map(group => (
          <MetaChip key={group} label={group} />
        ))}
      </View>
    </Card>
  );
}
```

#### 10.3 **RoutineDetailScreen.tsx**

**Cambios necesarios:**
1. Recibir `id` de params como `string`, convertir a `number`
2. Usar `useRoutineById(id)` actualizado
3. Pasar `routine.exercises` (RoutineExercise[]) a ExerciseList
4. Adaptar botón "Iniciar" para usar userRoutineRepository

```typescript
// screens/RoutineDetailScreen.tsx
import { useRoutineById } from '../../hooks/useRoutineById';
import { userRoutineRepository } from '../../../data/UserRoutineRepositoryImpl';

export function RoutineDetailScreen({ route, navigation }) {
  const { id } = route.params; // string desde navegación
  const routineId = parseInt(id, 10); // convertir a number
  const { routine, loading } = useRoutineById(routineId);

  const handleStartRoutine = async () => {
    if (!routine) return;

    try {
      // Asignar rutina al usuario (si no está asignada)
      await userRoutineRepository.assignRoutine({
        id_routine: routine.id_routine,
        start_date: new Date().toISOString(),
      });

      // Navegar a ejecución
      navigation.navigate('RoutineExecution', {
        id: routine.id_routine.toString(), // convertir a string
      });
    } catch (error) {
      console.error('Error starting routine:', error);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('RoutineHistory', {
      id: routine.id_routine.toString(), // convertir a string
    });
  };

  if (loading) return <LoadingView />;
  if (!routine) return <ErrorView />;

  return (
    <RoutineDetailLayout>
      <RoutineDetailHeader routine={routine} />
      <ExerciseList exercises={routine.exercises || []} />
      <RoutineDetailFooter
        onStartPress={handleStartRoutine}
        onHistoryPress={handleViewHistory}
      />
    </RoutineDetailLayout>
  );
}
```

#### 10.4 **ExerciseList.tsx**

**Cambios necesarios:**
1. Recibir `exercises: RoutineExercise[]`
2. Adaptar ExpandableExerciseCard para RoutineExercise

```typescript
// lists/ExerciseList.tsx
import { RoutineExercise } from '../../../domain/entities';

interface ExerciseListProps {
  exercises: RoutineExercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <View>
      {exercises.map((exercise, index) => (
        <ExpandableExerciseCard
          key={exercise.id_exercise}
          exercise={exercise}
          index={index}
        />
      ))}
    </View>
  );
}
```

#### 10.5 **ExpandableExerciseCard.tsx**

**Cambios necesarios:**
1. Recibir `exercise: RoutineExercise`
2. Adaptar campos:
   - `exercise.exercise_name`
   - `exercise.series`
   - `exercise.reps`
   - `exercise.muscular_group`

```typescript
// components/ExpandableExerciseCard.tsx
import { RoutineExercise } from '../../../domain/entities';

interface Props {
  exercise: RoutineExercise;
  index: number;
}

export function ExpandableExerciseCard({ exercise, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card onPress={() => setExpanded(!expanded)}>
      <View>
        <Text>{index + 1}. {exercise.exercise_name}</Text>
        <Text>{exercise.series} series x {exercise.reps} reps</Text>
        <MetaChip label={exercise.muscular_group} />
      </View>
      {expanded && (
        <View>
          <Text>{exercise.description || 'Sin descripción'}</Text>
          {exercise.instructions && (
            <Text>{exercise.instructions}</Text>
          )}
          {exercise.video_url && (
            <Button onPress={() => openVideo(exercise.video_url)}>
              Ver video
            </Button>
          )}
        </View>
      )}
    </Card>
  );
}
```

#### 10.6 **RoutineExecutionScreen.tsx**

**Cambios necesarios:**
1. Recibir `id` como `string`, convertir a `number`
2. Usar `useRoutineExecution` hook nuevo
3. Adaptar para `RoutineExercise`

```typescript
// screens/RoutineExecutionScreen.tsx
import { useRoutineExecution } from '../../hooks/useRoutineExecution';

export function RoutineExecutionScreen({ route, navigation }) {
  const { id } = route.params; // string desde navegación
  const routineId = parseInt(id, 10); // convertir a number

  const {
    routineName,
    currentExercise,
    exerciseIndex,
    totalExercises,
    currentSet,
    totalSets,
    progressPct,
    goToNext,
    goToPrevious,
    completeSet,
    saveSession,
  } = useRoutineExecution({
    id: routineId, // pasar number al hook
    onComplete: () => {
      navigation.navigate('RoutineCompleted', {
        routineId: id, // mantener string para navegación
        sessionId: 'temp-id', // TODO: obtener del store
      });
    },
  });

  const handleDiscard = async () => {
    // Mostrar confirmación
    Alert.alert(
      'Descartar entrenamiento',
      '¿Estás seguro? Se perderá el progreso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            // Limpiar sesión incompleta
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    await saveSession();
    navigation.navigate('RoutineCompleted', {
      routineId: id, // mantener string para navegación
      sessionId: 'temp-id',
    });
  };

  return (
    <ExecutionLayout>
      <ExecutionHeader
        routineName={routineName}
        progress={progressPct}
      />
      <ExerciseCard
        exercise={currentExercise}
        currentSet={currentSet}
        totalSets={totalSets}
      />
      <ExecutionFooter
        onPrevious={goToPrevious}
        onNext={completeSet}
        onDiscard={handleDiscard}
        onComplete={handleComplete}
      />
    </ExecutionLayout>
  );
}
```

#### 10.7 **ImportRoutineScreen.tsx**

**Cambios necesarios:**
1. Usar `routineRepository.getTemplates()` para tab "Plantillas"
2. Mantener mock para tab "Gimnasios" (hasta que backend lo soporte)
3. Implementar importación con `routineRepository.clone(id)`

```typescript
// screens/ImportRoutineScreen.tsx
import { useState, useEffect } from 'react';
import { routineRepository } from '../../../data/RoutineRepositoryImpl';
import { Routine } from '../../../domain/entities';
import { GYM_ROUTINES } from '../../../data/predesignedRoutines.mock';

export function ImportRoutineScreen({ navigation }) {
  const [tab, setTab] = useState<'templates' | 'gyms'>('templates');
  const [templates, setTemplates] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'templates') {
      loadTemplates();
    }
  }, [tab]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await routineRepository.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (routine: Routine) => {
    try {
      // Clonar rutina template
      await routineRepository.clone(routine.id_routine);

      // Volver a lista
      navigation.navigate('RoutinesList');
    } catch (error) {
      console.error('Error importing routine:', error);
    }
  };

  const routinesToShow = tab === 'templates' ? templates : GYM_ROUTINES;

  return (
    <Screen>
      <ScreenHeader title="Importar rutina" />
      <ImportTabHeader
        activeTab={tab}
        onTabChange={setTab}
      />
      <ImportRoutineList
        routines={routinesToShow}
        onImport={handleImport}
        loading={loading}
      />
    </Screen>
  );
}
```

**Validación:**
- [ ] RoutinesScreen carga rutinas del backend
- [ ] RoutineCard muestra datos correctos
- [ ] RoutineDetailScreen muestra ejercicios correctos
- [ ] RoutineExecutionScreen funciona con backend
- [ ] ImportRoutineScreen importa templates reales
- [ ] Navegación funciona end-to-end

---

### **FASE 11: Testing y Validación** ⏱️ 60 min

**Objetivo:** Verificar que todo funciona

**Checklist de Testing:**

#### Tests Funcionales:
- [ ] **Lista de Rutinas:**
  - [ ] Carga rutinas del usuario (`getMyRoutines`)
  - [ ] Búsqueda funciona
  - [ ] Filtros funcionan (aunque status sea mock)
  - [ ] Cards muestran datos correctos
  - [ ] Navegación a detalle funciona

- [ ] **Detalle de Rutina:**
  - [ ] Carga rutina por ID
  - [ ] Muestra ejercicios correctamente
  - [ ] Botón "Iniciar" asigna rutina y navega
  - [ ] Botón "Historial" navega (aunque sea mock)

- [ ] **Ejecución:**
  - [ ] Carga rutina activa
  - [ ] Muestra ejercicio actual
  - [ ] Navegación prev/next funciona
  - [ ] Completar set actualiza estado
  - [ ] Timer de descanso funciona
  - [ ] Guardar sesión funciona
  - [ ] Descartar sesión funciona

- [ ] **Crear Rutina:**
  - [ ] Wizard de 3 pasos funciona
  - [ ] Validación funciona
  - [ ] Submit crea rutina en backend
  - [ ] Navega de vuelta a lista

- [ ] **Importar Rutina:**
  - [ ] Carga templates del backend
  - [ ] Tab gimnasios muestra mock
  - [ ] Importar clona rutina
  - [ ] Navega de vuelta a lista

- [ ] **Sesión Incompleta:**
  - [ ] Modal aparece si hay sesión guardada
  - [ ] "Continuar" restaura estado
  - [ ] "Descartar" limpia sesión

#### Tests de Integración:
- [ ] Backend real responde correctamente
- [ ] Mappers convierten datos correctamente
- [ ] Store gestiona estado correctamente
- [ ] Navegación end-to-end funciona

#### Tests de UI:
- [ ] Componentes renderizan correctamente
- [ ] Dark mode funciona
- [ ] Animaciones funcionan
- [ ] Loading states se muestran
- [ ] Error states se muestran

---

## 📋 CHECKLIST FINAL

### Pre-Integration:
- [ ] Backup creado (git tag)
- [ ] Rama de integración creada
- [ ] Logs de integración preparados

### Post-Integration:
- [ ] Todos los componentes compilan
- [ ] No hay imports rotos
- [ ] Backend real funciona
- [ ] Navegación funciona end-to-end
- [ ] Tests funcionales pasan
- [ ] UI renderiza correctamente
- [ ] Dark mode funciona

### Documentation:
- [ ] INTEGRATION_LOG.md completado
- [ ] MIGRATION_NOTES.md actualizado
- [ ] README actualizado (si es necesario)

---

## 🚨 NOTAS IMPORTANTES

### Limitaciones Temporales (hasta que backend implemente):

1. **Status de Rutinas:**
   - Backend NO devuelve status (Active/Scheduled/Completed)
   - Usar mock/default hasta implementar

2. **Historial de Sesiones:**
   - Backend NO tiene endpoints de historial
   - Usar mock hasta implementar

3. **Rutinas de Gimnasios:**
   - Backend NO tiene endpoint para rutinas compartidas por gimnasios
   - Usar mock hasta implementar

4. **Tracking en Tiempo Real:**
   - Store local temporal hasta implementar persistencia en backend

### Próximos Pasos (Post-Integración):

1. **Implementar Backend de Sessions:**
   - POST /api/user-routines/sessions
   - GET /api/user-routines/:id/sessions
   - GET /api/user-routines/sessions/:id

2. **Agregar Status a Rutinas:**
   - Actualizar modelo backend
   - Agregar campo `status` en API

3. **Implementar Rutinas de Gimnasios:**
   - GET /api/gyms/:id/routines
   - Relacionar gimnasios con rutinas compartidas

---

## 🎯 TIEMPO ESTIMADO TOTAL

- **FASE 1:** 10 min
- **FASE 2:** 30 min
- **FASE 3:** 15 min
- **FASE 4:** 20 min
- **FASE 5:** 30 min
- **FASE 6:** 20 min
- **FASE 7:** 45 min
- **FASE 8:** 60 min
- **FASE 9:** 30 min
- **FASE 10:** 90 min
- **FASE 11:** 60 min

**TOTAL: ~6.5 horas** (sin interrupciones)

---

## 📞 CONTACTO Y SOPORTE

Si encuentras problemas durante la integración:
1. Consultar INTEGRATION_LOG.md
2. Revisar este documento
3. Consultar documentación de backend OpenAPI
4. Contactar al equipo

---

**Autor:** Claude
**Fecha:** 2025-01-03
**Versión:** 1.0
