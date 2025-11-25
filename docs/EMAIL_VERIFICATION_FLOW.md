# Sistema de Verificación de Email - Documentación Completa

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo Completo de Verificación](#flujo-completo-de-verificación)
4. [Implementación Backend](#implementación-backend)
5. [Configuración SMTP](#configuración-smtp)
6. [API Endpoints](#api-endpoints)
7. [Seguridad y Rate Limiting](#seguridad-y-rate-limiting)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Migración y Deployment](#migración-y-deployment)

---

## Resumen Ejecutivo

Sistema completo de verificación de email implementado con:
- ✅ **SMTP propio** sin dependencias de servicios externos pagos
- ✅ **Tokens UUID** con expiración de 24 horas
- ✅ **Rate limiting** de 5 minutos entre reenvíos
- ✅ **Plantillas HTML responsive** compatibles con todos los clientes de email
- ✅ **Validación DNS** de dominios en registro
- ✅ **Cron job** para limpieza automática de tokens
- ✅ **Deep linking** para redirigir a la app móvil

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO DE REGISTRO                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Frontend Mobile │
│ RegisterScreen  │───┐
└─────────────────┘   │
                       │ POST /api/auth/register
                       │ { email, password, ... }
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Backend - auth-controller    │
         │ auth-service.register()      │
         └─────────────────────────────┘
                       │
                       ├──► Validar email con Joi + DNS
                       │
                       ├──► Crear cuenta (email_verified=false)
                       │
                       ├──► Generar token UUID
                       │
                       ├──► Guardar en email_verification_tokens
                       │
                       └──► Enviar email con link
                               │
                               ▼
                     ┌──────────────────┐
                     │  Email Service   │
                     │  (nodemailer)    │
                     └──────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │   SMTP Server    │
                     │  (Plesk/Gmail)   │
                     └──────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │ Usuario recibe   │
                     │ email con link   │
                     └──────────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
         │ Click en link del email                   │
         │ https://api.gympoint.app/api/auth/        │
         │   verify-email?token=<uuid>               │
         │                                           │
         ▼                                           │
┌─────────────────────────────┐                     │
│ Backend - auth-controller    │                     │
│ verifyEmail()                │                     │
└─────────────────────────────┘                     │
         │                                           │
         ├──► Buscar token válido en DB              │
         │    (no usado, no expirado)                │
         │                                           │
         ├──► Marcar token como usado                │
         │                                           │
         ├──► Actualizar email_verified=true         │
         │                                           │
         ├──► Enviar email de bienvenida            │
         │                                           │
         └──► Redirigir a la app                    │
              gympoint://verify-success              │
                                                     │
                                                     ▼
                                           ┌──────────────────┐
                                           │  App Móvil       │
                                           │  Verified Screen │
                                           └──────────────────┘
```

### Base de Datos

**Tabla:** `email_verification_tokens`

```sql
CREATE TABLE email_verification_tokens (
  id_verification_token INT PRIMARY KEY AUTO_INCREMENT,
  id_account INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,  -- UUID v4
  expires_at DATETIME NOT NULL,         -- created_at + 24h
  used_at DATETIME NULL,                -- NULL hasta verificación
  created_at DATETIME DEFAULT NOW(),

  FOREIGN KEY (id_account) REFERENCES accounts(id_account) ON DELETE CASCADE,
  INDEX idx_verification_account (id_account),
  INDEX idx_verification_expiration (expires_at, used_at)
);
```

---

## Flujo Completo de Verificación

### 1. Registro de Usuario

**Endpoint:** `POST /api/auth/register`

```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John",
  "lastname": "Doe",
  "gender": "M",
  "locality": "Buenos Aires",
  "birth_date": "1990-01-15",
  "frequency_goal": 3
}

// Response (201)
{
  "token": "eyJhbGciOiJIUzI1NiIs...",  // Access token
  "refreshToken": "eyJhbGciOiJIUzI1...",  // Refresh token
  "user": {
    "id": 123,
    "email": "user@example.com",
    "email_verified": false,  // ← Email no verificado aún
    "name": "John",
    "lastname": "Doe"
  }
}
```

**Proceso en Backend:**

1. **Validación de Email:**
   ```javascript
   // 1. Formato Joi
   const normalizedEmail = await validateAndNormalizeEmail(command.email);
   // → "user@example.com" (lowercase, trimmed)

   // 2. DNS validation
   await ensureDomainAcceptsMail(normalizedEmail);
   // → Verifica MX records o A/AAAA
   ```

2. **Crear Cuenta:**
   ```javascript
   const account = await accountRepository.createAccount({
     email: normalizedEmail,
     password_hash: await bcrypt.hash(password, 12),
     auth_provider: 'local',
     email_verified: false,  // ← Importante
     is_active: true
   });
   ```

3. **Generar y Enviar Token:**
   ```javascript
   const token = uuidv4();  // "550e8400-e29b-41d4-a716-446655440000"
   const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);  // +24h

   await emailVerificationRepository.createVerificationToken({
     id_account: account.id_account,
     token,
     expires_at: expiresAt
   });

   // Enviar email asincrónicamente (no bloquea respuesta)
   setImmediate(async () => {
     await emailService.sendVerificationEmail({
       email: normalizedEmail,
       name: profile.name,
       token
     });
   });
   ```

4. **Retornar Tokens de Sesión:**
   - A pesar de que el email no está verificado, se genera session
   - El login está bloqueado hasta verificar (ver paso 4)

---

### 2. Usuario Recibe Email

**Asunto:** "Confirma tu cuenta en GymPoint"

**Contenido:** Plantilla HTML responsive con:
- Saludo personalizado
- Botón CTA: "Confirmar mi cuenta"
- Link alternativo en texto plano
- Advertencia de expiración (24 horas)
- Lista de beneficios de GymPoint
- Footer con contacto de soporte

**Link de verificación:**
```
https://api.gympoint.app/api/auth/verify-email?token=550e8400-e29b-41d4-a716-446655440000
```

**Compatibilidad:**
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop, iOS, Android)
- ✅ Apple Mail (iOS, macOS)
- ✅ Yahoo, Proton Mail, otros

---

### 3. Verificación del Token

**Endpoint:** `GET /api/auth/verify-email?token=<uuid>`

```javascript
// Proceso en backend
const verifyEmailToken = async (token) => {
  // 1. Buscar token válido
  const verificationToken = await emailVerificationRepository.findValidToken(token);
  // Query: WHERE token = ? AND used_at IS NULL AND expires_at > NOW()

  if (!verificationToken) {
    throw new ValidationError(
      'Token inválido o expirado. Solicita un nuevo enlace.'
    );
  }

  // 2. Marcar como usado y verificar cuenta (transacción atómica)
  await runWithRetryableTransaction(async (transaction) => {
    await emailVerificationRepository.markAsUsed(token, { transaction });

    await accountRepository.updateAccount(
      verificationToken.id_account,
      { email_verified: true },
      { transaction }
    );
  });

  // 3. Enviar email de bienvenida (opcional, asíncrono)
  setImmediate(async () => {
    await emailService.sendWelcomeEmail({
      email: account.email,
      name: account.userProfile.name
    });
  });

  return account;
};
```

**Respuestas:**

```javascript
// Éxito (200) - Acceso desde API
{
  "success": true,
  "message": "¡Email verificado exitosamente! Ya puedes iniciar sesión.",
  "account": {
    "email": "user@example.com",
    "verified": true
  }
}

// Éxito (302) - Acceso desde navegador
// → Redirige a: gympoint://verify-success

// Error (400) - Token inválido
{
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Token de verificación inválido o expirado."
  }
}
```

**Página HTML de Error** (para navegador):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <title>Error de Verificación - GymPoint</title>
</head>
<body>
  <div class="container">
    <h1>❌ Error de Verificación</h1>
    <p>Token de verificación inválido o expirado.</p>
    <p>Contacta con soporte: <a href="mailto:soporte@gympoint.app">soporte@gympoint.app</a></p>
  </div>
</body>
</html>
```

---

### 4. Login Requiere Email Verificado

**Endpoint:** `POST /api/auth/login`

```javascript
const login = async (email, password) => {
  const account = await accountRepository.findByEmail(email);

  // Verificar contraseña
  const passwordOk = await bcrypt.compare(password, account.password_hash);
  if (!passwordOk) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // CRÍTICO: Bloquear login si email no verificado
  if (!account.email_verified && account.auth_provider === 'local') {
    throw new UnauthorizedError(
      'Debes verificar tu email antes de iniciar sesión. ' +
      'Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.'
    );
  }

  // ... generar tokens y retornar sesión
};
```

**Respuesta de Error:**

```json
{
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación."
  }
}
```

---

### 5. Reenvío de Verificación

**Endpoint:** `POST /api/auth/resend-verification`

```javascript
// Request
{
  "email": "user@example.com"
}

// Response (200)
{
  "success": true,
  "message": "Email de verificación enviado. Revisa tu bandeja de entrada y spam."
}

// Error (400) - Email ya verificado
{
  "error": {
    "code": "ALREADY_VERIFIED",
    "message": "Este email ya está verificado"
  }
}

// Error (429) - Rate limit excedido
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Ya enviamos un email recientemente. Intenta en 5 minutos."
  }
}
```

**Proceso:**

```javascript
const resendVerificationEmail = async (email) => {
  const account = await accountRepository.findByEmail(email);

  // 1. Validar que el email exista
  if (!account) {
    throw new ValidationError('No existe una cuenta con ese email');
  }

  // 2. Validar que NO esté ya verificado
  if (account.email_verified) {
    throw new ValidationError('Este email ya está verificado');
  }

  // 3. Rate limiting: máximo 1 cada 5 minutos
  const recentTokens = await emailVerificationRepository.findByAccount(account.id_account);
  const recentToken = recentTokens.find(
    (t) => !t.used_at && new Date(t.created_at) > new Date(Date.now() - 5 * 60 * 1000)
  );

  if (recentToken) {
    throw new Error(
      'Ya enviamos un email recientemente. Revisa spam o intenta en 5 minutos.'
    );
  }

  // 4. Revocar tokens anteriores
  await emailVerificationRepository.revokeAllByAccount(account.id_account);

  // 5. Generar y enviar nuevo token
  await generateAndSendVerificationEmail({
    accountId: account.id_account,
    email: account.email,
    name: account.userProfile.name
  });
};
```

---

## Implementación Backend

### Estructura de Archivos

```
backend/node/
├── migrations/
│   └── 20260102-create-email-verification-table.js  ← Crear tabla
├── infra/db/repositories/
│   ├── index.js                                      ← Export nuevo repo
│   └── email-verification.repository.js             ← CRUD tokens
├── utils/email/
│   ├── email.service.js                             ← Servicio nodemailer
│   └── templates/
│       ├── verification.template.js                 ← Email verificación
│       └── welcome.template.js                      ← Email bienvenida
├── services/
│   └── auth-service.js                              ← Lógica de negocio
├── controllers/
│   └── auth-controller.js                           ← HTTP handlers
├── routes/
│   └── auth-routes.js                               ← Rutas API
├── jobs/
│   └── cleanup-job.js                               ← Cron job limpieza
└── .env.example                                     ← Variables SMTP
```

### Repositorio: email-verification.repository.js

```javascript
// CRUD completo de tokens
const emailVerificationRepository = {
  // Crear token
  async createVerificationToken(data, options = {}),

  // Buscar por token UUID
  async findByToken(token, options = {}),

  // Buscar por cuenta
  async findByAccount(idAccount, options = {}),

  // Buscar token válido (no usado, no expirado)
  async findValidToken(token, options = {}),

  // Marcar como usado
  async markAsUsed(token, options = {}),

  // Revocar todos los tokens de una cuenta
  async revokeAllByAccount(idAccount, options = {}),

  // Limpiar tokens expirados (cron job)
  async cleanupExpiredTokens(options = {})
};
```

**Importante:** QueryTypes.UPDATE/DELETE devuelven `OkPacket`, no array:

```javascript
// ❌ INCORRECTO
const [, affectedRows] = await sequelize.query(query, {
  type: QueryTypes.UPDATE
});

// ✅ CORRECTO
const [result] = await sequelize.query(query, {
  type: QueryTypes.UPDATE
});
return result.affectedRows > 0;
```

---

## Configuración SMTP

### Variables de Entorno

**Archivo:** `.env` / `.env.local`

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com           # Desarrollo: smtp.mailtrap.io
SMTP_PORT=587                      # 587 (TLS) o 465 (SSL)
SMTP_SECURE=false                  # true para puerto 465
SMTP_USER=noreply@gympoint.app
SMTP_PASSWORD=your-smtp-password

# Email Settings
EMAIL_FROM="GymPoint <noreply@gympoint.app>"

# URLs
EMAIL_VERIFICATION_URL=https://api.gympoint.app/api/auth/verify-email
APP_DEEP_LINK_SCHEME=gympoint://
```

### Proveedores SMTP Recomendados

#### Desarrollo/Testing

**1. Mailtrap.io** (Recomendado)
- ✅ Gratis: 500 emails/mes
- ✅ Inbox virtual para testing
- ✅ Sin spam, sin deliverability issues

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<tu-usuario-mailtrap>
SMTP_PASSWORD=<tu-password-mailtrap>
```

**2. Gmail con App Password**
- ⚠️ Solo para testing personal
- ⚠️ Límite: 500 emails/día
- ⚠️ Requiere 2FA habilitado

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=<app-password-de-16-digitos>
```

#### Producción

**1. SMTP del Servidor (Plesk/cPanel)** (Recomendado)
```bash
SMTP_HOST=mail.gympoint.app
SMTP_PORT=587
SMTP_USER=noreply@gympoint.app
SMTP_PASSWORD=<password-desde-plesk>
```

**Configuración DNS requerida:**
```
;; SPF (previene spoofing)
gympoint.app. TXT "v=spf1 include:_spf.plesk.com ~all"

;; DKIM (firma digital)
default._domainkey.gympoint.app. TXT "v=DKIM1; k=rsa; p=MIGfMA0G..."

;; DMARC (política de reportes)
_dmarc.gympoint.app. TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@gympoint.app"
```

**2. Servicios Externos Gratuitos**

| Proveedor | Plan Free | Límite | Integración |
|-----------|-----------|--------|-------------|
| **Brevo** (Sendinblue) | Gratis | 300 emails/día | SMTP directo |
| **Mailjet** | Gratis | 200 emails/día | SMTP directo |
| **SendGrid** | Gratis | 100 emails/día | SMTP directo |

---

## API Endpoints

### GET /api/auth/verify-email

**Descripción:** Verifica el email usando token enviado por correo

**Query Params:**
- `token` (string, required): Token UUID

**Headers:**
- `Accept: text/html` → Respuesta HTML con página de éxito/error
- `Accept: application/json` → Respuesta JSON

**Responses:**

```javascript
// 200 OK (JSON)
{
  "success": true,
  "message": "¡Email verificado exitosamente!",
  "account": {
    "email": "user@example.com",
    "verified": true
  }
}

// 302 Found (HTML) → Redirige a gympoint://verify-success

// 400 Bad Request
{
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Token inválido o expirado"
  }
}
```

---

### POST /api/auth/resend-verification

**Descripción:** Reenvía el email de verificación

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**

```javascript
// 200 OK
{
  "success": true,
  "message": "Email enviado. Revisa tu bandeja de entrada y spam."
}

// 400 Bad Request
{
  "error": {
    "code": "ALREADY_VERIFIED",
    "message": "Este email ya está verificado"
  }
}

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Intenta nuevamente en 5 minutos."
  }
}
```

---

## Seguridad y Rate Limiting

### Rate Limiting Implementado

**1. Reenvío de Verificación:** 5 minutos entre envíos

```javascript
const recentTokens = await emailVerificationRepository.findByAccount(accountId);
const recentToken = recentTokens.find(
  (t) => !t.used_at && new Date(t.created_at) > new Date(Date.now() - 5 * 60 * 1000)
);

