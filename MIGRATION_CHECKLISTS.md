# ✅ Checklists de Migración - GymPoint Clean Architecture

## 📖 Cómo usar este documento

Cada fase tiene su propia checklist. Marca cada item con `[x]` cuando lo completes.

Después de cada commit:
1. ✅ Compilar sin errores
2. ✅ Ejecutar app en simulador/dispositivo
3. ✅ Probar feature afectada manualmente
4. ✅ Verificar no hay warnings de imports

---

## 🔵 FASE 0: Preparación

### Commit 0.1: Setup inicial

```bash
# Branch
git checkout -b clean-architecture-migration
git checkout -b phase-0-setup
```

**Checklist:**
- [ ] Backup del proyecto actual
- [ ] Actualizar `tsconfig.json`:
  - [ ] Agregar paths para @features/auth/data, domain, state, ui
  - [ ] Agregar paths para @features/gyms/data, domain, state, ui
  - [ ] Agregar paths para @features/routines/data, domain, state, ui
  - [ ] Agregar paths para @features/rewards/data, domain, state, ui
  - [ ] Agregar paths para @features/home/data, domain, state, ui
  - [ ] Agregar paths para @features/user/data, domain, state, ui
- [ ] Actualizar `babel.config.js`:
  - [ ] Verificar que aliases coinciden con tsconfig
- [ ] Limpiar cache:
  ```bash
  npx expo start -c
  ```
- [ ] Verificar app funciona sin cambios

**Testing:**
- [ ] App compila
- [ ] Todas las screens visibles
- [ ] Sin errores en consola

**Commit:**
```bash
git add tsconfig.json babel.config.js
git commit -m "feat: setup paths and aliases for clean architecture"
git push origin phase-0-setup
# Merge to main después de testing
```

---

## 🟢 FASE 1: Fusionar gymdetails → gyms

### Commit 1.1: Reorganizar UI de gyms

```bash
git checkout -b phase-1-gyms-fusion
```

**Checklist:**
- [ ] Crear carpetas:
  ```bash
  mkdir -p src/features/gyms/ui/screens
  mkdir -p src/features/gyms/ui/components/map
  mkdir -p src/features/gyms/ui/components/list
  mkdir -p src/features/gyms/ui/components/detail
  ```
- [ ] Mover screens:
  - [ ] `gyms/ui/MapScreen.tsx` → `gyms/ui/screens/MapScreen.tsx`
  - [ ] `gyms/ui/MapView.tsx` → `gyms/ui/screens/MapView.tsx`
  - [ ] `gyms/ui/MapView.web.tsx` → `gyms/ui/screens/MapView.web.tsx`
  - [ ] `gymdetails/ui/GymDetailScreen.tsx` → `gyms/ui/screens/GymDetailScreen.tsx`
  - [ ] `gymdetails/ui/GymDetailScreenWrapper.tsx` → `gyms/ui/screens/GymDetailScreenWrapper.tsx`
  - [ ] `gymdetails/ui/GymDetailScreenTest.tsx` → `gyms/ui/screens/GymDetailScreenTest.tsx`
- [ ] Mover componentes de mapa:
  - [ ] Archivos de `gyms/ui/components/` relacionados con mapa → `gyms/ui/components/map/`
- [ ] Mover componentes de lista:
  - [ ] Archivos de `gyms/ui/components/` relacionados con lista → `gyms/ui/components/list/`
- [ ] Mover componentes de detalle:
  - [ ] Todos los archivos de `gymdetails/ui/components/` → `gyms/ui/components/detail/`
- [ ] Crear barril `gyms/ui/screens/index.ts`:
  ```typescript
  export { default as MapScreen } from './MapScreen';
  export { default as GymDetailScreen } from './GymDetailScreen';
  export { default as GymDetailScreenWrapper } from './GymDetailScreenWrapper';
  // etc...
  ```
- [ ] Crear barril `gyms/ui/components/map/index.ts`
- [ ] Crear barril `gyms/ui/components/list/index.ts`
- [ ] Crear barril `gyms/ui/components/detail/index.ts`
- [ ] Actualizar `gyms/ui/index.ts`:
  ```typescript
  export * from './screens';
  export * from './components/map';
  export * from './components/list';
  export * from './components/detail';
  ```
