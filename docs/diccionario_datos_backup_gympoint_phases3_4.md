# Diccionario de datos - Backup GymPoint Phases 3 & 4 (2025-10-13)

- Backup analizado: `backup_gympoint_phases3_4_20251013_005404.sql`
- Total de tablas en el dump: 51
- Tablas de la aplicaci?n (excluyendo esquema mysql): 43

> Nota: Las descripciones provienen directamente de los comentarios definidos en la base de datos.

## SequelizeMeta

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| name | varchar(255) | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`name`)
- UNIQUE KEY `name` (`name`)

## account_roles

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_account_role | int | No |  | AUTO_INCREMENT |
| id_account | int | No |  |  |
| id_role | int | No |  |  |
| assigned_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_account_role`)
- UNIQUE KEY `unique_account_role` (`id_account`,`id_role`)
- KEY `id_role` (`id_role`)
- CONSTRAINT `account_roles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `account_roles_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE

## accounts

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_account | int | No |  | AUTO_INCREMENT; COMMENT: ID ??nico de la cuenta |
| email | varchar(100) | No |  | COMMENT: Email ??nico para login |
| password_hash | varchar(255) | S? | NULL | COMMENT: Hash de contrase??a (NULL si es login social) |
| auth_provider | enum('local','google') | No | 'local' | COMMENT: Proveedor de autenticaci??n |
| google_id | varchar(255) | S? | NULL | COMMENT: ID de Google (si usa Google OAuth) |
| email_verified | tinyint(1) | No | '0' | COMMENT: Si el email est?? verificado |
| is_active | tinyint(1) | No | '1' | COMMENT: Si la cuenta est?? activa (no baneada) |
| last_login | datetime | S? | NULL | COMMENT: ??ltima fecha de login |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_account`)
- UNIQUE KEY `email` (`email`)
- UNIQUE KEY `google_id` (`google_id`)
- KEY `idx_accounts_email` (`email`)
- KEY `idx_accounts_google_id` (`google_id`)
- KEY `idx_accounts_is_active` (`is_active`)

## admin_profiles

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_admin_profile | int | No |  | AUTO_INCREMENT |
| id_account | int | No |  | COMMENT: Relaci??n 1:1 con account |
| name | varchar(50) | No |  |  |
| lastname | varchar(50) | No |  |  |
| department | varchar(100) | S? | NULL | COMMENT: Departamento (IT, Support, Management, etc.) |
| notes | text | S? |  | COMMENT: Notas internas sobre el admin |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_admin_profile`)
- UNIQUE KEY `id_account` (`id_account`)
- CONSTRAINT `admin_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE

## assistance

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_assistance | int | No |  | AUTO_INCREMENT |
| date | date | No |  |  |
| id_gym | int | No |  |  |
| id_streak | int | No |  |  |
| hour | time | No |  |  |
| id_user | int | S? | NULL |  |
| id_user_profile | int | S? | NULL |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_assistance`)
- KEY `id_gym` (`id_gym`)
- KEY `id_streak` (`id_streak`)
- KEY `idx_assistance_user_date` (`id_user`,`date`)
- KEY `idx_assistance_gym_date` (`id_gym`,`date`)
- CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
- CONSTRAINT `assistance_ibfk_3` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`)
- CONSTRAINT `fk_assistance_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## claimed_reward

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_claimed_reward | int | No |  | AUTO_INCREMENT |
| id_reward | int | No |  |  |
| id_code | int | S? | NULL |  |
| claimed_date | date | No |  |  |
| provider_snapshot | enum('system','gym') | S? | NULL |  |
| gym_id_snapshot | bigint | S? | NULL |  |
| status | enum('pending','redeemed','revoked') | No |  |  |
| id_user | int | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_claimed_reward`)
- KEY `id_reward` (`id_reward`)
- KEY `fk_claimed_reward_code` (`id_code`)
- KEY `idx_claimed_reward_gym_date` (`gym_id_snapshot`,`claimed_date`)
- KEY `idx_claimed_reward_stats` (`id_reward`,`status`,`claimed_date`)
- KEY `idx_claimed_status_date` (`id_user`,`status`,`claimed_date`)
- CONSTRAINT `claimed_reward_ibfk_2` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`)
- CONSTRAINT `fk_claimed_reward_code` FOREIGN KEY (`id_code`) REFERENCES `reward_code` (`id_code`) ON DELETE SET NULL
- CONSTRAINT `fk_claimed_reward_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## exercise

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_exercise | int | No |  | AUTO_INCREMENT |
| exercise_name | varchar(100) | No |  |  |
| muscular_group | varchar(100) | No |  |  |
| created_by | int | S? | NULL |  |
| deleted_at | datetime | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_exercise`)
- KEY `exercise_created_by_foreign_idx` (`created_by`)
- KEY `idx_exercise_deleted_at` (`deleted_at`)
- CONSTRAINT `exercise_created_by_foreign_idx` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE

## frequency

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_frequency | int | No |  | AUTO_INCREMENT |
| achieved_goal | tinyint(1) | No |  |  |
| id_user | int | No |  |  |
| goal | tinyint | No |  |  |
| assist | tinyint | No |  |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_frequency`)
- KEY `id_user` (`id_user`)
- KEY `idx_frequency_user` (`id_user`)
- CONSTRAINT `fk_frequency_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `chk_goal_positive` CHECK ((`goal` > 0))

## gym

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_gym | int | No |  | AUTO_INCREMENT |
| name | varchar(50) | No |  |  |
| description | text | No |  |  |
| city | varchar(50) | No |  |  |
| address | varchar(100) | No |  |  |
| latitude | decimal(10,6) | S? | NULL |  |
| longitude | decimal(10,6) | S? | NULL |  |
| phone | varchar(50) | S? | NULL |  |
| email | varchar(100) | S? | NULL |  |
| website | varchar(500) | S? | NULL |  |
| social_media | json | S? | NULL |  |
| registration_date | date | No |  |  |
| equipment | json | No |  |  |
| month_price | double | No |  |  |
| week_price | double | No |  |  |
| logo_url | varchar(512) | S? | NULL |  |
| deleted_at | datetime | S? | NULL |  |
| photo_url | varchar(500) | S? | NULL | COMMENT: URL de la foto principal del gimnasio |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |
| whatsapp | varchar(20) | S? | NULL | COMMENT: N??mero de WhatsApp |
| instagram | varchar(100) | S? | NULL | COMMENT: Usuario de Instagram |
| facebook | varchar(100) | S? | NULL | COMMENT: P??gina de Facebook |
| google_maps_url | varchar(500) | S? | NULL | COMMENT: URL de Google Maps |
| max_capacity | int | S? | NULL | COMMENT: Capacidad m??xima del gimnasio |
| area_sqm | decimal(10,2) | S? | NULL | COMMENT: ??rea en metros cuadrados |
| verified | tinyint(1) | No | '0' | COMMENT: Gimnasio verificado por administraci??n |
| featured | tinyint(1) | No | '0' | COMMENT: Gimnasio destacado |
| location | point | S? | NULL | COMMENT: Ubicaci??n geogr??fica (POINT con SRID 4326) |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_gym`)
- KEY `idx_gym_location` (`latitude`,`longitude`)
- KEY `idx_gym_deleted_at` (`deleted_at`)
- KEY `idx_gym_created_at` (`created_at`)
- CONSTRAINT `chk_latitude` CHECK ((`latitude` between -(90) and 90))
- CONSTRAINT `chk_longitude` CHECK ((`longitude` between -(180) and 180))

## gym_gym_type

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_gym | int | No |  |  |
| id_type | int | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_gym`,`id_type`)
- KEY `id_type` (`id_type`)
- CONSTRAINT `gym_gym_type_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE
- CONSTRAINT `gym_gym_type_ibfk_2` FOREIGN KEY (`id_type`) REFERENCES `gym_type` (`id_type`) ON DELETE CASCADE

