# Realtime HOWTO

## 1. Variables de entorno

| Ubicación | Variables |
| --- | --- |
| `backend/node/.env` | `REALTIME_UI=on`, `REALTIME_URL=http://localhost:3000`, `REALTIME_TRANSPORT=websocket,polling` |
| `frontend/gympoint-admin/.env` | `VITE_REALTIME_UI=on`, `VITE_REALTIME_URL=http://localhost:3000`, `VITE_REALTIME_TRANSPORT=websocket,polling` |
| `frontend/gympoint-mobile/.env` | `EXPO_PUBLIC_REALTIME_UI=on`, `EXPO_PUBLIC_REALTIME_URL=http://<ip>:3000`, `EXPO_PUBLIC_REALTIME_TRANSPORT=websocket,polling` |

> ⚠️ Cada app expone la flag `REALTIME_UI`. Si se coloca en `off`, no se inicializan sockets ni listeners.

## 2. Backend
1. Arrancar normalmente (`npm run dev`). Si `REALTIME_UI=off`, el log mostrará “WebSocket deshabilitado”.
2. Los servicios relevantes emiten eventos:
   - `token-ledger-service`: `user:tokens:updated`.
   - `assistance-service`: `attendance:recorded` y `progress:weekly:updated`.
3. El `socket-manager` reenvía estos eventos a la room `user:<id>`; no requiere configuración adicional.

## 3. Admin (Vite)
1. Asegurarse de tener `VITE_REALTIME_URL` apuntando al mismo host que el backend (sin `/api`).
2. `RealtimeProvider` se monta dentro del `Layout`, y el hook `useRealtimeSync` actualiza caches de TanStack Query.
3. Para disparar toasts manualmente se puede usar `emitRealtimeToast({ title, description, variant })` desde `presentation/utils/realtimeToast`.

## 4. Mobile (Expo)
1. Establecer `EXPO_PUBLIC_REALTIME_URL` con la IP local accesible desde el dispositivo/emulador.
2. El `WebSocketProvider` respeta la flag: si está en `off`, no se programan reconexiones.
3. `useRealtimeSync` se monta en `App.tsx` y actualiza los stores (`useHomeStore`, `useUserProfileStore`, `useProgressStore`, `useTokensStore`, `useAuthStore`).

## 5. Extender nuevos eventos
1. **Backend**: agregar la constante en `websocket/events/event-emitter.js`, emitir con `emitEvent(EVENTS.<...>, payload)` y escuchar en `socket-manager` para reenviar.
2. **Admin**: suscribirse dentro de `useRealtimeSync` y usar `setQueryData` para parchar el cache correspondiente.
3. **Mobile**: registrar el handler dentro de `useRealtimeSync`, actualizar los stores necesarios y opcionalmente mostrar `Toast`.

## 6. Troubleshooting
- Verificar token vs. ws connection: `websocket/test-client.js` (backend) acepta JWT y permite testear rooms manualmente.
- Logs con prefijo `[WebSocket]` indican reconexiones, `[useRealtimeSync]` reporta eventos recibidos.
- Si hay CORS / transporte inválido, ajustar `REALTIME_TRANSPORT` (ej. `websocket` puro para entornos con proxies restrictivos).

### Problema: Module resolution errors al importar tipos compartidos

**Síntoma**: `Cannot find module '@shared/types/websocket-events.types'`.

**Solución**: Verificá que los `tsconfig.json` incluyan el alias hacia la carpeta `shared/` del monorepo.

- Mobile: en `"compilerOptions.paths"` debe existir `@shared/*`: `["src/shared/*", "../../shared/*"]` y/o `@root/*`: `["../../*"]`.
- Admin: agregar `@shared/*`: `["../../shared/*"]`.
- Reiniciar el dev server (Vite/Expo) para que recoja los nuevos paths.

## 7. Correcciones Recientes y Cómo Probarlas
| Fix | Descripción | Verificación |
| --- | --- | --- |
| Toasts de tokens en mobile | `useRealtimeSync` ahora interpola correctamente `+${delta}` y el archivo importa `React` para `useWebSocketStatus`. | Registrar un movimiento de tokens (p. ej. otorgar tokens desde admin) y comprobar que la app mobile muestra `+N tokens` sin `NaN` ni warnings. |
| Cache de solicitudes en admin | `useRealtimeSync` usa los mismos query keys que las `useQuery` y también invalida `['gym-requests']`, `['admin','users']` y `['admin','stats']`. | Abrir dos pestañas del panel → crear una solicitud desde la landing → ambas pestañas muestran la fila + toast sin refrescar. |
| WebSocket mobile más liviano | Se eliminó el polling de tokens cada 2 s y la reconexión depende de AppState/desconexiones. | Conectar la app, dejarla en background 30 s y volver: se reconecta sin logs constantes ni consumo inusual. |
| Progreso semanal y presencia | `assistance-service` emite `progress:weekly:updated`, `attendance:recorded` y ahora también `presence:updated`; la app mobile parchea `useHomeStore`. | Hacer check-in (manual o auto) → Home y Progress actualizan la meta semanal/streak; si hay un premium mirando presencia del mismo gym, verá el contador ajustarse. |
| Tipado compartido | `shared/types/websocket-events.types.ts` describe los payloads y es consumido por mobile/admin; `socket-manager` valida datos antes de emitir. | Ejecutar `npm run type-check` en admin/mobile para asegurarse de que las importaciones comparten la misma interfaz y revisar logs del backend ante payload inválido. |
