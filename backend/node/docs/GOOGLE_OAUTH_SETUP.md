# 🔐 Configurar Google OAuth - Guía Completa

**Fecha:** 2025-10-15  
**Estado:** Paso a paso

---

## 🎯 ¿Qué es Google OAuth?

Permite que los usuarios inicien sesión en tu app usando su cuenta de Google, sin necesidad de crear una contraseña nueva.

**Beneficios:**
- ✅ Registro en 1 click
- ✅ No recordar otra contraseña
- ✅ Email ya verificado
- ✅ Más conversiones

---

## 📋 PASO 1: Crear Proyecto en Google Cloud

### 1.1 Ir a Google Cloud Console

Acceder a: https://console.cloud.google.com/

### 1.2 Crear un Nuevo Proyecto

1. Click en el selector de proyectos (arriba a la izquierda)
2. Click en **"Nuevo Proyecto"**
3. Datos:
   - **Nombre:** GymPoint (o el nombre de tu app)
   - **Organización:** Dejar en blanco si no tenés
4. Click **"Crear"**
5. **Esperar 30 segundos** a que se cree

### 1.3 Seleccionar el Proyecto

Asegurate de que tu nuevo proyecto esté seleccionado (arriba a la izquierda debe decir "GymPoint")

---

## 📋 PASO 2: Habilitar Google OAuth API

### 2.1 Ir a APIs y Servicios

1. Menu hamburguesa (☰) → **APIs y Servicios** → **Biblioteca**

### 2.2 Buscar y Habilitar

1. Buscar: **"Google+ API"** o **"People API"**
2. Click en **"Google+ API"**
3. Click **"Habilitar"**

*(Nota: Google+ API está deprecada pero todavía funciona. Alternativamente usa People API)*

---

## 📋 PASO 3: Configurar Pantalla de Consentimiento

### 3.1 Ir a Pantalla de Consentimiento

1. Menu (☰) → **APIs y Servicios** → **Pantalla de consentimiento de OAuth**

### 3.2 Configurar

**Tipo de usuario:**
- Seleccionar **"Externo"** (para que cualquiera pueda usar tu app)
- Click **"Crear"**

**Información de la aplicación:**
- **Nombre de la aplicación:** GymPoint
- **Correo de asistencia:** tu-email@gmail.com
- **Logo:** (opcional) Subir logo de tu app
- **Dominio de la aplicación:** (dejarlo vacío por ahora si estás en desarrollo)

**Información de contacto del desarrollador:**
- **Email:** tu-email@gmail.com

Click **"Guardar y continuar"**

**Permisos (Scopes):**
- No agregar nada extra por ahora
- Click **"Guardar y continuar"**

**Usuarios de prueba (opcional en desarrollo):**
- Agregar tu email para testing
- Click **"Guardar y continuar"**

**Resumen:**
- Click **"Volver al panel"**

---

## 📋 PASO 4: Crear Credenciales OAuth 2.0

### 4.1 Ir a Credenciales

1. Menu (☰) → **APIs y Servicios** → **Credenciales**

### 4.2 Crear Credencial

1. Click **"+ Crear credenciales"** (arriba)
2. Seleccionar **"ID de cliente de OAuth 2.0"**

### 4.3 Configurar ID de Cliente

**Tipo de aplicación:**
- Seleccionar **"Aplicación web"** (para backend)

**Nombre:**
- `GymPoint Backend`

**Orígenes de JavaScript autorizados:**
- `http://localhost:3000` (desarrollo)
- `https://tudominio.com` (cuando tengas dominio en producción)

**URIs de redireccionamiento autorizados:**
- Dejar vacío (no se necesita para el flujo que usamos)

Click **"Crear"**

### 4.4 Copiar Client ID

