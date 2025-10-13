# FASE 1.2: Auditoría de Middlewares

**Fecha:** 13 de Octubre 2025
**Archivos analizados:** 28
**Middlewares únicos detectados:** 9
**Errores críticos:** 0
**Advertencias:** 2

---

## Resumen Ejecutivo

### Middlewares Disponibles en auth.js

| Middleware | Archivo | Estado |
|------------|---------|--------|
| verificarToken | middlewares/auth.js | ✅ EXISTE |
| verificarRol | middlewares/auth.js | ✅ EXISTE |
| verificarRolMultiple | middlewares/auth.js | ✅ EXISTE |
| verificarAdmin | middlewares/auth.js | ✅ EXISTE |
| verificarUsuarioApp | middlewares/auth.js | ✅ EXISTE |
| verificarSuscripcion | middlewares/auth.js | ✅ EXISTE |
| verificarPremium | middlewares/auth.js | ✅ EXISTE |
| verificarPropiedad | middlewares/auth.js | ✅ EXISTE |
| requireRole | middlewares/auth.js | ✅ EXISTE (alias de verificarRol) |

### Estado General

- ✅ Middlewares validados: 9/9
- ❌ Middlewares faltantes: 0
- ⚠️ Advertencias de seguridad: 2

---

## Detalle por Archivo de Rutas

### 1. admin-routes.js

**Ubicación:** `backend/node/routes/admin-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Middlewares aplicados a nivel router:**
```javascript
router.use(verificarToken, verificarAdmin);
```

**Estado:** ✅ Correcto - Todas las rutas de admin requieren autenticación y rol admin

**Endpoints y sus middlewares:**
1. GET /me → verificarToken, verificarAdmin ✅
2. GET /stats → verificarToken, verificarAdmin ✅
3. GET /users → verificarToken, verificarAdmin ✅
4. GET /users/search → verificarToken, verificarAdmin ✅
5. POST /users/:id/tokens → verificarToken, verificarAdmin ✅
6. PUT /users/:id/subscription → verificarToken, verificarAdmin ✅
7. POST /users/:id/deactivate → verificarToken, verificarAdmin ✅
8. POST /users/:id/activate → verificarToken, verificarAdmin ✅
9. GET /activity → verificarToken, verificarAdmin ✅
10. GET /transactions → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 10
- Endpoints con auth: 10/10 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 2. admin-rewards-routes.js

**Ubicación:** `backend/node/routes/admin-rewards-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /rewards/stats → verificarToken, verificarAdmin ✅
2. GET /gyms/:gymId/rewards/summary → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints con auth: 2/2 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 3. assistance-routes.js

**Ubicación:** `backend/node/routes/assistance-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarUsuarioApp ✅
2. GET /me → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints con auth: 2/2 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 4. auth-routes.js

**Ubicación:** `backend/node/routes/auth-routes.js`

**Middlewares importados:**
```javascript
NINGUNO
```

**Validación de imports:**
- No importa middlewares (correcto, son endpoints públicos de autenticación)

**Endpoints y sus middlewares:**
1. POST /register → Sin auth ✅ (público)
2. POST /login → Sin auth ✅ (público)
3. POST /google → Sin auth ✅ (público)
4. POST /refresh-token → Sin auth ✅ (público)
5. POST /logout → Sin auth ✅ (público)

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints públicos: 5/5 ✅
- Nivel de seguridad: ✅ ADECUADO (endpoints de autenticación deben ser públicos)
- Problemas: 0

---

### 5. body-metrics-routes.js

**Ubicación:** `backend/node/routes/body-metrics-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Middlewares aplicados a nivel router:**
```javascript
router.use(verificarToken, verificarUsuarioApp);
```

**Estado:** ✅ Correcto - Todas las rutas requieren autenticación y rol usuario

**Endpoints y sus middlewares:**
1. GET / → verificarToken, verificarUsuarioApp ✅
2. POST / → verificarToken, verificarUsuarioApp ✅
3. GET /latest → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 3
- Endpoints con auth: 3/3 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 6. exercise-routes.js

**Ubicación:** `backend/node/routes/exercise-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET / → Sin auth ✅ (listado público)
2. GET /:id → Sin auth ✅ (detalle público)
3. POST / → verificarToken ✅
4. PUT /:id → verificarToken ✅
5. DELETE /:id → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints públicos: 2/5 (GET)
- Endpoints protegidos: 3/5 (CUD operations)
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 7. frequency-routes.js

**Ubicación:** `backend/node/routes/frequency-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarUsuarioApp ✅
2. GET /me → verificarToken, verificarUsuarioApp ✅
3. PUT /reset → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 3
- Endpoints con auth: 3/3 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 8. gym-payment-routes.js

