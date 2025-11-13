# Sistema de Actualizaciones en Tiempo Real - GymPoint

## 📋 Resumen General

Este documento describe la implementación completa del sistema de actualizaciones en tiempo real en GymPoint, que permite que los cambios se reflejen automáticamente en todas las aplicaciones sin necesidad de refrescar la página o reiniciar la app.

---

## 🎯 Objetivos Logrados

### ✅ Admin Panel → Landing
- **Solicitudes de Gimnasios:** Cuando landing envía una solicitud de gimnasio, el admin la ve instantáneamente sin refrescar
- **Sin efectos visuales:** Actualización suave sin "blinking" o recargas

### ✅ Admin Panel → Mobile
- **Envío de Tokens:** Admin envía tokens → Mobile los recibe instantáneamente con Toast
- **Upgrade a Premium:** Admin hace premium a un usuario → Mobile actualiza el tier automáticamente con Toast
- **Sin reinicio de app:** Todo se actualiza en tiempo real

### ✅ Mobile → Admin (preparado para futuro)
- Infraestructura lista para eventos desde mobile hacia admin
- Ejemplos: check-ins, reseñas, achievements

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **WebSocket:** Socket.IO v4.8.1
- **Backend:** Node.js + Express
- **State Management:** TanStack Query (React Query)
- **Frontend Admin:** React + TypeScript + Tailwind
- **Mobile:** React Native + Expo + NativeWind
- **Event System:** EventEmitter (Node.js)

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Service    │ ───▶ │ EventEmitter │ ───▶ │  Socket  │  │
│  │  (Business)  │      │              │      │ Manager  │  │
│  └──────────────┘      └──────────────┘      └────┬─────┘  │
└────────────────────────────────────────────────────┼────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────┐
                    │                                │                    │
                    ▼                                ▼                    ▼
         ┌──────────────────┐            ┌──────────────────┐  ┌──────────────────┐
         │   ADMIN PANEL    │            │   MOBILE APP     │  │   LANDING PAGE   │
         │                  │            │                  │  │                  │
         │ ┌──────────────┐ │            │ ┌──────────────┐ │  │ ┌──────────────┐ │
         │ │ WebSocket    │ │            │ │ WebSocket    │ │  │ │ WebSocket    │ │
         │ │ Service      │ │            │ │ Service      │ │  │ │ Service      │ │
         │ └──────┬───────┘ │            │ └──────┬───────┘ │  │ └──────────────┘ │
         │        │         │            │        │         │  │                  │
         │        ▼         │            │        ▼         │  │                  │
         │ ┌──────────────┐ │            │ ┌──────────────┐ │  │                  │
         │ │useRealtimeSync│ │            │ │useRealtimeSync│ │  │                  │
         │ └──────┬───────┘ │            │ └──────┬───────┘ │  │                  │
         │        │         │            │        │         │  │                  │
         │        ▼         │            │        ▼         │  │                  │
         │ ┌──────────────┐ │            │ ┌──────────────┐ │  │                  │
         │ │React Query   │ │            │ │React Query   │ │  │                  │
         │ │Cache Update  │ │            │ │Cache Update  │ │  │                  │
         │ └──────┬───────┘ │            │ └──────┬───────┘ │  │                  │
         │        │         │            │        │         │  │                  │
         │        ▼         │            │        ▼         │  │                  │
         │ ┌──────────────┐ │            │ ┌──────────────┐ │  │                  │
         │ │ UI Update    │ │            │ │ UI + Toast   │ │  │                  │
         │ └──────────────┘ │            │ └──────────────┘ │  │                  │
         └──────────────────┘            └──────────────────┘  └──────────────────┘
```

---

## 📂 Estructura de Archivos

### Backend

```
backend/node/
├── websocket/
│   ├── socket-manager.js           # Configuración principal de Socket.IO
│   ├── events/
│   │   └── event-emitter.js        # EventEmitter central + constantes
│   ├── handlers/
│   │   ├── admin.handler.js        # Events para admins (gym requests, stats)
│   │   └── user.handler.js         # Events para usuarios (tokens, premium)
│   └── middlewares/
│       └── auth.middleware.js      # Autenticación JWT para WebSocket
└── services/
    ├── gym-request-service.js      # Emite GYM_REQUEST_CREATED
    ├── user-service.js             # Emite USER_TOKENS_UPDATED, USER_SUBSCRIPTION_UPDATED
    └── achievement-service.js      # Emite ACHIEVEMENT_UNLOCKED
