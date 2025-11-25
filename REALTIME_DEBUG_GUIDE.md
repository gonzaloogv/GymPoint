# Guía de Depuración: Actualizaciones en Tiempo Real

## Resumen de Cambios

Se ha agregado logging exhaustivo en toda la cadena de eventos en tiempo real para facilitar la depuración. Esta guía explica qué buscar en la consola del navegador y en los logs del backend.

---

## 🔍 Cómo Probar el Sistema

### Paso 1: Abrir Admin Panel
1. Abre el admin panel en el navegador: `http://localhost:5173` (o el puerto que uses)
2. Abre la consola del navegador (F12)
3. Inicia sesión como admin

### Paso 2: Verificar Conexión WebSocket

**Deberías ver en la consola del navegador:**
```
[WebSocket Admin] Connected successfully: {...}
[WebSocket Admin] 📤 Emitted admin:subscribe:gym-requests
[WebSocket Admin] 📤 Emitted admin:subscribe:user-management
[WebSocket Admin] 📤 Emitted admin:subscribe:stats
```

**Luego, deberías ver confirmaciones:**
```
[WebSocket Admin] ✅ Gym requests subscription confirmed: {success: true, ...}
[WebSocket Admin] ✅ User management subscription confirmed: {success: true, ...}
[WebSocket Admin] ✅ Stats subscription confirmed: {success: true, ...}
```

**Y finalmente:**
```
[useRealtimeSync] 🎧 Registering event listeners...
[useRealtimeSync] ✅ All event listeners registered successfully!
```

### Paso 3: Crear una Gym Request desde Landing

1. Abre la landing page en otra pestaña
2. Crea una nueva solicitud de gimnasio
3. Observa la consola del admin panel

---

## ✅ Flujo Correcto (Si Todo Funciona)

### Backend (Node.js console):
```bash
🔥🔥🔥 [Socket Manager] GYM_REQUEST_CREATED event received! 🔥🔥🔥
[Socket Manager] Gym Request ID: 123
[Socket Manager] Gym Request Name: Mi Gimnasio
[Socket Manager] Emitting to room: admin:gym-requests
[Socket Manager] ✅ Event emitted successfully!
```

### Frontend (Browser console):
```
🔥🔥🔥 [useRealtimeSync] GYM REQUEST CREATED EVENT RECEIVED! 🔥🔥🔥
[useRealtimeSync] Data: {gymRequest: {...}, timestamp: ...}
[useRealtimeSync] Gym Request: {id_gym_request: 123, name: "Mi Gimnasio", ...}
[useRealtimeSync] Updating pending requests. Old data: [...]
[useRealtimeSync] New pending data: [{id: 123, ...}, ...]
[useRealtimeSync] Invalidating gym-requests queries...
[useRealtimeSync] ✅ Cache updated successfully!
```

**Resultado:** La lista de solicitudes se actualiza automáticamente sin refresh.

---

## ❌ Problemas Comunes

### Problema 1: Error de Autenticación de Admin

**Síntoma en consola del navegador:**
```
❌❌❌ [WebSocket Admin] ADMIN AUTH ERROR! ❌❌❌
[WebSocket Admin] Error: {success: false, message: "You do not have admin privileges", roles: ["USER"]}
[WebSocket Admin] Your user does NOT have ADMIN role!
[WebSocket Admin] Roles: ["USER"]
```

**Síntoma en consola del backend:**
```
[Admin] ❌ User admin@example.com is NOT authorized for admin events (roles: ["USER"])
```

**Causa:** El usuario NO tiene el rol 'ADMIN' en la base de datos.

**Solución:**
```sql
-- Verificar roles del usuario
SELECT a.email, r.role_name
FROM accounts a
LEFT JOIN account_roles ar ON a.id_account = ar.id_account
LEFT JOIN roles r ON ar.id_role = r.id_role
WHERE a.email = 'tu_email_admin@example.com';

-- Si no tiene rol ADMIN, agregarlo
INSERT INTO account_roles (id_account, id_role)
SELECT a.id_account, r.id_role
FROM accounts a, roles r
WHERE a.email = 'tu_email_admin@example.com'
AND r.role_name = 'ADMIN';
```

Después de agregar el rol, **cierra sesión y vuelve a iniciar sesión** para obtener un nuevo JWT token con el rol actualizado.

---

### Problema 2: WebSocket No Se Conecta

**Síntoma:**
```
[WebSocket Admin] Connection error: ...
[WebSocket Admin] Max reconnection attempts reached
```

**Posibles Causas:**
1. Backend no está corriendo
2. Puerto incorrecto (verificar que sea 3000)
3. Token expirado o inválido