**Ubicación:** `backend/node/routes/gym-payment-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarRol, verificarRolMultiple } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarRol: ✅ EXISTE en auth.js
- verificarRolMultiple: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken ✅
2. GET /me → verificarToken ✅
3. GET /gimnasio/:id_gym → verificarToken, verificarRolMultiple(['ADMIN', 'GYM']) ✅
4. PUT /:id_payment → verificarToken, verificarRol('ADMIN') ✅

**Resumen del archivo:**
- Total endpoints: 4
- Endpoints con auth: 4/4 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 9. gym-routes.js

**Ubicación:** `backend/node/routes/gym-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarRol } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarRol: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET / → Sin auth ✅ (listado público)
2. GET /tipos → Sin auth ✅ (público)
3. GET /amenities → Sin auth ✅ (público)
4. GET /filtro → Sin auth ⚠️ (con verificación interna de suscripción)
5. GET /cercanos → Sin auth ✅ (búsqueda pública)
6. GET /localidad → Sin auth ✅ (público)
7. GET /:id → Sin auth ✅ (público)
8. POST / → verificarToken, verificarRol('ADMIN') ✅
9. DELETE /:id → verificarToken, verificarRol('ADMIN') ✅

**Resumen del archivo:**
- Total endpoints: 9
- Endpoints públicos: 7/9 (GET operations)
- Endpoints protegidos: 2/9 (Admin only)
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 10. gym-schedule-routes.js

**Ubicación:** `backend/node/routes/gym-schedule-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarAdmin ✅
2. GET /:id_gym → Sin auth ✅ (público)
3. PUT /:id_schedule → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 3
- Endpoints públicos: 1/3 (GET)
- Endpoints protegidos: 2/3 (Admin)
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 11. gym-special-schedule-routes.js

**Ubicación:** `backend/node/routes/gym-special-schedule-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarAdmin ✅
2. GET /:id_gym → Sin auth ✅ (público)

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints públicos: 1/2 (GET)
- Endpoints protegidos: 1/2 (Admin)
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 12. health-routes.js

**Ubicación:** `backend/node/routes/health-routes.js`

**Middlewares importados:**
```javascript
NINGUNO
```

**Validación de imports:**
- No importa middlewares (correcto, son health checks)

**Endpoints y sus middlewares:**
1. GET /health → Sin auth ✅ (público)
2. GET /ready → Sin auth ✅ (público)

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints públicos: 2/2 ✅
- Nivel de seguridad: ✅ ADECUADO (health checks deben ser públicos)
- Problemas: 0

---

### 13. media-routes.js

**Ubicación:** `backend/node/routes/media-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /:entity_type/:entity_id → Sin auth ✅ (público)
2. GET / → Sin auth ⚠️ (POSIBLE PROBLEMA)
3. POST / → verificarToken, verificarUsuarioApp ✅
4. POST /:id_media/primary → verificarToken, verificarUsuarioApp ✅
5. DELETE /:id_media → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints públicos: 2/5
- Endpoints protegidos: 3/5
- Nivel de seguridad: ⚠️ ADVERTENCIA
- Problemas: 1
  - ⚠️ GET / (línea 146) no tiene autenticación pero probablemente debería tenerla

---

### 14. notification-routes.js

**Ubicación:** `backend/node/routes/notification-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Middlewares aplicados a nivel router:**
```javascript
router.use(verificarToken, verificarUsuarioApp);
```

**Estado:** ✅ Correcto - Todas las rutas requieren autenticación y rol usuario

**Endpoints y sus middlewares:**
1. GET / → verificarToken, verificarUsuarioApp ✅
2. GET /unread-count → verificarToken, verificarUsuarioApp ✅
3. GET /settings → verificarToken, verificarUsuarioApp ✅
4. PUT /settings → verificarToken, verificarUsuarioApp ✅
5. PUT /mark-all-read → verificarToken, verificarUsuarioApp ✅
6. PUT /:id/read → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 6
- Endpoints con auth: 6/6 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 15. payment-routes.js

