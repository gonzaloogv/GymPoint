# 🧪 Testing de Google OAuth

## Estado Actual

Los tests unitarios para Google OAuth están implementados en `tests/google-auth.test.js` pero tienen limitaciones debido a la forma en que Sequelize carga las asociaciones de modelos.

## Problema Técnico

Sequelize requiere que los modelos se carguen de forma específica para establecer asociaciones (belongsTo, hasMany, etc.). Al mockear modelos individualmente, se rompen estas asociaciones.

## Soluciones

### Opción 1: Tests de Integración (Recomendado)

En lugar de tests unitarios con mocks, se recomienda crear tests de integración que usen una base de datos de prueba.

**Ventajas:**
- Prueba el flujo completo real
- No requiere mocks complejos
- Detecta problemas de integración

**Implementación:**
```bash
# Crear DB de test
mysql -u root -p -e "CREATE DATABASE gympoint_test;"

# Configurar en .env.test
DB_NAME=gympoint_test
NODE_ENV=test

# Ejecutar tests
npm run test:integration
```

### Opción 2: Tests Manuales con Postman/Insomnia

Crear una colección de Postman con casos de prueba:

1. **POST /api/auth/google** - Usuario nuevo
2. **POST /api/auth/google** - Usuario existente
3. **POST /api/auth/google** - Vincular cuenta local
4. **POST /api/auth/google** - Token inválido
5. **POST /api/auth/login** - Rechazar cuenta de Google

Ver: `docs/postman/google-auth.json`

### Opción 3: Refactor de Modelos

Centralizarlas asociaciones en un solo archivo `models/index.js` que exporte todos los modelos con asociaciones ya configuradas.

```javascript
// models/index.js
const User = require('./User');
const Gym = require('./Gym');
// ... otros modelos

// Configurar asociaciones
User.belongsToMany(Gym, {...});
Gym.hasMany(User, {...});

module.exports = { User, Gym, ... };
```

## Tests Ejecutables Actualmente

### Test de Login con Proveedor

```javascript
describe('login - Validación de Proveedor', () => {
  it('debería rechazar login con contraseña si el usuario es de Google', async () => {
    const googleUser = {
      id_user: 4,
      email: 'google@example.com',
      auth_provider: 'google',
      password: null
    };

    User.findOne.mockResolvedValue(googleUser);

    await expect(authService.login('google@example.com', 'password', mockReq))
      .rejects.toThrow('Esta cuenta fue creada con Google');
  });
});
```

**Estado:** ✅ PASSING

## Casos de Prueba Documentados

Los siguientes casos están documentados y deberían probarse manualmente:

### 1. Usuario Nuevo con Google

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "<VALID_GOOGLE_ID_TOKEN>"
}
```

**Expected:**
- ✅ Status: 200
- ✅ Crea usuario con `auth_provider: 'google'`
- ✅ Crea frecuencia semanal (goal: 3)
- ✅ Crea streak inicial (value: 0)
- ✅ Retorna `accessToken`, `refreshToken`, `user`

### 2. Usuario Existente con Google

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "<SAME_EMAIL_TOKEN>"
}
```

**Expected:**
- ✅ Status: 200
- ✅ No crea duplicado
- ✅ Genera nuevos tokens
- ✅ Mantiene datos existentes

### 3. Vincular Cuenta Local

**Pre-condición:** Usuario existe con `auth_provider: 'local'`

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "<SAME_EMAIL_TOKEN>"
}
```

**Expected:**
- ✅ Status: 200
- ✅ Actualiza `auth_provider` a 'google'
- ✅ Guarda `google_id`
- ✅ Mantiene password, streak, tokens, etc.

### 4. Token Inválido

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "invalid-token-12345"
}
```

**Expected:**
- ✅ Status: 401
- ✅ Error: `{ code: 'GOOGLE_AUTH_FAILED', message: '...' }`

### 5. Email No Verificado

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "<UNVERIFIED_EMAIL_TOKEN>"
}
```

**Expected:**
- ✅ Status: 401
- ✅ Error: `{ code: 'GOOGLE_AUTH_FAILED', message: 'El email de Google debe estar verificado' }`

### 6. Login con Password (Cuenta de Google)

**Pre-condición:** Usuario existe con `auth_provider: 'google'`

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "google@example.com",
  "password": "anypassword"
}
```

**Expected:**
- ✅ Status: 401
- ✅ Error: `Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.`

## Ejecutar Tests Existentes

```bash
# Todos los tests
npm test

# Solo el test que funciona
npm test -- -t "rechazar login con contraseña"
```

## Próximos Pasos

1. [ ] Crear colección de Postman para pruebas manuales
2. [ ] Configurar DB de test para tests de integración
3. [ ] Refactorizar modelos para mejorar testabilidad
4. [ ] Implementar tests E2E con supertest

## Referencias

- [Testing Sequelize](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Jest Mocking](https://jestjs.io/docs/mock-functions)
- [Supertest](https://github.com/ladjs/supertest)

---

**Última actualización:** Octubre 2025  
**Estado:** En progreso - Se recomienda testing manual mientras se implementa solución definitiva