if (recentToken) {
  throw new Error('Intenta en 5 minutos');
}
```

**2. Global API Rate Limit:** (configurado en `config/rate-limit.js`)
- 100 requests/15min por IP

**3. Auth Endpoints Rate Limit:**
- 10 requests/15min por IP

### Tokens Single-Use

Los tokens de verificación son **single-use**:

```sql
-- Marcar como usado
UPDATE email_verification_tokens
SET used_at = NOW()
WHERE token = ? AND used_at IS NULL;

-- Buscar tokens válidos
SELECT * FROM email_verification_tokens
WHERE token = ?
  AND used_at IS NULL      -- No usado
  AND expires_at > NOW();  -- No expirado
```

### Expiración de Tokens

- **Tokens nuevos:** Expiración de 24 horas
- **Cleanup automático:** Diario a las 3 AM
  - Tokens expirados (`expires_at < NOW()`)
  - Tokens usados hace >7 días (`used_at < NOW() - 7 days`)

### Verificación de Email en Runtime

El sistema implementa **verificación continua** de `email_verified` en 3 puntos críticos con **período de gracia de 7 días**:

#### 1. Login (auth-service.js)

```javascript
// Solo aplicar a usuarios con rol USER, no ADMIN
// Período de gracia de 7 días desde registro
const isUser = account.roles?.some((role) => role.role_name === 'USER');
const graceDeadline = account.email_verification_deadline;
const graceActive = graceDeadline && new Date() < new Date(graceDeadline);
const mustVerifyEmail = account.auth_provider === 'local' && isUser && !graceActive;

