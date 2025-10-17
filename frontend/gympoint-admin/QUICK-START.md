# 🚀 Quick Start - GymPoint Admin

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Backend (Docker)
```bash
cd backend
docker-compose up
```

✅ Backend corriendo en: http://localhost:3000

---

### 2️⃣ Frontend Admin
```bash
cd frontend/gympoint-admin
npm install
npm run dev
```

✅ Admin panel en: http://localhost:5173

---

### 3️⃣ Login
- **Usuario**: Usa credenciales de administrador
- **Accede al panel**: http://localhost:5173

---

## 🎯 Módulos Disponibles

### 🏋️ Gimnasios
**Ruta**: `/gyms`

**Funcionalidades**:
- ➕ Crear gimnasio
- ✏️ Editar gimnasio
- 🗑️ Eliminar gimnasio
- 🔍 Buscar y filtrar
- 📅 Gestionar horarios
- 🗺️ Pegar URL de Google Maps para autocompletar

**Ejemplo de Google Maps URL**:
```
https://www.google.com/maps/place/Gimnasio+Ejemplo/@-27.4511,-58.9867,17z
```

---

### 📅 Horarios
**Acceso**: Click en "📅 Horarios" en cualquier gimnasio

**Funcionalidades**:
- Configurar horarios para cada día
- Marcar días como cerrados
- Editar inline

---

### 🎁 Recompensas
**Ruta**: `/rewards`

**Funcionalidades**:
- ➕ Crear recompensa
- ✏️ Editar recompensa
- 🗑️ Eliminar recompensa
- 🔍 Filtrar por estado
- 📊 Ver estadísticas de canjes

**Tipos de recompensas**:
- Descuento
- Pase gratis
- Producto
- Servicio
- Merchandising
- Otro

---

## 📚 Documentación Completa

### Guías por Módulo
- **Gimnasios**: `ACTUALIZACION-GYMS.md`
- **Google Maps**: `GOOGLE-MAPS-EXTRACTION.md`
- **Horarios**: `GYM-SCHEDULES-IMPLEMENTATION.md`
- **Recompensas**: `REWARDS-IMPLEMENTATION.md`

### Documentación Técnica
- **TypeScript**: `TYPESCRIPT-CONFIG.md`
- **Resumen completo**: `ADMIN-FEATURES-SUMMARY.md`
- **Changelog**: `CHANGELOG.md`

---

## 🧪 Testing Rápido

### Gimnasios
1. Click en "➕ Nuevo Gimnasio"
2. Completa el formulario
3. (Opcional) Pega una URL de Google Maps
4. Click en "💾 Guardar"
5. ✅ Gimnasio creado!

### Horarios
1. En un gimnasio, click en "📅 Horarios"
2. Click en "✏️ Editar" en un día
3. Configura horario de apertura y cierre
4. Click en "💾 Guardar"
5. ✅ Horario configurado!

### Recompensas
1. Click en "➕ Nueva Recompensa"
2. Completa el formulario
3. Selecciona fechas y stock
4. Click en "✨ Crear Recompensa"
5. ✅ Recompensa creada!

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar containers
cd backend
docker-compose down
docker-compose up
```

### Frontend no inicia
```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Verificar puerto 5173 esté libre
npm run dev
```

### Error de autenticación
- Verifica que el backend esté corriendo
- Revisa las credenciales de admin
- Verifica el token JWT

---

## ⚙️ Scripts Disponibles

### Frontend
```bash
npm run dev          # Modo desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run type-check   # Verificar tipos TypeScript
```

### Backend
```bash
docker-compose up           # Iniciar servicios
docker-compose down         # Detener servicios
docker-compose logs -f      # Ver logs
```

---

## 📊 Endpoints Principales

### Gimnasios
- `GET /api/gyms` - Listar
- `POST /api/gyms` - Crear
- `PUT /api/gyms/:id` - Actualizar
- `DELETE /api/gyms/:id` - Eliminar

### Horarios
- `GET /api/schedules/:id_gym` - Listar
- `POST /api/schedules` - Crear
- `PUT /api/schedules/:id` - Actualizar

### Recompensas
- `GET /api/rewards/admin/all` - Listar (admin)
- `POST /api/rewards` - Crear
- `PUT /api/rewards/:id` - Actualizar
- `DELETE /api/rewards/:id` - Eliminar
- `GET /api/rewards/stats` - Estadísticas

---

## 🎯 Próximos Módulos

### Pendientes de Implementar
- [ ] 🏆 Rutinas
- [ ] 🔥 Streaks
- [ ] 🎯 Challenges
- [ ] ⭐ Reviews
- [ ] 💳 Payments
- [ ] 🎟️ Reward Codes

### Endpoints Backend Disponibles
- Todos los endpoints necesarios ya están implementados
- Solo falta crear los componentes frontend

---

## 💡 Tips

### Gimnasios
💡 **Tip**: Pega una URL de Google Maps en el campo correspondiente y automáticamente se extraerán las coordenadas y el nombre del lugar.

### Horarios
💡 **Tip**: Si un día está cerrado, marca el checkbox "Cerrado" y los campos de hora se deshabilitarán automáticamente.

### Recompensas
💡 **Tip**: Usa los filtros para encontrar recompensas por estado (Activa, Expirada, etc.) rápidamente.

---

## 🔒 Seguridad

### Autenticación
- Todas las rutas admin requieren token JWT
- Middleware de verificación de rol ADMIN
- Sesión expira después de X tiempo

### Validaciones
- Frontend: Validación en formularios
- Backend: Validación de datos
- Sanitización de inputs

---

## 📱 Responsive

✅ El panel admin es completamente responsive:
- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (<768px)

Pruébalo redimensionando la ventana del navegador!

---

## ✨ Características Destacadas

### 🗺️ Google Maps Integration
La feature más cool: extracción automática de datos desde URLs de Google Maps.

### 🎨 UI Moderna
Diseño limpio, profesional y fácil de usar.

### 🚀 Performance
Caché inteligente con React Query para velocidad óptima.

---

## 📞 ¿Necesitas Ayuda?

### Documentación
Lee las guías completas en los archivos `.md` del directorio.

### Código
Todos los componentes están documentados con comentarios.

### Backend
Revisa los controladores y servicios para entender la lógica.

---

## 🎉 ¡Listo!

Ya tienes todo lo necesario para empezar a usar GymPoint Admin.

**¿Dudas?** Revisa la documentación completa en:
- `README-ADMIN-COMPLETE.md` - Resumen ejecutivo
- `ADMIN-FEATURES-SUMMARY.md` - Todas las funcionalidades

**¡Happy coding!** 🚀




