# 📮 Guía de Testing con Postman - GymPoint API

## 🎯 Descripción

Esta guía proporciona una colección completa de requests de Postman para probar todos los endpoints del backend de GymPoint.

---

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Variables de Entorno](#variables-de-entorno)
3. [Endpoints por Categoría](#endpoints-por-categoría)
4. [Flujo de Testing Completo](#flujo-de-testing-completo)
5. [Colección JSON de Postman](#colección-json-de-postman)

---

## 🔧 Configuración Inicial

### 1. Instalar Postman

Descargar desde: https://www.postman.com/downloads/

### 2. Importar la Colección

Puedes importar manualmente cada request o usar la colección JSON al final de este documento.

### 3. Configurar Variables de Entorno

En Postman: `Environments` → `Create Environment` → `GymPoint Local`

---

## 🌍 Variables de Entorno

Crear un entorno llamado **"GymPoint Local"** con estas variables:

| Variable | Valor Inicial | Valor Actual (se actualiza automáticamente) |
|----------|---------------|---------------------------------------------|
| `base_url` | `http://localhost:3000` | - |
| `access_token` | - | Se actualiza después del login |
| `refresh_token` | - | Se actualiza después del login |
| `user_id` | - | Se actualiza después del login |
| `gym_id` | `1` | ID de gimnasio para testing |
| `routine_id` | - | Se actualiza al crear rutina |
| `reward_id` | `1` | ID de recompensa para testing |

### Script para Auto-guardar Tokens

En cada request de login, agregar este script en la pestaña **Tests**:

```javascript
// Guardar tokens automáticamente
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
    pm.environment.set("user_id", jsonData.user.id_user);
    console.log("✅ Tokens guardados");
}
```

---

## 📚 Endpoints por Categoría

---

## 1. 🏥 Health Checks

### 1.1 Health Check (Liveness)

**Descripción:** Verifica que el servidor esté corriendo.

```http
GET {{base_url}}/health
```

**Respuesta esperada (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T20:00:00.000Z",
  "uptime": 3600,
  "env": "development"
}
```

---

### 1.2 Ready Check (Readiness)

**Descripción:** Verifica que el servidor esté listo (DB + migraciones).

```http
GET {{base_url}}/ready
```

**Respuesta esperada (200):**
```json
{
  "status": "ready",
  "database": "connected",
  "migrations": "up to date",
  "timestamp": "2025-10-04T20:00:00.000Z"
}
```

---

## 2. 🔐 Autenticación

### 2.1 Registro de Usuario

**Descripción:** Crear una nueva cuenta de usuario.

```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan.perez@test.com",
  "password": "password123",
  "gender": "M",
  "locality": "Resistencia",
  "age": 25,
  "role": "USER",
  "frequency_goal": 3
}
```

**Respuesta esperada (201):**
```json
{
  "id_user": 1,
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan.perez@test.com",
  "gender": "M",
  "locality": "Resistencia",
  "age": 25,
  "role": "USER",
  "tokens": 0,
  "auth_provider": "local"
}
```

**Tests (Scripts):**
```javascript
if (pm.response.code === 201) {
    const user = pm.response.json();
    pm.environment.set("user_id", user.id_user);
    pm.test("Usuario creado correctamente", () => {
        pm.expect(user.email).to.eql("juan.perez@test.com");
    });
}
```

---

### 2.2 Login con Email y Contraseña

**Descripción:** Iniciar sesión con credenciales locales.

```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "juan.perez@test.com",
  "password": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_user": 1,
    "name": "Juan",
    "email": "juan.perez@test.com",
    "role": "USER",
    "tokens": 0
  }
}
```

**Tests (Scripts):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
    pm.environment.set("user_id", jsonData.user.id_user);
    
    pm.test("Login exitoso", () => {
        pm.expect(jsonData.accessToken).to.be.a('string');
        pm.expect(jsonData.refreshToken).to.be.a('string');
    });
}
```

---

### 2.3 Login con Google OAuth

**Descripción:** Iniciar sesión con Google.

```http
POST {{base_url}}/api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdlM..."
}
```

**Nota:** Para obtener un `idToken` real, necesitas implementar Google Sign-In en tu frontend.

**Respuesta esperada (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_user": 2,
    "name": "María",
    "email": "maria@gmail.com",
    "auth_provider": "google",
    "google_id": "112233445566778899"
  }
}
```

---

### 2.4 Refrescar Access Token

**Descripción:** Obtener un nuevo access token usando el refresh token.

```http
POST {{base_url}}/api/auth/refresh-token
Content-Type: application/json