if (!account.email_verified && mustVerifyEmail) {
  throw new UnauthorizedError(
    'Tu período de gracia ha expirado. Debes verificar tu email antes de iniciar sesión.'
  );
}
```

**Comportamiento:**
- ✅ Permite login durante 7 días sin verificar (período de gracia)
- ❌ Bloquea login después de 7 días si no verificó
- ✅ Permite login para Google OAuth (siempre `email_verified=true`)
- ✅ Permite login para ADMIN sin verificar (no aplica requisito)

#### 2. Refresh Token (auth-service.js)

```javascript
// Verificar antes de generar nuevos tokens
// Período de gracia de 7 días desde registro
const isUser = account.roles?.some((role) => role.role_name === 'USER');
const graceDeadline = account.email_verification_deadline;
const graceActive = graceDeadline && new Date() < new Date(graceDeadline);
const mustVerifyEmail = account.auth_provider === 'local' && isUser && !graceActive;

if (!account.email_verified && mustVerifyEmail) {
  throw new UnauthorizedError(
    'Tu período de gracia ha expirado. Debes verificar tu email antes de continuar.'
  );
}
```

**Comportamiento:**
- ✅ Permite renovación durante 7 días sin verificar
- ❌ Impide renovación después de 7 días si no verificó
- Usuario puede usar la app durante 7 días sin fricción

#### 3. Middleware de Autenticación (middlewares/auth.js)

```javascript
// Verificar en cada request autenticado
// Período de gracia de 7 días desde registro
const isUser = account.roles?.some((role) => role.role_name === 'USER');
const graceDeadline = account.email_verification_deadline;
const graceActive = graceDeadline && new Date() < new Date(graceDeadline);
const mustVerifyEmail = account.auth_provider === 'local' && isUser && !graceActive;

