# Plan de Pruebas QA - Sistema de Refresh Tokens

## Contexto

El backend implementa **rotación de refresh tokens** (single-use). Cada llamada exitosa a `/api/auth/refresh-token`:

1. Valida el refresh token actual
2. **Revoca inmediatamente** el token usado
3. Genera un **nuevo par** (access token + refresh token)

Esto requiere que el cliente **persista atómicamente** ambos tokens antes de cualquier uso posterior.

---

## Escenarios Críticos de Prueba

### 1️⃣ Ciclo de Vida Completo de Sesión

**Objetivo:** Verificar que la sesión persiste correctamente tras cerrar/reabrir la app

**Pasos:**
1. Login con credenciales válidas
2. Verificar que se guardan los tokens en SecureStore
3. Cerrar completamente la aplicación (kill process)
4. **Esperar 2 horas** (tiempo suficiente para que expire el access token @ 1h)
5. Reabrir la aplicación
6. Realizar un request protegido (ej: ver perfil, listar rutinas)

**Resultado Esperado:**
- ✅ La app restaura la sesión automáticamente
- ✅ El interceptor renueva el access token sin errores
- ✅ NO aparece error `TOKEN_REFRESH_FAILED`
- ✅ Logs muestran: `[RootNavigator] Session restored: <email>`

**Logs de Éxito:**
```
[RootNavigator] Active session found, refreshing tokens...
[tokenRefresh] Refreshing tokens...
[tokenRefresh] Tokens refreshed and persisted successfully
[RootNavigator] Session restored: user@example.com
```

---

### 2️⃣ Logout con Revocación Backend

**Objetivo:** Confirmar que el logout revoca el refresh token en el servidor

**Pasos:**
1. Login con credenciales válidas
2. Navegar a "Perfil"
3. Presionar botón "Cerrar Sesión"
4. Verificar en la base de datos (`refresh_tokens` table) que el token fue revocado

**Resultado Esperado:**
- ✅ Logs muestran: `[AppTabs] Refresh token revoked on backend`
- ✅ Usuario redirigido a pantalla de Login
- ✅ Tokens eliminados de SecureStore
- ✅ En DB: columna `revoked` = `true` para ese refresh token

**SQL de Verificación:**
```sql
SELECT id, id_account, revoked, revoked_at, created_at
FROM refresh_tokens
WHERE id_account = <USER_ID>
ORDER BY created_at DESC
LIMIT 1;
```

---

### 3️⃣ Auto-Refresh por Token Expirado

**Objetivo:** Verificar renovación automática cuando el access token expira durante uso normal

**Pasos:**
1. Login con credenciales válidas
2. **Esperar 1 hora** (expiración del access token)
3. Realizar cualquier request protegido (ej: actualizar perfil, crear rutina)

**Resultado Esperado:**
- ✅ El interceptor detecta 401 automáticamente
- ✅ Llama a `/api/auth/refresh-token` en background
- ✅ Persiste los nuevos tokens
- ✅ Re-intenta el request original con éxito
- ✅ Usuario NO percibe ningún error ni interrupción

**Logs de Éxito:**
```
[apiClient] 401 detected, refreshing token...
[tokenRefresh] Refreshing tokens...
[tokenRefresh] Tokens refreshed and persisted successfully
[apiClient] Retrying original request...
```

---

### 4️⃣ Múltiples Requests Concurrentes con Token Expirado

**Objetivo:** Verificar que el mecanismo de cola funciona correctamente

**Pasos:**
1. Login con credenciales válidas
2. Esperar 1 hora (expiración del access token)
3. **Realizar 3-5 requests simultáneos** (ej: abrir varias pantallas rápidamente)

**Resultado Esperado:**
- ✅ Solo UN refresh token es llamado (el primero)
- ✅ Los demás requests esperan en cola
- ✅ Una vez refrescado, TODOS los requests se re-intentan con éxito
- ✅ NO se generan múltiples refresh tokens simultáneos

**Logs de Éxito:**
```
[apiClient] 401 detected, refreshing token...
[apiClient] 401 detected, already refreshing - queuing request
[apiClient] 401 detected, already refreshing - queuing request
[tokenRefresh] Tokens refreshed and persisted successfully
[apiClient] Processing queued requests (3)...
```

---

### 5️⃣ Token Inválido o Revocado

**Objetivo:** Verificar manejo graceful cuando el refresh token es inválido

