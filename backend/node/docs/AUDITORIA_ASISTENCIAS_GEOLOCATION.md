# 🔴 AUDITORÍA CRÍTICA: Sistema de Asistencias y Geolocalización

**Fecha:** 2025-10-15  
**Auditor:** Desarrollador Backend Senior  
**Estado:** 🔴 **CRÍTICO - REQUIERE ACCIÓN INMEDIATA**

---

## 📊 Resumen Ejecutivo

Se encontraron **7 problemas críticos** y **3 problemas menores** que afectan la funcionalidad, consistencia y mantenibilidad del sistema de asistencias y auto check-in basado en geolocalización.

**Archivos analizados:**
- ✅ `services/assistance-service.js` (366 líneas)
- ✅ `controllers/assistance-controller.js` (147 líneas)
- ✅ `services/geolocation-service.js` (374 líneas)
- ✅ `models/Presence.js` (89 líneas)
- ✅ `models/Assistance.js` (72 líneas)
- ✅ `routes/assistance-routes.js` (262 líneas)
- ✅ `migrations/20251015_create_presence_table.sql`

---

## 🔴 PROBLEMAS CRÍTICOS (7)

### 1. ❌ INCONSISTENCIA CRÍTICA: Esquema de tabla `presence`

**Severidad:** 🔴 BLOQUEANTE  
**Impacto:** Sistema no funcional, posibles errores SQL

#### Problema
Existen **DOS esquemas diferentes** para la misma tabla `presence`:

**Migración SQL (20251015_create_presence_table.sql):**
```sql
CREATE TABLE presence (
  id_presence INT,
  id_user INT,           -- ❌ Campo antiguo
  id_gym INT,
  entry_time DATETIME,   -- ❌ Campo antiguo
  exit_time DATETIME,    -- ❌ Campo antiguo
  completed TINYINT(1)   -- ❌ Campo antiguo
);
```

**Modelo Sequelize (models/Presence.js):**
```javascript
{
  id_presence: BIGINT,
  id_user_profile: INTEGER,  // ✅ Campo nuevo
  id_gym: INTEGER,
  first_seen_at: DATE,       // ✅ Campo nuevo
  last_seen_at: DATE,        // ✅ Campo nuevo
  exited_at: DATE,           // ✅ Campo nuevo
  status: ENUM('DETECTING', 'CONFIRMED', 'EXITED'),  // ✅ Campo nuevo
  converted_to_assistance: BOOLEAN,  // ✅ Campo nuevo
  id_assistance: INTEGER,    // ✅ Campo nuevo
  distance_meters: DECIMAL,  // ✅ Campo nuevo
  accuracy_meters: DECIMAL,  // ✅ Campo nuevo
  location_updates_count: INTEGER  // ✅ Campo nuevo
}
```

#### Consecuencias
- ❌ `geolocation-service.js` intenta usar campos que NO existen en DB
- ❌ `assistance-service.js` usa campos antiguos que NO están en el modelo
- ❌ Queries SQL fallan silenciosamente
- ❌ Relaciones FK incorrectas (`id_user` vs `id_user_profile`)

#### Solución Requerida
1. **DECIDIR** qué esquema es el correcto (recomendación: modelo Sequelize)
2. **CREAR** migración para actualizar tabla SQL al esquema nuevo
3. **ACTUALIZAR** todos los servicios para usar el mismo esquema

---

### 2. ❌ DUPLICACIÓN DE LÓGICA: Dos implementaciones de auto check-in

**Severidad:** 🔴 CRÍTICO  
**Impacto:** Código duplicado, inconsistencias, bugs difíciles de rastrear

#### Problema
Existen **DOS servicios diferentes** haciendo lo mismo:

**`assistance-service.js`** (implementación antigua):
- `registrarPresencia()` - líneas 285-312
- `verificarAutoCheckIn()` - líneas 318-354
- `autoCheckIn()` - líneas 224-279

**`geolocation-service.js`** (implementación nueva):
- `updateLocation()` - líneas 57-102
- `_processPresence()` - líneas 107-172
- `_createAutoCheckIn()` - líneas 177-223

#### Diferencias Críticas

