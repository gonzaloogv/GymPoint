# 📱 GymPoint Admin - Rutas y Funcionalidades

## 🗺️ Mapa de Rutas

```
/login                    → Autenticación de administradores
/                         → Dashboard (Panel principal)
/users                    → Gestión de usuarios
/gyms                     → Gestión de gimnasios
/routines                 → Plantillas de rutinas
/exercises                → Catálogo de ejercicios
/reviews                  → Gestión de reviews
/transactions             → Historial de transacciones de tokens
/rewards                  → Gestión de recompensas
/daily-challenges         → Desafíos diarios
/achievements             → Catálogo de logros
```

---

## 🔐 1. Login (`/login`)

### Funcionalidad
- Autenticación de administradores
- Almacena token JWT en `localStorage`
- Redirección automática al dashboard

### Características
- ✅ Validación de credenciales
- ✅ Manejo de errores
- ✅ Protección de rutas (redirect si ya está autenticado)

### Endpoints Backend
```
POST /api/auth/login
```

---

## 📊 2. Dashboard (`/`)

### Funcionalidad
Panel principal con estadísticas generales del sistema

### Métricas Mostradas

#### Estadísticas Principales
- **Total de Usuarios**: Cantidad total de usuarios registrados
- **Total de Gimnasios**: Cantidad de gimnasios en el sistema
- **Nuevos Registros (30 días)**: Usuarios registrados en el último mes
- **Tokens en Circulación**: Total de tokens activos en el sistema

#### Distribución de Suscripciones
- Usuarios FREE
- Usuarios PREMIUM

#### Distribución de Roles
- Lista de roles con cantidad de usuarios por rol

#### Actividad Reciente (Últimos 7 días)
- **Nuevos Usuarios**: Últimos 5 usuarios registrados
- **Inicios de Sesión**: Últimos 5 logins con fecha/hora

### Endpoints Backend
```
GET /api/admin/stats
GET /api/admin/activity?days=7
GET /api/gyms
```

---

## 👥 3. Usuarios (`/users`)

### Funcionalidad
Gestión completa de usuarios del sistema

### Características Principales

#### Visualización
- **Modo Cuadrícula**: Cards con información del usuario
- **Modo Tabla**: Vista tabular con todas las columnas

#### Filtros
- **Búsqueda**: Por nombre, apellido o email
- **Suscripción**: FREE, PREMIUM o todas
- **Paginación**: 20 usuarios por página

#### Acciones por Usuario
1. **Activar/Desactivar**: Habilitar o deshabilitar cuenta
2. **Otorgar Tokens**: Modal para agregar/quitar tokens
   - Cantidad (positivo o negativo)
   - Razón (opcional)
3. **Cambiar Suscripción**: Toggle entre FREE y PREMIUM

### Información Mostrada
- ID de usuario
- Email
- Nombre completo
- Suscripción (badge)
- Tokens actuales
- Estado (activo/inactivo)

### Endpoints Backend
```
GET /api/admin/users?page=1&limit=20&search=...&subscription=...
POST /api/admin/users/:id/deactivate
POST /api/admin/users/:id/activate
POST /api/admin/users/:id/tokens
PATCH /api/admin/users/:id/subscription
```

---

## 🏋️ 4. Gimnasios (`/gyms`)

### Funcionalidad
Gestión completa de gimnasios

### Características Principales

#### Listado
- Vista en cards con información resumida
- Filtros por ciudad, verificación, destacados
- Búsqueda por nombre

#### Crear/Editar Gimnasio
**Información Básica**:
- Nombre
- Descripción
- Ciudad
- Dirección
- Coordenadas (latitud, longitud)

**Contacto**:
- Teléfono
- WhatsApp
- Email
- Sitio web
- Instagram
- Facebook
- Google Maps URL

**Configuración**:
- Equipment (lista de equipamiento)
- Rules (reglas del gimnasio)
- Amenities (amenidades disponibles)
- Precio mensual
- Precio semanal
- Foto URL
- Verificado
- Destacado
- Auto check-in habilitado
- Radio de geofence (metros)
- Tiempo mínimo de estadía (minutos)

#### Gestión de Horarios

**Horarios Regulares** (por día de la semana):
- Día de la semana (Lunes-Domingo)
- Hora de apertura
- Hora de cierre
- Editar/Eliminar horarios

**Horarios Especiales** (fechas específicas):
- Fecha
- Estado: Abierto/Cerrado
- Si está abierto: hora de apertura y cierre
- Si está cerrado: motivo
- Editar/Eliminar horarios especiales

