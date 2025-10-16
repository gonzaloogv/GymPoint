# DICCIONARIO DE DATOS - GYMPOINT

**Sistema de Gestión de Gimnasios y Usuarios**  
**Versión:** 2.0  
**Fecha:** 2025-10-10  
**Base de Datos:** MySQL 8.4  

---

## ÍNDICE

1. [Tablas de Autenticación y Perfiles](#tablas-de-autenticación-y-perfiles)
2. [Tablas de Dominio Principal](#tablas-de-dominio-principal)
3. [Tablas de Relaciones](#tablas-de-relaciones)
4. [Tablas de Configuración](#tablas-de-configuración)
5. [Diagrama de Relaciones](#diagrama-de-relaciones)

---

## TABLAS DE AUTENTICACIÓN Y PERFILES

> **NOTA IMPORTANTE:** La tabla `user` legacy ha sido eliminada y reemplazada por esta nueva arquitectura que separa autenticación de datos de dominio.

### 1. ACCOUNT
**Descripción:** Cuentas de usuario del sistema (usuarios y administradores)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_account` | INT | PK, AUTO_INCREMENT | Identificador único de la cuenta |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Email de la cuenta (usuario único) |
| `password_hash` | VARCHAR(255) | NULL | Hash de la contraseña (NULL para OAuth) |
| `auth_provider` | ENUM('local','google') | NOT NULL, DEFAULT 'local' | Proveedor de autenticación |
| `google_id` | VARCHAR(255) | NULL, UNIQUE | ID de Google (para OAuth) |
| `email_verified` | TINYINT(1) | NOT NULL, DEFAULT 0 | Si el email está verificado |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Si la cuenta está activa |
| `last_login` | DATETIME | NULL | Último inicio de sesión |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de última actualización |

**Relaciones:**
- 1:1 con `UserProfile`
- 1:1 con `AdminProfile`
- M:N con `Role` (a través de `AccountRole`)

---

### 2. ROLE
**Descripción:** Roles del sistema (ADMIN, USER, etc.)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_role` | INT | PK, AUTO_INCREMENT | Identificador único del rol |
| `role_name` | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del rol |
| `description` | VARCHAR(255) | NULL | Descripción del rol |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Valores típicos:** ADMIN, USER, GYM_OWNER

---

### 3. ACCOUNT_ROLE
**Descripción:** Relación many-to-many entre cuentas y roles

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_account_role` | INT | PK, AUTO_INCREMENT | Identificador único de la relación |
| `id_account` | INT | NOT NULL, FK → Account | ID de la cuenta |
| `id_role` | INT | NOT NULL, FK → Role | ID del rol |
| `assigned_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de asignación |

---

### 4. USER_PROFILE
**Descripción:** Perfil de usuario regular del sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_user_profile` | INT | PK, AUTO_INCREMENT | Identificador único del perfil |
| `id_account` | INT | NOT NULL, FK → Account | ID de la cuenta asociada |
| `name` | VARCHAR(50) | NOT NULL | Nombre del usuario |
| `lastname` | VARCHAR(50) | NOT NULL | Apellido del usuario |
| `phone` | VARCHAR(20) | NULL | Teléfono del usuario |
| `birth_date` | DATE | NULL | Fecha de nacimiento |
| `gender` | ENUM('M','F','O') | NULL | Género del usuario |
| `locality` | VARCHAR(100) | NULL | Localidad del usuario |
| `tokens` | INT | NOT NULL, DEFAULT 0 | Tokens disponibles |
| `subscription` | ENUM('FREE','PREMIUM','ADMIN') | NOT NULL, DEFAULT 'FREE' | Tipo de suscripción |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### 5. ADMIN_PROFILE
**Descripción:** Perfil de administrador del sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_admin_profile` | INT | PK, AUTO_INCREMENT | Identificador único del perfil admin |
| `id_account` | INT | NOT NULL, UNIQUE, FK → Account | ID de la cuenta asociada |
| `name` | VARCHAR(50) | NOT NULL | Nombre del administrador |
| `lastname` | VARCHAR(50) | NOT NULL | Apellido del administrador |
| `department` | VARCHAR(100) | NULL | Departamento del administrador |
| `notes` | TEXT | NULL | Notas adicionales del administrador |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

---

### 6. SEQUELIZE_META
**Descripción:** Tabla de control de migraciones de Sequelize

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `name` | VARCHAR(255) | PK | Nombre del archivo de migración ejecutado |

**Nota:** Esta tabla es mantenida automáticamente por Sequelize para controlar qué migraciones se han ejecutado.

---

## TABLAS DE DOMINIO PRINCIPAL

### 7. GYM
**Descripción:** Información de gimnasios del sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_gym` | INT | PK, AUTO_INCREMENT | Identificador único del gimnasio |
| `name` | VARCHAR(100) | NOT NULL | Nombre del gimnasio |
| `description` | TEXT | NOT NULL | Descripción del gimnasio |
| `city` | VARCHAR(100) | NOT NULL | Ciudad del gimnasio |
| `address` | VARCHAR(200) | NOT NULL | Dirección del gimnasio |
| `latitude` | DECIMAL(10,6) | NULL | Latitud geográfica |
| `longitude` | DECIMAL(10,6) | NULL | Longitud geográfica |
| `phone` | VARCHAR(20) | NULL | Teléfono del gimnasio |
| `email` | VARCHAR(100) | NULL | Email del gimnasio |
| `website` | VARCHAR(500) | NULL | Sitio web del gimnasio |
| `social_media` | TEXT | NULL | Redes sociales (JSON) |
| `equipment` | TEXT | NOT NULL | Equipamiento disponible |
| `month_price` | DECIMAL(10,2) | NOT NULL | Precio mensual |
| `week_price` | DECIMAL(10,2) | NOT NULL | Precio semanal |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Estado del gimnasio |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### 8. EXERCISE
**Descripción:** Catálogo de ejercicios disponibles

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_exercise` | INT | PK, AUTO_INCREMENT | Identificador único del ejercicio |
| `exercise_name` | VARCHAR(100) | NOT NULL | Nombre del ejercicio |
| `muscular_group` | VARCHAR(100) | NOT NULL | Grupo muscular trabajado |
| `description` | TEXT | NULL | Descripción del ejercicio |
| `difficulty` | ENUM('BEGINNER','INTERMEDIATE','ADVANCED') | NULL | Nivel de dificultad |
| `equipment_needed` | VARCHAR(200) | NULL | Equipamiento necesario |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

### 9. ROUTINE
**Descripción:** Rutinas de ejercicios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_routine` | INT | PK, AUTO_INCREMENT | Identificador único de la rutina |
| `routine_name` | VARCHAR(100) | NOT NULL | Nombre de la rutina |
| `description` | VARCHAR(500) | NULL | Descripción de la rutina |
| `difficulty` | ENUM('BEGINNER','INTERMEDIATE','ADVANCED') | NULL | Nivel de dificultad |
| `duration_weeks` | INT | NULL | Duración en semanas |
| `created_by` | INT | NULL, FK → UserProfile | Creador de la rutina |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si es pública |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### 10. REWARD
**Descripción:** Sistema de recompensas y premios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_reward` | INT | PK, AUTO_INCREMENT | Identificador único de la recompensa |
| `name` | VARCHAR(100) | NOT NULL | Nombre de la recompensa |
| `description` | VARCHAR(500) | NOT NULL | Descripción de la recompensa |
| `type` | ENUM('DISCOUNT','FREE_MONTH','MERCHANDISE','EXPERIENCE') | NOT NULL | Tipo de recompensa |
| `cost_tokens` | INT | NOT NULL | Costo en tokens |
| `available` | BOOLEAN | NOT NULL, DEFAULT TRUE | Disponibilidad |
| `stock` | INT | NOT NULL, DEFAULT 0 | Stock disponible |
| `start_date` | DATE | NOT NULL | Fecha de inicio |
| `finish_date` | DATE | NOT NULL | Fecha de finalización |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

## TABLAS DE RELACIONES

### 11. ASSISTANCE
**Descripción:** Registro de asistencias de usuarios a gimnasios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_assistance` | INT | PK, AUTO_INCREMENT | Identificador único de la asistencia |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `id_gym` | INT | NOT NULL, FK → Gym | ID del gimnasio |
| `date` | DATE | NOT NULL | Fecha de asistencia |
| `hour` | TIME | NOT NULL | Hora de asistencia |
| `id_streak` | INT | NOT NULL, FK → Streak | ID del streak asociado |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 12. USER_GYM
**Descripción:** Relación entre usuarios y gimnasios (suscripciones)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_user` | INT | PK, FK → UserProfile | ID del usuario |
| `id_gym` | INT | PK, FK → Gym | ID del gimnasio |
| `start_date` | DATE | NOT NULL | Fecha de inicio de suscripción |
| `finish_date` | DATE | NULL | Fecha de finalización |
| `active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Estado de la suscripción |
| `plan` | VARCHAR(100) | NULL | Tipo de plan contratado |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 13. USER_ROUTINE
**Descripción:** Relación entre usuarios y rutinas

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_user` | INT | PK, FK → UserProfile | ID del usuario |
| `id_routine` | INT | PK, FK → Routine | ID de la rutina |
| `start_date` | DATE | NOT NULL | Fecha de inicio |
| `finish_date` | DATE | NULL | Fecha de finalización |
| `active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Estado de la rutina |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de asignación |

---

### 14. ROUTINE_EXERCISE
**Descripción:** Ejercicios que componen una rutina

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_routine` | INT | PK, FK → Routine | ID de la rutina |
| `id_exercise` | INT | PK, FK → Exercise | ID del ejercicio |
| `series` | TINYINT | NOT NULL | Número de series |
| `reps` | TINYINT | NOT NULL | Número de repeticiones |
| `order` | TINYINT | NOT NULL | Orden en la rutina |
| `rest_seconds` | INT | NULL | Segundos de descanso |
| `notes` | TEXT | NULL | Notas adicionales |

---

### 15. PROGRESS
**Descripción:** Registro de progreso físico de usuarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_progress` | INT | PK, AUTO_INCREMENT | Identificador único del progreso |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `date` | DATE | NOT NULL | Fecha del registro |
| `body_weight` | DECIMAL(5,2) | NULL | Peso corporal (kg) |
| `body_fat` | DECIMAL(4,2) | NULL | Porcentaje de grasa corporal |
| `muscle_mass` | DECIMAL(5,2) | NULL | Masa muscular (kg) |
| `notes` | TEXT | NULL | Notas adicionales |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 16. PROGRESS_EXERCISE
**Descripción:** Ejercicios específicos en el progreso

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_progress` | INT | PK, FK → Progress | ID del progreso |
| `id_exercise` | INT | PK, FK → Exercise | ID del ejercicio |
| `used_weight` | DECIMAL(6,2) | NOT NULL | Peso utilizado (kg) |
| `reps` | INT | NOT NULL | Repeticiones realizadas |
| `series` | INT | NOT NULL | Series realizadas |
| `notes` | TEXT | NULL | Notas del ejercicio |

---

## TABLAS DE CONFIGURACIÓN

### 17. GYM_TYPE
**Descripción:** Tipos de gimnasios (Musculación, Crossfit, etc.)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_type` | INT | PK, AUTO_INCREMENT | Identificador único del tipo |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Nombre del tipo |
| `description` | VARCHAR(255) | NULL | Descripción del tipo |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Valores típicos:** Musculación, Crossfit, Funcional, Cardio, HIIT, Yoga

---

### 18. GYM_GYM_TYPE
**Descripción:** Relación many-to-many entre gimnasios y tipos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_gym` | INT | PK, FK → Gym | ID del gimnasio |
| `id_type` | INT | PK, FK → GymType | ID del tipo |

---

### 19. GYM_SCHEDULE
**Descripción:** Horarios regulares de gimnasios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_schedule` | INT | PK, AUTO_INCREMENT | Identificador único del horario |
| `id_gym` | INT | NOT NULL, FK → Gym | ID del gimnasio |
| `day_of_week` | ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') | NOT NULL | Día de la semana |
| `opening_time` | TIME | NULL | Hora de apertura |
| `closing_time` | TIME | NULL | Hora de cierre |
| `closed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si está cerrado ese día |

---

### 20. GYM_SPECIAL_SCHEDULE
**Descripción:** Horarios especiales de gimnasios (feriados, eventos)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_special` | INT | PK, AUTO_INCREMENT | Identificador único del horario especial |
| `id_gym` | INT | NOT NULL, FK → Gym | ID del gimnasio |
| `date` | DATE | NOT NULL | Fecha especial |
| `opening_time` | TIME | NULL | Hora de apertura |
| `closing_time` | TIME | NULL | Hora de cierre |
| `closed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si está cerrado |
| `motive` | VARCHAR(255) | NULL | Motivo del horario especial |

---

### 21. FREQUENCY
**Descripción:** Objetivos de frecuencia de asistencia de usuarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_frequency` | INT | PK, AUTO_INCREMENT | Identificador único de la frecuencia |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `goal` | TINYINT | NOT NULL | Objetivo de asistencias por semana |
| `assist` | TINYINT | NOT NULL, DEFAULT 0 | Asistencias actuales |
| `achieved_goal` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si alcanzó el objetivo |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### 22. STREAK
**Descripción:** Racha de asistencias consecutivas de usuarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_streak` | INT | PK, AUTO_INCREMENT | Identificador único del streak |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `value` | INT | NOT NULL, DEFAULT 0 | Valor actual del streak |
| `last_value` | INT | NULL | Último valor del streak |
| `recovery_items` | INT | NOT NULL, DEFAULT 0 | Items de recuperación disponibles |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### 23. CLAIMED_REWARD
**Descripción:** Recompensas reclamadas por usuarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_claimed_reward` | INT | PK, AUTO_INCREMENT | Identificador único del reclamo |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `id_reward` | INT | NOT NULL, FK → Reward | ID de la recompensa |
| `id_code` | INT | NULL, FK → RewardCode | ID del código utilizado |
| `claimed_date` | DATE | NOT NULL | Fecha de reclamo |
| `status` | ENUM('PENDING','USED','EXPIRED') | NOT NULL, DEFAULT 'PENDING' | Estado del reclamo |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 24. REWARD_CODE
**Descripción:** Códigos generados para recompensas

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_code` | INT | PK, AUTO_INCREMENT | Identificador único del código |
| `id_reward` | INT | NOT NULL, FK → Reward | ID de la recompensa |
| `id_gym` | INT | NOT NULL, FK → Gym | ID del gimnasio |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | Código único |
| `expiration_date` | DATETIME | NULL | Fecha de expiración |
| `used` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si fue utilizado |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

### 25. GYM_PAYMENT
**Descripción:** Pagos realizados por usuarios a gimnasios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_payment` | INT | PK, AUTO_INCREMENT | Identificador único del pago |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `id_gym` | INT | NOT NULL, FK → Gym | ID del gimnasio |
| `amount` | DECIMAL(10,2) | NOT NULL | Monto del pago |
| `payment_method` | ENUM('CASH','CARD','MERCADOPAGO','TRANSFER') | NOT NULL | Método de pago |
| `payment_date` | DATE | NOT NULL | Fecha del pago |
| `status` | ENUM('PENDING','PAID','FAILED','REFUNDED') | NOT NULL, DEFAULT 'PENDING' | Estado del pago |
| `transaction_id` | VARCHAR(100) | NULL | ID de transacción externa |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 26. TOKEN_LEDGER
**Descripción:** Libro mayor de tokens (versión mejorada de Transaction)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_ledger` | BIGINT | PK, AUTO_INCREMENT | Identificador único del registro |
| `id_user_profile` | INT | NOT NULL, FK → UserProfile | ID del perfil de usuario |
| `delta` | INT | NOT NULL | Cambio en tokens (positivo=ganancia, negativo=gasto) |
| `reason` | VARCHAR(100) | NOT NULL | Razón del movimiento (ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, etc.) |
| `ref_type` | VARCHAR(50) | NULL | Tipo de referencia (assistance, claimed_reward, routine, etc.) |
| `ref_id` | BIGINT | NULL | ID del registro relacionado |
| `balance_after` | INT | NOT NULL | Balance después de aplicar delta |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### 27. REWARD_GYM_STATS_DAILY
**Descripción:** Estadísticas diarias de recompensas por gimnasio

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `day` | DATE | PK | Fecha de las estadísticas |
| `gym_id` | INT | PK, FK → Gym | ID del gimnasio |
| `claims` | INT | NOT NULL, DEFAULT 0 | Número de reclamaciones |
| `redeemed` | INT | NOT NULL, DEFAULT 0 | Número de recompensas canjeadas |
| `revoked` | INT | NOT NULL, DEFAULT 0 | Número de recompensas revocadas |
| `tokens_spent` | INT | NOT NULL, DEFAULT 0 | Tokens gastados |
| `tokens_refunded` | INT | NOT NULL, DEFAULT 0 | Tokens reembolsados |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

---

### 28. REFRESH_TOKEN
**Descripción:** Tokens de actualización para autenticación

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_token` | INT | PK, AUTO_INCREMENT | Identificador único del token |
| `id_user` | INT | NOT NULL, FK → UserProfile | ID del usuario |
| `token` | TEXT | NOT NULL | Token de actualización |
| `user_agent` | VARCHAR(255) | NULL | User agent del cliente |
| `ip_address` | VARCHAR(50) | NULL | Dirección IP |
| `expires_at` | DATETIME | NOT NULL | Fecha de expiración |
| `revoked` | BOOLEAN | NOT NULL, DEFAULT FALSE | Si fue revocado |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

## DIAGRAMA DE RELACIONES

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ACCOUNT   │◄──►│ ACCOUNT_ROLE│◄──►│    ROLE     │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ├── 1:1 ──► USER_PROFILE (Usuarios de la app)
       │
       └── 1:1 ──► ADMIN_PROFILE (Administradores)

USER_PROFILE ──► ASSISTANCE ◄── GYM
     │              │
     ├──► PROGRESS  │
     │              │
     ├──► FREQUENCY │
     │              │
     ├──► STREAK    │
     │              │
     ├──► USER_GYM ◄┘
     │
     ├──► USER_ROUTINE ◄── ROUTINE ◄── ROUTINE_EXERCISE ◄── EXERCISE
     │
     ├──► CLAIMED_REWARD ◄── REWARD ◄── REWARD_CODE ◄── GYM
     │
     ├──► GYM_PAYMENT ◄── GYM
     │
     ├──► TOKEN_LEDGER
     │
     └──► REFRESH_TOKEN

GYM ◄──► GYM_TYPE (through GYM_GYM_TYPE)
 │
 ├──► GYM_SCHEDULE
 │
 ├──► GYM_SPECIAL_SCHEDULE
 │
 └──► REWARD_CODE

PROGRESS ◄──► EXERCISE (through PROGRESS_EXERCISE)

NOTA: La tabla 'user' legacy ha sido eliminada y reemplazada
por esta nueva arquitectura que separa autenticación de dominio.
```

---

## RESUMEN DE TABLAS

**Total de tablas:** 28

### Por Categoría:
- **Autenticación y Perfiles:** 6 tablas (ACCOUNT, ROLE, ACCOUNT_ROLE, USER_PROFILE, ADMIN_PROFILE, SEQUELIZE_META)
- **Dominio Principal:** 8 tablas (GYM, EXERCISE, ROUTINE, REWARD, ASSISTANCE, USER_GYM, USER_ROUTINE, ROUTINE_EXERCISE)
- **Progreso y Seguimiento:** 3 tablas (PROGRESS, PROGRESS_EXERCISE, FREQUENCY, STREAK)
- **Configuración:** 4 tablas (GYM_TYPE, GYM_GYM_TYPE, GYM_SCHEDULE, GYM_SPECIAL_SCHEDULE)
- **Recompensas:** 3 tablas (CLAIMED_REWARD, REWARD_CODE, REWARD_GYM_STATS_DAILY)
- **Pagos y Tokens:** 3 tablas (GYM_PAYMENT, TOKEN_LEDGER, REFRESH_TOKEN)

### Estado de la Arquitectura:
- ✅ **Nueva arquitectura implementada** (Account + UserProfile + AdminProfile)
- ✅ **Tabla `user` legacy eliminada**
- ✅ **Sistema de tokens migrado** a `token_ledger`
- ✅ **RBAC implementado** (roles y account_roles)
- ✅ **Separación de responsabilidades** (autenticación vs dominio)

---

## NOTAS TÉCNICAS

### Índices Recomendados
- `idx_user_email` en `Account(email)`
- `idx_assistance_date` en `Assistance(date)`
- `idx_gym_city` en `Gym(city)`
- `idx_reward_available` en `Reward(available)`
- `idx_transaction_user_date` en `Transaction(id_user, date)`

### Restricciones de Integridad
- Todas las claves foráneas tienen restricciones de integridad referencial
- Los timestamps se actualizan automáticamente
- Los campos de estado tienen valores por defecto apropiados

### Consideraciones de Rendimiento
- Las tablas de transacciones pueden crecer rápidamente
- Se recomienda particionado por fecha en tablas históricas
- Los índices compuestos mejoran el rendimiento de consultas complejas

---

**Documento actualizado el 2025-10-10 - Versión 2.0**  
**Arquitectura:** Nueva arquitectura con separación de autenticación y dominio  
**Estado:** Migración completada, tabla `user` legacy eliminada  
**Sistema GymPoint v2.0**
