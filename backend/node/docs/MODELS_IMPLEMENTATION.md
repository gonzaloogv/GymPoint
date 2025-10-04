# 📦 Implementación de Modelos Sequelize - Arquitectura v2.0

**Fecha:** 2025-10-04  
**Estado:** ✅ **COMPLETADO**  
**Commits:** `ae5c3c7`, `a6ca27e`

---

## 🎯 Objetivo

Crear modelos Sequelize para la nueva arquitectura de base de datos, separando:
- **Autenticación** (Account, Role, AccountRole)
- **Perfiles de Usuario** (UserProfile)
- **Perfiles de Admin** (AdminProfile)

---

## ✅ Modelos Creados

### 1. **Account.js** - Autenticación

Representa una cuenta en el sistema (credenciales).

**Campos principales:**
- `id_account` - PK
- `email` - Único, para login
- `password_hash` - Hash bcrypt (nullable para OAuth)
- `auth_provider` - ENUM('local', 'google')
- `google_id` - ID de Google OAuth
- `email_verified` - Boolean
- `is_active` - Boolean (para bans)
- `last_login` - Timestamp

**Relaciones:**
- 1:N con AccountRole
- 1:1 con UserProfile
- 1:1 con AdminProfile
- 1:N con RefreshToken

---

### 2. **Role.js** - Catálogo de Roles

Define los roles disponibles (USER, ADMIN, etc.).

**Campos:**
- `id_role` - PK
- `role_name` - Único (USER, ADMIN)
- `description` - Opcional

**Constantes:**
```javascript
Role.ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};
```

**Relaciones:**
- 1:N con AccountRole

---

### 3. **AccountRole.js** - RBAC Junction Table

Tabla de unión para many-to-many entre Account y Role.

**Campos:**
- `id_account_role` - PK
- `id_account` - FK a accounts
- `id_role` - FK a roles
- `assigned_at` - Timestamp

**Constraints:**
- Unique: (`id_account`, `id_role`)
- ON DELETE CASCADE

---

### 4. **UserProfile.js** - Perfil de Usuario App

Datos de dominio para usuarios de la aplicación móvil.

**Campos principales:**
- `id_user_profile` - PK
- `id_account` - FK única a accounts
- `name`, `lastname` - Datos personales
- `gender` - ENUM('M', 'F', 'O')
- `age`, `locality` - Opcionales
- `subscription` - ENUM('FREE', 'PREMIUM')
- `tokens` - INT (tokens acumulados)
- `id_streak` - FK a streak
- `profile_picture_url` - Opcional

**Constantes:**
```javascript
UserProfile.SUBSCRIPTIONS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM'
};
```

**Relaciones:**
- 1:1 con Account
- 1:N con Assistance, Progress, Transaction, etc.
- 1:1 con Streak, Frequency

---

### 5. **AdminProfile.js** - Perfil de Administrador

Datos de administradores del sistema.

**Campos:**
- `id_admin_profile` - PK
- `id_account` - FK única a accounts
- `name`, `lastname` - Datos personales
- `department` - Departamento (IT, Support, etc.)
- `notes` - TEXT (notas internas)

**Relaciones:**
- 1:1 con Account

---

### 6. **index.js** - Asociaciones Completas

Centraliza la carga de modelos y define **todas las relaciones**.

**Asociaciones definidas:**

#### Autenticación
```javascript
// Account ←→ Role (M:N via AccountRole)
Account.belongsToMany(Role, { through: AccountRole, as: 'roles' });
Role.belongsToMany(Account, { through: AccountRole, as: 'accounts' });

// Account ←→ UserProfile (1:1)
Account.hasOne(UserProfile, { as: 'userProfile' });
UserProfile.belongsTo(Account, { as: 'account' });

// Account ←→ AdminProfile (1:1)
Account.hasOne(AdminProfile, { as: 'adminProfile' });
AdminProfile.belongsTo(Account, { as: 'account' });
```