if (!account.email_verified && mustVerifyEmail) {
  return res.status(403).json({
    error: {
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Tu período de gracia ha expirado. Debes verificar tu email antes de continuar.'
    }
  });
}
```

**Comportamiento:**
- ✅ Permite acceso durante 7 días sin verificar
- ❌ Bloquea acceso después de 7 días si no verificó
- ✅ Excepto endpoints públicos (register, verify-email, resend-verification)
- ✅ No afecta a ADMIN

### Período de Gracia de 7 Días

**Campo en BD:** `accounts.email_verification_deadline`

**Estrategia:**
- Al registrarse: `deadline = NOW() + 7 días`
- Durante gracia: Usuario puede usar app sin restricciones
- Después de gracia: Bloqueo total hasta verificar
- Al verificar: `deadline = NULL` (ya no aplica)

**Migración para usuarios existentes:**
```sql
-- Usuarios no verificados reciben 7 días desde ahora
UPDATE accounts
SET email_verification_deadline = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE auth_provider = 'local'
  AND email_verified = false;
```

### Estrategia de Bloqueo

**Opción implementada:** Emitir tokens + período de gracia de 7 días

**Ventajas:**
- ✅ Mejor UX: Usuario puede empezar a usar la app inmediatamente
- ✅ Sin fricción: 7 días para verificar sin bloqueos
- ✅ Misma seguridad: Después de 7 días, bloqueo total
- ✅ Menos cambios en clientes: Flujo de registro estándar
- ✅ Flexible: Tiempo suficiente para problemas de email (spam, etc.)

**Flujo típico - Verificación temprana:**
1. Usuario se registra → Recibe access + refresh tokens + deadline (7 días)
2. Usuario usa la app normalmente durante 3 días ✅
3. Usuario hace click en link del email → Email verificado
4. Deadline se limpia → Usuario puede seguir usando la app indefinidamente ✅

**Flujo típico - Verificación tardía:**
1. Usuario se registra → Recibe access + refresh tokens + deadline (7 días)
2. Usuario usa la app normalmente durante 8 días ❌
3. Día 8: Usuario intenta login → 403 "Período de gracia expirado"
4. Frontend muestra pantalla "Verifica tu email para continuar"
5. Usuario hace click en link del email → Email verificado
6. Usuario vuelve a la app → Login exitoso ✅

**Respuesta de registro/login incluye deadline:**
```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "account": {
    "email": "user@example.com",
    "email_verified": false,
    "email_verification_deadline": "2025-01-10T12:00:00.000Z"
  }
}
```

**Frontend puede calcular días restantes:**
```javascript
const daysRemaining = Math.ceil(
  (new Date(account.email_verification_deadline) - new Date()) / (1000 * 60 * 60 * 24)
);

