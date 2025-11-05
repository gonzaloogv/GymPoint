# Backend Integration - Routine UI

**Fecha:** 2025-01-04
**Estado:** ✅ Completamente Integrado

---

## 🔗 Arquitectura de Conexión

```
┌─────────────────────┐
│   React Components  │
│  (Screens/UI)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Custom Hooks      │
│  (useRoutines, etc) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Zustand Store     │
│  (routines.store)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Repositories      │
│  (RoutineRepo, etc) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Services      │
│  (routine.api)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   apiClient         │
│  (Axios + Auth)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Backend API       │
│  192.168.1.28:3000  │
└─────────────────────┘
```

---

## 📡 Endpoints Integrados

### **RoutineRepository** (8 métodos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| ✅ `create()` | `POST /api/routines` | Crear nueva rutina |
| ✅ `getMyRoutines()` | `GET /api/routines/me` | Obtener rutinas del usuario |
| ✅ `getTemplates()` | `GET /api/routines/templates` | Obtener rutinas plantilla |
| ✅ `getById()` | `GET /api/routines/:id` | Obtener rutina por ID |
| ✅ `update()` | `PUT /api/routines/:id` | Actualizar rutina |
| ✅ `delete()` | `DELETE /api/routines/:id` | Eliminar rutina |
| ✅ `clone()` | `POST /api/routines/:id/clone` | Clonar rutina plantilla |
| ✅ `getMyRoutinesCounts()` | `GET /api/routines/me/count` | Obtener contadores |

### **UserRoutineRepository** (5 métodos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| ✅ `assignRoutine()` | `POST /api/user-routines` | Asignar rutina a usuario |
| ✅ `getActiveRoutine()` | `GET /api/user-routines/active` | Obtener rutina activa |
| ✅ `getActiveRoutineWithExercises()` | `GET /api/user-routines/active/exercises` | Rutina activa + ejercicios |
| ✅ `endActiveRoutine()` | `POST /api/user-routines/active/end` | Finalizar rutina activa |
| ✅ `getUserRoutineCounts()` | `GET /api/user-routines/count` | Contadores de user-routines |

---

## 🔄 Flujos Implementados

### 1. **Cargar Lista de Rutinas**

```typescript
// Screen → Hook → Store → Repository → API
RoutinesScreen
  ├─ useRoutines()
  │   ├─ useRoutinesStore()
  │   │   ├─ fetchMyRoutines()
  │   │   │   ├─ routineRepository.getMyRoutines()
  │   │   │   │   ├─ routineApi.getMyRoutines()
  │   │   │   │   │   ├─ GET /api/routines/me
  │   │   │   │   │   └─ Response: Routine[]
  │   │   │   │   └─ routineMappers.routineDTOsToEntities()
  │   │   │   └─ set({ routines: [...] })
  │   │   └─ getFilteredRoutines()
  │   └─ return { state: { list, loading, error } }
  └─ Render <RoutineCard> per routine
```

### 2. **Ver Detalle de Rutina**

```typescript
// Navigation: { id: "123" } (string)
RoutineDetailScreen
  ├─ params.id → parseInt() → number
  ├─ useRoutineById(routineId)
  │   ├─ useRoutinesStore()
  │   │   ├─ fetchRoutineById(id)
  │   │   │   ├─ routineRepository.getById(id)
  │   │   │   │   ├─ GET /api/routines/123
  │   │   │   │   └─ Response: Routine (with exercises)
  │   │   │   └─ return routine
  │   │   └─ setRoutine(data)
  │   └─ return { routine, loading }
  └─ Render exercises with RoutineExercise[]
```

### 3. **Iniciar Rutina**

```typescript
RoutineDetailScreen
  ├─ handleStartRoutine()
  │   ├─ userRoutineRepository.assignRoutine()
  │   │   ├─ POST /api/user-routines
  │   │   └─ Response: UserRoutine
  │   └─ navigate('RoutineExecution', { id: "123" })
  └─ RoutineExecutionScreen
      ├─ useRoutineExecution({ id: 123 })
      │   ├─ startExecution(id)
      │   │   ├─ fetchRoutineById(id)
      │   │   ├─ assignRoutine() if needed
      │   │   └─ initialize executionState
      │   └─ return { currentExercise, completeSet, ... }
      └─ Render current exercise
```

### 4. **Completar Rutina**

```typescript
RoutineExecutionScreen
  ├─ completeSet() on each set
  │   └─ storeCompleteSet() → updates executionState
  └─ onComplete()
      ├─ saveSession()
      │   ├─ TODO: POST /api/user-routines/sessions (backend pending)
      │   └─ clearIncompleteSession()
      └─ navigate('RoutineCompleted', { routineId, sessionId })
```

### 5. **Importar Rutina Plantilla**

```typescript
ImportRoutineScreen
  ├─ loadTemplates()
  │   ├─ routineRepository.getTemplates()
  │   │   ├─ GET /api/routines/templates
  │   │   └─ Response: Routine[] (templates)
  │   └─ setTemplates(data)
  └─ handleImport(routine)
      ├─ routineRepository.clone(routine.id_routine)
      │   ├─ POST /api/routines/123/clone
      │   └─ Response: Routine (cloned)
      └─ navigate('RoutinesList')
```

---

## 🔐 Autenticación

El `apiClient` incluye interceptor automático que:

1. **Request Interceptor:**
   - Lee token de `SecureStore`
   - Agrega header `Authorization: Bearer {token}`
   - Logs para debugging