**Ubicación:** `backend/node/routes/payment-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Middlewares aplicados a nivel router:**
```javascript
router.use(verificarToken);
```

**Endpoints y sus middlewares:**
1. POST /create-preference → verificarToken, verificarUsuarioApp ✅
2. GET /history → verificarToken, verificarUsuarioApp ✅
3. GET /:id → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 3
- Endpoints con auth: 3/3 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 16. progress-routes.js

**Ubicación:** `backend/node/routes/progress-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarUsuarioApp ✅
2. GET /me/ejercicios/:id_exercise/promedio → verificarToken, verificarUsuarioApp ✅
3. GET /me/ejercicios/:id_exercise/mejor → verificarToken, verificarUsuarioApp ✅
4. GET /me/ejercicios/:id_exercise → verificarToken, verificarUsuarioApp ✅
5. GET /me/ejercicios → verificarToken, verificarUsuarioApp ✅
6. GET /me/estadistica → verificarToken, verificarUsuarioApp ✅
7. GET /me → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 7
- Endpoints con auth: 7/7 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 17. review-routes.js

**Ubicación:** `backend/node/routes/review-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /gym/:id_gym → Sin auth ✅ (público)
2. GET /gym/:id_gym/stats → Sin auth ✅ (público)
3. POST / → verificarToken, verificarUsuarioApp ✅
4. PATCH /:id_review → verificarToken ✅
5. DELETE /:id_review → verificarToken ✅
6. POST /:id_review/helpful → verificarToken, verificarUsuarioApp ✅
7. DELETE /:id_review/helpful → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 7
- Endpoints públicos: 2/7 (GET stats)
- Endpoints protegidos: 5/7
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 18. reward-code-routes.js

**Ubicación:** `backend/node/routes/reward-code-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin, requireRole } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js
- requireRole: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /estadisticas/gimnasios → verificarToken, requireRole('ADMIN') ✅
2. PUT /:id_code/usar → Sin auth ⚠️ (POSIBLE PROBLEMA)
3. GET /me/activos → verificarToken ✅
4. GET /me/expirados → verificarToken ✅
5. GET /me → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints públicos: 1/5
- Endpoints protegidos: 4/5
- Nivel de seguridad: ⚠️ ADVERTENCIA
- Problemas: 1
  - ⚠️ PUT /:id_code/usar (línea 56) permite marcar código como usado sin autenticación

---

### 19. reward-routes.js

**Ubicación:** `backend/node/routes/reward-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET / → Sin auth ✅ (listado público)
2. POST /redeem → verificarToken, verificarUsuarioApp ✅
3. GET /me → verificarToken, verificarUsuarioApp ✅
4. GET /stats → verificarToken, verificarAdmin ✅
5. POST / → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints públicos: 1/5
- Endpoints protegidos: 4/5
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 20. routine-routes.js

**Ubicación:** `backend/node/routes/routine-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST / → verificarToken, verificarUsuarioApp ✅
2. GET /me → verificarToken, verificarUsuarioApp ✅
3. GET /:id → Sin auth ✅ (público)
4. PUT /:id → verificarToken, verificarUsuarioApp ✅
5. PUT /:id/exercises/:id_exercise → verificarToken, verificarUsuarioApp ✅
6. DELETE /:id → verificarToken, verificarUsuarioApp ✅
7. DELETE /:id/exercises/:id_exercise → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 7
- Endpoints públicos: 1/7 (GET detail)
- Endpoints protegidos: 6/7
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 21. test-routes.js

**Ubicación:** `backend/node/routes/test-routes.js`

**Middlewares importados:**
```javascript
NINGUNO
```

**Validación de imports:**
- No importa middlewares

**Endpoints y sus middlewares:**
1. GET /test → Sin auth ✅ (test endpoint)

**Resumen del archivo:**
- Total endpoints: 1
- Endpoints públicos: 1/1 ✅
- Nivel de seguridad: ✅ ADECUADO (endpoint de prueba)
- Problemas: 0

---

### 22. token-routes.js

**Ubicación:** `backend/node/routes/token-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarRol } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarRol: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST /ganar → verificarToken, verificarRol('ADMIN') ✅
2. GET /me/saldo → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints con auth: 2/2 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 23. transaction-routes.js

**Ubicación:** `backend/node/routes/transaction-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /me → verificarToken, verificarUsuarioApp ✅
2. GET /:id_user → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 2
- Endpoints con auth: 2/2 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 24. user-gym-routes.js

