# Configuración de API en GymPoint Mobile

## Problema Actual

La app mobile está usando datos mock en lugar de conectarse al backend real.

## Solución

### 1. Crear archivo `.env`

Crea el archivo `frontend/gympoint-mobile/.env` con el siguiente contenido:

```env
# API Configuration
# Elige la opción según tu dispositivo:

# Para Android Emulator (recomendado para desarrollo):
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000

# Para iOS Simulator:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Para dispositivo físico (reemplaza con la IP de tu PC):
# EXPO_PUBLIC_API_BASE_URL=http://192.168.X.X:3000
```

### 2. Cómo obtener la IP de tu PC (para dispositivo físico)

**Windows:**
```bash
ipconfig
# Busca "Dirección IPv4" en tu adaptador de red Wi-Fi
```

**Linux/Mac:**
```bash
ifconfig
# o
ip addr show
```

### 3. Reiniciar Expo

Después de crear/modificar el `.env`:

```bash
# Detener el servidor actual (Ctrl+C)
# Limpiar caché y reiniciar
npx expo start -c
```

### 4. Verificar la conexión

En los logs de la app deberías ver:

```
🌐 API_BASE_URL: http://10.0.2.2:3000
📡 apiClient -> baseURL: http://10.0.2.2:3000
```

Y al cargar gimnasios:

```
🔄 Intentando obtener gimnasios de la API...
✅ Datos obtenidos de /api/gyms/cercanos: X gimnasios
```

En lugar de:

```
❌ API falló completamente, usando mocks...
```

## Verificación del Backend

Asegúrate de que el backend esté corriendo:

```bash
docker ps --filter "name=backend"
```

Deberías ver:
```
NAMES              STATUS          PORTS
gympoint-backend   Up X minutes    0.0.0.0:3000->3000/tcp
```

## Prueba Manual del Endpoint

Desde tu PC, verifica que el endpoint responda:

```bash
curl http://localhost:3000/api/gyms
```

Debería devolver JSON con la lista de gimnasios.

## Troubleshooting

### Error: "timeout of 15000ms exceeded"

- **Causa**: La app no puede conectarse al backend
- **Solución**: 
  1. Verifica que el backend esté corriendo (`docker ps`)
  2. Verifica que estés usando la IP correcta en `.env`
  3. Si usas Android Emulator, usa `http://10.0.2.2:3000`
  4. Si usas dispositivo físico, asegúrate de que tu PC y teléfono estén en la misma red Wi-Fi

### Error: "Cannot read property 'trim' of undefined"

- **Causa**: Campo `birth_date` vacío en el formulario de registro
- **Solución**: Ya corregido en `useRegister.ts` - asegúrate de tener la última versión

### La app sigue usando mocks

- **Solución**:
  1. Verifica que el archivo `.env` exista
  2. Reinicia Expo con caché limpio: `npx expo start -c`
  3. Verifica los logs de consola para ver qué URL está usando

## Configuración Actual

El archivo `src/shared/config/env.ts` usa esta lógica:

1. Primero intenta usar `EXPO_PUBLIC_API_BASE_URL` del `.env`
2. Si no existe, usa fallbacks:
   - Android: `http://10.0.2.2:3000`
   - iOS: `http://localhost:3000`

El timeout está configurado en 15 segundos en `src/shared/http/apiClient.ts`.

