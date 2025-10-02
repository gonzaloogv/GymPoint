# ⚡ Referencia Rápida - Clean Architecture Migration

## 🎯 Resumen Ejecutivo

**Objetivo**: Migrar 6 features a Clean Architecture en 29 commits
**Tiempo estimado**: 23.5 horas
**Archivos afectados**: ~143

---

## 📊 Estado de Features

| Feature | Estado Actual | Acción | Commits | Prioridad |
|---------|--------------|---------|---------|-----------|
| **auth** | ✅ Completo | Mantener | 0 | - |
| **gyms** | ✅ Completo | Fusionar gymdetails | 2 | Alta |
| **gymdetails** | ❌ Sin Clean | Eliminar (fusionar a gyms) | 2 | Alta |
| **routines** | 🟡 Parcial | Migrar completo | 6 | Media |
| **rewards** | 🟡 Parcial | Migrar completo | 5 | Media |
| **home** | ❌ Básico | Migrar completo | 5 | Baja |
| **user** | ❌ Básico | Migrar completo | 6 | Media |

---

## 🏗️ Template de Feature (Estructura objetivo)

```
src/features/{feature}/
├── data/                      ← Implementación
│   ├── dto/                   ← Estructura backend
│   ├── mappers/               ← DTO → Entity
│   ├── datasources/           ← Remote/Local
│   │   ├── {Feature}Remote.ts
│   │   └── {Feature}Local.ts
│   ├── {Feature}RepositoryImpl.ts
│   └── index.ts
│
├── domain/                    ← Lógica de negocio
│   ├── entities/              ← Modelos puros
│   ├── repositories/          ← Interfaces/Contratos
│   │   └── {Feature}Repository.ts
│   ├── usecases/              ← Casos de uso
│   │   ├── Get{Feature}.ts
│   │   ├── Create{Feature}.ts
│   │   └── Update{Feature}.ts
│   └── index.ts
│
├── state/                     ← Zustand stores
│   ├── {feature}.store.ts
│   └── index.ts
│
├── ui/                        ← Presentación
│   ├── screens/
│   │   └── {Feature}Screen.tsx
│   ├── components/
│   │   └── ...
│   └── index.ts
│
├── utils/                     ← Utilidades específicas
├── mocks/                     ← Data de desarrollo
└── index.ts                   ← Barrel público
```

---

## 🔄 Workflow por Feature

### 1️⃣ Domain (2-3 archivos)
```bash
mkdir -p domain/{entities,repositories,usecases}
# Crear interfaces, entidades, casos de uso
# NO importar nada externo
```

### 2️⃣ Data (4-5 archivos)
```bash
mkdir -p data/{dto,mappers,datasources}
# Crear DTOs, mappers, datasources
# Implementar RepositoryImpl
```

### 3️⃣ DI Container (1 archivo)
```typescript
// Actualizar src/di/container.ts
this.{feature}Repository = new {Feature}RepositoryImpl(...);
this.get{Feature} = new Get{Feature}(this.{feature}Repository);
```

### 4️⃣ State (1 archivo)
```typescript
// Crear state/{feature}.store.ts
export const use{Feature}Store = create<{Feature}State>((set) => ({
  // state y actions usando DI
}));
```

### 5️⃣ UI (reorganizar)
```bash
mkdir -p ui/screens ui/components
# Mover screens, actualizar imports
# Actualizar navigation
```

---

## 📋 Checklist Rápida por Commit

Antes de cada commit:
- [ ] TypeScript compila sin errores
- [ ] Imports actualizados
- [ ] Barriles actualizados

Después de cada commit:
- [ ] `npx expo start -c` si hay problemas
- [ ] Probar feature manualmente
- [ ] No hay warnings en consola

---

## 🎨 Patrones de Código

### Entity
```typescript
// domain/entities/Routine.ts
export class Routine {
  constructor(
    public id: number,
    public name: string,
    public exercises: Exercise[]
  ) {}
}
```

