# GymPoint MVP V1 - Roadmap Definitivo

## ✅ YA COMPLETADO (Migraciones ejecutadas)

- ✅ Eliminada tabla `gym_geofence` (redundante)
- ✅ Campos de geofencing en `gym` (auto_checkin_enabled, geofence_radius_meters, min_stay_minutes)
- ✅ Tabla `presence` para auto check-in inteligente (10 min threshold)
- ✅ Sistema de timestamps unificado en `assistance`
- ✅ 5 rutinas plantilla con metadata completa
- ✅ Índices de performance críticos
- ✅ Sincronización `app_tier` = `subscription`

---

## 🚀 LO QUE SIGUE AHORA

### FASE 1: Backend Core (Semana 1 - Días 1-3)

#### 1.1 Geolocation Service (Día 1)
**Archivo**: `src/services/geolocation.service.js`

**Funcionalidades**:
```javascript
- calculateDistance(lat1, lon1, lat2, lon2)
  └─> Haversine formula para distancia

- findNearbyGyms(userLat, userLon, radius)
  └─> Buscar gyms dentro del radio
  └─> Ordenar por distancia

- updatePresence(userId, latitude, longitude)
  └─> Actualizar/crear registro en tabla `presence`
  └─> Si duration >= 10 min → auto check-in
  └─> Si salió del rango → marcar como EXITED

- checkOut(assistanceId, userId)
  └─> Finalizar sesión
  └─> Calcular duración
  └─> Otorgar tokens (5-15 según duración)
```

**Prioridad**: 🔴 CRÍTICA (todo depende de esto)

---

#### 1.2 Challenge Service (Día 2)
**Archivo**: `src/services/challenge.service.js`

**Funcionalidades**:
```javascript
- getTodayChallenge(userId)
  └─> Obtener desafío del día
  └─> Ver progreso del usuario

- updateChallengeProgress(userId, challengeId, value)
  └─> Actualizar progreso (ej: minutos entrenados)
  └─> Si completa → otorgar tokens
  └─> Crear notificación

- generateDailyChallenge() [CRON JOB]
  └─> Crear desafío para mañana (00:01 AM)
  └─> Rotar entre tipos (MINUTES, EXERCISES, FREQUENCY)
```

**Prioridad**: 🟡 ALTA (engagement del usuario)

---

#### 1.3 Routine Service (Día 3)
**Archivo**: `src/services/routine.service.js`

**Funcionalidades**:
```javascript
- getTemplates(difficulty, limit)
  └─> Obtener rutinas plantilla filtradas
  └─> Por nivel (BEGINNER, INTERMEDIATE, ADVANCED)

- importTemplate(userId, templateRoutineId)
  └─> Copiar rutina plantilla a usuario
  └─> Copiar todos los ejercicios
  └─> Registrar en `user_imported_routine`

- getUserRoutines(userId)
  └─> Obtener rutinas del usuario (activas)
```

**Prioridad**: 🟡 ALTA (onboarding crítico)

---

### FASE 2: API Endpoints (Semana 1 - Días 3-4)

#### 2.1 Location Routes
**Archivo**: `src/routes/location.routes.js`

```http
POST   /api/location/update
Body:  { latitude, longitude, accuracy }
Response: {
  nearby_gyms: [...],
  active_presence: { gym_name, duration_minutes, status },
  auto_checkin: { id_assistance, gym_name } // solo si >= 10 min
}

GET    /api/gyms/nearby?lat=-27.48&lng=-58.81&radius=5000
Response: { gyms: [...with distance...] }

PUT    /api/assistance/:id/checkout
Response: {
  duration_minutes: 75,
  tokens_earned: 12,
  check_out_time: "15:45:00"
}
```

---

#### 2.2 Challenge Routes
**Archivo**: `src/routes/challenge.routes.js`

```http
GET    /api/challenges/today
Response: {
  id_challenge: 5,
  title: "Suma 30 minutos",
  target_value: 30,
  progress: 15,
  completed: false
}

PUT    /api/challenges/:id/progress
Body:  { value: 30 }
Response: {
  progress: 30,
  completed: true,
  tokens_earned: 10
}
```

---

#### 2.3 Routine Routes
**Archivo**: `src/routes/routine.routes.js`

```http
GET    /api/routines/templates?difficulty=BEGINNER
Response: {
  routines: [
    {
      id_routine: 7,
      routine_name: "Full Body Beginner",
      category: "STRENGTH",
      exercises_count: 6
    }
  ]
}

POST   /api/routines/:id/import
Response: {
  id_routine_copy: 25,
  routine_name: "Full Body Beginner",
  exercises: [...]
}

GET    /api/routines/me
Response: {
  routines: [...user routines...]
}
```

