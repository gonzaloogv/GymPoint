# 📋 Convenciones de Desarrollo - GymPoint

Este documento define las convenciones y mejores prácticas para el desarrollo en GymPoint.

## 📐 Arquitectura

### Capas de la Aplicación

```
┌─────────────────────────────────────────┐
│         Controllers (HTTP Layer)        │  ← Maneja requests/responses
├─────────────────────────────────────────┤
│      Services (Business Logic)          │  ← Lógica de negocio
├─────────────────────────────────────────┤
│     Repositories (Data Access)          │  ← Acceso a datos
├─────────────────────────────────────────┤
│         Models (Database)               │  ← Definición de tablas
└─────────────────────────────────────────┘
```

**Regla de Oro**: Cada capa solo puede comunicarse con la capa inmediatamente inferior.

### Flujo de Datos

```
Request → Controller → Mapper → Command/Query → Service → Repository → Model → DB
                                                                              ↓
Response ← Controller ← Mapper ← DTO ← Service ← Repository ← Entity ← DB
```

## 🏷️ Nomenclatura

### Backend (Node.js)

#### Nombres de Archivos
- **Controllers**: `kebab-case` → `gym-controller.js`
- **Services**: `kebab-case` → `gym-service.js`
- **Repositories**: `kebab-case` → `gym.repository.js`
- **Models**: `PascalCase` → `Gym.js`
- **Mappers**: `kebab-case` → `gym.mappers.js`

#### Nombres de Variables y Funciones
- **Variables**: `camelCase` → `userId`, `gymData`
- **Funciones**: `camelCase` → `createGym`, `updateUser`
- **Constantes**: `UPPER_SNAKE_CASE` → `MAX_RETRIES`, `API_VERSION`
- **Clases**: `PascalCase` → `CreateGymCommand`, `GymService`

#### Base de Datos
- **Tablas**: `snake_case` → `user_profile`, `gym_amenity`
- **Columnas**: `snake_case` → `id_gym`, `created_at`, `is_active`
- **Claves primarias**: `id_<tabla>` → `id_gym`, `id_user`
- **Claves foráneas**: `id_<tabla_referenciada>` → `id_gym`, `id_user`

### API (OpenAPI/JSON)

#### Requests y Responses
- **Campos**: `snake_case` → `token_cost`, `is_active`, `created_at`
- **Endpoints**: `kebab-case` → `/api/gyms`, `/api/special-schedules`

**⚠️ IMPORTANTE**: Aunque JavaScript usa `camelCase`, las APIs REST tradicionalmente usan `snake_case`. Mantener consistencia.

### Frontend (TypeScript/React)

#### Nombres de Archivos
- **Componentes**: `PascalCase` → `GymCard.tsx`, `UserProfile.tsx`
- **Hooks**: `camelCase` → `useGyms.ts`, `useAuth.ts`
- **Utilities**: `camelCase` → `formatDate.ts`, `validators.ts`
- **Types**: `PascalCase` → `Gym.ts`, `User.ts`

#### Nombres de Variables y Funciones
- **Variables**: `camelCase` → `gymData`, `isLoading`
- **Funciones**: `camelCase` → `handleSubmit`, `fetchGyms`
- **Tipos/Interfaces**: `PascalCase` → `Gym`, `CreateGymDTO`, `GymResponse`
- **Constantes**: `UPPER_SNAKE_CASE` → `API_BASE_URL`, `MAX_FILE_SIZE`

## 🔄 Mapeo de Datos

### Backend → Frontend (Response)

```javascript
// Backend (snake_case)
{
  id_gym: 1,
  token_cost: 50,
  is_active: true,
  created_at: "2025-01-01"
}

// Frontend (camelCase en dominio, snake_case en DTO)
// DTO (mantiene snake_case del API)
interface GymResponse {
  id_gym: number;
  token_cost: number;
  is_active: boolean;
  created_at: string;
}

// Domain Entity (usa camelCase)
interface Gym {
  idGym: number;
  tokenCost: number;
  isActive: boolean;
  createdAt: Date;
}
```

### Frontend → Backend (Request)

```typescript
// Frontend Domain
const gym: CreateGymDTO = {
  name: "Test Gym",
  tokenCost: 50,
  isActive: true
};

// Mapper convierte a snake_case para API
const request = {
  name: "Test Gym",
  token_cost: 50,
  is_active: true
};
```

## 📝 Comandos y Queries (CQRS)

### Commands (Modifican estado)
```javascript
class CreateGymCommand {
  constructor({ name, description, city, ... }) {
    this.name = name;
    this.description = description;
    // ...
  }
}
```

### Queries (Solo lectura)
```javascript
class GetGymByIdQuery {
  constructor(gymId) {
    this.gymId = gymId;
  }
}
```

## 🗺️ Mappers

### Responsabilidades
1. **Request Mappers**: DTO → Command/Query
2. **Response Mappers**: Entity → DTO
3. **Domain Mappers**: DTO ↔ Domain Entity (frontend)

### Ejemplo Completo

```javascript
// backend/services/mappers/gym.mappers.js

// Request → Command
function toCreateGymCommand(dto) {
  return new CreateGymCommand({
    name: dto.name,
    tokenCost: dto.token_cost,  // snake_case → camelCase
    isActive: dto.is_active,
    equipment: dto.equipment || [],
    rules: dto.rules || [],
    amenities: dto.amenities || []
  });
}

// Entity → Response DTO
function toGymResponse(gym) {
  return {
    id_gym: gym.id_gym,
    name: gym.name,
    token_cost: gym.tokenCost,  // camelCase → snake_case
    is_active: gym.isActive,
    equipment: gym.equipment || [],
    rules: gym.rules || [],
    amenities: gym.amenities || [],
    created_at: gym.createdAt
  };
}
```

