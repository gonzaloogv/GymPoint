# Configuración de Google OAuth para GymPoint

Esta guía explica cómo configurar Google OAuth para autenticación en el backend y la aplicación móvil.

## Requisitos previos

- Acceso a [Google Cloud Console](https://console.cloud.google.com/)
- Proyecto: `gympoint-478021`
- Credenciales de OAuth 2.0

---

## 1. OAuth Client Web (Backend + Mobile Web Flow)

### Crear credencial Web

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=gympoint-478021)
2. Click en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: `GymPoint Web Client`
   - **Authorized JavaScript origins**:
     ```
     https://api.gympoint.app
     https://admin.gympoint.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://api.gympoint.app/api/auth/google/callback
     http://localhost:3000/api/auth/google/callback
     ```
5. Click **"CREATE"**
6. **Guarda el Client ID** (ejemplo: `18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com`)

### Configurar en backend

Edita `.env.production.backend`:
```env
GOOGLE_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com
```

---

## 2. OAuth Client Android (Mobile App)

### SHA-1 Fingerprint

El fingerprint de la app es:
```
SHA-1: D3:7A:D5:AB:2F:B9:62:5F:98:FB:05:58:7E:87:8B:EA:1F:38:E2:FE
```

**Para verificar/regenerar:**
```bash
cd frontend/gympoint-mobile/android
./gradlew signingReport
```

### Crear credencial Android

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=gympoint-478021)
2. Click en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Selecciona **"Android"**
4. Configura:
   - **Name**: `GymPoint Android Client`
   - **Package name**: `app.gympoint.mobile`
   - **SHA-1 certificate fingerprint**: `D3:7A:D5:AB:2F:B9:62:5F:98:FB:05:58:7E:87:8B:EA:1F:38:E2:FE`
5. Click **"CREATE"**
6. **Guarda el Client ID** (ejemplo: `18224652722-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`)

### Configurar en mobile

Edita `.env.development` y `.env.production`:
```env
# Development
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<TU_ANDROID_CLIENT_ID>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com

# Production
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<TU_ANDROID_CLIENT_ID>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com
```

---

## 3. Configurar múltiples Client IDs en Backend

El backend puede validar tokens de **múltiples** client IDs (web + android).

### Formato

Edita `.env.production.backend`:
```env
# Opción 1: Lista separada por comas
GOOGLE_CLIENT_IDS=18224652722-web-id.apps.googleusercontent.com,18224652722-android-id.apps.googleusercontent.com

# Opción 2: Solo uno (retrocompatible)
GOOGLE_CLIENT_ID=18224652722-web-id.apps.googleusercontent.com
```

**Recomendado**: Usar `GOOGLE_CLIENT_IDS` con ambos IDs.

### Ejemplo completo

```env
GOOGLE_CLIENT_IDS=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com,18224652722-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 4. Habilitar APIs necesarias

Asegúrate de tener habilitadas estas APIs en Google Cloud:

1. Ve a [API Library](https://console.cloud.google.com/apis/library?project=gympoint-478021)
2. Busca y habilita:
   - **Google+ API** (o **People API**)
   - **Google Identity Toolkit API**

---

## 5. Verificación

### Backend
```bash
cd backend/node
# Verifica que las variables estén cargadas
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_IDS)"
```

### Mobile
```bash
cd frontend/gympoint-mobile
# Verifica variables
npx expo start
# Revisa los logs: [env] debería mostrar los Google Client IDs
```

### Probar login
1. Ejecuta la app móvil
2. Click en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Verifica que se cree/autentique el usuario en el backend

---

## 6. Troubleshooting

### Error: "Token used too early" o "Wrong audience"
- Verifica que `GOOGLE_CLIENT_IDS` incluya TODOS los Client IDs (web + android)
- Asegúrate de que el token venga del Client ID correcto

### Error: "idToken is invalid"
- Verifica que el SHA-1 del Android Client coincida con el de tu build
- Regenera el signing report: `cd android && ./gradlew signingReport`

### Error: "google-auth-library" error
- Instala dependencias: `npm install` en backend
- Verifica versión de `google-auth-library` en package.json

### App móvil: "Google Sign-In no disponible"
- Verifica que `expo-auth-session` y `expo-web-browser` estén instalados
- Ejecuta: `npx expo install expo-auth-session expo-web-browser`
- Revisa que las variables `EXPO_PUBLIC_GOOGLE_*` estén en `.env`

---

## 7. Seguridad

⚠️ **IMPORTANTE:**

- **NO** subas archivos `.env` con credenciales a Git
- Guarda los Client IDs de forma segura
- Usa diferentes Client IDs para development/production si es posible
- Revisa logs de acceso en [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=gympoint-478021)

---

## Referencias

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [expo-auth-session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [google-auth-library npm](https://www.npmjs.com/package/google-auth-library)