## gym_payment

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_payment | int | No |  | AUTO_INCREMENT |
| id_user | int | No |  |  |
| id_gym | int | No |  |  |
| mount | decimal(10,2) | No |  |  |
| payment_method | varchar(50) | No |  |  |
| payment_date | date | No |  |  |
| status | varchar(20) | No |  |  |
| legacy_id | int | S? | NULL | COMMENT: ID original para migraci??n a mercadopago_payment |
| migration_status | enum('PENDING','MIGRATED','ERROR') | No | 'PENDING' | COMMENT: Estado de migraci??n a mercadopago_payment |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_payment`)
- KEY `id_user` (`id_user`)
- KEY `id_gym` (`id_gym`)
- KEY `idx_payment_user_date` (`id_user`,`payment_date`)
- KEY `idx_gym_payment_migration_status` (`migration_status`)
- CONSTRAINT `fk_gym_payment_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `gym_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)

## gym_rating_stats

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_rating_stats | bigint | No |  | AUTO_INCREMENT |
| id_gym | int | No |  | COMMENT: Gimnasio |
| total_reviews | int | No | '0' | COMMENT: Total de reviews |
| average_rating | decimal(3,2) | No | '0.00' | COMMENT: Rating promedio |
| rating_1_count | int | No | '0' | COMMENT: Cantidad de ratings de 1 estrella |
| rating_2_count | int | No | '0' | COMMENT: Cantidad de ratings de 2 estrellas |
| rating_3_count | int | No | '0' | COMMENT: Cantidad de ratings de 3 estrellas |
| rating_4_count | int | No | '0' | COMMENT: Cantidad de ratings de 4 estrellas |
| rating_5_count | int | No | '0' | COMMENT: Cantidad de ratings de 5 estrellas |
| last_calculated_at | datetime | No | CURRENT_TIMESTAMP | COMMENT: ??ltima vez que se calcularon las estad??sticas |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_rating_stats`)
- UNIQUE KEY `idx_gym_rating_stats_gym` (`id_gym`)
- KEY `idx_gym_rating_stats_avg_total` (`average_rating`,`total_reviews`)
- CONSTRAINT `gym_rating_stats_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE

## gym_review

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_review | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  | COMMENT: Usuario que escribi?? la review |
| id_gym | int | No |  | COMMENT: Gimnasio siendo rese??ado |
| rating | tinyint | No |  | COMMENT: Rating de 1 a 5 estrellas |
| title | varchar(200) | S? | NULL | COMMENT: T??tulo de la review |
| content | text | S? |  | COMMENT: Contenido de la review |
| is_verified | tinyint(1) | No | '0' | COMMENT: Review verificada (usuario asisti?? al gimnasio) |
| is_public | tinyint(1) | No | '1' | COMMENT: Review visible p??blicamente |
| helpful_count | int | No | '0' | COMMENT: Contador de "??til" (precalculado) |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_review`)
- UNIQUE KEY `idx_gym_review_user_gym` (`id_user_profile`,`id_gym`)
- UNIQUE KEY `uniq_user_gym_review` (`id_user_profile`,`id_gym`)
- KEY `idx_gym_review_gym_public` (`id_gym`,`is_public`)
- KEY `idx_gym_review_rating_date` (`rating`,`created_at`)
- KEY `idx_gym_review_helpful_date` (`helpful_count`,`created_at`)
- KEY `idx_gym_rating` (`id_gym`,`rating`)
- KEY `idx_review_created_at` (`created_at`)
- CONSTRAINT `gym_review_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `gym_review_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE

## gym_schedule

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_schedule | int | No |  | AUTO_INCREMENT |
| id_gym | int | No |  |  |
| day_of_week | enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') | No |  | COMMENT: D??a de la semana |
| opening_time | time | S? | NULL |  |
| closing_time | time | S? | NULL |  |
| closed | tinyint(1) | No | '0' | COMMENT: Indica si el gimnasio est?? cerrado este d??a |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_schedule`)
- KEY `id_gym` (`id_gym`)
- KEY `idx_gym_schedule_gym_day` (`id_gym`,`day_of_week`)
- CONSTRAINT `gym_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)

## gym_special_schedule

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_special | int | No |  | AUTO_INCREMENT |
| id_gym | int | No |  |  |
| date | date | No |  |  |
| opening_time | time | S? | NULL |  |
| closing_time | time | S? | NULL |  |
| closed | tinyint(1) | No |  |  |
| motive | varchar(100) | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_special`)
- KEY `fk_special_schedule_gym` (`id_gym`)
- CONSTRAINT `fk_special_schedule_gym` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE

## gym_type

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_type | int | No |  | AUTO_INCREMENT |
| name | varchar(100) | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_type`)
- UNIQUE KEY `name` (`name`)

