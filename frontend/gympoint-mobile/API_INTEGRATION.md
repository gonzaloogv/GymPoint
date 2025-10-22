# Integración API Backend - GymPoint Mobile

Este documento describe la integración completa del frontend mobile con el backend de GymPoint, siguiendo el esquema OpenAPI definido en los lotes 1, 2 y 3.

## Estructura de la Integración

La integración sigue una arquitectura limpia (Clean Architecture) con las siguientes capas:

```
features/
├── auth/
│   ├── data/
│   │   ├── auth.dto.ts          # DTOs alineados con OpenAPI
│   │   ├── auth.remote.ts       # Cliente API para endpoints de Auth
│   │   ├── auth.mapper.ts       # Transformación DTO → Entity
│   │   └── AuthRepositoryImpl.ts
│   └── domain/
│       └── entities/User.ts
├── user/
│   └── data/
│       └── user.remote.ts       # Cliente API para endpoints de Users
└── gyms/
    └── data/
        ├── dto/GymApiDTO.ts     # DTOs alineados con OpenAPI
        ├── gym.remote.ts        # Cliente API para endpoints de Gyms
        └── mappers/gym.mappers.ts
```

## 1. Autenticación (Auth)

### Endpoints Disponibles

#### `POST /api/auth/register`
Registro de nueva cuenta de usuario.

```typescript
import { AuthRemote } from '@features/auth/data/auth.remote';

const response = await AuthRemote.register({
  email: 'user@example.com',
  password: 'Password123!',
  name: 'Juan',
  lastname: 'Pérez',
  gender: 'M', // 'M' | 'F' | 'O'
  locality: 'Buenos Aires',
  birth_date: '1990-01-01', // YYYY-MM-DD
  frequency_goal: 3, // 1-14
});

// Response incluye tokens y usuario
const { tokens, user } = response;
```

#### `POST /api/auth/login`
Login con email y contraseña.

```typescript
const response = await AuthRemote.login({
  email: 'user@example.com',
  password: 'Password123!',
});

// Response incluye tokens y usuario
const { tokens, user } = response;
```

#### `POST /api/auth/google`
Login con Google OAuth.

```typescript
const response = await AuthRemote.googleLogin({
  idToken: 'google-id-token-here',
});
```

#### `POST /api/auth/refresh-token`
Renovar access token usando refresh token.

```typescript
const response = await AuthRemote.refreshToken({
  refreshToken: 'your-refresh-token',
});

// Response solo incluye nuevo access token
const { accessToken } = response;
```

#### `POST /api/auth/logout`
Revocar refresh token.

```typescript
await AuthRemote.logout({
  refreshToken: 'your-refresh-token',
});
```

### Uso del Repository

```typescript
import { AuthRepositoryImpl } from '@features/auth/data/AuthRepositoryImpl';

const authRepo = new AuthRepositoryImpl();

// Login
const { user, accessToken, refreshToken } = await authRepo.login(
  'user@example.com',
  'Password123!'
);

// Registro
const result = await authRepo.register({
  email: 'user@example.com',
  password: 'Password123!',
  name: 'Juan',
  lastname: 'Pérez',
  gender: 'M',
  locality: 'Buenos Aires',
  birth_date: '1990-01-01',
  frequency_goal: 3,
});

// Obtener perfil actual
const currentUser = await authRepo.me();

// Logout
await authRepo.logout();
```

## 2. Perfil de Usuario (Users)

### Endpoints Disponibles

#### `GET /api/users/me`
Obtener perfil del usuario actual (requiere autenticación).

```typescript
import { UserRemote } from '@features/user/data/user.remote';

const profile = await UserRemote.getProfile();
// o usar alias:
const profile = await UserRemote.getUserProfile();
```

#### `PUT /api/users/me`
Actualizar perfil del usuario actual.

```typescript
await UserRemote.updateProfile({
  name: 'Juan Carlos',
  lastname: 'Pérez García',
  gender: 'M',
  locality: 'Córdoba',
  birth_date: '1990-01-01',
});
```

#### `PUT /api/users/me/email`
Actualizar email del usuario.

```typescript
const result = await UserRemote.updateEmail({
  email: 'newemail@example.com',
});
```

#### `GET /api/users/me/notification-settings`
Obtener configuración de notificaciones.

```typescript
const settings = await UserRemote.getNotificationSettings();
```

#### `PUT /api/users/me/notification-settings`
Actualizar configuración de notificaciones.

```typescript
await UserRemote.updateNotificationSettings({
  push_enabled: true,
  email_enabled: false,
  challenges_enabled: true,
  achievements_enabled: true,
  rewards_enabled: true,
  promotions_enabled: false,
});
```

#### Eliminación de Cuenta

```typescript
// Solicitar eliminación
const result = await UserRemote.requestAccountDeletion({
  reason: 'No longer using the app',
});

// Consultar estado de solicitud
const status = await UserRemote.getAccountDeletionStatus();

// Cancelar solicitud
await UserRemote.cancelAccountDeletion();
```

## 3. Gimnasios (Gyms)

### Endpoints Disponibles

#### `GET /api/gyms`
Listar gimnasios con paginación y filtros.

```typescript
import { GymRemote } from '@features/gyms/data/gym.remote';

const response = await GymRemote.list({
  page: 1,
  limit: 20,
  order: 'desc', // 'asc' | 'desc'
  sortBy: 'created_at', // 'created_at' | 'name' | 'city' | 'month_price'
  city: 'Buenos Aires', // opcional
});

const { items, page, limit, total, totalPages } = response;
```

#### `GET /api/gyms/{gymId}`
Obtener detalle de un gimnasio.

