# Ejemplos de Endpoints de Admin

## Autenticación

Todos los endpoints de admin requieren un token JWT de un usuario con rol `ADMIN`.

```bash
# Login como admin
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gympoint.com",
  "password": "AdminGPMitre280!"
}

# Respuesta:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

Usar el `accessToken` en el header `Authorization: Bearer <token>` para todos los endpoints siguientes.

## Otorgar Tokens a Usuario

### POST /api/admin/users/:id/tokens

Otorga o quita tokens a un usuario específico.

**Parámetros:**
- `:id` - ID del user_profile (en la URL)

**Body:**
```json
{
  "delta": 50,
  "reason": "Bonus por participación en evento"
}
```

**Campos:**
- `delta` (number, requerido): Cantidad de tokens a otorgar (positivo) o quitar (negativo)
- `reason` (string, opcional): Razón del ajuste. Si no se proporciona, usa "Admin: <email_del_admin>"

**Ejemplo - Otorgar tokens:**
```bash
POST http://localhost:3000/api/admin/users/5/tokens
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "delta": 100,
  "reason": "Compensación por error del sistema"
}
```

**Respuesta exitosa (200):**
```json
{
  "id_user_profile": 5,
  "new_balance": 250,
  "delta": 100,
  "reason": "Compensación por error del sistema"
}
```

**Ejemplo - Quitar tokens:**
```bash
POST http://localhost:3000/api/admin/users/5/tokens
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "delta": -50,
  "reason": "Penalización por uso indebido"
}
```

**Respuesta exitosa (200):**
```json
{
  "id_user_profile": 5,
  "new_balance": 200,
  "delta": -50,
  "reason": "Penalización por uso indebido"
}
```

**Errores:**

**400 - Delta requerido:**
```json
{
  "error": {
    "code": "MISSING_DELTA",
    "message": "Delta es requerido"
  }
}
```

**400 - Saldo insuficiente:**
```json
{
  "error": {
    "code": "TOKEN_GRANT_FAILED",
    "message": "Saldo insuficiente. Balance actual: 150 tokens, intentando gastar: 200 tokens"
  }
}
```

**404 - Usuario no encontrado:**
```json
{
  "error": {
    "code": "TOKEN_GRANT_FAILED",
    "message": "Usuario no encontrado"
  }
}
```

## Actualizar Suscripción

### PUT /api/admin/users/:id/subscription

Cambia el tipo de suscripción de un usuario.

**Body:**
```json
{
  "subscription": "PREMIUM"
}
```

**Valores válidos:** `FREE`, `PREMIUM`

**Ejemplo:**
```bash
PUT http://localhost:3000/api/admin/users/5/subscription
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "subscription": "PREMIUM"
}
```

**Respuesta (200):**
```json
{
  "id_user_profile": 5,
  "subscription": "PREMIUM"
}
```

## Desactivar/Activar Usuario

### POST /api/admin/users/:id/deactivate

Desactiva la cuenta de un usuario y revoca sus tokens de sesión.

```bash
POST http://localhost:3000/api/admin/users/5/deactivate
Authorization: Bearer eyJhbGc...
```

**Respuesta (200):**
```json
{
  "message": "Usuario desactivado correctamente",
  "id_account": 5
}
```

### POST /api/admin/users/:id/activate

Reactiva una cuenta desactivada.

```bash
POST http://localhost:3000/api/admin/users/5/activate
Authorization: Bearer eyJhbGc...
```

**Respuesta (200):**
```json
{
  "message": "Usuario activado correctamente",
  "id_account": 5
}
```

## Estadísticas del Sistema

### GET /api/admin/stats

Obtiene estadísticas generales del sistema.

```bash
GET http://localhost:3000/api/admin/stats
Authorization: Bearer eyJhbGc...
```

**Respuesta (200):**
```json
{
  "users": {
    "total": 1250,
    "active": 1100,
    "inactive": 150,
    "by_subscription": {
      "FREE": 800,
      "PREMIUM": 450
    }
  },
  "tokens": {
    "total_in_circulation": 125000,
    "average_per_user": 100
  },
  "gyms": {
    "total": 45,
    "active": 42
  }
}
```

## Listar Usuarios

### GET /api/admin/users

Lista todos los usuarios con opciones de filtrado y paginación.

**Query params:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Items por página (default: 50)
- `subscription` (string): Filtrar por tipo (FREE, PREMIUM)
- `search` (string): Búsqueda por email o nombre
- `sortBy` (string): Campo para ordenar
- `order` (string): ASC o DESC

**Ejemplo:**
```bash
GET http://localhost:3000/api/admin/users?page=1&limit=20&subscription=PREMIUM&search=juan
Authorization: Bearer eyJhbGc...
```

## Buscar Usuario por Email

### GET /api/admin/users/search

Busca un usuario específico por email.

```bash
GET http://localhost:3000/api/admin/users/search?email=user@example.com
Authorization: Bearer eyJhbGc...
```

## Actividad Reciente

### GET /api/admin/activity

Obtiene actividad reciente del sistema.

```bash
GET http://localhost:3000/api/admin/activity?days=7
Authorization: Bearer eyJhbGc...
```

## Transacciones de Tokens

### GET /api/admin/transactions

Obtiene log de transacciones de tokens.

**Query params:**
- `user_id` (number): Filtrar por usuario
- `limit` (number): Items por página
- `page` (number): Número de página

```bash
GET http://localhost:3000/api/admin/transactions?user_id=5&limit=50&page=1
Authorization: Bearer eyJhbGc...
```

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT de admin
2. **Rate Limiting**: Implementar rate limiting en producción
3. **Logs**: Todas las acciones de admin se registran en token_ledger
4. **Permisos**: Solo usuarios con rol ADMIN pueden acceder
5. **Validación**: Los endpoints validan los datos de entrada