```

### Frontend Admin

```
frontend/gympoint-admin/src/
├── data/api/
│   └── websocket.service.ts        # Servicio WebSocket (Singleton)
├── presentation/
│   ├── hooks/
│   │   ├── useRealtimeSync.ts      # Hook principal - sincroniza eventos con cache
│   │   └── useCountUp.ts           # Animación suave de números
│   └── components/
│       └── RealtimeProvider.tsx    # Provider React para real-time
└── App.tsx                         # Integración de RealtimeProvider
```

### Mobile

```
frontend/gympoint-mobile/src/
├── shared/
│   ├── services/
│   │   └── websocket.service.ts    # Servicio WebSocket
│   ├── hooks/
│   │   ├── useRealtimeSync.ts      # Hook principal - sincroniza eventos con cache
│   │   └── useCountUpAnimation.ts  # Animación React Native Animated
│   └── components/ui/
│       └── AnimatedNumber.tsx      # Componente animado para números
└── app/App.tsx                     # Integración de useRealtimeSync
```

---

## 🔄 Eventos Implementados

### Eventos de Admin

| Evento Backend | Evento Socket.IO | Room | Descripción |
|----------------|------------------|------|-------------|
| `GYM_REQUEST_CREATED` | `gym:request:created` | `admin:gym-requests` | Nueva solicitud de gimnasio |
| `GYM_REQUEST_APPROVED` | `gym:request:approved` | `admin:gym-requests` | Solicitud aprobada |
| `GYM_REQUEST_REJECTED` | `gym:request:rejected` | `admin:gym-requests` | Solicitud rechazada |
| `ADMIN_STATS_UPDATED` | `admin:stats:updated` | `admin:stats` | Estadísticas actualizadas |

### Eventos de Usuario

| Evento Backend | Evento Socket.IO | Room | Descripción |
|----------------|------------------|------|-------------|
| `USER_TOKENS_UPDATED` | `user:tokens:updated` | `user:{userId}` | Balance de tokens actualizado |
| `USER_SUBSCRIPTION_UPDATED` | `user:subscription:updated` | `user:{userId}` | Tier de suscripción actualizado |
| `USER_PROFILE_UPDATED` | `user:profile:updated` | `user:{userId}` | Perfil de usuario actualizado |

### Otros Eventos (ya existentes)

- `NOTIFICATION_CREATED` → notificaciones
- `ASSISTANCE_REGISTERED` → check-ins
- `PRESENCE_UPDATED` → aforo en gimnasios
- `STREAK_UPDATED` → rachas de entrenamiento
- `ACHIEVEMENT_UNLOCKED` → logros desbloqueados
- `REVIEW_CREATED` → nuevas reseñas

---

## 🔐 Sistema de Autenticación

### JWT Token
- Contiene: `id`, `email`, `roles[]`, `id_user_profile`, `subscription`
- Se envía en el handshake: `auth: { token }`
- Backend valida en `auth.middleware.js`

### Autorización por Roles
- **Admin:** Requiere rol `'ADMIN'` para suscribirse a eventos admin
- **Usuario:** Automáticamente suscrito a room `user:{id_user_profile}`
- Si un usuario sin rol ADMIN intenta suscribirse a eventos admin, recibe evento `admin:auth:error`

### Rooms (Canales)

```javascript
// Rooms de Admin (requieren rol ADMIN)
'admin:gym-requests'      // Solicitudes de gimnasios
'admin:user-management'   // Gestión de usuarios
'admin:stats'             // Estadísticas del dashboard

// Rooms de Usuario (automáticas)
'user:{userId}'           // Room personal del usuario
'user-tokens:{userId}'    // Suscripción explícita a tokens
'user-profile:{userId}'   // Suscripción explícita a perfil

// Rooms de Gimnasio (contextuales)
'gym:{gymId}'             // Eventos del gimnasio específico
```

---

## 💾 Gestión de Cache con React Query

### Query Keys Utilizadas

**Admin:**
- `['gym-requests', status?]` - Lista de solicitudes (pending, approved, rejected)
- `['gyms']` - Lista de gimnasios
- `['adminStats']` - Estadísticas del dashboard

**Mobile:**
- `['user-profile']` - Perfil completo del usuario
- `['user-tokens']` - Balance de tokens (opcional)

### Estrategias de Actualización

**1. Optimistic Update (`setQueryData`):**
```typescript
queryClient.setQueryData(['user-profile'], (old: any) => ({
  ...old,
  tokens: newBalance,
}));
```
- **Ventaja:** Instantáneo, sin parpadeo
- **Uso:** Tokens, subscription tier

**2. Invalidación (`invalidateQueries`):**
```typescript
queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
```
- **Ventaja:** Refresca datos del servidor
- **Uso:** Listas complejas, datos relacionados

**3. Híbrido (ambos):**
```typescript
// Actualizar inmediatamente
queryClient.setQueryData(['gym-requests', 'pending'], (old) => [newItem, ...old]);
// Y refrescar del servidor para asegurar consistencia
queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
```
- **Ventaja:** UI rápida + datos consistentes
- **Uso:** Gym requests (admin)

---

## 🎨 Animaciones y UX

### Admin Panel (Tailwind CSS)
```css
/* Fade in suave */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide desde la derecha */
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