- [ ] Actualizar imports en `presentation/navigation/`:
  - [ ] Cambiar imports de MapScreen
  - [ ] Cambiar imports de GymDetailScreen
- [ ] Actualizar imports internos en componentes movidos

**Testing:**
- [ ] App compila sin errores
- [ ] Navegar a pantalla de mapa → funciona
- [ ] Seleccionar un gym → ver detalle → funciona
- [ ] Todos los componentes se renderizan correctamente

**Commit:**
```bash
git add src/features/gyms/ui/
git add src/presentation/navigation/
git commit -m "refactor(gyms): reorganize UI layer with screens and components folders"
```

---

### Commit 1.2: Limpiar gymdetails

**Checklist:**
- [ ] Buscar todos los imports de `@features/gymdetails`:
  ```bash
  # Windows PowerShell
  Select-String -Path "src/**/*.tsx" -Pattern "gymdetails" -Recursive
  ```
- [ ] Reemplazar imports restantes a nuevas rutas de gyms
- [ ] Eliminar carpeta:
  ```bash
  rm -rf src/features/gymdetails
  ```
- [ ] Actualizar `gyms/index.ts` si es necesario

**Testing:**
- [ ] App compila sin errores
- [ ] Buscar "gymdetails" en todo el proyecto → 0 resultados
- [ ] Pantalla de mapa funciona
- [ ] Pantalla de detalle funciona
- [ ] Navegación entre pantallas funciona

**Commit:**
```bash
git add .
git commit -m "refactor(gyms): remove gymdetails feature, fully integrated into gyms"
git push origin phase-1-gyms-fusion
# Merge to main
```

---

## 🟡 FASE 2: Migrar ROUTINES

### Commit 2.1: Crear estructura domain

```bash
git checkout -b phase-2-routines
```

**Checklist:**
- [ ] Crear carpetas:
  ```bash
  mkdir -p src/features/routines/domain/entities
  mkdir -p src/features/routines/domain/repositories
  mkdir -p src/features/routines/domain/usecases
  ```
- [ ] Leer `routines/types.ts` y extraer tipos
- [ ] Crear `domain/entities/Routine.ts`:
  - [ ] Mover/adaptar tipo Routine
  - [ ] Convertir a clase o mantener como interface
- [ ] Crear `domain/entities/Exercise.ts`:
  - [ ] Mover/adaptar tipo Exercise
- [ ] Crear `domain/entities/RoutineHistory.ts`:
  - [ ] Mover/adaptar tipo RoutineHistory
- [ ] Crear `domain/repositories/RoutineRepository.ts`:
  ```typescript
  export interface RoutineRepository {
    getAll(): Promise<Routine[]>;
    getById(id: number): Promise<Routine>;
    // otros métodos...
  }
  ```
- [ ] Crear use cases:
  - [ ] `domain/usecases/GetRoutines.ts`
  - [ ] `domain/usecases/GetRoutineById.ts`
  - [ ] `domain/usecases/ExecuteRoutine.ts`
  - [ ] `domain/usecases/GetRoutineHistory.ts`
- [ ] Crear barriles:
  - [ ] `domain/entities/index.ts`
  - [ ] `domain/repositories/index.ts`
  - [ ] `domain/usecases/index.ts`
  - [ ] `domain/index.ts`

**Testing:**
- [ ] TypeScript compila sin errores
- [ ] No hay imports circulares
- [ ] Domain no importa nada de data/ui/state

**Commit:**
```bash
git add src/features/routines/domain/
git commit -m "feat(routines): create domain layer with entities, repositories, and use cases"
```

---

### Commit 2.2: Crear capa data (con mocks)

**Checklist:**
- [ ] Crear carpetas:
  ```bash
  mkdir -p src/features/routines/data/dto
  mkdir -p src/features/routines/data/mappers
  mkdir -p src/features/routines/data/datasources
  ```
- [ ] Crear `data/dto/RoutineDTO.ts`:
  - [ ] Definir estructura que vendría del backend
  - [ ] ExerciseDTO, RoutineHistoryDTO
