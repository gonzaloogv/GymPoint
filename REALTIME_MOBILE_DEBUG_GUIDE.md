# Guía de Depuración: Actualizaciones en Tiempo Real - Mobile

## Resumen

Esta guía explica cómo depurar las actualizaciones en tiempo real en la aplicación móvil cuando el admin envía tokens o hace premium a un usuario.

---

## 🔍 Cómo Probar el Sistema en Mobile

### Paso 1: Abrir la App Mobile
1. Inicia la app mobile en desarrollo (Expo/React Native)
2. Abre los logs de desarrollo (Metro Bundler console o React Native Debugger)
3. Inicia sesión con un usuario normal (no admin)

### Paso 2: Verificar Conexión WebSocket

**Deberías ver en los logs:**
```
[WebSocket Mobile] ✅ Connected successfully
[WebSocket Mobile] ✅ Connection success: {...}
```

**Luego, cuando useRealtimeSync se monte:**
```
[useRealtimeSync Mobile] 🎧 Setting up realtime sync
[useRealtimeSync Mobile] 📤 Subscribing to user events...
[WebSocket Mobile] 📤 Subscribing to token updates...
[WebSocket Mobile] 📤 Subscribing to profile updates...
```

**Y las confirmaciones:**
```
[WebSocket Mobile] ✅ Tokens subscription confirmed: {success: true, ...}
[WebSocket Mobile] ✅ Profile subscription confirmed: {success: true, ...}
```

**Finalmente:**
```
[useRealtimeSync Mobile] 🎧 Registering event listeners...
[WebSocket Mobile] 🎧 Listening for tokens updates...
[WebSocket Mobile] 🎧 Listening for subscription updates...
[WebSocket Mobile] 🎧 Listening for profile updates...
[useRealtimeSync Mobile] ✅ All event listeners registered successfully!
```

### Paso 3: Admin Envía Tokens al Usuario

1. Desde el admin panel, envía tokens al usuario mobile
2. Observa los logs de la app mobile

---

## ✅ Flujo Correcto - Admin Envía Tokens

### Backend (Node.js console):
```bash
💰💰💰 [User Handler] TOKENS UPDATED EVENT for user 5! 💰💰💰
[User Handler] Previous: 100, New: 150, Delta: 50
[User Handler] Emitting to rooms: user:5 and user-tokens:5
[User Handler] ✅ Tokens event emitted successfully!
```

### Mobile (React Native logs):
```
💰💰💰 [useRealtimeSync Mobile] TOKENS UPDATED EVENT RECEIVED! 💰💰💰
[useRealtimeSync Mobile] Previous: 100
[useRealtimeSync Mobile] New: 150
[useRealtimeSync Mobile] Delta: 50
[useRealtimeSync Mobile] Reason: Admin reward
[useRealtimeSync Mobile] Updating user-profile cache. Old tokens: 100
[useRealtimeSync Mobile] New tokens: 150
[useRealtimeSync Mobile] ✅ Tokens cache updated successfully!
```

**Resultado:**
- La UI se actualiza automáticamente mostrando 150 tokens (sin necesidad de cerrar/abrir la app)
- Se muestra un Toast: "✨ Tokens recibidos - +50 tokens"

---

## ✅ Flujo Correcto - Admin Hace Premium al Usuario

### Backend (Node.js console):
```bash
👑👑👑 [User Handler] SUBSCRIPTION UPDATED EVENT for user 5! 👑👑👑
[User Handler] Previous: FREE, New: PREMIUM
[User Handler] Is Premium: true
[User Handler] Emitting to rooms: user:5 and user-profile:5
[User Handler] ✅ Subscription event emitted successfully!
```

### Mobile (React Native logs):
```
👑👑👑 [useRealtimeSync Mobile] SUBSCRIPTION UPDATED EVENT RECEIVED! 👑👑👑
[useRealtimeSync Mobile] Previous: FREE
[useRealtimeSync Mobile] New: PREMIUM
[useRealtimeSync Mobile] Is Premium: true
[useRealtimeSync Mobile] Updating user-profile cache. Old app_tier: FREE
[useRealtimeSync Mobile] New app_tier: PREMIUM
[useRealtimeSync Mobile] ✅ Subscription cache updated successfully!
```

**Resultado:**
- La UI se actualiza mostrando el estado Premium (sin necesidad de cerrar/abrir la app)
- Se muestra un Toast: "🎉 ¡Ahora eres Premium! - Disfruta de todas las funciones"
- Se invalidan las queries que dependen del tier (para refrescar contenido premium)