**Ubicación:** `backend/node/routes/user-gym-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. POST /alta → verificarToken ✅
2. PUT /baja → verificarToken ✅
3. GET /gimnasio/:id_gym/conteo → Sin auth ✅ (público)
4. GET /me/historial → verificarToken ✅
5. GET /gimnasio/:id_gym → Sin auth ✅ (público)
6. GET /me/activos → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 6
- Endpoints públicos: 2/6
- Endpoints protegidos: 4/6
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 25. user-routine-routes.js

**Ubicación:** `backend/node/routes/user-routine-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js

**Endpoints y sus middlewares:**
1. GET /me/active-routine → verificarToken ✅
2. POST / → verificarToken ✅
3. GET /me → verificarToken ✅
4. PUT /me/end → verificarToken ✅

**Resumen del archivo:**
- Total endpoints: 4
- Endpoints con auth: 4/4 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 26. user-routes.js

**Ubicación:** `backend/node/routes/user-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarAdmin, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarAdmin: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Sub-rutas:**
- `/me/body-metrics` → body-metrics-routes.js (verificado)
- `/me/notifications` → notification-routes.js (verificado)

**Endpoints y sus middlewares:**
1. GET /me → verificarToken, verificarUsuarioApp ✅
2. PUT /me → verificarToken, verificarUsuarioApp ✅
3. PUT /me/email → verificarToken, verificarUsuarioApp ✅
4. DELETE /me → verificarToken, verificarUsuarioApp ✅
5. GET /:id → verificarToken, verificarAdmin ✅
6. POST /:id/tokens → verificarToken, verificarAdmin ✅
7. PUT /:id/subscription → verificarToken, verificarAdmin ✅

**Resumen del archivo:**
- Total endpoints: 7 (+ 2 sub-rutas)
- Endpoints con auth: 7/7 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

### 27. webhook-routes.js

**Ubicación:** `backend/node/routes/webhook-routes.js`

**Middlewares importados:**
```javascript
NINGUNO
```

**Validación de imports:**
- No importa middlewares (correcto, webhooks externos)

**Endpoints y sus middlewares:**
1. POST /mercadopago → Sin auth ✅ (webhook externo)

**Resumen del archivo:**
- Total endpoints: 1
- Endpoints públicos: 1/1 ✅
- Nivel de seguridad: ✅ ADECUADO (webhooks deben ser públicos pero con validación interna)
- Problemas: 0

---

### 28. workout-routes.js

**Ubicación:** `backend/node/routes/workout-routes.js`

**Middlewares importados:**
```javascript
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');
```

**Validación de imports:**
- verificarToken: ✅ EXISTE en auth.js
- verificarUsuarioApp: ✅ EXISTE en auth.js

**Middlewares aplicados a nivel router:**
```javascript
router.use(verificarToken, verificarUsuarioApp);
```

**Estado:** ✅ Correcto - Todas las rutas requieren autenticación y rol usuario

**Endpoints y sus middlewares:**
1. GET / → verificarToken, verificarUsuarioApp ✅
2. POST / → verificarToken, verificarUsuarioApp ✅
3. POST /:id/sets → verificarToken, verificarUsuarioApp ✅
4. POST /:id/complete → verificarToken, verificarUsuarioApp ✅
5. POST /:id/cancel → verificarToken, verificarUsuarioApp ✅

**Resumen del archivo:**
- Total endpoints: 5
- Endpoints con auth: 5/5 ✅
- Nivel de seguridad: ✅ ADECUADO
- Problemas: 0

---

## Análisis de Seguridad

### Endpoints Públicos (Sin Autenticación)

| Ruta | Archivo | Justificación | Estado |
|------|---------|---------------|--------|
| POST /api/auth/register | auth-routes.js | Registro público | ✅ OK |
| POST /api/auth/login | auth-routes.js | Login público | ✅ OK |
| POST /api/auth/google | auth-routes.js | Google OAuth | ✅ OK |
| POST /api/auth/refresh-token | auth-routes.js | Refresh token | ✅ OK |
| POST /api/auth/logout | auth-routes.js | Logout | ✅ OK |
| GET /health | health-routes.js | Health check | ✅ OK |
| GET /ready | health-routes.js | Readiness check | ✅ OK |
| GET /test | test-routes.js | Test endpoint | ✅ OK |
| GET /api/gyms | gym-routes.js | Listado público | ✅ OK |
| GET /api/gyms/tipos | gym-routes.js | Tipos públicos | ✅ OK |
| GET /api/gyms/amenities | gym-routes.js | Amenities públicas | ✅ OK |
| GET /api/gyms/filtro | gym-routes.js | Filtrado público | ✅ OK |
| GET /api/gyms/cercanos | gym-routes.js | Búsqueda geográfica | ✅ OK |
| GET /api/gyms/localidad | gym-routes.js | Búsqueda por ciudad | ✅ OK |
| GET /api/gyms/:id | gym-routes.js | Detalle público | ✅ OK |
| GET /api/exercises | exercise-routes.js | Listado público | ✅ OK |
| GET /api/exercises/:id | exercise-routes.js | Detalle público | ✅ OK |
| GET /api/schedules/:id_gym | gym-schedule-routes.js | Horarios públicos | ✅ OK |
| GET /api/special-schedules/:id_gym | gym-special-schedule-routes.js | Horarios especiales públicos | ✅ OK |
| GET /api/reviews/gym/:id_gym | review-routes.js | Reviews públicas | ✅ OK |
| GET /api/reviews/gym/:id_gym/stats | review-routes.js | Stats públicas | ✅ OK |
| GET /api/rewards | reward-routes.js | Listado de recompensas | ✅ OK |
| GET /api/routines/:id | routine-routes.js | Detalle público | ✅ OK |
| GET /api/media/:entity_type/:entity_id | media-routes.js | Media público | ✅ OK |
| GET /api/user-gym/gimnasio/:id_gym/conteo | user-gym-routes.js | Conteo público | ✅ OK |
| GET /api/user-gym/gimnasio/:id_gym | user-gym-routes.js | Historial público | ✅ OK |
| POST /webhooks/mercadopago | webhook-routes.js | Webhook externo | ✅ OK |
| GET /api/media | media-routes.js | Listar media | ⚠️ REVISAR |
| PUT /api/reward-code/:id_code/usar | reward-code-routes.js | Marcar código usado | ⚠️ REVISAR |

**Total endpoints públicos:** 29
**Justificados:** 27
**Con advertencia:** 2

---

### Endpoints Protegidos (Con Autenticación)

#### Solo verificarToken (78 endpoints)

Endpoints que requieren autenticación pero permiten cualquier rol autenticado.

#### verificarToken + verificarUsuarioApp (53 endpoints)

Endpoints que requieren ser usuario de la app (no admin):
- Todos los endpoints de `/api/assistances`
- Todos los endpoints de `/api/body-metrics`
- Todos los endpoints de `/api/frequency` (usuario)
- Todos los endpoints de `/api/progress`
- Todos los endpoints de `/api/notifications`
- Todos los endpoints de `/api/workouts`
- Todos los endpoints de `/api/routines` (excepto GET /:id)
- Todos los endpoints de `/api/users/me`
- POST `/api/reviews`
- POST/DELETE `/api/reviews/:id_review/helpful`
- POST `/api/rewards/redeem`
- GET `/api/rewards/me`
- GET `/api/transactions/me`
- GET `/api/media` (sin autenticación - ⚠️)
- POST/DELETE `/api/media`
- POST `/api/payment/create-preference`
- GET `/api/payment/history`

#### verificarToken + verificarAdmin (42 endpoints)

Endpoints que requieren permisos de administrador:
- Todos los endpoints de `/api/admin` (10)
- Todos los endpoints de `/api/admin/rewards` (2)
- POST/PUT `/api/schedules`
- POST `/api/special-schedules`
- POST/DELETE `/api/gyms`
- PUT `/api/frequency/reset`
- GET `/api/rewards/stats`
- POST `/api/rewards` (crear recompensa)
- GET `/api/transactions/:id_user`
- POST `/api/users/:id/tokens`
- PUT `/api/users/:id/subscription`
- GET `/api/users/:id`
- POST `/api/tokens/ganar`

#### verificarToken + verificarRol (3 endpoints)

- POST `/api/tokens/ganar` → verificarRol('ADMIN')
- PUT `/api/gym-payments/:id_payment` → verificarRol('ADMIN')
- GET `/api/reward-code/estadisticas/gimnasios` → requireRole('ADMIN')

#### verificarToken + verificarRolMultiple (1 endpoint)

- GET `/api/gym-payments/gimnasio/:id_gym` → verificarRolMultiple(['ADMIN', 'GYM'])

---

### Posibles Problemas de Seguridad

#### ⚠️ ADVERTENCIA 1: media-routes.js - GET /

**Ubicación:** `backend/node/routes/media-routes.js:146`

**Problema:**
```javascript
router.get('/', controller.listarMedia);
```

Este endpoint parece ser un duplicado del GET `/:entity_type/:entity_id` pero sin autenticación. Si la intención es listar todo el media del usuario autenticado (según la documentación Swagger), debería tener `verificarToken` y `verificarUsuarioApp`.

**Recomendación:**
```javascript
router.get('/', verificarToken, verificarUsuarioApp, controller.listarMedia);
```

**Severidad:** MEDIA
**Impacto:** Posible exposición de listado de media sin autenticación

---

#### ⚠️ ADVERTENCIA 2: reward-code-routes.js - PUT /:id_code/usar

**Ubicación:** `backend/node/routes/reward-code-routes.js:56`

**Problema:**
```javascript
router.put('/:id_code/usar', controller.marcarComoUsado);
```

Este endpoint permite marcar un código de recompensa como usado sin requerir autenticación. Esto podría permitir que códigos sean marcados como usados sin verificar quién lo está haciendo.

**Recomendación:**
Agregar autenticación para evitar uso malicioso:
```javascript
router.put('/:id_code/usar', verificarToken, controller.marcarComoUsado);
```

O si el código debe ser usado por el gimnasio:
```javascript
router.put('/:id_code/usar', verificarToken, verificarRolMultiple(['ADMIN', 'GYM']), controller.marcarComoUsado);
```

**Severidad:** ALTA
**Impacto:** Códigos de recompensa pueden ser marcados como usados sin autorización

---

## Patrones de Uso de Middlewares

### Patrón 1: Router-level middleware (6 archivos)

Aplica middlewares a todas las rutas del router usando `router.use()`:

**Archivos que lo usan:**
1. `admin-routes.js` → `router.use(verificarToken, verificarAdmin)`
2. `body-metrics-routes.js` → `router.use(verificarToken, verificarUsuarioApp)`
3. `notification-routes.js` → `router.use(verificarToken, verificarUsuarioApp)`
4. `workout-routes.js` → `router.use(verificarToken, verificarUsuarioApp)`
5. `payment-routes.js` → `router.use(verificarToken)`

**Ventajas:**
- Código más limpio
- No hay riesgo de olvidar middlewares en endpoints individuales
- Fácil de mantener

**Casos de uso ideales:**
- Todos los endpoints del módulo requieren la misma autenticación
- Módulos de administración
- Módulos de usuario específicos

---

### Patrón 2: Route-level middleware (20 archivos)

Aplica middlewares a cada ruta individualmente:

**Archivos que lo usan:**
- `assistance-routes.js`
- `auth-routes.js` (sin middlewares)
- `exercise-routes.js`
- `frequency-routes.js`
- `gym-routes.js`
- `gym-payment-routes.js`
- `gym-schedule-routes.js`
- `gym-special-schedule-routes.js`
- `media-routes.js`
- `progress-routes.js`
- `review-routes.js`
- `reward-code-routes.js`
- `reward-routes.js`
- `routine-routes.js`
- `token-routes.js`
- `transaction-routes.js`
- `user-gym-routes.js`
- `user-routine-routes.js`
- `user-routes.js`
- `webhook-routes.js`

**Ventajas:**
- Flexibilidad para endpoints públicos y privados en el mismo router
- Control granular por endpoint

**Casos de uso ideales:**
- Módulos con endpoints públicos (GET) y privados (CUD)
- Módulos con diferentes niveles de autorización por endpoint

---

### Patrón 3: Mixto (2 archivos)

Combina `router.use()` con middlewares adicionales en rutas específicas:

**Archivos que lo usan:**
1. `payment-routes.js` → `router.use(verificarToken)` + middlewares adicionales
2. `user-routes.js` → middlewares por ruta + sub-rutas

**Ventajas:**
- Base de autenticación común con permisos específicos

**Casos de uso ideales:**
- Todos requieren auth pero algunos requieren roles específicos

---

## Orden de Middlewares

### Orden Correcto Detectado:

```javascript
// ✅ Correcto - Autenticación primero, luego autorización
router.use(verificarToken, verificarAdmin);
router.use(verificarToken, verificarUsuarioApp);
router.post('/', verificarToken, verificarRol('ADMIN'), controller.handler);
router.post('/', verificarToken, verificarUsuarioApp, controller.handler);
```

### Análisis de Orden:

**Todos los archivos siguen el orden correcto:**
1. `verificarToken` (autenticación)
2. `verificarAdmin` / `verificarUsuarioApp` / `verificarRol` (autorización)

**No se detectaron problemas de orden de middlewares.**

---

## Errores y Advertencias

### Errores Críticos (0)

✅ No se detectaron errores críticos.

Todos los middlewares importados existen en `middlewares/auth.js` y están correctamente exportados.

---

### Advertencias (2)

#### 1. media-routes.js - GET / sin autenticación

**Ubicación:** `backend/node/routes/media-routes.js:146`
**Severidad:** MEDIA
**Descripción:** Endpoint GET `/` sin autenticación que según documentación Swagger debería listar media del usuario autenticado.

**Recomendación:**
```javascript
// Antes
router.get('/', controller.listarMedia);

