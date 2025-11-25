# Auth Providers

Este directorio contiene los proveedores de autenticación de terceros.

## Estructura

```
auth-providers/
├── google-provider.js    # Google OAuth2
├── README.md            # Este archivo
└── (futuros providers)
```

## Agregar Nuevo Provider

Para agregar un nuevo proveedor de autenticación (ej: Apple, Facebook):

1. Crear archivo `<provider>-provider.js`
2. Implementar clase con los métodos:
   - `verifyToken(token)` - Verifica el token con el proveedor
   - `validateUser(userInfo)` - Valida que el usuario sea elegible

3. Exportar la clase:
```javascript
module.exports = ProviderClass;
```

4. Usar en `auth-service.js`:
```javascript
const Provider = require('./auth-providers/<provider>-provider');
const provider = new Provider();

const result = await provider.verifyToken(token);
```

## Providers Disponibles

### GoogleAuthProvider

Maneja la autenticación con Google OAuth2.

**Métodos:**
- `verifyToken(idToken)` - Verifica un ID Token de Google
- `validateGoogleUser(googleUser)` - Valida información del usuario

**Uso:**
```javascript
const GoogleAuthProvider = require('./auth-providers/google-provider');
const google = new GoogleAuthProvider();

const userInfo = await google.verifyToken(idToken);
```