if (daysRemaining <= 3 && !account.email_verified) {
  showWarning(`Verifica tu email en ${daysRemaining} días o perderás acceso`);
}
```

---

## Testing

### Test Manual - Flujo Completo

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "name": "Test",
    "lastname": "User",
    "gender": "M",
    "locality": "Test City",
    "frequency_goal": 3
  }'

# Respuesta: { "user": { "email_verified": false } }

# 2. Revisar email en Mailtrap
# Link: http://localhost:3000/api/auth/verify-email?token=<uuid>

# 3. Verificar token (copiar desde email)
curl http://localhost:3000/api/auth/verify-email?token=<uuid-del-email>

# Respuesta: { "success": true, "account": { "verified": true } }

# 4. Intentar login sin verificar (debería fallar antes de paso 3)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "test1234" }'

# Error: "Debes verificar tu email antes de iniciar sesión"

# 5. Login después de verificar
# (mismo comando, ahora debería funcionar)
```

### Test de Reenvío

```bash
# 1. Solicitar reenvío
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com" }'

# Respuesta: { "success": true }

# 2. Intentar reenvío inmediato (debería fallar con 429)
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com" }'

# Error: "Rate limit exceeded. Intenta en 5 minutos."
```

### Test de Expiración

```sql
-- Forzar expiración de un token (para testing)
UPDATE email_verification_tokens
SET expires_at = DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE token = '<uuid>';

-- Intentar verificar → debería fallar
```

