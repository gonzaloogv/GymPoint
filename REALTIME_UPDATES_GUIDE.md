# 🔄 Sistema de Actualizaciones en Tiempo Real - GymPoint

Sistema completo de actualizaciones en tiempo real usando WebSocket (Socket.IO) integrado en toda la aplicación GymPoint sin pestañeos ni recargas.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Implementación por Componente](#implementación-por-componente)
- [Guía de Uso](#guía-de-uso)
- [Ejemplos](#ejemplos)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### ✅ Sin Pestañeos
- Usa `setQueryData` en lugar de `invalidateQueries`
- Actualizaciones silenciosas de caché
- Sin loading states en updates en tiempo real

### ✅ Animaciones Suaves
- **Admin Panel**: Tailwind CSS animations
- **Mobile**: React Native Animated
- Transiciones elegantes y limpias

### ✅ Auto-reconexión
- Maneja desconexiones de red automáticamente
- Reintentos configurables
- Estado de conexión visible

### ✅ Type-safe
- TypeScript en todos los eventos
- Tipos compartidos entre frontend y backend

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                  │
├─────────────────────────────────────────────────────────┤
│  Services (business logic)                              │
│    └─> appEvents.emit(EVENT, data)                      │
│                    ↓                                     │
│  WebSocket Manager                                       │
│    └─> io.to(room).emit(EVENT, data)                   │
└─────────────────────────────────────────────────────────┘
                         ↓ Socket.IO
        ┌────────────────┴────────────────┐
        ↓                                  ↓
┌───────────────────┐           ┌──────────────────────┐
│   ADMIN PANEL     │           │   MOBILE APP         │
│   (React + Vite)  │           │   (React Native)     │
├───────────────────┤           ├──────────────────────┤
│ WebSocket Service │           │ WebSocket Service    │
│        ↓          │           │         ↓            │
│ useRealtimeSync() │           │ useRealtimeSync()    │
│        ↓          │           │         ↓            │
│ queryClient       │           │ queryClient +        │
│  .setQueryData()  │           │   Zustand stores     │
└───────────────────┘           └──────────────────────┘
```

---

## 🔧 Implementación por Componente

### Backend

#### 1. Eventos Definidos
**Archivo**: `backend/node/websocket/events/event-emitter.js`

```javascript
const EVENTS = {
  // Gimnasios
  GYM_REQUEST_CREATED: 'gym:request:created',
  GYM_REQUEST_APPROVED: 'gym:request:approved',
  GYM_REQUEST_REJECTED: 'gym:request:rejected',

  // Usuarios
  USER_TOKENS_UPDATED: 'user:tokens:updated',
  USER_SUBSCRIPTION_UPDATED: 'user:subscription:updated',
  USER_PROFILE_UPDATED: 'user:profile:updated',

  // Admin
  ADMIN_STATS_UPDATED: 'admin:stats:updated',
};
```

#### 2. Emisión en Services
**Ejemplo**: `backend/node/services/user-service.js`

```javascript
const updateUserTokens = async (command) => {
  // ... lógica de negocio ...

  const { newBalance, transaction } = await tokenLedgerService.registrarMovimiento({
    userId: cmd.userProfileId,
    delta: cmd.delta,
    reason: cmd.reason,
  });

  // ✨ Emitir evento
  appEvents.emit(EVENTS.USER_TOKENS_UPDATED, {
    userId: cmd.userProfileId,
    accountId: userProfile?.id_account,
    newBalance,
    previousBalance,
    delta: cmd.delta,
    transaction,
    timestamp: new Date()
  });

  return newBalance;
};
```

#### 3. Handlers WebSocket
**Archivo**: `backend/node/websocket/socket-manager.js`

```javascript
// Eventos de usuarios
appEvents.on(EVENTS.USER_TOKENS_UPDATED, (data) => {
  if (data.userId) {
    // Emitir al usuario específico
    io.to(`user:${data.userId}`).emit('user:tokens:updated', {
      newBalance: data.newBalance,
      previousBalance: data.previousBalance,
      delta: data.delta,
      timestamp: data.timestamp
    });
  }
});
```

---

### Admin Panel (React + Vite + TailwindCSS)

#### 1. WebSocket Service
**Archivo**: `frontend/gympoint-admin/src/data/api/websocket.service.ts`

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;

  connect(): Promise<void> {
    const token = localStorage.getItem('admin_token');

    this.socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    // Auto-suscribirse a eventos de administración
    this.socket.emit('admin:subscribe:gym-requests');
    this.socket.emit('admin:subscribe:user-management');
  }
}
```

#### 2. Hook de Sincronización
**Archivo**: `frontend/gympoint-admin/src/presentation/hooks/useRealtimeSync.ts`

```typescript
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    websocketService.connect();

    // Actualización silenciosa sin pestañeo
    const handleGymRequestCreated = (data: GymRequestCreatedData) => {
      queryClient.setQueryData<any[]>(['gymRequests', 'pending'], (old) => {
        if (!old) return [data.gymRequest];
        return [data.gymRequest, ...old];
      });
    };

    websocketService.onGymRequestCreated(handleGymRequestCreated);

    return () => {
      websocketService.off('gym:request:created', handleGymRequestCreated);
    };
  }, [queryClient]);
}
```

#### 3. Integración en App
**Archivo**: `frontend/gympoint-admin/src/App.tsx`

```tsx
import { RealtimeProvider } from './presentation/components/RealtimeProvider';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <RealtimeProvider>  {/* ← Aquí */}
                <Layout />
              </RealtimeProvider>
            </ProtectedRoute>
          }>
            {/* Rutas... */}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

#### 4. Componente Animado
**Uso**: En cualquier componente

```tsx
import { useCountUp } from '@/presentation/hooks/useCountUp';

function StatsCard({ value }) {
  const animatedValue = useCountUp(value);

  return (
    <div className="animate-fade-in">
      <span className="text-3xl font-bold">
        {animatedValue}
      </span>
    </div>
  );
}
```

---

### Mobile (React Native + Expo + NativeWind)

#### 1. WebSocket Service Mejorado
**Archivo**: `frontend/gympoint-mobile/src/shared/services/websocket.service.ts`

```typescript
class WebSocketService {
  // Métodos para usuarios
  subscribeToTokens() {
    this.emit('user:subscribe:tokens');
  }

  onTokensUpdated(callback: (data: any) => void) {
    this.on('user:tokens:updated', callback);
  }

  onSubscriptionUpdated(callback: (data: any) => void) {
    this.on('user:subscription:updated', callback);
  }
}
```

#### 2. Hook de Sincronización
**Archivo**: `frontend/gympoint-mobile/src/shared/hooks/useRealtimeSync.ts`

```typescript
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const updateProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    const handleTokensUpdated = (data) => {
      // 1. Actualizar Zustand store
      const currentProfile = useProfileStore.getState().profile;
      if (currentProfile) {
        updateProfile({
          ...currentProfile,
          tokenBalance: data.newBalance,
        });
      }

      // 2. Actualizar TanStack Query cache
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        tokenBalance: data.newBalance,
      }));

      // 3. Mostrar toast si aumentó
      if (data.delta > 0) {
        Toast.show({
          type: 'success',
          text1: `+${data.delta} tokens recibidos ✨`,
        });
      }
    };

    websocketService.subscribeToTokens();
    websocketService.onTokensUpdated(handleTokensUpdated);

    return () => {
      websocketService.off('user:tokens:updated', handleTokensUpdated);
    };
  }, [queryClient, updateProfile]);
}
```

#### 3. Integración en App
**Archivo**: `frontend/gympoint-mobile/app/App.tsx`

```tsx
import { useRealtimeSync } from '@shared/hooks';