{
  "token": "{{refresh_token}}"
}
```

**Respuesta esperada (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Tests (Scripts):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.test("Token refrescado", () => {
        pm.expect(jsonData.accessToken).to.be.a('string');
    });
}
```

---

### 2.5 Logout

**Descripción:** Cerrar sesión y revocar refresh token.

```http
POST {{base_url}}/api/auth/logout
Content-Type: application/json

{
  "token": "{{refresh_token}}"
}
```

**Respuesta esperada (200):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

## 3. 🏋️ Gimnasios

### 3.1 Obtener Todos los Gimnasios

```http
GET {{base_url}}/api/gyms
```

**Respuesta esperada (200):**
```json
[
  {
    "id_gym": 1,
    "name": "PowerGym Centro",
    "description": "Gimnasio completo con todas las máquinas",
    "city": "Resistencia",
    "address": "Av. Alberdi 1234",
    "latitude": "-27.4514",
    "longitude": "-58.9867",
    "gym_type": "completo",
    "month_price": 15000,
    "week_price": 5000,
    "logo_url": "https://example.com/logo.jpg"
  }
]
```

---

### 3.2 Buscar Gimnasios Cercanos

**Descripción:** Buscar gimnasios por proximidad GPS.

```http
GET {{base_url}}/api/gyms/cercanos?lat=-27.4514&lon=-58.9867
```

**Parámetros:**
- `lat` (number): Latitud del usuario
- `lon` (number): Longitud del usuario

**Respuesta esperada (200):**
```json
[
  {
    "id_gym": 1,
    "name": "PowerGym Centro",
    "latitude": "-27.4514",
    "longitude": "-58.9867",
    "distancia": 150,
    "month_price": 15000
  }
]
```

---

### 3.3 Obtener Gimnasio por ID

```http
GET {{base_url}}/api/gyms/{{gym_id}}
```

**Respuesta esperada (200):**
```json
{
  "id_gym": 1,
  "name": "PowerGym Centro",
  "description": "Gimnasio completo",
  "city": "Resistencia",
  "address": "Av. Alberdi 1234",
  "latitude": "-27.4514",
  "longitude": "-58.9867",
  "phone": "+54 362 4123456",
  "email": "info@powergym.com",
  "gym_type": "completo",
  "equipment": "Pesas, Máquinas, Cardio",
  "month_price": 15000,
  "week_price": 5000
}
```

---

### 3.4 Filtrar Gimnasios (requiere autenticación)

**Descripción:** Filtrar por ciudad, precio y tipo (tipo solo para PREMIUM).

```http
GET {{base_url}}/api/gyms/filtro?city=Resistencia&minPrice=10000&maxPrice=20000&type=completo
Authorization: Bearer {{access_token}}
```

**Parámetros:**
- `city` (string): Ciudad
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `type` (string): Tipo de gimnasio (solo PREMIUM)

**Respuesta esperada (200):**
```json
{
  "gimnasios": [
    {
      "id_gym": 1,
      "name": "PowerGym Centro",
      "city": "Resistencia",
      "month_price": 15000
    }
  ],
  "advertencia": null
}
```

---

### 3.5 Crear Gimnasio (requiere ADMIN)

```http
POST {{base_url}}/api/gyms
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "FitCenter Norte",
  "description": "Gimnasio moderno con todas las comodidades",
  "city": "Resistencia",
  "address": "Av. 9 de Julio 5678",
  "latitude": -27.4444,
  "longitude": -58.9999,
  "phone": "+54 362 4999999",
  "email": "info@fitcenter.com",
  "gym_type": "completo",
  "equipment": "Pesas, Cardio, Funcional",
  "month_price": 18000,
  "week_price": 6000
}
```

**Respuesta esperada (201):**
```json
{
  "id_gym": 2,
  "name": "FitCenter Norte",
  "city": "Resistencia"
}
```

---

## 4. ✅ Asistencias

### 4.1 Registrar Asistencia

**Descripción:** Registrar asistencia con validación GPS, tokens y racha.

```http
POST {{base_url}}/api/assistances/registrar
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "id_user": {{user_id}},
  "id_gym": {{gym_id}},
  "latitude": -27.4514,
  "longitude": -58.9867
}
```

