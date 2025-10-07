# Services - Capa de Lógica de Negocio

Esta carpeta contiene todos los servicios de la aplicación. Los services implementan la lógica de dominio y orquestan operaciones complejas.

## Principios

1. **Sin dependencias HTTP**: Los services no deben depender de Express (req, res)
2. **Transaccionales**: Operaciones críticas deben usar transacciones DB
3. **Idempotentes**: Operaciones repetidas deben dar el mismo resultado
4. **Validación**: Usar Joi o custom errors para validar parámetros de entrada
5. **Errores estructurados**: Usar custom errors (`NotFoundError`, `ValidationError`, etc.)

## Servicios principales

### token-ledger-service.js
Sistema de ledger para tokens de usuarios.

**Características:**
- Registro de movimientos (ganancia/gasto)
- Garantía de balance no negativo mediante `SELECT FOR UPDATE`
- Auditoría completa de transacciones
- Idempotencia mediante `ref_type`/`ref_id`

**Funciones principales:**
- `registrarMovimiento()` - Registra un movimiento de tokens
- `obtenerHistorial()` - Historial paginado de movimientos
- `obtenerBalance()` - Balance actual del usuario
- `obtenerEstadisticas()` - Estadísticas agregadas (ganado/gastado)
- `existeMovimiento()` - Verifica idempotencia

**Ejemplo:**
```javascript
const result = await tokenLedgerService.registrarMovimiento({
  userId: 123,
  delta: 10,
  reason: 'ATTENDANCE',
  refType: 'assistance',
  refId: 456
});
console.log(result.newBalance); // 110
```

### auth-service.js
Gestión de autenticación y autorización.

**Características:**
- Registro de usuarios locales
- Login local (email + password)
- Login con Google OAuth
- Generación de tokens JWT (access + refresh)
- Refresh token rotation

**Funciones principales:**
- `register()` - Registro de nuevo usuario
- `login()` - Login local
- `googleLogin()` - Login con Google OAuth
- `generateAccessToken()` - Genera JWT access token
- `refreshAccessToken()` - Renueva access token
- `logout()` - Revoca refresh token

**Ejemplo:**
```javascript
const { token, refreshToken, account, profile } = await authService.login(
  'user@example.com',
  'password123',
  req
);
```

### gym-service.js
Gestión de gimnasios.

**Características:**
- CRUD de gimnasios
- **Búsqueda geoespacial** (bounding box + Haversine)
- Filtros por ciudad, tipo, precio
- Soft deletes (paranoid mode)

**Funciones principales:**
- `getAllGyms()` - Listar todos los gimnasios
- `getGymById()` - Obtener gimnasio por ID
- `createGym()` - Crear gimnasio con tipos asociados
- `updateGym()` - Actualizar gimnasio
- `deleteGym()` - Soft delete de gimnasio
- `buscarGimnasiosCercanos()` - Búsqueda por proximidad GPS
- `filtrarGimnasios()` - Filtros avanzados

**Ejemplo de búsqueda geoespacial:**
```javascript
const gyms = await gymService.buscarGimnasiosCercanos(
  -34.6037,  // latitud
  -58.3816,  // longitud
  5,         // radio en km
  20,        // limit
  0          // offset
);
```

### assistance-service.js
Registro de asistencias a gimnasios.

**Características:**
- Validación de proximidad GPS (configurable con `PROXIMITY_METERS`)
- Control de racha (streak)
- Otorgamiento automático de tokens
- Detección de duplicados (una asistencia por día)

**Funciones principales:**
- `registrarAsistencia()` - Registra asistencia con validaciones
- `obtenerHistorialAsistencias()` - Historial del usuario

**Ejemplo:**
```javascript
const result = await assistanceService.registrarAsistencia({
  id_user: 123,
  id_gym: 456,
  latitude: -34.6037,
  longitude: -58.3816
});
console.log(result.tokens_actuales); // 110
console.log(result.racha_actual); // 5
```

### reward-service.js
Gestión de recompensas canjeables.

**Características:**
- Listar recompensas disponibles (con stock y fechas)
- Canjear recompensas con validación de saldo
- Generación automática de códigos
- Historial de canjes

