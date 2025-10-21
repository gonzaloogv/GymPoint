# Achievements – Admin & Backend Guide

Este documento resume el flujo completo del módulo de logros (achievements) en GymPoint: modelo de datos, endpoints backend y uso del formulario en el panel admin.

---

## 1. Modelo de Datos

### Tablas principales

| Tabla | Descripción |
| --- | --- |
| `achievement_definition` | Catálogo de logros configurables: código, nombre, categoría, métrica, objetivo, icono, metadatos y estado. |
| `user_achievement` | Relación usuario–logro, guarda progreso actual, último origen, estado y fecha de desbloqueo. |
| `user_achievement_event` | Historial de eventos (`PROGRESS`, `UNLOCKED`, `RESET`) para auditoría. |

### Campos destacados de `achievement_definition`

- `code` (string, único): Identificador técnico, se recomienda usar mayúsculas y guión bajo (ej. `STREAK_30`).
- `category`: Uno de `ONBOARDING`, `STREAK`, `FREQUENCY`, `ATTENDANCE`, `ROUTINE`, `CHALLENGE`, `PROGRESS`, `TOKEN`, `SOCIAL`.
- `metric_type`: Describe cómo se calcula el progreso. Opciones:  
  `STREAK_DAYS`, `STREAK_RECOVERY_USED`, `ASSISTANCE_TOTAL`, `FREQUENCY_WEEKS_MET`, `ROUTINE_COMPLETED_COUNT`, `WORKOUT_SESSION_COMPLETED`, `DAILY_CHALLENGE_COMPLETED_COUNT`, `PR_RECORD_COUNT`, `BODY_WEIGHT_PROGRESS`, `TOKEN_BALANCE_REACHED`, `TOKEN_SPENT_TOTAL`, `ONBOARDING_STEP_COMPLETED`.
- `target_value` (int positivo): Umbral para desbloquear el logro.
- `metadata` (JSON opcional):  
  - `token_reward`: entero → tokens a otorgar al desbloquear.  
  - `unlock_message`: string → mensaje personalizado en notificación.
- `icon_url` (string opcional): URL absoluta o path de un icono.
- `is_active`: Controla si se evalúa o no para nuevos usuarios.

### Relaciones clave

- `UserProfile.hasMany(UserAchievement)`
- `AchievementDefinition.hasMany(UserAchievement)`
- `UserAchievement.belongsTo(UserProfile)` y `.belongsTo(AchievementDefinition)`
- `UserAchievement.hasMany(UserAchievementEvent)`

---

## 2. Backend API

### Endpoints (usuarios)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET /api/achievements/me` | Lista progreso del usuario autenticado. Soporta query `category`. |
| `POST /api/achievements/sync` | Recalcula logros para el usuario actual (opcional `category`). |

### Endpoints (admin, requiere token con rol admin)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET /api/achievements/definitions` | Lista definiciones (query: `category`, `includeInactive`). |
| `POST /api/achievements/definitions` | Crea un logro. Reglas de validación: código único, `target_value` entero positivo, categoría y métrica permitidas. |
| `PUT /api/achievements/definitions/:id` | Actualiza un logro; si cambia `target_value`, se sincroniza `progress_denominator` en `user_achievement`. Controla duplicados al modificar el código. |
| `DELETE /api/achievements/definitions/:id` | Elimina la definición y su progreso asociado. Confirmar antes en la UI. |

### Reglas de negocio / validaciones (resumen)
- Código y nombre obligatorios, con máximos de 50 y 120 caracteres respectivamente.
- `target_value` > 0.
- `metadata` debe ser JSON. `token_reward` ≥ 0 (entero) y `unlock_message` texto opcional.
- `category` y `metric_type` deben pertenecer a los enumerados soportados.
- `icon_url` máx. 500 caracteres (opcional).

### Triggers automáticos
- **Asistencias** (`assistance-service`): Actualiza categorías `STREAK`, `ATTENDANCE`, `FREQUENCY`.
- **Desafíos diarios** (`challenge-service`): `CHALLENGE`, `TOKEN`.
- **Sesiones de entrenamiento** (`workout-service`): `ROUTINE`, `PROGRESS`, `TOKEN`.
- Cada trigger llama a `achievement-service.syncAllAchievementsForUser`. Cuando un logro se desbloquea, `achievement-side-effects` envía notificación tipo `ACHIEVEMENT` y aplica recompensas en tokens si corresponde.