**Respuesta esperada (201):**
```json
{
  "asistencia": {
    "id_assistance": 1,
    "id_user": 1,
    "id_gym": 1,
    "date": "2025-10-04"
  },
  "distancia": 50,
  "tokens_actuales": 5,
  "racha_actualizada": {
    "value": 1,
    "last_value": 0
  }
}
```

**Errores posibles:**
- **400:** Asistencia ya registrada hoy
- **403:** Usuario fuera de rango (> 180m del gimnasio)

---

### 4.2 Obtener Historial de Asistencias

```http
GET {{base_url}}/api/assistances/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_assistance": 1,
    "id_user": 1,
    "id_gym": 1,
    "date": "2025-10-04",
    "gym": {
      "name": "PowerGym Centro"
    }
  }
]
```

---

## 5. 🏃‍♂️ Rutinas

### 5.1 Crear Rutina con Ejercicios

**Descripción:** Crear una rutina personalizada (mínimo 3 ejercicios).

```http
POST {{base_url}}/api/routines
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "routine_name": "Rutina de Fuerza",
  "description": "Rutina enfocada en fuerza",
  "exercises": [
    {
      "id_exercise": 1,
      "series": 4,
      "reps": 10,
      "order": 1
    },
    {
      "id_exercise": 2,
      "series": 3,
      "reps": 12,
      "order": 2
    },
    {
      "id_exercise": 3,
      "series": 4,
      "reps": 8,
      "order": 3
    }
  ]
}
```

**Respuesta esperada (201):**
```json
{
  "id_routine": 1,
  "routine_name": "Rutina de Fuerza",
  "description": "Rutina enfocada en fuerza",
  "exercises": [...]
}
```

**Tests (Scripts):**
```javascript
if (pm.response.code === 201) {
    const routine = pm.response.json();
    pm.environment.set("routine_id", routine.id_routine);
}
```

---

### 5.2 Obtener Mis Rutinas

```http
GET {{base_url}}/api/routines/me
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_routine": 1,
    "routine_name": "Rutina de Fuerza",
    "description": "Rutina enfocada en fuerza"
  }
]
```

---

### 5.3 Completar Rutina

**Descripción:** Marcar rutina como completada y recibir tokens.

```http
POST {{base_url}}/api/user-routines
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "id_user": {{user_id}},
  "id_routine": {{routine_id}},
  "completed": true
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Rutina completada",
  "tokens_ganados": 10,
  "tokens_actuales": 15
}
```

---

## 6. 🎁 Recompensas

### 6.1 Obtener Todas las Recompensas

```http
GET {{base_url}}/api/rewards
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_reward": 1,
    "name": "Recuperar Racha",
    "description": "Recupera tu racha perdida",
    "cost": 50,
    "reward_type": "recovery_item",
    "provider": "system",
    "stock": null
  },
  {
    "id_reward": 2,
    "name": "Pase 1 Día - PowerGym",
    "description": "Acceso de 1 día al gimnasio",
    "cost": 30,
    "reward_type": "day_pass",
    "provider": "gym",
    "stock": 10
  }
]
```

---

### 6.2 Canjear Recompensa

**Descripción:** Canjear tokens por una recompensa.

```http
POST {{base_url}}/api/rewards/canjear
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "id_user": {{user_id}},
  "id_reward": {{reward_id}}
}
```

**Respuesta esperada (200):**
```json
{
  "message": "Recompensa canjeada exitosamente",
  "recompensa": {
    "name": "Recuperar Racha",
    "cost": 50
  },
  "tokens_restantes": 10,
  "codigo_generado": "ABC123XYZ" // Si aplica
}
```

**Errores posibles:**
- **400:** Tokens insuficientes
- **404:** Recompensa no disponible o sin stock

---

### 6.3 Obtener Mis Recompensas Canjeadas

```http
GET {{base_url}}/api/rewards/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_claimed_reward": 1,
    "id_reward": 1,
    "claimed_at": "2025-10-04T15:30:00.000Z",
    "status": "redeemed",
    "reward": {
      "name": "Recuperar Racha",
      "description": "Recupera tu racha perdida"
    }
  }
]
```

---

## 7. 💰 Tokens y Transacciones

### 7.1 Obtener Balance de Tokens

```http
GET {{base_url}}/api/tokens/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
{
  "id_user": 1,
  "tokens": 25,
  "name": "Juan Pérez"
}
```

---

### 7.2 Obtener Historial de Transacciones

