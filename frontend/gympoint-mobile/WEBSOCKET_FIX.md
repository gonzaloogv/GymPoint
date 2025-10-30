# WebSocket - Solución al Problema de Spam de Errores

## Problema Original

Cuando el usuario no había iniciado sesión, el WebSocket intentaba conectarse continuamente sin token, generando spam de errores:

```
ERROR  [WebSocket] Connection error: [Error: No authentication token available]
ERROR  [WebSocketProvider] Failed to connect: [Error: No authentication token available]
LOG  [WebSocketProvider] Attempting to reconnect...
```

## Solución Implementada

Se implementaron las siguientes mejoras en [WebSocketProvider.tsx](src/shared/providers/WebSocketProvider.tsx):

### 1. ✅ Verificación de Token Antes de Conectar

```typescript
const connect = useCallback(async () => {
  // Verificar si hay token antes de intentar conectar
  const token = await tokenStorage.getAccess();
  if (!token) {
    console.log('[WebSocketProvider] No token available, skipping connection');
    setState({ connected: false, connecting: false, error: null });
    return;
  }
  // ... continuar con conexión
}, []);
```

### 2. ✅ Límite de Intentos de Reconexión

Se agregó un contador de intentos con máximo de 3 reintentos:

```typescript
const maxReconnectAttempts = 3;
const reconnectAttemptsRef = useRef(0);

const scheduleReconnect = useCallback(() => {
  reconnectAttemptsRef.current++;

  if (reconnectAttemptsRef.current > maxReconnectAttempts) {
    console.log('[WebSocketProvider] Max reconnection attempts reached, stopping reconnection');
    return;
  }
  // ... programar reconexión
}, []);
```

### 3. ✅ Backoff Exponencial

El delay entre reintentos aumenta progresivamente:

```typescript
const delay = Math.min(3000 * reconnectAttemptsRef.current, 10000);
// Intento 1: 3 segundos
// Intento 2: 6 segundos
// Intento 3: 9 segundos
// Máximo: 10 segundos
```

### 4. ✅ No Reconectar en Errores de Autenticación

Si el error es de autenticación o token, no intenta reconectar:

```typescript
socket.on('connect_error', (error: Error) => {
  // Solo reconectar si no es error de autenticación
  if (!error.message.includes('authentication') && !error.message.includes('token')) {
    scheduleReconnect();
  }
});
```

### 5. ✅ Reset de Contador en Eventos Clave

El contador se resetea en:
- Conexión exitosa
- App vuelve al foreground con token válido
- Desconexión manual

```typescript
socket.on('connect', () => {
  reconnectAttemptsRef.current = 0; // Reset on success
});
```

## Comportamiento Actual

### Usuario SIN sesión iniciada:

1. ✅ WebSocket NO intenta conectar (sin token)
2. ✅ Log silencioso: `[WebSocketProvider] No token available, skipping connection`
3. ✅ Sin spam de errores
4. ✅ Sin reintentos

### Usuario CON sesión iniciada:

1. ✅ WebSocket conecta automáticamente
2. ✅ Si pierde conexión, reintenta máximo 3 veces
3. ✅ Backoff exponencial entre reintentos
4. ✅ Reset de contador al volver del background
5. ✅ Conexión exitosa resetea contador

### Errores de Autenticación (token expirado):

1. ✅ NO reintenta conectar automáticamente
2. ✅ Log de error único sin spam
3. ✅ Usuario debe hacer logout/login para nuevo token

## Uso Recomendado

### Opción 1: Dejar como está (Recomendado)

El `WebSocketProvider` ya maneja todo automáticamente:

```typescript
// App.tsx - Ya está configurado
<WebSocketProvider autoConnect={true}>
  <AppContent />
</WebSocketProvider>
```

### Opción 2: Gestión Manual con Hook (Opcional)

Si quieres más control, usa el hook `useWebSocketConnection`:

