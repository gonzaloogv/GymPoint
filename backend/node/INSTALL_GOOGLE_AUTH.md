# 🚀 Instalación Rápida - Google OAuth2

## Pre-requisitos

- ✅ Node.js v22+ instalado
- ✅ MySQL 8+ corriendo
- ✅ Backend de GymPoint funcionando

---

## Paso 1: Instalar Dependencias (Ya están instaladas)

El paquete `google-auth-library` ya está en `package.json`, pero si necesitas reinstalar:

```bash
cd backend/node
npm install
```

---

## Paso 2: Ejecutar Migración de Base de Datos

### Opción A: Usando MySQL CLI (Recomendado)

```bash
mysql -u root -p gympoint < migrations/20251003-add-auth-provider-fields.sql
```

### Opción B: Usando MySQL Workbench

1. Abrir MySQL Workbench
2. Conectar a la base de datos `gympoint`
3. File → Open SQL Script
4. Seleccionar: `migrations/20251003-add-auth-provider-fields.sql`
5. Ejecutar (⚡ botón)

### Opción C: Copiar y pegar

```sql
USE gympoint;

START TRANSACTION;

-- Permitir NULL en password
ALTER TABLE `user` 
MODIFY COLUMN `password` VARCHAR(255) NULL;

-- Agregar campo auth_provider
ALTER TABLE `user` 
ADD COLUMN `auth_provider` ENUM('local', 'google') NOT NULL DEFAULT 'local'
AFTER `password`;

-- Agregar campo google_id
ALTER TABLE `user` 
ADD COLUMN `google_id` VARCHAR(255) NULL UNIQUE
AFTER `auth_provider`;

-- Actualizar usuarios existentes
UPDATE `user` 
SET `auth_provider` = 'local' 
WHERE `auth_provider` IS NULL;

-- Crear índices
CREATE INDEX idx_user_google_id ON `user`(`google_id`);
CREATE INDEX idx_user_email_provider ON `user`(`email`, `auth_provider`);

COMMIT;
```

### Verificar que la migración se aplicó correctamente:

```sql
DESCRIBE `user`;
```

Deberías ver los nuevos campos:
- `auth_provider` enum('local','google')
- `google_id` varchar(255)

---

## Paso 3: Configurar Google Cloud Console

### 3.1 Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar existente
3. Nombre: "GymPoint" (o el que prefieras)

### 3.2 Habilitar APIs

1. Ir a **APIs & Services** → **Library**
2. Buscar y habilitar:
   - ✅ **Google+ API**
   - ✅ **Google Identity Services**

### 3.3 Crear Credenciales OAuth

1. Ir a **APIs & Services** → **Credentials**
2. Click en **Create Credentials** → **OAuth 2.0 Client ID**
3. Configurar pantalla de consentimiento (si es primera vez):
   - User Type: **External**
   - App name: **GymPoint**
   - User support email: tu email
   - Developer contact: tu email
   - Scopes: `email`, `profile`, `openid`
   - Save

4. Crear OAuth Client ID:
   - Application type: **Web application**
   - Name: **GymPoint Backend**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - (Agregar tus dominios de producción después)
   - Authorized redirect URIs:
     - No necesario para backend
   - Click **Create**

5. **Copiar el Client ID** que aparece (necesitarás esto)

### 3.4 Configurar para Mobile (si usas Expo)

1. Crear otro OAuth Client ID:
   - Application type: **iOS** (para iOS)
   - Application type: **Android** (para Android)
   
2. Para Android:
   - Package name: `com.yourcompany.gympoint`
   - SHA-1: obtenerlo con:
     ```bash
     cd android
     ./gradlew signingReport
     ```

---

## Paso 4: Configurar Variables de Entorno

Editar `backend/node/.env`:

```env
# Existentes
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gympoint
JWT_SECRET=clave_super_secreta_para_tokens
JWT_REFRESH_SECRET=clave_distinta_para_refresh

# AGREGAR ESTA LÍNEA:
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**⚠️ IMPORTANTE:** Reemplaza el `GOOGLE_CLIENT_ID` con el que copiaste de Google Cloud Console.

---

## Paso 5: Reiniciar el Servidor

```bash
cd backend/node
npm run dev
```

Deberías ver:
```
✅ Conexión con MySQL establecida correctamente.
🚀 Server running on port 3000
📚 API Docs: http://localhost:3000/api-docs
```

---

## Paso 6: Verificar que Funciona

### Opción 1: Ver Swagger UI

1. Abrir: http://localhost:3000/api-docs
2. Buscar endpoint: `POST /api/auth/google`
3. Debería aparecer documentado

### Opción 2: Probar con curl (requiere un ID Token válido)

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"TU_ID_TOKEN_AQUI"}'
```

**Nota:** Para obtener un ID Token real, necesitas implementar el flujo en el frontend o usar [Google OAuth Playground](https://developers.google.com/oauthplayground/).

---

## 🎉 ¡Listo!

El backend ahora soporta autenticación con Google. Los próximos pasos son:

1. ✅ Implementar el flujo en el frontend (React Native/Expo)
2. ✅ Ver ejemplos en: `docs/examples/google-auth-client.example.tsx`
3. ✅ Probar con usuarios reales

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'google-auth-library'"

**Solución:**
```bash
cd backend/node
npm install google-auth-library
```

### Error: "GOOGLE_CLIENT_ID no configurado"

**Solución:** Verifica que `.env` tenga:
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
```

### Error: "Column 'auth_provider' doesn't exist"

**Solución:** Ejecuta la migración nuevamente (Paso 2).

### Error: "Token de Google inválido"

**Causas:**
- Estás usando un token de prueba o expirado
- El token fue generado con otro Client ID
- No has configurado correctamente las credenciales

**Solución:** Asegúrate de usar un ID Token válido generado con tu Client ID.

---

## 📞 Ayuda Adicional

Ver documentación completa:
- `GOOGLE_AUTH_READY.md` - Guía de uso
- `docs/GOOGLE_AUTH.md` - Documentación técnica completa
- `docs/IMPLEMENTATION_SUMMARY.md` - Detalles de implementación

---

**Tiempo estimado de instalación: 10-15 minutos**

**¿Necesitas ayuda?** Revisa `docs/GOOGLE_AUTH.md` para más detalles.