## media

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_media | int | No |  | AUTO_INCREMENT |
| entity_type | enum('USER_PROFILE','GYM','EXERCISE','PROGRESS') | No |  |  |
| entity_id | int | No |  |  |
| media_type | enum('IMAGE','VIDEO') | No | 'IMAGE' |  |
| url | varchar(500) | No |  |  |
| thumbnail_url | varchar(500) | S? | NULL |  |
| file_size | int | S? | NULL | COMMENT: Tama├▒o del archivo en bytes |
| mime_type | varchar(100) | S? | NULL |  |
| width | int | S? | NULL |  |
| height | int | S? | NULL |  |
| is_primary | tinyint(1) | No | '0' |  |
| display_order | int | No | '0' |  |
| uploaded_at | datetime | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_media`)
- KEY `idx_media_entity` (`entity_type`,`entity_id`)
- KEY `idx_media_primary` (`entity_type`,`entity_id`,`is_primary`)

## mercadopago_payment

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_mp_payment | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  |  |
| id_gym | int | No |  |  |
| subscription_type | enum('MONTHLY','WEEKLY','ANNUAL') | No | 'MONTHLY' |  |
| auto_renew | tinyint(1) | No | '0' |  |
| amount | decimal(10,2) | No |  |  |
| currency | varchar(3) | No | 'ARS' |  |
| preference_id | varchar(255) | S? | NULL |  |
| payment_id | varchar(255) | S? | NULL |  |
| status | enum('PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED') | No | 'PENDING' |  |
| external_reference | varchar(255) | No |  |  |
| init_point | varchar(1000) | S? | NULL |  |
| sandbox_init_point | varchar(1000) | S? | NULL |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_mp_payment`)
- KEY `id_user_profile` (`id_user_profile`)
- KEY `id_gym` (`id_gym`)
- CONSTRAINT `mercadopago_payment_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `mercadopago_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE

## notification

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_notification | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  |  |
| type | enum('REMINDER','ACHIEVEMENT','REWARD','GYM_UPDATE','PAYMENT','SOCIAL','SYSTEM') | No |  |  |
| title | varchar(100) | No |  |  |
| message | text | No |  |  |
| action_url | varchar(500) | S? | NULL |  |
| icon | varchar(50) | S? | NULL |  |
| is_read | tinyint(1) | No | '0' |  |
| scheduled_for | datetime | S? | NULL |  |
| sent_at | datetime | S? | NULL |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_notification`)
- KEY `id_user_profile` (`id_user_profile`)
- CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## progress

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_progress | int | No |  | AUTO_INCREMENT |
| id_user | int | No |  |  |
| date | date | No |  |  |
| body_weight | int | S? | NULL |  |
| body_fat | tinyint | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_progress`)
- KEY `id_user` (`id_user`)
- CONSTRAINT `fk_progress_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## progress_exercise

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_progress | int | No |  |  |
| id_exercise | int | No |  |  |
| used_weight | int | No |  |  |
| reps | int | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_progress`,`id_exercise`)
- KEY `id_exercise` (`id_exercise`)
- CONSTRAINT `progress_exercise_ibfk_1` FOREIGN KEY (`id_progress`) REFERENCES `progress` (`id_progress`)
- CONSTRAINT `progress_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`)

## refresh_token

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_token | int | No |  | AUTO_INCREMENT |
| token | text | No |  |  |
| user_agent | varchar(255) | S? | NULL |  |
| ip_address | varchar(50) | S? | NULL |  |
| expires_at | datetime | No |  |  |
| revoked | tinyint(1) | No | '0' |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| id_user | int | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_token`)
- KEY `fk_refresh_token_user_profile` (`id_user`)
- KEY `idx_token_expiration` (`expires_at`,`revoked`)
- CONSTRAINT `fk_refresh_token_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## review_helpful

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_helpful | bigint | No |  | AUTO_INCREMENT |
| id_review | bigint | No |  | COMMENT: Review marcada como ??til |
| id_user_profile | int | No |  | COMMENT: Usuario que marc?? como ??til |
| is_helpful | tinyint(1) | No |  | COMMENT: true=??til, false=no ??til |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_helpful`)
- UNIQUE KEY `idx_review_helpful_review_user` (`id_review`,`id_user_profile`)
- KEY `id_user_profile` (`id_user_profile`)
- KEY `idx_review_helpful_review_date` (`id_review`,`created_at`)
- CONSTRAINT `review_helpful_ibfk_1` FOREIGN KEY (`id_review`) REFERENCES `gym_review` (`id_review`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `review_helpful_ibfk_2` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## reward

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_reward | int | No |  | AUTO_INCREMENT |
| name | varchar(50) | No |  |  |
| description | varchar(250) | No |  |  |
| type | varchar(50) | S? | NULL |  |
| cost_tokens | int | No |  |  |
| available | tinyint(1) | No |  |  |
| stock | int | No |  |  |
| start_date | date | No |  |  |
| finish_date | date | No |  |  |
| creation_date | date | No |  |  |
| provider | enum('system','gym') | No | 'system' |  |
| id_gym | bigint | S? | NULL |  |
| fulfillment_type | enum('auto','manual') | No | 'auto' |  |
| deleted_at | datetime | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_reward`)
- KEY `idx_reward_gym_provider` (`id_gym`,`provider`)
- KEY `idx_reward_deleted_at` (`deleted_at`)
- KEY `idx_reward_availability` (`available`,`start_date`,`finish_date`)
- CONSTRAINT `chk_cost_positive` CHECK ((`cost_tokens` > 0))
- CONSTRAINT `chk_reward_dates` CHECK ((`finish_date` >= `start_date`))
- CONSTRAINT `chk_stock_positive` CHECK ((`stock` >= 0))

