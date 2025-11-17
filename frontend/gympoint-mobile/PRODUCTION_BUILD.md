# Guía de Build de Producción - GymPoint Mobile

## Prerequisitos en Google Cloud Console

Antes de hacer el build, asegúrate de completar estos pasos en Google Cloud Console:

### 1. OAuth Consent Screen en modo "Testing"
✅ Ya configurado
- Estado: Modo "Prueba"
- Test users: `gonzalogomezvignudo@gmail.com`, `gonzaloogy23@gmail.com`

### 2. Web Client ID - Redirect URIs
**IMPORTANTE:** Debes agregar estos redirect URIs al Web Client ID `287573324529-7khgk8lqttjlcb7uqvnc675466tsov5b`:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en el Web Client ID
3. Agrega estos URIs en **"URIs de redireccionamiento autorizados"**:
   - `https://auth.expo.io/@gonzaloogv/gympoint-mobile`
   - `gympoint://oauth2redirect`
4. Guarda los cambios

### 3. Google Maps API Key para Producción
Necesitas crear una API Key NUEVA con restricciones para producción:

1. Ve a: https://console.cloud.google.com/google/maps-apis/credentials
2. Crea una nueva API Key para Android
3. Configura restricciones:
   - **Tipo:** Aplicaciones Android
   - **Package name:** `ien.gympoint.mobile`
   - **SHA-1:** `B3:74:24:EA:29:ED:E1:DD:E8:44:0A:CA:D3:2C:F8:0B:D4:37:F9:E0`
4. Copia la API Key

---

## Configuración local antes del build

### 1. Actualizar `.env.production`
Edita el archivo `.env.production` y reemplaza:

```bash
ANDROID_GOOGLE_MAPS_API_KEY=YOUR_PRODUCTION_MAPS_API_KEY
```

Por tu API Key de producción que creaste en el paso anterior.

### 2. Verificar configuración del backend
El backend en producción debe estar configurado en `https://api.gympoint.app` con:
- `GOOGLE_CLIENT_IDS` con TODOS los Client IDs (web, android dev, android prod, ios dev, ios prod)
- Base de datos en producción
- SMTP configurado para envío de emails

---

## Build de producción

### Comando para build APK:
```bash
cd frontend/gympoint-mobile
eas build --platform android --profile production
```

### Lo que hace automáticamente:
1. ✅ Carga `.env.production` (gracias a `app.config.ts`)
2. ✅ Usa Client IDs de producción
3. ✅ Apunta a `https://api.gympoint.app`
4. ✅ Package: `ien.gympoint.mobile`
5. ✅ Scheme: `gympoint://`
6. ✅ Google Maps API Key de producción

---

## Verificación post-build

Después de instalar el APK:

1. **Verificar Google OAuth:**
   - Intentar login con Google
   - Debe redirigir correctamente con `gympoint://oauth2redirect`
   - El backend debe aceptar el token (verificar Client ID en logs)

2. **Verificar conexión API:**
   - Verificar que la app apunta a `https://api.gympoint.app`
   - Verificar logs del backend en producción

3. **Verificar Google Maps:**
   - Abrir mapa de gimnasios
   - No debe aparecer "Developer Error" o "For development purposes only"

---

## Troubleshooting

### Error: "Custom URI scheme is not enabled"
**Causa:** Falta agregar `gympoint://oauth2redirect` al Web Client ID

**Solución:** Agregar el redirect URI en Google Cloud Console (ver paso 2 arriba)

### Error: "invalid_client" o "400 Bad Request"
**Causa:** Backend no tiene configurado el Client ID de producción

**Solución:** Verificar que `GOOGLE_CLIENT_IDS` en el backend incluye `287573324529-pgae1blloghtmvlqh2iboc9jod4mbj3k.apps.googleusercontent.com`

### Error: Google Maps no funciona
**Causa:** API Key no configurada o con restricciones incorrectas

**Solución:**
1. Verificar que `.env.production` tiene la API Key correcta
2. Verificar en Google Cloud Console que la API Key tiene:
   - Package: `ien.gympoint.mobile`
   - SHA-1: `B3:74:24:EA:29:ED:E1:DD:E8:44:0A:CA:D3:2C:F8:0B:D4:37:F9:E0`

---

## Resumen de Client IDs

| Entorno | Tipo | Client ID | Uso |
|---------|------|-----------|-----|
| **Web** | Web | `287573324529-7khgk8lqttjlcb7uqvnc675466tsov5b` | Redirect URIs y backend |
| **Dev Android** | Android | `287573324529-jue5dcgrog5f1gvmnhbhfeta7bvrvc0h` | Expo Go (host.exp.exponente) |
| **Dev iOS** | iOS | `287573324529-8u4jgi2eldc0id20gqf0gmcg52c211o4` | Expo Go (host.exp.Exponent) |
| **Prod Android** | Android | `287573324529-pgae1blloghtmvlqh2iboc9jod4mbj3k` | APK (ien.gympoint.mobile) |
| **Prod iOS** | iOS | `287573324529-md2279mr550olejlse4hk9v84jbjo8fl` | IPA (ien.gympoint.mobile) |

Todos estos IDs deben estar en `GOOGLE_CLIENT_IDS` del backend.