**Solución:**
1. Verifica que el backend esté corriendo: `npm start` en `backend/node`
2. Verifica el puerto en [websocket.service.ts:51](frontend/gympoint-admin/src/data/api/websocket.service.ts#L51)
3. Cierra sesión y vuelve a iniciar sesión para obtener un nuevo token

---

### Problema 3: WebSocket Conecta pero NO Recibe Eventos

**Síntoma:**
- Ves las confirmaciones de suscripción ✅
- Pero al crear una gym request NO ves el mensaje 🔥🔥🔥

**Debugging:**

1. **Verifica el backend emite el evento:**
   - Revisa la consola del backend
   - Deberías ver: `🔥🔥🔥 [Socket Manager] GYM_REQUEST_CREATED event received!`
   - Si NO ves esto, el problema está en [gym-request-service.js:102](backend/node/services/gym-request-service.js#L102)

2. **Verifica que estás suscrito al room correcto:**
   - En la consola del backend, busca: `[Admin] email@example.com subscribed to gym requests`
   - Si NO ves esto, el usuario no tiene rol ADMIN (ver Problema 1)

3. **Verifica los query keys:**
   - Los query keys deben ser `['gym-requests', 'pending']`
   - Verificar en [useGyms.ts:67](frontend/gympoint-admin/src/presentation/hooks/useGyms.ts#L67)
   - Y en [useRealtimeSync.ts:41](frontend/gympoint-admin/src/presentation/hooks/useRealtimeSync.ts#L41)

---

### Problema 4: Evento Recibido pero UI No Se Actualiza

**Síntoma:**
- Ves todos los logs 🔥🔥🔥 en la consola
- Pero la lista de solicitudes NO se actualiza visualmente

**Posibles Causas:**

1. **Query no está activa:**
   - React Query solo actualiza queries que están siendo observadas
   - Asegúrate de estar en la página de Gym Requests

2. **Query keys no coinciden:**
   - Verifica que `useGymRequests('pending')` use la misma key que el realtime sync
   - Ambos deben usar `['gym-requests', 'pending']`

3. **Componente no re-renderiza:**
   - Verifica que el componente esté usando el hook correctamente
   - Debe ser: `const { data: requests } = useGymRequests('pending');`

---

## 🔧 Herramientas de Depuración Adicionales

### React Query DevTools
```tsx
// Agregar en App.tsx para ver el estado de las queries
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Verificar Estado de WebSocket
```javascript
// En la consola del navegador
websocketService.isConnected() // debe retornar true
```

### Ver Listeners Activos
```javascript
// En la consola del navegador
websocketService.getSocket()?.listeners('gym:request:created')
// Debe mostrar al menos 1 listener
```

---

## 📋 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Backend está corriendo (`npm start` en `backend/node`)
- [ ] Admin panel está corriendo (`npm run dev` en `frontend/gympoint-admin`)
- [ ] Usuario tiene rol 'ADMIN' en la base de datos
- [ ] Token JWT es válido (no expirado)
- [ ] WebSocket se conecta correctamente (ver confirmaciones ✅)
- [ ] Subscripciones son confirmadas (ver 3 confirmaciones)
- [ ] Event listeners están registrados
- [ ] Backend emite eventos al crear gym request
- [ ] Frontend recibe eventos (ver 🔥🔥🔥)
- [ ] Cache se actualiza (ver logs de cache)

---

## 📝 Archivos Modificados con Logging

### Backend:
- [backend/node/websocket/socket-manager.js:231-243](backend/node/websocket/socket-manager.js#L231-L243) - Logging de eventos
- [backend/node/websocket/handlers/admin.handler.js:15-27](backend/node/websocket/handlers/admin.handler.js#L15-L27) - Auth check y error

### Frontend:
- [frontend/gympoint-admin/src/data/api/websocket.service.ts:106-133](frontend/gympoint-admin/src/data/api/websocket.service.ts#L106-L133) - Subscriptions y confirmaciones
- [frontend/gympoint-admin/src/presentation/hooks/useRealtimeSync.ts:35-59](frontend/gympoint-admin/src/presentation/hooks/useRealtimeSync.ts#L35-L59) - Event handlers con logging

---

## 🚀 Próximos Pasos

Una vez que el sistema funcione correctamente:

1. **Reducir logging:** Los logs 🔥🔥🔥 son para debugging. En producción, considera reducirlos.

2. **Agregar toasts/notificaciones:** Cuando llegue un evento, mostrar una notificación visual al usuario.

3. **Agregar feature flag:** Implementar `REALTIME_UI` en variables de entorno para poder activar/desactivar.

4. **Extender a Mobile:** Aplicar el mismo patrón en la app móvil para tokens, premium, etc.

---

## 📞 Soporte

Si después de revisar esta guía el problema persiste, comparte:
1. Logs completos de la consola del navegador
2. Logs del backend (especialmente las líneas con 🔥 o ❌)
3. Resultado de la query SQL para verificar roles
4. Captura de React Query DevTools
