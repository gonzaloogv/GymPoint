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
- **Catálogo de retos reutilizables.** La rotación automática nunca inventa un reto “de la nada”: cada madrugada toma una de estas plantillas y clona sus datos en `daily_challenge`.
- Se pueden preparar tantas plantillas como se desee con distintos objetivos, recompensas y dificultades.
- `rotation_weight` (>= 0) define la frecuencia relativa. Un peso 2 aparecerá el doble de veces que otro peso 1.
- `is_active` = `false` excluye la plantilla del sorteo sin borrarla.
- `created_by` guarda al admin que la registró (opcional), útil para auditoría.

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
1. **Armar la biblioteca**  
   El equipo admin crea varias plantillas acordes a los objetivos del negocio, ajusta `rotation_weight` y mantiene solo las necesarias activas.
2. **Configurar la rotación**  
   En `daily_challenge_settings` se deja `auto_rotation_enabled = true` y se define la hora. El job cron se encargará del resto.
3. **Generación diaria**  
   A las 00:01 UTC `ensureTodayChallenge()` verifica si ya existe un reto para hoy. Si no, elige una plantilla activa, la copia a `daily_challenge` y marca `auto_generated = true`.
4. **Desafíos manuales (one-shot o override)**  
   Si se necesita un reto puntual (por ejemplo, una campaña especial), se crea vía admin UI/API con fecha específica. Ese registro bloquea la rotación para ese día: la plantilla no se usa y el reto manual toma prioridad. Además, se pueden activar/desactivar manualmente en cualquier momento.
5. **Participación del usuario**  
   La app móvil consulta `/api/challenges/today`, muestra el reto vigente y permite enviar progreso. Al completarlo, se emite el movimiento de tokens y la notificación correspondiente.

---

## Desafíos manuales en detalle
- **Uso principal:** campañas, eventos o correcciones puntuales que no deberían depender de la rotación (ej. “Happy Hour de viernes”).
- **Creación:** desde la pantalla admin (formulario “Crear desafío manual”) o `POST /api/admin/daily-challenges` indicando `challenge_date`.
- **Prioridad:** si existe un registro para una fecha determinada, el job lo respeta y no genera otra entrada automática para ese día. Puede convivir con retos auto-generados en fechas distintas.
- **Gestión:** se pueden activar/desactivar, editar o eliminar mientras ningún usuario haya registrado progreso (la API bloquea el borrado si hay filas en `user_daily_challenge`).
- **Campo `created_by`:** permite saber quién lo cargó y distinguirlos de los automáticos (`auto_generated = false`).

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