---

### FASE 3: React Native App (Semana 2 - Días 5-7)

#### 3.1 Background Location Tracking
**Archivo**: `src/hooks/useBackgroundLocation.js`

**Funcionalidades**:
```javascript
- Solicitar permisos (foreground + background)
- Iniciar background task
- Polling cada 100m o 5s
- Enviar ubicación a /api/location/update
- Mostrar notificación local si auto check-in
```

**Librerías necesarias**:
```bash
expo install expo-location
expo install expo-notifications
expo install expo-task-manager
```

---

#### 3.2 Componentes UI Críticos

**HomeScreen.js**:
- Lista de gyms cercanos
- Distancia en metros
- Botón "Ver detalles"

**GymDetailScreen.js**:
- Info del gym
- Status de presencia: "Detectado hace 5 min" o "Dentro desde 14:30"
- Botón "Salir del Gym" (check-out manual)

**ChallengeWidget.js**:
- Desafío del día (título, progreso, objetivo)
- Barra de progreso visual
- Tokens a ganar

**RoutineTemplatesScreen.js**:
- Lista de plantillas filtradas por nivel
- Botón "Importar rutina"
- Preview de ejercicios

**ProfileScreen.js**:
- Balance de tokens
- Historial de transacciones
- Configuración de geofencing (on/off)

---

### FASE 4: Push Notifications (Semana 2 - Día 8)

#### 4.1 Firebase Cloud Messaging Setup

**Backend**: `src/services/fcm.service.js`
```javascript
- sendPushNotification(fcmToken, notification)
- sendToMultipleDevices(userIds, notification)
- handleFailedToken(fcmToken) // marcar como revoked
```

**Frontend**: `src/services/notifications.js`
```javascript
- registerForPushNotifications()
- getFCMToken()
- sendTokenToBackend()
- handleIncomingNotification()
```

#### 4.2 Tabla user_device_tokens (OPCIONAL V1)

**Decisión**: ¿Implementar en V1 o V1.1?

**SI implementas en V1** (2 horas extra):
- Endpoint POST /api/devices/register
- Guardar FCM token en `user_device_tokens`
- Enviar pushes cuando:
  - Usuario completa desafío
  - Auto check-in confirmado
  - Tokens ganados

**SI postpones a V1.1** (recomendado):
- Solo notificaciones locales (Expo Notifications)
- Push notifications en V1.1 (después de validar producto)

**MI RECOMENDACIÓN**: ❌ NO implementar `user_device_tokens` en V1

**Razón**:
- Notificaciones locales son suficientes para MVP
- Push notifications requieren Firebase setup completo
- Puedes validar el producto sin pushes remotos
- Agrega complejidad (device token expiration, multi-device, etc)

---

## 📊 TABLA: Qué implementar y cuándo

| Feature | V1 (ahora) | V1.1 (mes 2) | V2 (mes 3+) |
|---------|------------|--------------|-------------|
| **Geolocation tracking** | ✅ SÍ | - | - |
| **Tabla `presence`** | ✅ SÍ | - | - |
| **Auto check-in (10 min)** | ✅ SÍ | - | - |
| **Manual check-out** | ✅ SÍ | - | - |
| **Tokens por duración** | ✅ SÍ | - | - |
| **Desafíos diarios** | ✅ SÍ | - | - |
| **Rutinas plantilla** | ✅ SÍ | - | - |
| **Importar rutinas** | ✅ SÍ | - | - |
| **Notificaciones locales** | ✅ SÍ | - | - |
| **user_device_tokens** | ❌ NO | ✅ SÍ | - |
| **Push notifications (FCM)** | ❌ NO | ✅ SÍ | - |
| **iOS app** | ❌ NO | ✅ SÍ | - |
| **Social features** | ❌ NO | ❌ NO | ✅ SÍ |
| **Analytics dashboard** | ❌ NO | ❌ NO | ✅ SÍ |

---

## 🎯 DECISIÓN: user_device_tokens

### OPCIÓN A: NO implementar en V1 (RECOMENDADO)

**Ventajas**:
- ✅ Lanzar más rápido (5 días vs 6-7 días)
- ✅ Menos complejidad
- ✅ Notificaciones locales suficientes para validar
- ✅ Firebase setup puede esperar

**Desventajas**:
- ❌ Usuario no recibe notificación si app cerrada
- ❌ No pushes tipo "Tu desafío expira en 2h"

**Workaround V1**:
```javascript
// Notificación local cuando app está en background
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Auto check-in confirmado',
    body: 'Entraste a Iron Temple hace 10 minutos',
  },
  trigger: null // Inmediato
});
```

---

