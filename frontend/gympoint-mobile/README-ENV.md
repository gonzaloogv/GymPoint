# Configuración de Variables de Entorno

Este proyecto usa diferentes archivos `.env` para **desarrollo** y **producción**.

## 📁 Archivos Disponibles

```
.env                 → Archivo activo (copia desde .development o .production)
.env.development     → Configuración para Expo Go (desarrollo local)
.env.production      → Configuración para EAS Build (builds nativos)
.env.example         → Template de referencia
```

## 🔧 Modo Desarrollo (Expo Go)

### Cuándo usar:
- Desarrollo local con `npx expo start`
- Pruebas en Expo Go app (Android/iOS)

### Configuración:
```bash
# Copia las variables de desarrollo
cp .env.development .env

# Inicia Expo
npx expo start -c
```

### Client IDs usados:
- **Android**: `host.exp.exponente` (Expo Go)
- **iOS**: `host.exp.Exponent` (Expo Go)

---

## 🚀 Modo Producción (EAS Build)

### Cuándo usar:
- Builds nativos con EAS
- APK/IPA para distribución

### Configuración:
```bash
# Copia las variables de producción
cp .env.production .env

# Build con EAS
eas build --platform android --profile production
```

### Client IDs usados:
- **Android**: `ien.gympoint.mobile` con SHA-1 del keystore
- **iOS**: `ien.gympoint.mobile`

---

## ⚠️ IMPORTANTE

### Backend debe tener TODOS los Client IDs

En `backend/node/.env.local` o `.env.production`, incluir:

```env
GOOGLE_CLIENT_IDS=web-id,android-expo-id,android-prod-id,ios-expo-id,ios-prod-id
```

Esto permite que el backend acepte tokens de **ambos** entornos.

---

## 🐛 Troubleshooting

### Error: `400 invalid_request`

**Causa**: Client ID no coincide con el package/bundle de la app.

**Solución**:
1. Verifica que uses el `.env` correcto
2. Si estás en Expo Go → usa `.env.development`
3. Si es un build nativo → usa `.env.production`
4. Reinicia con `npx expo start -c`

### Logs de verificación

Al iniciar la app, verás:
```
[env] GOOGLE_ANDROID_CLIENT_ID: ✓ configured
[env] GOOGLE_IOS_CLIENT_ID: ✓ configured
[env] GOOGLE_WEB_CLIENT_ID: ✓ configured
```

Si ves `✗ missing`, el `.env` no se cargó correctamente.

---

## 📚 Referencias

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Expo Documentation**: https://docs.expo.dev/guides/environment-variables/
- **EAS Build**: https://docs.expo.dev/build/introduction/