Uso: Items nuevos en listas se animan al aparecer

### Mobile (React Native Animated)
```typescript
// Número animado con efecto de conteo
const animatedValue = useCountUpAnimation(targetValue, 600);

// Pulse efecto al recibir tokens
Animated.sequence([
  Animated.timing(scale, { toValue: 1.2, duration: 150 }),
  Animated.timing(scale, { toValue: 1.0, duration: 150 }),
]).start();
```

### Toasts/Notificaciones

**Mobile (react-native-toast-message):**
```typescript
Toast.show({
  type: 'success',
  text1: '✨ Tokens recibidos',
  text2: `+${delta} tokens`,
  position: 'top',
  visibilityTime: 3000,
});
```

---

## 🐛 Sistema de Logging para Debugging

### Niveles de Logging

**Backend:**
- 🔥🔥🔥 - Evento crítico emitido (gym request, tokens, premium)
- ✅ - Operación exitosa (suscripción confirmada)
- ❌ - Error o falta de autorización
- 💰💰💰 - Evento de tokens específicamente
- 👑👑👑 - Evento de premium específicamente

**Frontend:**
- 🔥🔥🔥 - Evento recibido desde backend
- ✅ - Operación completada correctamente
- ❌❌❌ - Error crítico (ej: sin rol ADMIN)
- 📤 - Enviando request/suscripción
- 🎧 - Registrando event listener
- 💰💰💰 - Evento de tokens recibido
- 👑👑👑 - Evento de premium recibido

### Ejemplo de Flujo Completo con Logs

```
# 1. Admin envía tokens desde panel
[Admin Panel UI] User clicks "Send Tokens" button

# 2. Backend procesa y emite evento
💰💰💰 [User Handler] TOKENS UPDATED EVENT for user 5! 💰💰💰
[User Handler] Previous: 100, New: 150, Delta: 50
[User Handler] Emitting to rooms: user:5 and user-tokens:5
[User Handler] ✅ Tokens event emitted successfully!

# 3. Mobile recibe evento
💰💰💰 [useRealtimeSync Mobile] TOKENS UPDATED EVENT RECEIVED! 💰💰💰
[useRealtimeSync Mobile] Previous: 100
[useRealtimeSync Mobile] New: 150
[useRealtimeSync Mobile] Delta: 50
[useRealtimeSync Mobile] Updating user-profile cache. Old tokens: 100
[useRealtimeSync Mobile] New tokens: 150
[useRealtimeSync Mobile] ✅ Tokens cache updated successfully!

# 4. UI actualiza
[React Query] Query ['user-profile'] updated
[Mobile UI] Rendering with new tokens: 150
[Toast] Showing: "✨ Tokens recibidos - +50 tokens"
```

---

## 📚 Guías de Depuración

### Documentos Disponibles

1. **[REALTIME_DEBUG_GUIDE.md](REALTIME_DEBUG_GUIDE.md)** - Guía principal de debugging para Admin Panel
   - Verificación de conexión WebSocket
   - Problemas comunes de autorización (rol ADMIN)
   - Query keys y cache de React Query
   - Checklist completo

2. **[REALTIME_MOBILE_DEBUG_GUIDE.md](REALTIME_MOBILE_DEBUG_GUIDE.md)** - Guía específica para Mobile
   - Configuración de API_BASE_URL (emulador vs dispositivo)
   - Debugging con React Native Debugger
   - Propiedades correctas del UserProfile
   - Toast configuration

3. **Este documento** - Resumen general de la arquitectura

---

## ✅ Checklist de Implementación

### Backend ✅
- [x] EventEmitter con constantes de eventos
- [x] Socket Manager con configuración de Socket.IO
- [x] Admin handler con rooms y subscriptions
- [x] User handler con rooms y subscriptions
- [x] Auth middleware con verificación JWT y roles
- [x] Emisión de eventos en services (gym-request, user)
- [x] Logging prominente con emojis

