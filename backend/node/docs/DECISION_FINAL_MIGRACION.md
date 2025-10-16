# 🎯 DECISIÓN FINAL: Migración BD `presence`

**Fecha:** 2025-10-15  
**Decisión:** ❌ **NO EJECUTAR AHORA** (Posponer para V2)

---

## 📊 ANÁLISIS

### ¿Para qué sirve la tabla `presence`?

**Propósito original:**
- Trackear presencia del usuario en geofence en tiempo real
- Detectar cuando entra y sale del área
- Contar tiempo de permanencia
- Auto check-in después de X minutos (sin que el usuario presione botón)

### ¿Cómo funciona auto check-in AHORA (sin `presence`)?

```
Usuario presiona "Check-in" en la app
    ↓
Frontend envía: { id_gym, latitude, longitude }
    ↓
Backend valida:
    1. ¿Está dentro del geofence? (radio 150m por defecto)
    2. ¿Ya registró hoy?
    3. ¿El gym tiene auto_checkin_enabled?
    ↓
Si todo OK → Crea assistance directamente
    ↓
Otorga tokens + actualiza streak + frecuencia
```

**Diferencia clave:**
- ✅ SIN presence: Usuario DEBE presionar botón
- ⏭️ CON presence: Auto check-in después de 10 min SIN botón

---

## ❌ POR QUÉ NO EJECUTAR AHORA

### 1. Auto check-in funciona SIN tabla `presence`
```javascript
// Auto check-in actual (funciona perfecto):
POST /api/assistances/auto-checkin
Body: { id_gym: 5, latitude: -34.603722, longitude: -58.38159 }

✅ Valida geofence
✅ Crea assistance
✅ Otorga 10 tokens
✅ Actualiza streak
✅ Actualiza frecuencia
```

### 2. Funciones de `presence` están deprecadas

```javascript
// assistance-service.js línea 329 y 362
registrarPresencia() → Lanza error "FEATURE_REQUIRES_MIGRATION"
verificarAutoCheckIn() → Lanza error "FEATURE_REQUIRES_MIGRATION"
```

### 3. Frontend NO usa presencia

**Frontend solo envía:**
```typescript
// Cuando usuario presiona botón check-in:
await assistanceService.autoCheckIn({
  id_gym,
  latitude,
  longitude
});
```

**Frontend NO tiene:**
- Background location tracking continuo
- Lógica de permanencia
- Timer de 10 minutos

### 4. Requeriría trabajo adicional

**Para usar `presence` se necesitaría:**
1. ✅ Ejecutar migración BD
2. ❌ Implementar background location en React Native
3. ❌ Enviar ubicación cada 30 segundos
4. ❌ Lógica de timer de permanencia
5. ❌ Manejo de batería (consumo alto)
6. ❌ Permisos background location (complejo en iOS)

**Tiempo estimado:** 2-3 días adicionales

---

## ✅ BENEFICIOS DE POSPONER

### 1. MVP más rápido
- ✅ Backend listo YA
- ✅ Auto check-in funciona
- ✅ Usuarios pueden hacer check-in
- ⏭️ Feature de "auto" verdadero para V2

### 2. Menor consumo de batería
- ✅ No tracking en background
- ✅ Solo cuando usuario abre app
- ✅ Mejor UX en V1

### 3. Menos complejidad
- ✅ Menos superficie de bugs
- ✅ Más fácil de debuggear
- ✅ Menos permisos a pedir

### 4. Feedback real primero
- ✅ Ver si usuarios usan check-in
- ✅ Ver si lo quieren automático
- ✅ Data-driven decisión para V2

---

## 📋 FLUJO ACTUAL (SIN PRESENCE)

### Escenario: Usuario llega al gym

```
1. Usuario abre GymPoint app
2. Ve mapa con gyms cercanos
3. Selecciona su gym
4. Ve botón "Check-in"
5. Presiona botón
6. App valida:
   - ¿Está cerca? (150m radius)
   - ¿GPS preciso? (<100m error)
7. Backend crea assistance
8. Usuario ve: "+10 tokens, Racha: 5 días"
```

**Tiempo total:** 5-10 segundos  
**User action:** 1 tap  
**Consumo batería:** Mínimo

---

## 🔮 FLUJO FUTURO (CON PRESENCE - V2)

### Escenario: Usuario llega al gym

```
1. Usuario llega al gym (app cerrada)
2. Background location detecta geofence
3. App silenciosa: registra presence
4. Timer: 10 minutos
5. Si sigue en gym → Auto check-in automático
6. Notification: "Check-in registrado en MegaGym"
7. Usuario ve: "+10 tokens, Racha: 5 días"
```

**Tiempo total:** Automático  
**User action:** 0 taps  
**Consumo batería:** Medio-Alto

---

## 🎯 CUÁNDO EJECUTAR MIGRACIÓN

### Triggers para V2:

1. **Feedback de usuarios:**
   - "Es molesto presionar botón cada día"
   - "Olvido hacer check-in"
   - NPS < 70 por check-in manual

2. **Métricas:**
   - >1000 usuarios activos diarios
   - >70% de asistencias consistentes
   - ROI positivo de auto check-in

3. **Técnico:**
   - React Native background tasks implementado
   - Sistema de notificaciones robusto
   - Monitoreo de batería funcionando

---

## 📊 COMPARACIÓN

| Aspecto | V1 (Sin presence) | V2 (Con presence) |
|---------|-------------------|-------------------|
| **User taps** | 1 tap | 0 taps |
| **Batería** | Bajo | Medio-Alto |
| **Complejidad** | Baja | Alta |
| **Permisos** | Location when in use | Background location |
| **Dev time** | 0 días | 2-3 días |
| **Bugs risk** | Bajo | Medio |
| **MVP ready** | ✅ SÍ | ❌ NO |

---

## ✅ DECISIÓN FINAL

### Para MVP V1 (Ahora):
❌ **NO ejecutar migración `presence`**

**Usar:** Auto check-in con validación de geofence (1 tap)

**Beneficios:**
- ✅ Funciona perfectamente
- ✅ Tokens se otorgan
- ✅ Streak se actualiza
- ✅ MVP listo YA
- ✅ Menos batería
- ✅ Menos bugs

### Para V2 (Futuro):
⏭️ **Ejecutar migración cuando:**
1. Usuarios piden auto check-in verdadero
2. Background location implementado
3. Sistema de notificaciones robusto
4. Métricas justifican el desarrollo

---

## 📁 ARCHIVOS DE MIGRACIÓN (Guardados para V2)

**Listos para usar cuando se decida ejecutar:**

1. `backend/db/migrations/20251015_01_drop_old_presence_table.sql`
   - Borra tabla antigua si existe

2. `backend/db/migrations/20251015_create_presence_table.sql`
   - Crea tabla con esquema correcto

**Estimado ejecución:** 2 minutos  
**Riesgo:** Bajo (tablas bien diseñadas)

---

## 🎓 CONCLUSIÓN

**Decisión:** ❌ NO MIGRAR AHORA

**Razón:** Auto check-in funciona perfecto sin tabla `presence`. La migración es para feature "auto verdadero" que puede esperar a V2 basado en feedback real de usuarios.

**Estado Backend:** ✅ **LISTO PARA MVP V1**

---

**Elaborado por:** Desarrollador Backend Senior  
**Fecha:** 2025-10-15  
**Decisión Final:** POSPONER MIGRACIÓN

