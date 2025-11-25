# WebSocket Integration - GymPoint Mobile

## Descripción

Este documento describe cómo está implementado WebSocket en la aplicación móvil de GymPoint y cómo utilizarlo en componentes.

## Arquitectura

```
src/shared/
├── types/
│   └── websocket.types.ts          # Tipos TypeScript para eventos WebSocket
├── services/
│   └── websocket.service.ts        # Servicio singleton de WebSocket
├── providers/
│   └── WebSocketProvider.tsx       # Context Provider de React
└── hooks/
    ├── useWebSocketNotifications.ts # Hook para notificaciones en tiempo real
    ├── useGymPresence.ts           # Hook para presencia en gimnasios
    └── useStreakUpdates.ts         # Hook para rachas en tiempo real
```

## Instalación Completa ✅

Las siguientes dependencias ya están instaladas:
- ✅ `socket.io-client` - Cliente WebSocket
- ✅ `react-native-toast-message` - Notificaciones toast

## Configuración

### 1. Provider ya integrado en App.tsx

El WebSocketProvider ya está configurado en [app/App.tsx](app/App.tsx:28):

```typescript
<QueryClientProvider client={qc}>
  <ThemeProvider>
    <WebSocketProvider autoConnect={true}>
      <AppContent />
    </WebSocketProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### 2. Configuración de URL

El WebSocket usa automáticamente la misma URL base que las APIs REST, configurada en `src/shared/config/env.ts`:

```typescript
// Se conectará automáticamente a:
// - Android Emulator: http://10.0.2.2:3000
// - iOS Simulator: http://localhost:3000
// - Dispositivo físico: URL configurada en app.config.ts
```

## Uso en Componentes

### Hook 1: Notificaciones en Tiempo Real

```typescript
import { useWebSocketNotifications } from '@shared/hooks';

function NotificationsScreen() {
  const { unreadCount, latestNotification, markAsRead } = useWebSocketNotifications(
    true,  // auto-suscribirse
    true   // mostrar toast automáticamente
  );

  return (
    <View>
      <Text>Notificaciones no leídas: {unreadCount}</Text>

      {latestNotification && (
        <View>
          <Text>{latestNotification.title}</Text>
          <Text>{latestNotification.message}</Text>
          <Button
            title="Marcar como leída"
            onPress={() => markAsRead(latestNotification.id)}
          />
        </View>
      )}
    </View>
  );
}
```

**Características:**
- ✅ Auto-suscripción a notificaciones
- ✅ Contador de notificaciones no leídas en tiempo real
- ✅ Toast automático cuando llegan notificaciones
- ✅ Marcar como leída desde el componente

### Hook 2: Presencia en Gimnasios

```typescript
import { useGymPresence } from '@shared/hooks';

function GymDetailScreen({ gymId }: { gymId: number }) {
  const {
    currentCount,
    isJoined,
    join,
    leave,
    checkin,
    checkout,
    recentActivity
  } = useGymPresence(gymId, true); // auto-join al gimnasio

  return (
    <View>
      <Text>Personas en el gimnasio: {currentCount}</Text>

      <Button title="Check In" onPress={() => checkin()} />
      <Button title="Check Out" onPress={() => checkout()} />

      {/* Actividad reciente */}
      {recentActivity.map((activity, index) => (
        <Text key={index}>
          Usuario {activity.userId} {activity.type === 'entered' ? 'entró' : 'salió'}
        </Text>
      ))}
    </View>
  );
}
```

**Características:**
- ✅ Ver cuántas personas están en el gimnasio en tiempo real
- ✅ Notificaciones cuando alguien entra/sale
- ✅ Check-in/check-out desde el componente
- ✅ Historial de actividad reciente

### Hook 3: Rachas (Streaks) en Tiempo Real

```typescript
import { useStreakUpdates } from '@shared/hooks';