### Repository Interface
```typescript
// domain/repositories/RoutineRepository.ts
export interface RoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: number): Promise<Routine>;
}
```

### Use Case
```typescript
// domain/usecases/GetRoutines.ts
export class GetRoutines {
  constructor(private repository: RoutineRepository) {}
  
  async execute(): Promise<Routine[]> {
    return await this.repository.getAll();
  }
}
```

### DTO
```typescript
// data/dto/RoutineDTO.ts
export interface RoutineDTO {
  id_routine: number;
  routine_name: string;
  exercises: ExerciseDTO[];
}
```

### Mapper
```typescript
// data/mappers/routine.mapper.ts
export const mapRoutineDTOToEntity = (dto: RoutineDTO): Routine => {
  return new Routine(
    dto.id_routine,
    dto.routine_name,
    dto.exercises.map(mapExerciseDTOToEntity)
  );
};
```

### Datasource
```typescript
// data/datasources/RoutineRemote.ts
export class RoutineRemote {
  async fetchAll(): Promise<RoutineDTO[]> {
    const response = await apiClient.get('/routines');
    return response.data;
  }
}
```

### Repository Implementation
```typescript
// data/RoutineRepositoryImpl.ts
export class RoutineRepositoryImpl implements RoutineRepository {
  constructor(private remote: RoutineRemote) {}
  
  async getAll(): Promise<Routine[]> {
    const dtos = await this.remote.fetchAll();
    return dtos.map(mapRoutineDTOToEntity);
  }
}
```

### Store
```typescript
// state/routines.store.ts
import { create } from 'zustand';
import { DI } from '@di/container';

interface RoutinesState {
  routines: Routine[];
  loading: boolean;
  fetchRoutines: () => Promise<void>;
}

export const useRoutinesStore = create<RoutinesState>((set) => ({
  routines: [],
  loading: false,
  
  fetchRoutines: async () => {
    set({ loading: true });
    const routines = await DI.getRoutines.execute();
    set({ routines, loading: false });
  },
}));
```

### Hook (wrapper sobre store)
```typescript
// hooks/useRoutines.ts
export function useRoutines() {
  const { routines, loading, fetchRoutines } = useRoutinesStore();
  
  useEffect(() => {
    fetchRoutines();
  }, []);
  
  return { routines, loading };
}
```

---

## 🚨 Errores Comunes

### ❌ Domain importa Data
```typescript
// ❌ MAL
// domain/usecases/GetRoutines.ts
import { RoutineRepositoryImpl } from '../../data/RoutineRepositoryImpl';

// ✅ BIEN
// domain/usecases/GetRoutines.ts
import { RoutineRepository } from '../repositories/RoutineRepository';
```

### ❌ UI importa RepositoryImpl
```typescript
// ❌ MAL
// ui/screens/RoutinesScreen.tsx
import { RoutineRepositoryImpl } from '../../data/RoutineRepositoryImpl';

// ✅ BIEN
// ui/screens/RoutinesScreen.tsx
import { useRoutinesStore } from '@features/routines/state';
```

### ❌ Store importa Repository directamente
```typescript
// ❌ MAL
// state/routines.store.ts
const repo = new RoutineRepositoryImpl();

// ✅ BIEN
// state/routines.store.ts
import { DI } from '@di/container';
const routines = await DI.getRoutines.execute();
```

### ❌ Dependencia circular
```typescript
// ❌ MAL
// features/routines/index.ts
export * from './domain';
export * from './data';

// ✅ BIEN
// features/routines/index.ts
export * from './ui';
export * from './hooks';
```

---

## 📦 Comandos Útiles

### Limpiar cache
```bash
npx expo start -c
```

### Buscar imports de una feature
```powershell
# PowerShell
Select-String -Path "src/**/*.tsx" -Pattern "gymdetails" -Recursive
```

