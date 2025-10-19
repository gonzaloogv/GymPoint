# Daily Challenges – GymPoint Backend & Admin UI

## Resumen rápido
- **Qué son:** retos diarios que los usuarios de la app cumplen para ganar tokens.
- **Dónde viven:** tabla `daily_challenge` (instancias por fecha) y `daily_challenge_template` (plantillas para rotación).
- **Quién los gestiona:** administradores vía API (`/api/admin/daily-challenges`) o desde la pantalla *Daily Challenges* del panel web.
- **Autogeneración:** job `daily-challenge-job` ejecuta `ensureTodayChallenge()` todos los días a las 00:01 UTC (si la rotación está habilitada).

```
[Admin UI / API]
     ↓ (CRUD manual + plantillas)
[daily_challenge] ← auto-rotación → [daily_challenge_template]
     ↑                               ↖
  challenge-service  ← job cron →  daily_challenge_settings
```

---

## Modelo de datos

### `daily_challenge`
| Campo | Descripción |
| --- | --- |
| `challenge_date` | Fecha (UTC) del reto. Única. |
| `is_active` | Permite ocultar un reto sin eliminarlo. |
| `id_template` | FK hacia la plantilla usada (si auto-generado). |
| `auto_generated` | `true` si viene de rotación. |
| `created_by` | Admin que lo creó manualmente (opcional). |

### `daily_challenge_template`
- Contiene datos base (título, tipo, objetivo, tokens, dificultad).
- `rotation_weight` >= 0 determina el peso al elegirlo en la rotación.
- `is_active` controla si participa del sorteo automático.

### `daily_challenge_settings`
- Solo una fila (`id_config = 1`).
- `auto_rotation_enabled` (`true`/`false`).
- `rotation_cron` (string, por ahora informativo).

### Progreso de usuario (`user_daily_challenge`)
- Guarda `progress`, `completed`, `completed_at`, `tokens_earned`.
- Al completar, registra tokens en `token_ledger` (motivo `DAILY_CHALLENGE_COMPLETED`) y genera notificación (`Notification`).

---

## Lógica backend

### `challenge-service`
- `getTodayChallenge(userId)` → reto actual + progreso del usuario.
- `updateProgress(userId, challengeId, value)` → actualiza progreso, marca completado, otorga tokens y notificación.
- `ensureTodayChallenge()`:
  1. Busca si ya hay reto activo con `challenge_date` hoy.
  2. Si no, consulta `daily_challenge_settings`; si la rotación está deshabilitada, sale.
  3. Obtiene plantillas activas (peso > 0) y elige una con rotación ponderada determinística (según día del año).
  4. Crea nuevo `daily_challenge` con `auto_generated = true`, enlazado a la plantilla.

### Job programado (`daily-challenge-job`)
- Cron `1 0 * * *` (00:01 UTC).
- Llama a `ensureTodayChallenge()`.
- Indica en logs si creó reto o si la rotación estaba deshabilitada / sin plantillas.
- Exposición manual vía `runNow()`.

### API pública (`/api/challenges`)
- `GET /api/challenges/today` → usuario app ve reto y su progreso.
- `PUT /api/challenges/:id/progress` → reporta avance; al completar, se otorgan tokens.

### API admin (`/api/admin/daily-challenges`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Lista (filtros `from`, `to`, `include_inactive`). |
| POST | `/` | Crea reto manual para una fecha. |
| GET/PUT/DELETE | `/:id` | Detalle/edición/eliminación de reto. |
| GET | `/templates` | Lista plantillas. |
| POST | `/templates` | Crea plantilla. |
| PUT/DELETE | `/templates/:id` | Edita o elimina plantilla (con validaciones). |
| GET/PUT | `/config/settings` | Consulta/actualiza `auto_rotation_enabled` y `rotation_cron`. |
| POST | `/actions/run` | Fuerza ejecución inmediata de rotación. |

---

## Interfaz admin (GymPoint Panel)
Disponible como pestaña **Daily Challenges**.

### Secciones
1. **Configuración**: toggle de rotación, cron editable, botón “Run rotation now”.
2. **Crear desafío manual**: formulario con fecha, tipo, objetivo, tokens, descripción.
3. **Crear plantilla**: formulario con tipo, peso y dificultad (BEGINNER/INTERMEDIATE/ADVANCED).
4. **Tabla de desafíos programados**: filtros por fecha, opción de incluir inactivos, botones activar/desactivar/eliminar.
5. **Tabla de plantillas**: muestra peso, estado, permite activar/desactivar o eliminar.

### Hooks y repositorio
- `DailyChallengeRepositoryImpl` encapsula las llamadas admin.
- Hooks (`useDailyChallenges`, `useDailyChallengeTemplates`, `useDailyChallengeConfig`, etc.) manejan datos con React Query.
- Página `DailyChallenges.tsx` integra la UI.

---

## Flujo típico
1. **Crear plantillas** con peso de rotación e `is_active = true`.
2. **Verificar configuración** (`auto_rotation_enabled = true`).
3. **Job diario** genera reto si no existe manual.
4. **Reto especial**: crear manualmente para fecha específica; rotación respetará ese reto.
5. **Usuario app** reporta progreso; al completar, se otorgan tokens y notificación.

---

## Troubleshooting
- **Ejecución automática no crea retos:** revisar `daily_challenge_settings.auto_rotation_enabled` y que existan plantillas con `rotation_weight > 0`.
- **No se puede eliminar plantilla:** hay retos que la referencian (`id_template`); eliminarlos primero.
- **Tokens no llegan:** verificar `user_daily_challenge` y `token_ledger` (motivo `DAILY_CHALLENGE_COMPLETED`).
- **Errores de ruta (`Unexpected (...) at pathToRegexp`):** evitar expresiones regulares en rutas admin (`/:id` simple).

---

## Archivos clave
- **Backend**
  - `services/challenge-service.js`
  - `services/admin-daily-challenge-service.js`
  - `controllers/challenge-controller.js`
  - `controllers/admin-daily-challenge-controller.js`
  - `routes/challenge-routes.js`
  - `routes/admin-daily-challenge-routes.js`
  - `jobs/daily-challenge-job.js`
  - Migraciones `20250209-*`
- **Frontend**
  - `src/presentation/pages/DailyChallenges.tsx`
  - `src/data/repositories/DailyChallengeRepositoryImpl.ts`
  - `src/presentation/hooks/useDailyChallenges.ts`
  - Navbar/App updates (`Navbar.tsx`, `App.jsx`)

Con esto deberías tener una referencia completa del funcionamiento del sistema de Daily Challenges.

