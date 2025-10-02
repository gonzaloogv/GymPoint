# 🏗️ Arquitectura Clean - Diagramas Visuales

## 📐 Estructura de Capas (General)

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                            │
│  (React Native UI, Navigation, Theme)                        │
│  - Solo conoce UI components y llamadas a stores/hooks       │
└─────────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────────┐
│                    FEATURES (Clean Arch)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  UI LAYER                                              │ │
│  │  - Screens (presentational components)                │ │
│  │  - Components (dumb/smart)                            │ │
│  │  - Hooks (consumen stores)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓ usa                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  STATE LAYER (Zustand Stores)                         │ │
│  │  - Stores por feature                                 │ │
│  │  - State management                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓ usa                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  DOMAIN LAYER (Business Logic)                        │ │
│  │  - Entities (modelos puros)                           │ │
│  │  - Use Cases (lógica de negocio)                      │ │
│  │  - Repository Interfaces (contratos)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↑ implementa                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  DATA LAYER (Implementación)                          │ │
│  │  - Repository Implementations                         │ │
│  │  - Datasources (Remote/Local)                         │ │
│  │  - DTOs (Data Transfer Objects)                       │ │
│  │  - Mappers (DTO → Entity)                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                           │
│  - API Client (Axios)                                        │
│  - Storage (AsyncStorage, SecureStore)                       │
│  - Services (Location, Permissions)                          │
└─────────────────────────────────────────────────────────────┘
                          ↑
                    DI Container
              (Dependency Injection)
```

---

## 🔄 Flujo de Datos (Ejemplo: Get Routines)

```
┌──────────────────┐
│  RoutinesScreen  │  (UI)
└────────┬─────────┘
         │ 1. useRoutinesStore()
         ↓
┌──────────────────┐
│ routines.store   │  (STATE - Zustand)
└────────┬─────────┘
         │ 2. DI.getRoutines.execute()
         ↓
┌──────────────────┐
│  GetRoutines UC  │  (DOMAIN - UseCase)
└────────┬─────────┘
         │ 3. repository.getAll()
         ↓
┌─────────────────────────┐
│ RoutineRepositoryImpl   │  (DATA - Implementation)
└────────┬────────────────┘
         │ 4. datasource.fetch()
         ↓
┌──────────────────┐
│  RoutineRemote   │  (DATA - Remote)
│  or              │
│  RoutineLocal    │  (DATA - Local/Mocks)
└────────┬─────────┘
         │ 5. apiClient.get('/routines')
         ↓
┌──────────────────┐
│  Backend API     │
└──────────────────┘

RESPUESTA:
Backend → RoutineDTO → Mapper → Routine Entity → Store → UI
```

---

## 📦 Estructura de Carpetas (Feature: Routines)

```
src/features/routines/
│
├── data/                           (DATA LAYER)
│   ├── dto/
│   │   └── RoutineDTO.ts           ← Estructura que viene del API
│   ├── mappers/
│   │   └── routine.mapper.ts       ← RoutineDTO → Routine entity
│   ├── datasources/
│   │   ├── RoutineRemote.ts        ← Llamadas al backend
│   │   └── RoutineLocal.ts         ← Mocks/cache local
│   ├── RoutineRepositoryImpl.ts    ← Implementación del contrato
│   └── index.ts                    ← Barrel
│
├── domain/                         (DOMAIN LAYER - CORE)
│   ├── entities/
│   │   ├── Routine.ts              ← Modelo de negocio puro
│   │   ├── Exercise.ts
│   │   └── RoutineHistory.ts
│   ├── repositories/
│   │   └── RoutineRepository.ts    ← Contrato (interface)
│   ├── usecases/
│   │   ├── GetRoutines.ts          ← Casos de uso
│   │   ├── GetRoutineById.ts
│   │   ├── ExecuteRoutine.ts
│   │   └── GetRoutineHistory.ts
│   └── index.ts                    ← Barrel
│
├── state/                          (STATE LAYER)
│   ├── routines.store.ts           ← Zustand store
│   └── index.ts                    ← Barrel
│
├── ui/                             (UI LAYER)
│   ├── screens/
│   │   ├── RoutinesScreen.tsx
│   │   ├── RoutineDetailScreen.tsx
│   │   ├── RoutineExecutionScreen.tsx
│   │   └── RoutineHistoryScreen.tsx
│   ├── components/
│   │   ├── RoutineCard.tsx
│   │   ├── ExerciseList.tsx
│   │   ├── ...
│   │   └── index.ts
│   └── index.ts                    ← Barrel
│
├── utils/                          (Utilidades específicas)
│   └── routineHelpers.ts
│
├── mocks/                          (Para desarrollo)
│   └── routines.mock.ts
│
├── types.ts                        (Re-export de entities si es necesario)
└── index.ts                        (Barrel principal)
```

---

## 🎯 Dependency Rule (Regla de Dependencia)

```
         PUEDE IMPORTAR
            ↓
