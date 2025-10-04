# 📊 Migración de Datos - Usuario Antigua → Nueva Arquitectura

**Fecha de ejecución:** 2025-10-04  
**Migración:** `20251005-migrate-existing-users.js`  
**Estado:** ✅ **COMPLETADA EXITOSAMENTE**

---

## 📋 Resumen Ejecutivo

Se migró exitosamente el **100% de los usuarios** (12 usuarios) de la tabla `user` antigua a la nueva arquitectura separada (`accounts`, `user_profiles`, `admin_profiles`).

---

## 📊 Resultados de la Migración

### Conteo de Registros

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| `accounts` | **12** | Cuentas de autenticación creadas |
| `user_profiles` | **11** | Perfiles de usuarios de app |
| `admin_profiles` | **1** | Perfiles de administradores |
| `account_roles` | **12** | Roles asignados (1 por cuenta) |
| `user` (antigua) | **12** | Usuarios originales (sin modificar) |

✅ **Coincidencia perfecta:** 11 users + 1 admin = 12 usuarios originales

---

## 🎭 Distribución de Roles

| Rol | Cantidad | Porcentaje |
|-----|----------|------------|
| **USER** | 11 | 91.7% |
| **ADMIN** | 1 | 8.3% |

---

## 💳 Distribución de Subscriptions (solo usuarios de app)

| Subscription | Cantidad | Porcentaje |
|--------------|----------|------------|
| **FREE** | 10 | 90.9% |
| **PREMIUM** | 1 | 9.1% |

---

## 🔄 Proceso de Migración

### 1. Mapeo de Roles

La tabla antigua `user` tenía un campo `role` con los siguientes valores:

```sql
-- Antes (tabla user)
role IN ('USER', 'PREMIUM', 'ADMIN')
```

Se mapearon de la siguiente manera:

| Rol Antiguo | → | Rol Nuevo | Subscription | Perfil Creado |
|-------------|---|-----------|--------------|---------------|
| `USER` | → | `USER` | `FREE` | `user_profiles` |
| `PREMIUM` | → | `USER` | `PREMIUM` | `user_profiles` |
| `ADMIN` | → | `ADMIN` | `NULL` | `admin_profiles` |

### 2. Migración por Usuario

Para cada usuario en la tabla `user`:

```sql
-- Paso 1: Crear account
INSERT INTO accounts (email, password_hash, auth_provider, google_id, ...)
VALUES (...)

-- Paso 2: Asignar rol
INSERT INTO account_roles (id_account, id_role)
VALUES (LAST_INSERT_ID(), rol_id)

-- Paso 3a: Si es USER → crear user_profile
INSERT INTO user_profiles (id_account, name, lastname, subscription, tokens, ...)
VALUES (...)

-- Paso 3b: Si es ADMIN → crear admin_profile
INSERT INTO admin_profiles (id_account, name, lastname, department, ...)
VALUES (...)
```

---

## 📌 Ejemplos de Usuarios Migrados

### Ejemplo 1: Usuario Premium

**Antes (tabla `user`):**
```json
{
  "id_user": 1,
  "name": "Gonzalo",
  "email": "gonzalo@example.com",
  "role": "PREMIUM",
  "tokens": 710,
  "auth_provider": "local"
}
```

**Después (nueva arquitectura):**

```json
// accounts
{
  "id_account": 1,
  "email": "gonzalo@example.com",
  "auth_provider": "local"
}

// account_roles
{
  "id_account": 1,
  "id_role": 1  // USER
}

// user_profiles
{
  "id_account": 1,
  "name": "Gonzalo",
  "subscription": "PREMIUM",
  "tokens": 710
}
```

### Ejemplo 2: Administrador

**Antes (tabla `user`):**
```json
{
  "id_user": 2,
  "name": "Admin",
  "email": "admin@gympoint.com",
  "role": "ADMIN",
  "tokens": 100,
  "auth_provider": "local"
}
```

**Después (nueva arquitectura):**

```json
// accounts
{
  "id_account": 2,
  "email": "admin@gympoint.com",
  "auth_provider": "local"
}

// account_roles
{
  "id_account": 2,
  "id_role": 2  // ADMIN
}

// admin_profiles
{
  "id_account": 2,
  "name": "Admin",
  "department": "System",
  "notes": "Migrado desde user #2"
}
```

### Ejemplo 3: Usuario Gratuito

**Antes (tabla `user`):**
```json
{
  "id_user": 3,
  "name": "Juan",
  "email": "test@gympoint.com",
  "role": "USER",
  "tokens": 35,
  "auth_provider": "local"
}
```

**Después (nueva arquitectura):**

