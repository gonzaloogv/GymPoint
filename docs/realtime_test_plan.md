# Realtime Test Plan

## 1. Configuración Inicial
1. Setear variables:
   - Backend: `REALTIME_UI=on`, `REALTIME_URL=http://localhost:3000`, `REALTIME_TRANSPORT=websocket,polling`.
   - Admin (.env): `VITE_REALTIME_UI=on`, `VITE_REALTIME_URL=http://localhost:3000`.
   - Mobile (.env): `EXPO_PUBLIC_REALTIME_UI=on`, `EXPO_PUBLIC_REALTIME_URL=http://<host>:3000`.
2. Levantar backend (`npm run dev`), admin (`npm run dev`) y mobile (Expo) apuntando al mismo host.
3. Iniciar dos sesiones admin (pestañas A y B), una landing y una app móvil autenticada como usuario de pruebas.

## 2. Landing → Admin (Gym Requests)
1. Desde la landing, enviar una solicitud de gimnasio.
2. En ambas pestañas del admin validar:
   - Aparece una toast “Nueva solicitud recibida”.
   - La tabla “Solicitudes pendientes” inserta la fila al tope sin perder filtros ni paginación.
   - El contador de pendientes en cards/estadísticas aumenta en vivo.

## 3. Admin → Mobile (Upgrade a Premium)
1. En admin, abrir “Usuarios” y promover al usuario de la app móvil a plan Premium.
2. En la app móvil:
   - Mostrar toast “Has recibido Premium”.
   - HomeHeader actualiza badge “Plan Premium” y tokens sin recargar.
   - Perfil abre modal ligero (no bloqueante) y refleja el cambio de plan.
   - `useTokensStore` mantiene el nuevo balance.

## 4. Mobile → Mobile (asistencia, streak, progreso)
1. Desde la app registrar asistencia (check-in) en un gym.
2. Sin salir de la pantalla:
   - Se muestra toast “Asistencia registrada”.
   - WeeklyProgressCard incrementa `current`/`%` sin refrescar.
   - Contadores de streak (Home + ProgressScreen) se actualizan.
   - Tokens disponibles cambian en el encabezado y perfil.
3. Repetir con otra pantalla abierta (p. ej. ProgressScreen) para comprobar que ambas reciben el evento simultáneamente.

## 5. Tokens (compra/gasto)
1. Ejecutar una acción que modifique tokens (compra de Premium con tokens o canje desde admin).
2. Verificar en mobile:
   - Toast “Tokens recibidos” (si delta > 0).
   - Tokens en HomeHeader, Perfil y stores cambian inmediatamente.

## 6. Flag `REALTIME_UI`
1. Poner `REALTIME_UI=off` (backend/admin/mobile).
2. Reiniciar servicios y confirmar:
   - Backend no loguea “WebSocket disponible…”.
   - Admin y mobile no intentan abrir sockets (sin conect errors).
   - La app sigue funcionando con datos tradicionales (fetch / refetch manual).
3. Volver a `on` y repetir pruebas rápidas para asegurar que la reactivación funciona sin reiniciar sesiones.

## 7. Desconexiones y reconexiones
1. Desactivar temporalmente el backend o cortar internet.
2. Verificar que admin/mobile muestran estado desconectado y al volver la red se reconectan y re-sincronizan (`setQueryData` mantiene filtros).

## 8. Smoke Tests posteriores
1. Ejecutar flows sensibles (login, creación de recompensas, etc.) para validar que el flag no rompe lógica preexistente.
2. Revisar logs del backend para confirmar que no hay eventos duplicados (`USER_TOKENS_UPDATED`, `PROGRESS_WEEKLY_UPDATED`, `ATTENDANCE_RECORDED`).