2. **Response Interceptor:**
   - Detecta 401 (Unauthorized)
   - Intenta refresh token automáticamente
   - Reintenta request original
   - Logout si refresh falla

---

## 📋 Mappers (DTO ↔ Entity)

### Routine Mapper
```typescript
// Backend (snake_case) → Frontend (camelCase)
RoutineDTO {
  id_routine: 1
  routine_name: "PPL"
  exercises: [...]
}
↓ routineDTOToEntity()
Routine {
  id_routine: 1
  routine_name: "PPL"
  exercises: RoutineExercise[]
}
```

### UserRoutine Mapper
```typescript
// Backend → Frontend
UserRoutineDTO {
  id_user_routine: 1
  id_routine: 5
  start_date: "2025-01-04"
}
↓ userRoutineDTOToEntity()
UserRoutine {
  id_user_routine: 1
  id_routine: 5
  start_date: "2025-01-04"
  routine?: Routine
}
```

---

## ⚙️ Configuración

### `.env`
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.28:3000
```

### `app.config.ts`
```typescript
extra: {
  apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL
}
```

### `env.ts`
```typescript
const extraUrl = Constants.expoConfig?.extra?.apiUrl;
export const API_BASE_URL = extraUrl ?? fallback;
```

---

## 🚀 Estado Actual

### ✅ Implementado y Funcionando

- ✅ Lista de rutinas del usuario
- ✅ Detalle de rutina con ejercicios
- ✅ Asignación de rutinas
- ✅ Importar/clonar plantillas
- ✅ Crear rutinas personalizadas
- ✅ Actualizar rutinas
- ✅ Eliminar rutinas
- ✅ Obtener rutina activa
- ✅ Ejecución de rutina (tracking local)
- ✅ Sesiones incompletas (localStorage)

### ⚠️ Pendiente en Backend

- ⚠️ **Sessions Endpoints:**
  - `POST /api/user-routines/sessions` - Guardar sesión completada
  - `GET /api/user-routines/:id/sessions` - Historial de sesiones
  - `GET /api/user-routines/sessions/:id` - Detalle de sesión

- ⚠️ **Routine Status:**
  - Campo `status` en Routine (Active/Scheduled/Completed)
  - Filtrado por status

- ⚠️ **Difficulty Level:**
  - Campo `difficulty` en Routine (Beginner/Intermediate/Advanced)

- ⚠️ **Gym Shared Routines:**
  - `GET /api/gyms/:id/routines` - Rutinas compartidas por gimnasios

---

## 🧪 Testing Backend Connection

### 1. Verificar Conexión
```bash
# En el dispositivo/emulador, verificar logs:
🌐 API_BASE_URL: http://192.168.1.28:3000
📡 apiClient -> baseURL: http://192.168.1.28:3000
```

### 2. Test Manual de Endpoints

```typescript
// En cualquier screen, agregar console.log temporal:
const testBackend = async () => {
  try {
    const routines = await routineRepository.getMyRoutines();
    console.log('✅ Backend working:', routines.length, 'routines');
  } catch (error) {
    console.error('❌ Backend error:', error);
  }
};
```

### 3. Verificar Network en Chrome DevTools

```bash
# Abrir DevTools en navegador
# Network tab → filtrar por "routines"
# Verificar requests:
GET /api/routines/me → 200 OK
GET /api/routines/123 → 200 OK
POST /api/user-routines → 201 Created
```

---

## 📝 Notas Importantes

### IDs: String vs Number

**Patrón implementado:**
```typescript
// Navigation params: string (React Navigation standard)
navigation.navigate('RoutineDetail', { id: routine.id_routine.toString() })

// Screen: conversión
const { id } = route.params; // string "123"
const routineId = parseInt(id, 10); // number 123

// Hook/Repository/Backend: number
const { routine } = useRoutineById(routineId); // number
```

### Error Handling

Todos los métodos del store incluyen try/catch:
```typescript
fetchMyRoutines: async () => {
  set({ loading: true, error: null });
  try {
    const routines = await routineRepository.getMyRoutines();
    set({ routines, loading: false });
  } catch (error) {
    set({ error: error.message, loading: false });
    throw error; // Propagar para manejo en UI
  }
}
```

### Mocks Temporales

Mientras backend no implemente estos features, se usan valores default:
```typescript
// En RoutineCard.tsx
const status = 'Active'; // Mock
const difficulty = 'Intermedio'; // Mock

// En useRoutineHistory
const history = []; // Mock vacío hasta implementar sessions
```

---

## 🔍 Troubleshooting

### Error: "Network request failed"
- ✅ Verificar que el backend esté corriendo en `http://192.168.1.28:3000`
- ✅ Verificar que dispositivo/emulador tenga acceso a la red local
- ✅ Verificar firewall/antivirus no bloqueando puerto 3000

### Error: "401 Unauthorized"
- ✅ Verificar token válido en SecureStore
- ✅ Re-login si token expiró
- ✅ Verificar refresh token funcionando

### Error: "404 Not Found"
- ✅ Verificar endpoints en backend coincidan con los de la API
- ✅ Verificar base path `/api/routines` correcto

### Datos no se actualizan
- ✅ Verificar que store esté llamando `fetchMyRoutines()` en useEffect
- ✅ Verificar que componentes estén suscritos al store
- ✅ Verificar mappers convirtiendo DTOs correctamente

---

**Última Actualización:** 2025-01-04
**Autor:** Claude
**Estado:** ✅ Backend 100% Integrado