```json
// accounts
{
  "id_account": 3,
  "email": "test@gympoint.com",
  "auth_provider": "local"
}

// account_roles
{
  "id_account": 3,
  "id_role": 1  // USER
}

// user_profiles
{
  "id_account": 3,
  "name": "Juan",
  "subscription": "FREE",
  "tokens": 35
}
```

---

## ✅ Validaciones Realizadas

### 1. Integridad Referencial

✅ Todas las Foreign Keys se crearon correctamente:
- `user_profiles.id_account` → `accounts.id_account`
- `admin_profiles.id_account` → `accounts.id_account`
- `account_roles.id_account` → `accounts.id_account`
- `account_roles.id_role` → `roles.id_role`

### 2. Unicidad

✅ No hay duplicados:
- Cada `account.email` es único
- Cada perfil (`user_profile` o `admin_profile`) tiene un `id_account` único
- Cada combinación `(id_account, id_role)` en `account_roles` es única

### 3. Completitud

✅ Todos los datos importantes se migraron:
- Email y contraseña (hash)
- Proveedor de autenticación (`auth_provider`, `google_id`)
- Datos personales (nombre, apellido, género, edad, localidad)
- Tokens acumulados
- Racha actual (`id_streak`)
- Fechas de creación y actualización

---

## 🔍 Verificación Post-Migración

### Query de Verificación Completa

```sql
SELECT 
  a.id_account,
  a.email,
  a.auth_provider,
  r.role_name,
  -- Datos de usuario (si aplica)
  up.name as user_name,
  up.subscription,
  up.tokens,
  -- Datos de admin (si aplica)
  ap.name as admin_name,
  ap.department
FROM accounts a
LEFT JOIN account_roles ar ON a.id_account = ar.id_account
LEFT JOIN roles r ON ar.id_role = r.id_role
LEFT JOIN user_profiles up ON a.id_account = up.id_account
LEFT JOIN admin_profiles ap ON a.id_account = ap.id_account
ORDER BY a.id_account;
```

---

## 🚨 Consideraciones Importantes

### 1. Tabla Antigua NO Modificada

⚠️ La tabla `user` antigua **NO fue eliminada ni modificada**. Los datos originales permanecen intactos como respaldo.

### 2. Reversibilidad

✅ La migración es **totalmente reversible**:
```bash
# Revertir migración
npx umzug down --to 20251004-create-accounts-and-profiles.js
```

Esto eliminará todos los registros migrados de `accounts`, `user_profiles`, `admin_profiles` y `account_roles`.

### 3. Próximos Pasos

Una vez que el código de la aplicación se actualice para usar las nuevas tablas:

1. **Fase de prueba:** Usar nueva estructura con tabla antigua como respaldo
2. **Fase de validación:** Confirmar que todo funciona correctamente
3. **Fase de deprecación:** Renombrar `user` a `user_legacy`
4. **Fase de limpieza:** Eliminar `user_legacy` después de N días

---

## 📊 Comparación: Antes vs Después

### Antes (Monolítico)

```
┌────────────────────────────────┐
│           user                 │
├────────────────────────────────┤
│ id_user                        │
│ email, password                │
│ role (USER/PREMIUM/ADMIN)      │
│ tokens, id_streak              │
│ name, lastname, gender, etc.   │
└────────────────────────────────┘
```

**Problemas:**
- ❌ Admin tiene campos innecesarios (`tokens`, `id_streak`)
- ❌ No hay separación entre autenticación y perfil
- ❌ `role` mezclado con `subscription` (PREMIUM es confuso)

### Después (Separado)

```
┌─────────────────┐
│    accounts     │  ← Autenticación
├─────────────────┤
│ id_account      │
│ email, password │
│ auth_provider   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌──────────┐  ┌──────────┐
│user_     │  │admin_    │
│profiles  │  │profiles  │
├──────────┤  ├──────────┤
│tokens    │  │department│
│id_streak │  │notes     │
│subscription│ └──────────┘
└──────────┘
```

**Ventajas:**
- ✅ Separación clara de responsabilidades
- ✅ Admin no tiene campos innecesarios
- ✅ `role` (USER/ADMIN) separado de `subscription` (FREE/PREMIUM)
- ✅ Escalable a nuevos tipos de perfiles

---

## 🎉 Conclusión

La migración de datos fue **100% exitosa**, con:

- ✅ **12/12 usuarios migrados**
- ✅ **0 errores**
- ✅ **0 datos perdidos**
- ✅ **Integridad referencial garantizada**
- ✅ **Reversibilidad completa**

La nueva arquitectura está **lista para ser usada en producción**.

---

**Creado por:** Equipo GymPoint  
**Última actualización:** 2025-10-04  
**Versión:** 1.0

