# WebSocket Implementation - GymPoint Backend

## Descripción General

Este directorio contiene la implementación de WebSocket usando Socket.IO para comunicación en tiempo real en GymPoint.

## Arquitectura

```
websocket/
├── socket-manager.js           # Inicialización y gestión de Socket.IO
├── events/
│   └── event-emitter.js       # Event bus para integración con servicios
├── middlewares/
│   └── auth.middleware.js     # Autenticación JWT para WebSocket
└── handlers/
    ├── notification.handler.js    # Notificaciones en tiempo real
    ├── presence.handler.js        # Presencia en gimnasios
    └── assistance.handler.js      # Check-ins y rachas
```

## Características

### 1. **Autenticación JWT**
Todos los clientes deben autenticarse con un token JWT válido al conectarse.

### 2. **Rooms y Namespaces**
- `user:{userProfileId}` - Room personal de cada usuario
- `gym:{gymId}` - Room para actualizaciones de gimnasio específico
- `notifications:{userProfileId}` - Notificaciones de usuario
- `assistance:gym:{gymId}` - Asistencias de gimnasio

### 3. **Eventos Soportados**

#### Notificaciones
- `notification:new` - Nueva notificación recibida
- `notifications:unread-count` - Contador de no leídas actualizado

#### Presencia en Gimnasios
- `presence:user-entered` - Usuario entró al gimnasio
- `presence:user-left` - Usuario salió del gimnasio
- `presence:updated` - Actualización de conteo de presencia

#### Asistencias
- `assistance:new` - Nueva asistencia registrada
- `streak:updated` - Racha actualizada
- `streak:milestone` - Hito de racha alcanzado
- `streak:lost` - Racha perdida

## Uso desde el Cliente

### Conexión

```javascript
import io from 'socket.io-client';

// Obtener token JWT del almacenamiento
const token = await getAuthToken();

// Conectar al WebSocket
const socket = io('ws://localhost:3000', {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling']
});

// Manejar conexión exitosa
socket.on('connection:success', (data) => {
  console.log('Connected to GymPoint WebSocket:', data);
});

// Manejar errores de conexión
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Suscribirse a Notificaciones

```javascript
// Suscribirse
socket.emit('notifications:subscribe');

socket.on('notifications:subscribed', (data) => {
  console.log('Subscribed to notifications:', data);
});

// Escuchar nuevas notificaciones
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
  // Mostrar notificación en UI
  showNotification(notification);
});

// Contador de no leídas
socket.on('notifications:unread-count', (data) => {
  console.log('Unread count:', data.count);
  updateBadge(data.count);
});
```

### Presencia en Gimnasios

```javascript
// Unirse a room de gimnasio
socket.emit('presence:join-gym', { gymId: 123 });

socket.on('presence:joined-gym', (data) => {
  console.log('Joined gym presence:', data);
});

// Escuchar usuarios entrando
socket.on('presence:user-entered', (data) => {
  console.log('User entered gym:', data);
  updatePresenceCount();
});

// Escuchar usuarios saliendo
socket.on('presence:user-left', (data) => {
  console.log('User left gym:', data);
  updatePresenceCount();
});

// Actualizaciones de presencia
socket.on('presence:updated', (data) => {
  console.log('Presence updated:', data);
  updateGymPresence(data.currentCount);
});
```

### Check-in y Asistencias

```javascript
// Suscribirse a asistencias de un gimnasio
socket.emit('assistance:subscribe-gym', { gymId: 123 });

// Escuchar nuevas asistencias
socket.on('assistance:new', (data) => {
  console.log('New assistance:', data);
  // Actualizar lista de check-ins recientes
});

// Suscribirse a actualizaciones de racha personal
socket.emit('streak:subscribe');

// Escuchar actualización de racha
socket.on('streak:updated', (data) => {
  console.log('Streak updated:', data);
  updateStreakDisplay(data.currentStreak);
});

// Escuchar hitos de racha
socket.on('streak:milestone', (data) => {
  console.log('Streak milestone!', data);
  showCelebration(data.milestone);
});
```

## Integración con Servicios Existentes

La implementación usa un **Event Emitter** para integrarse con servicios existentes sin modificar su lógica:

### Desde un Servicio

```javascript
// En cualquier servicio
const { emitEvent, EVENTS } = require('../websocket/events/event-emitter');

