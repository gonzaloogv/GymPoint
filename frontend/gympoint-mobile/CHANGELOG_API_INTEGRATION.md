# Changelog - Integración API Backend

## [2025-01-22] - Integración completa lotes 1, 2 y 3

### Agregado

#### 1. DTOs Actualizados (`features/auth/data/auth.dto.ts`)
- ✅ `LoginRequestDTO` y `RegisterRequestDTO` alineados con OpenAPI
- ✅ `AuthSuccessResponseDTO` con estructura `{ tokens, user }`
- ✅ `AuthTokenPairDTO` separando `accessToken` y `refreshToken`
- ✅ `AuthUserDTO` con roles y perfil anidado
- ✅ `UserProfileSummaryDTO` con campos completos del perfil
- ✅ `UserProfileResponseDTO` para endpoint `/api/users/me`
- ✅ DTOs completos para notificaciones, eliminación de cuenta, etc.
- ✅ `ErrorDTO` estandarizado
- ✅ Backward compatibility con tipos legacy

#### 2. Cliente API Auth (`features/auth/data/auth.remote.ts`)
- ✅ `login()` - POST /api/auth/login
- ✅ `register()` - POST /api/auth/register
- ✅ `googleLogin()` - POST /api/auth/google
- ✅ `refreshToken()` - POST /api/auth/refresh-token
- ✅ `logout()` - POST /api/auth/logout
- ✅ `me()` - GET /api/users/me
- ✅ Documentación inline de cada endpoint

#### 3. Cliente API Users (`features/user/data/user.remote.ts`)
- ✅ `getProfile()` - GET /api/users/me
- ✅ `updateProfile()` - PUT /api/users/me
- ✅ `updateEmail()` - PUT /api/users/me/email
- ✅ `requestAccountDeletion()` - DELETE /api/users/me
- ✅ `getAccountDeletionStatus()` - GET /api/users/me/deletion-request
- ✅ `cancelAccountDeletion()` - DELETE /api/users/me/deletion-request
- ✅ `getNotificationSettings()` - GET /api/users/me/notification-settings
- ✅ `updateNotificationSettings()` - PUT /api/users/me/notification-settings
- ✅ `getUserById()` - GET /api/users/{userId} (admin)
- ✅ Alias `getUserProfile()` para compatibilidad

#### 4. DTOs de Gyms (`features/gyms/data/dto/GymApiDTO.ts`)
- ✅ `GymResponseDTO` con todos los campos del OpenAPI
- ✅ `GymListResponseDTO` con paginación
- ✅ `CreateGymRequestDTO` y `UpdateGymRequestDTO`
- ✅ `GymAmenityDTO` y `GymTypeDTO`
- ✅ `GymListQueryParams` para filtros y ordenamiento

#### 5. Cliente API Gyms (`features/gyms/data/gym.remote.ts`)
- ✅ `list()` - GET /api/gyms con paginación
- ✅ `getById()` - GET /api/gyms/{gymId}
- ✅ `create()` - POST /api/gyms
- ✅ `update()` - PUT /api/gyms/{gymId}
- ✅ `delete()` - DELETE /api/gyms/{gymId}
- ✅ `listTypes()` - GET /api/gyms/tipos
- ✅ `listAmenities()` - GET /api/gyms/amenidades
- ✅ `listNearby()` legacy endpoint mantenido

#### 6. Mappers Actualizados

**Auth Mappers** (`features/auth/data/auth.mapper.ts`):
- ✅ `mapAuthUserToEntity()` - transforma AuthUserDTO → User
- ✅ `mapUserProfileToEntity()` - transforma UserProfileResponseDTO → User
- ✅ `mapUser()` con backward compatibility y detección automática de tipo

**Gyms Mappers** (`features/gyms/data/mappers/gym.mappers.ts`):
- ✅ `mapGymResponseToEntity()` - transforma GymResponseDTO → Gym
- ✅ `mapGymDTOtoEntity()` legacy mantenido

#### 7. Repository Actualizado (`features/auth/data/AuthRepositoryImpl.ts`)
- ✅ Login con nueva estructura de response
- ✅ Register con nueva estructura de response
- ✅ Logout con revocación de token en backend
- ✅ Me() usando mapper correcto
- ✅ Manejo correcto de tokens con SecureStore

#### 8. Documentación
- ✅ `API_INTEGRATION.md` - Guía completa de uso
- ✅ `CHANGELOG_API_INTEGRATION.md` - Este archivo
- ✅ Ejemplos de código para cada endpoint
- ✅ Guía de migración desde código legacy

### Modificado

#### API Client (`shared/services/api.ts`)
- El interceptor de refresh token ya estaba implementado
- Actualizado para usar la estructura correcta del refresh endpoint

### Compatibilidad

#### Backward Compatibility Mantenida
- ✅ `LoginResponseDTO` apunta a `AuthSuccessResponseDTO`
- ✅ `RegisterResponseDTO` apunta a `AuthSuccessResponseDTO`
- ✅ `MeResponseDTO` apunta a `UserProfileResponseDTO`
- ✅ `mapUser()` detecta automáticamente el formato y mapea correctamente
- ✅ `UserRemote.getUserProfile()` alias de `getProfile()`
- ✅ `GymRemote.listNearby()` legacy mantenido

