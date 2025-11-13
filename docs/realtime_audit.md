# Realtime Audit

## Stack & Dependencies
- **Backend (`backend/node`)**: Node 18 + Express 5, Sequelize, Socket.IO server (`socket.io@4.8.1`). Event bus exposed via `websocket/events/event-emitter.js` but only covers notifications, assistance and admin stats. No feature flag around realtime plumbing yet.
- **Admin (`frontend/gympoint-admin`)**: React 19 + Vite 7 + Tailwind. Data layer uses TanStack Query and Axios. Realtime module (`src/data/api/websocket.service.ts`) wraps `socket.io-client@4.8.1`, but the base URL is hard‑coded to `http://localhost:3000` and there is no env switch.
- **Landing (`frontend/gympoint-landing`)**: Vite + React. Submits gym requests via plain `fetch` to `/api/gym-requests`. No realtime client in place.
- **Mobile (`frontend/gympoint-mobile`)**: Expo 54, React Native 0.81, Zustand stores, TanStack Query, `socket.io-client@4.8.1`, `react-native-toast-message`. Entry point (`App.tsx`) always mounts `WebSocketProvider`.

## Current Behaviour vs. Requirements

| Area | Expectation | Current State |
| --- | --- | --- |
| Landing → Admin gym requests | Admin list should insert the new request and raise a toast without refreshing. | Backend emits `EVENTS.GYM_REQUEST_CREATED`, but `useRealtimeSync` in admin listens on wrong query keys (`['gymRequests', …]` instead of `['gym-requests', …]`), so React Query caches never update. There is also no toast/notification system wired to realtime events. |
| Admin → Mobile premium upgrade | Mobile should show “Has recibido Premium”, update badges/plan instantly. | Backend emits `user:subscription:updated`, mobile hook tries to react but imports a non-existent `@features/profile/...` store and mutates properties (`subscriptionTier`, `isPremium`) that don’t exist on the stored entities. Result: build would fail if hook executed; in practice the hook never runs. |
| Mobile attendance/streak/tokens | Weekly progress card and streak counters must update everywhere immediately. | Backend only emits `assistance:registered` and streak events; there is no event translating weekly frequency stats, so UI has no data to patch. Tokens are written through `tokenLedgerService` but no websocket event fires unless the change goes through `user-service.updateUserTokens`. Stores (`useHomeStore`, `useProgressStore`, `useTokensStore`) expose setters but `useRealtimeSync` neither calls them nor subscribes to streak events. |
| Feature flag | New realtime UX should be guarded by `REALTIME_UI`. | No app (backend, admin, mobile) reads the flag. Websocket URL/transport are static; there are no `REALTIME_URL` / `REALTIME_TRANSPORT` envs. |

## Backend Gaps
1. **No weekly progress events**: `frequencyService.actualizarAsistenciaSemanal` returns the updated goal/assist but nobody emits it. There is also no `progress.weekly.updated` topic to deliver per-user summaries.
2. **Token ledger silent**: `tokenLedgerService.registrarMovimiento` updates balances but never notifies the event bus; only `user-service.updateUserTokens` emits `USER_TOKENS_UPDATED`, so rewards/purchases/attendance never reach clients.
3. **Missing attendance topic**: Requirements mention `attendance.recorded`, but the socket manager only forwards `assistance:registered` to gym rooms, not to the user.
4. **No feature toggle**: `REALTIME_UI` is undefined; websocket plumbing always runs, so we cannot disable the new UX paths independently.

## Admin Gaps
1. **Broken data keys**: All `queryClient.setQueryData` calls use keys (`['gymRequests']`, `['users']`, `['adminStats']`) that differ from the ones defined in hooks (`['gym-requests', status?]`, `['admin','users', params]`, `['admin','stats']`). Therefore caches never update and pagination/filter state is not preserved.
2. **No notification UI**: There is no toast/notification center. The only relevant component is `Alert`, which renders inline banners. Requirement asks for a toast when a request arrives; nothing exists to show it.
3. **Config hard-coded**: `websocket.service.ts` hard-codes base URL and transport, so staging/prod can’t be configured via env.

## Mobile Gaps
1. **Invalid imports/types**: `useRealtimeSync` imports `useProfileStore` from `@features/profile/...` (path does not exist) and references `subscriptionTier`, `premiumSince`, etc. which are not part of the `UserProfile` entity. The hook can’t compile or run.
2. **Stores never patched**: Even if the hook ran, it only touched an undefined store; `useHomeStore`, `useProgressStore`, `useTokensStore`, and `useAuthStore` are unaware of realtime events, so HomeHeader, WeeklyProgressCard, ProgressScreen and profile never update.
3. **No weekly progress / attendance handling**: There is no listener for a progress topic, and the app never subscribes to streak updates globally (only per-gym screens call `useCheckInUpdates`). Weekly goal data is only fetched via HTTP.
4. **No feature flag**: Expo config only exposes `EXPO_PUBLIC_API_BASE_URL`; there is no flag or realtime URL override, so the new behaviour can’t be toggled.

## Landing
- Pure form submission; once backend emits proper events and admin fixes its listener, no landing changes are required besides documenting the flag.

## Risks
- Without tying ledger + frequency events into the event bus, frontends would have to re-fetch entire queries and lose filters.
- Hard-coded URLs prevent deploying realtime to non-local environments.
- Missing feature flag makes it impossible to disable the live UI if regressions surface.

These findings drive the implementation plan: introduce a shared realtime config (flag + URL + transport), extend backend emitters for weekly progress/tokens, fix admin query cache updates + notifications, and retrofit the mobile stores so Home/Profile/Progress screens react instantly.

## Remediations Implementadas
- **Env flags y configuración común**: `REALTIME_UI`, `REALTIME_URL` y `REALTIME_TRANSPORT` disponibles en backend, admin y mobile. Cuando la flag está en `off`, los clientes no intentan conectar y el server evita levantar Socket.IO.
- **Backend**:
  - `token-ledger-service` emite `user:tokens:updated` para todos los movimientos (sin duplicados).
  - `assistance-service` publica `progress:weekly:updated` y `attendance:recorded` con payloads mínimos para parchear stores.
  - `socket-manager` reenvía los nuevos tópicos a las rooms de cada usuario.
- **Admin web**:
  - WebSocket usa las variables nuevas y sólo se conecta si `REALTIME_UI` está activo.
  - `useRealtimeSync` ahora actualiza las mismas query keys que usa TanStack Query y dispara un toast “Nueva solicitud recibida” con un portal liviano.
- **Mobile (Expo)**:
  - Config del provider respeta la flag y evita reconexiones inútiles.
  - `useRealtimeSync` parchea los stores (`useHomeStore`, `useUserProfileStore`, `useProgressStore`, `useTokensStore`, `useAuthStore`) cuando llegan eventos de tokens, plan premium, progreso semanal y asistencia.
  - `Home`/`Profile`/`Progress` reflejan tokens, streak y meta semanal en vivo, y se muestra un aviso “Has recibido Premium” al subir de plan.