## reward_code

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_code | int | No |  | AUTO_INCREMENT |
| id_reward | int | No |  |  |
| id_gym | int | No |  |  |
| code | varchar(50) | No |  |  |
| expiration_date | datetime | S? | NULL |  |
| used | tinyint(1) | No |  |  |
| creation_date | datetime | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_code`)
- KEY `id_reward` (`id_reward`)
- KEY `id_gym` (`id_gym`)
- CONSTRAINT `reward_code_ibfk_1` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`)
- CONSTRAINT `reward_code_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)

## reward_gym_stats_daily

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| day | date | No |  |  |
| gym_id | int | No |  |  |
| claims | int | No | '0' |  |
| redeemed | int | No | '0' |  |
| revoked | int | No | '0' |  |
| tokens_spent | int | No | '0' |  |
| tokens_refunded | int | No | '0' |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`day`,`gym_id`)
- KEY `idx_reward_gym_stats_day` (`day`)
- KEY `idx_reward_gym_stats_gym_day` (`gym_id`,`day`)
- CONSTRAINT `reward_gym_stats_daily_ibfk_1` FOREIGN KEY (`gym_id`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE

## roles

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_role | int | No |  | AUTO_INCREMENT |
| role_name | varchar(50) | No |  | COMMENT: Nombre del rol (USER, ADMIN, MODERATOR, etc.) |
| description | varchar(255) | S? | NULL | COMMENT: Descripci??n del rol |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_role`)
- UNIQUE KEY `role_name` (`role_name`)

## routine

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_routine | int | No |  | AUTO_INCREMENT |
| routine_name | varchar(100) | No |  |  |
| description | varchar(250) | S? | NULL |  |
| created_by | int | No |  |  |
| deleted_at | datetime | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_routine`)
- KEY `fk_routine_user_profile` (`created_by`)
- KEY `idx_routine_deleted_at` (`deleted_at`)
- CONSTRAINT `fk_routine_user_profile` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## routine_day

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_routine_day | bigint | No |  | AUTO_INCREMENT |
| id_routine | int | No |  | COMMENT: Rutina a la que pertenece el d??a |
| day_name | enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') | No |  | COMMENT: D??a de la semana |
| day_order | tinyint | No |  | COMMENT: Orden del d??a en la rutina (1-7) |
| is_active | tinyint(1) | No | '1' | COMMENT: D??a activo en la rutina |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_routine_day`)
- UNIQUE KEY `idx_routine_day_routine_name` (`id_routine`,`day_name`)
- KEY `idx_routine_day_routine_order` (`id_routine`,`day_order`)
- CONSTRAINT `routine_day_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE

## routine_exercise

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_routine | int | No |  |  |
| id_exercise | int | No |  |  |
| series | tinyint | No |  |  |
| reps | tinyint | No |  |  |
| order | tinyint | No |  |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_routine`,`id_exercise`)
- KEY `id_exercise` (`id_exercise`)
- CONSTRAINT `routine_exercise_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`)
- CONSTRAINT `routine_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`)