┌────────────────────────┐
│     UI LAYER           │
└────────────────────────┘
            ↓
┌────────────────────────┐
│   STATE LAYER          │
└────────────────────────┘
            ↓
┌────────────────────────┐
│   DOMAIN LAYER         │  ← NO IMPORTA NADA DE FUERA
└────────────────────────┘  (solo entidades puras)
            ↑
┌────────────────────────┐
│    DATA LAYER          │
└────────────────────────┘
            ↓
┌────────────────────────┐
│  INFRASTRUCTURE        │
└────────────────────────┘
```

**Regla de oro**: 
- ✅ Las capas externas conocen las internas
- ❌ Las capas internas NO conocen las externas
- ✅ Domain es el centro, no depende de nadie

---

## 🔗 Imports Permitidos por Capa

### UI Layer
```typescript
// ✅ PERMITIDO
import { useRoutinesStore } from '@features/routines/state';
import { Routine } from '@features/routines/domain/entities/Routine';
import { Button } from '@shared/components/ui';

// ❌ PROHIBIDO
import { RoutineRepositoryImpl } from '@features/routines/data'; // ⚠️ UI no debe conocer data
import { apiClient } from '@shared/http'; // ⚠️ UI no debe conocer infraestructura
```

### State Layer
```typescript
// ✅ PERMITIDO
import { GetRoutines } from '@features/routines/domain/usecases/GetRoutines';
import { Routine } from '@features/routines/domain/entities/Routine';
import { DI } from '@di/container';

// ❌ PROHIBIDO
import { RoutineRepositoryImpl } from '@features/routines/data'; // ⚠️ State usa usecases, no repos
```

### Domain Layer
```typescript
// ✅ PERMITIDO
// Solo tipos/entidades de TypeScript puros
export interface RoutineRepository { ... }
export class Routine { ... }

// ❌ PROHIBIDO
import { apiClient } from '@shared/http'; // ⚠️ Domain NO conoce infraestructura
import { RoutineDTO } from '../data/dto'; // ⚠️ Domain NO conoce data
import { useRoutinesStore } from '../state'; // ⚠️ Domain NO conoce state
```

### Data Layer
```typescript
// ✅ PERMITIDO
import { RoutineRepository } from '@features/routines/domain/repositories/RoutineRepository';
import { Routine } from '@features/routines/domain/entities/Routine';
import { apiClient } from '@shared/http';

// ❌ PROHIBIDO
import { useRoutinesStore } from '../state'; // ⚠️ Data NO conoce state
import { RoutinesScreen } from '../ui/screens'; // ⚠️ Data NO conoce UI
```

---

## 🧩 Ejemplo Completo: Feature Routines

### 1. Domain Layer

```typescript
// domain/entities/Routine.ts
export class Routine {
  constructor(
    public id: number,
    public name: string,
    public exercises: Exercise[],
    public difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    public durationMinutes: number
  ) {}
}

// domain/repositories/RoutineRepository.ts
export interface RoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: number): Promise<Routine>;
}

// domain/usecases/GetRoutines.ts
export class GetRoutines {
  constructor(private repository: RoutineRepository) {}

  async execute(): Promise<Routine[]> {
    return await this.repository.getAll();
  }
}
```

### 2. Data Layer

```typescript
// data/dto/RoutineDTO.ts
export interface RoutineDTO {
  id_routine: number;
  routine_name: string;
  difficulty_level: string;
  estimated_duration: number;
  exercises: ExerciseDTO[];
}