### OPCIÓN B: Implementar en V1 (si quieres completitud)

**Ventajas**:
- ✅ Experiencia completa desde día 1
- ✅ Push notifications incluso si app cerrada
- ✅ Re-engagement mejor

**Desventajas**:
- ❌ +2 días de desarrollo
- ❌ Firebase setup (project, service account, etc)
- ❌ Manejo de tokens expirados
- ❌ Multi-device complexity

**Requerimientos extra**:
```bash
1. Crear proyecto Firebase
2. Descargar service-account-key.json
3. npm install firebase-admin
4. Crear tabla user_device_tokens (ya tienes SQL)
5. Endpoint POST /api/devices/register
6. Cron job para limpiar tokens stale
7. Testing de pushes (Android + iOS)
```

---

## 🗓️ TIMELINE ACTUALIZADO

### V1 SIN user_device_tokens (RECOMENDADO)

| Día | Tarea | Horas | Status |
|-----|-------|-------|--------|
| 1 | Geolocation Service | 6h | Pending |
| 2 | Challenge Service + Routine Service | 8h | Pending |
| 3 | API Endpoints (location, challenge, routine) | 8h | Pending |
| 4 | Background location + UI screens | 8h | Pending |
| 5 | Challenge widget + Routine templates UI | 6h | Pending |
| 6 | Testing + bug fixes | 8h | Pending |
| 7 | Deploy a Play Store | 4h | Pending |

**Total: 5-6 días full-time**

---

### V1 CON user_device_tokens (si insistes)

Agregar:
| Día | Tarea | Horas |
|-----|-------|-------|
| 6.5 | Firebase setup | 2h |
| 6.5 | FCM Service + device registration | 3h |
| 6.5 | Testing pushes | 2h |

**Total: 6-7 días full-time**

---

## ✅ MI RECOMENDACIÓN FINAL

**NO implementes `user_device_tokens` en V1.**

**Razones**:
1. Notificaciones locales son suficientes para MVP
2. Puedes validar el producto sin pushes remotos
3. Agrégalo en V1.1 si usuarios lo piden
4. Focus en core features (geofencing + challenges + routines)

**Plan V1**:
- ✅ Geolocation + presence table
- ✅ Auto check-in (10 min threshold)
- ✅ Challenges + Routines
- ✅ Notificaciones locales
- ❌ user_device_tokens (postponer a V1.1)

**Plan V1.1** (mes 2):
- ✅ Implementar user_device_tokens
- ✅ Firebase Cloud Messaging
- ✅ Push notifications remotas
- ✅ iOS support

---

## 📋 CHECKLIST PRÓXIMOS PASOS

### Hoy - Día 1
- [ ] Verificar migraciones SQL ejecutadas correctamente
- [ ] Crear `src/services/geolocation.service.js`
- [ ] Implementar calculateDistance()
- [ ] Implementar findNearbyGyms()
- [ ] Implementar updatePresence()
- [ ] Testing unitario del service

### Mañana - Día 2
- [ ] Crear `src/services/challenge.service.js`
- [ ] Crear `src/services/routine.service.js`
- [ ] Testing de ambos services

### Día 3
- [ ] Crear endpoints API (location, challenge, routine)
- [ ] Testing de endpoints con Postman
- [ ] Documentación API (opcional)

### Día 4-5
- [ ] React Native: Background location
- [ ] React Native: UI screens principales
- [ ] React Native: Challenge widget
- [ ] React Native: Routine templates

### Día 6
- [ ] Testing completo (E2E)
- [ ] Bug fixes críticos
- [ ] Performance tuning

### Día 7
- [ ] Build APK con EAS
- [ ] Upload a Play Store
- [ ] Beta testing interno

---

## ❓ PREGUNTAS PARA TI

1. **¿Implementamos user_device_tokens en V1 o V1.1?**
   - Mi recomendación: V1.1
   - Razón: Lanzar más rápido, validar primero

2. **¿Tienes el Firebase project creado?**
   - Si NO: Confirmamos que V1.1
   - Si SÍ: Podemos agregar en V1

3. **¿Prioridad de iOS?**
   - Si ALTA: Implementar user_device_tokens ahora (Android + iOS)
   - Si BAJA: Solo Android V1, iOS en V1.5

4. **¿Team size?**
   - Si solo tú: V1 sin pushes (más rápido)
   - Si 2-3 devs: Puede paralelizar pushes

---

## 🎬 DECISIÓN AHORA

**¿Qué hacemos con user_device_tokens?**

A) ❌ NO implementar en V1 (mi recomendación) → 5-6 días
B) ✅ SÍ implementar en V1 → 6-7 días

**Dime qué prefieres y empezamos con el código.**