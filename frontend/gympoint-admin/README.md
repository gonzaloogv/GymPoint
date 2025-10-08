# GymPoint Admin Panel

Panel de administración web para GymPoint, construido con React + Vite.

## 🏗️ Arquitectura

Este proyecto sigue una **Clean Architecture de 3 capas**:

### 📦 Capas

```
src/
├── domain/              # Capa de Dominio
│   ├── entities/       # Entidades del negocio
│   └── repositories/   # Interfaces de repositorios
│
├── data/               # Capa de Datos
│   ├── api/           # Cliente HTTP (axios)
│   ├── dto/           # Data Transfer Objects
│   ├── mappers/       # Mappers DTO → Domain
│   └── repositories/  # Implementaciones de repositorios
│
└── presentation/       # Capa de Presentación
    ├── components/    # Componentes React
    ├── pages/        # Páginas/Vistas
    └── hooks/        # Custom Hooks

```

## 🚀 Características

### Dashboard
- Estadísticas generales del sistema
- Total de usuarios, admins, tokens en circulación
- Distribución por suscripciones
- Actividad reciente

### Gestión de Usuarios
- Listado paginado de usuarios
- Búsqueda y filtros
- Activar/Desactivar cuentas
- Otorgar tokens
- Cambiar suscripción (FREE/PREMIUM)

### Transacciones
- Historial de transacciones de tokens
- Filtrado por usuario
- Detalles de cada transacción

### Estadísticas de Recompensas
- Estadísticas globales de recompensas
- Filtrado por rango de fechas
- Estadísticas por gimnasio

## 🛠️ Tecnologías

- **React** - UI Framework
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query (React Query)** - Data fetching & caching
- **Axios** - HTTP client

## 📝 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Desarrollo (puerto 3001)
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 🔌 API Backend

El panel se conecta al backend en `http://localhost:3000/api`

### Endpoints utilizados:

#### Admin Stats
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/admin/activity?days=7` - Actividad reciente

#### Users Management
- `GET /api/admin/users` - Listar usuarios (paginado)
- `GET /api/admin/users/search?email=` - Buscar por email
- `POST /api/admin/users/:id/deactivate` - Desactivar usuario
- `POST /api/admin/users/:id/activate` - Activar usuario
- `POST /api/admin/users/:id/tokens` - Otorgar tokens
- `PUT /api/admin/users/:id/subscription` - Actualizar suscripción

#### Transactions
- `GET /api/admin/transactions` - Historial de transacciones

#### Rewards
- `GET /api/admin/rewards/stats?from=&to=` - Stats globales
- `GET /api/admin/gyms/:gymId/rewards/summary?from=&to=` - Stats por gym

## 🔐 Autenticación

El panel utiliza JWT tokens almacenados en `localStorage`:
- Key: `admin_token`
- Header: `Authorization: Bearer <token>`

## 🎨 Estilos

Los estilos están centralizados en `App.css` con un tema oscuro:
- Color principal: `#646cff`
- Background: `#0a0a0a` / `#1a1a1a`
- Bordes: `#333`

## 🔄 Próximas Mejoras

- [ ] Implementar autenticación real con el backend
- [ ] Agregar más filtros y opciones de búsqueda
- [ ] Implementar edición de perfil de admin
- [ ] Agregar gráficos y visualizaciones
- [ ] Exportar datos a CSV/Excel
- [ ] Notificaciones en tiempo real
- [ ] Dark/Light mode toggle