---

## Troubleshooting

### Problema: Emails no se envían

**Síntomas:**
- Usuario no recibe email de verificación
- Logs muestran: `Error enviando email de verificación`

**Diagnóstico:**

```bash
# 1. Verificar configuración SMTP
node -e "
const emailService = require('./utils/email/email.service');
console.log('Transporter initialized:', emailService.initialized);
"

# 2. Test de conexión SMTP
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
});
transporter.verify().then(console.log).catch(console.error);
"
```

**Soluciones:**
- ✅ Verificar credenciales SMTP en `.env`
- ✅ Confirmar que `SMTP_HOST` y `SMTP_PORT` son correctos
- ✅ Revisar firewall (puerto 587/465 debe estar abierto)
- ✅ Gmail: activar "App Passwords" en configuración de seguridad

---

### Problema: Token inválido o expirado

**Síntomas:**
- Usuario hace click en link y recibe error
- Error: `VERIFICATION_FAILED`

**Diagnóstico:**

```sql
-- Buscar tokens del usuario
SELECT
  id_verification_token,
  token,
  expires_at,
  used_at,
  created_at,
  CASE
    WHEN used_at IS NOT NULL THEN 'USED'
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'VALID'
  END as status
FROM email_verification_tokens
WHERE id_account = <ID_CUENTA>
ORDER BY created_at DESC
LIMIT 5;
```

