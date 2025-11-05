# Límite Diario de Tokens por Workout Sessions

## Problema
Los usuarios podían hacer spam de workout sessions para obtener tokens infinitos, completando múltiples sesiones en el mismo día.

## Solución Implementada
Se implementó un límite de **1 sesión recompensada por día**. El contador se resetea a las 00:00 del día siguiente.

## Cambios Realizados

### 1. Repository (`workout.repository.js`)
**Función agregada:** `hasCompletedWorkoutToday(idUserProfile, options)`

```javascript
/**
 * Check if user has already completed a workout session today
 * (Used to prevent token farming by limiting rewards to 1 per day)
 */
async function hasCompletedWorkoutToday(idUserProfile, options = {}) {
  // Get start of today (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get end of today (23:59:59)
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where = {
    id_user_profile: idUserProfile,
    status: 'COMPLETED',
    finished_at: {
      [Op.between]: [today, endOfDay]
    }
  };

  // Exclude current session if provided
  if (options.excludeSessionId) {
    where.id_workout_session = {
      [Op.ne]: options.excludeSessionId
    };
  }

  const completedSession = await WorkoutSession.findOne({
    where,
    transaction: options.transaction
  });

  return !!completedSession;
}
```

**Ubicación:** `backend/node/infra/db/repositories/workout.repository.js`
**Línea:** ~334

### 2. Service (`workout-service.js`)
**Modificación en:** `finishWorkoutSession(command)`

Antes:
```javascript
// Award tokens
if (TOKENS.WORKOUT_SESSION > 0) {
  await tokenLedgerService.registrarMovimiento({
    userId: workout.id_user_profile,
    delta: TOKENS.WORKOUT_SESSION,
    reason: TOKEN_REASONS.WORKOUT_COMPLETED,
    refType: 'workout_session',
    refId: workout.id_workout_session,
    transaction
  });
}
```

Después:
```javascript
// Award tokens (limited to 1 per day to prevent farming)
if (TOKENS.WORKOUT_SESSION > 0) {
  // Check if user already completed a session today (excluding current session)
  const hasCompletedToday = await workoutRepository.hasCompletedWorkoutToday(
    workout.id_user_profile,
    {
      transaction,
      excludeSessionId: cmd.idWorkoutSession
    }
  );

  if (!hasCompletedToday) {
    console.log('[finishWorkoutSession] 🪙 Otorgando tokens (primera sesión del día)');
    await tokenLedgerService.registrarMovimiento({
      userId: workout.id_user_profile,
      delta: TOKENS.WORKOUT_SESSION,
      reason: TOKEN_REASONS.WORKOUT_COMPLETED,
      refType: 'workout_session',
      refId: workout.id_workout_session,
      transaction
    });
  } else {
    console.log('[finishWorkoutSession] ⚠️ Tokens no otorgados (ya completó una sesión hoy)');
  }
}
```

**Ubicación:** `backend/node/services/workout-service.js`
**Línea:** ~419-443

## Comportamiento

### Primera sesión del día
1. Usuario completa una workout session
2. Sistema verifica si ya completó otra sesión hoy → **NO**
3. ✅ Se otorgan 10 tokens
4. Log: "🪙 Otorgando tokens (primera sesión del día)"

### Sesiones subsecuentes del mismo día
1. Usuario completa otra workout session
2. Sistema verifica si ya completó otra sesión hoy → **SÍ**
3. ❌ NO se otorgan tokens
4. Log: "⚠️ Tokens no otorgados (ya completó una sesión hoy)"

### Al día siguiente (después de las 00:00)
1. Usuario completa una workout session
2. Sistema verifica si ya completó otra sesión **hoy** → **NO** (el día reseteo)
3. ✅ Se otorgan 10 tokens nuevamente

## Test Manual

Se creó un test manual para verificar el comportamiento:

**Ubicación:** `backend/node/test/manual/test-token-limit.js`

**Ejecutar:**
```bash
cd backend/node
node test/manual/test-token-limit.js
```

**Nota:** Ajustar el `TEST_USER_ID` en el archivo según tu base de datos.

## Consideraciones Técnicas

### Timezone
La lógica usa la timezone local del servidor para determinar el inicio/fin del día:
- Inicio: `today.setHours(0, 0, 0, 0)` → 00:00:00.000
- Fin: `endOfDay.setHours(23, 59, 59, 999)` → 23:59:59.999

Si se requiere timezone específico (ej. UTC-3 para Argentina), modificar:
```javascript
const today = new Date();
// Ajustar por timezone si es necesario
today.setHours(0, 0, 0, 0);
```

### Transacciones
La verificación se hace dentro de la misma transacción que completa la sesión, garantizando consistencia de datos.

### Exclusión de sesión actual
Se excluye la sesión actual (`excludeSessionId`) para evitar contarla en la verificación, ya que se marca como COMPLETED antes de verificar.

## Logs para Debugging

El sistema ahora genera logs útiles:
```
[finishWorkoutSession] 🪙 Otorgando tokens (primera sesión del día)
[finishWorkoutSession] ⚠️ Tokens no otorgados (ya completó una sesión hoy)
```

Estos logs ayudan a identificar rápidamente si la lógica está funcionando correctamente en producción.

## Impacto en Usuarios

### Positivo
- ✅ Previene farming de tokens
- ✅ Mantiene la economía del juego balanceada
- ✅ Incentiva entrenamientos de calidad sobre cantidad

### Negativo
- ⚠️ Usuarios que entrenan múltiples veces al día solo recibirán tokens una vez
- 💡 **Recomendación:** Comunicar claramente esta limitación en la UI

## Próximos Pasos (Opcional)

1. **UI Feedback:** Mostrar en la app cuándo el usuario ya recibió tokens hoy
2. **API Response:** Incluir campo `tokens_awarded` en la respuesta de completar sesión
3. **Achievement:** Considerar crear achievement por "entrenar múltiples veces en un día" sin otorgar tokens adicionales
4. **Configuración:** Hacer el límite diario configurable (1, 2, 3 sesiones por día)

## Testing en Producción

Para verificar en producción sin alterar datos reales:
1. Crear usuario de prueba
2. Completar 2 sesiones el mismo día
3. Verificar en `token_ledger` que solo hay 1 registro del día
4. Verificar logs del servidor

---

**Fecha de implementación:** 2025-01-05
**Desarrollador:** Claude + Gonzalo
**Branch:** `feature/integrate-routine-ui`
