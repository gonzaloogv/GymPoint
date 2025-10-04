# 🔧 Crear Administradores - GymPoint

Esta guía explica cómo crear nuevos administradores en el sistema usando la nueva arquitectura de base de datos.

---

## 📋 Tabla de Contenidos

1. [Métodos Disponibles](#métodos-disponibles)
2. [Método 1: Script Interactivo](#método-1-script-interactivo)
3. [Método 2: Script Automatizado](#método-2-script-automatizado)
4. [Verificación](#verificación)
5. [Consideraciones](#consideraciones)

---

## 🎯 Métodos Disponibles

Hay **2 formas** de crear administradores:

1. **Script Interactivo** (`create-admin.js`) - Con prompts en consola
2. **Script Automatizado** (`create-admin-script.js`) - Con argumentos de línea de comandos

---

## 🎮 Método 1: Script Interactivo

### Uso

```bash
cd backend/node
node create-admin.js
```

### Ejemplo

```bash
$ node create-admin.js

========================================
  CREAR NUEVO ADMINISTRADOR
========================================

📧 Email del admin: admin.nuevo@gympoint.com
🔒 Contraseña: MiPassword123
👤 Nombre: María
👤 Apellido: González
🏢 Departamento (ej: IT, Support, Management): IT
📝 Notas (opcional): Administradora principal del sistema

🔄 Creando administrador...

✅ Contraseña hasheada
✅ Account creado (ID: 13)
✅ Rol ADMIN asignado
✅ Admin profile creado

========================================
  ADMINISTRADOR CREADO EXITOSAMENTE
========================================

📧 Email: admin.nuevo@gympoint.com
👤 Nombre: María González
🏢 Departamento: IT
🔢 Account ID: 13
🎭 Rol: ADMIN
📝 Notas: Administradora principal del sistema

✅ El administrador puede iniciar sesión ahora
```

### Ventajas

- ✅ Más seguro (la contraseña no queda en el historial de comandos)
- ✅ Interactivo y guiado
- ✅ Ideal para uso manual

---

## ⚡ Método 2: Script Automatizado

### Uso

```bash
cd backend/node
node create-admin-script.js <email> <password> <nombre> <apellido> [departamento] [notas]
```

### Sintaxis

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `email` | String | ✅ Sí | Email del administrador (debe ser único) |
| `password` | String | ✅ Sí | Contraseña (mínimo 6 caracteres) |
| `nombre` | String | ✅ Sí | Nombre del administrador |
| `apellido` | String | ✅ Sí | Apellido del administrador |
| `departamento` | String | ❌ No | Departamento (default: "System") |
| `notas` | String | ❌ No | Notas adicionales (opcional) |

### Ejemplos

#### Ejemplo Básico (solo campos requeridos)

```bash
node create-admin-script.js admin@example.com Pass123 Juan Pérez
```

**Resultado:**
- Email: `admin@example.com`
- Contraseña: `Pass123`
- Nombre: `Juan Pérez`
- Departamento: `System` (default)
- Notas: ` ` (vacío)

#### Ejemplo Completo

```bash
node create-admin-script.js admin2@gympoint.com Admin456 Maria Gonzalez IT "Administradora principal"
```

**Resultado:**
- Email: `admin2@gympoint.com`
- Contraseña: `Admin456`
- Nombre: `Maria Gonzalez`
- Departamento: `IT`
- Notas: `Administradora principal`

#### Ejemplo con Departamento sin Notas

```bash
node create-admin-script.js support@gympoint.com Support789 Carlos Lopez Support
```

**Resultado:**
- Email: `support@gympoint.com`
- Contraseña: `Support789`
- Nombre: `Carlos Lopez`
- Departamento: `Support`
- Notas: ` ` (vacío)

### Salida del Script

```bash
$ node create-admin-script.js admin.test@gympoint.com TestAdmin123 Test Admin IT "Administrador de prueba"

========================================
  CREAR ADMINISTRADOR (Script)
========================================

📧 Email: admin.test@gympoint.com
👤 Nombre: Test Admin
🏢 Departamento: IT

✅ Contraseña hasheada
✅ Account creado (ID: 25)
✅ Rol ADMIN asignado
✅ Admin profile creado

========================================
  ✅ ADMINISTRADOR CREADO EXITOSAMENTE
========================================

🔢 Account ID: 25
📧 Email: admin.test@gympoint.com
👤 Nombre completo: Test Admin
🏢 Departamento: IT
🎭 Rol: ADMIN
📝 Notas: Administrador de prueba

✅ Puede iniciar sesión ahora
```

### Ventajas

- ✅ Rápido y eficiente
- ✅ Scriptable (ideal para automatización)
- ✅ Perfecto para CI/CD o scripts de deployment

### ⚠️ Advertencia de Seguridad

**NO** uses este método en producción si el historial de comandos es visible. La contraseña quedará registrada en:
- Historial de bash/zsh
- Logs del sistema
- Historial de terminal

**Recomendación:** Usa el método interactivo en producción o genera una contraseña temporal y obliga al admin a cambiarla en el primer login.

---

## 🔍 Verificación

### Verificar que el Admin se Creó Correctamente

Puedes verificar en la base de datos directamente:

```sql
-- Ver administradores
SELECT 
  a.id_account,
  a.email,
  a.is_active,
  r.role_name,
  ap.name,
  ap.lastname,
  ap.department
FROM accounts a
JOIN account_roles ar ON a.id_account = ar.id_account
JOIN roles r ON ar.id_role = r.id_role
JOIN admin_profiles ap ON a.id_account = ap.id_account
WHERE r.role_name = 'ADMIN'
ORDER BY a.created_at DESC;
```

### Verificar Login

Puedes probar el login usando Postman:

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin.test@gympoint.com",
  "password": "TestAdmin123"
}
```

**Respuesta esperada:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 25,
    "email": "admin.test@gympoint.com",
    "role": "ADMIN",
    "name": "Test",
    "lastname": "Admin"
  }
}
```

---

## 📝 Consideraciones

### ✅ Lo que SE Crea

Cuando ejecutas estos scripts, se crean **3 registros** en la base de datos:

1. **`accounts`** - Credenciales y autenticación
   - Email único
   - Contraseña hasheada con bcrypt (12 rounds)
   - `auth_provider: 'local'`
   - `email_verified: true`
   - `is_active: true`

2. **`account_roles`** - Asignación de rol
   - `id_role: 2` (ADMIN)

3. **`admin_profiles`** - Perfil de administrador
   - Nombre y apellido
   - Departamento
   - Notas

### ❌ Lo que NO se Crea

- **NO** se crea `user_profiles` (los administradores no son usuarios de la app)
- **NO** se asignan tokens (solo usuarios de la app tienen tokens)
- **NO** se crea racha (solo usuarios de la app tienen rachas)

### 🔐 Seguridad

- Las contraseñas se hashean con **bcrypt** (12 rounds)
- Los emails deben ser **únicos** (validación automática)
- Las contraseñas deben tener **mínimo 6 caracteres**
- Las cuentas se crean con `email_verified: true` y `is_active: true`

### 🎭 Roles vs Perfiles

| Tipo | Rol | Perfil | Puede acceder a |
|------|-----|--------|-----------------|
| **Usuario App** | `USER` | `user_profiles` | App móvil |
| **Administrador** | `ADMIN` | `admin_profiles` | Panel de administración |

**Importante:** Los administradores **NO** pueden:
- Usar la app móvil como usuarios normales
- Registrar asistencias a gimnasios
- Ganar tokens
- Tener rachas

Los administradores **SÍ** pueden:
- Gestionar gimnasios
- Ver estadísticas
- Ajustar tokens de usuarios
- Administrar recompensas
- Gestionar usuarios

---

## 🔄 Actualización de Administradores

Para actualizar datos de un administrador existente:

```sql
-- Actualizar perfil de admin
UPDATE admin_profiles 
SET 
  name = 'Nuevo Nombre',
  lastname = 'Nuevo Apellido',
  department = 'Nuevo Departamento',
  notes = 'Nuevas notas'
WHERE id_account = ?;

-- Actualizar email (cuidado: debe ser único)
UPDATE accounts 
SET email = 'nuevo.email@gympoint.com'
WHERE id_account = ?;

-- Cambiar contraseña (debe ser hash de bcrypt)
UPDATE accounts 
SET password_hash = '$2a$12$...'
WHERE id_account = ?;

-- Desactivar cuenta
UPDATE accounts 
SET is_active = false
WHERE id_account = ?;
```

---

## 🚨 Solución de Problemas

### Error: "Email ya está registrado"

**Causa:** El email ya existe en la tabla `accounts`.

**Solución:** Usa otro email o elimina el registro existente si es de prueba.

```sql
-- Verificar si existe
SELECT * FROM accounts WHERE email = 'admin@example.com';

-- Eliminar (CUIDADO: esto eliminará también el perfil por CASCADE)
DELETE FROM accounts WHERE email = 'admin@example.com';
```

### Error: "La contraseña debe tener al menos 6 caracteres"

**Causa:** La contraseña proporcionada es demasiado corta.

**Solución:** Usa una contraseña de al menos 6 caracteres.

### Error: "bcrypt/bcryptjs no está instalado"

**Causa:** La dependencia no está instalada.

**Solución:**

```bash
cd backend/node
npm install bcryptjs
```

---

## 📚 Recursos Relacionados

- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Arquitectura completa de BD
- [DATA_MIGRATION.md](./DATA_MIGRATION.md) - Migración de datos
- [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) - Testing de endpoints

---

**Creado por:** Equipo GymPoint  
**Última actualización:** 2025-10-04  
**Versión:** 1.0

