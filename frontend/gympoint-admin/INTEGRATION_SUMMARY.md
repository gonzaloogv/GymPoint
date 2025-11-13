# Integración de DTOs del OpenAPI - Resumen

## ✅ Trabajo Completado

### 1. Tipos Auxiliares
- **Archivo creado**: [`src/data/dto/types.ts`](src/data/dto/types.ts)
- Exporta tipos del OpenAPI generado de forma más accesible
- Incluye tipos utilitarios para paginación y respuestas

### 2. Mappers Implementados
Se crearon mappers para convertir entre DTOs del API y entidades del dominio:

#### [`src/data/mappers/GymMappers.ts`](src/data/mappers/GymMappers.ts)
- `mapGymResponseToGym` - Convierte respuesta API → entidad dominio
- `mapCreateGymDTOToRequest` - Convierte DTO dominio → request API
- `mapUpdateGymDTOToRequest` - Convierte DTO dominio → request API

#### [`src/data/mappers/GymScheduleMappers.ts`](src/data/mappers/GymScheduleMappers.ts)
- Mappers para `GymSchedule` y `GymSpecialSchedule`
- Conversión bidireccional entre DTOs y entidades

#### [`src/data/mappers/CommonMappers.ts`](src/data/mappers/CommonMappers.ts)
- Mappers para Reviews, Rewards, Exercises
- Mappers para DailyChallenges y Achievements
- ⚠️ Algunos necesitan ajustes según DTOs reales del OpenAPI

### 3. Repositories Actualizados

#### ✅ Completamente Migrados:
1. **[GymRepositoryImpl](src/data/repositories/GymRepositoryImpl.ts)**
   - Usa `GymResponse`, `CreateGymRequest`, `UpdateGymRequest`
   - Mappers implementados
   - Paths actualizados a `/api/gyms`

2. **[GymScheduleRepositoryImpl](src/data/repositories/GymScheduleRepositoryImpl.ts)**
   - Usa DTOs del OpenAPI
   - Paths actualizados a `/api/gym-schedules`

3. **[GymSpecialScheduleRepositoryImpl](src/data/repositories/GymSpecialScheduleRepositoryImpl.ts)**
   - Usa DTOs del OpenAPI
   - Paths actualizados a `/api/gym-special-schedules`

## ⚠️ Trabajo Pendiente

### DTOs Faltantes en el Backend OpenAPI

Los siguientes endpoints **NO están definidos** en el OpenAPI del backend (`backend/node/docs/openapi.yaml`):

#### Rewards:
- `POST /api/rewards` - Crear recompensa
- `GET /api/rewards` - Listar recompensas
- `GET /api/rewards/:id` - Obtener recompensa
- `PUT /api/rewards/:id` - Actualizar recompensa
- `DELETE /api/rewards/:id` - Eliminar recompensa

#### Reviews (algunos endpoints):
- Falta `PATCH /api/gym-reviews/:id` - Aprobar/rechazar
- Falta endpoint de stats

#### Daily Challenges:
- Todo el módulo de DailyChallenges no está en OpenAPI

#### Achievements:
- Todo el módulo de Achievements no está en OpenAPI

#### Special Schedules:
- Endpoints de GymSpecialSchedule no están en OpenAPI

### Repositories que Necesitan Actualización

1. **RewardRepositoryImpl** - Esperando DTOs del backend
2. **ReviewRepositoryImpl** - Parcialmente implementado
3. **ExerciseRepositoryImpl** - ✅ Los DTOs existen en OpenAPI
4. **DailyChallengeRepositoryImpl** - Esperando DTOs del backend
5. **AchievementRepositoryImpl** - Esperando DTOs del backend
6. **StreakRepositoryImpl** - Verificar endpoints
7. **AmenityRepositoryImpl** - Verificar endpoints
8. **RoutineTemplateRepositoryImpl** - Verificar endpoints

## 🔧 Cómo Completar la Migración

### Paso 1: Backend - Agregar Endpoints Faltantes al OpenAPI

Edita `backend/node/docs/openapi.yaml` y agrega las definiciones para:

```yaml
paths:
  /api/rewards:
    get:
      operationId: listRewards
      # ...
    post:
      operationId: createReward
      # ...

  /api/rewards/{id}:
    get:
      operationId: getRewardById
      # ...
    put:
      operationId: updateReward
      # ...
    delete:
      operationId: deleteReward
      # ...

components:
  schemas:
    RewardResponse:
      type: object
      properties:
        id_reward: { type: integer }
        name: { type: string }
        # ... otros campos

    CreateRewardRequest:
      type: object
      properties:
        name: { type: string }
        # ... otros campos
```

### Paso 2: Regenerar Tipos del Frontend

Después de actualizar el OpenAPI del backend:

```bash
cd frontend/gympoint-admin
npm run generate:types
```

Esto actualizará `src/data/dto/generated/api.types.ts` con los nuevos tipos.

### Paso 3: Actualizar types.ts

Edita `src/data/dto/types.ts` y reemplaza los tipos `any` temporales con los tipos reales:

```typescript
// Antes (temporal):
export type RewardResponse = any;

// Después (del OpenAPI generado):
export type RewardResponse = components['schemas']['RewardResponse'];
```

### Paso 4: Actualizar Repositories

Usa los mappers ya creados en `CommonMappers.ts` y actualiza cada repository:

```typescript
// Ejemplo: RewardRepositoryImpl.ts
import { RewardResponse } from '../dto/types';
import { mapRewardResponseToReward } from '../mappers/CommonMappers';

async getAllRewards(): Promise<Reward[]> {
  const response = await apiClient.get<RewardResponse[]>('/api/rewards');
  return response.data.map(mapRewardResponseToReward);
}
```

### Paso 5: Ajustar Paths de API

Actualiza todos los paths para usar el prefijo `/api/`:

| Antes | Después |
|-------|---------|
| `/gyms` | `/api/gyms` |
| `/schedules` | `/api/gym-schedules` |
| `/admin/rewards` | `/api/rewards` |
| `/admin/reviews` | `/api/gym-reviews` |

### Paso 6: Verificar Compilación

```bash
cd frontend/gympoint-admin
npm run type-check
```

Corregir cualquier error de tipos.

## 📝 Estructura de Archivos

```
frontend/gympoint-admin/src/data/
├── dto/
│   ├── generated/
│   │   └── api.types.ts (AUTO-GENERADO, NO EDITAR)
│   ├── types.ts (Helper types)
│   └── index.ts
├── mappers/
│   ├── GymMappers.ts ✅
│   ├── GymScheduleMappers.ts ✅
│   ├── CommonMappers.ts ✅ (necesita ajustes)
│   └── index.ts
└── repositories/
    ├── GymRepositoryImpl.ts ✅
    ├── GymScheduleRepositoryImpl.ts ✅
    ├── GymSpecialScheduleRepositoryImpl.ts ✅
    ├── RewardRepositoryImpl.ts ⏳
    ├── ReviewRepositoryImpl.ts ⏳
    └── ... (otros repositories) ⏳
```

## 🎯 Próximos Pasos Recomendados

1. **Priorizar**: Identificar qué endpoints se usan actualmente en la app
2. **Backend**: Agregar los endpoints prioritarios al OpenAPI
3. **Frontend**: Regenerar tipos y actualizar repositories
4. **Testing**: Probar cada repository actualizado
5. **Iterar**: Repetir para los demás endpoints

## 📚 Recursos

- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript Docs](https://github.com/drwpow/openapi-typescript)
- Backend OpenAPI: `backend/node/docs/openapi.yaml`
- Script de generación: `npm run generate:types`

## ✨ Beneficios de esta Integración

1. **Type Safety**: El frontend y backend comparten la misma estructura de datos
2. **Auto-completado**: IntelliSense completo en el IDE
3. **Validación**: Errores de tipo en tiempo de compilación
4. **Documentación**: El OpenAPI sirve como documentación viva
5. **Menos bugs**: Los cambios en el backend se reflejan automáticamente en los tipos del frontend

---

**Autor**: Claude Code
**Fecha**: ${new Date().toISOString().split('T')[0]}
**Versión**: 1.0