**Soluciones:**
- ✅ Token usado → Solicitar reenvío desde la app
- ✅ Token expirado (>24h) → Solicitar reenvío
- ✅ Token no encontrado → Verificar que el link sea correcto

---

### Problema: Rate limit bloqueando usuarios legítimos

**Síntomas:**
- Error `RATE_LIMIT_EXCEEDED` frecuente
- Usuarios reportan que no pueden solicitar reenvío

**Diagnóstico:**

```sql
-- Ver tokens recientes del usuario
SELECT
  created_at,
  used_at,
  TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_ago
FROM email_verification_tokens
WHERE id_account = <ID_CUENTA>
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;
```

**Ajuste del Rate Limit:**

```javascript
// En auth-service.js (línea ~283)
// Cambiar de 5 minutos a 3 minutos
const recentToken = recentTokens.find(
  (t) => !t.used_at && new Date(t.created_at) > new Date(Date.now() - 3 * 60 * 1000)
);
```

---

## Migración y Deployment

### Pasos para Deployment

**1. Instalar Dependencias**

```bash
cd backend/node
npm install nodemailer uuid
```

**2. Ejecutar Migración**

```bash
node migrate.js
```

**Salida esperada:**
```
[Email Verification] Creando tabla email_verification_tokens...
Tabla "email_verification_tokens" creada
Índice idx_verification_account creado
Índice idx_verification_expiration creado
MIGRACIÓN EMAIL VERIFICATION COMPLETADA
```

**3. Configurar Variables de Entorno**

En Plesk/cPanel → PHP y dominios → Variables de entorno:

```bash
SMTP_HOST=mail.gympoint.app
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@gympoint.app
SMTP_PASSWORD=<password-seguro>
EMAIL_FROM="GymPoint <noreply@gympoint.app>"
EMAIL_VERIFICATION_URL=https://api.gympoint.app/api/auth/verify-email
APP_DEEP_LINK_SCHEME=gympoint://
```

**4. Configurar DNS (SPF/DKIM/DMARC)**

Consultar con proveedor de hosting para agregar registros:

```dns
gympoint.app. TXT "v=spf1 include:_spf.plesk.com ~all"
default._domainkey.gympoint.app. TXT "v=DKIM1; k=rsa; p=..."
_dmarc.gympoint.app. TXT "v=DMARC1; p=quarantine; ..."
```

**5. Reiniciar Servidor**

```bash
# Plesk
systemctl restart nginx
pm2 restart gympoint-api

# Manual
npm run start
```

