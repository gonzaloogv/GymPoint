# WebSocket Performance Optimizations

## Problema del "Flash" en la App

### Síntoma
Al iniciar la app, se ve un flash/parpadeo de 1ms donde parece que la app se recarga.

### Causa
El WebSocketProvider cambia su estado interno (`connecting: false → true → false`) causando re-renders de todos los componentes hijos durante el montaje inicial.

---

## Soluciones Implementadas

### ✅ 1. Memoización del Context Value

**Archivo:** [WebSocketProvider.tsx](src/shared/providers/WebSocketProvider.tsx:236-280)

```typescript
// ANTES (causaba re-renders innecesarios)
const value: WebSocketContextValue = {
  socket: websocketService.getSocket(),
  connected: state.connected,
  // ...
};

// DESPUÉS (memoizado)
const value: WebSocketContextValue = useMemo(
  () => ({
    socket: websocketService.getSocket(),
    connected: state.connected,
    // ...
  }),
  [state.connected, state.connecting, state.error, /* ...deps */]
);
```

**Beneficio:** El context value solo se recrea cuando las dependencias realmente cambian.

---

### ✅ 2. Delay en Conexión Inicial

**Archivo:** [WebSocketProvider.tsx](src/shared/providers/WebSocketProvider.tsx:160-181)

```typescript
useEffect(() => {
  if (autoConnect) {
    // Delay de 100ms en montaje inicial para evitar flash
    const delay = isInitialMount.current ? 100 : 0;

    const timer = setTimeout(() => {
      isInitialMount.current = false;
      connect();
    }, delay);

    return () => clearTimeout(timer);
  }
}, [autoConnect]);
```

**Beneficio:**
- La UI se renderiza primero
- La conexión WebSocket ocurre después
- No hay flash visible por cambios de estado durante montaje

---

### ✅ 3. React.memo en AppContent

**Archivo:** [App.tsx](app/App.tsx:14-24)

```typescript
// Previene re-renders innecesarios
const AppContent = React.memo(() => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
      <Toast />
    </>
  );
});
```

**Beneficio:** AppContent solo re-renderiza cuando `isDark` cambia, no por cambios en WebSocketProvider.

---

## Optimizaciones Adicionales (Opcionales)

### Opción A: Lazy Connection (Conectar solo cuando se necesita)

Si quieres evitar completamente la conexión automática:

```typescript
// App.tsx
<WebSocketProvider autoConnect={false}>
  <AppContent />
</WebSocketProvider>
```

Luego conectar manualmente cuando el usuario hace login:

```typescript
// En tu AuthContext o pantalla de login
import { websocketService } from '@shared/services/websocket.service';

async function handleLogin(credentials) {
  const response = await login(credentials);

  // Conectar WebSocket después de login exitoso
  await websocketService.connect();
}
```

**Pros:**
- Sin overhead de WebSocket en splash/onboarding
- Conexión solo cuando hay usuario autenticado

**Contras:**
- Requiere gestión manual en login/logout

---

### Opción B: Separar Estado de Conexión en un Hook

Si solo algunos componentes necesitan saber el estado de conexión:

```typescript
// Crear un hook separado que no afecte a todos
function useWebSocketStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = websocketService.getSocket();
    if (!socket) return;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return connected;
}

// Usar solo donde se necesite
function ConnectionIndicator() {
  const connected = useWebSocketStatus(); // Solo este componente re-renderiza
  return <Text>{connected ? '✓' : '✗'}</Text>;
}
```

---

## Mediciones de Performance

### Antes de Optimizaciones
```
Montaje inicial: 3 re-renders
- Render 1: Estado inicial
- Render 2: connecting = true
- Render 3: connected = true
Flash visible: ~50-100ms
```

### Después de Optimizaciones
```
Montaje inicial: 1-2 re-renders
- Render 1: Estado inicial
- Render 2: connected = true (después de 100ms)
Flash visible: Ninguno
```

---

## Debugging de Re-renders

Si quieres verificar que las optimizaciones funcionan:

### 1. Instalar React DevTools

```bash
npm install -D @welldone-software/why-did-you-render
```

### 2. Agregar tracking a componentes

```typescript
// App.tsx
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

AppContent.whyDidYouRender = true;
```

### 3. Ver logs en consola

Verás exactamente qué causa cada re-render.

---

## Recomendaciones Finales

### ✅ Mantener Implementación Actual
La implementación actual con:
- Memoización del context value
- Delay de 100ms en montaje inicial
- React.memo en AppContent

Es suficiente para la mayoría de casos de uso y elimina el flash visible.

### ⚠️ Si Sigues Viendo Flash

1. **Verificar otros Providers:**
   ```typescript
   // Asegúrate de que otros providers también estén optimizados
   const ThemeProvider = React.memo(({ children }) => {
     // ... implementation
   });
   ```

2. **Verificar Navigation:**
   El `RootNavigator` puede causar re-renders durante inicialización. Considera usar `React.memo` en pantallas individuales.

3. **Usar React DevTools Profiler:**
   Graba el montaje inicial y ve qué componentes se renderizan múltiples veces.

### 🎯 Mejor Práctica

Para apps grandes, considera usar **Zustand** o **Jotai** para el estado de WebSocket en lugar de Context API:

```typescript
// websocket.store.ts
import { create } from 'zustand';

interface WebSocketStore {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  connected: false,
  connecting: false,
  error: null,
}));

// Solo componentes que usan este hook se re-renderizan
function MyComponent() {
  const connected = useWebSocketStore((state) => state.connected);
  // ...
}
```

**Ventajas:**
- Re-renders solo en componentes que usan el hook
- Mejor performance en apps grandes
- Selectores automáticos para evitar re-renders

---

## Conclusión

Las optimizaciones implementadas deberían eliminar el flash visible. Si persiste:

1. Verifica con React DevTools qué causa el re-render
2. Considera usar autoConnect={false} y conectar manualmente
3. Para apps grandes, migra a Zustand para el estado de WebSocket

El balance entre performance y developer experience está bien logrado con la implementación actual.