```http
GET {{base_url}}/api/transactions/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_transaction": 1,
    "id_user": 1,
    "transaction_type": "earn",
    "tokens": 5,
    "reason": "Asistencia registrada",
    "created_at": "2025-10-04T10:00:00.000Z"
  },
  {
    "id_transaction": 2,
    "id_user": 1,
    "transaction_type": "spend",
    "tokens": -50,
    "reason": "Canje de recompensa",
    "created_at": "2025-10-04T15:30:00.000Z"
  }
]
```

---

## 8. 📊 Progreso y Frecuencia

### 8.1 Obtener Frecuencia Semanal

```http
GET {{base_url}}/api/frequency/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
{
  "id_frequency": 1,
  "id_user": 1,
  "goal": 3,
  "assist": 2,
  "achieved_goal": false
}
```

---

### 8.2 Actualizar Meta Semanal

```http
PUT {{base_url}}/api/frequency/{{user_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "goal": 4
}
```

**Respuesta esperada (200):**
```json
{
  "id_frequency": 1,
  "goal": 4,
  "assist": 2,
  "achieved_goal": false
}
```

---

### 8.3 Obtener Progreso del Usuario

```http
GET {{base_url}}/api/progress/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
{
  "asistencias_totales": 15,
  "rutinas_completadas": 8,
  "racha_actual": 5,
  "tokens": 25,
  "meta_semanal": {
    "goal": 3,
    "assist": 2,
    "achieved_goal": false
  }
}
```

---

## 9. 👤 Usuario

### 9.1 Obtener Mi Perfil

```http
GET {{base_url}}/api/users/me
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
{
  "id_user": 1,
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan.perez@test.com",
  "gender": "M",
  "locality": "Resistencia",
  "age": 25,
  "subscription": "FREE",
  "tokens": 25,
  "auth_provider": "local",
  "streak": {
    "value": 5,
    "recovery_items": 0
  }
}
```

---

### 9.2 Actualizar Perfil

```http
PUT {{base_url}}/api/users/{{user_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "Juan Carlos",
  "locality": "Corrientes",
  "age": 26
}
```

**Respuesta esperada (200):**
```json
{
  "id_user": 1,
  "name": "Juan Carlos",
  "locality": "Corrientes",
  "age": 26
}
```

---

### 9.3 Eliminar Mi Cuenta

```http
DELETE {{base_url}}/api/users/me
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
{
  "message": "Cuenta eliminada correctamente"
}
```

---

## 10. 🏪 Asociación a Gimnasios

### 10.1 Asociarse a un Gimnasio

```http
POST {{base_url}}/api/user-gym
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "id_user": {{user_id}},
  "id_gym": {{gym_id}}
}
```

**Respuesta esperada (201):**
```json
{
  "id_user_gym": 1,
  "id_user": 1,
  "id_gym": 1,
  "created_at": "2025-10-04T10:00:00.000Z"
}
```

---

### 10.2 Obtener Mis Gimnasios

```http
GET {{base_url}}/api/user-gym/usuario/{{user_id}}
Authorization: Bearer {{access_token}}
```

**Respuesta esperada (200):**
```json
[
  {
    "id_user_gym": 1,
    "id_gym": 1,
    "gym": {
      "name": "PowerGym Centro",
      "city": "Resistencia",
      "address": "Av. Alberdi 1234"
    }
  }
]
```

---

## 📝 Flujo de Testing Completo

### Escenario 1: Usuario Nuevo - Flujo Completo

```
1. Health Check
   GET /health

2. Registro
   POST /api/auth/register

3. Login
   POST /api/auth/login
   → Guarda access_token y refresh_token

4. Ver perfil
   GET /api/users/me

5. Buscar gimnasios cercanos
   GET /api/gyms/cercanos?lat=-27.4514&lon=-58.9867

6. Asociarse a un gimnasio
   POST /api/user-gym

7. Registrar asistencia
   POST /api/assistances/registrar
   → Gana 5 tokens

8. Ver balance de tokens
   GET /api/tokens/usuario/{{user_id}}

9. Crear rutina
   POST /api/routines

10. Completar rutina
    POST /api/user-routines
    → Gana 10 tokens

11. Ver recompensas disponibles
    GET /api/rewards

12. Canjear recompensa
    POST /api/rewards/canjear

13. Ver progreso
    GET /api/progress/usuario/{{user_id}}

14. Logout
    POST /api/auth/logout
```