### Endpoints Backend
```
GET /api/gyms
GET /api/gyms/:id
POST /api/gyms
PUT /api/gyms/:id
DELETE /api/gyms/:id

GET /api/gyms/:id/schedules
POST /api/gyms/:id/schedules
PATCH /api/gyms/:id/schedules/:scheduleId
DELETE /api/gyms/:id/schedules/:scheduleId

GET /api/gyms/:id/special-schedules
POST /api/gyms/:id/special-schedules
PATCH /api/gyms/:id/special-schedules/:scheduleId
DELETE /api/gyms/:id/special-schedules/:scheduleId
```

---

## 💪 5. Plantillas de Rutinas (`/routines`)

### Funcionalidad
Gestión de rutinas predefinidas para usuarios

### Características Principales

#### Filtros
- **Dificultad**: BEGINNER, INTERMEDIATE, ADVANCED
- **Búsqueda**: Por nombre de rutina

#### Crear/Editar Rutina
- **Nombre**: Nombre de la rutina
- **Descripción**: Descripción detallada
- **Dificultad**: Nivel recomendado
- **Días de entrenamiento**: Selección múltiple de días
- **Ejercicios**: Lista de ejercicios con:
  - Ejercicio (selección del catálogo)
  - Series
  - Repeticiones
  - Peso sugerido (opcional)
  - Tiempo de descanso (opcional)
  - Notas (opcional)

#### Acciones
- Crear nueva plantilla
- Editar plantilla existente
- Eliminar plantilla
- Ver detalles completos

### Información Mostrada
- Nombre de la rutina
- Dificultad (badge)
- Días de entrenamiento
- Cantidad de ejercicios
- Descripción

### Endpoints Backend
```
GET /api/routine-templates
GET /api/routine-templates/:id
POST /api/routine-templates
PUT /api/routine-templates/:id
DELETE /api/routine-templates/:id
```

---

## 🏃 6. Ejercicios (`/exercises`)

### Funcionalidad
Catálogo completo de ejercicios disponibles

### Características Principales

#### Filtros
- **Grupo Muscular**: Filtro dinámico basado en ejercicios existentes
- **Búsqueda**: Por nombre o descripción

#### Crear/Editar Ejercicio
- **Nombre**: Nombre del ejercicio
- **Descripción**: Descripción detallada
- **Grupo Muscular**: Grupo muscular principal trabajado
- **Equipamiento**: Equipamiento necesario
- **Dificultad**: Nivel de dificultad
- **Instrucciones**: Pasos para realizar el ejercicio
- **URL de Video**: Link a video demostrativo (opcional)
- **URL de Imagen**: Link a imagen (opcional)

#### Acciones
- Crear nuevo ejercicio
- Editar ejercicio existente
- Eliminar ejercicio
- Ver detalles completos

### Información Mostrada
- Nombre del ejercicio
- Grupo muscular (badge)
- Descripción
- Equipamiento necesario
- Dificultad

### Endpoints Backend
```
GET /api/exercises
GET /api/exercises/:id
POST /api/exercises
PUT /api/exercises/:id
DELETE /api/exercises/:id
```

---

## ⭐ 7. Reviews (`/reviews`)

### Funcionalidad
Gestión de reviews de gimnasios

### Características Principales

#### Estadísticas
- Total de reviews
- Reviews aprobadas
- Reviews pendientes
- Calificación promedio
- Distribución por estrellas

#### Filtros
- **Estado**: Todas, Aprobadas, Pendientes
- **Calificación**: Filtro por estrellas (1-5)
- **Búsqueda**: Por nombre de usuario, gimnasio o comentario

#### Acciones por Review
1. **Aprobar**: Marcar como aprobada (visible en la app)
2. **Rechazar**: Marcar como no aprobada (oculta en la app)
3. **Eliminar**: Eliminar permanentemente

### Información Mostrada
- Usuario que hizo la review
- Gimnasio revisado
- Calificación (estrellas)
- Comentario
- Fecha de creación
- Estado (aprobada/pendiente)

### Endpoints Backend
```
GET /api/reviews
GET /api/reviews/stats
PATCH /api/reviews/:id/approve
DELETE /api/reviews/:id
```

---

## 💰 8. Transacciones (`/transactions`)

### Funcionalidad
Historial completo de movimientos de tokens

### Características Principales

#### Filtros
- **Usuario**: Filtrar por ID de usuario
- **Paginación**: 50 transacciones por página

#### Información Mostrada
- **ID de Transacción**: Identificador único
- **Usuario**: Nombre y email
- **Delta**: Cambio en tokens (positivo/negativo)
  - Verde si es positivo (+)
  - Rojo si es negativo (-)