---

## ❌ Problemas Comunes en Mobile

### Problema 1: WebSocket No Se Conecta

**Síntoma:**
```
[WebSocket Mobile] ❌ Connection error: ...
[WebSocket Mobile] Max reconnection attempts reached
```

**Posibles Causas:**
1. Backend no está corriendo
2. URL incorrecta en `API_BASE_URL`
3. Token expirado
4. Problema de red (emulador/dispositivo)

**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa la URL en `frontend/gympoint-mobile/src/shared/config/env.ts`
3. Para Android emulator: `http://10.0.2.2:3000`
4. Para iOS simulator: `http://localhost:3000`
5. Para dispositivo físico: IP de tu máquina (ej: `http://192.168.1.100:3000`)
6. Cierra sesión y vuelve a iniciar para obtener nuevo token

---

### Problema 2: useRealtimeSync No Se Monta

**Síntoma:**
- No ves logs de `[useRealtimeSync Mobile]` en absoluto

**Causa:** El hook no está siendo llamado en App.tsx

**Solución:**
Verifica que [App.tsx](frontend/gympoint-mobile/app/App.tsx) tenga:
```typescript
const AppContent = React.memo(() => {
  useRealtimeSync(); // <-- Debe estar aquí
  return (
    <>
      <RootNavigator />
      <Toast />
    </>
  );
});
```

---

### Problema 3: WebSocket Conecta pero No Hay Suscripciones

**Síntoma:**
- Ves `[WebSocket Mobile] ✅ Connected successfully`
- Pero NO ves los logs de suscripciones (📤 Subscribing...)

**Causa:** `useRealtimeSync` detecta que el socket no está conectado

**Debugging:**
```javascript
// Revisa en el hook:
if (!websocketService.isConnected()) {
  console.log('[useRealtimeSync Mobile] WebSocket not connected, skipping sync setup');
  return;
}
```

**Solución:**
El WebSocket se conecta de forma asíncrona. Asegúrate de que la conexión se establezca ANTES de que se monte el hook. En [App.tsx](frontend/gympoint-mobile/app/App.tsx), llama a `websocketService.connect()` al inicio.

---

### Problema 4: Evento Recibido pero UI No Se Actualiza

**Síntoma:**
- Ves todos los logs 💰💰💰 o 👑👑👑
- Pero la UI no muestra los cambios

**Posibles Causas:**

1. **Query keys incorrectas:**
   - Verifica que el componente use `['user-profile']` como query key
   - Ejemplo: `useQuery({ queryKey: ['user-profile'], ... })`

2. **Propiedades incorrectas:**
   - El UserProfile tiene `tokens` (no `tokenBalance`)
   - El UserProfile tiene `app_tier` (no `subscriptionTier`)
   - El UserProfile tiene `premium_since` (no `premiumSince`)
   - El UserProfile tiene `premium_expires` (no `premiumExpires`)

3. **Componente no reactivo:**
   - Asegúrate de que el componente use el hook de React Query correctamente
   - Debe ser: `const { data: profile } = useQuery({ queryKey: ['user-profile'], ... })`
   - NO uses variables locales que no se actualicen

**Solución para propiedades:**
```typescript
// ❌ INCORRECTO
profile.tokenBalance  // No existe
profile.subscriptionTier  // No existe

// ✅ CORRECTO
profile.tokens  // Cantidad de tokens
profile.app_tier  // 'FREE' o 'PREMIUM'
profile.premium_since  // Fecha desde que es premium
profile.premium_expires  // Fecha de expiración
```

---

### Problema 5: Toast No Aparece

**Síntoma:**
- Los logs muestran que el evento fue recibido
- La cache se actualiza correctamente
- Pero no aparece el Toast de notificación

**Causa:** Toast no está configurado en la app

**Solución:**
Verifica que [App.tsx](frontend/gympoint-mobile/app/App.tsx) tenga el componente Toast:
```typescript
return (
  <>
    <RootNavigator />
    <Toast />  {/* <-- Debe estar aquí */}
  </>
);
```

Y que esté importado:
```typescript
import Toast from 'react-native-toast-message';
```

---

## 🔧 Herramientas de Depuración Adicionales

### React Query DevTools (Mobile)
```bash
npm install @tanstack/react-query-devtools
```

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { onlineManager } from '@tanstack/react-query';

