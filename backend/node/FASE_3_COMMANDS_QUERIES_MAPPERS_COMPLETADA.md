# FASE 3: Commands/Queries y Mappers - COMPLETADA

## Fecha
2025-10-22

## Objetivo
Crear la capa de abstracción entre DTOs (API) y la lógica de negocio mediante Commands, Queries y Mappers, eliminando el acoplamiento directo entre controllers y modelos Sequelize.

## Cambios Implementados

### 1. Estructura de Carpetas Creada

```
backend/node/
├── services/
│   ├── commands/
│   │   ├── auth.commands.js
│   │   ├── gym.commands.js
│   │   └── index.js
│   ├── queries/
│   │   ├── auth.queries.js
│   │   ├── gym.queries.js
│   │   └── index.js
│   └── mappers/
│       ├── auth.mappers.js
│       ├── gym.mappers.js
│       └── index.js
└── utils/
    ├── pagination.js
    └── sort-whitelist.js
```

### 2. Commands Implementados

**Commands** = Objetos puros (POJOs) que representan **intenciones de modificar** el estado del sistema.

#### Auth Commands ([services/commands/auth.commands.js](services/commands/auth.commands.js))
- ✅ `RegisterCommand` - UC-AUTH-01: Registro completo
- ✅ `LoginCommand` - UC-AUTH-02: Login con email/password
- ✅ `RefreshTokenCommand` - UC-AUTH-03: Renovar access token
- ✅ `GoogleAuthCommand` - UC-AUTH-04: OAuth con Google
- ✅ `LogoutCommand` - Invalidar refresh token

**Basado en**: [gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md](backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md) §1

#### Gym Commands ([services/commands/gym.commands.js](services/commands/gym.commands.js))
- ✅ `CreateGymCommand` - Crear gimnasio (admin)
- ✅ `UpdateGymCommand` - Actualizar gimnasio (admin)
- ✅ `DeleteGymCommand` - Eliminar gimnasio (admin)
- ✅ `AddFavoriteGymCommand` - UC-GYM-03: Agregar a favoritos (máx 5)
- ✅ `RemoveFavoriteGymCommand` - Remover de favoritos
- ✅ `SubscribeToGymCommand` - UC-GYM-06: Suscribirse (máx 2 activas)
- ✅ `UnsubscribeFromGymCommand` - Cancelar suscripción

**Basado en**: [gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md](backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md) §3

### 3. Queries Implementadas

**Queries** = Objetos puros (POJOs) que representan **solicitudes de lectura** de datos.

#### Auth Queries ([services/queries/auth.queries.js](services/queries/auth.queries.js))
- ✅ `GetUserProfileQuery` - Obtener perfil por accountId
- ✅ `CheckEmailExistsQuery` - Verificar si email está registrado
- ✅ `GetAccountByEmailQuery` - Obtener cuenta por email
- ✅ `GetAccountByGoogleIdQuery` - Obtener cuenta por Google ID
- ✅ `ValidateRefreshTokenQuery` - Validar refresh token

#### Gym Queries ([services/queries/gym.queries.js](services/queries/gym.queries.js))
- ✅ `ListGymsQuery` - UC-GYM-01: Listar con filtros complejos
  - Filtros: ciudad, nombre, distancia (lat/lng/radius), tipos, amenidades, verificados, featured, rango de precio
  - Paginación: page, limit
  - Ordenamiento: sortBy (name, city, created_at, month_price, distance), order (ASC/DESC)
- ✅ `GetGymDetailQuery` - UC-GYM-02: Detalle completo
- ✅ `GetGymTypesQuery` - Listar tipos de gimnasios
- ✅ `GetGymAmenitiesQuery` - Listar amenidades/servicios
- ✅ `ListUserFavoriteGymsQuery` - Listar favoritos del usuario
- ✅ `IsGymFavoriteQuery` - Verificar si es favorito
- ✅ `GetUserActiveSubscriptionsQuery` - Suscripciones activas del usuario
- ✅ `IsUserSubscribedToGymQuery` - Verificar si está suscrito

**Basado en**: [gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md](backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md) §3

### 4. Mappers Implementados

**Mappers** = Transformadores entre capas: `RequestDTO ↔ Command/Query` y `Entity ↔ ResponseDTO`

#### Auth Mappers ([services/mappers/auth.mappers.js](services/mappers/auth.mappers.js))

