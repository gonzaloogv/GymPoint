ROL
Eres un/a Ingeniero/a Full-Stack senior trabajando DENTRO DE ESTE MONOREPO (landing, admin web, mobile RN/Expo, backend Node+Express). Tu objetivo es lograr ACTUALIZACIONES EN PANTALLA EN VIVO (sin refresh) manteniendo intactas todas las funcionalidades de negocio. Debes adaptarte a la arquitectura existente y estilos:

- Admin & Landing: React + TypeScript + Tailwind + Zustand.
- Mobile: React Native (Expo) + NativeWind.
- Backend: Node + Express.
Primero LEE los `package.json` del root y de cada app/paquete para detectar dependencias reales (socket.io, ws, eventsource, zod, router, etc.), scripts, alias de paths y tooling, y ajústate a eso.

OBJETIVO (UI en vivo, sin refresh)
- Cuando se produzcan eventos de dominio, la UI debe actualizarse automáticamente en todas las pantallas relevantes sin recargar ni navegar ni hacer pull-to-refresh. Conserva filtros, orden, paginación y estado local.
- Si la implementación actual de tiempo real existe (WS/SSE/Socket.IO), arréglala y estandarízala. Si no, implementa la solución mínima viable compatible con el backend Node+Express.

CASOS CLAVE (criterios de aceptación)
1) Landing → Admin (solicitudes):
   - Al crear una gym request desde “landing”, aparece automáticamente una nueva fila en la lista de solicitudes de “admin” (sin refresh, manteniendo orden/filtros/paginación).
   - Dispara un toast no intrusivo “Nueva solicitud recibida” usando el sistema de notificaciones ya existente.

2) Admin → Mobile (premium):
   - Si el admin sube a Premium a un usuario, en Mobile aparece alerta/modal no bloqueante “Has recibido Premium”.
   - Actualiza en vivo plan/badge en HomeScreen y User Profile (y cualquier pantalla que lo muestre).

3) Mobile (asistencia, streak, tokens):
   - Al registrar asistencia, actualiza en vivo la WeeklyProgress Card y el contador de streak en TODAS las pantallas donde aparezcan.
   - Tokens: al gastar o al comprar Premium con tokens, actualiza saldo y plan en HomeScreen y User Profile (y demás pantallas afectadas).
   - Regla general: cualquier vista que consuma estos datos refleja el cambio sin acciones del usuario.

RESTRICCIONES DURAS
- NO cambies lógica de negocio, contratos de endpoints ni esquemas de DB.
- Respeta el diseño existente:
  - Admin/Landing con Tailwind (paleta/utilidades/espaciados).
  - Mobile con NativeWind (clases/tokens ya definidos).
- Cambios mínimos, modulares; nada de refactors masivos.
- Detrás de un feature flag: `REALTIME_UI`.
- Mantén ESLint/Prettier/TSConfig tal como están.

ENFOQUE TÉCNICO (autodetección + implementación)
A) Descubrimiento (OBLIGATORIO):
   1. Lee `package.json` (root + apps) para conocer dependencias reales (p.ej. socket.io-client, ws, eventsource), scripts, workspaces y alias.
   2. Detecta el store actual (Zustand en admin/landing; en mobile autodetecta si usan Zustand/Redux/otro).
   3. Detecta si ya hay capa de tiempo real (ws/socket.io/SSE) y su wiring.
   4. Ubica pantallas clave: 
      - Admin: lista de solicitudes/gym requests.
      - Mobile: HomeScreen, User Profile, WeeklyProgress Card, vistas con tokens/plan/streak.
   5. Verifica auth del transporte (JWT/cookies), reconexión, backoff, heartbeat y segmentación por usuario/sala.