| Aspecto | assistance-service.js | geolocation-service.js |
|---------|----------------------|------------------------|
| **Esquema DB** | `id_user`, `entry_time`, `completed` | `id_user_profile`, `first_seen_at`, `status` |
| **Actualiza Streak** | ❌ NO | ✅ SÍ |
| **Actualiza Frequency** | ❌ NO | ✅ SÍ |
| **Otorga Tokens** | ❌ NO | ❌ NO (falta en ambos) |
| **Maneja Transacciones** | ❌ NO | ✅ SÍ |
| **Validación GPS** | ✅ SÍ | ✅ SÍ |

#### Solución Requerida
**ELIMINAR** uno de los dos servicios y consolidar funcionalidad.

Recomendación: **Mantener `geolocation-service.js`** porque:
- ✅ Usa esquema nuevo
- ✅ Tiene transacciones DB
- ✅ Actualiza streak/frequency
- ✅ Arquitectura más robusta

---

### 3. ❌ CONTROLADORES FALTANTES

**Severidad:** 🔴 BLOQUEANTE  
**Impacto:** Rutas expuestas retornan 500

#### Problema
Las rutas están definidas pero los controladores NO existen:

**`routes/assistance-routes.js` línea 138:**
```javascript
router.post('/presence', verificarToken, verificarUsuarioApp, controller.registrarPresencia);
```

**`routes/assistance-routes.js` línea 164:**
```javascript
router.post('/auto-checkin', verificarToken, verificarUsuarioApp, controller.verificarAutoCheckIn);
```

**`controllers/assistance-controller.js`:**
```javascript
module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  autoCheckIn,
  checkOut
  // ❌ FALTAN: registrarPresencia, verificarAutoCheckIn
};
```

#### Consecuencias
- ❌ `POST /api/assistances/presence` → Error 500
- ❌ `POST /api/assistances/auto-checkin` → Error 500
- ❌ Frontend no puede usar estas funcionalidades

#### Solución Requerida
Agregar controladores faltantes en `assistance-controller.js`

---

### 4. ❌ FALTA `id_streak` EN AUTO CHECK-IN

**Severidad:** 🔴 BLOQUEANTE  
**Impacto:** Violación de constraint NOT NULL

#### Problema
**`assistance-service.js` líneas 268-273:**
```javascript
const nuevaAsistencia = await Assistance.create({
  id_user: idUserProfile,
  id_gym,
  date: fecha,
  check_in_time: hora
  // ❌ FALTA: id_streak (campo NOT NULL en Assistance)
});
```

**`models/Assistance.js` línea 50-52:**
```javascript
id_streak: {
  type: DataTypes.INTEGER,
  allowNull: false  // ❌ Campo obligatorio
},
```

#### Consecuencias
- ❌ `autoCheckIn()` falla con error SQL: "Field 'id_streak' doesn't have a default value"
- ❌ No se pueden crear asistencias automáticas

#### Solución Requerida
Agregar lógica para obtener/crear streak antes de crear asistencia (como lo hace `registrarAsistencia()`)

---

### 5. ❌ NO SE OTORGAN TOKENS EN AUTO CHECK-IN

**Severidad:** 🔴 CRÍTICO  
**Impacto:** Usuarios no reciben recompensas, incentivo roto

#### Problema
Las funciones de auto check-in **NO otorgan tokens**:

**`assistance-service.js`:**
- ❌ `autoCheckIn()` - NO otorga tokens
- ❌ `registrarPresencia()` - NO otorga tokens
- ❌ `verificarAutoCheckIn()` - NO otorga tokens

**Comparación con check-in manual:**
```javascript
// registrarAsistencia() - SÍ otorga tokens (línea 116-122)
await tokenLedgerService.registrarMovimiento({
  userId: idUserProfile,
  delta: TOKENS.ATTENDANCE,
  reason: TOKEN_REASONS.ATTENDANCE,
  refType: 'assistance',
  refId: nuevaAsistencia.id_assistance
});
```

#### Consecuencias
- ❌ Inequidad: check-in manual otorga tokens, auto check-in NO
- ❌ Usuarios pierden incentivos
- ❌ Inconsistencia en lógica de negocio

#### Solución Requerida
Agregar `tokenLedgerService.registrarMovimiento()` en todas las funciones de auto check-in

---

### 6. ❌ NO SE ACTUALIZA STREAK/FRECUENCIA EN AUTO CHECK-IN

**Severidad:** 🔴 CRÍTICO  
**Impacto:** Métricas incorrectas, gamificación rota