- [ ] Crear `data/mappers/routine.mapper.ts`:
  ```typescript
  export const mapRoutineDTOToEntity = (dto: RoutineDTO): Routine => {
    // implementación
  };
  ```
- [ ] Mover mocks:
  - [ ] `mocks/routines.mock.ts` → `data/datasources/RoutineLocal.ts`
  - [ ] Adaptar a clase con métodos fetchAll(), fetchById(), etc.
- [ ] Crear `data/RoutineRepositoryImpl.ts`:
  ```typescript
  export class RoutineRepositoryImpl implements RoutineRepository {
    constructor(private local: RoutineLocal) {}
    // implementar métodos
  }
  ```
- [ ] Crear barriles:
  - [ ] `data/dto/index.ts`
  - [ ] `data/mappers/index.ts`
  - [ ] `data/datasources/index.ts`
  - [ ] `data/index.ts`

**Testing:**
- [ ] TypeScript compila
- [ ] RoutineRepositoryImpl implementa RoutineRepository correctamente
- [ ] Mappers convierten DTOs a Entities

**Commit:**
```bash
git add src/features/routines/data/
git commit -m "feat(routines): create data layer with DTOs, mappers, and local datasource"
```

---

### Commit 2.3: Configurar DI

**Checklist:**
- [ ] Abrir `src/di/container.ts`
- [ ] Agregar imports:
  ```typescript
  import { RoutineRepository } from '@features/routines/domain/repositories/RoutineRepository';
  import { RoutineRepositoryImpl } from '@features/routines/data/RoutineRepositoryImpl';
  import { RoutineLocal } from '@features/routines/data/datasources/RoutineLocal';
  import { GetRoutines } from '@features/routines/domain/usecases/GetRoutines';
  import { GetRoutineById } from '@features/routines/domain/usecases/GetRoutineById';
  // otros usecases...
  ```
- [ ] Agregar propiedades a clase Container:
  ```typescript
  // Routines
  routineLocal: RoutineLocal;
  routineRepository: RoutineRepository;
  getRoutines: GetRoutines;
  getRoutineById: GetRoutineById;
  // otros usecases...
  ```
- [ ] Inicializar en constructor:
  ```typescript
  // Routines
  this.routineLocal = new RoutineLocal();
  this.routineRepository = new RoutineRepositoryImpl(this.routineLocal);
  this.getRoutines = new GetRoutines(this.routineRepository);
  this.getRoutineById = new GetRoutineById(this.routineRepository);
  // otros usecases...
  ```

**Testing:**
- [ ] App compila
- [ ] DI se instancia correctamente
- [ ] Probar en consola: `console.log(DI.getRoutines)`

**Commit:**
```bash
git add src/di/container.ts
git commit -m "feat(routines): configure dependency injection container"
```

---

### Commit 2.4: Crear store Zustand

**Checklist:**
- [ ] Crear carpeta:
  ```bash
  mkdir -p src/features/routines/state
  ```
- [ ] Crear `state/routines.store.ts`:
  ```typescript
  import { create } from 'zustand';
  import { DI } from '@di/container';
  import { Routine } from '../domain/entities/Routine';

  interface RoutinesState {
    routines: Routine[];
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchRoutines: () => Promise<void>;
    fetchRoutineById: (id: number) => Promise<Routine | null>;
    // otros métodos...
  }

  export const useRoutinesStore = create<RoutinesState>((set, get) => ({
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

    fetchRoutineById: async (id: number) => {
      // implementación
    },
  }));
  ```
- [ ] Migrar lógica de filtros desde `useRoutinesFilters.ts` al store
- [ ] Migrar lógica de ejecución desde `useRoutineExecution.ts` al store
- [ ] Crear barrel `state/index.ts`

**Testing:**
- [ ] App compila
- [ ] Store se puede importar
- [ ] En algún componente temporal probar: `const { fetchRoutines } = useRoutinesStore()`

**Commit:**
```bash
git add src/features/routines/state/
git commit -m "feat(routines): create Zustand store with business logic"
```

---

### Commit 2.5: Refactorizar hooks

**Checklist:**
- [ ] Abrir `hooks/useRoutines.ts`
- [ ] Reemplazar lógica interna por llamadas al store:
  ```typescript
  export function useRoutines() {
    const { routines, loading, error, fetchRoutines } = useRoutinesStore();

    useEffect(() => {
      fetchRoutines();
    }, []);

    return { routines, loading, error };
  }
  ```
