# 📋 Plan de Migración a Clean Architecture - GymPoint Mobile

## 🎯 Objetivo
Reorganizar el código del frontend móvil (React Native/Expo) siguiendo principios de Clean Architecture, manteniendo el comportamiento actual al 100%.

---

## 📊 Estado Actual (Análisis)

### ✅ Features con Clean Architecture completa
- **auth**: ✅ Completo (data, domain, state, ui)
- **gyms**: ✅ Completo (data, domain, hooks, ui, utils)

### ⚠️ Features con Clean Architecture parcial
- **routines**: Tiene hooks, mocks, types, ui → **Falta data & domain**
- **rewards**: Tiene data (solo mocks), hooks, types, ui → **Falta domain real**
- **home**: Solo hooks y ui → **Falta data & domain**
- **user**: Solo components, screens, styles, types → **Falta todo**

### 🔄 Features a fusionar/reorganizar
- **gymdetails**: Solo ui y utils → **Fusionar con gyms**

---

## 1️⃣ CARPETAS A MOVER / CREAR

### 📁 Estructura objetivo por feature

```
src/features/
├── auth/                          ✅ YA COMPLETO - NO TOCAR
│   ├── data/
│   ├── domain/
│   ├── state/
│   └── ui/
│
├── gyms/                          ✅ YA COMPLETO - SOLO FUSIONAR gymdetails
│   ├── data/
│   ├── domain/
│   ├── state/                     🆕 CREAR (mover hooks que sean estado)
│   └── ui/
│       ├── screens/               🆕 CREAR
│       │   ├── MapScreen.tsx      ⬅️ MOVER desde ui/
│       │   └── GymDetailScreen.tsx ⬅️ MOVER desde gymdetails/ui/
│       └── components/            🆕 CREAR
│           ├── map/               ⬅️ MOVER componentes de mapa
│           ├── list/              ⬅️ MOVER componentes de lista
│           └── detail/            ⬅️ MOVER desde gymdetails/ui/components/
│
├── routines/                      ⚠️ MIGRAR A CLEAN
│   ├── data/                      🆕 CREAR
│   │   ├── dto/
│   │   │   └── RoutineDTO.ts
│   │   ├── mappers/
│   │   │   └── routine.mapper.ts
│   │   ├── datasources/
│   │   │   ├── RoutineRemote.ts
│   │   │   └── RoutineLocal.ts    (para mocks)
│   │   └── RoutineRepositoryImpl.ts
│   ├── domain/                    🆕 CREAR
│   │   ├── entities/
│   │   │   ├── Routine.ts         ⬅️ MOVER desde types.ts
│   │   │   ├── Exercise.ts
│   │   │   └── RoutineHistory.ts
│   │   ├── repositories/
│   │   │   └── RoutineRepository.ts
│   │   └── usecases/
│   │       ├── GetRoutines.ts
│   │       ├── GetRoutineById.ts
│   │       ├── ExecuteRoutine.ts
│   │       └── GetRoutineHistory.ts
│   ├── state/                     🆕 CREAR
│   │   └── routines.store.ts      ⬅️ MIGRAR lógica desde hooks
│   └── ui/                        ♻️ REORGANIZAR
│       ├── screens/               🆕 CREAR
│       │   ├── RoutinesScreen.tsx ⬅️ MOVER
│       │   ├── RoutineDetailScreen.tsx
│       │   ├── RoutineExecutionScreen.tsx
│       │   └── RoutineHistoryScreen.tsx
│       └── components/            ⬅️ MANTENER estructura actual
│
├── rewards/                       ⚠️ MIGRAR A CLEAN
│   ├── data/                      ♻️ REORGANIZAR
│   │   ├── dto/                   🆕 CREAR
│   │   │   └── RewardDTO.ts
│   │   ├── mappers/               🆕 CREAR
│   │   │   └── reward.mapper.ts
│   │   ├── datasources/           🆕 CREAR
│   │   │   ├── RewardRemote.ts
│   │   │   └── RewardLocal.ts     ⬅️ MOVER rewardsData.ts
│   │   └── RewardRepositoryImpl.ts 🆕 CREAR
│   ├── domain/                    🆕 CREAR
│   │   ├── entities/
│   │   │   ├── Reward.ts          ⬅️ MOVER desde types.ts
│   │   │   └── GeneratedCode.ts
│   │   ├── repositories/
│   │   │   └── RewardRepository.ts
│   │   └── usecases/
│   │       ├── GetAvailableRewards.ts
│   │       ├── GenerateRewardCode.ts
│   │       └── GetGeneratedCodes.ts
│   ├── state/                     🆕 CREAR
│   │   └── rewards.store.ts       ⬅️ MIGRAR lógica desde useRewards
│   └── ui/                        ♻️ REORGANIZAR
│       ├── screens/               🆕 CREAR
│       │   └── RewardsScreen.tsx  ⬅️ MOVER
│       └── components/            ⬅️ MANTENER
│
├── home/                          ⚠️ MIGRAR A CLEAN
│   ├── data/                      🆕 CREAR
│   │   ├── dto/
│   │   │   └── HomeStatsDTO.ts
│   │   ├── mappers/
│   │   │   └── homeStats.mapper.ts
│   │   └── HomeRepositoryImpl.ts
│   ├── domain/                    🆕 CREAR
│   │   ├── entities/
│   │   │   ├── HomeStats.ts
│   │   │   ├── WeeklyProgress.ts
│   │   │   └── DailyChallenge.ts
│   │   ├── repositories/
│   │   │   └── HomeRepository.ts
│   │   └── usecases/
│   │       ├── GetHomeStats.ts
│   │       ├── GetWeeklyProgress.ts
│   │       └── GetDailyChallenge.ts
│   ├── state/                     🆕 CREAR
│   │   └── home.store.ts          ⬅️ MIGRAR lógica desde useHome
│   └── ui/                        ♻️ REORGANIZAR
│       ├── screens/               🆕 CREAR
│       │   └── HomeScreen.tsx     ⬅️ MOVER
│       └── components/            ⬅️ MANTENER
│
└── user/                          ⚠️ MIGRAR A CLEAN (COMPLETO)
    ├── data/                      🆕 CREAR
    │   ├── dto/
    │   │   └── UserProfileDTO.ts
    │   ├── mappers/
    │   │   └── userProfile.mapper.ts
    │   └── UserRepositoryImpl.ts
    ├── domain/                    🆕 CREAR
    │   ├── entities/
    │   │   ├── UserProfile.ts     ⬅️ MOVER desde types/userTypes.ts
    │   │   ├── UserStats.ts
    │   │   └── Settings.ts
    │   ├── repositories/
    │   │   └── UserRepository.ts
    │   └── usecases/
    │       ├── GetUserProfile.ts
    │       ├── UpdateUserSettings.ts
    │       └── UpgradeToPremium.ts
    ├── state/                     🆕 CREAR
    │   └── userProfile.store.ts   🆕 CREAR
    └── ui/                        ♻️ REORGANIZAR
        ├── screens/               ♻️ RENOMBRAR desde screens/
        │   └── UserProfileScreen.tsx
        └── components/            ⬅️ MANTENER
```