#### Problema
**`assistance-service.js`:**
- ❌ `autoCheckIn()` - NO actualiza streak
- ❌ `registrarPresencia()` - NO actualiza streak
- ❌ `verificarAutoCheckIn()` - NO actualiza streak ni frecuencia

**Comparación con check-in manual:**
```javascript
// registrarAsistencia() - SÍ actualiza (líneas 94-125)
if (ultimaAsistencia) {
  racha.value += 1;
} else {
  if (racha.recovery_items > 0) {
    racha.recovery_items -= 1;
  } else {
    racha.last_value = racha.value;
    racha.value = 1;
  }
}
await racha.save();
await frequencyService.actualizarAsistenciaSemanal(idUserProfile);
```

#### Consecuencias
- ❌ Racha no se incrementa
- ❌ Frecuencia semanal no se actualiza
- ❌ Dashboard muestra datos incorrectos
- ❌ Gamificación no funciona

#### Solución Requerida
Implementar lógica de streak y frecuencia en auto check-in

---

### 7. ❌ FOREIGN KEY INCORRECTA EN MIGRACIÓN

**Severidad:** 🔴 BLOQUEANTE  
**Impacto:** Relaciones DB rotas

#### Problema
**`migrations/20251015_create_presence_table.sql` línea 14:**
```sql
FOREIGN KEY (id_user) REFERENCES user(id_user)
```

**Problema:** La tabla `user` NO EXISTE en el sistema.

**Arquitectura correcta del proyecto:**
- `accounts` - Tabla de autenticación
- `user_profiles` - Tabla de perfiles (donde está `id_user_profile`)

#### Consecuencias
- ❌ FK inválida apunta a tabla inexistente
- ❌ No se pueden insertar registros
- ❌ Migraciones fallan en DB limpias

#### Solución Requerida
```sql
FOREIGN KEY (id_user_profile) REFERENCES user_profiles(id_user_profile)
```

---

## ⚠️ PROBLEMAS MENORES (3)

### 8. ⚠️ INCONSISTENCIA: Dos funciones `calculateDistance`

**Archivos:**
- `assistance-service.js` línea 14-22: `calcularDistancia()` - Radio Tierra = 6378137 m
- `geolocation-service.js` línea 12-22: `calculateDistance()` - Radio Tierra = 6371 km

**Impacto:** Cálculos ligeramente diferentes en distintas partes del sistema.

**Solución:** Crear un único módulo `utils/geo.js` con función compartida.

---

### 9. ⚠️ FALTA MANEJO DE ERRORES ESPECÍFICOS

**`assistance-service.js` línea 251-253:**
```javascript
if (gym.auto_checkin_enabled === false) {
  throw new BusinessError('Auto check-in deshabilitado...', 'AUTO_CHECKIN_DISABLED');
}
```

**Problema:** El controller NO maneja este error específico, retorna genérico 400.

**Solución:** Implementar error handler centralizado para códigos de error personalizados.

---

### 10. ⚠️ FALTA VALIDACIÓN DE ACCURACY EN AUTO CHECK-IN

**`assistance-service.js` `autoCheckIn()` NO valida accuracy:**
```javascript
const autoCheckIn = async ({ id_user, id_gym, latitude, longitude, accuracy = null }) => {
  // ❌ NO valida accuracy aquí
```

**Pero `registrarAsistencia()` SÍ lo hace (líneas 48-53):**
```javascript
if (accuracy != null) {
  const acc = Number(accuracy);
  if (Number.isFinite(acc) && acc > ACCURACY_MAX_METERS) {
    throw new ValidationError(`GPS con baja precisión...`);
  }
}
```

**Solución:** Aplicar validación de accuracy en todas las funciones.

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Normalización de Esquema (URGENTE)
1. ✅ **Crear migración** para actualizar tabla `presence` al esquema nuevo
2. ✅ **Actualizar FK** para apuntar a `user_profiles(id_user_profile)`
3. ✅ **Ejecutar migración** en DB de desarrollo y producción

### Fase 2: Consolidación de Servicios (CRÍTICO)
4. ✅ **Migrar funcionalidad** de `assistance-service.js` a `geolocation-service.js`
5. ✅ **Agregar otorgamiento de tokens** en auto check-in
6. ✅ **Implementar controladores faltantes** en `assistance-controller.js`
7. ✅ **Eliminar código duplicado** de `assistance-service.js`