- **Balance Final**: Tokens después de la transacción
- **Razón**: Motivo de la transacción
- **Referencia**: Tipo y ID de referencia (si aplica)
- **Fecha**: Fecha y hora de la transacción

### Tipos de Transacciones
- Canje de recompensa
- Otorgamiento manual (admin)
- Desafío completado
- Asistencia al gimnasio
- Bonificación
- Penalización

### Endpoints Backend
```
GET /api/admin/transactions?page=1&limit=50&user_id=...
```

---

## 🎁 9. Recompensas (`/rewards`)

### Funcionalidad
Gestión de recompensas canjeables por tokens

### Características Principales

#### Estadísticas
- Total de recompensas
- Recompensas activas
- Recompensas inactivas
- Recompensas expiradas
- Total de canjes
- Tokens gastados

#### Filtros
- **Estado**: Todas, Activas, Inactivas, Expiradas
- **Búsqueda**: Por nombre o descripción

#### Crear/Editar Recompensa
**Información Básica**:
- Nombre
- Descripción
- Costo en tokens
- Stock disponible
- Categoría (merchandise, discount, service, etc.)

**Configuración**:
- Disponible para canje (activa/inactiva)
- Imagen URL (opcional)
- Términos y condiciones (opcional)
- Fecha de inicio (opcional)
- Fecha de fin (opcional)

#### Acciones
- Crear nueva recompensa
- Editar recompensa existente
- Activar/Desactivar disponibilidad
- Eliminar recompensa

### Información Mostrada
- Nombre de la recompensa
- Descripción
- Costo en tokens
- Stock disponible
- Categoría (badge)
- Estado (disponible/no disponible)
- Fecha de expiración (si aplica)
- Imagen (si tiene)

### Endpoints Backend
```
GET /api/rewards
GET /api/rewards/stats
POST /api/rewards
PATCH /api/rewards/:id
DELETE /api/rewards/:id
```

---

## 🎯 10. Desafíos Diarios (`/daily-challenges`)

### Funcionalidad
Gestión de desafíos diarios y rotación automática

### Características Principales

#### Configuración de Rotación Automática
- **Activar/Desactivar**: Toggle para habilitar rotación automática
- **Hora de Rotación**: Configurar hora diaria (formato HH:MM)
- **Ejecutar Rotación Manual**: Botón para forzar rotación inmediata

#### Crear Desafío Manual
- **Fecha**: Fecha del desafío
- **Título**: Nombre del desafío
- **Tipo**: MINUTES, EXERCISES, FREQUENCY
- **Valor Objetivo**: Meta a alcanzar
- **Recompensa en Tokens**: Tokens a otorgar al completar
- **Dificultad**: EASY, MEDIUM, HARD

#### Crear Plantilla de Desafío
- **Título**: Nombre de la plantilla
- **Tipo**: MINUTES, EXERCISES, FREQUENCY
- **Valor Objetivo**: Meta a alcanzar
- **Recompensa en Tokens**: Tokens a otorgar
- **Peso de Rotación**: Probabilidad de ser seleccionada (1-10)
- **Dificultad**: BEGINNER, INTERMEDIATE, ADVANCED

#### Gestión de Desafíos Programados
**Filtros**:
- Incluir inactivos

**Información Mostrada**:
- Fecha del desafío
- Título
- Tipo
- Valor objetivo
- Recompensa
- Dificultad
- Estado (activo/inactivo)
- Plantilla origen (si aplica)

**Acciones**:
- Activar/Desactivar desafío
- Eliminar desafío

#### Gestión de Plantillas
**Información Mostrada**:
- Título
- Tipo
- Valor objetivo
- Recompensa
- Peso de rotación
- Dificultad
- Estado (activo/inactivo)

**Acciones**:
- Activar/Desactivar plantilla
- Eliminar plantilla

### Tipos de Desafíos
- **MINUTES**: Entrenar X minutos
- **EXERCISES**: Completar X ejercicios
- **FREQUENCY**: Asistir X veces al gimnasio

### Endpoints Backend
```
GET /api/daily-challenges?include_inactive=true
POST /api/daily-challenges
PATCH /api/daily-challenges/:id
DELETE /api/daily-challenges/:id

GET /api/daily-challenge-templates
POST /api/daily-challenge-templates
PATCH /api/daily-challenge-templates/:id
DELETE /api/daily-challenge-templates/:id

GET /api/daily-challenge-config
PATCH /api/daily-challenge-config
POST /api/daily-challenges/run-rotation
```

---

## 🏆 11. Logros (`/achievements`)