const AppContent = React.memo(() => {
  const { isDark } = useTheme();

  // Sincronización automática
  useRealtimeSync();  // ← Aquí

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
      <Toast />
    </>
  );
});
```

#### 4. Componente Animado
**Archivo**: `frontend/gympoint-mobile/src/shared/components/ui/AnimatedNumber.tsx`

```tsx
import { AnimatedNumberLarge } from '@shared/components/ui';

function TokenBalance({ balance }) {
  return (
    <View className="items-center">
      <Text className="text-gray-500 text-sm">Tokens disponibles</Text>
      <AnimatedNumberLarge
        value={balance}
        withPulse  // Pulso suave cuando cambia
      />
    </View>
  );
}
```

---

## 📚 Guía de Uso

### Caso 1: Landing envía Gym Request → Admin lo ve

#### En Landing (cuando se envía el form):
```typescript
const response = await fetch('/api/gym-requests', {
  method: 'POST',
  body: JSON.stringify(gymData),
});
// No hace nada más, el backend emite el evento
```

#### En Backend (gym-request-service.js):
```javascript
async function createRequest(data) {
  const request = await GymRequest.create(data);

  // ✨ Evento automático
  appEvents.emit(EVENTS.GYM_REQUEST_CREATED, {
    gymRequest: request.toJSON(),
    timestamp: new Date()
  });

  return request;
}
```

#### En Admin Panel:
```typescript
// useRealtimeSync.ts (ya configurado)
websocketService.onGymRequestCreated((data) => {
  // Se actualiza automáticamente la lista
  queryClient.setQueryData(['gymRequests', 'pending'], (old) => [
    data.gymRequest,
    ...old
  ]);
});