```typescript
import { useWebSocketConnection } from '@shared/hooks';

function AuthenticatedApp() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Este hook monitorea el estado de autenticación
  useWebSocketConnection(isAuthenticated);

  return <YourApp />;
}
```

## Logs Esperados

### Usuario No Autenticado:

```
[WebSocketProvider] No token available, skipping connection
```

### Usuario Autenticado - Conexión Exitosa:

```
[WebSocket] Connecting to: http://10.0.2.2:3000
[WebSocket] Connected successfully
[WebSocketProvider] Connected
```

### Pérdida de Conexión:

```
[WebSocketProvider] Disconnected: transport close
[WebSocketProvider] Attempting to reconnect... (attempt 1/3)
[WebSocket] Connection error: ...
[WebSocketProvider] Attempting to reconnect... (attempt 2/3)
[WebSocket] Connected successfully
[WebSocketProvider] Connected
```

### Token Expirado:

```
[WebSocket] Connection error: Invalid token
[WebSocketProvider] Connection error: Invalid token
(No más reintentos - detenido por detección de error de auth)
```

## Testing

### Escenario 1: App sin login

1. Abrir app sin hacer login
2. ✅ Verificar: Solo log `No token available, skipping connection`
3. ✅ Verificar: Sin spam de errores

### Escenario 2: Login exitoso

1. Hacer login
2. ✅ Verificar: WebSocket conecta automáticamente
3. ✅ Verificar: Log `Connected successfully`

### Escenario 3: Logout

1. Hacer logout (elimina token)
2. ✅ Verificar: WebSocket desconecta
3. ✅ Verificar: No intenta reconectar sin token

### Escenario 4: Reconexión por pérdida de red

1. Estar logueado y conectado
2. Matar el servidor backend
3. ✅ Verificar: Máximo 3 intentos de reconexión
4. ✅ Verificar: Delays progresivos (3s, 6s, 9s)
5. Reiniciar servidor backend
6. ✅ Verificar: No reconecta (ya alcanzó límite)
7. Traer app del background
8. ✅ Verificar: Resetea contador y reconecta

## Mejoras Futuras (Opcional)

### 1. Indicador Visual de Conexión

```typescript
import { useWebSocketContext } from '@shared/providers';

function ConnectionIndicator() {
  const { connected, connecting, error } = useWebSocketContext();

  if (connecting) return <Text>Conectando...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!connected) return <Text>Desconectado</Text>;
  return <Text>✓ Conectado</Text>;
}
```

### 2. Botón Manual de Reconexión

```typescript
import { websocketService } from '@shared/services/websocket.service';

function ReconnectButton() {
  const { connected } = useWebSocketContext();

  const handleReconnect = async () => {
    await websocketService.reconnect();
  };

  if (connected) return null;

  return <Button title="Reconectar" onPress={handleReconnect} />;
}
```

### 3. Desconectar en Background para Ahorrar Batería

```typescript
// En WebSocketProvider.tsx, línea 151
if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
  console.log('[WebSocketProvider] App going to background');
  disconnect(); // Descomentar esta línea
}
```

## Resumen de Cambios

| Archivo | Cambios |
|---------|---------|
| `WebSocketProvider.tsx` | ✅ Verificación de token<br>✅ Límite de reintentos<br>✅ Backoff exponencial<br>✅ Detección de errores de auth |
| `useWebSocketConnection.ts` | ✅ Nuevo hook para gestión manual |
| `hooks/index.ts` | ✅ Export del nuevo hook |

## Problemas Resueltos

- ✅ Spam de errores cuando no hay token
- ✅ Reintentos infinitos de conexión
- ✅ Consumo excesivo de recursos
- ✅ Logs ruidosos en desarrollo
- ✅ Reintentos innecesarios con errores de auth

## Documentación Relacionada

- [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md) - Guía completa de integración
- [Backend WebSocket README](../../backend/node/websocket/README.md) - Documentación del servidor