// data/mappers/routine.mapper.ts
export const mapRoutineDTOToEntity = (dto: RoutineDTO): Routine => {
  return new Routine(
    dto.id_routine,
    dto.routine_name,
    dto.exercises.map(mapExerciseDTOToEntity),
    dto.difficulty_level as any,
    dto.estimated_duration
  );
};

// data/datasources/RoutineRemote.ts
export class RoutineRemote {
  async fetchAll(): Promise<RoutineDTO[]> {
    const response = await apiClient.get('/routines');
    return response.data;
  }
}

// data/RoutineRepositoryImpl.ts
export class RoutineRepositoryImpl implements RoutineRepository {
  constructor(private remote: RoutineRemote) {}

  async getAll(): Promise<Routine[]> {
    const dtos = await this.remote.fetchAll();
    return dtos.map(mapRoutineDTOToEntity);
  }

  async getById(id: number): Promise<Routine> {
    // implementación...
  }
}
```

### 3. DI Container

```typescript
// di/container.ts
class Container {
  routineRemote: RoutineRemote;
  routineRepository: RoutineRepository;
  getRoutines: GetRoutines;
  getRoutineById: GetRoutineById;

  constructor() {
    // Data
    this.routineRemote = new RoutineRemote();
    this.routineRepository = new RoutineRepositoryImpl(this.routineRemote);

    // Use Cases
    this.getRoutines = new GetRoutines(this.routineRepository);
    this.getRoutineById = new GetRoutineById(this.routineRepository);
  }
}

export const DI = new Container();
```

### 4. State Layer

```typescript
// state/routines.store.ts
import { create } from 'zustand';
import { DI } from '@di/container';
import { Routine } from '../domain/entities/Routine';

interface RoutinesState {
  routines: Routine[];
  loading: boolean;
  error: string | null;
  fetchRoutines: () => Promise<void>;
}