## streak

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_streak | int | No |  | AUTO_INCREMENT |
| id_user | int | S? | NULL |  |
| value | int | No |  |  |
| id_frequency | int | No |  |  |
| last_value | int | S? | NULL |  |
| recovery_items | int | No | '0' |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_streak`)
- KEY `id_user` (`id_user`)
- KEY `fk_streak_frequency` (`id_frequency`)
- KEY `idx_streak_user` (`id_user`)
- CONSTRAINT `fk_streak_frequency` FOREIGN KEY (`id_frequency`) REFERENCES `frequency` (`id_frequency`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `fk_streak_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## token_ledger

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_ledger | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  |  |
| delta | int | No |  | COMMENT: Positivo=ganancia, negativo=gasto |
| reason | varchar(100) | No |  | COMMENT: ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS, etc. |
| ref_type | varchar(50) | S? | NULL | COMMENT: assistance, claimed_reward, routine, etc. |
| ref_id | bigint | S? | NULL | COMMENT: ID del registro relacionado |
| balance_after | int | No |  | COMMENT: Balance despu??s de aplicar delta |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_ledger`)
- KEY `idx_ledger_user_date` (`id_user_profile`,`created_at`)
- KEY `idx_ledger_ref` (`ref_type`,`ref_id`)
- KEY `idx_ledger_reason` (`reason`)
- CONSTRAINT `token_ledger_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `chk_balance_positive` CHECK ((`balance_after` >= 0))

## transaction

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_transaction | int | No |  | AUTO_INCREMENT |
| id_user | int | No |  |  |
| movement_type | varchar(20) | No |  |  |
| amount | int | No |  |  |
| date | date | No |  |  |
| id_reward | int | S? | NULL |  |
| result_balance | int | No |  |  |
| motive | varchar(255) | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_transaction`)
- KEY `fk_transaction_user` (`id_user`)
- KEY `fk_transaction_reward` (`id_reward`)
- CONSTRAINT `fk_transaction_reward` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE SET NULL
- CONSTRAINT `fk_transaction_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)

## user

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_user | int | No |  | AUTO_INCREMENT |
| name | varchar(30) | No |  |  |
| email | varchar(50) | No |  |  |
| lastname | varchar(30) | No |  |  |
| gender | varchar(1) | No |  |  |
| locality | varchar(50) | No |  |  |
| age | tinyint | No |  |  |
| tokens | int | S? | NULL |  |
| subscription | varchar(10) | No |  |  |
| id_streak | int | S? | NULL |  |
| password | varchar(255) | S? | NULL |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_user`)
- KEY `id_streak` (`id_streak`)
- CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`)

