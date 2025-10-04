# 🔄 Fase 7: Actualización de Routes y OpenAPI - EN PROGRESO

**Fecha:** 2025-10-04  
**Estado:** 🔄 **PARCIAL (2/6 completadas)**

---

## 📋 Objetivo

Actualizar routes para usar los nuevos middlewares (`verificarUsuarioApp`, `verificarAdmin`) y actualizar la documentación OpenAPI para reflejar:
- Nuevos formatos de respuesta `{ message, data }`
- Códigos de error semánticos `{ error: { code, message } }`
- **id_user ya NO se recibe en body** para endpoints autenticados
- Middlewares correctos

---

## ✅ Routes Completadas (2/6)

### 1. ✅ **assistance-routes.js**

**Cambios implementados:**
- `POST /api/assistances/registrar` → `POST /api/assistances`
- **Ya NO requiere `id_user` en body** (se obtiene del token)
- Agregado middleware `verificarUsuarioApp`
- OpenAPI actualizado:
  - Formato de respuesta: `{ message, data: { asistencia, distancia, tokens_actuales, racha_actual } }`
  - Formato de error: `{ error: { code: 'ASSISTANCE_REGISTRATION_FAILED', message } }`
  - Descripción detallada de variables de entorno (`PROXIMITY_M`, `TOKENS_ATTENDANCE`)
  - Ejemplos completos

**Endpoints:**
```javascript
router.post('/', verificarToken, verificarUsuarioApp, controller.registrarAsistencia);
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerHistorialAsistencias);
```

---

### 2. ✅ **transaction-routes.js**

**Cambios implementados:**
- Reemplazado `verificarRol('ADMIN')` por `verificarAdmin`
- Agregado `verificarUsuarioApp` para endpoint `/me`
- OpenAPI actualizado:
  - Formato de respuesta: `{ message, data: [transacciones] }`
  - Includes: `reward` y `userProfile`
  - Descripciones y ejemplos completos

**Endpoints:**
```javascript
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerTransaccionesAutenticado);
router.get('/:id_user', verificarToken, verificarAdmin, controller.obtenerTransaccionesPorUsuario);
```

---

## ⏳ Routes Pendientes (4/6)

### 3. ⏳ **progress-routes.js**

**Cambios necesarios:**
- Agregar `verificarUsuarioApp` en todos los endpoints
- Actualizar OpenAPI para formato `{ message, data }`
- Remover `id_user` de ejemplos (ya no va en body)
- Agregar códigos de error

**Endpoints a actualizar:**
```javascript
router.post('/', verificarToken, verificarUsuarioApp, controller.registrarProgreso);
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerProgresoPorUsuario);
router.get('/me/estadistica', verificarToken, verificarUsuarioApp, controller.obtenerEstadisticaPeso);
router.get('/me/ejercicios', verificarToken, verificarUsuarioApp, controller.obtenerHistorialEjercicios);
router.get('/me/ejercicios/:id_exercise', verificarToken, verificarUsuarioApp, controller.obtenerHistorialPorEjercicio);
router.get('/me/ejercicios/:id_exercise/mejor', verificarToken, verificarUsuarioApp, controller.obtenerMejorLevantamiento);
router.get('/me/ejercicios/:id_exercise/promedio', verificarToken, verificarUsuarioApp, controller.obtenerPromedioLevantamiento);
```

---

### 4. ⏳ **reward-routes.js**

**Cambios necesarios:**
- Agregar `verificarUsuarioApp` donde corresponda
- Agregar `verificarAdmin` para endpoints de admin
- Actualizar OpenAPI para formato `{ message, data }`
- Actualizar respuesta de canje: `{ claimed, codigo, nuevo_saldo }`

**Endpoints esperados:**
```javascript
router.get('/', controller.listarRecompensas); // Public
router.post('/redeem', verificarToken, verificarUsuarioApp, controller.canjearRecompensa);
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerHistorialRecompensas);
router.get('/stats', verificarToken, verificarAdmin, controller.obtenerEstadisticasDeRecompensas);
router.post('/', verificarToken, verificarAdmin, controller.crearRecompensa);
```

---

### 5. ⏳ **routine-routes.js**

**Cambios necesarios:**
- Agregar `verificarUsuarioApp` donde corresponda
- Actualizar OpenAPI para formato `{ message, data }`
- **Importante**: Documentar validación de mínimo 3 ejercicios
- Remover `id_user` de body en `createRoutineWithExercises`