- [ ] Actualizar `hooks/useRoutineById.ts` similarmente
- [ ] Actualizar `hooks/useRoutineExecution.ts` similarmente
- [ ] Actualizar `hooks/useRoutineHistory.ts` similarmente
- [ ] Actualizar `hooks/index.ts` si es necesario

**Testing:**
- [ ] App compila
- [ ] Hooks siguen exportando la misma interfaz
- [ ] No rompe componentes que usan estos hooks

**Commit:**
```bash
git add src/features/routines/hooks/
git commit -m "refactor(routines): update hooks to consume Zustand store"
```

---

### Commit 2.6: Reorganizar UI

**Checklist:**
- [ ] Crear carpeta:
  ```bash
  mkdir -p src/features/routines/ui/screens
  ```
- [ ] Mover screens:
  - [ ] `ui/RoutinesScreen.tsx` → `ui/screens/RoutinesScreen.tsx`
  - [ ] `ui/RoutineDetailScreen.tsx` → `ui/screens/RoutineDetailScreen.tsx`
  - [ ] `ui/RoutineExecutionScreen.tsx` → `ui/screens/RoutineExecutionScreen.tsx`
  - [ ] `ui/RoutineHistoryScreen.tsx` → `ui/screens/RoutineHistoryScreen.tsx`
- [ ] Crear barrel `ui/screens/index.ts`:
  ```typescript
  export { default as RoutinesScreen } from './RoutinesScreen';
  export { default as RoutineDetailScreen } from './RoutineDetailScreen';
  export { default as RoutineExecutionScreen } from './RoutineExecutionScreen';
  export { default as RoutineHistoryScreen } from './RoutineHistoryScreen';
  ```
- [ ] Actualizar `ui/index.ts`:
  ```typescript
  export * from './screens';
  export * from './components';
  ```
- [ ] Actualizar `routines/index.ts` principal:
  ```typescript
  export * from './ui';
  export * from './hooks';
  // NO exportar data/domain/state (privado)
  ```
- [ ] Actualizar imports en `presentation/navigation/`

**Testing:**
- [ ] App compila
- [ ] Navegar a RoutinesScreen → funciona
- [ ] Abrir detalle de routine → funciona
- [ ] Ejecutar routine → funciona
- [ ] Ver historial → funciona
- [ ] Todos los datos se cargan correctamente desde store

**Commit:**
```bash
git add src/features/routines/
git add src/presentation/navigation/
git commit -m "refactor(routines): reorganize UI layer, complete clean architecture migration"
git push origin phase-2-routines
# Testing exhaustivo antes de merge
# Merge to main
```

---

## 🟡 FASE 3: Migrar REWARDS

### Commit 3.1: Crear estructura domain

```bash
git checkout -b phase-3-rewards
```

**Checklist:**
- [ ] Crear carpetas:
  ```bash
  mkdir -p src/features/rewards/domain/entities
  mkdir -p src/features/rewards/domain/repositories
  mkdir -p src/features/rewards/domain/usecases
  ```
- [ ] Leer `rewards/types.ts`
- [ ] Crear `domain/entities/Reward.ts`
- [ ] Crear `domain/entities/GeneratedCode.ts`
- [ ] Crear `domain/repositories/RewardRepository.ts`:
  ```typescript
  export interface RewardRepository {
    getAvailableRewards(isPremium: boolean): Promise<Reward[]>;
    generateCode(rewardId: string): Promise<GeneratedCode>;
    getGeneratedCodes(): Promise<GeneratedCode[]>;
  }
  ```
- [ ] Crear use cases:
  - [ ] `domain/usecases/GetAvailableRewards.ts`
  - [ ] `domain/usecases/GenerateRewardCode.ts`
  - [ ] `domain/usecases/GetGeneratedCodes.ts`
- [ ] Crear barriles

**Testing:**
- [ ] TypeScript compila
- [ ] Domain no importa nada externo

**Commit:**
```bash
git add src/features/rewards/domain/
git commit -m "feat(rewards): create domain layer"
```

---