**Funciones principales:**
- `listarRecompensas()` - Recompensas disponibles
- `canjearRecompensa()` - Canjear con transacción
- `obtenerHistorialRecompensas()` - Historial del usuario
- `crearRecompensa()` - ADMIN - Crear recompensa

### user-service.js
Gestión de perfiles de usuario.

**Funciones principales:**
- `obtenerUsuario()` - Obtener account + profile
- `obtenerPerfilPorId()` - Obtener perfil por ID
- `actualizarPerfil()` - Actualizar datos del perfil
- `actualizarEmail()` - Cambiar email (requiere re-verificación)
- `eliminarCuenta()` - Soft delete de cuenta
- `actualizarSuscripcion()` - ADMIN - Cambiar suscripción

### routine-service.js
Gestión de rutinas de ejercicios.

**Funciones principales:**
- `getRoutineWithExercises()` - Obtener rutina con ejercicios ordenados
- `createRoutineWithExercises()` - Crear rutina con múltiples ejercicios
- `updateRoutine()` - Actualizar datos de rutina
- `deleteRoutine()` - Soft delete de rutina
- `getRoutinesByUser()` - Rutinas creadas por un usuario

## Patrones de diseño

### Transacciones
```javascript
const t = await sequelize.transaction();
try {
  // operaciones
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

### Idempotencia
```javascript
const exists = await tokenLedgerService.existeMovimiento('assistance', assistanceId);
if (exists) {
  throw new ConflictError('Tokens ya otorgados');
}
```

### Validación con Joi
```javascript
const schema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required()
});

const { error, value } = schema.validate(data);
if (error) {
  throw new ValidationError('Parámetros inválidos', error.details);
}
```

### Custom Errors
```javascript
const { NotFoundError, BusinessError, ValidationError } = require('../utils/errors');

if (!user) throw new NotFoundError('Usuario');
if (balance < 0) throw new BusinessError('Saldo insuficiente', 'INSUFFICIENT_BALANCE');
```

## Testing

Cada service debe tener su archivo `.test.js` correspondiente en `tests/`.

**Ejemplo de estructura de test:**
```javascript
jest.mock('../models');
const service = require('../services/token-ledger-service');

describe('token-ledger-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe agregar tokens correctamente', async () => {
    // Arrange
    const mockUser = { tokens: 100, update: jest.fn() };
    UserProfile.findByPk.mockResolvedValue(mockUser);

    // Act
    const result = await service.registrarMovimiento({
      userId: 1,
      delta: 50,
      reason: 'ATTENDANCE'
    });

    // Assert
    expect(result.newBalance).toBe(150);
  });
});
```

Ver ejemplos completos en:
- `tests/token-ledger-service.test.js` (14 tests, 100% coverage)
- `tests/assistance-service.test.js`
- `tests/reward-service.test.js`

## Documentación

Todos los services principales están documentados con JSDoc:

```javascript
/**
 * Registra un movimiento de tokens
 *
 * @async
 * @param {Object} params - Parámetros del movimiento
 * @param {number} params.userId - ID del user_profile
 * @param {number} params.delta - Cantidad (positivo=ganancia, negativo=gasto)
 * @param {string} params.reason - Motivo del movimiento
 *
 * @returns {Promise<Object>} Resultado con newBalance
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {BusinessError} Si el saldo quedaría negativo
 *
 * @example
 * const result = await registrarMovimiento({
 *   userId: 123,
 *   delta: 10,
 *   reason: 'ATTENDANCE'
 * });
 */
```

## Convenciones

1. **Nombres de funciones**: camelCase (ej: `registrarMovimiento`)
2. **Parámetros**: usar destructuring cuando hay múltiples parámetros
3. **Errores**: siempre lanzar custom errors, nunca `new Error()`
4. **Async/await**: todas las funciones asíncronas deben usar async/await
5. **Transacciones**: usar transacciones para operaciones críticas
6. **Logging**: usar `console.error()` para errores (capturado por error-handler)

## Referencias

- **Error handling**: `utils/errors.js`
- **Constantes**: `config/constants.js`
- **Modelos**: `models/`
- **Tests**: `tests/`
- **Documentación API**: http://localhost:3000/api-docs (Swagger)