**6. Verificar Cron Jobs**

```bash
# Verificar que cleanup-job está activo
pm2 logs gympoint-api | grep "CLEANUP JOB"

# Salida esperada:
# [CLEANUP JOB] Cron de limpieza iniciado (diario 3 AM)
```

**7. Test en Producción**

```bash
# Crear cuenta de prueba
curl -X POST https://api.gympoint.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", ... }'

# Verificar recepción de email
# Hacer click en link de verificación
# Intentar login → debería funcionar
```

---

## Métricas y Monitoreo

### KPIs a Monitorear

```sql
-- 1. Tasa de verificación de emails
SELECT
  COUNT(*) as total_accounts,
  SUM(CASE WHEN email_verified = true THEN 1 ELSE 0 END) as verified,
  ROUND(SUM(CASE WHEN email_verified = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as verification_rate
FROM accounts
WHERE auth_provider = 'local'
  AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);

-- 2. Tiempo promedio para verificar
SELECT
  AVG(TIMESTAMPDIFF(MINUTE, a.created_at, evt.used_at)) as avg_minutes_to_verify
FROM accounts a
JOIN email_verification_tokens evt ON a.id_account = evt.id_account
WHERE a.email_verified = true
  AND evt.used_at IS NOT NULL
  AND a.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 3. Tokens expirados sin uso (oportunidad de mejora UX)
SELECT COUNT(*) as expired_unused
FROM email_verification_tokens
WHERE expires_at < NOW()
  AND used_at IS NULL;

-- 4. Rate de reenvíos por usuario
SELECT
  id_account,
  COUNT(*) as resend_count
FROM email_verification_tokens
WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY id_account
HAVING COUNT(*) > 2
ORDER BY resend_count DESC;
```

---

## Próximos Pasos (Opcional)

### 1. Frontend Móvil - Pantallas de Verificación

```typescript
// screens/VerificationScreen.tsx
export const VerificationScreen = () => {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/api/auth/resend-verification', {
        email: user.email
      });
      Alert.alert('Email enviado', 'Revisa tu bandeja de entrada');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View>
      <Text>Verifica tu email para continuar</Text>
      <Text>Enviamos un link a {user.email}</Text>
      <Button onPress={handleResend} loading={resending}>
        Reenviar email
      </Button>
    </View>
  );
};
```

### 2. Deep Linking Configuration

```javascript
// app.json (Expo)
{
  "expo": {
    "scheme": "gympoint",
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "gympoint" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    },
    "ios": {
      "bundleIdentifier": "app.gympoint.ios",
      "associatedDomains": ["applinks:gympoint.app"]
    }
  }
}
```

### 3. Notificaciones Push para Verificación

```javascript
// Enviar push notification después de registro
await pushNotificationService.send({
  userId: account.id_account,
  title: 'Verifica tu email',
  body: 'Haz click aquí para verificar tu cuenta',
  data: { action: 'VERIFY_EMAIL' }
});
```

---

## Referencias

- **Migración:** [20260102-create-email-verification-table.js](../backend/node/migrations/20260102-create-email-verification-table.js)
- **Repositorio:** [email-verification.repository.js](../backend/node/infra/db/repositories/email-verification.repository.js)
- **Servicio Email:** [email.service.js](../backend/node/utils/email/email.service.js)
- **Auth Service:** [auth-service.js:150-306](../backend/node/services/auth-service.js#L150-L306)
- **Controller:** [auth-controller.js:128-256](../backend/node/controllers/auth-controller.js#L128-L256)
- **Rutas:** [auth-routes.js:345-483](../backend/node/routes/auth-routes.js#L345-L483)
- **Cron Job:** [cleanup-job.js:31-35](../backend/node/jobs/cleanup-job.js#L31-L35)
- **Variables Env:** [.env.example:36-50](../backend/node/.env.example#L36-L50)

---

**Última actualización:** 2025-01-15
**Versión:** 1.0.0
**Estado:** ✅ Implementado y listo para producción