**Pasos:**
1. Login con credenciales válidas
2. Manualmente revocar el refresh token en DB:
   ```sql
   UPDATE refresh_tokens
   SET revoked = true
   WHERE id_account = <USER_ID>;
   ```
3. Reabrir la aplicación

**Resultado Esperado:**
- ✅ RootNavigator detecta error en refresh
- ✅ Limpia tokens locales automáticamente
- ✅ Redirige al usuario a pantalla de Login
- ✅ NO se queda en loop infinito de refresh

**Logs de Éxito:**
```
[RootNavigator] Active session found, refreshing tokens...
[tokenRefresh] Error: Invalid refresh token
[RootNavigator] Session check failed: Error: Invalid refresh token
[tokenRefresh] Tokens cleared
```

---

## Escenarios Negativos

### ❌ Error de Red Durante Refresh

**Pasos:**
1. Login válido
2. Activar modo avión
3. Intentar hacer un request protegido

**Resultado Esperado:**
- ✅ Error de red mostrado al usuario
- ✅ Tokens locales NO se borran
- ✅ Al restaurar conexión, funciona normalmente

---

### ❌ Servidor Caído Durante Refresh

**Pasos:**
1. Login válido
2. Detener el backend (docker-compose down)
3. Reabrir la app

**Resultado Esperado:**
- ✅ Timeout después de 15s (configurado en apiClient)
- ✅ Usuario redirigido a Login
- ✅ Mensaje de error apropiado

---

## Checklist de Validación Post-Deploy

Antes de marcar como "listo para producción":

- [ ] Escenario 1: Ciclo de vida completo (2h espera) ✅
- [ ] Escenario 2: Logout revoca en backend ✅
- [ ] Escenario 3: Auto-refresh por expiración (1h espera) ✅
- [ ] Escenario 4: Múltiples requests concurrentes ✅
- [ ] Escenario 5: Token inválido/revocado ✅
- [ ] Verificar logs en producción (sin datos sensibles)
- [ ] Monitorear métricas de errores `TOKEN_REFRESH_FAILED` (debe ser 0)

---

## Monitoreo en Producción

### Métricas a Vigilar

1. **Tasa de errores `TOKEN_REFRESH_FAILED`**
   - Valor esperado: **< 0.1%** (solo errores legítimos de red)
   - Alerta si: **> 5%** (indica problema de sincronización)

2. **Latencia de `/api/auth/refresh-token`**
   - P50: **< 200ms**
   - P99: **< 1s**

3. **Tokens activos no revocados post-logout**
   ```sql
   SELECT COUNT(*) FROM refresh_tokens
   WHERE revoked = false
   AND created_at < NOW() - INTERVAL '30 days';
   ```
   - Valor esperado: **0** (todos los tokens viejos deben estar revocados)

---

## Troubleshooting

### Problema: Usuario reporta logout automático constante

**Posibles Causas:**
1. Refresh token revocado pero no limpiado de SecureStore
2. Reloj del dispositivo desincronizado (invalida JWT)
3. Rotación de tokens no persistida correctamente

**Verificación:**
```typescript
// Añadir temporalmente en RootNavigator
const refreshToken = await SecureStore.getItemAsync('gp_refresh');
console.log('Current refresh token:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');
```

### Problema: Error `TOKEN_REFRESH_FAILED` persistente

**Verificación:**
1. Confirmar que `refreshAndPersistTokens` se llama ANTES de cualquier uso del access token
2. Verificar que el backend devuelve `refreshToken` en el response
3. Validar que las claves de SecureStore coinciden (`gp_access`, `gp_refresh`)

---

## Referencias de Código

- **Helper de refresh:** [src/shared/utils/tokenRefresh.ts](../src/shared/utils/tokenRefresh.ts)
- **Interceptor de API:** [src/shared/http/apiClient.ts:70-84](../src/shared/http/apiClient.ts#L70-L84)
- **RootNavigator:** [src/presentation/navigation/RootNavigator.tsx:47-71](../src/presentation/navigation/RootNavigator.tsx#L47-L71)
- **Logout handler:** [src/presentation/navigation/AppTabs.tsx:167-191](../src/presentation/navigation/AppTabs.tsx#L167-L191)
- **Backend service:** `backend/node/services/auth-service.js:436-474`

---

**Última actualización:** 2025-01-15
**Responsable QA:** Pendiente asignación
**Estado:** Escenarios definidos, pendiente ejecución inicial