Aparecerá un popup con:
- **ID de cliente:** `287573324529-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Secreto del cliente:** (no lo necesitás para mobile/SPA)

**✅ COPIAR EL ID DE CLIENTE** - Lo necesitarás después

---

## 📋 PASO 5: Crear Credenciales para Android/iOS (Mobile)

### 5.1 Crear ID de Cliente Android

1. **Credenciales** → **"+ Crear credenciales"** → **"ID de cliente de OAuth 2.0"**
2. **Tipo:** `Android`
3. **Nombre:** `GymPoint Android`
4. **Nombre del paquete:** `com.gympoint.mobile` (tu package name de React Native)
5. **Huella digital del certificado SHA-1:**

**Obtener SHA-1 (en desarrollo):**
```bash
# En tu proyecto React Native
cd android
./gradlew signingReport

# Buscar en la salida:
# Variant: debug
# SHA1: AB:CD:EF:12:34:56:...
```

6. Copiar el SHA-1 y pegarlo
7. Click **"Crear"**

### 5.2 Crear ID de Cliente iOS (si aplica)

1. **Credenciales** → **"+ Crear credenciales"** → **"ID de cliente de OAuth 2.0"**
2. **Tipo:** `iOS`
3. **Nombre:** `GymPoint iOS`
4. **ID del paquete:** `com.gympoint.mobile` (tu bundle ID)
5. Click **"Crear"**

---

## 📋 PASO 6: Configurar Backend

### 6.1 Agregar Client ID al .env

En `backend/node/.env`:

```bash
GOOGLE_CLIENT_ID=287573324529-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**⚠️ Importante:** Usar el Client ID de tipo **"Aplicación web"** (no el de Android/iOS)

### 6.2 Verificar que funciona

Reiniciar backend:
```bash
docker restart gympoint-backend
```

Ver logs:
```bash
docker logs gympoint-backend | grep Google
```

**Deberías ver:**
```
✅ Google OAuth habilitado
```

**Si ves:**
```
⚠️ Google OAuth deshabilitado
```

Verificar que:
- El Client ID esté en `.env`
- No sea `dummy-client-id-for-development`
- El backend se reinició

---

## 📋 PASO 7: Configurar Frontend (React Native)

### 7.1 Instalar dependencia

```bash
cd frontend/gympoint-mobile
npm install @react-native-google-signin/google-signin
```

### 7.2 Configurar en tu app