---

## 3. Panel Admin (`/achievements`)

### Vista general
- Filtra por categoría y estado (activos/inactivos).
- Búsqueda por nombre, código o descripción.
- Acciones:
  - **Crear** “Nuevo logro”
  - **Editar** desde la lista
  - **Eliminar** (con confirmación)
  - Botón “Actualizar” para reconsultar las definiciones.

### Formulario: campos y propósito

| Campo | Descripción |
| --- | --- |
| **Código** | Identificador técnico en mayúsculas. Úsalo para diferenciar logros en métricas/analytics (ej. `DAILY_30`). |
| **Nombre** | Título legible que verá el usuario. |
| **Descripción** | Texto opcional para detallar el logro en la app. |
| **Categoría** | Agrupa logros para filtros en la app (`STREAK`, `TOKEN`, etc.). |
| **Métrica** | Define cómo se mide el progreso (ver listado de `metric_type`). |
| **Objetivo** (`target_value`) | Valor entero que de debe alcanzar para desbloquear. |
| **Ícono (URL)** | Imagen opcional para el logotipo del logro. Puede ser un path o URL absoluta. |
| **Tokens de recompensa** | Entero ≥ 0. Si se deja en blanco, no otorga tokens. |
| **Mensaje al desbloquear** | Texto opcional que aparecerá en la notificación. |
| **Estado** | Activo/Inactivo. Desactivar lo excluye de cálculos futuros. |

### Flujos soportados
- **Crear logro**: completa el formulario y guarda. Código debe ser único.
- **Editar logro**: actualiza campos existentes. Si modificas `target_value`, los usuarios verán reflejado el nuevo objetivo (se ajusta `progress_denominator`).
- **Eliminar logro**: remueve la definición; se elimina la relación histórica (úsalo con cuidado).

### Feedback y errores
- Notificaciones visuales (Alert) se muestran si algo falla (código duplicado, datos inválidos, red, etc.).
- La UI bloquea enviar mientras se está guardando y mantiene el modal abierto si ocurre error.
- La actualización de la lista invalida automáticamente la caché (`react-query`).

### Reglas/limitaciones actuales
- No hay automatización de tests (pendiente).
- No hay versionado/aprobaciones: cualquier administrador con acceso puede modificar el catálogo.
- Eliminación no se puede deshacer (se recomienda exportar un backup de definiciones antes de limpiar).

---

## 4. Metadatos (`metadata`)

Los campos de `metadata` son opcionales y se almacenan como JSON:

```json
{
  "token_reward": 50,
  "unlock_message": "¡Completaste tu primer mes!"
}
```

Si `token_reward` > 0, se otorgan tokens al desbloquear (motiva a los usuarios). `unlock_message` personaliza la notificación.

---

## 5. Permisos y seguridad
- Todos los endpoints admin requieren `verificarToken` + `verificarAdmin`.
- El panel muestra sólo la información de definiciones; el progreso de usuarios se mantiene intacto cuando se edita un logro.
- El servicio backend valida entradas y protege contra códigos duplicados o parámetros inválidos.

---

## 6. Checklist de uso
1. **Crear logro**: asegúrate de definir código único, categoría, métrica y objetivo.
2. **Configurar recompensa**: opcional, usa `token_reward` y mensaje para reforzar logros clave.
3. **Activar/Inactivar** según campaña o estrategia (inactivos no se calculan).
4. **Editar con cuidado**: cambiar objetivo afecta porcentajes mostrados en la app.
5. **Eliminar** sólo cuando sea necesario y con confirmación (borra progreso).
6. **Actualizar lista** en la UI tras cambios manuales o desde otra sesión.

---

## 7. Futuro / pendientes
- Automatizar pruebas backend (servicio y endpoints) y frontend (formularios/mutaciones).
- Versionado y publicación programada de logros.
- Posible importación/exportación (CSV/JSON) para gestión masiva.

Si encuentras inconsistencias o necesitas soporte adicional, documenta el caso (datos enviados, respuesta API, stacktrace) antes de reportarlo al equipo backend.