```typescript
const gym = await GymRemote.getById(123);
```

#### `POST /api/gyms`
Crear un gimnasio (requiere autenticación y permisos).

```typescript
const newGym = await GymRemote.create({
  name: 'PowerZone Centro',
  description: 'Gimnasio moderno con equipamiento de última generación',
  city: 'Buenos Aires',
  address: 'Av. Corrientes 1234',
  latitude: -34.603722,
  longitude: -58.381592,
  phone: '+54 11 1234-5678',
  email: 'info@powerzone.com',
  website: 'https://powerzone.com',
  month_price: 15000,
  week_price: 5000,
  geofence_radius_meters: 100,
  min_stay_minutes: 30,
  amenities: [1, 2, 3], // IDs de amenities
});
```

#### `PUT /api/gyms/{gymId}`
Actualizar un gimnasio (requiere autenticación y permisos).

```typescript
const updatedGym = await GymRemote.update(123, {
  name: 'PowerZone Centro - Renovado',
  month_price: 16000,
});
```

#### `DELETE /api/gyms/{gymId}`
Eliminar un gimnasio (requiere autenticación y permisos).

```typescript
await GymRemote.delete(123);
```

#### Catálogos

```typescript
// Listar tipos de gimnasios
const types = await GymRemote.listTypes();

// Listar amenities
const amenities = await GymRemote.listAmenities();
```

### Uso en Mapas

El componente de mapas puede usar la función `list()` para obtener gimnasios cercanos:

```typescript
import { GymRemote } from '@features/gyms/data/gym.remote';
import { mapGymResponseToEntity } from '@features/gyms/data/mappers/gym.mappers';

const response = await GymRemote.list({
  city: userCity,
  page: 1,
  limit: 50,
  sortBy: 'name',
  order: 'asc',
});

const gyms = response.items
  .map(mapGymResponseToEntity)
  .filter((gym) => gym !== null);
```

## 4. DTOs y Tipos

Todos los DTOs están centralizados y tipados:

```typescript
// Auth DTOs
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  AuthSuccessResponseDTO,
  UserProfileResponseDTO,
} from '@features/auth/data/auth.dto';

// Gyms DTOs
import {
  GymResponseDTO,
  GymListResponseDTO,
  GymAmenityDTO,
  GymTypeDTO,
} from '@features/gyms/data/dto/GymApiDTO';
```

## 5. Configuración de API

La configuración base de la API está en `shared/services/api.ts`:

```typescript
import { api } from '@shared/services/api';

// La instancia ya incluye:
// - Interceptor de autenticación (agrega Bearer token)
// - Interceptor de refresh token automático
// - Manejo de errores 401
```

### Variables de Entorno

Asegúrate de configurar la URL base del API:

```env
# .env
API_BASE_URL=http://localhost:3000
# o
API_BASE_URL=https://api.gympoint.app
```

## 6. Mappers

Los mappers transforman DTOs del backend a entidades del dominio:

```typescript
// Auth mappers
import {
  mapAuthUserToEntity,
  mapUserProfileToEntity,
} from '@features/auth/data/auth.mapper';

const user = mapAuthUserToEntity(authResponse.user);
const profile = mapUserProfileToEntity(profileResponse);

// Gyms mappers
import { mapGymResponseToEntity } from '@features/gyms/data/mappers/gym.mappers';

const gym = mapGymResponseToEntity(gymDTO);
```

## 7. Manejo de Errores

Todos los endpoints pueden lanzar errores con la siguiente estructura:

```typescript
type ErrorDTO = {
  code: string;
  message: string;
  details?: Array<Record<string, unknown>>;
};
```

Ejemplo de manejo:

```typescript
try {
  const response = await AuthRemote.login({ email, password });
} catch (error) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as ErrorDTO;
    console.error('Error code:', errorData.code);
    console.error('Message:', errorData.message);

    // Códigos comunes:
    // - INVALID_DATA (400)
    // - UNAUTHORIZED (401)
    // - FORBIDDEN (403)
    // - NOT_FOUND (404)
    // - CONFLICT (409) - ej: email ya registrado
    // - VALIDATION_ERROR (422)
  }
}
```

## 8. Autenticación Automática

La instancia de axios en `api.ts` incluye interceptores para:

1. **Agregar token automáticamente**: Lee el token de SecureStore y lo agrega en cada request
2. **Refresh automático**: Si recibe 401, intenta renovar el token con refresh token
3. **Cola de requests**: Encola requests mientras se renueva el token

No necesitas manejar tokens manualmente en tus componentes.

## 9. Migración desde Código Legacy

Si tienes código usando los DTOs antiguos:

```typescript
// ❌ Antiguo (deprecated)
import { LoginResponseDTO } from './auth.dto';
const user = mapUser(data.user);

// ✅ Nuevo (recomendado)
import { AuthSuccessResponseDTO } from './auth.dto';
import { mapAuthUserToEntity } from './auth.mapper';
const user = mapAuthUserToEntity(data.user);
```

## 10. Testing

Para tests, puedes mockear los remote services:

```typescript
jest.mock('@features/auth/data/auth.remote', () => ({
  AuthRemote: {
    login: jest.fn(),
    register: jest.fn(),
    // ...
  },
}));
```

## Recursos Adicionales

- **OpenAPI Spec**: `backend/node/docs/openapi.yaml`
- **Swagger UI**: `http://localhost:3000/docs` (cuando el backend está corriendo)
- **Postman Collection**: Puedes importar el OpenAPI spec en Postman para testing manual

---

**Última actualización**: 2025-01-22
**Versión del API**: 0.1.0
**Lotes implementados**: 1 (Auth), 2 (Users/Profile), 3 (Gyms)