---

## 2️⃣ NUEVOS PATHS/ALIASES Y BARRILES

### 📦 tsconfig.json (actualizar)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["app/*"],
      
      // Features - acceso directo a capas
      "@features/*": ["src/features/*"],
      "@features/auth/data": ["src/features/auth/data"],
      "@features/auth/domain": ["src/features/auth/domain"],
      "@features/auth/state": ["src/features/auth/state"],
      "@features/auth/ui": ["src/features/auth/ui"],
      
      "@features/gyms/data": ["src/features/gyms/data"],
      "@features/gyms/domain": ["src/features/gyms/domain"],
      "@features/gyms/state": ["src/features/gyms/state"],
      "@features/gyms/ui": ["src/features/gyms/ui"],
      
      "@features/routines/data": ["src/features/routines/data"],
      "@features/routines/domain": ["src/features/routines/domain"],
      "@features/routines/state": ["src/features/routines/state"],
      "@features/routines/ui": ["src/features/routines/ui"],
      
      "@features/rewards/data": ["src/features/rewards/data"],
      "@features/rewards/domain": ["src/features/rewards/domain"],
      "@features/rewards/state": ["src/features/rewards/state"],
      "@features/rewards/ui": ["src/features/rewards/ui"],
      
      "@features/home/data": ["src/features/home/data"],
      "@features/home/domain": ["src/features/home/domain"],
      "@features/home/state": ["src/features/home/state"],
      "@features/home/ui": ["src/features/home/ui"],
      
      "@features/user/data": ["src/features/user/data"],
      "@features/user/domain": ["src/features/user/domain"],
      "@features/user/state": ["src/features/user/state"],
      "@features/user/ui": ["src/features/user/ui"],
      
      // Infraestructura
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"],
      "@di/*": ["src/di/*"],
      "@assets/*": ["assets/*"]
    }
  }
}
```

### 📦 babel.config.js (actualizar)

```javascript
alias: {
  '@app': './app',
  '@features': './src/features',
  '@presentation': './src/presentation',
  '@shared': './src/shared',
  '@di': './src/di',
  '@assets': './assets',
}
```

### 📦 Barriles (index.ts) necesarios

#### src/features/routines/data/index.ts (NUEVO)
```typescript
export * from './RoutineRepositoryImpl';
export * from './dto';
export * from './mappers';
```

#### src/features/routines/domain/index.ts (NUEVO)
```typescript
export * from './entities';
export * from './repositories';
export * from './usecases';
```

#### src/features/routines/state/index.ts (NUEVO)
```typescript
export * from './routines.store';
```

#### src/features/routines/ui/index.ts (ACTUALIZAR)
```typescript
export * from './screens';
export * from './components';
```

#### src/features/rewards/data/index.ts (ACTUALIZAR)
```typescript
export * from './RewardRepositoryImpl';
export * from './dto';
export * from './mappers';
export * from './datasources';
```

#### src/features/rewards/domain/index.ts (NUEVO)
```typescript
export * from './entities';
export * from './repositories';
export * from './usecases';
```

#### src/features/rewards/state/index.ts (NUEVO)
```typescript
export * from './rewards.store';
```

#### src/features/home/data/index.ts (NUEVO)
```typescript
export * from './HomeRepositoryImpl';
export * from './dto';
export * from './mappers';
```

#### src/features/home/domain/index.ts (NUEVO)
```typescript
export * from './entities';
export * from './repositories';
export * from './usecases';
```

#### src/features/home/state/index.ts (NUEVO)
```typescript
export * from './home.store';
```

#### src/features/user/data/index.ts (NUEVO)
```typescript
export * from './UserRepositoryImpl';
export * from './dto';
export * from './mappers';
```

#### src/features/user/domain/index.ts (NUEVO)
```typescript
export * from './entities';
export * from './repositories';
export * from './usecases';
```

#### src/features/user/state/index.ts (NUEVO)
```typescript
export * from './userProfile.store';
```

#### src/features/gyms/ui/index.ts (ACTUALIZAR)
```typescript
export * from './screens';
export * from './components';
```

---

## 3️⃣ RIESGOS IDENTIFICADOS

### 🔴 CRÍTICOS

1. **Dependencias circulares**
   - **Riesgo**: Auth exporta User, que se usa en rewards, home, user
   - **Mitigación**: Crear `@shared/domain/entities/User.ts` O mantener User en auth y exportar desde DI
   - **Decisión**: Mantener User en auth, importar `@features/auth/domain/entities/User`

2. **Hooks con lógica de negocio mezclada**
   - **Riesgo**: `useRewards`, `useHome`, hooks de routines tienen lógica que debería estar en stores/usecases
   - **Mitigación**: Migrar lógica de negocio a stores Zustand, dejar hooks solo para consumo de UI
   - **Commit separado por cada hook migrado**

3. **Datos mock vs datos reales**
   - **Riesgo**: routines, rewards, home usan mocks; al migrar necesitamos datasources locales temporales
   - **Mitigación**: Crear `RoutineLocal.ts`, `RewardLocal.ts` con mocks, luego sustituir por `Remote.ts`
   - **Orden**: Primero datasource local → luego agregar remote (sin romper funcionalidad)

4. **Cambios en imports masivos**
   - **Riesgo**: Cientos de archivos importan desde paths antiguos
   - **Mitigación**: Usar find & replace con regex, probar app después de cada commit
   - **Herramienta**: VS Code "Find in Files" con patrones específicos

### 🟡 MEDIOS

5. **Componentes shared que dependen de features**
   - **Riesgo**: `@shared/components/ui/GymListItem` podría estar acoplado a gyms
   - **Mitigación**: Verificar antes de mover; si está acoplado, mover a feature correspondiente
   - **Revisar**: GymListItem, RoutineCard, RewardCard, ExerciseCard

6. **Navigation types**
   - **Riesgo**: Al mover screens, las rutas en `@presentation/navigation/types.ts` rompen
   - **Mitigación**: Actualizar navigation types en el mismo commit que mueve screens

7. **Testing**
   - **Riesgo**: No hay tests unitarios aparentes; confiaremos solo en pruebas manuales
   - **Mitigación**: Testing manual exhaustivo después de cada commit

### 🟢 BAJOS

8. **Estilos en archivos separados**
   - **Riesgo**: LoginScreen.styles.ts, RegisterScreen.styles.ts, etc.
   - **Mitigación**: Mover junto con componentes, mantener estructura

9. **Assets y SVG**
   - **Riesgo**: Imports de assets podrían romperse
   - **Mitigación**: Mantener alias `@assets`, no mover assets

10. **Metro bundler cache**
    - **Riesgo**: Cache desactualizado causa errores fantasma
    - **Mitigación**: `npx expo start -c` después de cambios grandes

---

## 4️⃣ ORDEN DE EJECUCIÓN POR COMMITS

### 🔵 FASE 0: Preparación (1 commit)

**Commit 0.1**: Setup inicial
- [ ] Actualizar `tsconfig.json` con nuevos paths
- [ ] Actualizar `babel.config.js` con nuevos aliases
- [ ] Ejecutar `npx expo start -c` para limpiar cache
- [ ] Verificar que app funciona sin cambios

---

### 🟢 FASE 1: Fusionar gymdetails → gyms (2 commits)

**Commit 1.1**: Reorganizar UI de gyms
- [ ] Crear `src/features/gyms/ui/screens/`
- [ ] Mover `MapScreen.tsx` → `gyms/ui/screens/`
- [ ] Mover `GymDetailScreen.tsx` desde gymdetails → `gyms/ui/screens/`
- [ ] Crear `src/features/gyms/ui/components/detail/`
- [ ] Mover todos los componentes de `gymdetails/ui/components/` → `gyms/ui/components/detail/`
- [ ] Actualizar `gyms/ui/index.ts` para exportar screens
- [ ] Actualizar imports en navigation

**Commit 1.2**: Limpiar gymdetails
- [ ] Eliminar carpeta `src/features/gymdetails/`
- [ ] Verificar no hay imports rotos
- [ ] Testing manual: abrir mapa, ver detalle de gym

**Archivos afectados**: ~15-20

---

### 🟡 FASE 2: Migrar ROUTINES (6 commits)

**Commit 2.1**: Crear estructura domain
- [ ] Crear `src/features/routines/domain/entities/`
- [ ] Mover tipos desde `types.ts` → entidades (Routine, Exercise, RoutineHistory)
- [ ] Crear `src/features/routines/domain/repositories/RoutineRepository.ts` (interfaz)
- [ ] Crear `src/features/routines/domain/usecases/`:
  - `GetRoutines.ts`
  - `GetRoutineById.ts`
  - `ExecuteRoutine.ts`
  - `GetRoutineHistory.ts`
- [ ] Crear barrel `domain/index.ts`

**Commit 2.2**: Crear capa data (con mocks)
- [ ] Crear `src/features/routines/data/dto/RoutineDTO.ts`
- [ ] Crear `src/features/routines/data/mappers/routine.mapper.ts`
- [ ] Crear `src/features/routines/data/datasources/RoutineLocal.ts` (migrar mocks)
- [ ] Crear `src/features/routines/data/RoutineRepositoryImpl.ts` (usando RoutineLocal)
- [ ] Crear barrel `data/index.ts`

**Commit 2.3**: Configurar DI
- [ ] Actualizar `src/di/container.ts`:
  - Importar RoutineRepository, RoutineRepositoryImpl
  - Importar usecases
  - Agregar propiedades al Container
- [ ] Testing: verificar que DI funciona

**Commit 2.4**: Crear store Zustand
- [ ] Crear `src/features/routines/state/routines.store.ts`
- [ ] Migrar lógica de `useRoutines`, `useRoutineById`, `useRoutineExecution`
- [ ] Conectar store con usecases desde DI
- [ ] Crear barrel `state/index.ts`

**Commit 2.5**: Refactorizar hooks
- [ ] Actualizar hooks para consumir store en vez de lógica local
- [ ] `useRoutines` → `useRoutinesStore()`
- [ ] `useRoutineById` → `useRoutineByIdStore()`
- [ ] `useRoutineExecution` → `useRoutineExecutionStore()`
- [ ] Mantener hooks como wrappers si facilita migración

**Commit 2.6**: Reorganizar UI
- [ ] Crear `src/features/routines/ui/screens/`
- [ ] Mover screens desde `ui/` → `ui/screens/`
- [ ] Actualizar imports en navigation
- [ ] Actualizar `routines/ui/index.ts`
- [ ] Actualizar `routines/index.ts` principal
- [ ] Testing manual: navegar todas las screens de routines

**Archivos afectados**: ~35-40

---

### 🟡 FASE 3: Migrar REWARDS (5 commits)

**Commit 3.1**: Crear estructura domain
- [ ] Crear `src/features/rewards/domain/entities/`:
  - Mover Reward, GeneratedCode desde `types.ts`
- [ ] Crear `src/features/rewards/domain/repositories/RewardRepository.ts`
- [ ] Crear `src/features/rewards/domain/usecases/`:
  - `GetAvailableRewards.ts`
  - `GenerateRewardCode.ts`
  - `GetGeneratedCodes.ts`
- [ ] Crear barrel `domain/index.ts`

**Commit 3.2**: Reorganizar capa data
- [ ] Crear `src/features/rewards/data/dto/RewardDTO.ts`
- [ ] Crear `src/features/rewards/data/mappers/reward.mapper.ts`
- [ ] Crear `src/features/rewards/data/datasources/`
- [ ] Mover `rewardsData.ts` → `datasources/RewardLocal.ts`
- [ ] Crear `src/features/rewards/data/RewardRepositoryImpl.ts`
- [ ] Actualizar barrel `data/index.ts`

**Commit 3.3**: Configurar DI
- [ ] Actualizar `src/di/container.ts` con rewards
- [ ] Testing: verificar DI

**Commit 3.4**: Crear store Zustand
- [ ] Crear `src/features/rewards/state/rewards.store.ts`
- [ ] Migrar lógica de `useRewards` hook
- [ ] Conectar store con usecases
- [ ] Crear barrel `state/index.ts`

**Commit 3.5**: Refactorizar UI
- [ ] Actualizar `useRewards` para consumir store
- [ ] Crear `src/features/rewards/ui/screens/`
- [ ] Mover `RewardsScreen.tsx` → `ui/screens/`
- [ ] Actualizar imports en navigation
- [ ] Actualizar barriles
- [ ] Testing manual: pantalla rewards completa

**Archivos afectados**: ~20-25

---

### 🟡 FASE 4: Migrar HOME (5 commits)

**Commit 4.1**: Crear estructura domain
- [ ] Crear `src/features/home/domain/entities/`:
  - `HomeStats.ts`
  - `WeeklyProgress.ts`
  - `DailyChallenge.ts`
- [ ] Crear `src/features/home/domain/repositories/HomeRepository.ts`
- [ ] Crear `src/features/home/domain/usecases/`:
  - `GetHomeStats.ts`
  - `GetWeeklyProgress.ts`
  - `GetDailyChallenge.ts`
- [ ] Crear barrel `domain/index.ts`

**Commit 4.2**: Crear capa data
- [ ] Crear `src/features/home/data/dto/HomeStatsDTO.ts`
- [ ] Crear `src/features/home/data/mappers/homeStats.mapper.ts`
- [ ] Crear `src/features/home/data/HomeRepositoryImpl.ts` (con mocks temporales)
- [ ] Crear barrel `data/index.ts`

**Commit 4.3**: Configurar DI
- [ ] Actualizar `src/di/container.ts` con home
- [ ] Testing: verificar DI

**Commit 4.4**: Crear store Zustand
- [ ] Crear `src/features/home/state/home.store.ts`
- [ ] Migrar lógica de `useHome` hook (quitar mocks, usar store)
- [ ] Conectar con usecases
- [ ] Crear barrel `state/index.ts`

**Commit 4.5**: Refactorizar UI
- [ ] Actualizar `useHome` para consumir store
- [ ] Crear `src/features/home/ui/screens/`
- [ ] Mover `HomeScreen.tsx` → `ui/screens/`
- [ ] Actualizar imports en navigation
- [ ] Actualizar barriles
- [ ] Testing manual: pantalla home completa

**Archivos afectados**: ~15-18

---

### 🟡 FASE 5: Migrar USER (6 commits)

**Commit 5.1**: Crear estructura domain
- [ ] Crear `src/features/user/domain/entities/`:
  - Mover UserProfile, UserStats, NotificationSettings desde `types/userTypes.ts`
- [ ] Crear `src/features/user/domain/repositories/UserRepository.ts`
- [ ] Crear `src/features/user/domain/usecases/`:
  - `GetUserProfile.ts`
  - `UpdateUserSettings.ts`
  - `UpgradeToPremium.ts`
- [ ] Crear barrel `domain/index.ts`

**Commit 5.2**: Crear capa data
- [ ] Crear `src/features/user/data/dto/UserProfileDTO.ts`
- [ ] Crear `src/features/user/data/mappers/userProfile.mapper.ts`
- [ ] Crear `src/features/user/data/UserRepositoryImpl.ts`
- [ ] Crear barrel `data/index.ts`

**Commit 5.3**: Configurar DI
- [ ] Actualizar `src/di/container.ts` con user
- [ ] Testing: verificar DI

**Commit 5.4**: Crear store Zustand
- [ ] Crear `src/features/user/state/userProfile.store.ts`
- [ ] Migrar lógica de estado desde componentes
- [ ] Conectar con usecases
- [ ] Crear barrel `state/index.ts`

**Commit 5.5**: Reorganizar UI
- [ ] Renombrar `screens/` (ya existe) → mantener
- [ ] Mover `components/` si es necesario
- [ ] Actualizar imports en navigation
- [ ] Crear barrel `ui/index.ts`

**Commit 5.6**: Refactorizar screen
- [ ] Actualizar `UserProfileScreen.tsx` para usar store
- [ ] Eliminar lógica de negocio del componente
- [ ] Actualizar `user/index.ts` principal
- [ ] Testing manual: pantalla user completa

**Archivos afectados**: ~15-20

---

### 🔵 FASE 6: Limpieza y optimización (3 commits)

**Commit 6.1**: Revisar shared components
- [ ] Identificar componentes acoplados a features
- [ ] Mover componentes específicos (GymListItem → gyms, RoutineCard → routines, etc.)
- [ ] Actualizar imports
- [ ] Mantener solo componentes verdaderamente compartidos en shared

**Commit 6.2**: Optimizar barriles
- [ ] Revisar todos los `index.ts`
- [ ] Eliminar exports innecesarios
- [ ] Agregar exports faltantes
- [ ] Documentar exports públicos vs internos

**Commit 6.3**: Documentación y cleanup
- [ ] Eliminar archivos antiguos no usados
- [ ] Actualizar README con nueva estructura
- [ ] Crear ARCHITECTURE.md explicando capas
- [ ] Limpiar imports no usados
- [ ] Ejecutar `npx expo start -c` final

**Archivos afectados**: ~10-15

---

### 🟣 FASE 7: Testing final (1 commit)

**Commit 7.1**: Testing exhaustivo
- [ ] Testing manual de todas las features:
  - ✅ Auth: login, registro
  - ✅ Gyms: mapa, lista, filtros, detalle
  - ✅ Routines: listado, detalle, ejecución, historial
  - ✅ Rewards: disponibles, generar códigos, copiar
  - ✅ Home: estadísticas, progreso, permisos
  - ✅ User: perfil, configuraciones, premium
- [ ] Verificar navegación entre pantallas
- [ ] Verificar no hay warnings de imports
- [ ] Verificar performance (no hay regresos)
- [ ] Documentar cualquier cambio de comportamiento (debe ser 0)

---

## 📊 RESUMEN CUANTITATIVO

| Fase | Commits | Archivos afectados | Riesgo | Tiempo estimado |
|------|---------|-------------------|--------|-----------------|
| 0 - Preparación | 1 | ~5 | Bajo | 30min |
| 1 - Gyms + gymdetails | 2 | ~20 | Medio | 2h |
| 2 - Routines | 6 | ~40 | Alto | 6h |
| 3 - Rewards | 5 | ~25 | Medio | 4h |
| 4 - Home | 5 | ~18 | Medio | 3h |
| 5 - User | 6 | ~20 | Medio | 4h |
| 6 - Limpieza | 3 | ~15 | Bajo | 2h |
| 7 - Testing | 1 | - | - | 2h |
| **TOTAL** | **29** | **~143** | - | **23.5h** |

---

## 🎯 PRINCIPIOS A SEGUIR

### ✅ DO's
1. **Un commit = una responsabilidad clara**
2. **Después de cada commit**: probar app manualmente
3. **Mantener barriles actualizados** en cada commit
4. **Migrar tests junto con código** (si existen)
5. **Documentar decisiones** en comentarios cuando sea necesario
6. **Usar TypeScript strict mode** en archivos nuevos
7. **Mantener nomenclatura consistente**: PascalCase entities, camelCase repositories/usecases

### ❌ DON'Ts
1. **NO cambiar comportamiento** de features
2. **NO hacer refactors de lógica** y migración en el mismo commit
3. **NO crear dependencias circulares** entre features
4. **NO mover assets** de carpeta
5. **NO tocar auth ni gyms (data/domain)** que ya están bien
6. **NO hacer commits gigantes** (máx. 30-40 archivos)

---

## 🔍 VERIFICACIÓN POST-MIGRACIÓN

### Checklist arquitectura limpia

- [ ] **Dependency Rule**: domain no importa nada de fuera
- [ ] **Data → Domain**: data implementa interfaces de domain
- [ ] **UI → Domain**: UI usa usecases, no repositorios directamente
- [ ] **DI único**: toda inyección en `src/di/container.ts`
- [ ] **Stores desacoplados**: stores usan usecases, no repositories
- [ ] **Sin dependencias circulares**: verificar con Madge o similar
- [ ] **Barriles completos**: todos los index.ts exportan correctamente
- [ ] **Navigation actualizado**: todas las rutas apuntan a nuevos paths

### Checklist funcional

- [ ] App compila sin errores
- [ ] No hay warnings de TypeScript
- [ ] No hay imports rotos
- [ ] Todas las pantallas navegables
- [ ] Todas las features funcionan igual que antes
- [ ] Performance similar o mejor
- [ ] Bundle size similar o menor

---

## 📞 CONTACTO Y SOPORTE

Si durante la migración encuentras:
- **Imports circulares**: revisar barriles y mover entidades compartidas a shared/domain
- **DI no funciona**: verificar orden de importación en container.ts
- **Errores de cache**: `npx expo start -c` y reiniciar
- **TypeScript lento**: verificar que no hay imports de barriles gigantes

---

## 📝 NOTAS FINALES

1. Este plan es **incremental**: cada commit deja la app funcional
2. El orden **importa**: fusionar gymdetails primero simplifica estructura
3. Routines es el más complejo (6 commits) porque requiere migración completa
4. User es relativamente simple porque no tiene lógica compleja
5. Considerar hacer **branches por fase** para poder revertir si es necesario

**Estrategia de branches sugerida:**
```
main
├── phase-0-setup
├── phase-1-gyms-fusion
├── phase-2-routines
├── phase-3-rewards
├── phase-4-home
├── phase-5-user
└── phase-6-cleanup
```

Merge cada fase a main después de testing manual exitoso.

---

**¿Todo claro para comenzar? 🚀**

