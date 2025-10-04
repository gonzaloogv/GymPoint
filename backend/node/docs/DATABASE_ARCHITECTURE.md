# 🏗️ Arquitectura de Base de Datos - GymPoint

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Separación de Conceptos](#separación-de-conceptos)
3. [Diagrama de Relaciones](#diagrama-de-relaciones)
4. [Tablas Core](#tablas-core)
5. [Flujos de Datos](#flujos-de-datos)
6. [Ventajas de esta Arquitectura](#ventajas-de-esta-arquitectura)

---

## 🎯 Visión General

La arquitectura de GymPoint separa claramente **autenticación** de **perfiles de dominio**, permitiendo:

- ✅ Un mismo email/cuenta puede tener diferentes "vistas" según su rol
- ✅ Los datos de negocio (asistencias, rachas, tokens) solo referencian `user_profiles`
- ✅ Los administradores no pueden "colarse" en las relaciones de usuarios
- ✅ Escalabilidad: fácil agregar nuevos tipos de perfiles (gym_owner, trainer, etc.)

---

## 🔀 Separación de Conceptos

### 1. **Autenticación** (Capa de Identidad)
```
accounts → Credenciales, proveedores OAuth, estado de cuenta
roles → Catálogo de roles del sistema
account_roles → RBAC (Role-Based Access Control)
```

### 2. **Perfiles de Dominio** (Capa de Negocio)
```
user_profiles → Usuarios de la app móvil (fitness)
admin_profiles → Administradores del sistema
```

### 3. **Datos de Negocio** (referencian solo perfiles)
```
assistances → FK a user_profiles
streaks → FK a user_profiles
transactions → FK a user_profiles
user_gym → FK a user_profiles
... todas las tablas de dominio
```

---

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────┐
│                   AUTENTICACIÓN                      │
└─────────────────────────────────────────────────────┘

          ┌──────────────┐
          │   accounts   │
          │──────────────│
          │ id_account   │◄────────┐
          │ email        │         │
          │ password_hash│         │
          │ auth_provider│         │
          │ google_id    │         │
          │ is_active    │         │
          └──────┬───────┘         │
                 │                 │
                 │                 │
          ┌──────▼────────┐        │
          │account_roles  │        │
          │───────────────│        │
          │ id_account ───┼────────┘
          │ id_role ──────┼────┐
          └───────────────┘    │
                               │
          ┌──────────────┐     │
          │    roles     │◄────┘
          │──────────────│
          │ id_role      │
          │ role_name    │ (USER, ADMIN)
          └──────────────┘

┌─────────────────────────────────────────────────────┐
│                PERFILES DE DOMINIO                   │
└─────────────────────────────────────────────────────┘

    accounts (1:1)              accounts (1:1)
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ user_profiles   │         │ admin_profiles  │
│─────────────────│         │─────────────────│
│ id_user_profile │         │ id_admin_profile│
│ id_account      │         │ id_account      │
│ name            │         │ name            │
│ lastname        │         │ lastname        │
│ subscription    │         │ department      │
│ tokens          │         │ notes           │
│ id_streak       │         └─────────────────┘
└────────┬────────┘
         │
         │ FK desde todas las tablas de negocio
         │
    ┌────▼─────┬─────────┬──────────┬─────────┐
    │          │         │          │         │
    ▼          ▼         ▼          ▼         ▼
assistance  streak  transaction user_gym  frequency
```

---

## 📋 Tablas Core

### 1. `accounts` (Autenticación)

**Propósito:** Gestionar credenciales y autenticación.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_account` | INT PK | ID único de la cuenta |
| `email` | VARCHAR(100) UNIQUE | Email para login |
| `password_hash` | VARCHAR(255) NULL | Hash de contraseña |
| `auth_provider` | ENUM('local','google') | Proveedor de auth |
| `google_id` | VARCHAR(255) NULL | ID de Google |
| `email_verified` | BOOLEAN | Email verificado |
| `is_active` | BOOLEAN | Cuenta activa (no baneada) |
| `last_login` | DATETIME | Último login |

**Relaciones:**
- 1:N con `account_roles`
- 1:1 con `user_profiles` (si tiene rol USER)
- 1:1 con `admin_profiles` (si tiene rol ADMIN)

---

### 2. `roles` (Catálogo de Roles)

**Propósito:** Definir roles disponibles en el sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_role` | INT PK | ID del rol |
| `role_name` | VARCHAR(50) UNIQUE | Nombre (USER, ADMIN, etc.) |
| `description` | VARCHAR(255) | Descripción del rol |

**Roles Iniciales:**
- `USER` → Usuario de la app móvil
- `ADMIN` → Administrador del sistema

**Extensible a:**
- `GYM_OWNER` → Dueño de gimnasio
- `TRAINER` → Entrenador
- `MODERATOR` → Moderador

---

### 3. `account_roles` (RBAC)

**Propósito:** Asignar roles a cuentas (many-to-many).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_account_role` | INT PK | ID de la asignación |
| `id_account` | INT FK | Cuenta |
| `id_role` | INT FK | Rol asignado |
| `assigned_at` | DATETIME | Fecha de asignación |

**Índice Único:** `(id_account, id_role)`

**Ejemplo:**
```sql
-- Un usuario puede tener múltiples roles
INSERT INTO account_roles (id_account, id_role) VALUES (1, 1); -- USER
INSERT INTO account_roles (id_account, id_role) VALUES (1, 3); -- GYM_OWNER
```

---

### 4. `user_profiles` (Perfil Usuario App)

**Propósito:** Datos de dominio para usuarios de la app móvil.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_user_profile` | INT PK | ID del perfil |
| `id_account` | INT FK UNIQUE | Cuenta (1:1) |
| `name` | VARCHAR(50) | Nombre |
| `lastname` | VARCHAR(50) | Apellido |
| `gender` | ENUM('M','F','O') | Género |
| `age` | TINYINT | Edad |
| `locality` | VARCHAR(100) | Localidad |
| `subscription` | ENUM('FREE','PREMIUM') | Nivel de suscripción |
| `tokens` | INT | Tokens acumulados |
| `id_streak` | INT FK | Racha actual |
| `profile_picture_url` | VARCHAR(500) | Foto de perfil |

**Relaciones:**
- **Referenciado por:** `assistances`, `streaks`, `transactions`, `user_gym`, `frequency`, etc.
- **No** es referenciado por tablas de admin

---

### 5. `admin_profiles` (Perfil Admin)

**Propósito:** Datos de administradores del sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_admin_profile` | INT PK | ID del perfil admin |
| `id_account` | INT FK UNIQUE | Cuenta (1:1) |
| `name` | VARCHAR(50) | Nombre |
| `lastname` | VARCHAR(50) | Apellido |
| `department` | VARCHAR(100) | Departamento (IT, Support) |
| `notes` | TEXT | Notas internas |

**Relaciones:**
- **No** es referenciado por tablas de negocio (asistencias, rachas, etc.)
- Aislado del flujo de usuarios

---

## 🔄 Flujos de Datos

### Flujo 1: Registro de Usuario (App Móvil)

```sql
-- 1. Crear cuenta
INSERT INTO accounts (email, password_hash, auth_provider) 
VALUES ('user@example.com', '$2b$12$...', 'local');

-- 2. Asignar rol USER
INSERT INTO account_roles (id_account, id_role) 
VALUES (LAST_INSERT_ID(), 1); -- 1 = USER

-- 3. Crear perfil de usuario
INSERT INTO user_profiles (id_account, name, lastname, subscription) 
VALUES (LAST_INSERT_ID(), 'Juan', 'Pérez', 'FREE');

-- 4. Crear frecuencia inicial
INSERT INTO frequency (id_user_profile, goal, assist) 
VALUES (LAST_INSERT_ID(), 3, 0);

-- 5. Crear racha inicial
INSERT INTO streak (id_user_profile, value, id_frequency) 
VALUES (..., 0, LAST_INSERT_ID());
```

### Flujo 2: Registro de Admin

```sql
-- 1. Crear cuenta
INSERT INTO accounts (email, password_hash, auth_provider) 
VALUES ('admin@gympoint.com', '$2b$12$...', 'local');

-- 2. Asignar rol ADMIN
INSERT INTO account_roles (id_account, id_role) 
VALUES (LAST_INSERT_ID(), 2); -- 2 = ADMIN

-- 3. Crear perfil de admin (NO user_profile)
INSERT INTO admin_profiles (id_account, name, lastname, department) 
VALUES (LAST_INSERT_ID(), 'María', 'González', 'IT');

-- ❌ NO se crea frecuencia, racha, ni tokens
```

### Flujo 3: Login

```sql
-- 1. Buscar cuenta
SELECT * FROM accounts WHERE email = 'user@example.com' AND is_active = 1;

-- 2. Obtener roles
SELECT r.role_name 
FROM account_roles ar
JOIN roles r ON ar.id_role = r.id_role
WHERE ar.id_account = ?;

-- 3a. Si tiene rol USER, cargar user_profile
SELECT * FROM user_profiles WHERE id_account = ?;

-- 3b. Si tiene rol ADMIN, cargar admin_profile
SELECT * FROM admin_profiles WHERE id_account = ?;

-- 4. Generar JWT con roles y perfil
```

### Flujo 4: Registrar Asistencia

```sql
-- ✅ CORRECTO: Usar id_user_profile
INSERT INTO assistance (id_user_profile, id_gym, date, hour) 
VALUES (?, ?, NOW(), NOW());

-- ❌ IMPOSIBLE: Admin no tiene user_profile
-- No puede "colarse" porque la FK no lo permite
```

---

## ✅ Ventajas de esta Arquitectura

### 1. **Separación de Responsabilidades**
- **`accounts`** → Solo autenticación
- **`*_profiles`** → Solo datos de dominio
- **Tablas de negocio** → Solo referencian perfiles

### 2. **Seguridad por Diseño**
- Un admin **no puede** registrar asistencias (FK a `user_profiles` no existe)
- Un usuario **no puede** acceder a funciones admin (rol diferente)
- Las FK garantizan integridad referencial

### 3. **Escalabilidad**
- Fácil agregar nuevos tipos de perfiles:
  - `gym_owner_profiles`
  - `trainer_profiles`
  - `moderator_profiles`
- Sin tocar tablas existentes

### 4. **RBAC Flexible**
- Un usuario puede tener **múltiples roles**
- Ejemplo: Usuario que también es dueño de gimnasio

### 5. **Auditoría y Control**
- `accounts.is_active` → Banear cuenta sin borrar datos
- `accounts.last_login` → Detectar cuentas inactivas
- `account_roles.assigned_at` → Historial de permisos

### 6. **Multi-Tenant Ready**
- Preparado para múltiples gimnasios con sus propios administradores
- Cada gym puede tener su `gym_owner_profile`

---

## 🔄 Migración desde Arquitectura Anterior

### Antes (tabla `user` monolítica)
```sql
user (
  id_user,
  email,
  password,
  role, -- 'USER' o 'ADMIN' mezclados
  tokens, -- Admin no lo usa pero existe
  id_streak -- Admin no lo usa pero existe
)
```

### Después (separación limpia)
```sql
accounts (id_account, email, password_hash)
  ├─ account_roles (id_account, id_role)
  ├─ user_profiles (id_account, tokens, id_streak) -- Solo USER
  └─ admin_profiles (id_account, department) -- Solo ADMIN
```

---

## 📊 Comparación

| Aspecto | Antes (monolítico) | Después (separado) |
|---------|-------------------|-------------------|
| **Claridad** | ❌ Confuso | ✅ Muy claro |
| **Seguridad** | ⚠️ Manual | ✅ Por diseño (FK) |
| **Escalabilidad** | ❌ Limitado | ✅ Flexible |
| **Mantenimiento** | ❌ Difícil | ✅ Fácil |
| **Integridad** | ⚠️ Débil | ✅ Fuerte (FK + UNIQUE) |
| **Roles múltiples** | ❌ No soportado | ✅ Nativo |

---

## 🚀 Próximos Pasos

1. ✅ Crear tablas (`20251004-create-accounts-and-profiles.js`)
2. ⏭️ Migrar datos de `user` actual a nuevo esquema
3. ⏭️ Actualizar modelos Sequelize
4. ⏭️ Actualizar servicios y controladores
5. ⏭️ Actualizar middlewares de autenticación
6. ⏭️ Actualizar tests
7. ⏭️ Deprecar tabla `user` antigua

---

**Documentación creada por:** Equipo GymPoint  
**Última actualización:** 2025-10-04  
**Versión de arquitectura:** 2.0