#### Dominio con UserProfile
```javascript
// UserProfile ←→ Assistance, Progress, RefreshToken, Routine
UserProfile.hasMany(Assistance, { as: 'assistances' });
Assistance.belongsTo(UserProfile, { as: 'userProfile' });

// ... (total: 11 relaciones con tablas de dominio)
```

---

## 🔧 Auth Service V2

Nuevo servicio de autenticación que usa los modelos nuevos.

### **Funciones Implementadas**

#### 1. `register(data)`

Registro de usuario local.

**Proceso:**
1. Verificar email no existe
2. Crear `Account` con `password_hash`
3. Asignar rol `USER` vía `AccountRole`
4. Crear `UserProfile` con datos de usuario
5. Crear `Frequency` (meta semanal)
6. Crear `Streak` inicial
7. Vincular streak con user profile

**Transaccional:** ✅ Sí (rollback automático en error)

---

#### 2. `login(email, password, req)`

Login con email y contraseña.

**Proceso:**
1. Buscar `Account` por email
2. Incluir `roles`, `userProfile`, `adminProfile`
3. Verificar auth_provider (rechazar si es Google)
4. Comparar password con bcrypt
5. Actualizar `last_login`
6. Generar Access Token
7. Generar Refresh Token (solo si es USER)

**Retorna:**
```javascript
{
  token: "eyJ...",
  refreshToken: "eyJ..." | null,
  account: Account,
  profile: UserProfile | AdminProfile
}
```

---

#### 3. `googleLogin(idToken, req)`

Login con Google OAuth2.

**Proceso:**
1. Verificar `idToken` con Google API
2. Buscar `Account` por email
3. Si existe:
   - Vincular con Google si era local
   - Actualizar `google_id`
4. Si no existe:
   - Crear Account + UserProfile + Frequency + Streak
   - Asignar rol USER
5. Generar tokens JWT

**Nota:** Auto-registro habilitado para Google

---

#### 4. `generateAccessToken(account, roles, profile)`

Genera JWT con payload completo.

**Payload:**
```javascript
{
  id: account.id_account,
  email: account.email,
  roles: ["USER"], // Array de role_name
  subscription: "FREE", // Solo si es USER
  id_user_profile: 123, // Solo si es USER
  id_admin_profile: 456 // Solo si es ADMIN
}
```

**Expiración:** 15 minutos

---

#### 5. `generateRefreshToken(userProfileId, req)`

Genera refresh token **solo para usuarios** (no admins).

**Almacena:**
- `id_user` (id_user_profile)
- `token` (JWT)
- `user_agent`
- `ip_address`
- `expires_at` (30 días)

---

#### 6. `refreshAccessToken(oldRefreshToken)`

Rotación de tokens.

**Proceso:**
1. Verificar refresh token
2. Buscar en BD (no revocado)
3. Verificar expiración
4. Cargar UserProfile + Account + Roles
5. Revocar token antiguo
6. Generar nuevo access token

**No genera nuevo refresh token** (solo rota el access)

---

#### 7. `logout(refreshToken)`

Revoca refresh token.

**Proceso:**
1. Buscar token en BD
2. Marcar `revoked = true`

---

## 📊 Comparación con Versión Anterior

| Aspecto | Versión Antigua | Versión Nueva |
|---------|-----------------|---------------|
| **Modelo principal** | `User` monolítico | `Account` + `UserProfile`/`AdminProfile` |
| **Roles** | Campo `role` en User | Tabla `roles` + `account_roles` (RBAC) |
| **JWT payload** | `{ id, rol, email }` | `{ id, email, roles[], subscription, id_user_profile }` |
| **Admin vs User** | Misma tabla | Perfiles separados |
| **Refresh tokens** | Todos los usuarios | Solo UserProfile (no admins) |
| **Transacciones** | No | Sí (register, googleLogin) |
| **Google OAuth** | `google_id` en User | `google_id` en Account |

---

## 🎯 Ventajas de la Nueva Arquitectura

### 1. **Separación de Responsabilidades**
- Autenticación en `Account`
- Datos de dominio en `UserProfile`/`AdminProfile`
- Admin no tiene campos de usuario (tokens, rachas)