B) Transporte (elige lo MÍNIMO compatible con Node+Express):
   - Si existe Socket.IO/ws estable: consolida en un “Event Bus” cliente tipado con reconexión exponencial con jitter, ping/pong y re-suscripción on focus/app resume.
   - Si no hay nada o es inestable: implementa SSE sencillo con `EventSource` en admin/landing y un wrapper equivalente en RN (o usa websockets si ya están listos). Provee fallback de revalidación focalizada SOLO si el evento falla.
   - No introduzcas librerías pesadas nuevas si no son necesarias. Usa lo que ya trae el monorepo.

C) Contratos de eventos (sin tocar negocio):
   - Define/usa tópicos de dominio mínimos:
     * `gymRequest.created`
     * `user.plan.upgraded` (premium)
     * `attendance.recorded`
     * `user.tokens.updated`
     * `progress.weekly.updated`
   - Payload con ids y campos estrictamente necesarios para parchear estado/caches. Mantén tipos TS; si hay zod, valida con `safeParse`.

D) Backend Node+Express (toques mínimos):
   - Agrega emisores en los puntos de escritura existentes (servicios/controladores) para publicar eventos anteriores.
   - Seguridad: adjunta identidad/tenant/rooms según sea necesario.
   - No cambies rutas REST ni controladores salvo para emitir/autorizar eventos.

E) Frontend (Admin/Landing + Mobile):
   - Crea un módulo `realtime/` por app o uno compartido si ya existe un `packages/*` común.
     * API: `connectRealtime()`, `subscribe(topic, handler)`, `unsubscribe(topic, handler)`.
     * Reconexión con backoff exponencial; listeners de visibilidad (web) y AppState (RN).
   - Integración con Zustand:
     * Expón acciones de “upsert/remove/patch” por entidad (requests, user plan, tokens, progress).
     * Al recibir evento: aplica patch in-place sin romper memoización; si la vista es paginada, inserta solo si cae en el rango visible y mantén orden/filtros.
   - UI:
     * Admin: inserta fila nueva + toast.
     * Mobile: alerta Premium + refresco inmediato de badges/plan; actualización de WeeklyProgress y streak; actualización de tokens/plan.

F) Confiabilidad y DX:
   - Heartbeat/ping, cierre limpio, “offline → resume” (si no hay replay, revalida queries/estado al reconectar).
   - Logs con prefijo `[realtime]` (niveles según `NODE_ENV`).
   - Variables de entorno: `REALTIME_UI=on`, `REALTIME_URL=...`, `REALTIME_TRANSPORT=ws|sse`.
   - Limpieza de listeners al unmount/cambio de pantalla (evita memory leaks).
   - Accesibilidad: toasts/modales no bloqueantes y anunciables.

PLAN DE TRABAJO
1) Auditoría automática + `docs/realtime_audit.md` (mapa de dependencias desde package.json, stores, rutas, sockets, problemas).
2) Infra cliente: `realtime/` (bus agnóstico ws/sse) + hooks (`useRealtimeTopic(topic, handler)`).
3) Integraciones por caso (admin/landing/mobile) conectadas a los eventos arriba.
4) Backend: emisores mínimos en Node+Express.
5) QA: `docs/realtime_test_plan.md` con pasos multi-cliente (2 pestañas admin, 1 landing, 1 RN).
6) Flag y fallback: respetar `REALTIME_UI` y documentar activación.

ENTREGABLES
- Código funcional detrás de `REALTIME_UI`.
- `docs/realtime_audit.md`, `docs/realtime_test_plan.md`, `docs/realtime_howto.md`.
- Commits convencionales, sin romper lint/build/tests.
- `CHANGELOG.md` con resumen.

HEURÍSTICAS
- Prefiere reusar Socket.IO/ws si ya existe; si no, SSE mínimo en Express (mantén CORS y auth).
- Zustand: acciones atómicas y selectores por entidad; evita re-renders globales.
- RN/Expo: maneja AppState (background/foreground) para pausar/reanudar suscripciones.
- No introduzcas nuevas decisiones de diseño (Tailwind/NativeWind: reusa utilidades y tokens existentes).