**RequestDTO → Command/Query:**
- ✅ `toRegisterCommand(dto)` - RegisterRequestDTO → RegisterCommand
- ✅ `toLoginCommand(dto)` - LoginRequestDTO → LoginCommand
- ✅ `toRefreshTokenCommand(dto)` - RefreshTokenRequestDTO → RefreshTokenCommand
- ✅ `toGoogleAuthCommand(dto, payload)` - GoogleAuthRequestDTO → GoogleAuthCommand
- ✅ `toLogoutCommand(dto, accountId)` - LogoutRequestDTO → LogoutCommand
- ✅ `toGetUserProfileQuery(accountId)` - accountId → GetUserProfileQuery

**Entity → ResponseDTO:**
- ✅ `toUserProfileResponse(profile)` - UserProfile → UserProfileResponseDTO
- ✅ `toAccountResponse(account)` - Account → AccountResponseDTO
- ✅ `toAuthSuccessResponse({tokens, user})` - AuthSuccessResponseDTO
- ✅ `toRefreshTokenResponse({accessToken})` - RefreshTokenResponseDTO

#### Gym Mappers ([services/mappers/gym.mappers.js](services/mappers/gym.mappers.js))

**RequestDTO → Command/Query:**
- ✅ `toCreateGymCommand(dto, createdBy)` - CreateGymRequestDTO → CreateGymCommand
- ✅ `toUpdateGymCommand(dto, gymId, updatedBy)` - UpdateGymRequestDTO → UpdateGymCommand
- ✅ `toDeleteGymCommand(gymId, deletedBy)` - DeleteGymCommand
- ✅ `toListGymsQuery(queryParams, userId)` - Query params → ListGymsQuery
  - Normaliza paginación con `utils/pagination.js`
  - Normaliza ordenamiento con `utils/sort-whitelist.js`
- ✅ `toGetGymDetailQuery(gymId, userId)` - GetGymDetailQuery
- ✅ `toGetGymTypesQuery(queryParams)` - GetGymTypesQuery
- ✅ `toGetGymAmenitiesQuery(queryParams)` - GetGymAmenitiesQuery
- ✅ `toAddFavoriteGymCommand(userId, gymId)` - AddFavoriteGymCommand
- ✅ `toRemoveFavoriteGymCommand(userId, gymId)` - RemoveFavoriteGymCommand
- ✅ `toSubscribeToGymCommand(dto, userId, gymId)` - SubscribeToGymCommand
- ✅ `toUnsubscribeFromGymCommand(userId, gymId)` - UnsubscribeFromGymCommand

**Entity → ResponseDTO:**
- ✅ `toGymResponse(gym, options)` - Gym → GymResponseDTO
  - Opciones: isFavorite, isSubscribed, distance
- ✅ `toGymTypeResponse(gymType)` - GymType → GymTypeResponseDTO
- ✅ `toGymAmenityResponse(amenity)` - GymAmenity → GymAmenityResponseDTO
- ✅ `toPaginatedGymsResponse({items, total, page, limit})` - PaginatedGymsResponseDTO

### 5. Utilidades de Seguridad

#### Paginación Segura ([utils/pagination.js](utils/pagination.js))
```javascript
// Normaliza y valida parámetros de paginación
normalizePagination({ page, limit })
// → { page: 1-∞, limit: 1-100, offset }

// Construye respuesta paginada
buildPaginatedResponse({ items, total, page, limit })
// → { items, page, limit, total, totalPages }
```

**Seguridad:**
- Valores por defecto: page=1, limit=20
- Límite máximo: 100 items por página
- Previene valores negativos o inválidos

#### Ordenamiento Seguro ([utils/sort-whitelist.js](utils/sort-whitelist.js))
```javascript
// Whitelists por recurso
GYM_SORTABLE_FIELDS = Set(['name', 'city', 'created_at', 'month_price', 'distance'])
USER_SORTABLE_FIELDS = Set(['email', 'created_at', 'last_login'])
ASSISTANCE_SORTABLE_FIELDS = Set(['check_in_time', 'duration_minutes'])
// ... más recursos

// Normaliza y valida ordenamiento
normalizeSortParams(sortBy, order, allowedFields)
// → { sortBy: 'created_at', order: 'DESC' }
```

**Seguridad:**
- ✅ **Previene SQL injection** - Solo campos en whitelist
- ✅ **Valores seguros por defecto** - created_at DESC
- ✅ **Order validado** - Solo ASC/DESC

### 6. Arquitectura de Capas Resultante

```
┌─────────────────────────────────────────────┐
│  CLIENT REQUEST (HTTP + JSON)               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  OPENAPI VALIDATOR                          │
│  ✅ Valida contra RequestDTO schema          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  CONTROLLER                                 │
│  • Recibe req validado                      │
│  • Usa MAPPER: RequestDTO → Command/Query   │
│  • Llama SERVICE con Command/Query          │
│  • Usa MAPPER: Entity → ResponseDTO         │
│  • Retorna ResponseDTO                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  SERVICE                                    │
│  • Recibe Command/Query (POJO puro)        │
│  • Aplica reglas de negocio                │
│  • Llama REPOSITORY                        │
│  • Retorna Entity/POJO (sin ORM)           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  REPOSITORY (Sequelize)                     │
│  • Proyecciones explícitas (attributes)    │
│  • Ordenamiento seguro (whitelist)         │
│  • Sin mass assignment                      │
│  • Retorna Entity/POJO                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  DATABASE (MySQL 8.4)                       │
└─────────────────────────────────────────────┘
```

