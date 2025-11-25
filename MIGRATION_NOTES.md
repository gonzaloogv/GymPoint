# Migration Notes: Routine UI Integration

This document contains important notes for adapting the routine-execution-redesign UI to work with the existing backend.

---

## Key Architectural Decisions

### 1. Navigation Param Types: string vs number

**Decision:** Use `string` in navigation params, convert to `number` in screens

**Pattern:**
```typescript
// navigation/types.ts
export type RoutinesStackParamList = {
  RoutineDetail: { id: string }; // string in navigation
};

// RoutineDetailScreen.tsx
const { id } = route.params; // string
const routineId = parseInt(id, 10); // convert to number
const { routine } = useRoutineById(routineId); // pass number to hook
```

**Rationale:**
- React Navigation serializes params to strings for deep linking
- Industry standard approach
- More flexible for future changes (UUIDs, slugs)

---

## 2. Entity Mapping Strategy

### Backend Entity → UI Component Mapping

**Routine (backend)** → **RoutineCard**
```typescript
// Backend entity
interface Routine {
  id_routine: number;
  routine_name: string;
  description: string | null;
  exercises: RoutineExercise[];
}

// Component adaptation
const exerciseCount = routine.exercises?.length || 0;
const muscleGroups = [...new Set(routine.exercises?.map(ex => ex.muscular_group))];
const totalSets = routine.exercises?.reduce((sum, ex) => sum + ex.series, 0);
```

**RoutineExercise (backend)** → **ExerciseCard**
```typescript
// Backend entity
interface RoutineExercise {
  id_exercise: number;
  exercise_name: string;
  series: number;
  reps: string;
  muscular_group: string;
  description: string | null;
}

// Component uses these directly - no adaptation needed
```

---

## 3. Mock vs Real Data

### Currently Using REAL Backend:
- ✅ `routineRepository.getMyRoutines()` - User's routines
- ✅ `routineRepository.getById(id)` - Routine detail
- ✅ `routineRepository.create(data)` - Create routine
- ✅ `routineRepository.update(id, data)` - Update routine
- ✅ `routineRepository.delete(id)` - Delete routine
- ✅ `routineRepository.getTemplates()` - Template routines
- ✅ `routineRepository.clone(id)` - Clone template
- ✅ `userRoutineRepository.assignRoutine(data)` - Assign routine to user
- ✅ `userRoutineRepository.getActiveRoutine()` - Get active routine

### Currently Using MOCK (Backend not implemented):
- ⚠️ Routine status (Active/Scheduled/Completed) - Backend doesn't provide
- ⚠️ Session history - No `/api/user-routines/sessions` endpoint yet
- ⚠️ Gym shared routines - No `/api/gyms/:id/routines` endpoint yet
- ⚠️ Difficulty level - Backend doesn't provide

**Mock Strategy:**
```typescript
// For status
const status = 'Active'; // Default until backend implements

// For history
const mockHistory = [...]; // Use mock data temporarily

// For gym routines
const GYM_ROUTINES = [...]; // Use mock data temporarily
```

---

## 4. Store Architecture

### Zustand Store Structure

```typescript
interface RoutinesState {
  // Data from backend
  routines: Routine[];
  loading: boolean;
  error: string | null;

  // UI state (local)
  search: string;
  statusFilter: 'All' | 'Active' | 'Scheduled' | 'Completed';

  // Execution state (local + backend)
  activeRoutine: UserRoutine | null;
  executionState: ExecutionState | null;
  incompleteSession: IncompleteSession | null;

  // Actions - use repositories directly
  fetchMyRoutines: () => Promise<void>;
  fetchRoutineById: (id: number) => Promise<Routine>;
  // ... etc
}
```

**Key Points:**
- Store uses repositories directly (no use cases)
- Local state for UI (search, filters)
- Backend state for data (routines, exercises)
- Mixed state for execution (local tracking + backend save)

---

## 5. Hook Adaptation Pattern

### Pattern for all hooks:
1. Accept `number` for IDs (internal)
2. Use repositories from data layer
3. Return typed data matching backend entities
4. Handle loading and error states