### Fase 3: Correcciones de Lógica (ALTA PRIORIDAD)
8. ✅ **Agregar `id_streak`** en todas las creaciones de `Assistance`
9. ✅ **Implementar actualización de streak/frecuencia** en auto check-in
10. ✅ **Unificar función de distancia** en módulo compartido

### Fase 4: Testing y Validación (REQUERIDO)
11. ✅ **Crear tests unitarios** para cada endpoint
12. ✅ **Probar flujo completo** de auto check-in
13. ✅ **Validar otorgamiento de tokens**
14. ✅ **Verificar actualización de métricas**

---

## 🎯 RECOMENDACIONES ARQUITECTÓNICAS

### 1. Consolidar en un único servicio de ubicación
```
geolocation-service.js (PRINCIPAL)
├── updateLocation() - Actualizar ubicación usuario
├── findNearbyGyms() - Buscar gyms cercanos  
├── processAutoCheckIn() - Auto check-in automático
└── manualCheckIn() - Check-in manual con validación GPS
```

### 2. Separar responsabilidades
```
assistance-service.js (SECUNDARIO)
├── getAssistanceHistory() - Historial
├── checkOut() - Salida y bonus duración
└── getAssistanceStats() - Estadísticas
```

### 3. Crear módulos compartidos
```
utils/
├── geo.js - Funciones geolocalización
├── streak.js - Lógica de rachas
└── frequency.js - Lógica de frecuencia
```

---

## 📊 MATRIZ DE RIESGO

| ID | Problema | Severidad | Impacto | Urgencia | Estado |
|----|----------|-----------|---------|----------|--------|
| 1 | Esquema inconsistente | 🔴 CRÍTICO | ALTO | URGENTE | ❌ Pendiente |
| 2 | Duplicación de lógica | 🔴 CRÍTICO | ALTO | URGENTE | ❌ Pendiente |
| 3 | Controladores faltantes | 🔴 CRÍTICO | ALTO | URGENTE | ❌ Pendiente |
| 4 | Falta id_streak | 🔴 CRÍTICO | ALTO | URGENTE | ❌ Pendiente |
| 5 | No otorga tokens | 🔴 CRÍTICO | MEDIO | ALTA | ❌ Pendiente |
| 6 | No actualiza streak | 🔴 CRÍTICO | MEDIO | ALTA | ❌ Pendiente |
| 7 | FK incorrecta | 🔴 CRÍTICO | ALTO | URGENTE | ❌ Pendiente |
| 8 | Funciones distancia duplicadas | ⚠️ MENOR | BAJO | MEDIA | ❌ Pendiente |
| 9 | Manejo de errores | ⚠️ MENOR | BAJO | BAJA | ❌ Pendiente |
| 10 | Validación accuracy | ⚠️ MENOR | BAJO | MEDIA | ❌ Pendiente |

---

## 🔍 CONCLUSIÓN

El sistema de asistencias tiene **inconsistencias fundamentales** que requieren refactorización urgente:

### Problemas Principales:
1. 🔴 **Esquema de datos duplicado** (migración SQL vs modelo Sequelize)
2. 🔴 **Lógica de negocio duplicada** (2 servicios haciendo lo mismo)
3. 🔴 **Funcionalidad incompleta** (falta tokens, streak, frecuencia en auto check-in)
4. 🔴 **Rutas expuestas sin implementación** (500 errors)

### Impacto en Producción:
- ❌ Auto check-in NO funciona
- ❌ Usuarios NO reciben tokens por auto check-in
- ❌ Métricas de gamificación incorrectas
- ❌ Posibles errores SQL y violaciones de constraints

### Tiempo Estimado de Corrección:
- **Fase 1-2:** 8-12 horas (crítico)
- **Fase 3-4:** 4-6 horas (alta prioridad)
- **Total:** 12-18 horas de desarrollo + testing

---

**Próximos Pasos:**
1. ✅ Aprobar plan de acción
2. ✅ Asignar recursos para corrección
3. ✅ Ejecutar fases en orden
4. ✅ Validar con testing exhaustivo

---

**Elaborado por:** Desarrollador Backend Senior  
**Fecha:** 2025-10-15  
**Versión:** 1.0

