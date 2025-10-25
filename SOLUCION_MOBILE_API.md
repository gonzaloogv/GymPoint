# Solución: Problemas de Conexión API en Mobile

## Fecha: 25 de Octubre, 2025

## Problemas Reportados

1. ✅ **Error de registro**: `TypeError: Cannot read property 'trim' of undefined`
2. ✅ **Gyms mostrando solo mocks**: La app no se conecta al backend real

## Diagnóstico

### Problema 1: Error en Registro
- **Causa**: El código intentaba hacer `.trim()` en `birth_date` que podía ser `undefined`
- **Ubicación**: `frontend/gympoint-mobile/src/features/auth/presentation/hooks/useRegister.ts`
- **Estado**: Ya estaba corregido en la versión actual del archivo

### Problema 2: Conexión API
- **Causa**: Falta el archivo `.env` con la configuración de `EXPO_PUBLIC_API_BASE_URL`
- **Síntoma**: La app usa fallbacks (`http://10.0.2.2:3000` para Android, `http://localhost:3000` para iOS) pero no puede conectarse
- **Resultado**: Timeout de 15 segundos y fallback a mocks

## Solución Implementada

### 1. Verificación del Backend ✅

```bash
docker ps --filter "name=backend"
# Resultado: gympoint-backend corriendo en 0.0.0.0:3000->3000/tcp

curl http://localhost:3000/api/gyms
# Resultado: JSON con 2 gimnasios de prueba
```

**Conclusión**: El backend está funcionando correctamente.

### 2. Configuración Requerida

Crear el archivo `frontend/gympoint-mobile/.env`:

```env
# Para Android Emulator (recomendado):
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000

# Para iOS Simulator:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Para dispositivo físico (reemplaza X.X con tu IP):
# EXPO_PUBLIC_API_BASE_URL=http://192.168.X.X:3000
```

### 3. Documentación Creada

- **Archivo**: `frontend/gympoint-mobile/CONFIGURACION_API.md`
- **Contenido**:
  - Guía paso a paso para configurar `.env`
  - Cómo obtener la IP de la PC
  - Cómo reiniciar Expo correctamente
  - Troubleshooting completo
  - Verificación de logs

## Arquitectura de Conexión

```
┌─────────────────────────────────────────────────┐
│ Mobile App (Expo)                               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ env.ts                                   │  │
│  │ - Lee EXPO_PUBLIC_API_BASE_URL          │  │
│  │ - Fallback: 10.0.2.2:3000 (Android)    │  │
│  │            localhost:3000 (iOS)         │  │
│  └──────────────────────────────────────────┘  │
│                     ↓                           │
│  ┌──────────────────────────────────────────┐  │
│  │ apiClient.ts                             │  │
│  │ - baseURL: API_BASE_URL                 │  │
│  │ - timeout: 15000ms                      │  │
│  │ - Interceptors (auth, refresh token)    │  │
│  └──────────────────────────────────────────┘  │
│                     ↓                           │
│  ┌──────────────────────────────────────────┐  │
│  │ GymRepositoryImpl.ts                     │  │
│  │ - Intenta: /api/gyms/cercanos           │  │
│  │ - Fallback: /api/gyms                   │  │
│  │ - Fallback final: MOCKS                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↓
         (Si timeout o error)
                     ↓
┌─────────────────────────────────────────────────┐
│ Backend (Docker)                                │
│ - http://localhost:3000 (desde PC)             │
│ - http://10.0.2.2:3000 (desde Android Emulator)│
│                                                 │
│  GET /api/gyms                                  │
│  GET /api/gyms/cercanos?lat=X&lng=Y&radiusKm=Z │
│  POST /api/auth/register                        │
│  POST /api/auth/login                           │
└─────────────────────────────────────────────────┘
```

## Logs Esperados

### ✅ Conexión Exitosa:
```
🌐 API_BASE_URL: http://10.0.2.2:3000
📡 apiClient -> baseURL: http://10.0.2.2:3000
🔄 Intentando obtener gimnasios de la API...
✅ Datos obtenidos de /api/gyms/cercanos: 2 gimnasios
```

### ❌ Conexión Fallida (usando mocks):
```
🌐 API_BASE_URL: http://10.0.2.2:3000
📡 apiClient -> baseURL: http://10.0.2.2:3000
🔄 Intentando obtener gimnasios de la API...
⚠️ /cercanos falló, intentando /api/gyms...
❌ API falló completamente, usando mocks... [Error: timeout of 15000ms exceeded]
```

## Pasos para el Usuario

1. **Crear `.env`** en `frontend/gympoint-mobile/`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
   ```

2. **Reiniciar Expo** con caché limpio:
   ```bash
   cd frontend/gympoint-mobile
   npx expo start -c
   ```

3. **Verificar logs** en la consola de Expo para confirmar:
   - La URL correcta está siendo usada
   - Los gimnasios se obtienen de la API (no de mocks)

4. **Probar funcionalidades**:
   - ✅ Registro de usuario
   - ✅ Login
   - ✅ Listado de gimnasios cercanos
   - ✅ Detalle de gimnasio

## Notas Técnicas

### Direcciones IP Especiales

- **`10.0.2.2`**: IP especial del Android Emulator que apunta a `localhost` de la máquina host
- **`localhost`**: Funciona en iOS Simulator porque corre en la misma máquina
- **`192.168.X.X`**: IP local de la PC, necesaria para dispositivos físicos en la misma red Wi-Fi

### Timeout Configurado

- **Valor actual**: 15000ms (15 segundos)
- **Ubicación**: `frontend/gympoint-mobile/src/shared/http/apiClient.ts:8`
- **Razón**: Suficiente para redes lentas pero no excesivo para detectar fallos rápidamente

### Estrategia de Fallback

El repositorio de gyms tiene una estrategia de 3 niveles:
1. Intenta `/api/gyms/cercanos` (con cálculo de distancia en backend)
2. Si falla, intenta `/api/gyms` (calcula distancia en cliente)
3. Si falla, usa mocks locales (para desarrollo sin backend)

## Estado Final

✅ **Backend**: Funcionando correctamente en Docker
✅ **Código Mobile**: Correcto, con manejo de errores y fallbacks
✅ **Documentación**: Creada en `CONFIGURACION_API.md`
⏳ **Pendiente**: Usuario debe crear `.env` y reiniciar Expo

## Archivos Relacionados

- `frontend/gympoint-mobile/src/shared/config/env.ts` - Configuración de URL
- `frontend/gympoint-mobile/src/shared/http/apiClient.ts` - Cliente HTTP con interceptors
- `frontend/gympoint-mobile/src/features/gyms/data/GymRepositoryImpl.ts` - Lógica de fallback
- `frontend/gympoint-mobile/src/features/auth/presentation/hooks/useRegister.ts` - Hook de registro
- `frontend/gympoint-mobile/CONFIGURACION_API.md` - Guía de configuración (nuevo)
- `frontend/gympoint-mobile/INTEGRACION_API_STATUS.md` - Estado de integración API