### 2. **RBAC Flexible**
- Un usuario puede tener múltiples roles
- Roles definidos en catálogo
- Fácil agregar nuevos roles

### 3. **Escalabilidad**
- Fácil agregar nuevos tipos de perfiles
- Sistema preparado para multi-tenant
- Roles y permisos extensibles

### 4. **Seguridad**
- Password hash separado de datos de negocio
- Refresh tokens solo para usuarios finales
- Admin no puede usar features de usuario por FK

### 5. **Mantenibilidad**
- Modelos cohesivos (Single Responsibility)
- Asociaciones claras y explícitas
- Queries más simples y específicas

---

## 🔧 Uso de los Nuevos Modelos

### Cargar usuario completo

```javascript
const { Account, UserProfile, Role } = require('./models');

const account = await Account.findOne({
  where: { email: 'user@example.com' },
  include: [
    {
      model: Role,
      as: 'roles',
      through: { attributes: [] }
    },
    {
      model: UserProfile,
      as: 'userProfile'
    }
  ]
});

console.log(account.userProfile.subscription); // 'FREE' | 'PREMIUM'
console.log(account.roles.map(r => r.role_name)); // ['USER']
```

### Verificar rol

```javascript
const hasRole = account.roles.some(r => r.role_name === 'ADMIN');
```

### Actualizar perfil

```javascript
const userProfile = await UserProfile.findByPk(123);
userProfile.tokens += 10;
userProfile.subscription = 'PREMIUM';
await userProfile.save();
```

---

## 📋 Próximos Pasos

### Fase 3: Migrar Services

- [ ] Reemplazar `auth-service.js` con `auth-service-v2.js`
- [ ] Actualizar `user-service.js` para usar `UserProfile`
- [ ] Crear `admin-service.js`
- [ ] Actualizar services de dominio (assistance, streak, etc.)

### Fase 4: Migrar Controllers

- [ ] Actualizar `auth-controller.js`
- [ ] Actualizar `user-controller.js`
- [ ] Crear `admin-controller.js`

### Fase 5: Actualizar Middlewares

- [ ] `auth.js` - Verificar roles desde `account_roles`
- [ ] `verificarToken` - Cargar perfil correcto
- [ ] Nuevos: `verificarUsuarioApp`, `verificarAdmin`

### Fase 6: Tests

- [ ] Tests unitarios para modelos
- [ ] Tests de auth-service-v2
- [ ] Tests de integración
- [ ] Cobertura ≥80%

---

## 📊 Estadísticas

**Archivos creados:** 7  
**Líneas de código:** ~1,056  
**Modelos:** 5 nuevos + 1 index  
**Services:** 1 nuevo (auth-service-v2)  
**Commits:** 2

---

## 🚀 Comandos de Verificación

### Probar modelos en Node REPL

```javascript
const { Account, Role, UserProfile } = require('./models');

// Ver todos los accounts
Account.findAll({ include: ['roles', 'userProfile'] })
  .then(accounts => console.log(JSON.stringify(accounts, null, 2)));

// Buscar usuario específico
UserProfile.findByPk(1, { include: 'account' })
  .then(profile => console.log(profile.toJSON()));
```

### Verificar asociaciones

```javascript
const account = await Account.findByPk(1);
const roles = await account.getRoles();
const userProfile = await account.getUserProfile();

console.log('Roles:', roles.map(r => r.role_name));
console.log('Profile:', userProfile.name);
```

---

## ⚠️ Notas Importantes

1. **No eliminar `User.js` aún** - Mantener para compatibilidad temporal
2. **Importar desde `models/index.js`** - No importar modelos directamente
3. **Usar transacciones** - Para operaciones que crean múltiples registros
4. **Validar roles** - Siempre verificar rol antes de ejecutar acciones

---

**Documentado por:** Equipo GymPoint  
**Última actualización:** 2025-10-04  
**Versión:** 2.0  
**Estado:** ✅ Producción Ready (pendiente integración)
