# Realtime Events Map

| Evento Socket.IO | Origen (servicio) | Reenvío en `socket-manager` | Clientes / Hooks | Payload (campos clave) |
| --- | --- | --- | --- | --- |
| `gym:request:created` / `approved` / `rejected` | `services/gym-request-service` (`createRequest`, `approveRequest`, `rejectRequest`) | Rooms `admin:gym-requests` | `frontend/gympoint-admin/src/presentation/hooks/useRealtimeSync.ts` | `{ gymRequest, requestId?, gymId?, gym?, reason?, timestamp }` |
| `user:tokens:updated` | `services/token-ledger-service` (`registrarMovimiento`) | Rooms `user:<id>` y `user-tokens:<id>` | Mobile `useRealtimeSync` (Home/Profile/Tokens) | `{ newBalance, previousBalance, delta, reason?, timestamp }` |
| `user:subscription:updated` | `services/user-service.updateUserSubscription` | `user:<id>`, `user-profile:<id>`, `admin:user-management` | Mobile `useRealtimeSync` (plan Premium) y Admin (lista de usuarios) | `{ previousSubscription, newSubscription, isPremium, premiumSince?, premiumExpires?, timestamp }` |
| `user:profile:updated` | `services/user-service.updateUserProfile` | `user:<id>` y `user-profile:<id>` | Mobile `useRealtimeSync` sincroniza perfil/cache | `{ profile, timestamp }` |
| `attendance:recorded` | `services/assistance-service` (`registrarAsistencia`, `verificarAutoCheckIn`) | `user:<id>` | Mobile `useRealtimeSync` (toasts, streak, tokens) | `{ attendanceId, gymId, tokensAwarded?, newBalance?, streak?, timestamp }` |
| `progress:weekly:updated` | `services/assistance-service` → `frequency-service.actualizarAsistenciaSemanal` | `user:<id>` | Mobile `useRealtimeSync` (Home / Progress) | `{ goal, current, achieved, percentage?, weekStart?, weekNumber?, year?, timestamp }` |
| `presence:updated` | `services/assistance-service` (`registrarPresencia`, `verificarAutoCheckIn`) | Rooms `gym:<id>` | Mobile `useGymPresence`, Web clients suscritos a `presence:join-gym` | `{ gymId, currentCount, timestamp }` |
| `data:gyms:updated` | `services/gym-service` (creación/edición/eliminación) | `io.emit` (todos los clientes mobile) | Hooks `useRealtimeSync` (mobile) para invalidar catálogos | `{ action: 'created'|'updated'|'deleted', gym?, timestamp }` |
| `admin:stats:updated` | Servicios que actualizan métricas (p.ej. `admin-service`) | Room `admin:stats` | Admin `useRealtimeSync` (dashboard) | `{ stats, timestamp }` |

> Los eventos que no reciben payload válido son descartados en `socket-manager` con un log `[WebSocket] Invalid payload ...` para evitar estados inconsistentes en los clientes.
