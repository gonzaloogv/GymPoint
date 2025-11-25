# Instrucciones para actualizar routines.store.ts

## Cambios necesarios en interfaces

### 1. Agregar interfaces para estados de ejercicios (después de `CompletedSet`):

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
```

### 2. Actualizar interface `IncompleteSession`:

```typescript
interface IncompleteSession {
  routineId: number;
  routineName: string;
  workoutSessionId: number;
  startedAt: string;
  duration: number; // NUEVO
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: CompletedSet[];
  // NUEVO: Estado completo de ejercicios
  exerciseStates?: { [exerciseId: string]: ExerciseState };
  expandedExercises?: { [exerciseId: string]: boolean };
}
```

### 3. Agregar nueva acción en `RoutinesState`:

```typescript
interface RoutinesState {
  // ... existing properties

  // Execution actions
  startExecution: (routineId: number) => Promise<void>;
  completeSet: (exerciseId: number, setNumber: number, data?: { reps?: number; weight?: number }) => void;
  saveSession: () => Promise<void>;
  discardSession: () => Promise<void>;
  loadIncompleteSession: () => Promise<void>;
  resumeSession: () => void;
  updateIncompleteSessionProgress: (data: Partial<IncompleteSession>) => Promise<void>; // NUEVO

  // ... rest of properties
}
```

### 4. Actualizar `startExecution` donde se crea `incompleteSession`:

Buscar:
```typescript
const incompleteSession: IncompleteSession = {
  routineId,
  routineName: routine.routine_name,
  workoutSessionId: workoutSession.id_workout_session,
  startedAt: executionState.startedAt,
  currentExerciseIndex: 0,
  currentSet: 1,
  completedSets: [],
};
```

Reemplazar por:
```typescript
const incompleteSession: IncompleteSession = {
  routineId,
  routineName: routine.routine_name,
  workoutSessionId: workoutSession.id_workout_session,
  startedAt: executionState.startedAt,
  duration: 0, // NUEVO
  currentExerciseIndex: 0,
  currentSet: 1,
  completedSets: [],
  exerciseStates: undefined, // NUEVO
  expandedExercises: undefined, // NUEVO
};
```

### 5. Agregar implementación de `updateIncompleteSessionProgress`:

Agregar al final, después de `resumeSession`:

```typescript
// Update incomplete session progress (called from useRoutineExecution)
updateIncompleteSessionProgress: async (data: Partial<IncompleteSession>) => {
  const { incompleteSession } = get();

  if (!incompleteSession) return;

  const updated: IncompleteSession = {
    ...incompleteSession,
    ...data,
  };

  set({ incompleteSession: updated });
  await saveIncompleteSession(updated);
},
```

## Resultado

Con estos cambios, el store podrá:
1. Guardar el estado completo de los ejercicios (todos los checks marcados)
2. Restaurar el progreso exacto cuando el usuario vuelva
3. Actualizar automáticamente el progreso mientras el usuario entrena