## ✅ Validación

### OpenAPI Schema
- Define el contrato de la API
- Valida requests y responses automáticamente
- Usa `snake_case` para campos

### Backend Validation
```javascript
// En el service, no en el controller
if (!command.name || command.name.trim() === '') {
  throw new ValidationError('El nombre es requerido');
}
```

### Frontend Validation
```typescript
// En el formulario, antes de enviar
if (!formData.name.trim()) {
  setError('El nombre es requerido');
  return;
}
```

## 🔐 Autenticación y Autorización

### JWT Tokens
```javascript
// Estructura del token
{
  id_account: 123,
  id_user: 456,
  role: 'admin',
  iat: 1234567890,
  exp: 1234567890
}
```

### Middleware de Autenticación
```javascript
// Siempre usar el middleware auth
router.post('/api/gyms', 
  authenticateToken,        // Verifica JWT
  requireRole(['admin']),   // Verifica rol
  gymController.createGym
);
```

## 📊 Logging

### Niveles de Log
- `error`: Errores que requieren atención inmediata
- `warn`: Situaciones anormales pero manejables
- `info`: Eventos importantes del sistema
- `http`: Requests HTTP
- `debug`: Información detallada para debugging

### Uso del Logger
```javascript
const logger = require('../config/logger');

// ✅ BIEN - Logging estructurado
logger.info('Gym created', {
  gymId: gym.id_gym,
  userId: req.account.id_account,
  name: gym.name
});

// ❌ MAL - console.log
console.log('Gym created:', gym.id_gym);
```

### Logging de Errores
```javascript
// ✅ BIEN
logger.logError(error, {
  context: 'createGym',
  userId: req.account.id_account,
  gymData: sanitize(req.body)
});

// ❌ MAL
console.error(error);
```

## 🧪 Testing

### Estructura de Tests
```
tests/
├── unit/              # Tests unitarios (funciones puras)
├── integration/       # Tests de integración (API endpoints)
└── e2e/              # Tests end-to-end (flujos completos)
```

### Nomenclatura de Tests
```javascript
describe('GymService', () => {
  describe('createGym', () => {
    it('debe crear un gimnasio con todos los campos', async () => {
      // Arrange
      const gymData = { ... };
      
      // Act
      const result = await gymService.createGym(gymData);
      
      // Assert
      expect(result).toHaveProperty('id_gym');
    });
  });
});
```

## 🔄 OpenAPI Workflow

### Flujo de Trabajo
1. **Modificar schema modular**: `docs/openapi/components/schemas/*.yaml`
2. **Generar bundle**: `npm run openapi:bundle`
3. **Generar tipos TS**: `npm run openapi:generate-types`
4. **Validar sincronización**: `npm run openapi:validate`

### Comando Rápido
```bash
npm run openapi:sync  # Hace bundle + generate-types
```

## 📦 Campos Opcionales

### Backend
```javascript
// ✅ BIEN - Usar valores por defecto
equipment: command.equipment || [],
rules: command.rules || [],
email: command.email || null,

// ❌ MAL - Dejar undefined
equipment: command.equipment,
```

### Frontend
```typescript
// ✅ BIEN - No enviar undefined
const request = {
  name: dto.name,
  ...(dto.email && { email: dto.email }),  // Solo si tiene valor
  ...(dto.phone && { phone: dto.phone })
};

// ❌ MAL - Enviar undefined
const request = {
  name: dto.name,
  email: dto.email,  // Puede ser undefined
  phone: dto.phone
};
```

## 🚀 Mejores Prácticas

### 1. Separación de Responsabilidades
- Controllers: Solo manejo de HTTP
- Services: Lógica de negocio
- Repositories: Acceso a datos

### 2. Inmutabilidad
```javascript
// ✅ BIEN
const updatedGym = { ...gym, name: 'New Name' };

// ❌ MAL
gym.name = 'New Name';
```

### 3. Async/Await
```javascript
// ✅ BIEN
try {
  const gym = await gymService.createGym(command);
  return res.status(201).json(gym);
} catch (error) {
  logger.logError(error);
  return res.status(500).json({ error: 'Internal error' });
}

// ❌ MAL
gymService.createGym(command)
  .then(gym => res.json(gym))
  .catch(err => console.log(err));
```

### 4. Validación Temprana
```javascript
// ✅ BIEN - Validar al inicio
if (!command.name) {
  throw new ValidationError('Name required');
}
// ... resto de la lógica

// ❌ MAL - Validar tarde
// ... mucha lógica
if (!command.name) throw new Error('Name required');
```

### 5. Manejo de Errores
```javascript
// ✅ BIEN - Errores específicos
throw new NotFoundError('Gym not found');
throw new ValidationError('Invalid email');
throw new UnauthorizedError('Invalid token');

// ❌ MAL - Errores genéricos
throw new Error('Error');
```

## 📚 Recursos

- [OpenAPI Specification](https://swagger.io/specification/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [REST API Best Practices](https://restfulapi.net/)

---

**Última actualización**: 2025-10-25
**Mantenido por**: Equipo GymPoint