function StreakWidget() {
  const {
    currentStreak,
    longestStreak,
    latestMilestone
  } = useStreakUpdates(
    true,  // auto-suscribirse
    true   // mostrar toasts de celebración
  );

  return (
    <View>
      <Text>🔥 Racha actual: {currentStreak} días</Text>
      <Text>🏆 Mejor racha: {longestStreak} días</Text>

      {latestMilestone && (
        <View>
          <Text>🎉 ¡Alcanzaste {latestMilestone.milestone} días!</Text>
          <Text>{latestMilestone.message}</Text>
        </View>
      )}
    </View>
  );
}
```

**Características:**
- ✅ Actualización en tiempo real de rachas
- ✅ Notificación cuando alcanzas hitos (7, 30, 100 días)
- ✅ Alerta si pierdes la racha
- ✅ Toast de celebración automático

### Hook 4: Uso Directo del Context (Avanzado)

Para casos de uso más específicos:

```typescript
import { useWebSocketContext } from '@shared/providers';
import { WS_EVENTS } from '@shared/types/websocket.types';
import { useEffect } from 'react';

function CustomComponent() {
  const { connected, on, off, emit } = useWebSocketContext();

  useEffect(() => {
    if (!connected) return;

    // Escuchar evento personalizado
    const handleCustomEvent = (data: any) => {
      console.log('Custom event:', data);
    };

    on(WS_EVENTS.ACHIEVEMENT_UNLOCKED, handleCustomEvent);

    return () => {
      off(WS_EVENTS.ACHIEVEMENT_UNLOCKED, handleCustomEvent);
    };
  }, [connected, on, off]);

  // Emitir evento personalizado
  const sendCustomEvent = () => {
    emit('custom:event', { someData: 'value' });
  };

  return (
    <View>
      <Text>Conectado: {connected ? 'Sí' : 'No'}</Text>
      <Button title="Enviar evento" onPress={sendCustomEvent} />
    </View>
  );
}
```

## Eventos Disponibles

### Eventos del Servidor al Cliente

```typescript
// Notificaciones
'notification:new'              // Nueva notificación
'notifications:unread-count'    // Contador actualizado

// Presencia
'presence:user-entered'         // Usuario entró al gym
'presence:user-left'            // Usuario salió del gym
'presence:updated'              // Contador actualizado

// Asistencias y Rachas
'assistance:new'                // Nueva asistencia registrada
'streak:updated'                // Racha actualizada
'streak:milestone'              // Hito alcanzado (7, 30, 100 días)
'streak:lost'                   // Racha perdida

// Logros y Recompensas
'achievement:unlocked'          // Logro desbloqueado
'reward:earned'                 // Recompensa ganada

// Reseñas
'review:new'                    // Nueva reseña
'gym:rating:updated'            // Rating del gym actualizado

// Sistema
'system:announcement'           // Anuncio del sistema
```

### Eventos del Cliente al Servidor

Los hooks ya manejan estos eventos automáticamente, pero puedes usarlos manualmente:

```typescript
// Notificaciones
emit('notifications:subscribe');
emit('notifications:mark-read', { notificationId: 123 });

// Presencia
emit('presence:join-gym', { gymId: 456 });
emit('presence:checkin', { gymId: 456 });
emit('presence:checkout', { gymId: 456 });

// Rachas
emit('streak:subscribe');
```

## Manejo de Conexión/Reconexión

El WebSocketProvider maneja automáticamente:

- ✅ **Auto-reconexión** cuando se pierde la conexión
- ✅ **Reconexión en foreground** cuando la app vuelve del background
- ✅ **Manejo de errores** con reintentos automáticos
- ✅ **Estado de conexión** accesible en todos los componentes

```typescript
function ConnectionStatus() {
  const { connected, connecting, error } = useWebSocketContext();

  return (
    <View>
      {connecting && <Text>Conectando...</Text>}
      {connected && <Text>✅ Conectado</Text>}
      {error && <Text>❌ Error: {error}</Text>}
    </View>
  );
}
```

## Ejemplos de Uso Completos

### Ejemplo 1: Home Screen con Notificaciones

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useWebSocketNotifications, useStreakUpdates } from '@shared/hooks';

export function HomeScreen() {
  const { unreadCount } = useWebSocketNotifications();
  const { currentStreak } = useStreakUpdates();

  return (
    <View>
      <Text>Bienvenido a GymPoint</Text>
      <View>
        <Text>🔔 Notificaciones: {unreadCount}</Text>
        <Text>🔥 Racha: {currentStreak} días</Text>
      </View>
    </View>
  );
}
```