### Funcionalidad
Catálogo de logros (achievements) del sistema

### Características Principales

#### Filtros
- **Categoría**: ONBOARDING, STREAK, FREQUENCY, ATTENDANCE, ROUTINE, CHALLENGE, PROGRESS, TOKEN, SOCIAL
- **Incluir Inactivos**: Toggle para mostrar/ocultar logros inactivos
- **Búsqueda**: Por nombre, código o descripción

#### Estadísticas
- Logros activos
- Logros inactivos

#### Crear/Editar Logro
**Información Básica**:
- **Código**: Identificador único (ej: `FIRST_CHECKIN`)
- **Nombre**: Nombre del logro
- **Descripción**: Descripción detallada
- **Categoría**: Tipo de logro

**Configuración**:
- **Icono**: Emoji o código de icono
- **Recompensa en Tokens**: Tokens otorgados al desbloquear
- **Condición**: Criterio para desbloquear (JSON)
- **Activo**: Si está disponible para los usuarios

#### Acciones
- Crear nuevo logro
- Editar logro existente
- Eliminar logro (elimina también el progreso asociado)

### Información Mostrada
- Código del logro
- Nombre
- Descripción
- Categoría (badge)
- Recompensa en tokens
- Icono
- Estado (activo/inactivo)

### Categorías de Logros
- **ONBOARDING**: Logros de bienvenida
- **STREAK**: Rachas de asistencia
- **FREQUENCY**: Frecuencia de entrenamiento
- **ATTENDANCE**: Asistencia al gimnasio
- **ROUTINE**: Completar rutinas
- **CHALLENGE**: Completar desafíos
- **PROGRESS**: Progreso físico
- **TOKEN**: Acumulación de tokens
- **SOCIAL**: Interacciones sociales

### Endpoints Backend
```
GET /api/achievements?category=...&includeInactive=true
POST /api/achievements
PATCH /api/achievements/:id
DELETE /api/achievements/:id
```

---

## 🔒 Protección de Rutas

Todas las rutas excepto `/login` están protegidas por el componente `ProtectedRoute`:

```typescript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

### Flujo de Autenticación
1. Usuario accede a cualquier ruta protegida
2. Se verifica si existe `admin_token` en `localStorage`
3. Si no existe → Redirect a `/login`
4. Si existe → Renderiza la página solicitada

---

## 🎨 Componentes Comunes

### UI Components
- **Card**: Contenedor con estilo
- **Button**: Botones con variantes (primary, secondary, danger, success)
- **Input**: Campos de texto
- **Select**: Selectores
- **Modal**: Ventanas modales
- **Table**: Tablas con paginación
- **Badge**: Etiquetas de estado
- **Loading**: Indicadores de carga
- **Alert**: Alertas y notificaciones

### Layout Components
- **Layout**: Estructura principal con navbar
- **Navbar**: Barra de navegación superior

---

## 📊 Estado Global

### React Query
Todas las peticiones HTTP usan `@tanstack/react-query` para:
- ✅ Caché automático
- ✅ Revalidación en foco
- ✅ Retry automático
- ✅ Estados de loading/error
- ✅ Optimistic updates

### Theme Provider
- Soporte para modo oscuro/claro
- Persistencia en `localStorage`

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linter
npm run lint
```

---

## 📝 Notas Importantes

### Paginación
- Usuarios: 20 por página
- Transacciones: 50 por página
- Otras entidades: Sin paginación (carga completa)

### Validaciones
- Todos los formularios tienen validación en frontend
- OpenAPI valida en backend
- Mensajes de error claros y específicos

### Permisos
- Actualmente no hay roles diferenciados en el admin
- Todos los administradores tienen acceso completo
- Se puede implementar RBAC en el futuro

### Performance
- Lazy loading de componentes
- Optimistic updates en mutaciones
- Debounce en búsquedas
- Virtualización en listas largas (pendiente)

---

## 🔮 Mejoras Futuras Sugeridas

1. **Dashboard**:
   - Gráficos de tendencias
   - Métricas en tiempo real
   - Exportar reportes

2. **Usuarios**:
   - Edición de perfil completo
   - Historial de actividad por usuario
   - Suspensión temporal

3. **Gimnasios**:
   - Galería de fotos múltiples
   - Mapa interactivo
   - Estadísticas de asistencia

4. **General**:
   - Sistema de roles y permisos
   - Logs de auditoría
   - Notificaciones push a usuarios
   - Exportar datos a CSV/Excel
   - Dark mode persistente por usuario

---

**Última actualización**: 2025-10-25  
**Versión**: 1.0.0  
**Mantenido por**: Equipo GymPoint