## user_body_metrics

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_body_metrics | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  | COMMENT: Usuario propietario de las m??tricas |
| recorded_date | date | No |  | COMMENT: Fecha de registro de las m??tricas |
| weight_kg | decimal(5,2) | S? | NULL | COMMENT: Peso en kilogramos |
| height_cm | decimal(5,2) | S? | NULL | COMMENT: Altura en cent??metros |
| bmi | decimal(4,2) | S? | NULL | COMMENT: ??ndice de Masa Corporal (calculado) |
| body_fat_percentage | decimal(4,2) | S? | NULL | COMMENT: Porcentaje de grasa corporal |
| muscle_mass_kg | decimal(5,2) | S? | NULL | COMMENT: Masa muscular en kilogramos |
| chest_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia del pecho en cm |
| waist_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia de la cintura en cm |
| hip_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia de la cadera en cm |
| arm_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia del brazo en cm |
| thigh_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia del muslo en cm |
| neck_cm | decimal(5,2) | S? | NULL | COMMENT: Circunferencia del cuello en cm |
| measurement_method | enum('MANUAL','SCALE','BODY_COMPOSITION','OTHER') | S? | NULL | COMMENT: M??todo de medici??n utilizado |
| notes | text | S? |  | COMMENT: Notas adicionales sobre las mediciones |
| is_goal_weight | tinyint(1) | No | '0' | COMMENT: Indica si este peso es un objetivo marcado |
| tokens_earned | int | No | '0' | COMMENT: Tokens ganados por registrar m??tricas consistentemente |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_body_metrics`)
- UNIQUE KEY `idx_body_metrics_user_date` (`id_user_profile`,`recorded_date`)
- KEY `idx_body_metrics_user_date_chart` (`id_user_profile`,`recorded_date`)
- KEY `idx_body_metrics_date` (`recorded_date`)
- KEY `idx_body_metrics_method` (`measurement_method`)
- KEY `idx_body_metrics_goal_weight` (`is_goal_weight`,`recorded_date`)
- CONSTRAINT `user_body_metrics_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## user_device_tokens

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_device_token | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  | COMMENT: Usuario propietario del dispositivo |
| platform | enum('IOS','ANDROID','WEB') | No |  | COMMENT: Plataforma del dispositivo |
| device_id | varchar(255) | S? | NULL | COMMENT: ID ??nico del dispositivo (opcional) |
| push_token | varchar(500) | No |  | COMMENT: Token de push notification |
| app_version | varchar(20) | S? | NULL | COMMENT: Versi??n de la app |
| os_version | varchar(50) | S? | NULL | COMMENT: Versi??n del sistema operativo |
| is_active | tinyint(1) | No | '1' | COMMENT: Token activo para recibir notificaciones |
| last_seen_at | datetime | S? | NULL | COMMENT: ??ltima vez que se us?? este token |
| revoked_at | datetime | S? | NULL | COMMENT: Fecha de revocaci??n del token |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_device_token`)
- UNIQUE KEY `idx_device_tokens_push_token` (`push_token`)
- KEY `idx_device_tokens_user_active` (`id_user_profile`,`is_active`)
- KEY `idx_device_tokens_platform_active` (`platform`,`is_active`)
- KEY `idx_device_tokens_last_seen` (`last_seen_at`)
- CONSTRAINT `user_device_tokens_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## user_favorite_gym

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_favorite | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  | COMMENT: Usuario que marc?? como favorito |
| id_gym | int | No |  | COMMENT: Gimnasio marcado como favorito |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_favorite`)
- UNIQUE KEY `idx_favorite_user_gym` (`id_user_profile`,`id_gym`)
- KEY `idx_favorite_user_date` (`id_user_profile`,`created_at`)
- KEY `idx_favorite_gym` (`id_gym`)
- CONSTRAINT `user_favorite_gym_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `user_favorite_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE

## user_gym

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_user_gym | int | No |  | AUTO_INCREMENT |
| id_gym | int | No |  |  |
| start_date | date | No |  |  |
| finish_date | date | S? | NULL |  |
| active | tinyint(1) | No |  |  |
| plan | enum('MENSUAL','SEMANAL','ANUAL') | No | 'MENSUAL' |  |
| id_user | int | No |  |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |
| id_payment | bigint | S? | NULL |  |
| subscription_type | enum('MONTHLY','WEEKLY','ANNUAL') | No | 'MONTHLY' |  |
| auto_renew | tinyint(1) | No | '0' |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_user_gym`)
- UNIQUE KEY `unique_active_gym` (`id_user`,`id_gym`,`active`)
- KEY `id_gym` (`id_gym`)
- KEY `idx_user_gym_user` (`id_user`)
- CONSTRAINT `fk_user_gym_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `user_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
- CONSTRAINT `chk_gym_dates` CHECK (((`finish_date` is null) or (`finish_date` >= `start_date`)))

## user_notification_settings

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_setting | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  |  |
| notification_type | enum('REMINDER','ACHIEVEMENT','REWARD','GYM_UPDATE','PAYMENT','SOCIAL','SYSTEM') | No |  |  |
| push_enabled | tinyint(1) | No | '1' |  |
| email_enabled | tinyint(1) | No | '0' |  |
| sms_enabled | tinyint(1) | No | '0' |  |
| quiet_hours_start | time | S? | NULL |  |
| quiet_hours_end | time | S? | NULL |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_setting`)
- UNIQUE KEY `unique_user_notification_type` (`id_user_profile`,`notification_type`)
- CONSTRAINT `user_notification_settings_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE

## user_profiles

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_user_profile | int | No |  | AUTO_INCREMENT |
| id_account | int | No |  | COMMENT: Relaci??n 1:1 con account |
| name | varchar(50) | No |  |  |
| lastname | varchar(50) | No |  |  |
| gender | enum('M','F','O') | No | 'O' |  |
| age | tinyint | S? | NULL |  |
| locality | varchar(100) | S? | NULL |  |
| subscription | enum('FREE','PREMIUM') | No | 'FREE' | COMMENT: Nivel de suscripci??n del usuario |
| tokens | int | No | '0' | COMMENT: Tokens acumulados |
| id_streak | int | S? | NULL | COMMENT: Racha actual del usuario |
| profile_picture_url | varchar(500) | S? | NULL |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_user_profile`)
- UNIQUE KEY `id_account` (`id_account`)
- KEY `idx_user_profiles_subscription` (`subscription`)
- KEY `idx_user_profiles_tokens` (`tokens`)
- KEY `fk_user_profile_streak` (`id_streak`)
- CONSTRAINT `fk_user_profile_streak` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`) ON DELETE SET NULL ON UPDATE CASCADE
- CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `chk_tokens_positive` CHECK ((`tokens` >= 0))