// La UI se actualiza sin pestañeo con animación fade-in
```

---

### Caso 2: Admin hace Premium a Usuario → Mobile recibe actualización

#### En Admin (cuando hace click en "Hacer Premium"):
```typescript
const mutation = useMutation({
  mutationFn: (userId) => api.post(`/users/${userId}/subscription`, {
    subscription: 'PREMIUM'
  }),
});

// Solo llama a la API, el resto es automático
mutation.mutate(userId);
```

#### En Backend (user-service.js):
```javascript
const updateUserSubscription = async (command) => {
  // Actualizar en DB
  const updatedProfile = await userProfileRepository.updateSubscription(
    cmd.userProfileId,
    cmd.subscription
  );

  // ✨ Evento automático
  appEvents.emit(EVENTS.USER_SUBSCRIPTION_UPDATED, {
    userId: cmd.userProfileId,
    newSubscription: cmd.subscription,
    isPremium: cmd.subscription === 'PREMIUM',
    timestamp: new Date()
  });

  return updatedProfile;
};
```

#### En Mobile App:
```typescript
// useRealtimeSync.ts (ya configurado)
websocketService.onSubscriptionUpdated((data) => {
  // 1. Actualizar Zustand
  updateProfile({
    subscriptionTier: data.newSubscription,
    isPremium: data.isPremium,
  });

  // 2. Actualizar caché
  queryClient.setQueryData(['profile'], (old) => ({
    ...old,
    isPremium: data.isPremium,
  }));

  // 3. Mostrar celebración
  if (data.isPremium) {
    Toast.show({
      type: 'success',
      text1: '🎉 ¡Ahora eres Premium!',
    });
  }
});

// La UI se actualiza instantáneamente sin reiniciar app
```

---

## 🎨 Ejemplos de Componentes

### Admin Panel - Card con número animado

```tsx
import { useCountUp } from '@/presentation/hooks/useCountUp';

function UserStatsCard({ totalUsers }: { totalUsers: number }) {
  const animatedUsers = useCountUp(totalUsers, 800);

  return (
    <div className="bg-card rounded-card p-6 shadow-card">
      <h3 className="text-sm text-gray-600 mb-2">Total Usuarios</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-primary">
          {animatedUsers}
        </span>
        <span className="text-sm text-gray-500">usuarios</span>
      </div>
    </div>
  );
}
```

### Mobile - Balance de Tokens animado

```tsx
import { AnimatedNumberLarge } from '@shared/components/ui';