// Después de crear una notificación
emitEvent(EVENTS.NOTIFICATION_CREATED, {
  userProfileId: userId,
  notification: notificationData
});

// Después de registrar asistencia
emitEvent(EVENTS.ASSISTANCE_REGISTERED, {
  userId: userId,
  gymId: gymId,
  timestamp: new Date()
});

// Actualización de racha
emitEvent(EVENTS.STREAK_UPDATED, {
  userProfileId: userId,
  currentStreak: 10,
  longestStreak: 15
});
```

### Eventos Disponibles

```javascript
EVENTS = {
  // Notificaciones
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',

  // Asistencias
  ASSISTANCE_REGISTERED: 'assistance:registered',
  ASSISTANCE_CANCELLED: 'assistance:cancelled',

  // Presencia
  PRESENCE_CHECKIN: 'presence:checkin',
  PRESENCE_CHECKOUT: 'presence:checkout',
  PRESENCE_UPDATED: 'presence:updated',

  // Rachas
  STREAK_UPDATED: 'streak:updated',
  STREAK_LOST: 'streak:lost',
  STREAK_MILESTONE: 'streak:milestone',

  // Reseñas
  REVIEW_CREATED: 'review:created',
  GYM_RATING_UPDATED: 'gym:rating:updated',

  // Logros
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

  // Recompensas
  REWARD_EARNED: 'reward:earned',
  REWARD_CLAIMED: 'reward:claimed',

  // Sistema
  SYSTEM_ANNOUNCEMENT: 'system:announcement'
}
```

## Testing con Postman

1. Crear una nueva conexión WebSocket en Postman
2. URL: `ws://localhost:3000`
3. En "Headers", agregar:
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN"
   }
   ```
4. Conectar y enviar eventos

## Variables de Entorno

```env
# CORS para WebSocket (usar las mismas que HTTP)
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Puerto (WebSocket usa el mismo puerto que HTTP)
PORT=3000
```

## Seguridad

- ✅ Autenticación JWT requerida para todas las conexiones
- ✅ Validación de tokens en cada handshake
- ✅ Rooms aislados por usuario y gimnasio
- ✅ Rate limiting heredado del servidor HTTP
- ✅ CORS configurado para orígenes permitidos

## Monitoreo

El servidor registra todos los eventos importantes:

```
[WebSocket] User connected: user@example.com (ID: 123)
[WebSocket] Socket.IO initialized successfully
[Notifications] User user@example.com subscribed to notifications
[Presence] User user@example.com joined gym 456 presence room
[WebSocket] User disconnected: user@example.com - Reason: transport close
```

## Desconexión y Reconexión

Socket.IO maneja automáticamente:
- ✅ Reconexión automática en caso de pérdida de conexión
- ✅ Fallback a long polling si WebSocket no está disponible
- ✅ Heartbeat/ping automático para mantener conexión

## Próximos Pasos para Desarrollo

1. **Frontend Mobile (React Native)**
   - Instalar: `npm install socket.io-client`
   - Implementar hook `useWebSocket`
   - Integrar notificaciones push nativas

2. **Más Eventos**
   - Mensajes privados entre usuarios
   - Chat de gimnasio
   - Actualizaciones de challenges en tiempo real
   - Leaderboards en vivo

3. **Escalabilidad**
   - Implementar Redis Adapter para múltiples instancias
   - Cluster mode con sticky sessions
   - Load balancing con nginx

## Ejemplo Completo - React Native

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { getAuthToken } from '@/services/auth';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function connect() {
      const token = await getAuthToken();

      const socket = io('ws://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      socket.on('notification:new', (notification) => {
        // Mostrar notificación push
        showPushNotification(notification);
      });

      socketRef.current = socket;
    }

    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connected
  };
}
```

## Soporte

Para problemas o preguntas sobre WebSocket:
1. Revisar logs del servidor
2. Verificar token JWT válido
3. Confirmar CORS configurado correctamente
4. Probar con Postman primero antes de integrar en cliente