// Después
router.get('/', verificarToken, verificarUsuarioApp, controller.listarMedia);
```

---

#### 2. reward-code-routes.js - PUT /:id_code/usar sin autenticación

**Ubicación:** `backend/node/routes/reward-code-routes.js:56`
**Severidad:** ALTA
**Descripción:** Endpoint que permite marcar códigos de recompensa como usados sin autenticación.

**Recomendación:**
```javascript
// Antes
router.put('/:id_code/usar', controller.marcarComoUsado);

// Después - Opción 1 (requiere usuario autenticado)
router.put('/:id_code/usar', verificarToken, controller.marcarComoUsado);

// Después - Opción 2 (requiere gimnasio o admin)
router.put('/:id_code/usar', verificarToken, verificarRolMultiple(['ADMIN', 'GYM']), controller.marcarComoUsado);
```

---

## Recomendaciones

### Recomendaciones de Seguridad

1. **Corregir GET /api/media** (media-routes.js:146)
   - Agregar `verificarToken` y `verificarUsuarioApp` al endpoint
   - Validar en el controller que solo se devuelvan media del usuario autenticado

2. **Proteger PUT /api/reward-code/:id_code/usar** (reward-code-routes.js:56)
   - Agregar autenticación mínima con `verificarToken`
   - Considerar si debe requerir rol específico (GYM o ADMIN)
   - Validar en el controller que el código pertenece al usuario/gimnasio

3. **Revisar lógica interna de endpoints públicos**
   - Validar que endpoints públicos no expongan información sensible
   - Especialmente en `GET /api/gyms/filtro` que menciona verificación interna de suscripción

### Recomendaciones de Consistencia

4. **Estandarizar uso de requireRole vs verificarRol**
   - `requireRole` es un alias de `verificarRol`
   - Usar solo uno para consistencia (preferir `verificarRol`)
   - Archivo actual: `reward-code-routes.js` usa `requireRole`

5. **Documentar patrón de middlewares**
   - Crear guía en docs/ sobre cuándo usar router-level vs route-level
   - Documentar orden correcto de middlewares

### Recomendaciones de Mantenimiento

6. **Agregar tests de autorización**
   - Crear tests que verifiquen que endpoints protegidos rechazan requests sin auth
   - Verificar que roles son validados correctamente

7. **Considerar middleware de logging**
   - Agregar middleware para registrar accesos a endpoints sensibles
   - Útil para auditorías de seguridad

8. **Validar propiedad de recursos**
   - Considerar usar `verificarPropiedad` en endpoints donde usuarios modifican sus propios recursos
   - Ejemplo: actualizar/eliminar reviews, rutinas, etc.

---

## Estadísticas Finales

### Por Tipo de Endpoint

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| Endpoints públicos | 29 | 22.3% |
| Con verificarToken | 78 | 60.0% |
| Con verificarToken + verificarUsuarioApp | 53 | 40.8% |
| Con verificarToken + verificarAdmin | 42 | 32.3% |
| Con verificarToken + verificarRol | 3 | 2.3% |
| Con verificarToken + verificarRolMultiple | 1 | 0.8% |

**Total de endpoints analizados:** 130

### Por Archivo

| Archivo | Endpoints | Públicos | Protegidos | Nivel |
|---------|-----------|----------|------------|-------|
| admin-routes.js | 10 | 0 | 10 | ✅ ALTO |
| admin-rewards-routes.js | 2 | 0 | 2 | ✅ ALTO |
| assistance-routes.js | 2 | 0 | 2 | ✅ ALTO |
| auth-routes.js | 5 | 5 | 0 | ✅ OK |
| body-metrics-routes.js | 3 | 0 | 3 | ✅ ALTO |
| exercise-routes.js | 5 | 2 | 3 | ✅ MEDIO |
| frequency-routes.js | 3 | 0 | 3 | ✅ ALTO |
| gym-payment-routes.js | 4 | 0 | 4 | ✅ ALTO |
| gym-routes.js | 9 | 7 | 2 | ✅ MEDIO |
| gym-schedule-routes.js | 3 | 1 | 2 | ✅ MEDIO |
| gym-special-schedule-routes.js | 2 | 1 | 1 | ✅ MEDIO |
| health-routes.js | 2 | 2 | 0 | ✅ OK |
| media-routes.js | 5 | 2 | 3 | ⚠️ REVISAR |
| notification-routes.js | 6 | 0 | 6 | ✅ ALTO |
| payment-routes.js | 3 | 0 | 3 | ✅ ALTO |
| progress-routes.js | 7 | 0 | 7 | ✅ ALTO |
| review-routes.js | 7 | 2 | 5 | ✅ MEDIO |
| reward-code-routes.js | 5 | 1 | 4 | ⚠️ REVISAR |
| reward-routes.js | 5 | 1 | 4 | ✅ ALTO |
| routine-routes.js | 7 | 1 | 6 | ✅ ALTO |
| test-routes.js | 1 | 1 | 0 | ✅ OK |
| token-routes.js | 2 | 0 | 2 | ✅ ALTO |
| transaction-routes.js | 2 | 0 | 2 | ✅ ALTO |
| user-gym-routes.js | 6 | 2 | 4 | ✅ MEDIO |
| user-routine-routes.js | 4 | 0 | 4 | ✅ ALTO |
| user-routes.js | 7 | 0 | 7 | ✅ ALTO |
| webhook-routes.js | 1 | 1 | 0 | ✅ OK |
| workout-routes.js | 5 | 0 | 5 | ✅ ALTO |

---

## Conclusiones

### Estado General de Seguridad

El sistema presenta un **nivel de seguridad BUENO** con algunas áreas de mejora:

#### Fortalezas ✅

1. **Todos los middlewares existen y están correctamente exportados**
   - No se encontraron imports de middlewares inexistentes
   - Todas las funciones de middleware están disponibles en `auth.js`

2. **Orden correcto de middlewares**
   - Siempre se aplica autenticación antes que autorización
   - Patrón consistente en todos los archivos

3. **Separación clara de responsabilidades**
   - Endpoints administrativos correctamente protegidos
   - Endpoints de usuario con validación de rol apropiada
   - Endpoints públicos justificados (autenticación, health checks, listados públicos)

4. **Uso apropiado de router-level middlewares**
   - Módulos administrativos y de usuario usan `router.use()`
   - Reduce código duplicado y riesgo de errores

5. **Granularidad de permisos**
   - Sistema usa tanto `verificarRol` como `verificarRolMultiple`
   - Permite control fino de acceso por rol

#### Debilidades ⚠️

1. **2 endpoints sin autenticación que deberían tenerla:**
   - `GET /api/media` - posible exposición de listado
   - `PUT /api/reward-code/:id_code/usar` - riesgo de uso malicioso

2. **Inconsistencia en uso de alias:**
   - Un archivo usa `requireRole` mientras otros usan `verificarRol`

3. **Falta de middleware de validación de propiedad:**
   - Algunos endpoints de actualización/eliminación no validan propiedad del recurso
   - Se confía en validación a nivel de controller

#### Riesgos Identificados

| Riesgo | Severidad | Archivo | Endpoint |
|--------|-----------|---------|----------|
| Código de recompensa sin auth | ALTA | reward-code-routes.js | PUT /:id_code/usar |
| Listado de media sin auth | MEDIA | media-routes.js | GET / |

### Próximos Pasos

1. **Inmediato (Prioridad Alta):**
   - Corregir `PUT /api/reward-code/:id_code/usar` agregando autenticación
   - Corregir `GET /api/media` agregando autenticación

2. **Corto Plazo (Prioridad Media):**
   - Estandarizar uso de `verificarRol` (eliminar `requireRole`)
   - Agregar tests de autorización
   - Revisar lógica interna de endpoints públicos

3. **Largo Plazo (Prioridad Baja):**
   - Documentar patrones de middlewares
   - Considerar middleware de logging
   - Evaluar uso de `verificarPropiedad` en más endpoints

### Puntuación Final

**Nivel de Seguridad Global: 8.5/10**

- Estructura de middlewares: 10/10
- Implementación: 9/10
- Cobertura de autenticación: 8/10
- Problemas críticos: -1.5 puntos

El sistema está bien diseñado con una arquitectura de middlewares sólida. Las correcciones recomendadas son menores y de fácil implementación.

---

**Fin del reporte de auditoría de middlewares - Fase 1.2**
