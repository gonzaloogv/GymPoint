# Deploy Mobile (Expo / EAS)

## Variables

- `.env.development`
  ```ini
  EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
  EXPO_PUBLIC_REALTIME_URL=http://10.0.2.2:3000
  EXPO_PUBLIC_REALTIME_UI=on
  EXPO_PUBLIC_REALTIME_TRANSPORT=websocket,polling
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<ANDROID_CLIENT_ID_DEV>
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com
  ```

- `.env.production`
  ```ini
  EXPO_PUBLIC_API_BASE_URL=https://api.gympoint.app
  EXPO_PUBLIC_REALTIME_URL=https://api.gympoint.app
  EXPO_PUBLIC_REALTIME_UI=on
  EXPO_PUBLIC_REALTIME_TRANSPORT=websocket,polling
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<ANDROID_CLIENT_ID_PROD>
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com
  ```

Guarda las claves sensibles (por ejemplo `ANDROID_GOOGLE_MAPS_API_KEY`) como secretos en EAS (`npx eas secret:create`).

## Configurar EAS

1. Inicia sesión:
   ```bash
   cd frontend/gympoint-mobile
   npx expo login
   npx eas login
   ```
2. Ejecuta una única vez:
   ```bash
   npx eas build:configure
   ```
   (El proyecto ya incluye `eas.json` con perfiles `development` y `production`.)

## Build de producción (APK)

```bash
cd frontend/gympoint-mobile
cp .env.production .env  # o usa EAS secrets si prefieres
npx eas build -p android --profile production
```

- Descarga el APK desde la URL que entrega EAS o con `npx eas build:download --platform android`.
- Instala para QA: `adb install <archivo.apk>`.

## Configurar Google OAuth (Android)

### SHA-1 Fingerprint de la aplicación

```
SHA-1: D3:7A:D5:AB:2F:B9:62:5F:98:FB:05:58:7E:87:8B:EA:1F:38:E2:FE
```

Para verificar el fingerprint actual:
```bash
cd android
./gradlew signingReport
```

### Crear OAuth Client Android

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=gympoint-478021)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Selecciona **"Android"**
4. Configura:
   - **Name**: `GymPoint Android Client`
   - **Package name**: `app.gympoint.mobile`
   - **SHA-1 certificate fingerprint**: `D3:7A:D5:AB:2F:B9:62:5F:98:FB:05:58:7E:87:8B:EA:1F:38:E2:FE`
5. Click **"CREATE"** y copia el Client ID generado

### Actualizar .env.production

Edita `frontend/gympoint-mobile/.env.production`:
```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<TU_ANDROID_CLIENT_ID_AQUI>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com
```

### Actualizar backend

Edita `.env.production.backend` para agregar el Android Client ID:
```env
GOOGLE_CLIENT_IDS=18224652722-07atvnqpng2qc7cdttlmeuns6k30ghc9.apps.googleusercontent.com,<TU_ANDROID_CLIENT_ID>
```

Más detalles en [docs/setup_google_oauth.md](setup_google_oauth.md).

## Notas

- Usa siempre URLs HTTPS para producción (Android rechaza tráfico cleartext salvo que configures un `networkSecurityConfig`).
- Antes de lanzar, ejecuta `npx expo doctor` y `npm run lint` para asegurar que las dependencias nativas estén alineadas.
- Si más adelante necesitas publicar en Play Store con AAB, crea un perfil adicional (ej. `store`) en `eas.json` con `"buildType": "app-bundle"`.
