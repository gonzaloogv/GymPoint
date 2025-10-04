# 🔐 Autenticación con Google OAuth2

## Descripción General

GymPoint implementa autenticación con Google OAuth2 usando el flujo de **ID Token Verification**. Esto permite a los usuarios iniciar sesión de forma segura usando su cuenta de Google sin necesidad de contraseña.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
│                                                              │
│  1. Cliente (Mobile/Web)                                     │
│     └─> Obtiene ID Token de Google                          │
│                                                              │
│  2. POST /api/auth/google { idToken }                        │
│     └─> Backend (auth-controller)                           │
│         └─> Delega a auth-service                           │
│             └─> Usa GoogleAuthProvider                      │
│                 └─> Verifica con Google OAuth2Client        │
│                                                              │
│  3. Backend procesa:                                         │
│     ├─> Si usuario nuevo: crear cuenta + frecuencia + streak│
│     ├─> Si usuario existe: vincular o actualizar            │
│     └─> Generar JWT (access + refresh tokens)              │
│                                                              │
│  4. Respuesta: { accessToken, refreshToken, user }          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Configuración

### 1. Obtener Credenciales de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita **Google+ API** y **Google OAuth2 API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configura las URLs autorizadas:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** (según tu cliente)

### 2. Configurar Variables de Entorno

```env
# .env
GOOGLE_CLIENT_ID=287573324529-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
JWT_SECRET=clave_super_secreta_para_tokens
JWT_REFRESH_SECRET=clave_distinta_para_refresh
```

---

## 📡 API Endpoint

### `POST /api/auth/google`

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdlM2..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_user": 1,
    "email": "usuario@gmail.com",
    "name": "Juan",
    "lastname": "Pérez",
    "subscription": "FREE",
    "auth_provider": "google",
    "google_id": "112233445566778899",
    "tokens": 0
  }
}
```

**Errores:**

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400 - MISSING_TOKEN` | No se envió el idToken | Incluir `idToken` en el body |
| `401 - GOOGLE_AUTH_FAILED` | Token inválido o expirado | Obtener nuevo token de Google |
| `401 - GOOGLE_AUTH_FAILED` | Email no verificado | Usuario debe verificar email en Google |

---

## 🔄 Flujos de Usuario

### A. Usuario Nuevo (Primera Vez)

1. Usuario hace clic en "Iniciar con Google" en la app
2. Google devuelve un ID Token
3. App envía token al backend
4. Backend:
   - Verifica el token con Google
   - Valida que el email esté verificado
   - **Crea nuevo usuario** con:
     - `auth_provider: 'google'`
     - `google_id: <sub del token>`
     - `password: null` (no tiene contraseña)
   - Crea frecuencia semanal por defecto (3 días)
   - Crea streak inicial (valor 0)
   - Genera tokens JWT
5. Usuario queda logueado automáticamente

### B. Usuario Existente con Google

1. Usuario vuelve a iniciar sesión con Google
2. Backend:
   - Verifica el token
   - Busca usuario por email
   - Si `google_id` cambió, lo actualiza
   - Genera nuevos tokens JWT
3. Usuario queda logueado

### C. Vinculación: Usuario con Cuenta Local

Si un usuario ya tiene cuenta con **email + contraseña** y luego intenta iniciar sesión con Google usando el mismo email:

1. Backend detecta que el email existe con `auth_provider: 'local'`
2. **Automáticamente vincula** la cuenta:
   - Actualiza `auth_provider` a `'google'`
   - Guarda `google_id`
   - Mantiene todos los datos existentes (streak, frecuencia, tokens)
3. El usuario ahora puede usar **ambos métodos** de login

⚠️ **Nota:** Una vez vinculado con Google, el login con contraseña mostrará un mensaje sugiriendo usar Google.

---

## 🛡️ Seguridad

### Validaciones Implementadas

1. ✅ **Verificación de Token:** El backend verifica el token directamente con los servidores de Google
2. ✅ **Audience Check:** Se valida que el token sea para nuestro `GOOGLE_CLIENT_ID`
3. ✅ **Email Verificado:** Solo se aceptan usuarios con email verificado en Google
4. ✅ **Expiración:** Google verifica automáticamente que el token no esté expirado
5. ✅ **No se almacena el ID Token:** Solo se guarda el `google_id` (sub claim)

### Buenas Prácticas

- ❌ **Nunca** uses el ID Token como access token en tu app
- ✅ **Siempre** verifica el token en el backend
- ✅ Genera tus propios JWT después de validar
- ✅ Los ID Tokens de Google son de un solo uso
- ✅ Implementa rate limiting en el endpoint

---

## 🧪 Testing

### Ejecutar Tests

```bash
npm test -- google-auth.test.js
```

### Casos de Prueba Cubiertos

- ✅ Crear nuevo usuario con Google
- ✅ Autenticar usuario existente
- ✅ Vincular cuenta local con Google
- ✅ Rechazar token inválido
- ✅ Rechazar token expirado
- ✅ Rechazar email no verificado
- ✅ Prevenir login con contraseña si el usuario es de Google

---

## 📱 Implementación en Cliente (React Native / Expo)

### Instalación

```bash
npm install @react-native-google-signin/google-signin
# o con Expo
npx expo install expo-auth-session expo-random
```

### Ejemplo con Expo (Recomendado)

```typescript
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'TU_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      // Enviar al backend
      fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: id_token })
      })
        .then(res => res.json())
        .then(data => {
          // Guardar accessToken y refreshToken
          console.log('Login exitoso:', data.user);
        })
        .catch(err => console.error(err));
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Iniciar con Google"
      onPress={() => promptAsync()}
    />
  );
}
```

---

## 🔍 Troubleshooting

### Error: "Token de Google inválido"

**Causas:**
- ID Token expirado (válidos por 1 hora)
- Token generado con otro `clientId`
- Token corrupto o manipulado

**Solución:** Obtener un nuevo token desde el cliente.

---

### Error: "El email de Google debe estar verificado"

**Causa:** La cuenta de Google no tiene el email verificado.

**Solución:** Usuario debe verificar su email en Google.

---

### Error: "GOOGLE_CLIENT_ID no configurado"

**Causa:** Variable de entorno faltante.

**Solución:**
```bash
# .env
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
```

---

### Usuario no puede hacer login con contraseña

**Causa:** La cuenta fue creada o vinculada con Google.

**Solución:** Usar el botón "Iniciar con Google" en lugar del login tradicional.

---

## 📚 Referencias

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Server-side Apps](https://developers.google.com/identity/sign-in/web/backend-auth)
- [ID Token Verification](https://developers.google.com/identity/sign-in/web/backend-auth#verify-the-integrity-of-the-id-token)
- [google-auth-library npm](https://www.npmjs.com/package/google-auth-library)

---

## 🎯 Próximas Mejoras

- [ ] Soporte para Apple Sign In
- [ ] Soporte para Facebook Login
- [ ] Permitir desvincular cuenta de Google
- [ ] Permitir múltiples proveedores por usuario
- [ ] Agregar 2FA opcional

---

**Última actualización:** Octubre 2025  
**Autor:** Gonzalo Gomez Vignudo