**Example:**
```typescript
export function useRoutineById(id?: number) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchRoutineById } = useRoutinesStore();

  useEffect(() => {
    if (!id) return;

    const loadRoutine = async () => {
      setLoading(true);
      try {
        const data = await fetchRoutineById(id);
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

---

## 6. Component Props Adaptation

### Before (feature branch - mock data):
```typescript
interface ExerciseCardProps {
  exercise: Exercise; // Legacy mock entity
  index: number;
}
```

### After (gonzalo - real backend):
```typescript
interface ExerciseCardProps {
  exercise: RoutineExercise; // Real backend entity
  index: number;
}

// Usage in component
<Text>{exercise.exercise_name}</Text> // Changed from exercise.name
<Text>{exercise.series} x {exercise.reps}</Text> // Changed from exercise.sets
```

---

## 7. Incomplete Session Handling

### LocalStorage Strategy:
```typescript
// Save session when user exits mid-routine
const saveIncompleteSession = async (session: IncompleteSession) => {
  await AsyncStorage.setItem('incomplete_session', JSON.stringify(session));
};

// Check on app start
const checkIncompleteSession = async () => {
  const session = await AsyncStorage.getItem('incomplete_session');
  if (session) {
    // Show modal to resume or discard
    return JSON.parse(session);
  }
  return null;
};
```

**Session Structure:**
```typescript
interface IncompleteSession {
  routineId: number;
  routineName: string;
  startedAt: string; // ISO timestamp
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: CompletedSet[];
}
```

---

## 8. Error Handling

### Pattern for all async operations:
```typescript
try {
  setLoading(true);
  const data = await repository.someMethod();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show error to user
  Alert.alert('Error', error.message || 'Something went wrong');
} finally {
  setLoading(false);
}
```

---

## 9. Testing Strategy

### What to test:
1. **Unit tests:** Hooks, adapters, utilities
2. **Integration tests:** Store + repositories
3. **E2E tests:** User flows (list → detail → execution → complete)

### What NOT to test:
- Backend API (assume it works)
- Third-party libraries (React Navigation, Zustand)

---

## 10. Future Backend Requirements

### To fully replace mocks, backend needs:

**1. Session Endpoints:**
```
POST   /api/user-routines/sessions
GET    /api/user-routines/:id/sessions
GET    /api/user-routines/sessions/:id
DELETE /api/user-routines/sessions/:id
```

**2. Status Field:**
Add `status` to Routine model:
```typescript
status: 'Active' | 'Scheduled' | 'Completed' | 'Archived'
```

**3. Gym Routines:**
```
GET /api/gyms/:id/routines
POST /api/gyms/:id/routines (for gym admins)
```

**4. Difficulty Level:**
Add `difficulty` to Routine model:
```typescript
difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
```

---

## Common Pitfalls to Avoid

1. ❌ Using `Exercise` entity instead of `RoutineExercise`
2. ❌ Passing `string` directly to hooks (convert first!)
3. ❌ Forgetting `.toString()` when navigating
4. ❌ Using deprecated use cases instead of repositories
5. ❌ Expecting backend to provide status/difficulty (use mocks)
6. ❌ Not handling loading/error states in components

---

## Quick Reference: File Locations

### Domain Layer (KEEP from gonzalo):
- `features/routines/domain/entities/Routine.ts`
- `features/routines/domain/entities/UserRoutine.ts`
- `features/routines/domain/repositories/RoutineRepository.ts`
- `features/routines/domain/repositories/UserRoutineRepository.ts`

### Data Layer (KEEP from gonzalo):
- `features/routines/data/RoutineRepositoryImpl.ts`
- `features/routines/data/UserRoutineRepositoryImpl.ts`
- `features/routines/data/dto/*`
- `features/routines/data/mappers/*`
- `features/routines/data/remote/*`

### Presentation Layer (REPLACE from feature):
- `features/routines/presentation/ui/screens/*`
- `features/routines/presentation/ui/components/*`
- `features/routines/presentation/ui/layouts/*`

### Shared Components (ADD from feature):
- `shared/components/ui/*`

---

**Last Updated:** 2025-01-04
**Author:** Claude
