# Inventario de Modelos - GymPoint Backend

**Última actualización:** 2025-01-22
**Total de modelos:** 50
**ORM:** Sequelize 6
**Base de datos:** MySQL

---

## Índice de Contenido

1. [Modelos de Autenticación](#autenticación)
2. [Modelos de Usuarios](#usuarios)
3. [Modelos de Gimnasios](#gimnasios)
4. [Modelos de Actividad Física](#actividad-física)
5. [Modelos de Gamificación](#gamificación)
6. [Modelos de Pagos](#pagos)
7. [Modelos de Notificaciones](#notificaciones)
8. [Resumen Estadístico](#resumen-estadístico)
9. [Diagrama de Relaciones](#diagrama-de-relaciones)
10. [Riesgos de Seguridad](#riesgos-de-seguridad)

---

## Autenticación

### 1. Account
**Tabla:** `accounts` | **PK:** `id_account` (AUTO_INCREMENT)

**Campos principales:**
- `email` (STRING 100, UNIQUE, NOT NULL)
- `password_hash` (STRING 255, NULLABLE)
- `auth_provider` (ENUM: local, google | DEFAULT: local)
- `google_id` (STRING 255, UNIQUE, NULLABLE)
- `email_verified` (BOOLEAN | DEFAULT: false)
- `is_active` (BOOLEAN | DEFAULT: true)
- `last_login` (DATE, NULLABLE)

**Índices:** email, google_id, is_active
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- 1:N → AccountRole
- 1:1 → UserProfile
- 1:1 → AdminProfile
- 1:N → RefreshToken

---

### 2. AccountRole
**Tabla:** `account_roles` | **PK:** `id_account_role` (AUTO_INCREMENT)

**Campos principales:**
- `id_account` (INTEGER, FK → accounts, NOT NULL)
- `id_role` (INTEGER, FK → roles, NOT NULL)
- `assigned_at` (DATE | DEFAULT: NOW)

**UK:** `(id_account, id_role)` - unique_account_role
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Account (CASCADE/CASCADE)
- N:1 → Role (CASCADE/CASCADE)

---

### 3. Role
**Tabla:** `roles` | **PK:** `id_role` (AUTO_INCREMENT)

**Campos principales:**
- `role_name` (STRING 50, UNIQUE, NOT NULL)
- `description` (STRING 255, NULLABLE)

**UK:** role_name
**Timestamps:** created_at
**Soft Delete:** NO

**Constantes:** ROLES = {USER, ADMIN}

---

### 4. RefreshToken
**Tabla:** `refresh_token` | **PK:** `id_refresh_token` (AUTO_INCREMENT)

**Campos principales:**
- `id_account` (INTEGER, FK → accounts, NOT NULL)
- `token` (STRING 500, UNIQUE, NOT NULL)
- `expires_at` (DATE, NOT NULL)
- `is_revoked` (BOOLEAN | DEFAULT: false)

**UK:** token
**Índices:** idx_refresh_token_account, idx_refresh_token_token, idx_refresh_token_expiration
**Timestamps:** created_at
**Soft Delete:** NO

**Instance Methods:** isExpired(), isValid()

**Asociaciones:**
- N:1 → Account (CASCADE/CASCADE)

---

### 5. AccountDeletionRequest
**Tabla:** `account_deletion_request` | **PK:** `id_deletion_request` (AUTO_INCREMENT)

**Campos principales:**
- `id_account` (INTEGER, FK → accounts, NOT NULL)
- `reason` (TEXT, NULLABLE)
- `status` (ENUM: PENDING, APPROVED, REJECTED, COMPLETED | DEFAULT: PENDING)
- `requested_at` (DATE | DEFAULT: NOW)
- `processed_at` (DATE, NULLABLE)
- `processed_by` (INTEGER, FK → admin_profiles, NULLABLE)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_deletion_request_account_status, idx_deletion_request_status_date
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Account (CASCADE/CASCADE)
- N:1 → AdminProfile (SET NULL/CASCADE)

---

## Usuarios

### 6. UserProfile
**Tabla:** `user_profiles` | **PK:** `id_user_profile` (AUTO_INCREMENT)

**Campos principales:**
- `id_account` (INTEGER, FK → accounts, UNIQUE, NOT NULL)
- `name` (STRING 50, NOT NULL)
- `lastname` (STRING 50, NOT NULL)
- `gender` (ENUM: M, F, O | DEFAULT: O)
- `birth_date` (DATEONLY, NULLABLE)
- `locality` (STRING 100, NULLABLE)
- `app_tier` (ENUM: FREE, PREMIUM | DEFAULT: FREE)
- `premium_since` (DATE, NULLABLE)
- `premium_expires` (DATE, NULLABLE)
- `tokens` (INTEGER | DEFAULT: 0)
- `profile_picture_url` (STRING 500, NULLABLE)

**UK:** id_account
**Índices:** idx_user_profiles_account, idx_user_profiles_app_tier, idx_user_profiles_premium_expires, idx_user_profiles_tokens, idx_user_profiles_deleted
**Timestamps:** created_at, updated_at
**Soft Delete:** YES - paranoid: true, deleted_at

**Constantes:** APP_TIERS = {FREE, PREMIUM}

**Asociaciones:**
- 1:1 → Account (CASCADE/CASCADE)
- 1:N → Assistance
- 1:1 → Frequency
- 1:1 → Streak
- 1:N → Progress
- 1:N → UserRoutine
- 1:N → WorkoutSession
- M:N → Gym (via UserFavoriteGym)

---

### 7. AdminProfile
**Tabla:** `admin_profiles` | **PK:** `id_admin_profile` (AUTO_INCREMENT)

**Campos principales:**
- `id_account` (INTEGER, FK → accounts, UNIQUE, NOT NULL)
- `name` (STRING 50, NOT NULL)
- `lastname` (STRING 50, NOT NULL)
- `department` (STRING 100, NULLABLE)
- `notes` (TEXT, NULLABLE)

**UK:** id_account
**Índices:** idx_admin_profiles_account
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- 1:1 → Account (CASCADE/CASCADE)

---

### 8. UserDeviceToken
**Tabla:** `user_device_token` | **PK:** `id_device_token` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `token` (STRING 500, UNIQUE, NOT NULL)
- `platform` (ENUM: IOS, ANDROID, WEB)
- `device_id` (STRING 255, NULLABLE)
- `is_active` (BOOLEAN | DEFAULT: true)
- `last_used_at` (DATE, NULLABLE)

**UK:** token
**Índices:** idx_device_token_user_active, idx_device_token_token
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)

---

### 9. UserBodyMetric
**Tabla:** `user_body_metrics` | **PK:** `id_metric` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `date` (DATEONLY, NOT NULL)
- `weight_kg` (DECIMAL 5,2 | NULLABLE)
- `height_cm` (DECIMAL 5,2 | NULLABLE)
- `body_fat_percentage` (DECIMAL 4,2 | NULLABLE)
- `muscle_mass_kg` (DECIMAL 5,2 | NULLABLE)
- `bmi` (DECIMAL 4,2 | NULLABLE)
- `waist_cm` (DECIMAL 5,2 | NULLABLE)
- `chest_cm` (DECIMAL 5,2 | NULLABLE)
- `arms_cm` (DECIMAL 5,2 | NULLABLE)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_body_metrics_user_date
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)

---

### 10. UserNotificationSetting
**Tabla:** `user_notification_settings` | **PK:** `id_setting` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, UNIQUE, NOT NULL)
- `reminders_enabled` (BOOLEAN | DEFAULT: true)
- `achievements_enabled` (BOOLEAN | DEFAULT: true)
- `rewards_enabled` (BOOLEAN | DEFAULT: true)
- `gym_updates_enabled` (BOOLEAN | DEFAULT: true)
- `payment_enabled` (BOOLEAN | DEFAULT: true)
- `social_enabled` (BOOLEAN | DEFAULT: true)
- `system_enabled` (BOOLEAN | DEFAULT: true)
- `challenge_enabled` (BOOLEAN | DEFAULT: true)
- `push_enabled` (BOOLEAN | DEFAULT: true)
- `email_enabled` (BOOLEAN | DEFAULT: false)
- `quiet_hours_start` (TIME, NULLABLE)
- `quiet_hours_end` (TIME, NULLABLE)

**UK:** id_user_profile
**Índices:** idx_notif_settings_user (UNIQUE)
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- 1:1 → UserProfile (CASCADE/CASCADE)

---

## Gimnasios

### 11. Gym
**Tabla:** `gym` | **PK:** `id_gym` (AUTO_INCREMENT)

**Campos principales:**
- `name` (STRING 100, NOT NULL)
- `description` (TEXT, NOT NULL)
- `city` (STRING 50, NOT NULL)
- `address` (STRING 100, NOT NULL)
- `latitude` (DECIMAL 10,8 | NOT NULL)
- `longitude` (DECIMAL 11,8 | NOT NULL)
- `phone` (STRING 20, NULLABLE)
- `whatsapp` (STRING 20, NULLABLE)
- `email` (STRING 100, NULLABLE)
- `website` (STRING 255, NULLABLE)
- `logo_url` (STRING 500, NULLABLE)
- `photo_url` (STRING 500, NULLABLE)
- `social_media` (JSON, NULLABLE)
- `equipment` (JSON, NULLABLE)
- `services` (JSON, NULLABLE)
- `instagram` (STRING 100, NULLABLE)
- `facebook` (STRING 100, NULLABLE)
- `google_maps_url` (STRING 500, NULLABLE)
- `max_capacity` (INTEGER, NULLABLE)
- `area_sqm` (DECIMAL 10,2 | NULLABLE)
- `verified` (BOOLEAN | DEFAULT: false)
- `featured` (BOOLEAN | DEFAULT: false)
- `month_price` (DOUBLE, NULLABLE)
- `week_price` (DOUBLE, NULLABLE)
- `registration_date` (DATE | DEFAULT: NOW)
- `rules` (JSON | DEFAULT: '[]')
- `auto_checkin_enabled` (BOOLEAN | DEFAULT: true)
- `geofence_radius_meters` (INTEGER | DEFAULT: 150, NOT NULL)
- `min_stay_minutes` (INTEGER | DEFAULT: 10, NOT NULL)

**Índices:** idx_gym_city, idx_gym_verified_featured, idx_gym_location, idx_gym_deleted, idx_gym_instagram
**Timestamps:** created_at, updated_at
**Soft Delete:** YES - paranoid: true, deleted_at

**Asociaciones:**
- 1:N → GymSchedule
- 1:N → GymSpecialSchedule
- 1:N → GymReview
- 1:1 → GymRatingStats
- M:N → GymType (via GymGymType)
- M:N → GymAmenity (via GymGymAmenity)
- M:N → UserProfile (via UserFavoriteGym)

---

### 12. GymType
**Tabla:** `gym_type` | **PK:** `id_type` (AUTO_INCREMENT)

**Campos principales:**
- `name` (STRING 50, UNIQUE, NOT NULL)
- `description` (TEXT, NULLABLE)

**UK:** name
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- M:N → Gym (via GymGymType)

---

### 13. GymAmenity
**Tabla:** `gym_amenity` | **PK:** `id_amenity` (AUTO_INCREMENT)

**Campos principales:**
- `name` (STRING 100, UNIQUE, NOT NULL)
- `category` (STRING 50, NULLABLE)
- `icon_name` (STRING 50, NULLABLE)

**UK:** name
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- M:N → Gym (via GymGymAmenity)

---

### 14. GymGymType
**Tabla:** `gym_gym_type` | **PK:** COMPOSITE (id_gym, id_type)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `id_type` (INTEGER, FK → gym_type, NOT NULL)

**Índices:** idx_gym_type
**Timestamps:** NO
**Soft Delete:** NO

---

### 15. GymGymAmenity
**Tabla:** `gym_gym_amenity` | **PK:** COMPOSITE (id_gym, id_amenity)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `id_amenity` (INTEGER, FK → gym_amenity, NOT NULL)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_gym_amenity_amenity
**Timestamps:** NO
**Soft Delete:** NO

---

### 16. GymSchedule
**Tabla:** `gym_schedule` | **PK:** `id_schedule` (AUTO_INCREMENT)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `day_of_week` (TINYINT, NOT NULL) - 0=Domingo, 1=Lunes..., 6=Sábado
- `open_time` (TIME, NOT NULL)
- `close_time` (TIME, NOT NULL)
- `is_closed` (BOOLEAN | DEFAULT: false)

**Índices:** idx_gym_schedule_gym_day
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Gym (CASCADE/CASCADE)

---

### 17. GymSpecialSchedule
**Tabla:** `gym_special_schedule` | **PK:** `id_special_schedule` (AUTO_INCREMENT)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `date` (DATEONLY, NOT NULL)
- `open_time` (TIME, NULLABLE)
- `close_time` (TIME, NULLABLE)
- `is_closed` (BOOLEAN | DEFAULT: false)
- `reason` (STRING 255, NULLABLE)

**UK:** `(id_gym, date)` - idx_gym_special_schedule_gym_date
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Gym (CASCADE/CASCADE)

---

### 18. GymReview
**Tabla:** `gym_review` | **PK:** `id_review` (AUTO_INCREMENT)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `rating` (DECIMAL 2,1 | NOT NULL)
- `title` (STRING 100, NULLABLE)
- `comment` (TEXT, NULLABLE)
- `cleanliness_rating` (TINYINT, NULLABLE)
- `equipment_rating` (TINYINT, NULLABLE)
- `staff_rating` (TINYINT, NULLABLE)
- `value_rating` (TINYINT, NULLABLE)
- `is_verified` (BOOLEAN | DEFAULT: false)
- `helpful_count` (INTEGER | DEFAULT: 0)
- `reported` (BOOLEAN | DEFAULT: false)

**UK:** `(id_user_profile, id_gym)` - uniq_user_gym_review
**Índices:** uniq_user_gym_review, idx_gym_rating, idx_review_created_at
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Gym (CASCADE/CASCADE)
- N:1 → UserProfile (CASCADE/CASCADE)

---

### 19. GymRatingStats
**Tabla:** `gym_rating_stats` | **PK:** `id_gym` (FK a gym)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, PK, NOT NULL)
- `avg_rating` (DECIMAL 3,2 | DEFAULT: 0)
- `total_reviews` (INTEGER | DEFAULT: 0)
- `rating_5_count` (INTEGER | DEFAULT: 0)
- `rating_4_count` (INTEGER | DEFAULT: 0)
- `rating_3_count` (INTEGER | DEFAULT: 0)
- `rating_2_count` (INTEGER | DEFAULT: 0)
- `rating_1_count` (INTEGER | DEFAULT: 0)
- `avg_cleanliness` (DECIMAL 3,2 | DEFAULT: 0)
- `avg_equipment` (DECIMAL 3,2 | DEFAULT: 0)
- `avg_staff` (DECIMAL 3,2 | DEFAULT: 0)
- `avg_value` (DECIMAL 3,2 | DEFAULT: 0)
- `last_review_date` (DATE, NULLABLE)
- `updated_at` (DATE | DEFAULT: NOW)

**Índices:** idx_gym_stats_rating
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- 1:1 → Gym (CASCADE/CASCADE)

---

### 20. UserFavoriteGym
**Tabla:** `user_favorite_gym` | **PK:** COMPOSITE (id_user_profile, id_gym)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `created_at` (DATE | DEFAULT: NOW)

**Índices:** idx_favorite_gym
**Timestamps:** NO
**Soft Delete:** NO

---

### 21. UserGym
**Tabla:** `user_gym` | **PK:** `id_user_gym` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `subscription_plan` (ENUM: MONTHLY, WEEKLY, DAILY, ANNUAL | NULLABLE)
- `subscription_start` (DATEONLY, NULLABLE)
- `subscription_end` (DATEONLY, NULLABLE)
- `is_active` (BOOLEAN | DEFAULT: true)

**UK:** `(id_user_profile, id_gym)` - idx_user_gym_user_gym
**Índices:** idx_user_gym_user_gym (UNIQUE), idx_user_gym_active_end
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

---

## Actividad Física

### 22. Assistance
**Tabla:** `assistance` | **PK:** `id_assistance` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `date` (DATEONLY, NOT NULL)
- `check_in_time` (TIME, NOT NULL)
- `check_out_time` (TIME, NULLABLE)
- `duration_minutes` (INTEGER, NULLABLE)
- `auto_checkin` (BOOLEAN | DEFAULT: false)
- `distance_meters` (DECIMAL 6,2 | NULLABLE)
- `verified` (BOOLEAN | DEFAULT: false)

**Índices:** idx_assistance_user_date, idx_assistance_gym_date, idx_assistance_auto_date, idx_assistance_duration
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Gym (CASCADE/CASCADE)

---

### 23. Presence
**Tabla:** `presence` | **PK:** `id_presence` (BIGINT, AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `first_seen_at` (DATE, NOT NULL)
- `last_seen_at` (DATE, NOT NULL)
- `exited_at` (DATE, NULLABLE)
- `status` (ENUM: DETECTING, CONFIRMED, EXITED | DEFAULT: DETECTING)
- `converted_to_assistance` (BOOLEAN | DEFAULT: false)
- `id_assistance` (INTEGER, FK → assistance, NULLABLE)
- `distance_meters` (DECIMAL 6,2 | NULLABLE)
- `accuracy_meters` (DECIMAL 6,2 | NULLABLE)
- `location_updates_count` (INTEGER | DEFAULT: 1)

**Índices:** idx_presence_user_gym, idx_presence_status, idx_presence_assistance
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Gym (CASCADE/CASCADE)
- N:1 → Assistance (SET NULL/CASCADE)

---

### 24. Frequency
**Tabla:** `frequency` | **PK:** `id_frequency` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `goal` (INTEGER | DEFAULT: 3)
- `assist` (INTEGER | DEFAULT: 0)
- `achieved_goal` (INTEGER | DEFAULT: 0)
- `week_start_date` (DATEONLY, NULLABLE)

**Índices:** idx_frequency_user, idx_frequency_week
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)

---

### 25. FrequencyHistory
**Tabla:** `frequency_history` | **PK:** `id_history` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, NOT NULL)
- `week_start_date` (DATEONLY, NOT NULL)
- `week_end_date` (DATEONLY, NOT NULL)
- `goal` (INTEGER, NOT NULL)
- `achieved` (INTEGER, NOT NULL)
- `goal_met` (BOOLEAN | DEFAULT: false)

**UK:** `(id_user_profile, week_start_date)` - idx_frequency_history_user_week
**Timestamps:** created_at
**Soft Delete:** NO

---

### 26. Streak
**Tabla:** `streak` | **PK:** `id_streak` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, UNIQUE, NOT NULL)
- `id_frequency` (INTEGER, FK → frequency, NOT NULL)
- `value` (INTEGER | DEFAULT: 0)
- `last_value` (INTEGER | DEFAULT: 0)
- `max_value` (INTEGER | DEFAULT: 0)
- `recovery_items` (INTEGER | DEFAULT: 0)
- `last_assistance_date` (DATEONLY, NULLABLE)

**UK:** id_user_profile
**Índices:** idx_streak_user_unique, idx_streak_frequency, idx_streak_value
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- 1:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Frequency (CASCADE/CASCADE)

---

### 27. Exercise
**Tabla:** `exercise` | **PK:** `id_exercise` (AUTO_INCREMENT)

**Campos principales:**
- `exercise_name` (STRING 100, NOT NULL)
- `muscular_group` (STRING 100, NOT NULL)
- `secondary_muscles` (JSON, NULLABLE)
- `description` (TEXT, NULLABLE)
- `equipment_needed` (JSON, NULLABLE)
- `difficulty_level` (ENUM: BEGINNER, INTERMEDIATE, ADVANCED | NULLABLE)
- `video_url` (STRING 500, NULLABLE)
- `created_by` (INTEGER, FK → user_profiles, NULLABLE)

**Índices:** idx_exercise_muscle_group, idx_exercise_difficulty, idx_exercise_deleted
**Timestamps:** created_at, updated_at
**Soft Delete:** YES - paranoid: true, deleted_at

**Asociaciones:**
- N:1 → UserProfile (SET NULL/CASCADE)

---

### 28. Routine
**Tabla:** `routine` | **PK:** `id_routine` (AUTO_INCREMENT)

**Campos principales:**
- `name` (STRING 100, NOT NULL)
- `description` (TEXT, NULLABLE)
- `created_by` (INTEGER, FK → user_profiles, NULLABLE)
- `is_template` (BOOLEAN | DEFAULT: false)
- `classification` (STRING 50, NULLABLE)
- `recommended_for` (ENUM: BEGINNER, INTERMEDIATE, ADVANCED | NULLABLE)
- `template_order` (INTEGER | DEFAULT: 0)

**Índices:** idx_routine_template, idx_routine_created_by, idx_routine_deleted
**Timestamps:** created_at, updated_at
**Soft Delete:** YES - paranoid: true, deleted_at

**Asociaciones:**
- N:1 → UserProfile (SET NULL/CASCADE)
- 1:N → RoutineDay

---

### 29. RoutineDay
**Tabla:** `routine_day` | **PK:** `id_routine_day` (AUTO_INCREMENT)

**Campos principales:**
- `id_routine` (INTEGER, FK → routine, NOT NULL)
- `day_number` (INTEGER, NOT NULL)
- `day_name` (STRING 100, NULLABLE)
- `description` (TEXT, NULLABLE)
- `rest_day` (BOOLEAN | DEFAULT: false)

**UK:** `(id_routine, day_number)` - uniq_routine_day_number
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Routine (CASCADE/CASCADE)
- 1:N → RoutineExercise

---

### 30. RoutineExercise
**Tabla:** `routine_exercise` | **PK:** `id_routine_exercise` (AUTO_INCREMENT)

**Campos principales:**
- `id_routine_day` (INTEGER, FK → routine_day, NOT NULL)
- `id_exercise` (INTEGER, FK → exercise, NOT NULL)
- `exercise_order` (INTEGER | DEFAULT: 0)
- `sets` (INTEGER, NULLABLE)
- `reps` (INTEGER, NULLABLE)
- `rest_seconds` (INTEGER, NULLABLE)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_routine_exercise_day_order, idx_routine_exercise_exercise
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → RoutineDay (CASCADE/CASCADE)
- N:1 → Exercise (CASCADE/CASCADE)

---

### 31. UserRoutine
**Tabla:** `user_routine` | **PK:** `id_user_routine` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_routine` (INTEGER, FK → routine, NOT NULL)
- `is_active` (BOOLEAN | DEFAULT: true)
- `started_at` (DATE | DEFAULT: NOW)
- `completed_at` (DATE, NULLABLE)

**Índices:** idx_user_routine_user_active
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Routine (CASCADE/CASCADE)

---

### 32. WorkoutSession
**Tabla:** `workout_session` | **PK:** `id_workout_session` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_routine` (INTEGER, FK → routine, NULLABLE)
- `id_routine_day` (INTEGER, FK → routine_day, NULLABLE)
- `status` (ENUM: IN_PROGRESS, COMPLETED, CANCELLED | DEFAULT: IN_PROGRESS)
- `started_at` (DATE, NOT NULL)
- `ended_at` (DATE, NULLABLE)
- `duration_seconds` (INTEGER, NULLABLE)
- `total_sets` (INTEGER | DEFAULT: 0)
- `total_reps` (INTEGER | DEFAULT: 0)
- `total_weight` (DECIMAL 12,2 | DEFAULT: 0)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_workout_session_user_status, idx_workout_session_started
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Routine (SET NULL/CASCADE)
- N:1 → RoutineDay (SET NULL/CASCADE)

---

### 33. WorkoutSet
**Tabla:** `workout_set` | **PK:** `id_workout_set` (AUTO_INCREMENT)

**Campos principales:**
- `id_workout_session` (INTEGER, FK → workout_session, NOT NULL)
- `id_exercise` (INTEGER, FK → exercise, NOT NULL)
- `set_number` (INTEGER, NOT NULL)
- `reps` (INTEGER, NULLABLE)
- `weight_kg` (DECIMAL 6,2 | NULLABLE)
- `duration_seconds` (INTEGER, NULLABLE)
- `rest_seconds` (INTEGER, NULLABLE)
- `is_pr` (BOOLEAN | DEFAULT: false)
- `notes` (TEXT, NULLABLE)

**Índices:** idx_workout_set_session, idx_workout_set_exercise_pr
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → WorkoutSession (CASCADE/CASCADE)
- N:1 → Exercise (CASCADE/CASCADE)

---

### 34. Progress
**Tabla:** `progress` | **PK:** `id_progress` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `date` (DATEONLY, NOT NULL)
- `total_weight_lifted` (DECIMAL 12,2 | NULLABLE)
- `total_reps` (INTEGER, NULLABLE)
- `total_sets` (INTEGER, NULLABLE)
- `notes` (TEXT, NULLABLE)

**UK:** `(id_user_profile, date)` - idx_progress_user_date
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- M:N → Exercise (via ProgressExercise)

---

### 35. ProgressExercise
**Tabla:** `progress_exercise` | **PK:** `id_progress_exercise` (AUTO_INCREMENT)

**Campos principales:**
- `id_progress` (INTEGER, FK → progress, NOT NULL)
- `id_exercise` (INTEGER, FK → exercise, NOT NULL)
- `max_weight` (DECIMAL 6,2 | NULLABLE)
- `max_reps` (INTEGER, NULLABLE)
- `total_volume` (DECIMAL 10,2 | NULLABLE)

**Índices:** idx_progress_exercise_progress, idx_progress_exercise_max
**Timestamps:** NO
**Soft Delete:** NO

---

## Gamificación

### 36. AchievementDefinition
**Tabla:** `achievement_definition` | **PK:** `id_achievement_definition` (AUTO_INCREMENT)

**Campos principales:**
- `code` (STRING 50, UNIQUE, NOT NULL)
- `name` (STRING 120, NOT NULL)
- `description` (TEXT, NULLABLE)
- `category` (ENUM: ONBOARDING, STREAK, FREQUENCY, ATTENDANCE, ROUTINE, CHALLENGE, PROGRESS, TOKEN, SOCIAL | DEFAULT: ONBOARDING)
- `metric_type` (ENUM: STREAK_DAYS, STREAK_RECOVERY_USED, ASSISTANCE_TOTAL, FREQUENCY_WEEKS_MET, ROUTINE_COMPLETED_COUNT, WORKOUT_SESSION_COMPLETED, DAILY_CHALLENGE_COMPLETED_COUNT, PR_RECORD_COUNT, BODY_WEIGHT_PROGRESS, TOKEN_BALANCE_REACHED, TOKEN_SPENT_TOTAL, ONBOARDING_STEP_COMPLETED)
- `target_value` (INTEGER, NOT NULL)
- `metadata` (JSON, NULLABLE)
- `icon_url` (STRING 500, NULLABLE)
- `is_active` (BOOLEAN | DEFAULT: true)

**UK:** code
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

---

### 37. UserAchievement
**Tabla:** `user_achievement` | **PK:** `id_user_achievement` (BIGINT, AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_achievement_definition` (INTEGER, FK → achievement_definition, NOT NULL)
- `progress_value` (INTEGER | DEFAULT: 0)
- `progress_denominator` (INTEGER, NULLABLE)
- `unlocked` (BOOLEAN | DEFAULT: false)
- `unlocked_at` (DATE, NULLABLE)
- `last_source_type` (STRING 50, NULLABLE)
- `last_source_id` (BIGINT, NULLABLE)
- `metadata` (JSON, NULLABLE)

**UK:** `(id_user_profile, id_achievement_definition)` - uniq_user_achievement_definition
**Índices:** uniq_user_achievement_definition, idx_user_achievement_user_status
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → AchievementDefinition (CASCADE/CASCADE)

---

### 38. UserAchievementEvent
**Tabla:** `user_achievement_event` | **PK:** `id_user_achievement_event` (BIGINT, AUTO_INCREMENT)

**Campos principales:**
- `id_user_achievement` (BIGINT, FK → user_achievement, NOT NULL)
- `event_type` (ENUM: PROGRESS, UNLOCKED, RESET)
- `delta` (INTEGER, NULLABLE)
- `snapshot_value` (INTEGER, NOT NULL)
- `source_type` (STRING 50, NULLABLE)
- `source_id` (BIGINT, NULLABLE)
- `metadata` (JSON, NULLABLE)
- `created_at` (DATE | DEFAULT: NOW)

**Índices:** idx_user_achievement_event_timeline
**Timestamps:** NO
**Soft Delete:** NO

**Constantes:** EVENT_TYPES = {PROGRESS, UNLOCKED, RESET}

**Asociaciones:**
- N:1 → UserAchievement (CASCADE/CASCADE)

---

### 39. DailyChallenge
**Tabla:** `daily_challenge` | **PK:** `id_challenge` (AUTO_INCREMENT)

**Campos principales:**
- `challenge_date` (DATEONLY, UNIQUE, NOT NULL)
- `title` (STRING 100, NOT NULL)
- `description` (TEXT, NULLABLE)
- `challenge_type` (ENUM: MINUTES, EXERCISES, FREQUENCY)
- `target_value` (INTEGER, NOT NULL)
- `target_unit` (STRING 20, NULLABLE)
- `tokens_reward` (INTEGER | DEFAULT: 10)
- `difficulty` (ENUM: EASY, MEDIUM, HARD | DEFAULT: MEDIUM)
- `id_template` (INTEGER, FK → daily_challenge_template, NULLABLE)
- `auto_generated` (BOOLEAN | DEFAULT: false)
- `created_by` (INTEGER, FK → admin_profiles, NULLABLE)
- `is_active` (BOOLEAN | DEFAULT: true)

**UK:** challenge_date
**Índices:** idx_daily_challenge_date_active
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → DailyChallengeTemplate (SET NULL/CASCADE)
- N:1 → AdminProfile (SET NULL/CASCADE)

---

### 40. DailyChallengeTemplate
**Tabla:** `daily_challenge_template` | **PK:** `id_template` (AUTO_INCREMENT)

**Campos principales:**
- `title` (STRING 100, NOT NULL)
- `description` (TEXT, NULLABLE)
- `challenge_type` (ENUM: MINUTES, EXERCISES, FREQUENCY)
- `target_value` (INTEGER, NOT NULL)
- `target_unit` (STRING 20, NULLABLE)
- `tokens_reward` (INTEGER | DEFAULT: 10)
- `difficulty` (ENUM: EASY, MEDIUM, HARD | DEFAULT: MEDIUM)
- `rotation_weight` (INTEGER | DEFAULT: 1)
- `is_active` (BOOLEAN | DEFAULT: true)
- `created_by` (INTEGER, FK → admin_profiles, NULLABLE)

**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → AdminProfile (SET NULL/CASCADE)

---

### 41. UserDailyChallenge
**Tabla:** `user_daily_challenge` | **PK:** COMPOSITE (id_user_profile, id_challenge)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_challenge` (INTEGER, FK → daily_challenge, NOT NULL)
- `progress` (INTEGER | DEFAULT: 0)
- `completed` (BOOLEAN | DEFAULT: false)
- `completed_at` (DATE, NULLABLE)
- `tokens_earned` (INTEGER | DEFAULT: 0)

**Índices:** idx_user_daily_challenge_completed
**Timestamps:** NO
**Soft Delete:** NO

---

### 42. Reward
**Tabla:** `reward` | **PK:** `id_reward` (AUTO_INCREMENT)

**Campos principales:**
- `id_gym` (INTEGER, FK → gym, NULLABLE)
- `name` (STRING 100, NOT NULL)
- `description` (TEXT, NULLABLE)
- `token_cost` (INTEGER, NOT NULL)
- `discount_percentage` (DECIMAL 5,2 | NULLABLE)
- `discount_amount` (DECIMAL 10,2 | NULLABLE)
- `stock` (INTEGER, NULLABLE)
- `valid_from` (DATEONLY, NULLABLE)
- `valid_until` (DATEONLY, NULLABLE)
- `is_active` (BOOLEAN | DEFAULT: true)

**Índices:** idx_reward_gym_active, idx_reward_cost, idx_reward_deleted
**Timestamps:** created_at, updated_at
**Soft Delete:** YES - paranoid: true, deleted_at

**Asociaciones:**
- N:1 → Gym (CASCADE/CASCADE)

---

### 43. ClaimedReward
**Tabla:** `claimed_reward` | **PK:** `id_claimed_reward` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_reward` (INTEGER, FK → reward, NOT NULL)
- `id_code` (INTEGER, FK → reward_code, NULLABLE)
- `claimed_date` (DATEONLY, NOT NULL)
- `status` (ENUM: PENDING, ACTIVE, USED, EXPIRED | DEFAULT: PENDING)
- `tokens_spent` (INTEGER, NOT NULL)
- `used_at` (DATE, NULLABLE)
- `expires_at` (DATE, NULLABLE)

**Índices:** idx_claimed_reward_user_date, idx_claimed_reward_status, idx_claimed_reward_expires
**Timestamps:** created_at
**Soft Delete:** NO

**Instance Methods:** isExpired(), isUsable(), daysUntilExpiration()

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Reward (CASCADE/CASCADE)
- N:1 → RewardCode (SET NULL/CASCADE)

---

### 44. RewardCode
**Tabla:** `reward_code` | **PK:** `id_code` (AUTO_INCREMENT)

**Campos principales:**
- `id_reward` (INTEGER, FK → reward, NOT NULL)
- `code` (STRING 50, UNIQUE, NOT NULL)
- `is_used` (BOOLEAN | DEFAULT: false)

**UK:** code
**Índices:** idx_reward_code_code, idx_reward_code_reward_used
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → Reward (CASCADE/CASCADE)

---

### 45. TokenLedger
**Tabla:** `token_ledger` | **PK:** `id_ledger` (BIGINT, AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `delta` (INTEGER, NOT NULL)
- `reason` (STRING 100, NOT NULL)
- `ref_type` (STRING 50, NULLABLE)
- `ref_id` (BIGINT, NULLABLE)
- `balance_after` (INTEGER, NOT NULL)
- `metadata` (JSON, NULLABLE)

**Índices:** idx_token_ledger_user_date, idx_token_ledger_ref, idx_token_ledger_reason
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)

---

## Pagos

### 46. GymPayment
**Tabla:** `gym_payment` | **PK:** `id_payment` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NOT NULL)
- `amount` (DECIMAL 10,2 | NOT NULL)
- `payment_method` (STRING 50, NULLABLE)
- `payment_date` (DATE | DEFAULT: NOW)
- `period_start` (DATEONLY, NULLABLE)
- `period_end` (DATEONLY, NULLABLE)
- `status` (ENUM: PENDING, COMPLETED, FAILED, REFUNDED | DEFAULT: PENDING)

**Índices:** idx_gym_payment_user_gym, idx_gym_payment_date_status
**Timestamps:** NO
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Gym (CASCADE/CASCADE)

---

### 47. MercadoPagoPayment
**Tabla:** `mercadopago_payment` | **PK:** `id_mp_payment` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `id_gym` (INTEGER, FK → gym, NULLABLE)
- `payment_id` (STRING 100, UNIQUE, NULLABLE)
- `preference_id` (STRING 100, NULLABLE)
- `status` (ENUM: PENDING, APPROVED, AUTHORIZED, IN_PROCESS, IN_MEDIATION, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK | DEFAULT: PENDING)
- `status_detail` (STRING 100, NULLABLE)
- `amount` (DECIMAL 10,2 | NOT NULL)
- `currency` (STRING 3 | DEFAULT: ARS)
- `description` (TEXT, NULLABLE)
- `subscription_type` (ENUM: MONTHLY, WEEKLY, DAILY, ANNUAL | NULLABLE)
- `payment_method_id` (STRING 50, NULLABLE)
- `payment_type_id` (STRING 50, NULLABLE)
- `payer_email` (STRING 100, NULLABLE)
- `external_reference` (STRING 255, NULLABLE)
- `metadata` (JSON, NULLABLE)

**UK:** payment_id
**Índices:** idx_mp_payment_id, idx_mp_preference_id, idx_mp_status, idx_mp_user_gym
**Timestamps:** created_at, updated_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)
- N:1 → Gym (SET NULL/CASCADE)

---

## Notificaciones

### 48. Notification
**Tabla:** `notification` | **PK:** `id_notification` (AUTO_INCREMENT)

**Campos principales:**
- `id_user_profile` (INTEGER, FK → user_profiles, NOT NULL)
- `type` (ENUM: REMINDER, ACHIEVEMENT, REWARD, GYM_UPDATE, PAYMENT, SOCIAL, SYSTEM, CHALLENGE)
- `title` (STRING 100, NOT NULL)
- `message` (TEXT, NOT NULL)
- `data` (JSON, NULLABLE)
- `priority` (ENUM: LOW, NORMAL, HIGH | DEFAULT: NORMAL)
- `is_read` (BOOLEAN | DEFAULT: false)
- `read_at` (DATE, NULLABLE)
- `scheduled_for` (DATE, NULLABLE)
- `sent_at` (DATE, NULLABLE)

**Índices:** idx_notification_user_read, idx_notification_scheduled, idx_notification_type
**Timestamps:** created_at
**Soft Delete:** NO

**Asociaciones:**
- N:1 → UserProfile (CASCADE/CASCADE)

---

## Otros Modelos

### 49. Media
**Tabla:** `media` | **PK:** `id_media` (AUTO_INCREMENT)

**Campos principales:**
- `entity_type` (ENUM: USER_PROFILE, GYM, EXERCISE, PROGRESS, REVIEW)
- `entity_id` (INTEGER, NOT NULL)
- `media_type` (ENUM: IMAGE, VIDEO | DEFAULT: IMAGE)
- `url` (STRING 500, NOT NULL)
- `thumbnail_url` (STRING 500, NULLABLE)
- `file_size` (INTEGER, NULLABLE)
- `mime_type` (STRING 100, NULLABLE)
- `width` (INTEGER, NULLABLE)
- `height` (INTEGER, NULLABLE)
- `is_primary` (BOOLEAN | DEFAULT: false)
- `display_order` (INTEGER | DEFAULT: 0)
- `uploaded_at` (DATE | DEFAULT: NOW)

**Índices:** idx_media_entity, idx_media_primary
**Timestamps:** NO
**Soft Delete:** NO

---

### 50. DailyChallengeSettings
**Tabla:** `daily_challenge_settings` | **PK:** `id_config` (DEFAULT: 1)

**Campos principales:**
- `auto_rotation_enabled` (BOOLEAN | DEFAULT: true)
- `rotation_cron` (STRING 50 | DEFAULT: '1 0 * * *')

**Timestamps:** updated_at
**Soft Delete:** NO

**Static Method:** getSingleton()

---

## Resumen Estadístico

| Categoría | Cantidad |
|-----------|----------|
| **Total de modelos** | 50 |
| **Modelos con Soft Delete** | 5 (Exercise, Gym, Reward, Routine, UserProfile) |
| **Modelos con Timestamps** | 37 |
| **Modelos sin Timestamps** | 13 |
| **Modelos con Composite PK** | 6 |
| **Modelos con FK** | 42 |
| **Modelos Many-to-Many** | 6 (GymGymType, GymGymAmenity, UserFavoriteGym, ProgressExercise, ReviewHelpful, UserDailyChallenge) |
| **Modelos de Estadísticas/Ledger** | 5 (GymRatingStats, FrequencyHistory, TokenLedger, UserAchievementEvent, RewardGymStatsDaily) |

---

## Diagrama de Relaciones

```
┌──────────────────┐
│     Account      │──────┐
│  (Auth Layer)    │      │
└────────┬─────────┘      │
         │ 1:1            │ 1:N
         ▼                ▼
┌──────────────────┐  ┌──────────────────┐
│  UserProfile     │  │  RefreshToken    │
│  (Domain Layer)  │  └──────────────────┘
└────────┬─────────┘
         │ 1:N
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│   Assistance     │  │     Streak       │
│   (Gym Visits)   │  │  (Gamification)  │
└────────┬─────────┘  └──────────────────┘
         │ N:1
         ▼
┌──────────────────┐
│       Gym        │
│   (Catalog)      │
└────────┬─────────┘
         │ M:N
         ├──────────────────┐
         ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│   GymType        │  │   GymAmenity     │
└──────────────────┘  └──────────────────┘
```

---

## Riesgos de Seguridad

### ⚠️ Campos Sensibles (No Exponer en APIs)

| Modelo | Campo | Riesgo |
|--------|-------|--------|
| Account | password_hash | Alto - Nunca exponer |
| Account | google_id | Medio - Solo para auth backend |
| RefreshToken | token | Alto - Solo para rotación |
| UserDeviceToken | token | Alto - Solo para push notifications |
| RewardCode | code | Medio - Solo exponer cuando está canjeado |
| MercadoPagoPayment | payment_id, metadata | Medio - Datos sensibles de pago |

### ✅ Protecciones Implementadas

1. **Sin Mass Assignment:** Mappers explícitos en [services/mappers/](../services/mappers/)
2. **Proyecciones Explícitas:** Repositories no devuelven modelos Sequelize crudos
3. **Validación OpenAPI:** [middlewares/openapi-validator.js](../middlewares/openapi-validator.js)
4. **Sanitización de Inputs:** Joi schemas + OpenAPI formats
5. **SQL Injection:** Protegido por Sequelize ORM
6. **Soft Delete:** Previene eliminación accidental de datos críticos

### 🔒 Recomendaciones

1. **Nunca usar `Model.create(req.body)`** directamente
2. **Siempre usar mappers** para DTO ↔ Command/Query ↔ Entity
3. **Proyectar campos** explícitamente en queries (no usar `SELECT *`)
4. **Validar asociaciones** antes de crear relaciones M:N
5. **Auditar TokenLedger** para detectar manipulación de balances
6. **Rate limiting** en endpoints de creación de recursos costosos

---

**Fin del inventario**