### Commit 3.2: Reorganizar capa data

**Checklist:**
- [ ] Crear carpetas:
  ```bash
  mkdir -p src/features/rewards/data/dto
  mkdir -p src/features/rewards/data/mappers
  mkdir -p src/features/rewards/data/datasources
  ```
- [ ] Crear `data/dto/RewardDTO.ts`
- [ ] Crear `data/mappers/reward.mapper.ts`
- [ ] Mover `data/rewardsData.ts` → `data/datasources/RewardLocal.ts`
  - [ ] Adaptar a clase con métodos
- [ ] Crear `data/RewardRepositoryImpl.ts`
- [ ] Actualizar barriles

**Testing:**
- [ ] TypeScript compila
- [ ] RepositoryImpl implementa interface correctamente

**Commit:**
```bash
git add src/features/rewards/data/
git commit -m "feat(rewards): reorganize data layer with proper structure"
```

---

### Commit 3.3: Configurar DI

**Checklist:**
- [ ] Actualizar `src/di/container.ts`:
  - [ ] Importar Reward classes
  - [ ] Agregar propiedades
  - [ ] Inicializar en constructor

**Testing:**
- [ ] App compila
- [ ] DI funciona

**Commit:**
```bash
git add src/di/container.ts
git commit -m "feat(rewards): configure DI container"
```

---

### Commit 3.4: Crear store Zustand

**Checklist:**
- [ ] Crear `state/rewards.store.ts`
- [ ] Migrar lógica de `hooks/useRewards.ts` al store:
  - [ ] activeTab
  - [ ] generatedCodes
  - [ ] handleGenerate
  - [ ] handleCopy
  - [ ] handleToggleCode
- [ ] Conectar con usecases desde DI
- [ ] Crear barrel

**Testing:**
- [ ] App compila
- [ ] Store accesible

**Commit:**
```bash
git add src/features/rewards/state/
git commit -m "feat(rewards): create Zustand store"
```

---

### Commit 3.5: Refactorizar UI

**Checklist:**
- [ ] Actualizar `hooks/useRewards.ts` para consumir store
- [ ] Crear `ui/screens/` folder
- [ ] Mover `ui/RewardsScreen.tsx` → `ui/screens/RewardsScreen.tsx`
- [ ] Crear barriles
- [ ] Actualizar navigation imports
- [ ] Actualizar `rewards/index.ts`

**Testing:**
- [ ] App compila
- [ ] Navegar a RewardsScreen → funciona
- [ ] Ver rewards disponibles → funciona
- [ ] Generar código → funciona
- [ ] Copiar código → funciona
- [ ] Marcar código como usado → funciona

**Commit:**
```bash
git add src/features/rewards/
git add src/presentation/navigation/
git commit -m "refactor(rewards): complete clean architecture migration"
git push origin phase-3-rewards
# Merge to main
```

---

## 🟡 FASE 4: Migrar HOME

### Commit 4.1: Crear estructura domain

```bash
git checkout -b phase-4-home
```

**Checklist:**
- [ ] Crear carpetas domain
- [ ] Crear entities:
  - [ ] `domain/entities/HomeStats.ts`
  - [ ] `domain/entities/WeeklyProgress.ts`
  - [ ] `domain/entities/DailyChallenge.ts`
- [ ] Crear `domain/repositories/HomeRepository.ts`
- [ ] Crear use cases:
  - [ ] `GetHomeStats.ts`
  - [ ] `GetWeeklyProgress.ts`
  - [ ] `GetDailyChallenge.ts`
- [ ] Crear barriles

**Testing:**
- [ ] TypeScript compila

**Commit:**
```bash
git add src/features/home/domain/
git commit -m "feat(home): create domain layer"
```

---

### Commit 4.2: Crear capa data

**Checklist:**
- [ ] Crear carpetas data
- [ ] Crear `data/dto/HomeStatsDTO.ts`
- [ ] Crear `data/mappers/homeStats.mapper.ts`
- [ ] Crear `data/HomeRepositoryImpl.ts` (con mocks temporales)
- [ ] Crear barriles

**Testing:**
- [ ] TypeScript compila

**Commit:**
```bash
git add src/features/home/data/
git commit -m "feat(home): create data layer"
```

