# Achievements Domain Outline

Backend entities and flows supporting user achievements in GymPoint.

## Data sources available
- `Streak` (`value`, `recovery_items`) – current consecutive attendance streak.
- `Frequency` – target weekly frequency per user profile.
- `Assistance` – historical check-ins to the gym.
- `UserRoutine` / `WorkoutSession` – routine enrolment and per-session status (`COMPLETED`).
- `UserDailyChallenge` – daily challenge completion and tokens earned.
- `Progress` & `ProgressExercise` – body metrics and PR-style improvements.
- `TokenLedger` – token earnings/spend tied to business reasons.

## Tables

### `achievement_definition`
Catalogue of achievements.
- `id_achievement_definition` (PK)
- `code` (unique string identifier, e.g. `STREAK_07`)
- `name`, `description`, `category` (`STREAK`, `PR`, `CHALLENGE`, etc.)
- `metric_type` (`STREAK_DAYS`, `ASSISTANCE_TOTAL`, `ROUTINE_COMPLETED`, `PR_COUNT`, ...)
- `target_value` (integer goal)
- `metadata` (JSON with extra info such as `token_reward`, `unlock_message`)
- `icon_url`, `is_active`, timestamps

### `user_achievement`
Links a user profile with the definition and stores progress.
- `id_user_achievement` (PK)
- `id_user_profile` (FK -> `user_profiles`)
- `id_achievement_definition` (FK -> `achievement_definition`)
- `progress_value`, `progress_denominator`
- `unlocked`, `unlocked_at`
- `last_source_type`, `last_source_id`, optional `metadata`
- timestamps

### `user_achievement_event`
History of progress updates (optional for analytics).
- `id_user_achievement_event` (PK)
- `id_user_achievement` (FK)
- `event_type` (`PROGRESS`, `UNLOCKED`, `RESET`)
- `delta`, `snapshot_value`
- `source_type`, `source_id`
- `created_at`

## Key relationships
- `UserProfile.hasMany(UserAchievement)`
- `AchievementDefinition.hasMany(UserAchievement)`
- `UserAchievement.belongsTo(UserProfile)` / `.belongsTo(AchievementDefinition)`
- `UserAchievement.hasMany(UserAchievementEvent)`

## Domain notes
- Progress recomputation is idempotent; `syncAchievementForUser` keeps `progress_value` and `progress_denominator` consistent.
- Unlocking a definition triggers a notification (`Notification` type `ACHIEVEMENT`) and, if configured, a token reward via `TokenLedger`.
- Categories enable filtering (engagement, streaks, etc.) for mobile UI and admin reports.

## API endpoints
- `GET /api/achievements/me` – user progress list (optional category filter).
- `POST /api/achievements/sync` – recompute progress for the user (optional category filter).
- `GET /api/achievements/definitions` – list definitions (admin, supports filters).
- `POST /api/achievements/definitions` – create definition (admin).
- `PUT /api/achievements/definitions/{id}` – update definition (admin).
- `DELETE /api/achievements/definitions/{id}` – remove definition (admin, cascades user progress).

## Auto-sync triggers
- Assistance registered (manual or auto check-in) -> categories `STREAK`, `ATTENDANCE`, `FREQUENCY`.
- Daily challenge completed -> categories `CHALLENGE`, `TOKEN`.
- Workout session completed -> categories `ROUTINE`, `PROGRESS`, `TOKEN`.

Cada trigger usa `achievement-service.syncAllAchievementsForUser` y `achievement-side-effects` para manejar notificaciones y recompensas.

Admin UI: `/achievements` (GymPoint Admin) permite listar, filtrar, crear, editar y eliminar definiciones.

## Pending work
- Automatizar pruebas (unitarias e integración) para los nuevos endpoints admin y los formularios React.



