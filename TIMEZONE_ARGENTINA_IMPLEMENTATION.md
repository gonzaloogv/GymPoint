# Implementación de Zona Horaria Argentina (UTC-3)

## Resumen

Se implementó el uso consistente de la zona horaria de Argentina (UTC-3) en todo el backend para:
1. **Prevenir spam de tokens**: Limitar a 10 tokens por día (período de 24 horas según hora Argentina)
2. **Reinicio diario a las 00:00**: El contador de tokens se reinicia a medianoche hora Argentina
3. **Consistencia**: Todas las operaciones relacionadas con "día" usan la misma zona horaria

## Archivos Modificados

### 1. **`utils/timezone.js`** (NUEVO)
Utilidades centralizadas para manejo de zona horaria Argentina.

**Funciones principales:**
- `getArgentinaTime()`: Obtiene fecha/hora actual en Argentina
- `getStartOfDayArgentina()`: Obtiene inicio del día (00:00) en Argentina
- `getEndOfDayArgentina()`: Obtiene fin del día (23:59:59) en Argentina
- `toArgentinaTime(utcDate)`: Convierte fecha UTC a Argentina
- `getArgentinaDateString()`: Obtiene fecha en formato YYYY-MM-DD (Argentina)
- `isTodayArgentina(date)`: Verifica si una fecha es hoy (Argentina)

**Constante:**
```javascript
const ARGENTINA_OFFSET_MINUTES = -3 * 60; // UTC-3
```

### 2. **`infra/db/repositories/workout.repository.js`**
Modificada la función `hasCompletedWorkoutToday()` para usar zona horaria Argentina.

**Antes:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0); // Zona horaria LOCAL del servidor
```

**Después:**
```javascript
const { getArgentinaTime, getStartOfDayArgentina, getEndOfDayArgentina } = require('../../../utils/timezone');

async function hasCompletedWorkoutToday(idUserProfile, options = {}) {
  const argentinaTime = getArgentinaTime();
  const today = getStartOfDayArgentina();
  const endOfDay = getEndOfDayArgentina();
  // ...
}
```

### 3. **`services/workout-service.js`**
**Sin cambios** - Ya tenía la lógica correcta para prevenir spam de tokens:
```javascript
// Award tokens (limited to 1 per day to prevent farming)
if (TOKENS.WORKOUT_SESSION > 0) {
  const hasCompletedToday = await workoutRepository.hasCompletedWorkoutToday(
    workout.id_user_profile,
    {
      transaction,
      excludeSessionId: cmd.idWorkoutSession
    }
  );

  if (!hasCompleted Today) {
    // Otorgar 10 tokens
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

## Lógica de Tokens

### ✅ Flujo Correcto

1. **Usuario completa primera sesión del día (Argentina):**
   - ✅ Se otorgan 10 tokens
   - ✅ Se marca como "completado hoy"

2. **Usuario intenta completar segunda sesión el mismo día:**
   - ❌ NO se otorgan tokens
   - ⚠️ Log: "Tokens no otorgados (ya completó una sesión hoy)"

3. **A las 00:00 hora Argentina:**
   - ✅ Contador se reinicia
   - ✅ Usuario puede completar sesión y recibir 10 tokens nuevamente

### 🔒 Prevención de Spam

**Checks implementados:**
- ✅ Solo 1 sesión por día (Argentina) puede recibir tokens
- ✅ Se excluye la sesión actual al verificar (`excludeSessionId`)
- ✅ Solo sesiones con status `COMPLETED` cuentan
- ✅ Reinicio diario a las 00:00 hora Argentina

## Testing

### Test Manual
```bash
node test/manual/test-argentina-timezone.js
```

**Output esperado:**
```
=== TEST: Argentina Timezone (UTC-3) ===

🕐 Hora actual:
   UTC: 2025-11-05T17:26:51.180Z
   Argentina (UTC-3): 2025-11-05T14:26:51.180Z

📅 Rango del día actual (Argentina):
   Inicio (00:00): 2025-11-05T03:00:00.000Z
   Fin (23:59): 2025-11-06T02:59:59.999Z

✅ Lógica:
   - Un workout completado HOY (Argentina) bloqueará tokens adicionales
   - A las 00:00 hora Argentina, se reinicia el contador
   - Usuarios pueden recibir 10 tokens UNA VEZ por día

⏰ Minutos hasta medianoche (Argentina): 754 minutos
   Tokens se reinician en: 12h 34m
```

### Logs en Producción

Cuando un usuario completa un workout, verás en los logs:

```
[hasCompletedWorkoutToday] 🔍 Checking for completed workouts (Argentina UTC-3): {
  userId: 2,
  currentTimeARG: '2025-11-05T14:26:51.180Z',
  rangeStart: '2025-11-05T03:00:00.000Z',
  rangeEnd: '2025-11-06T02:59:59.999Z',
  excludeSessionId: 15
}

[hasCompletedWorkoutToday] ❌ Result: No completion today
[finishWorkoutSession] 🪙 Otorgando tokens (primera sesión del día)
```

O si ya completó una sesión hoy:

```
[hasCompletedWorkoutToday] ✅ Result: Already completed today
[finishWorkoutSession] ⚠️ Tokens no otorgados (ya completó una sesión hoy)
```

## Consideraciones Futuras

### Horario de Verano (DST)
Argentina **NO usa horario de verano** desde 2009, por lo que el offset UTC-3 es permanente.

### Si Argentina Cambia de Zona Horaria
Modificar la constante en `utils/timezone.js`:
```javascript
const ARGENTINA_OFFSET_MINUTES = -3 * 60; // Cambiar aquí
```

### Para Soportar Múltiples Países
1. Agregar campo `timezone` al perfil de usuario
2. Modificar `hasCompletedWorkoutToday` para aceptar timezone como parámetro
3. Usar librería como `moment-timezone` o `date-fns-tz`

## Resumen de Garantías

✅ **Usuario NO puede hacer spam de tokens**
✅ **Máximo 10 tokens por día (00:00 - 23:59 Argentina)**
✅ **Reinicio automático a medianoche Argentina**
✅ **Código centralizado y mantenible**
✅ **Logs detallados para debugging**

---

**Fecha de implementación:** 2025-11-05
**Zona horaria:** UTC-3 (Argentina)
**Límite diario de tokens por workout:** 10 tokens (una vez por día)