**Endpoints esperados:**
```javascript
router.get('/:id', controller.getRoutineWithExercises); // Public
router.post('/', verificarToken, verificarUsuarioApp, controller.createRoutineWithExercises);
router.put('/:id', verificarToken, verificarUsuarioApp, controller.updateRoutine);
router.delete('/:id', verificarToken, verificarUsuarioApp, controller.deleteRoutine);
router.get('/me', verificarToken, verificarUsuarioApp, controller.getRoutinesByUser);
// ... otros endpoints
```

---

### 6. ⏳ **frequency-routes.js**

**Cambios necesarios:**
- Crear o actualizar routes para frequency
- Agregar `verificarUsuarioApp`
- OpenAPI completo

**Endpoints esperados:**
```javascript
router.post('/me', verificarToken, verificarUsuarioApp, controller.crearMetaSemanal);
router.get('/me', verificarToken, verificarUsuarioApp, controller.consultarMetaSemanal);
// ... otros endpoints si aplican
```

---

## 📊 Patrón de Cambios

### 1. **Middlewares**

```javascript
// ANTES
const { verificarToken } = require('../middlewares/auth');
router.post('/endpoint', verificarToken, controller.metodo);

// DESPUÉS
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

// Para usuarios de la app:
router.post('/endpoint', verificarToken, verificarUsuarioApp, controller.metodo);

// Para admins:
router.post('/endpoint', verificarToken, verificarAdmin, controller.metodo);

// Para públicos:
router.get('/endpoint', controller.metodo); // Sin middleware
```

### 2. **OpenAPI - Formato de Respuesta Exitosa**

```yaml
responses:
  200:
    description: Descripción del éxito
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
              example: Operación exitosa
            data:
              type: object  # o array según corresponda
              properties:
                # ... propiedades del data
```

### 3. **OpenAPI - Formato de Error**

```yaml
400:
  description: Error en la solicitud
  content:
    application/json:
      schema:
        type: object
        properties:
          error:
            type: object
            properties:
              code:
                type: string
                example: ERROR_CODE
              message:
                type: string
                example: Descripción del error
```

### 4. **OpenAPI - Remover id_user de Request Body**

```yaml
# ANTES
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - id_user  # ❌ ELIMINAR
          - otros_campos
        properties:
          id_user:    # ❌ ELIMINAR COMPLETAMENTE
            type: integer
          otros_campos:
            type: string

# DESPUÉS
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - otros_campos  # ✅ Solo otros campos
        properties:
          otros_campos:
            type: string
```

---

## 🎯 Checklist por Route

| Route | Middleware | OpenAPI Request | OpenAPI Response | OpenAPI Error | Commit |
|-------|-----------|-----------------|------------------|---------------|---------|
| assistance-routes | ✅ | ✅ | ✅ | ✅ | ✅ |
| transaction-routes | ✅ | ✅ | ✅ | ✅ | ✅ |
| progress-routes | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| reward-routes | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| routine-routes | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| frequency-routes | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

---

## 📈 Progreso

```
██████████████░░░░░░░░░░░░░░░░░░░░  33% completado (2/6)
```

**Progreso total del proyecto: 68%** (24.5h / 36h estimadas)

---

## 🔄 Próximos Pasos

1. **Completar routes pendientes** (progress, reward, routine, frequency)
2. **Validar Swagger UI** en `http://localhost:3000/api-docs`
3. **Tests de integración** con Postman usando nueva documentación
4. **Fase 8**: Tests unitarios y de integración
5. **Fase 9**: Limpieza de archivos legacy

---

## 📦 Commits de Fase 7

1. **74fafbe** - `feat: actualizar assistance y transaction routes`
   - assistance-routes: POST /assistances (sin id_user en body)
   - transaction-routes: verificarAdmin en lugar de verificarRol
   - OpenAPI completo con nuevos formatos

---

## 💡 Notas Importantes

- **Todos los endpoints autenticados** deben usar `verificarToken` + (`verificarUsuarioApp` o `verificarAdmin`)
- **id_user ya NO va en el body** de ningún endpoint autenticado
- **Formato de respuesta estandarizado**: `{ message, data }`
- **Formato de error estandarizado**: `{ error: { code, message } }`
- **Validaciones en OpenAPI** deben reflejar las validaciones del controller (ej: min 3 ejercicios)

---

**Fase 7 en progreso - 2/6 routes completadas! 🚀**