### Breaking Changes

⚠️ **Ninguno** - Se mantuvo compatibilidad completa con código existente

### Deprecaciones

Las siguientes funciones están marcadas como `@deprecated` pero siguen funcionando:

- `mapUser()` - Usar `mapAuthUserToEntity()` o `mapUserProfileToEntity()`
- `mapGymDTOtoEntity()` - Usar `mapGymResponseToEntity()`
- `GymRemote.listNearby()` - Usar `GymRemote.list()` con parámetros

### Testing

#### Tests a Actualizar
Los siguientes componentes pueden necesitar actualización en sus tests:

1. `LoginForm` - Validar estructura de response con `tokens` anidado
2. `RegisterScreen` - Validar estructura de response con `tokens` anidado
3. Cualquier componente usando `AuthRepositoryImpl` directamente

#### Tests que NO requieren cambios
- Componentes usando el `useAuth` hook - el mapper maneja la compatibilidad
- Componentes de UI sin lógica de API directa

### Próximos Pasos

#### Lotes Pendientes (según plan backend)
- [ ] Lote 4: Horarios/Reseñas/Pagos Gym
- [ ] Lote 5: Rewards & Tokens
- [ ] Lote 6: Challenges & Streaks & Frecuencia
- [ ] Lote 7: Routines & Workout
- [ ] Lote 8: Progress & Métricas & Achievements
- [ ] Lote 9: Pagos externos & Notifs & Fav/Afiliación

#### Mejoras Sugeridas
- [ ] Agregar tests unitarios para mappers
- [ ] Agregar tests de integración para remote services
- [ ] Implementar cache con React Query para reducir requests
- [ ] Agregar retry logic para requests fallidos
- [ ] Implementar offline-first con sincronización

### Estructura de Archivos Creados/Modificados

```
frontend/gympoint-mobile/
├── API_INTEGRATION.md                           # NUEVO
├── CHANGELOG_API_INTEGRATION.md                 # NUEVO
└── src/
    └── features/
        ├── auth/
        │   └── data/
        │       ├── auth.dto.ts                  # MODIFICADO
        │       ├── auth.remote.ts               # MODIFICADO
        │       ├── auth.mapper.ts               # MODIFICADO
        │       └── AuthRepositoryImpl.ts        # MODIFICADO
        ├── user/
        │   └── data/
        │       └── user.remote.ts               # MODIFICADO
        └── gyms/
            └── data/
                ├── dto/
                │   └── GymApiDTO.ts             # NUEVO
                ├── gym.remote.ts                # MODIFICADO
                └── mappers/
                    └── gym.mappers.ts           # MODIFICADO
```

### Endpoints Implementados

#### Auth (Base: `/api/auth`)
| Método | Endpoint | Implementado | Estado |
|--------|----------|--------------|--------|
| POST | /register | ✅ | AuthRemote.register() |
| POST | /login | ✅ | AuthRemote.login() |
| POST | /google | ✅ | AuthRemote.googleLogin() |
| POST | /refresh-token | ✅ | AuthRemote.refreshToken() |
| POST | /logout | ✅ | AuthRemote.logout() |

#### Users (Base: `/api/users`)
| Método | Endpoint | Implementado | Estado |
|--------|----------|--------------|--------|
| GET | /me | ✅ | UserRemote.getProfile() |
| PUT | /me | ✅ | UserRemote.updateProfile() |
| DELETE | /me | ✅ | UserRemote.requestAccountDeletion() |
| PUT | /me/email | ✅ | UserRemote.updateEmail() |
| GET | /me/deletion-request | ✅ | UserRemote.getAccountDeletionStatus() |
| DELETE | /me/deletion-request | ✅ | UserRemote.cancelAccountDeletion() |
| GET | /me/notification-settings | ✅ | UserRemote.getNotificationSettings() |
| PUT | /me/notification-settings | ✅ | UserRemote.updateNotificationSettings() |
| GET | /{userId} | ✅ | UserRemote.getUserById() |

#### Gyms (Base: `/api/gyms`)
| Método | Endpoint | Implementado | Estado |
|--------|----------|--------------|--------|
| GET | / | ✅ | GymRemote.list() |
| GET | /{gymId} | ✅ | GymRemote.getById() |
| POST | / | ✅ | GymRemote.create() |
| PUT | /{gymId} | ✅ | GymRemote.update() |
| DELETE | /{gymId} | ✅ | GymRemote.delete() |
| GET | /tipos | ✅ | GymRemote.listTypes() |
| GET | /amenidades | ✅ | GymRemote.listAmenities() |

### Configuración Requerida

#### Variables de Entorno
```env
API_BASE_URL=http://localhost:3000
# o
API_BASE_URL=https://api.gympoint.app
```

#### Backend Requirements
- Backend debe estar corriendo en el puerto configurado
- OpenAPI spec implementado según `backend/node/docs/openapi.yaml`
- JWT authentication configurado
- Refresh token mechanism funcionando

### Problemas Conocidos

Ninguno reportado hasta el momento.

### Contributors

- Gonzalo (Full Stack Developer)
- Claude Code (AI Assistant)

---

**Fecha de release**: 2025-01-22
**Versión**: 1.0.0-lotes-1-2-3
**Backend API Version**: 0.1.0