// Para ver estado de queries en desarrollo
if (__DEV__) {
  onlineManager.setEventListener(setOnline => {
    return () => {};
  });
}
```

### Ver Estado de WebSocket en Logs
```javascript
// Agregar en useEffect de debugging:
useEffect(() => {
  console.log('WebSocket connected:', websocketService.isConnected());
}, []);
```

### Verificar Cache de React Query
```javascript
// En cualquier componente:
const queryClient = useQueryClient();
const profileData = queryClient.getQueryData(['user-profile']);
console.log('Current profile data:', profileData);
```

---

## 📋 Checklist de Verificación Mobile

Antes de reportar un problema, verifica:

- [ ] Backend está corriendo (`npm start` en `backend/node`)
- [ ] Mobile está corriendo (`npx expo start` o `npm start`)
- [ ] API_BASE_URL apunta a la URL correcta del backend
- [ ] WebSocket se conecta correctamente (ver logs ✅)
- [ ] Suscripciones son confirmadas (ver 2 confirmaciones: tokens y profile)
- [ ] Event listeners están registrados (ver 3 listeners)
- [ ] Backend emite eventos cuando admin envía tokens/premium
- [ ] Mobile recibe eventos (ver 💰💰💰 o 👑👑👑)
- [ ] Cache se actualiza (ver logs de cache)
- [ ] Componente usa query key `['user-profile']` correctamente
- [ ] Componente usa propiedades correctas (`tokens`, `app_tier`, etc.)
- [ ] Toast component está renderizado en App.tsx

---

## 🧪 Cómo Probar Manualmente

### Probar Envío de Tokens:

1. **Backend (desde admin o API directamente):**
   ```bash
   # Opción 1: Desde admin panel
   # - Ir a Users
   # - Seleccionar usuario
   # - "Send Tokens"
   # - Ingresar cantidad (ej: 50)
   # - Confirmar

   # Opción 2: Desde Postman/cURL
   POST http://localhost:3000/api/users/:userId/tokens
   {
     "amount": 50,
     "reason": "Test reward"
   }
   ```

2. **Observar logs del backend** - Deberías ver 💰💰💰

3. **Observar logs de mobile** - Deberías ver 💰💰💰

4. **Verificar UI** - Los tokens deberían actualizarse automáticamente

### Probar Upgrade a Premium:

1. **Backend (desde admin):**
   ```bash
   # Desde admin panel:
   # - Ir a Users
   # - Seleccionar usuario
   # - "Make Premium"
   # - Confirmar
   ```

2. **Observar logs del backend** - Deberías ver 👑👑👑

3. **Observar logs de mobile** - Deberías ver 👑👑👑

4. **Verificar UI** - El badge/estado Premium debería aparecer

---

## 📝 Archivos Clave en Mobile

### Configuración WebSocket:
- [websocket.service.ts](frontend/gympoint-mobile/src/shared/services/websocket.service.ts) - Servicio WebSocket con logging

### Hooks:
- [useRealtimeSync.ts](frontend/gympoint-mobile/src/shared/hooks/useRealtimeSync.ts) - Hook principal con event handlers

### Integración:
- [App.tsx](frontend/gympoint-mobile/app/App.tsx) - Integración del hook en la app

### Componentes de UI (ejemplos):
- Cualquier componente que muestre tokens: debe usar `profile.tokens`
- Cualquier componente que muestre premium: debe usar `profile.app_tier`

---

## 🚀 Próximos Pasos

Una vez que el sistema funcione correctamente:

1. **Reducir logging:** Los logs 💰💰💰 son para debugging. En producción, considera reducirlos.

2. **Personalizar toasts:** Agrega colores, iconos o animaciones personalizadas.

3. **Animaciones de transición:** Usa React Native Animated para animar el cambio de valores (especialmente tokens).

4. **Indicador de conexión:** Muestra un pequeño indicador cuando WebSocket esté desconectado.

5. **Retry automático:** Si falla la actualización, implementa retry logic.

---

## 📞 Soporte

Si después de revisar esta guía el problema persiste, comparte:
1. Logs completos de React Native/Metro
2. Logs del backend (especialmente las líneas con 💰 o 👑)
3. Captura de pantalla de la UI
4. Versión de React Native y Expo (si aplica)
5. Plataforma (iOS/Android, emulador/dispositivo físico)
