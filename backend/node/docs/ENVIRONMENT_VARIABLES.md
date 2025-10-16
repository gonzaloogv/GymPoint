# 🔐 Variables de Entorno - GymPoint Backend

Este archivo documenta todas las variables de entorno necesarias para el proyecto.

---

## 📋 Variables Requeridas

### Base de Datos (MySQL)

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=gympoint
DB_PORT=3306
```

### Autenticación JWT

```bash
# Token de acceso (15 minutos de duración)
JWT_SECRET=tu_clave_super_secreta_para_tokens_de_acceso

# Token de refresh (7 días de duración)
JWT_REFRESH_SECRET=tu_clave_super_secreta_para_tokens_de_refresh
```

**⚠️ IMPORTANTE:** Usa claves largas y aleatorias en producción.

Generar claves seguras:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔑 OAuth y Pagos

### Google OAuth

```bash
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

**Obtener:**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto → APIs y servicios → Credenciales
3. Crear credencial OAuth 2.0
4. Copiar Client ID

### Mercado Pago

```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-123456-1234567890abcdef
BACKEND_URL=http://localhost:3000
```

**Obtener:**
1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/credentials)
2. Copiar Access Token (TEST para desarrollo, PROD para producción)
3. BACKEND_URL es la URL pública de tu backend (para webhooks)

---

## 📊 Monitoring (Opcional pero recomendado)

### Sentry

```bash
SENTRY_DSN=https://abcd1234@o123456.ingest.sentry.io/7654321
```

**Obtener:**
1. Crear cuenta en [Sentry.io](https://sentry.io)
2. Crear proyecto Node.js
3. Copiar el DSN

**Si no configurás Sentry:** El backend funcionará normal, solo no enviará errores a Sentry.

---

## ⚙️ Configuraciones Opcionales

### CORS

```bash
# Permitir todos los orígenes (desarrollo)
CORS_ORIGIN=*

# Producción - orígenes específicos separados por coma
CORS_ORIGIN=https://miapp.com,https://www.miapp.com
```

### Monitoring

```bash
# Umbral para considerar un request "lento" (en ms)
SLOW_HTTP_MS=300
```

### General

```bash
# Entorno de ejecución
NODE_ENV=development  # development | production | test

# Puerto del servidor
PORT=3000

# Nivel de logging
LOG_LEVEL=info  # error | warn | info | debug

# Logs de SQL (solo desarrollo)
DB_LOGGING=false
```

---

## 🚀 Configuración por Entorno

### Desarrollo Local

```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PASSWORD=tu_password_local
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-de-prueba
BACKEND_URL=http://localhost:3000
SENTRY_DSN=your-sentry-dsn-here  # Opcional
CORS_ORIGIN=*
```

### Producción

```bash
NODE_ENV=production
PORT=3000
DB_HOST=tu-db-host.com
DB_PASSWORD=CLAVE_SUPER_SEGURA_LARGA
GOOGLE_CLIENT_ID=tu-client-id-prod.apps.googleusercontent.com
MERCADOPAGO_ACCESS_TOKEN=APP-tu-token-de-produccion
BACKEND_URL=https://api.tuapp.com
SENTRY_DSN=https://abcd@sentry.io/123456
CORS_ORIGIN=https://tuapp.com,https://www.tuapp.com
```

---

## ✅ Checklist Pre-Producción

- [ ] JWT_SECRET y JWT_REFRESH_SECRET son aleatorios y largos (64+ caracteres)
- [ ] MERCADOPAGO_ACCESS_TOKEN es el token de PRODUCCIÓN (no TEST)
- [ ] GOOGLE_CLIENT_ID es el correcto para producción
- [ ] BACKEND_URL apunta a tu dominio público
- [ ] SENTRY_DSN configurado (recomendado)
- [ ] CORS_ORIGIN limita a tus dominios específicos (no `*`)
- [ ] DB_PASSWORD es seguro y diferente al de desarrollo
- [ ] NODE_ENV=production

---

## 🔒 Seguridad

**NUNCA subas el archivo `.env` a Git**

El archivo `.env` ya está en `.gitignore`, pero asegurate de:
- No commitear archivos con credenciales
- No pegar tokens en issues o PRs públicos
- Rotar tokens si se exponen accidentalmente

---

## 📝 Crear archivo .env

Copia y renombra:

```bash
# En backend/node/
cp docs/ENVIRONMENT_VARIABLES.md .env
# Edita .env y completa tus valores reales
```

O crea manualmente `.env` en `backend/node/`:

```bash
# backend/node/.env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
# ... etc
```

---

**Última actualización:** 2025-10-15