### Admin Panel ✅
- [x] WebSocket service (singleton)
- [x] Auto-suscripción a eventos admin
- [x] Confirmaciones de suscripción
- [x] useRealtimeSync hook con handlers
- [x] Actualización de cache React Query
- [x] Query keys correctas (`['gym-requests', status]`)
- [x] Logging prominente con emojis
- [x] Error handling para falta de rol ADMIN
- [x] RealtimeProvider sin indicador visual

### Mobile ✅
- [x] WebSocket service con logging
- [x] Suscripción a eventos de usuario
- [x] Confirmaciones de suscripción
- [x] useRealtimeSync hook con handlers
- [x] Actualización de cache React Query
- [x] Query keys correctas (`['user-profile']`)
- [x] Propiedades correctas (tokens, app_tier, premium_since, premium_expires)
- [x] Logging prominente con emojis
- [x] Toast notifications para tokens y premium
- [x] Integración en App.tsx

### Documentación ✅
- [x] Guía de debugging para Admin
- [x] Guía de debugging para Mobile
- [x] Resumen general de arquitectura (este documento)
- [x] Comentarios en código

---

## 🚀 Cómo Usar el Sistema

### Para Admin: Enviar Tokens a Usuario

1. Ir a Admin Panel → Users
2. Seleccionar usuario
3. Click en "Send Tokens"
4. Ingresar cantidad y razón
5. Confirmar

**Resultado en Mobile:**
- Tokens se actualizan automáticamente
- Toast aparece: "✨ Tokens recibidos - +X tokens"
- Sin necesidad de cerrar/abrir app

### Para Admin: Hacer Premium a Usuario

1. Ir a Admin Panel → Users
2. Seleccionar usuario
3. Click en "Make Premium"
4. Confirmar

**Resultado en Mobile:**
- App tier cambia a PREMIUM automáticamente
- Toast aparece: "🎉 ¡Ahora eres Premium!"
- Contenido premium se desbloquea instantáneamente

### Para Landing: Solicitar Gimnasio

1. Ir a Landing → Formulario de solicitud
2. Completar datos del gimnasio
3. Enviar solicitud

**Resultado en Admin:**
- Nueva solicitud aparece en Admin → Gym Requests
- Sin necesidad de refrescar la página
- Con animación suave de entrada

---

## 🔮 Futuras Mejoras

### Corto Plazo
- [ ] Reducir logging en producción (usar variable de entorno)
- [ ] Implementar reconnection automática con backoff
- [ ] Agregar indicador de estado de conexión en UI

### Mediano Plazo
- [ ] Notificaciones push cuando app está en background
- [ ] Sincronización offline (queue de eventos)
- [ ] Metrics y monitoring (cuántos usuarios conectados, latencia, etc.)

### Largo Plazo
- [ ] Horizontal scaling con Redis adapter para Socket.IO
- [ ] Real-time collaboration features
- [ ] WebRTC para features avanzadas

---

## 🎓 Conceptos Clave

### EventEmitter Pattern
El backend usa EventEmitter de Node.js para desacoplar la emisión de eventos WebSocket de la lógica de negocio:
```javascript
// En service
appEvents.emit('USER_TOKENS_UPDATED', data);

// En socket-manager
appEvents.on('USER_TOKENS_UPDATED', (data) => {
  io.to(`user:${userId}`).emit('user:tokens:updated', data);
});
```

### Optimistic Updates
Actualizar la UI inmediatamente antes de confirmar con el servidor:
```typescript
// Actualizar cache inmediatamente
queryClient.setQueryData(['user-profile'], (old) => ({
  ...old,
  tokens: newBalance
}));

// La UI ya muestra el cambio, sin esperar
```

### Rooms de Socket.IO
Canales que permiten broadcast a grupos específicos:
```javascript
// Usuario se une a su room personal
socket.join(`user:${userId}`);

// Emitir solo a ese usuario
io.to(`user:${userId}`).emit('user:tokens:updated', data);
```

---

## 📞 Contacto y Soporte

Para dudas o problemas:
1. Revisar las guías de debugging primero
2. Verificar los logs con los emojis específicos
3. Compartir logs completos (backend + frontend)
4. Incluir pasos para reproducir el problema

---

**Última actualización:** 2025-11-12
**Versión:** 1.0.0
**Autor:** GymPoint Team