---

### Commit 4.3: Configurar DI

**Checklist:**
- [ ] Actualizar `src/di/container.ts`
- [ ] Agregar home repository y usecases

**Testing:**
- [ ] App compila

**Commit:**
```bash
git add src/di/container.ts
git commit -m "feat(home): configure DI container"
```

---

### Commit 4.4: Crear store Zustand

**Checklist:**
- [ ] Crear `state/home.store.ts`
- [ ] Migrar lógica desde `hooks/useHome.ts`:
  - [ ] user state
  - [ ] weekly progress
  - [ ] permissions
- [ ] Conectar con usecases
- [ ] Crear barrel

**Testing:**
- [ ] App compila

**Commit:**
```bash
git add src/features/home/state/
git commit -m "feat(home): create Zustand store"
```

---

### Commit 4.5: Refactorizar UI

**Checklist:**
- [ ] Actualizar `hooks/useHome.ts` para consumir store
- [ ] Crear `ui/screens/`
- [ ] Mover `ui/HomeScreen.tsx` → `ui/screens/HomeScreen.tsx`
- [ ] Crear barriles
- [ ] Actualizar navigation
- [ ] Actualizar `home/index.ts`

**Testing:**
- [ ] App compila
- [ ] HomeScreen funciona
- [ ] Progreso semanal se muestra
- [ ] Banner de permisos funciona
- [ ] Quick actions funcionan
- [ ] Premium banner visible

**Commit:**
```bash
git add src/features/home/
git add src/presentation/navigation/
git commit -m "refactor(home): complete clean architecture migration"
git push origin phase-4-home
# Merge to main
```

---

## 🟡 FASE 5: Migrar USER

### Commit 5.1: Crear estructura domain

```bash
git checkout -b phase-5-user
```

**Checklist:**
- [ ] Crear carpetas domain
- [ ] Leer `types/userTypes.ts`
- [ ] Crear entities:
  - [ ] `domain/entities/UserProfile.ts`
  - [ ] `domain/entities/UserStats.ts`
  - [ ] `domain/entities/NotificationSettings.ts`
- [ ] Crear `domain/repositories/UserRepository.ts`
- [ ] Crear use cases:
  - [ ] `GetUserProfile.ts`
  - [ ] `UpdateUserSettings.ts`
  - [ ] `UpgradeToPremium.ts`
- [ ] Crear barriles

**Testing:**
- [ ] TypeScript compila

**Commit:**
```bash
git add src/features/user/domain/
git commit -m "feat(user): create domain layer"
```

---

### Commit 5.2: Crear capa data

**Checklist:**
- [ ] Crear carpetas data
- [ ] Crear `data/dto/UserProfileDTO.ts`
- [ ] Crear `data/mappers/userProfile.mapper.ts`
- [ ] Crear `data/UserRepositoryImpl.ts`
- [ ] Crear barriles

**Testing:**
- [ ] TypeScript compila

**Commit:**
```bash
git add src/features/user/data/
git commit -m "feat(user): create data layer"
```

---

### Commit 5.3: Configurar DI

**Checklist:**
- [ ] Actualizar `src/di/container.ts`
- [ ] Agregar user repository y usecases

**Testing:**
- [ ] App compila

**Commit:**
```bash
git add src/di/container.ts
git commit -m "feat(user): configure DI container"
```

---

### Commit 5.4: Crear store Zustand

**Checklist:**
- [ ] Crear `state/userProfile.store.ts`
- [ ] Migrar lógica de estado desde `UserProfileScreen.tsx`:
  - [ ] notifications state
  - [ ] location settings
  - [ ] premium modal
- [ ] Conectar con usecases
- [ ] Crear barrel

**Testing:**
- [ ] App compila

**Commit:**
```bash
git add src/features/user/state/
git commit -m "feat(user): create Zustand store"
```

---

### Commit 5.5: Reorganizar UI

**Checklist:**
- [ ] Carpeta `screens/` ya existe, mantener
- [ ] Carpeta `components/` ya existe, mantener
- [ ] Crear `ui/index.ts` barrel
- [ ] Actualizar navigation si es necesario

**Testing:**
- [ ] App compila

