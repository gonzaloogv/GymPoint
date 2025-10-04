# 🚀 Inicio Rápido - Testing con Postman

## ⚡ Importar Colección en 3 Pasos

### 1️⃣ Importar la Colección

1. Abrir **Postman**
2. Click en **Import** (esquina superior izquierda)
3. Arrastrar el archivo `GymPoint-Postman-Collection.json`
4. Click en **Import**

### 2️⃣ Importar el Entorno

1. Click en **Import** nuevamente
2. Arrastrar el archivo `GymPoint-Postman-Environment.json`
3. Click en **Import**

### 3️⃣ Activar el Entorno

1. En la esquina superior derecha, seleccionar **"GymPoint Local"** del dropdown de entornos
2. ✅ Listo para usar!

---

## 🎯 Flujo de Testing Recomendado

### Primer Uso (Usuario Nuevo)

Ejecutar en este orden:

```
1. Health Check → Verificar que el servidor está corriendo
2. Registro → Crear un usuario nuevo
3. Login → Obtener tokens (se guardan automáticamente)
4. Obtener Todos los Gimnasios → Ver gimnasios disponibles
5. Asociarse a un Gimnasio → Asociarse al gym ID 1
6. Registrar Asistencia → Ganar tokens
7. Crear Rutina → Crear una rutina personalizada
8. Completar Rutina → Ganar más tokens
9. Ver Balance de Tokens → Verificar tokens ganados
10. Obtener Recompensas → Ver recompensas disponibles
11. Canjear Recompensa → Gastar tokens
```

### Testing de Autenticación

```
1. Login con Email → Obtener tokens
2. Obtener Mi Perfil → Verificar autenticación
3. Refresh Token → Renovar access token
4. Logout → Cerrar sesión
```

### Testing de Google OAuth

```
1. Login con Google → Usar un idToken válido
2. Verificar Perfil → Debe tener auth_provider: "google"
3. Intentar Login con Password → Debe fallar
```

---

## 📝 Notas Importantes

### Variables de Entorno

Las siguientes variables se **actualizan automáticamente** con scripts:

- ✅ `access_token` → Después de login/refresh
- ✅ `refresh_token` → Después de login
- ✅ `user_id` → Después de registro/login
- ✅ `gym_id` → Al obtener gimnasios
- ✅ `routine_id` → Al crear rutina
- ✅ `reward_id` → Al obtener recompensas

### Tests Automatizados

Cada request incluye tests automáticos que verifican:

- ✅ Status code correcto
- ✅ Estructura de respuesta válida
- ✅ Formato de errores estándar
- ✅ Tiempo de respuesta < 2 segundos

Ver resultados en la pestaña **Test Results** después de cada request.

---

## 🔧 Configuración Manual

Si necesitas cambiar la URL del servidor:

1. Click en el ojo 👁️ (icono de entorno, esquina superior derecha)
2. Click en **GymPoint Local**
3. Editar `base_url` (ejemplo: `http://192.168.1.100:3000`)
4. Guardar

---

## 🐛 Troubleshooting

### Error: "Could not send request"

**Problema:** El servidor no está corriendo.

**Solución:**
```bash
cd backend/node
npm run dev
```

### Error: 401 Unauthorized

**Problema:** Token expirado o no configurado.

**Solución:**
1. Ejecutar nuevamente el request de **Login**
2. El token se guardará automáticamente

### Error: 403 Forbidden

**Problema:** Token expirado (>15 minutos).

**Solución:**
1. Ejecutar **Refresh Access Token**
2. O ejecutar **Login** nuevamente

### Error: 404 Not Found

**Problema:** El `user_id`, `gym_id`, etc. no existen.

**Solución:**
1. Verificar las variables de entorno (ojo 👁️)
2. Ejecutar los requests previos (registro, crear gym, etc.)

---

## 📚 Documentación Completa

Para más detalles, ver: [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)

---

## 🎥 Flujo Visual

```
┌─────────────────┐
│  Health Check   │ → Verificar servidor
└────────┬────────┘
         │
┌────────▼────────┐
│    Registro     │ → Crear cuenta
└────────┬────────┘
         │
┌────────▼────────┐
│     Login       │ → Obtener tokens (auto-guardados)
└────────┬────────┘
         │
┌────────▼────────┐
│  Buscar Gyms    │ → Ver gimnasios cercanos
└────────┬────────┘
         │
┌────────▼────────┐
│  Asociarse Gym  │ → Unirse a un gym
└────────┬────────┘
         │
┌────────▼────────┐
│  Registrar      │ → Asistir al gym → Ganar 5 tokens
│  Asistencia     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Crear Rutina   │ → Mínimo 3 ejercicios
└────────┬────────┘
         │
┌────────▼────────┐
│  Completar      │ → Ganar 10 tokens
│  Rutina         │
└────────┬────────┘
         │
┌────────▼────────┐
│  Ver Tokens     │ → Balance: 15 tokens
└────────┬────────┘
         │
┌────────▼────────┐
│  Canjear        │ → Gastar tokens en recompensas
│  Recompensa     │
└─────────────────┘
```

---

## ✅ Checklist de Testing

- [ ] Health check responde 200 OK
- [ ] Ready check muestra DB conectada
- [ ] Registro crea usuario correctamente
- [ ] Login retorna access y refresh token
- [ ] Tokens se guardan automáticamente
- [ ] Búsqueda de gyms cercanos funciona
- [ ] Asociación a gym es exitosa
- [ ] Asistencia otorga 5 tokens
- [ ] Creación de rutina funciona (≥3 ejercicios)
- [ ] Completar rutina otorga 10 tokens
- [ ] Balance de tokens es correcto
- [ ] Canje de recompensa descuenta tokens
- [ ] Historial de transacciones es consistente
- [ ] Refresh token renueva access token
- [ ] Logout revoca el refresh token

---

**¡Listo para testear! 🚀**

Si tienes dudas, consulta la guía completa o el archivo de colección tiene ejemplos de requests para cada endpoint.