function TokenBalanceCard() {
  const { data: profile } = useQuery(['profile'], fetchProfile);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6">
      <Text className="text-gray-500 text-sm mb-2">
        Tokens disponibles
      </Text>
      <AnimatedNumberLarge
        value={profile?.tokenBalance || 0}
        withPulse  // Pulso cuando cambia
        style={{ color: '#3B82F6' }}
      />
      <Text className="text-gray-400 text-xs mt-1">
        Gana más completando rutinas
      </Text>
    </View>
  );
}
```

---

## 🔍 Troubleshooting

### WebSocket no conecta

```javascript
// Admin Panel - Verificar token
const token = localStorage.getItem('admin_token');
console.log('Token:', token); // Debe existir

// Mobile - Verificar conexión
import { websocketService } from '@shared/services/websocket.service';
console.log('Conectado:', websocketService.isConnected());
```

### Eventos no llegan

```javascript
// Backend - Verificar emisión
appEvents.on(EVENTS.USER_TOKENS_UPDATED, (data) => {
  console.log('[DEBUG] Emitiendo evento USER_TOKENS_UPDATED:', data);
});

// Frontend - Verificar suscripción
websocketService.on('user:tokens:updated', (data) => {
  console.log('[DEBUG] Evento recibido:', data);
});
```

### Datos no se actualizan en UI

```typescript
// Verificar que estés usando setQueryData, no invalidateQueries
queryClient.setQueryData(['key'], (old) => {
  console.log('Old data:', old);
  const newData = { ...old, field: newValue };
  console.log('New data:', newData);
  return newData;
});
```

---

## 📊 Eventos Disponibles

### Gimnasios
- `gym:request:created` - Nueva solicitud
- `gym:request:approved` - Solicitud aprobada
- `gym:request:rejected` - Solicitud rechazada

### Usuarios
- `user:tokens:updated` - Balance de tokens actualizado
- `user:subscription:updated` - Suscripción cambiada (Premium/Free)
- `user:profile:updated` - Datos de perfil actualizados

### Admin
- `admin:stats:updated` - Estadísticas del dashboard actualizadas
- `user:subscription:changed` - Usuario cambió suscripción (para lista de usuarios)

---

## 🚀 Performance

### Optimizaciones implementadas

1. **setQueryData vs invalidateQueries**
   - ✅ `setQueryData`: Actualización silenciosa sin re-fetch
   - ❌ `invalidateQueries`: Causa loading y re-fetch

2. **Reconnection automática**
   - Max 5 intentos
   - Delay de 1 segundo entre intentos

3. **Event batching** (futuro)
   - Agrupar eventos que llegan muy rápido
   - Evitar updates excesivos

4. **Room-based broadcasting**
   - Solo emite a usuarios conectados en rooms específicos
   - Reduce tráfico innecesario

---

## 📝 Notas Importantes

- ✅ **Siempre** usar `setQueryData` para updates en tiempo real
- ✅ Incluir `timestamp` en todos los eventos
- ✅ Emitir eventos DESPUÉS de operación exitosa en DB
- ❌ NO usar `invalidateQueries` en eventos en tiempo real
- ❌ NO emitir eventos antes de guardar en DB
- ❌ NO incluir datos sensibles en eventos broadcast

---

## 🎯 Próximos Pasos (Opcionales)

1. **Landing Page Integration**
   - Instalar socket.io-client
   - Hook ligero para confirmación de gym requests

2. **Monitoring**
   - Dashboard de eventos en tiempo real
   - Métricas de conexiones activas

3. **Advanced Features**
   - Typing indicators
   - Online presence
   - Read receipts

---

**Implementado por**: Claude Code
**Fecha**: 2025-01-12
**Versión**: 1.0.0