### Compilar TypeScript
```bash
npx tsc --noEmit
```

### Buscar imports circulares (opcional)
```bash
npx madge --circular src/
```

### Buscar exports no usados (opcional)
```bash
npx ts-prune
```

---

## 🎯 Orden de Migración (29 commits)

| # | Fase | Descripción | Archivos |
|---|------|-------------|----------|
| 0.1 | Setup | Paths y aliases | ~5 |
| 1.1-1.2 | Gyms | Fusionar gymdetails | ~20 |
| 2.1-2.6 | Routines | Migración completa | ~40 |
| 3.1-3.5 | Rewards | Migración completa | ~25 |
| 4.1-4.5 | Home | Migración completa | ~18 |
| 5.1-5.6 | User | Migración completa | ~20 |
| 6.1-6.3 | Cleanup | Limpieza y docs | ~15 |
| 7.1 | Testing | Testing final | - |

---

## ✅ Definition of Done (por feature)

- [ ] Domain layer completo (entities, repos, usecases)
- [ ] Data layer completo (dtos, mappers, datasources, repo impl)
- [ ] DI container actualizado
- [ ] Store Zustand creado
- [ ] Hooks actualizados (usan store)
- [ ] UI reorganizado (screens separados)
- [ ] Navigation actualizado
- [ ] Barriles actualizados
- [ ] TypeScript compila
- [ ] App funciona manualmente
- [ ] No hay imports circulares
- [ ] Dependency Rule respetada

---

## 🔍 Testing Manual Quick Check

Por cada feature después de migración:

```
1. Abrir app
2. Navegar a feature
3. Verificar datos cargan
4. Interactuar con UI (clicks, inputs)
5. Navegar a otra screen
6. Volver
7. Verificar no hay crashes
8. Verificar consola sin errores
```

---

## 📞 Contactos de Ayuda

**Dependency Rule**: Domain no importa nada externo
**Circular imports**: Revisar barriles, separar entidades
**Cache issues**: `npx expo start -c`
**Type errors**: Verificar mappers DTO → Entity
**DI errors**: Verificar orden de inicialización en constructor

---

## 🎨 Convenciones de Nombres (Quick)

| Tipo | Ejemplo |
|------|---------|
| Entity | `Routine`, `Exercise` |
| DTO | `RoutineDTO` |
| Repository Interface | `RoutineRepository` |
| Repository Impl | `RoutineRepositoryImpl` |
| Use Case | `GetRoutines`, `CreateRoutine` |
| Store | `useRoutinesStore` |
| Datasource | `RoutineRemote`, `RoutineLocal` |
| Mapper | `mapRoutineDTOToEntity` |
| Screen | `RoutinesScreen` |
| Component | `RoutineCard` |

---

## 🚀 Quick Start (comenzar ahora)

```bash
# 1. Crear branch
git checkout -b clean-architecture-migration
git checkout -b phase-0-setup

# 2. Actualizar tsconfig.json y babel.config.js
# (agregar paths/aliases)

# 3. Limpiar cache
npx expo start -c

# 4. Probar app funciona
# (sin cambios todavía)

# 5. Commit inicial
git add tsconfig.json babel.config.js
git commit -m "feat: setup paths and aliases for clean architecture"
git push origin phase-0-setup

# 6. Comenzar Fase 1
git checkout -b phase-1-gyms-fusion
# ... seguir MIGRATION_CHECKLISTS.md
```

---

## 📚 Documentos Relacionados

- **`CLEAN_ARCHITECTURE_MIGRATION_PLAN.md`**: Plan completo detallado
- **`ARCHITECTURE_DIAGRAM.md`**: Diagramas visuales
- **`MIGRATION_CHECKLISTS.md`**: Checklists por commit
- **`QUICK_REFERENCE.md`**: Este documento (referencia rápida)

---

**¡Manos a la obra! 🚀**