**Commit:**
```bash
git add src/features/user/ui/
git commit -m "refactor(user): reorganize UI layer"
```

---

### Commit 5.6: Refactorizar screen

**Checklist:**
- [ ] Abrir `screens/UserProfileScreen.tsx`
- [ ] Reemplazar estado local por `useUserProfileStore()`
- [ ] Mover lógica de negocio al store
- [ ] Mantener solo lógica de presentación en screen
- [ ] Actualizar `user/index.ts`

**Testing:**
- [ ] App compila
- [ ] UserProfileScreen funciona
- [ ] Ver perfil → OK
- [ ] Cambiar notificaciones → OK
- [ ] Cambiar location settings → OK
- [ ] Modal premium → OK
- [ ] Logout → OK

**Commit:**
```bash
git add src/features/user/
git add src/presentation/navigation/
git commit -m "refactor(user): complete clean architecture migration"
git push origin phase-5-user
# Merge to main
```

---

## 🔵 FASE 6: Limpieza y optimización

### Commit 6.1: Revisar shared components

```bash
git checkout -b phase-6-cleanup
```

**Checklist:**
- [ ] Buscar componentes acoplados a features:
  ```bash
  # Revisar estos archivos
  src/shared/components/ui/GymListItem.tsx
  src/shared/components/ui/RoutineCard.tsx
  src/shared/components/ui/RewardCard.tsx
  src/shared/components/ui/ExerciseCard.tsx
  ```
- [ ] Decidir si mover o mantener en shared
- [ ] Si mover:
  - [ ] `GymListItem.tsx` → `gyms/ui/components/list/`
  - [ ] `RoutineCard.tsx` → `routines/ui/components/`
  - [ ] `RewardCard.tsx` → `rewards/ui/components/`
  - [ ] `ExerciseCard.tsx` → `routines/ui/components/`
- [ ] Actualizar imports
- [ ] Actualizar `shared/components/ui/index.ts`

**Testing:**
- [ ] App compila
- [ ] Todas las features funcionan

**Commit:**
```bash
git add src/features/
git add src/shared/
git commit -m "refactor(shared): move feature-specific components to respective features"
```

---

### Commit 6.2: Optimizar barriles

**Checklist:**
- [ ] Revisar todos los `index.ts`:
  - [ ] `features/auth/index.ts`
  - [ ] `features/gyms/index.ts`
  - [ ] `features/routines/index.ts`
  - [ ] `features/rewards/index.ts`
  - [ ] `features/home/index.ts`
  - [ ] `features/user/index.ts`
- [ ] Asegurar que solo exportan lo público (UI, hooks)
- [ ] NO exportar data/domain/state directamente
- [ ] Agregar comentarios JSDoc si es necesario
- [ ] Eliminar exports no usados

**Testing:**
- [ ] App compila
- [ ] No hay warnings

**Commit:**
```bash
git add src/features/*/index.ts
git commit -m "refactor: optimize barrel exports, keep internal layers private"
```

---

### Commit 6.3: Documentación y cleanup

**Checklist:**
- [ ] Buscar archivos no usados:
  ```bash
  # Buscar imports no usados
  # Herramienta: ts-prune (opcional)
  npx ts-prune
  ```
- [ ] Eliminar archivos viejos:
  - [ ] `features/*/types.ts` duplicados (si entities ya existen)
  - [ ] Archivos `.old`, `.bak`
  - [ ] Comentarios TODO antiguos
- [ ] Limpiar imports:
  - [ ] Usar organize imports de VS Code en todos los archivos modificados
- [ ] Limpiar cache:
  ```bash
  npx expo start -c
  ```
- [ ] Crear `ARCHITECTURE.md` en proyecto (opcional)
- [ ] Actualizar README.md con nueva estructura

**Testing:**
- [ ] App compila
- [ ] No hay warnings
- [ ] Bundle size similar o menor

**Commit:**
```bash
git add .
git commit -m "chore: cleanup unused files, organize imports, update documentation"
git push origin phase-6-cleanup
# Merge to main
```

---

## 🟣 FASE 7: Testing final

### Testing exhaustivo completo

```bash
git checkout main
git pull origin main
```

**Checklist de funcionalidad:**