**Archivo:** `src/config/google.config.ts`

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  // Client ID de tipo "Aplicación web"
  webClientId: '287573324529-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
  
  // Scopes que necesitás
  scopes: ['profile', 'email'],
  
  // Offline access para obtener refresh token
  offlineAccess: true,
});
```

### 7.3 Configurar Android

**Archivo:** `android/app/build.gradle`

```gradle
dependencies {
    // ... otras dependencias
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**Archivo:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest ...>
  <application ...>
    <!-- ... -->
  </application>
</manifest>
```

### 7.4 Configurar iOS

```bash
cd ios
pod install
cd ..
```

**Archivo:** `ios/GymPoint/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.287573324529-xxxxxxxx</string>
    </array>
  </dict>
</array>
```

*(Invertir tu Client ID: si es `287573324529-xxx.apps.googleusercontent.com`, usar `com.googleusercontent.apps.287573324529-xxx`)*

---

## 📋 PASO 8: Implementar Login en Frontend

### 8.1 Componente de Login

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { api } from '@shared/http/apiClient';

const handleGoogleLogin = async () => {
  try {
    // 1. Iniciar flujo de Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // 2. Obtener el ID token
    const idToken = userInfo.idToken;
    
    if (!idToken) {
      throw new Error('No se pudo obtener el token de Google');
    }
    
    // 3. Enviar al backend
    const response = await api.post('/api/auth/google', {
      idToken: idToken
    });
    
    // 4. Guardar tokens
    const { access_token, refresh_token, user } = response.data;
    
    // Guardar en AsyncStorage o tu state manager
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    
    console.log('Login exitoso:', user);
    
    // Navegar a home
    navigation.navigate('Home');
    
  } catch (error) {
    console.error('Error en Google login:', error);
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      console.log('Usuario canceló el login');
    } else {
      alert('Error al iniciar sesión con Google');
    }
  }
};
```

### 8.2 Botón de Login

```typescript
import { Button } from 'react-native';

<Button
  title="Continuar con Google"
  onPress={handleGoogleLogin}
  icon={() => <GoogleIcon />}
/>
```

---

## 🧪 PASO 9: Testing

### 9.1 Test Backend (con cURL)

Necesitás un ID token real de Google. Podés obtenerlo temporalmente desde:

https://developers.google.com/oauthplayground/

1. Ir al link
2. Settings (⚙️) → Use your own OAuth credentials
3. Pegar tu Client ID
4. Autorizar con tu cuenta Google
5. Copiar el `id_token`

**Test:**
```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU..."
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id_user_profile": 1,
    "name": "Juan",
    "email": "juan@gmail.com",
    "auth_provider": "google"
  }
}
```

### 9.2 Test Mobile

1. Correr app en emulador/device
2. Presionar "Continuar con Google"
3. Seleccionar cuenta de Google
4. Aceptar permisos
5. Deberías estar logueado

---

## 🔒 Seguridad

### Qué valida el backend:

✅ **Token es válido** (firma de Google)  
✅ **Token no expiró**  
✅ **Token es para tu Client ID** (audience check)  
✅ **Email verificado**  

### Qué NO enviar nunca:

❌ Client Secret (no se usa en mobile/SPA)  
❌ Contraseña de Google (nunca la obtenés)

---

## 🐛 Troubleshooting

### Error: "DEVELOPER_ERROR" en Android

**Causa:** SHA-1 incorrecto o Client ID de Android no configurado

**Solución:**
1. Verificar SHA-1: `cd android && ./gradlew signingReport`
2. Copiar SHA-1 correcto en Google Cloud Console
3. Esperar 5 minutos (cache de Google)
4. Reinstalar app

### Error: "Token de Google inválido" en backend

**Causa:** Client ID del frontend no coincide con el backend

**Solución:**
- Frontend debe usar el **mismo** Client ID (tipo "Aplicación web") que el backend
- Verificar en `google.config.ts` y `.env` del backend

### Error: "Google OAuth deshabilitado" en logs

**Solución:**
```bash
# Verificar .env
cat backend/node/.env | grep GOOGLE_CLIENT_ID

# Debe mostrar tu Client ID real, no "dummy-client-id"
# Si no aparece, agregarlo y reiniciar
docker restart gympoint-backend
```

### Usuario no puede seleccionar cuenta

**Causa:** App en modo "Testing" en Google Cloud

**Solución:**
1. Google Cloud Console → OAuth consent screen
2. **"Publicar aplicación"**
3. Confirmar (puede tardar en ser revisado por Google, pero funciona igual)

---

## ✅ Checklist Final

### Google Cloud Console:
- [ ] Proyecto creado
- [ ] Google+ API o People API habilitada
- [ ] Pantalla de consentimiento configurada
- [ ] Client ID de "Aplicación web" creado
- [ ] Client ID de Android creado (con SHA-1)
- [ ] Client ID de iOS creado (si aplica)

### Backend:
- [ ] GOOGLE_CLIENT_ID en `.env`
- [ ] Backend reiniciado
- [ ] Logs muestran "Google OAuth habilitado"
- [ ] Endpoint `/api/auth/google` responde

### Frontend:
- [ ] `@react-native-google-signin` instalado
- [ ] `GoogleSignin.configure()` con webClientId correcto
- [ ] Android configurado (build.gradle + SHA-1)
- [ ] iOS configurado (Info.plist)
- [ ] Botón de login implementado

### Testing:
- [ ] Test con cURL funciona
- [ ] Login en app mobile funciona
- [ ] Usuario se crea en BD
- [ ] Tokens se guardan correctamente

---

## 📚 Recursos

- [Google Cloud Console](https://console.cloud.google.com/)
- [React Native Google Signin Docs](https://github.com/react-native-google-signin/google-signin)
- [OAuth Playground (para testing)](https://developers.google.com/oauthplayground/)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)

---

## 🎉 Resultado Final

Con esta configuración:

✅ Usuarios pueden loguearse con Google en 1 click  
✅ No necesitan recordar otra contraseña  
✅ Email ya está verificado  
✅ Funciona en Android, iOS y Web  
✅ Seguro (tokens validados en backend)

---

**Elaborado por:** Gonzalo (Backend Developer)  
**Fecha:** 2025-10-15

