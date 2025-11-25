# Resumen de Configuración para Producción

## ✅ Cambios realizados

### Frontend Mobile

1. **app.config.ts**
   - ✅ Agregado soporte para iOS Client ID
   - ✅ Agregado `bundleIdentifier` para iOS: `ien.gympoint.mobile`
   - ✅ Agregado `scheme: 'gympoint'` para deep linking
   - ✅ Configurado para cargar automáticamente `.env.production` en builds de producción

2. **eas.json**
   - ✅ Configurado `APP_ENV=production` para builds de producción
   - ✅ Configurado `APP_ENV=development` para builds de desarrollo

3. **.env.production**
   - ✅ API URL: `https://api.gympoint.app`
   - ✅ Client IDs de producción configurados
   - ✅ Placeholder para Google Maps API Key de producción

4. **PRODUCTION_BUILD.md**
   - ✅ Guía completa para hacer el build de producción
   - ✅ Pasos de configuración en Google Cloud Console
   - ✅ Troubleshooting común

### Backend

1. **.env.production** (NUEVO)
   - ✅ Plantilla para configuración de producción
   - ✅ TODOS los Client IDs configurados
   - ✅ URLs de producción: `https://api.gympoint.app`
   - ✅ Deep link scheme: `gympoint://`

---

## ⚠️ PASOS CRÍTICOS antes del build

### 1. Google Cloud Console - Web Client ID
Debes agregar estos redirect URIs al Web Client ID `287573324529-7khgk8lqttjlcb7uqvnc675466tsov5b`:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en el Web Client ID
3. Agrega en **"URIs de redireccionamiento autorizados"**:
   - ✅ `https://auth.expo.io/@gonzaloogv/gympoint-mobile`
   - ❌ `gympoint://oauth2redirect` ← **FALTA AGREGAR ESTE**

### 2. Google Maps API Key de Producción
Necesitas una API Key NUEVA con restricciones para producción:

1. Ve a: https://console.cloud.google.com/google/maps-apis/credentials
2. Crea nueva API Key para Android
3. Restricciones:
   - Package: `ien.gympoint.mobile`
   - SHA-1: `B3:74:24:EA:29:ED:E1:DD:E8:44:0A:CA:D3:2C:F8:0B:D4:37:F9:E0`
4. Copia la API Key y pégala en `.env.production`:
   ```
   ANDROID_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```

### 3. Backend en Producción
Asegúrate que el backend en `https://api.gympoint.app` tenga:
- ✅ `GOOGLE_CLIENT_IDS` con TODOS los Client IDs (ya configurado en `.env.production`)
- Base de datos configurada
- SMTP configurado para envío de emails

---

## 🚀 Comando para hacer el build

Una vez completados los pasos anteriores:

```bash
cd frontend/gympoint-mobile
eas build --platform android --profile production
```

### Lo que hace automáticamente:
1. Carga `.env.production`
2. Usa Client IDs de producción
3. Apunta a `https://api.gympoint.app`
4. Package: `ien.gympoint.mobile`
5. Scheme: `gympoint://`

---

## 📋 Checklist antes del build

- [ ] Web Client ID tiene `gympoint://oauth2redirect` en redirect URIs
- [ ] Google Maps API Key de producción creada y configurada en `.env.production`
- [ ] Backend en `https://api.gympoint.app` tiene todos los Client IDs
- [ ] Backend tiene SMTP configurado
- [ ] OAuth Consent Screen en modo "Testing" con test users

---

## 🔍 Verificación post-build

Después de instalar el APK:

1. **Google OAuth:**
   - [ ] Login con Google funciona
   - [ ] No aparece error 400
   - [ ] Redirige correctamente

2. **API Connection:**
   - [ ] App se conecta a `https://api.gympoint.app`
   - [ ] Backend acepta el token de Google

3. **Google Maps:**
   - [ ] Mapa se carga correctamente
   - [ ] No aparece "For development purposes only"

---

## 📊 Configuración de Client IDs

| Entorno | Tipo | Client ID | Estado |
|---------|------|-----------|--------|
| Web | Web | `287573324529-7khgk8lqttjlcb7uqvnc675466tsov5b` | ✅ Configurado |
| Dev Android | Android | `287573324529-jue5dcgrog5f1gvmnhbhfeta7bvrvc0h` | ✅ Configurado |
| Dev iOS | iOS | `287573324529-8u4jgi2eldc0id20gqf0gmcg52c211o4` | ✅ Configurado |
| **Prod Android** | Android | `287573324529-pgae1blloghtmvlqh2iboc9jod4mbj3k` | ✅ Configurado |
| **Prod iOS** | iOS | `287573324529-md2279mr550olejlse4hk9v84jbjo8fl` | ✅ Configurado |

---

## 📝 Archivos modificados

### Frontend
- `frontend/gympoint-mobile/app.config.ts` - Configuración dinámica de entorno
- `frontend/gympoint-mobile/eas.json` - Perfiles de build
- `frontend/gympoint-mobile/.env.production` - Variables de producción
- `frontend/gympoint-mobile/PRODUCTION_BUILD.md` - Guía de build

### Backend
- `backend/node/.env.production` - Configuración de producción (NUEVA)
- `backend/node/.env.local` - Client IDs actualizados

---

## ⚡ Next Steps

1. **AHORA:** Agrega `gympoint://oauth2redirect` al Web Client ID en Google Cloud Console
2. **AHORA:** Crea Google Maps API Key de producción y actualiza `.env.production`
3. **DESPUÉS:** Ejecuta `eas build --platform android --profile production`
4. **DESPUÉS:** Instala el APK y prueba Google OAuth
5. **DESPUÉS:** Verifica que Maps funcione correctamente