#### Auth
- [ ] Login con credenciales válidas → OK
- [ ] Login con credenciales inválidas → error apropiado
- [ ] Registro de nuevo usuario → OK
- [ ] Navegación después de login → OK

#### Gyms
- [ ] Mapa carga correctamente
- [ ] Permisos de ubicación funcionan
- [ ] Markers se muestran en mapa
- [ ] Filtros funcionan
- [ ] Seleccionar gym → ver detalle
- [ ] Detalle muestra toda la información
- [ ] Navegación desde detalle funciona

#### Routines
- [ ] Lista de routines carga
- [ ] Filtros funcionan
- [ ] Buscar routine → OK
- [ ] Abrir detalle de routine → OK
- [ ] Ejecutar routine → OK
- [ ] Marcar ejercicios como completados → OK
- [ ] Ver historial → OK
- [ ] Datos persisten

#### Rewards
- [ ] Ver rewards disponibles
- [ ] Tabs funcionan (Available/Codes)
- [ ] Generar código → OK
- [ ] Código se resta de tokens
- [ ] Copiar código → OK
- [ ] Marcar código como usado → OK
- [ ] Premium upsell visible para free users

#### Home
- [ ] Stats se muestran correctamente
- [ ] Progreso semanal correcto
- [ ] Daily challenge visible
- [ ] Banner de permisos funciona
- [ ] Quick actions navegables
- [ ] Premium banner visible si free user

#### User
- [ ] Perfil muestra datos correctos
- [ ] Stats section visible
- [ ] Settings card funciona
- [ ] Notification toggles funcionan
- [ ] Location settings funcionan
- [ ] Premium modal abre/cierra
- [ ] Logout funciona
- [ ] Legal footer visible

**Checklist técnico:**

- [ ] No hay errores en consola
- [ ] No hay warnings de imports
- [ ] TypeScript compila sin errores
- [ ] Performance similar o mejor
- [ ] Bundle size aceptable
- [ ] App funciona en iOS (si aplica)
- [ ] App funciona en Android (si aplica)
- [ ] App funciona en Web (si aplica)
- [ ] Hot reload funciona
- [ ] No hay memory leaks aparentes

**Checklist de arquitectura:**

- [ ] Dependency Rule respetada
- [ ] No hay imports circulares
- [ ] DI Container completo
- [ ] Stores funcionan correctamente
- [ ] Use cases accesibles desde DI
- [ ] Repositories implementan interfaces
- [ ] DTOs se mapean a Entities
- [ ] Barriles exportan correctamente

**Documentación final:**

- [ ] `CLEAN_ARCHITECTURE_MIGRATION_PLAN.md` actualizado
- [ ] `ARCHITECTURE_DIAGRAM.md` refleja estado actual
- [ ] `README.md` actualizado
- [ ] `ARCHITECTURE.md` creado (opcional)

---

## ✅ MIGRACIÓN COMPLETADA

**¡Felicitaciones! 🎉**

Si todos los checklists están marcados, la migración a Clean Architecture está completa.

**Próximos pasos:**
1. ✅ Documentar aprendizajes
2. ✅ Entrenar al equipo en la nueva arquitectura
3. ✅ Establecer guías de contribución
4. ✅ Configurar linters para mantener arquitectura (eslint-plugin-boundaries)
5. ✅ Agregar tests unitarios para domain/data layers

**Mantenimiento:**
- Seguir la misma estructura para nuevas features
- Revisar periódicamente que no se rompa Dependency Rule
- Mantener DI Container actualizado
- Documentar decisiones arquitectónicas importantes

---

## 📞 Troubleshooting

### Error: Circular dependency
**Solución:** Verificar barriles, separar entidades compartidas

### Error: Cannot find module
**Solución:** 
1. Limpiar cache: `npx expo start -c`
2. Verificar paths en tsconfig.json y babel.config.js
3. Reiniciar TypeScript server en VS Code

### Error: Type mismatch
**Solución:** Verificar mappers, asegurar DTOs mapean correctamente a Entities

### Performance degradation
**Solución:** 
1. Verificar no hay re-renders innecesarios
2. Usar React.memo en componentes pesados
3. Verificar stores no tienen subscripciones innecesarias

---

**Happy coding! 🚀**