export const useRoutinesStore = create<RoutinesState>((set) => ({
  routines: [],
  loading: false,
  error: null,

  fetchRoutines: async () => {
    set({ loading: true, error: null });
    try {
      const routines = await DI.getRoutines.execute();
      set({ routines, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 5. UI Layer

```typescript
// ui/screens/RoutinesScreen.tsx
import React, { useEffect } from 'react';
import { useRoutinesStore } from '@features/routines/state';
import { RoutineCard } from '../components/RoutineCard';

export const RoutinesScreen = () => {
  const { routines, loading, fetchRoutines } = useRoutinesStore();

  useEffect(() => {
    fetchRoutines();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Screen>
      {routines.map(routine => (
        <RoutineCard key={routine.id} routine={routine} />
      ))}
    </Screen>
  );
};
```

---

## 🚦 Testing de Capas

### Domain (Unit Tests - Puros)
```typescript
// __tests__/domain/usecases/GetRoutines.test.ts
describe('GetRoutines', () => {
  it('should return all routines', async () => {
    const mockRepo: RoutineRepository = {
      getAll: jest.fn().mockResolvedValue([mockRoutine1, mockRoutine2])
    };
    const useCase = new GetRoutines(mockRepo);
    const result = await useCase.execute();
    
    expect(result).toHaveLength(2);
    expect(mockRepo.getAll).toHaveBeenCalledTimes(1);
  });
});
```

### Data (Integration Tests)
```typescript
// __tests__/data/RoutineRepositoryImpl.test.ts
describe('RoutineRepositoryImpl', () => {
  it('should map DTO to Entity correctly', async () => {
    const mockRemote = { fetchAll: jest.fn().mockResolvedValue([mockDTO]) };
    const repo = new RoutineRepositoryImpl(mockRemote);
    
    const result = await repo.getAll();
    
    expect(result[0]).toBeInstanceOf(Routine);
    expect(result[0].name).toBe('Full Body Workout');
  });
});
```

### UI (Component Tests)
```typescript
// __tests__/ui/RoutinesScreen.test.tsx
describe('RoutinesScreen', () => {
  it('should display routines from store', () => {
    useRoutinesStore.setState({ routines: [mockRoutine1, mockRoutine2] });
    
    const { getByText } = render(<RoutinesScreen />);
    
    expect(getByText('Full Body Workout')).toBeTruthy();
  });
});
```

---

## 🎨 Convenciones de Nomenclatura

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Entities | PascalCase | `Routine`, `Exercise`, `User` |
| Interfaces | PascalCase + `I` prefix (opcional) | `RoutineRepository`, `IRoutineRepository` |
| Use Cases | PascalCase + verbo | `GetRoutines`, `CreateRoutine`, `DeleteRoutine` |
| Repositories | PascalCase + `Repository` | `RoutineRepository` |
| Repository Impl | PascalCase + `RepositoryImpl` | `RoutineRepositoryImpl` |
| DTOs | PascalCase + `DTO` | `RoutineDTO`, `ExerciseDTO` |
| Mappers | camelCase + `Mapper` | `routineMapper`, `mapRoutineDTOToEntity` |
| Stores | camelCase + `Store` hook | `useRoutinesStore`, `useAuthStore` |
| Screens | PascalCase + `Screen` | `RoutinesScreen`, `HomeScreen` |
| Components | PascalCase | `RoutineCard`, `ExerciseList` |
| Hooks | camelCase + `use` prefix | `useRoutines`, `useRoutineById` |
| Constants | UPPER_SNAKE_CASE | `MAX_ROUTINES`, `DEFAULT_DIFFICULTY` |

---

## 📂 Carpetas Compartidas (Shared)

```
src/shared/
│
├── components/          ← Componentes UI reutilizables
│   ├── ui/             ← Componentes de diseño (Button, Card, Input)
│   └── brand/          ← Logo, BrandMark
│
├── hooks/              ← Hooks genéricos (NO lógica de negocio)
│   ├── useDebounce.ts
│   └── useThrottle.ts
│
├── utils/              ← Utilidades puras
│   ├── formatters.ts
│   └── validators.ts
│
├── http/               ← API Client base
│   └── apiClient.ts
│
├── services/           ← Servicios de infraestructura
│   ├── location.ts
│   └── permissions.ts
│
├── config/             ← Configuración
│   └── env.ts
│
└── domain/             ← Entidades compartidas entre features (si es necesario)
    └── entities/
        └── ...         ← Solo si realmente es compartido
```

---

## 🎯 Decision Tree: ¿Dónde va este código?

```
┌─────────────────────────────────────┐
│  ¿Es lógica de UI/presentación?     │
└──────────────┬──────────────────────┘
               │ SÍ
               ↓
        ┌─────────────┐
        │  UI Layer   │
        └─────────────┘

               │ NO
               ↓
┌─────────────────────────────────────┐
│  ¿Es manejo de estado?              │
└──────────────┬──────────────────────┘
               │ SÍ
               ↓
        ┌─────────────┐
        │ STATE Layer │
        └─────────────┘

               │ NO
               ↓
┌─────────────────────────────────────┐
│  ¿Es lógica de negocio pura?        │
└──────────────┬──────────────────────┘
               │ SÍ
               ↓
        ┌─────────────┐
        │ DOMAIN      │
        │ (UseCase)   │
        └─────────────┘

               │ NO
               ↓
┌─────────────────────────────────────┐
│  ¿Es obtención/transformación data? │
└──────────────┬──────────────────────┘
               │ SÍ
               ↓
        ┌─────────────┐
        │ DATA Layer  │
        └─────────────┘

               │ NO
               ↓
┌─────────────────────────────────────┐
│  ¿Es infraestructura/servicios?     │
└──────────────┬──────────────────────┘
               │ SÍ
               ↓
        ┌─────────────┐
        │ SHARED/     │
        │ services    │
        └─────────────┘
```

---

## 🔑 Puntos Clave de la Migración

### ✅ Mantener
- Todas las features funcionando
- Performance
- Tipos TypeScript
- Estructura de componentes que funciona bien

### 🔄 Cambiar
- Hooks con lógica de negocio → Stores
- Mocks directos en hooks → Datasources locales
- Tipos en `types.ts` → Entities en domain
- Componentes/screens mezclados → Separados en ui/

### 🆕 Crear
- Use Cases para cada operación
- Repositories (interfaces + implementaciones)
- DTOs y Mappers
- Stores Zustand para cada feature
- DI Container completo

### 🗑️ Eliminar
- Features redundantes (gymdetails → gyms)
- Código duplicado
- Imports innecesarios
- Mocks inline (moverlos a datasources)

---

**Este diagrama complementa el plan de migración principal**