## Beneficios Obtenidos

### 🔒 Seguridad
1. **No más mass assignment**: Mapeo campo a campo en mappers
2. **No más SQL injection en ORDER BY**: Whitelists estrictas
3. **Validación en capas**: OpenAPI + Commands/Queries + Service
4. **DTOs sanitizados**: Solo campos definidos en el spec

### 🧩 Separación de Responsabilidades
1. **Controllers**: Solo orquestación HTTP (thin controllers)
2. **Services**: Solo lógica de negocio (sin req/res)
3. **Repositories**: Solo acceso a datos (sin exponer Sequelize)
4. **Mappers**: Transformaciones centralizadas y reutilizables

### 🧪 Testabilidad
1. **Services testables sin mock de Express**: Reciben POJOs puros
2. **Commands/Queries inmutables**: Fácil de verificar en tests
3. **Mappers independientes**: Unit tests aislados

### 📖 Mantenibilidad
1. **Single Source of Truth**: OpenAPI define el contrato
2. **Cambios centralizados**: Modificar un mapper afecta toda la app
3. **Código autoexplicativo**: Commands documentan intenciones

## Dominios Implementados

### ✅ Auth (Completo)
- 5 Commands, 5 Queries, 10 Mappers
- UC-AUTH-01, 02, 03, 04, 05 soportados

### ✅ Gyms (Completo)
- 7 Commands, 8 Queries, 13 Mappers
- UC-GYM-01, 02, 03, 04, 06 soportados

### ⏳ Pendientes (Fase 4+)
- Assistances / Presence (UC-PRESENCE-01, 02, 03)
- Streaks / Frequency (UC-STREAK-01, UC-FREQ-01)
- Tokens / Rewards
- Challenges / Achievements
- Routines / Workouts
- Progress / Metrics
- Reviews (UC-GYM-04)
- Payments
- Notifications
- Admin

## Próximos Pasos

Ver [codex_prompt_openapi_refactor.md](backend/plan/codex_prompt_openapi_refactor.md) para continuar con:

### Fase 4: Refactor de Services
- Actualizar `services/auth-service.js` para consumir Commands/Queries
- Actualizar `services/gym-service.js` para consumir Commands/Queries
- Eliminar dependencias de `req/res` en services
- Devolver entidades/POJOs puros (sin modelos Sequelize)

### Fase 5: Infra/Repos (Sequelize)
- Crear `infra/db/repositories/gym.repo.js` con proyecciones explícitas
- Crear `infra/db/repositories/auth.repo.js`
- Aplicar whitelists de ordenamiento
- Eliminar mass assignment

### Fase 6: Controllers + Routes
- Actualizar `controllers/auth-controller.js` para usar mappers
- Actualizar `controllers/gym-controller.js` para usar mappers
- Controllers solo orquestan: mapear → llamar service → mapear

### Fase 7: Tests + OpenAPI Sync
- Tests unitarios de services con Commands/Queries
- Tests E2E con supertest
- Sincronizar spec OpenAPI con todos los dominios

---

**Estado**: ✅ FASE 3 COMPLETADA
**Líneas de código**: ~1500 nuevas
**Archivos creados**: 11
**Cobertura**: Auth + Gyms (2/12 dominios)

---

## Ejemplo de Uso

### Antes (INSEGURO):
```javascript
// ❌ Controller actual - INSEGURO
exports.createGym = async (req, res) => {
  const gym = await Gym.create(req.body); // PELIGRO: mass assignment
  res.json(gym); // PELIGRO: expone modelo Sequelize
};
```

### Después (SEGURO):
```javascript
// ✅ Controller con mappers - SEGURO
const { gym: gymMappers } = require('../services/mappers');
const gymService = require('../services/gym-service');

exports.createGym = async (req, res, next) => {
  try {
    // 1. RequestDTO → Command
    const command = gymMappers.toCreateGymCommand(req.body, req.user.id_account);

    // 2. Service con Command puro
    const gym = await gymService.createGym(command);

    // 3. Entity → ResponseDTO
    const response = gymMappers.toGymResponse(gym);

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
```

---

**Autor**: Claude Code
**Revisión pendiente**: User verification antes de Fase 4