### Ejemplo 2: Gym Detail Screen con Presencia

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useGymPresence } from '@shared/hooks';
import { useRoute } from '@react-navigation/native';

export function GymDetailScreen() {
  const route = useRoute();
  const gymId = route.params?.gymId;

  const { currentCount, checkin, checkout } = useGymPresence(gymId, true);

  return (
    <View>
      <Text>Gimnasio #{gymId}</Text>
      <Text>👥 {currentCount} personas aquí ahora</Text>

      <Button title="Check In" onPress={() => checkin()} />
      <Button title="Check Out" onPress={() => checkout()} />
    </View>
  );
}
```

## Debugging

### Ver logs de WebSocket

Los logs están habilitados en desarrollo:

```
[WebSocket] Connecting to: http://10.0.2.2:3000
[WebSocket] Connected successfully
[WebSocketProvider] Connected
[useWebSocketNotifications] New notification: { ... }
[useGymPresence] User entered: { userId: 123, gymId: 456 }
[useStreakUpdates] Streak updated: { currentStreak: 10 }
```

### Verificar conexión

```typescript
import { useWebSocketContext } from '@shared/providers';

function DebugPanel() {
  const { connected, socket } = useWebSocketContext();

  return (
    <View>
      <Text>Connected: {connected ? 'Yes' : 'No'}</Text>
      <Text>Socket ID: {socket?.id || 'N/A'}</Text>
    </View>
  );
}
```

## Mejores Prácticas

### 1. Usar hooks especializados

✅ **Correcto:**
```typescript
const { unreadCount } = useWebSocketNotifications();
```

❌ **Evitar:**
```typescript
const { on, off } = useWebSocketContext();
useEffect(() => {
  on('notification:new', handleNotification);
  return () => off('notification:new');
}, []);
```

### 2. Limpiar listeners

Los hooks ya limpian automáticamente, pero si usas `useWebSocketContext` directamente:

```typescript
useEffect(() => {
  const handler = (data) => console.log(data);
  on('some:event', handler);

  return () => {
    off('some:event', handler); // ✅ Siempre limpiar
  };
}, [on, off]);
```

### 3. Verificar conexión antes de emitir

```typescript
const { connected, emit } = useWebSocketContext();

const handleAction = () => {
  if (connected) {
    emit('my:event', { data: 'value' });
  } else {
    console.warn('WebSocket not connected');
  }
};
```

## Troubleshooting

### Problema: WebSocket no conecta

**Solución:**
1. Verificar que el backend está corriendo: `npm start` en `backend/node`
2. Verificar la URL en `src/shared/config/env.ts`
3. En Android Emulator, debe usar `10.0.2.2` en lugar de `localhost`
4. Verificar logs en Metro bundler

### Problema: Token expirado

**Solución:**
El WebSocket auto-desconecta si el token expira. Hacer logout/login para obtener nuevo token.

### Problema: No recibo eventos

**Solución:**
1. Verificar que el componente llama al hook
2. Verificar que `autoSubscribe` está en `true`
3. Verificar logs del servidor backend

## Próximos Pasos

- [ ] Integrar en NotificationsScreen
- [ ] Integrar en GymDetailScreen
- [ ] Integrar en StreakWidget/HomeScreen
- [ ] Agregar indicador de conexión en header
- [ ] Agregar vibración en notificaciones importantes
- [ ] Integrar push notifications nativas

## Recursos

- [Backend WebSocket Docs](../../backend/node/websocket/README.md)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Native Toast](https://github.com/calintamas/react-native-toast-message)