## user_routine

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_user_routine | int | No |  | AUTO_INCREMENT |
| id_routine | int | No |  |  |
| start_date | date | No |  |  |
| finish_date | date | S? | NULL |  |
| active | tinyint(1) | No |  |  |
| id_user | int | No |  |  |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_user_routine`)
- UNIQUE KEY `unique_active_routine` (`id_user`,`id_routine`,`active`)
- KEY `id_routine` (`id_routine`)
- KEY `idx_user_routine_user` (`id_user`)
- CONSTRAINT `fk_user_routine_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `user_routine_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`)
- CONSTRAINT `chk_routine_dates` CHECK (((`finish_date` is null) or (`finish_date` >= `start_date`)))

## workout_session

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_workout_session | bigint | No |  | AUTO_INCREMENT |
| id_user_profile | int | No |  | COMMENT: Usuario que realiz?? la sesi??n |
| id_routine | int | S? | NULL | COMMENT: Rutina seguida (opcional) |
| id_routine_day | bigint | S? | NULL | COMMENT: D??a espec??fico de la rutina |
| session_name | varchar(200) | S? | NULL | COMMENT: Nombre personalizado de la sesi??n |
| session_date | date | No |  | COMMENT: Fecha de la sesi??n |
| start_time | time | S? | NULL | COMMENT: Hora de inicio |
| end_time | time | S? | NULL | COMMENT: Hora de finalizaci??n |
| duration_minutes | int | S? | NULL | COMMENT: Duraci??n en minutos (calculada) |
| total_sets | int | No | '0' | COMMENT: Total de series realizadas |
| total_reps | int | No | '0' | COMMENT: Total de repeticiones realizadas |
| total_weight | decimal(10,2) | No | '0.00' | COMMENT: Peso total levantado (kg) |
| status | enum('IN_PROGRESS','COMPLETED','CANCELLED') | No | 'IN_PROGRESS' | COMMENT: Estado de la sesi??n |
| notes | text | S? |  | COMMENT: Notas de la sesi??n |
| tokens_earned | int | No | '0' | COMMENT: Tokens ganados por completar la sesi??n |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |
| updated_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_workout_session`)
- KEY `id_routine_day` (`id_routine_day`)
- KEY `idx_workout_session_user_date` (`id_user_profile`,`session_date`)
- KEY `idx_workout_session_routine_date` (`id_routine`,`session_date`)
- KEY `idx_workout_session_status_date` (`status`,`session_date`)
- CONSTRAINT `workout_session_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `workout_session_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE SET NULL ON UPDATE CASCADE
- CONSTRAINT `workout_session_ibfk_3` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE SET NULL ON UPDATE CASCADE

## workout_set

| Columna | Tipo | ?Nula? | Default | Extras |
| --- | --- | --- | --- | --- |
| id_workout_set | bigint | No |  | AUTO_INCREMENT |
| id_workout_session | bigint | No |  | COMMENT: Sesi??n a la que pertenece la serie |
| id_exercise | int | No |  | COMMENT: Ejercicio realizado |
| set_number | tinyint | No |  | COMMENT: N??mero de serie (1, 2, 3, etc.) |
| reps | int | S? | NULL | COMMENT: Repeticiones realizadas |
| weight | decimal(8,2) | S? | NULL | COMMENT: Peso utilizado (kg) |
| duration_seconds | int | S? | NULL | COMMENT: Duraci??n en segundos (para ejercicios de tiempo) |
| distance_meters | decimal(10,2) | S? | NULL | COMMENT: Distancia en metros (para cardio) |
| rest_seconds | int | S? | NULL | COMMENT: Descanso entre series (segundos) |
| rpe | tinyint | S? | NULL | COMMENT: Rate of Perceived Exertion (1-10) |
| notes | text | S? |  | COMMENT: Notas de la serie |
| created_at | datetime | No | CURRENT_TIMESTAMP |  |

**Restricciones / ?ndices**
- PRIMARY KEY (`id_workout_set`)
- KEY `idx_workout_set_session_number` (`id_workout_session`,`set_number`)
- KEY `idx_workout_set_exercise_date` (`id_exercise`,`created_at`)
- CONSTRAINT `workout_set_ibfk_1` FOREIGN KEY (`id_workout_session`) REFERENCES `workout_session` (`id_workout_session`) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT `workout_set_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
