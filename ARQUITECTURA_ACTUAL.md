# 🏗️ Arquitectura GymPoint - Clean Architecture (3 Capas)

## 📋 Índice

1. [Vista General](#vista-general)
2. [Estructura de Capas](#estructura-de-capas)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Flujo de Datos](#flujo-de-datos)
5. [Dependency Rule](#dependency-rule)
6. [Features Implementadas](#features-implementadas)
7. [Ejemplos Concretos](#ejemplos-concretos)

---

## 🎯 Vista General

GymPoint implementa **Clean Architecture** adaptada a React Native/Expo con una estructura de **3 capas** por feature.

```
┌─────────────────────────────────────────────────────────────┐
│                    GYMPOINT MOBILE APP                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              PRESENTATION LAYER                     │    │
│  │  • UI Components (React Native)                     │    │
│  │  • Hooks (Custom React Hooks)                       │    │
│  │  • State Management (Zustand Stores)                │    │
│  │  • Utils (Helper Functions)                         │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↑ ↓                                  │
│                    Uses / Observes                           │
│                         ↑ ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │                 DOMAIN LAYER                        │    │
│  │  • Entities (Business Objects)                      │    │
│  │  • Repository Interfaces                            │    │
│  │  • Use Cases (Business Logic)                       │    │
│  │  • Constants (Business Rules)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↑ ↓                                  │
│                    Implements                                │
│                         ↑ ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  DATA LAYER                         │    │
│  │  • DTOs (Data Transfer Objects)                     │    │
│  │  • Mappers (DTO ↔ Entity)                          │    │
│  │  • DataSources (API, Local, Mocks)                 │    │
│  │  • Repository Implementations                       │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↑ ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │            EXTERNAL DEPENDENCIES                    │    │
│  │  • Backend API (REST)                               │    │
│  │  • AsyncStorage (Local DB)                          │    │
│  │  • SecureStore (Tokens)                             │    │
│  │  • Expo Location                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Estructura de Capas

### Organización por Feature

Cada feature sigue la misma estructura de 3 capas:

```
features/<feature>/
├── domain/                 # 🎯 CAPA DE NEGOCIO (núcleo)
│   ├── entities/          # Objetos de negocio puros
│   ├── repositories/      # Contratos (interfaces)
│   ├── usecases/          # Reglas de negocio
│   └── constants/         # Constantes de dominio
│
├── data/                   # 💾 CAPA DE DATOS (implementación)
│   ├── dto/               # Estructuras de datos de API
│   ├── mappers/           # DTO ↔ Entity conversión
│   ├── datasources/       # Fuentes de datos (API, Local, Mocks)
│   └── <Feature>RepositoryImpl.ts  # Implementación del contrato
│
├── presentation/           # 🎨 CAPA DE PRESENTACIÓN (UI)
│   ├── ui/                # Componentes React Native
│   │   ├── components/    # Componentes reutilizables
│   │   ├── screens/       # Pantallas completas
│   │   └── styles/        # Estilos específicos
│   ├── hooks/             # Custom React Hooks
│   ├── state/             # Zustand stores
│   ├── utils/             # Utilidades de presentación
│   └── index.ts           # Barrel export
│
└── index.ts                # ✨ Public API (solo exporta presentation)
```

---

## 🎨 Patrones de Diseño

### 1. **Repository Pattern** 📦

**Propósito:** Abstraer la lógica de acceso a datos.

```typescript
// CONTRATO en domain/repositories/
export interface GymRepository {
  listNearby(params: ListNearbyParams): Promise<Gym[]>;
  getById(id: GymId): Promise<Gym | null>;
}

// IMPLEMENTACIÓN en data/
export class GymRepositoryImpl implements GymRepository {
  async listNearby(params: ListNearbyParams): Promise<Gym[]> {
    const dtos = await GymRemote.fetchNearby(params);
    return dtos.map(mapGymDTOToEntity);
  }
}
```

**Beneficios:**
- ✅ Desacopla la lógica de negocio del origen de datos
- ✅ Facilita testing (mockear repos)
- ✅ Permite cambiar fuentes de datos sin afectar el dominio

---

### 2. **Use Case Pattern** (Interactors) ⚙️

**Propósito:** Encapsular una regla de negocio específica.

```typescript
// domain/usecases/ListNearbyGyms.ts
export class ListNearbyGyms {
  constructor(private repository: GymRepository) {}

  async execute(lat: number, lng: number, radius: number): Promise<Gym[]> {
    // Lógica de negocio pura
    if (radius > 50000) throw new Error('Radio máximo: 50km');
    
    return this.repository.listNearby({ lat, lng, radius });
  }
}
```

**Beneficios:**
- ✅ Una clase = una responsabilidad (SRP)
- ✅ Lógica de negocio testeable sin UI
- ✅ Reusable desde cualquier capa de presentación

---

### 3. **Dependency Injection** 💉

**Propósito:** Proveer dependencias desde un contenedor centralizado.

```typescript
// di/container.ts
class Container {
  // Repositorios
  gymRepository: GymRepository;
  
  // Use Cases
  listNearbyGyms: ListNearbyGyms;
  
  constructor() {
    // Wire dependencies
    this.gymRepository = new GymRepositoryImpl();
    this.listNearbyGyms = new ListNearbyGyms(this.gymRepository);
  }
}

export const DI = new Container();
```

**Uso en Presentation:**

```typescript
// presentation/hooks/useNearbyGyms.ts
const gyms = await DI.listNearbyGyms.execute(lat, lng, radius);
```

**Beneficios:**
- ✅ Desacoplamiento total
- ✅ Fácil testing (inyectar mocks)
- ✅ Single source of truth para instancias

---

### 4. **Mapper Pattern** 🔄

**Propósito:** Convertir DTOs (API) a Entities (Domain).

```typescript
// data/mappers/gym.mappers.ts
export function mapGymDTOToEntity(dto: GymDTO): Gym {
  return {
    id: dto.id_gym.toString(),
    name: dto.name,
    lat: parseFloat(dto.latitude),
    lng: parseFloat(dto.longitude),
    monthPrice: dto.month_price ?? undefined,
    equipment: dto.equipment?.split(',') ?? [],
  };
}
```

**Por qué es importante:**

```
API (backend)          Mapper           Domain (app)
─────────────────   ─────────────   ─────────────────
id_gym: number   →   mapGymDTO   →   id: string
latitude: string →               →   lat: number
month_price: int →               →   monthPrice?: number
equipment: string →              →   equipment: string[]
```

**Beneficios:**
- ✅ Domain no depende de la estructura de API
- ✅ Cambios en API no afectan lógica de negocio
- ✅ Tipado fuerte en toda la app

---

### 5. **State Management Pattern** (Zustand) 🗄️

**Propósito:** Gestionar estado global de forma reactiva.

```typescript
// presentation/state/gyms.store.ts
export const useGymsStore = create<GymsState>((set) => ({
  gyms: [],
  loading: false,
  
  fetchGyms: async (lat, lng) => {
    set({ loading: true });
    const gyms = await DI.listNearbyGyms.execute(lat, lng, 10000);
    set({ gyms, loading: false });
  },
}));
```

**Consumo en UI:**

```typescript
function GymsList() {
  const { gyms, loading, fetchGyms } = useGymsStore();
  
  useEffect(() => {
    fetchGyms(userLat, userLng);
  }, []);
  
  return <FlatList data={gyms} ... />;
}
```

**Beneficios:**
- ✅ Estado global sin prop drilling
- ✅ Reactivo (UI se actualiza automáticamente)
- ✅ Lightweight (Zustand es minimalista)

---

### 6. **Barrel Pattern** (Index Exports) 📦

**Propósito:** Simplificar imports públicos.

```typescript
// features/gyms/index.ts (PUBLIC API)
export * from './presentation';
export * from './domain/constants/filters';
export * from './domain/constants/map';

// ❌ NO exporta:
// - domain/entities (implementación interna)
// - data/* (implementación interna)
```

**Uso externo:**

```typescript
// ✅ Desde otra feature o presentación
import { GymsScreen, useNearbyGyms, GymFilters } from '@features/gyms';

// ❌ NO se puede hacer (y está bien):
import { GymRepository } from '@features/gyms/domain/repositories';
```

**Beneficios:**
- ✅ Encapsulamiento (oculta implementación)
- ✅ Imports limpios
- ✅ Cambios internos no afectan externos

---

## 🔄 Flujo de Datos

### Flujo Típico: Fetch de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                         │
│    Usuario abre pantalla de gimnasios                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION LAYER                                        │
│    Component: MapScreen.tsx                                  │
│    └─> Hook: useNearbyGyms()                                │
│        └─> Store: useGymsStore.fetchGyms()                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DOMAIN LAYER (via DI Container)                          │
│    UseCase: DI.listNearbyGyms.execute(lat, lng, radius)    │
│    - Valida parámetros                                       │
│    - Aplica reglas de negocio                                │
│    - Delega a Repository                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DATA LAYER                                                │
│    Repository: GymRepositoryImpl.listNearby()               │
│    └─> DataSource: GymRemote.fetchNearby()                  │
│        └─> HTTP Client: axios.get('/api/v1/gyms/nearby')    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. EXTERNAL API                                              │
│    Backend responde con JSON (DTOs)                          │
│    [{ id_gym: 1, latitude: "-27.4", ... }]                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DATA LAYER (Mapping)                                      │
│    Mapper: mapGymDTOToEntity(dto)                           │
│    - Convierte tipos (string → number)                       │
│    - Normaliza campos (id_gym → id)                          │
│    - Retorna Entities: Gym[]                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. DOMAIN LAYER (Return)                                     │
│    UseCase retorna: Gym[] (entidades de dominio)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. PRESENTATION LAYER (Update)                               │
│    Store actualiza estado: set({ gyms: [...], loading: false })│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. UI RE-RENDER                                              │
│    React re-renderiza componentes suscritos al store        │
│    <FlatList data={gyms} renderItem={...} />                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Dependency Rule

**Regla de Oro:** Las dependencias solo fluyen hacia adentro (hacia el dominio).

```
┌──────────────────────────────────────────────────┐
│           DEPENDENCY RULE                        │
│                                                  │
│   ┌────────────────────────────────────┐        │
│   │    PRESENTATION (outer)            │        │
│   │    ✅ Puede importar:              │        │
│   │       - Domain (entities, usecases)│        │
│   │       - DI Container               │        │
│   │    ❌ NO puede importar:           │        │
│   │       - Data (DTOs, mappers)       │        │
│   └──────────────┬─────────────────────┘        │
│                  │ depende de                    │
│                  ▼                               │
│   ┌────────────────────────────────────┐        │
│   │    DOMAIN (core)                   │        │
│   │    ✅ Puede importar:              │        │
│   │       - Nada (es el núcleo)        │        │
│   │    ❌ NO puede importar:           │        │
│   │       - Presentation               │        │
│   │       - Data                       │        │
│   └──────────────▲─────────────────────┘        │
│                  │ implementa                    │
│                  │                               │
│   ┌────────────────────────────────────┐        │
│   │    DATA (outer)                    │        │
│   │    ✅ Puede importar:              │        │
│   │       - Domain (interfaces, entities)│      │
│   │    ❌ NO puede importar:           │        │
│   │       - Presentation               │        │
│   └────────────────────────────────────┘        │
└──────────────────────────────────────────────────┘
```

### Verificación de Dependency Rule

**Ejemplos de Imports Válidos:**

```typescript
// ✅ presentation/hooks/useNearbyGyms.ts
import { Gym } from '../../domain/entities/Gym';
import { DI } from '@di/container';

// ✅ data/GymRepositoryImpl.ts
import { GymRepository } from '../domain/repositories/GymRepository';
import { Gym } from '../domain/entities/Gym';

// ✅ data/mappers/gym.mappers.ts
import { Gym } from '../../domain/entities/Gym';
import { GymDTO } from '../dto/GymDTO';
```

**Ejemplos de Imports INVÁLIDOS (violaciones):**

```typescript
// ❌ presentation/hooks/useGyms.ts
import { GymDTO } from '../../data/dto/GymDTO';  // VIOLACIÓN!
import { mapGymDTO } from '../../data/mappers';  // VIOLACIÓN!

// ❌ domain/usecases/ListGyms.ts
import { useGymsStore } from '../../presentation/state';  // VIOLACIÓN!

// ❌ data/GymRepositoryImpl.ts
import { GymCard } from '../../presentation/ui/components';  // VIOLACIÓN!
```

---

## 📱 Features Implementadas

Todas las features siguen la misma estructura de 3 capas:

| Feature | Entidades | Use Cases | Store | Estado |
|---------|-----------|-----------|-------|--------|
| **auth** | User | LoginUser, GetMe | authStore | ✅ 100% |
| **gyms** | Gym, GymFilters, Schedule | ListNearbyGyms, GetSchedules | - | ✅ 100% |
| **routines** | Routine, Exercise, RoutineHistory | GetRoutines, ExecuteRoutine, GetHistory | routinesStore | ✅ 100% |
| **rewards** | Reward, GeneratedCode | GetRewards, GenerateCode, GetCodes | rewardsStore | ✅ 100% |
| **home** | HomeStats, WeeklyProgress, DailyChallenge | GetHomeStats, GetWeeklyProgress, GetChallenge | homeStore | ✅ 100% |
| **user** | UserProfile, UserStats, NotificationSettings | GetProfile, UpdateSettings, UpgradePremium | userStore | ✅ 100% |

---

## 💡 Ejemplos Concretos

### Ejemplo 1: Feature "Routines" Completa

#### 📂 Estructura de Archivos

```
routines/
├── domain/
│   ├── entities/
│   │   ├── Routine.ts          # { id, name, exercises, difficulty }
│   │   ├── Exercise.ts         # { id, name, sets, reps }
│   │   └── RoutineHistory.ts   # { id, routineId, date, completed }
│   ├── repositories/
│   │   └── RoutineRepository.ts  # interface
│   └── usecases/
│       ├── GetRoutines.ts
│       ├── ExecuteRoutine.ts
│       └── GetRoutineHistory.ts
│
├── data/
│   ├── dto/
│   │   └── RoutineDTO.ts        # Estructura de API
│   ├── mappers/
│   │   └── routine.mapper.ts    # DTO → Entity
│   ├── datasources/
│   │   ├── RoutineLocal.ts      # Mock data
│   │   └── routines.mock.ts
│   └── RoutineRepositoryImpl.ts
│
└── presentation/
    ├── ui/
    │   ├── screens/
    │   │   ├── RoutinesScreen.tsx        # Lista de rutinas
    │   │   ├── RoutineDetailScreen.tsx   # Detalle
    │   │   └── RoutineExecutionScreen.tsx # Ejecución
    │   ├── components/
    │   │   ├── RoutineCard.tsx
    │   │   ├── ExerciseCard.tsx
    │   │   └── RoutineProgress.tsx
    │   └── layouts/
    │       └── RoutinesLayout.tsx
    ├── hooks/
    │   ├── useRoutines.ts       # Fetch all
    │   ├── useRoutineById.ts    # Fetch one
    │   └── useRoutineExecution.ts
    └── state/
        └── routines.store.ts    # Zustand store
```

#### 🔄 Flujo Completo: "Usuario ejecuta una rutina"

```typescript
// 1️⃣ USER CLICKS "Iniciar Rutina" en RoutineDetailScreen.tsx
function RoutineDetailScreen({ routineId }) {
  const navigate = useNavigation();
  
  const handleStart = () => {
    navigate('RoutineExecution', { routineId });
  };
  
  return <Button onPress={handleStart}>Iniciar</Button>;
}

// 2️⃣ RoutineExecutionScreen usa hook personalizado
function RoutineExecutionScreen({ route }) {
  const { routineId } = route.params;
  const { routine, currentExercise, markComplete, finish } = 
    useRoutineExecution(routineId);
  
  return (
    <View>
      <ExerciseCard exercise={currentExercise} />
      <Button onPress={markComplete}>Completar</Button>
      <Button onPress={finish}>Finalizar Rutina</Button>
    </View>
  );
}

// 3️⃣ Hook personalizado consume el store
// presentation/hooks/useRoutineExecution.ts
export function useRoutineExecution(routineId: string) {
  const { 
    currentRoutine, 
    executeRoutine, 
    markExerciseComplete,
    finishRoutine
  } = useRoutinesStore();
  
  useEffect(() => {
    executeRoutine(routineId); // ← llama al store
  }, [routineId]);
  
  return {
    routine: currentRoutine,
    currentExercise: currentRoutine?.exercises[0],
    markComplete: () => markExerciseComplete(0),
    finish: () => finishRoutine(routineId),
  };
}

// 4️⃣ Store llama a Use Cases via DI
// presentation/state/routines.store.ts
export const useRoutinesStore = create<RoutinesState>((set) => ({
  currentRoutine: null,
  
  executeRoutine: async (id) => {
    set({ loading: true });
    const routine = await DI.getRoutineById.execute(id); // ← UseCase
    set({ currentRoutine: routine, loading: false });
  },
  
  finishRoutine: async (id) => {
    const session: RoutineSession = {
      routineId: id,
      date: new Date(),
      completed: true,
    };
    await DI.executeRoutine.execute(session); // ← UseCase
    set({ currentRoutine: null });
  },
}));

// 5️⃣ Use Case aplica lógica de negocio
// domain/usecases/ExecuteRoutine.ts
export class ExecuteRoutine {
  constructor(private repository: RoutineRepository) {}
  
  async execute(session: RoutineSession): Promise<void> {
    // Reglas de negocio
    if (!session.completed) {
      throw new Error('Debe completar todos los ejercicios');
    }
    
    // Delega a Repository
    await this.repository.saveSession(session);
  }
}

// 6️⃣ Repository guarda en datasource
// data/RoutineRepositoryImpl.ts
export class RoutineRepositoryImpl implements RoutineRepository {
  async saveSession(session: RoutineSession): Promise<void> {
    const dto = mapRoutineSessionToDTO(session);
    await RoutineLocal.saveSession(dto); // ← AsyncStorage
  }
}

// 7️⃣ DataSource persiste localmente
// data/datasources/RoutineLocal.ts
export const RoutineLocal = {
  async saveSession(dto: RoutineSessionDTO): Promise<void> {
    const sessions = await AsyncStorage.getItem('routine_sessions');
    const list = sessions ? JSON.parse(sessions) : [];
    list.push(dto);
    await AsyncStorage.setItem('routine_sessions', JSON.stringify(list));
  }
};
```

---

### Ejemplo 2: DTO vs Entity (Mappers)

#### API Response (DTO):

```json
{
  "id_routine": 123,
  "routine_name": "Full Body Workout",
  "difficulty_level": 2,
  "estimated_time_minutes": 45,
  "exercises": "Squats,Push-ups,Deadlifts",
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### Mapper:

```typescript
// data/mappers/routine.mapper.ts
export function mapRoutineDTOToEntity(dto: RoutineDTO): Routine {
  return {
    id: dto.id_routine.toString(),      // number → string
    name: dto.routine_name,              // snake_case → camelCase
    difficulty: mapDifficulty(dto.difficulty_level), // number → enum
    duration: dto.estimated_time_minutes, // rename
    exercises: dto.exercises.split(','), // string → string[]
    // created_at no se incluye (no es relevante para el dominio)
  };
}

function mapDifficulty(level: number): Difficulty {
  switch (level) {
    case 1: return 'beginner';
    case 2: return 'intermediate';
    case 3: return 'advanced';
    default: return 'intermediate';
  }
}
```

#### Domain Entity:

```typescript
// domain/entities/Routine.ts
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Routine {
  id: string;
  name: string;
  difficulty: Difficulty;
  duration: number;
  exercises: string[];
}
```

**¿Por qué es importante?**

| Aspecto | DTO (API) | Entity (Domain) |
|---------|-----------|-----------------|
| **Propósito** | Transportar datos | Modelar negocio |
| **Nombrado** | snake_case (backend) | camelCase (frontend) |
| **Tipos** | strings, numbers | tipos específicos (enums, custom) |
| **Campos** | Todos los de API | Solo los necesarios |
| **Mutabilidad** | Inmutable | Puede tener lógica |

---

## 📊 Ventajas de la Arquitectura Actual

### ✅ Separación de Responsabilidades

- **Domain:** Lógica de negocio pura, sin dependencias
- **Data:** Implementación de acceso a datos, oculta detalles
- **Presentation:** UI y estado, no sabe de APIs ni DTOs

### ✅ Testabilidad

```typescript
// Test de Use Case (SIN React, SIN API)
describe('ExecuteRoutine', () => {
  it('should throw if routine is not completed', async () => {
    const mockRepo = { saveSession: jest.fn() };
    const useCase = new ExecuteRoutine(mockRepo);
    
    const session = { routineId: '1', completed: false };
    
    await expect(useCase.execute(session))
      .rejects.toThrow('Debe completar todos los ejercicios');
    
    expect(mockRepo.saveSession).not.toHaveBeenCalled();
  });
});
```

### ✅ Mantenibilidad

- **Cambio de API:** Solo modificas `data/` (DTOs y mappers)
- **Cambio de UI:** Solo modificas `presentation/` (componentes)
- **Cambio de regla de negocio:** Solo modificas `domain/` (use cases)

### ✅ Escalabilidad

- Agregar nueva feature = copiar estructura de 3 capas
- Agregar nueva fuente de datos = nueva implementación de Repository
- Agregar nueva pantalla = nuevo componente en `presentation/ui/`

### ✅ Reutilización

- Use Cases pueden usarse desde múltiples UIs (mobile, web, CLI)
- Entities son compartibles entre features
- Mappers se pueden invertir (Entity → DTO para POST)

---

## 🔍 Dependency Injection Container

```typescript
// di/container.ts - Diagrama de Wiring

Container
├── Auth
│   ├── authRepository: AuthRepositoryImpl
│   ├── loginUser: LoginUser(authRepository)
│   └── getMe: GetMe(authRepository)
│
├── Gyms
│   ├── gymRepository: GymRepositoryImpl
│   ├── scheduleRepository: ScheduleRepositoryImpl
│   ├── listNearbyGyms: ListNearbyGyms(gymRepository)
│   └── getSchedules: GetSchedulesForGyms(scheduleRepository)
│
├── Routines
│   ├── routineRepository: RoutineRepositoryImpl(RoutineLocal)
│   ├── getRoutines: GetRoutines(routineRepository)
│   ├── getRoutineById: GetRoutineById(routineRepository)
│   ├── executeRoutine: ExecuteRoutine(routineRepository)
│   └── getRoutineHistory: GetRoutineHistory(routineRepository)
│
├── Rewards
│   ├── rewardRepository: RewardRepositoryImpl(RewardLocal)
│   ├── getAvailableRewards: GetAvailableRewards(rewardRepository)
│   ├── generateRewardCode: GenerateRewardCode(rewardRepository)
│   └── getGeneratedCodes: GetGeneratedCodes(rewardRepository)
│
├── Home
│   ├── homeRepository: HomeRepositoryImpl
│   ├── getHomeStats: GetHomeStats(homeRepository)
│   ├── getWeeklyProgress: GetWeeklyProgress(homeRepository)
│   └── getDailyChallenge: GetDailyChallenge(homeRepository)
│
└── User
    ├── userRepository: UserRepositoryImpl
    ├── getUserProfile: GetUserProfile(userRepository)
    ├── updateUserSettings: UpdateUserSettings(userRepository)
    └── upgradeToPremium: UpgradeToPremium(userRepository)
```

**Uso desde Presentation:**

```typescript
// presentation/state/routines.store.ts
const routines = await DI.getRoutines.execute();

// presentation/hooks/useNearbyGyms.ts
const gyms = await DI.listNearbyGyms.execute(lat, lng, radius);

// presentation/state/home.store.ts
const stats = await DI.getHomeStats.execute();
```

---

## 📚 Glosario

| Término | Definición |
|---------|------------|
| **Entity** | Objeto de negocio con identidad única (ej: `Gym`, `Routine`) |
| **DTO** | Data Transfer Object - estructura de datos de API/BD |
| **Repository** | Patrón que abstrae el acceso a datos |
| **Use Case** | Regla de negocio específica (ej: "Listar gimnasios cercanos") |
| **Mapper** | Función que convierte DTO ↔ Entity |
| **DataSource** | Fuente de datos (API, Local, Mock) |
| **Store** | Estado global reactivo (Zustand) |
| **Barrel** | Archivo `index.ts` que re-exporta módulos |
| **DI** | Dependency Injection - inyectar dependencias |
| **Dependency Rule** | Las dependencias solo fluyen hacia el dominio |

---

## 🎓 Principios SOLID Aplicados

| Principio | Aplicación en GymPoint |
|-----------|------------------------|
| **S - Single Responsibility** | Cada Use Case tiene una responsabilidad única |
| **O - Open/Closed** | Agregar datasources sin modificar Repository |
| **L - Liskov Substitution** | Cualquier implementación de Repository es intercambiable |
| **I - Interface Segregation** | Interfaces pequeñas y específicas (ej: `GymRepository`) |
| **D - Dependency Inversion** | Presentation depende de abstracciones (Use Cases), no de implementaciones |

---

## 📝 Checklist de Nueva Feature

Para agregar una nueva feature siguiendo la arquitectura:

1. ✅ Crear carpeta `features/<nueva-feature>/`
2. ✅ Definir **Entities** en `domain/entities/`
3. ✅ Definir **Repository Interface** en `domain/repositories/`
4. ✅ Crear **Use Cases** en `domain/usecases/`
5. ✅ Definir **DTOs** en `data/dto/`
6. ✅ Crear **Mappers** en `data/mappers/`
7. ✅ Implementar **Repository** en `data/<Feature>RepositoryImpl.ts`
8. ✅ Crear **DataSource** en `data/datasources/`
9. ✅ Registrar en **DI Container** (`di/container.ts`)
10. ✅ Crear **Store** en `presentation/state/`
11. ✅ Crear **Hooks** en `presentation/hooks/`
12. ✅ Crear **UI Components** en `presentation/ui/`
13. ✅ Crear **Screens** en `presentation/ui/screens/`
14. ✅ Crear **Barrel Exports** (`index.ts`)
15. ✅ Actualizar navegación si es necesario

---

## 🔗 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Zustand - State Management](https://github.com/pmndrs/zustand)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

---

**Generado:** 2 de Octubre, 2025  
**Versión:** 1.0  
**Proyecto:** GymPoint Mobile  
**Arquitectura:** Clean Architecture (3 Capas)