---

### Escenario 2: Testing de Google OAuth

```
1. Login con Google
   POST /api/auth/google
   Body: { "idToken": "..." }

2. Verificar que se creó el usuario
   GET /api/users/me

3. Intentar login con password (debe fallar)
   POST /api/auth/login
   → Error: "Esta cuenta fue creada con Google"
```

---

### Escenario 3: Testing de Tokens Expirados

```
1. Login
   POST /api/auth/login

2. Esperar 16 minutos (access token expira)

3. Intentar acceder a un endpoint protegido
   GET /api/users/me
   → Error 403: Token expirado

4. Refrescar token
   POST /api/auth/refresh-token
   Body: { "token": "{{refresh_token}}" }

5. Reintentar con nuevo access token
   GET /api/users/me
   → Éxito
```

---

## 🧪 Tests Automatizados en Postman

### Tests Generales (agregar en Collection → Tests)

```javascript
// Verificar que el servidor responde
pm.test("Status code is not 500", function () {
    pm.expect(pm.response.code).to.not.equal(500);
});

// Verificar tiempo de respuesta
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Verificar headers
pm.test("Content-Type is JSON", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

---

### Tests para Endpoints Protegidos

```javascript
// Si no hay token, debe retornar 401
if (!pm.environment.get("access_token")) {
    pm.test("Returns 401 without token", function () {
        pm.expect(pm.response.code).to.equal(401);
    });
}
```

---

### Tests para Formato de Error

```javascript
// Verificar formato de error estándar
if (pm.response.code >= 400) {
    pm.test("Error has standard format", function () {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('error');
        pm.expect(jsonData.error).to.have.property('code');
        pm.expect(jsonData.error).to.have.property('message');
    });
}
```

---

## 📊 Colección JSON de Postman

Para importar en Postman, guarda este JSON en un archivo `gympoint-collection.json`:

```json
{
  "info": {
    "name": "GymPoint API",
    "description": "Colección completa de endpoints de GymPoint",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Checks",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/health",
              "host": ["{{base_url}}"],
              "path": ["health"]
            }
          }
        },
        {
          "name": "Ready Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/ready",
              "host": ["{{base_url}}"],
              "path": ["ready"]
            }
          }
        }
      ]
    },
    {
      "name": "Autenticación",
      "item": [
        {
          "name": "Registro",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const user = pm.response.json();",
                  "    pm.environment.set('user_id', user.id_user);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Juan\",\n  \"lastname\": \"Pérez\",\n  \"email\": \"juan.perez@test.com\",\n  \"password\": \"password123\",\n  \"gender\": \"M\",\n  \"locality\": \"Resistencia\",\n  \"age\": 25,\n  \"subscription\": \"FREE\",\n  \"frequency_goal\": 3\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const jsonData = pm.response.json();",
                  "    pm.environment.set('access_token', jsonData.accessToken);",
                  "    pm.environment.set('refresh_token', jsonData.refreshToken);",
                  "    pm.environment.set('user_id', jsonData.user.id_user);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"juan.perez@test.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        },
        {
          "name": "Login con Google",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const jsonData = pm.response.json();",
                  "    pm.environment.set('access_token', jsonData.accessToken);",
                  "    pm.environment.set('refresh_token', jsonData.refreshToken);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"idToken\": \"YOUR_GOOGLE_ID_TOKEN_HERE\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/google",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "google"]
            }
          }
        },
        {
          "name": "Refresh Token",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const jsonData = pm.response.json();",
                  "    pm.environment.set('access_token', jsonData.accessToken);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"token\": \"{{refresh_token}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/refresh-token",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "refresh-token"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"token\": \"{{refresh_token}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "logout"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 🚀 Importar Colección

1. Abrir Postman
2. Click en **Import**
3. Seleccionar el archivo `gympoint-collection.json`
4. Crear entorno "GymPoint Local" con las variables mencionadas
5. Seleccionar el entorno antes de hacer requests

---

## 📝 Notas Finales

### Autenticación

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer {{access_token}}
```

### Formato de Errores

Todos los errores siguen este formato:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo"
  }
}
```

### Rate Limiting

El servidor tiene rate limiting en endpoints de autenticación:
- 5 intentos cada 15 minutos por IP

---

**Creado por:** Claude AI  
**Fecha:** Octubre 2025  
**Versión:** 1.0.0  
**Para:** GymPoint Backend API Testing

