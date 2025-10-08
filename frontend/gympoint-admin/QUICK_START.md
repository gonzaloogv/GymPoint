# 🚀 Quick Start - GymPoint Admin

## Inicio Rápido

### 1. Ejecutar el proyecto

```bash
cd frontend/gympoint-admin
npm run dev
```

El panel estará disponible en: **http://localhost:3001**

### 2. Login

Por ahora la autenticación es simulada. En la página de login:
- Ingresa cualquier email y password
- Haz click en "Login"
- Serás redirigido al Dashboard

### 3. Navegación

- **Dashboard** (`/`) - Vista general de estadísticas
- **Users** (`/users`) - Gestión de usuarios
- **Transactions** (`/transactions`) - Historial de tokens
- **Rewards** (`/rewards`) - Estadísticas de recompensas

## 📋 Tareas Comunes

### Otorgar Tokens a un Usuario

1. Ve a `/users`
2. Encuentra el usuario (usa filtros si es necesario)
3. Click en "Grant Tokens"
4. Ingresa el delta (positivo para agregar, negativo para quitar)
5. Opcionalmente agrega una razón
6. Click en "Grant"

### Cambiar Suscripción

1. Ve a `/users`
2. Encuentra el usuario
3. Click en "Toggle Sub"
4. La suscripción cambiará automáticamente (FREE ↔ PREMIUM)

### Ver Estadísticas de Recompensas

1. Ve a `/rewards`
2. Selecciona fecha "From" (inicio del rango)
3. Selecciona fecha "To" (fin del rango)
4. Click en "Search"

## 🔧 Configuración

### Backend API

El proxy está configurado para conectarse a:
- **Backend**: `http://localhost:3000/api`

Si tu backend está en otro puerto, edita `vite.config.js`:

```js
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:TU_PUERTO', // Cambiar aquí
      changeOrigin: true,
    },
  },
}
```

### Autenticación Real

Para conectar con autenticación real del backend:

1. Edita `src/presentation/pages/Login.tsx`
2. Reemplaza el login simulado con una llamada real:

```jsx
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('admin_token', response.data.token);
    navigate('/');
  } catch (err) {
    setError('Login failed. Please check your credentials.');
  }
};
```

## 📝 Archivos Importantes

- `src/App.jsx` - Configuración de rutas y React Query
- `src/data/api/client.ts` - Cliente HTTP con interceptores
- `src/presentation/hooks/useAdmin.ts` - Todos los hooks de datos
- `vite.config.js` - Configuración de Vite y proxy

## 🎨 Personalización de Estilos

Los estilos globales están en `src/App.css`

Para cambiar el color principal:
```css
/* Busca #646cff y reemplázalo con tu color */
.navbar-brand h1 { color: #TU_COLOR; }
.btn-primary { background: #TU_COLOR; }
/* etc... */
```

## 🐛 Troubleshooting

### Error: Cannot GET /api/...

**Problema**: El backend no está corriendo o el proxy está mal configurado

**Solución**:
1. Asegúrate de que el backend esté corriendo en el puerto 3000
2. Verifica la configuración del proxy en `vite.config.js`

### Error: Unauthorized

**Problema**: El token no es válido o expiró

**Solución**:
1. Borra el token: `localStorage.removeItem('admin_token')`
2. Recarga la página
3. Vuelve a hacer login

### La página se queda en blanco

**Problema**: Error de JavaScript en la consola

**Solución**:
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Busca errores en rojo
4. Si es un error de importación, verifica los paths

## 🔄 Próximas Mejoras Recomendadas

1. **Autenticación Real**: Conectar con el endpoint real de login
2. **Validación de Formularios**: Usar react-hook-form o formik
3. **Notificaciones**: Agregar react-toastify para feedback
4. **Gráficos**: Implementar Chart.js o Recharts
5. **Exportar Datos**: Agregar botones para exportar a CSV/Excel

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Router Docs](https://reactrouter.com/en/main)
- [Vite Docs](https://vitejs.dev/)
- [Axios Docs](https://axios-http.com/docs/intro)

## ✅ Checklist de Deploy

Antes de hacer deploy a producción:

- [ ] Implementar autenticación real
- [ ] Configurar variables de entorno para API URL
- [ ] Agregar validación de formularios
- [ ] Implementar manejo de errores robusto
- [ ] Agregar tests (unit y e2e)
- [ ] Optimizar bundle size
- [ ] Configurar HTTPS
- [ ] Implementar rate limiting
- [ ] Agregar logging y monitoring
