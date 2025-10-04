# 📚 Documentación GymPoint Backend

Bienvenido a la documentación del backend de GymPoint.

---

## 📖 Documentación Disponible

### 🧪 Testing

| Archivo | Descripción |
|---------|-------------|
| **[POSTMAN_QUICK_START.md](./POSTMAN_QUICK_START.md)** | ⚡ Inicio rápido para testing con Postman (3 pasos) |
| **[POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)** | 📮 Guía completa con todos los endpoints y ejemplos |
| **[GymPoint-Postman-Collection.json](./GymPoint-Postman-Collection.json)** | 📦 Colección de Postman lista para importar |
| **[GymPoint-Postman-Environment.json](./GymPoint-Postman-Environment.json)** | 🌍 Entorno de Postman con variables configuradas |

### 🏗️ Arquitectura y Diseño

| Archivo | Descripción |
|---------|-------------|
| **[ARQUITECTURA_ACTUAL.md](../../../ARQUITECTURA_ACTUAL.md)** | 🏛️ Análisis completo de la arquitectura del sistema |
| **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** | 🗄️ Arquitectura de base de datos v2.0 (Accounts + Profiles) |
| **[database-schema-v2.sql](./database-schema-v2.sql)** | 📊 Esquema SQL de las nuevas tablas |
| **[DATA_MIGRATION.md](./DATA_MIGRATION.md)** | 🔄 Migración de datos completada (12 usuarios migrados) |
| **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** | 📝 Resumen ejecutivo de la implementación |

### 🔐 Autenticación y Administración

| Archivo | Descripción |
|---------|-------------|
| **[CREATE_ADMIN.md](./CREATE_ADMIN.md)** | 👨‍💼 Guía para crear administradores del sistema |
| **[utils/auth-providers/README.md](../utils/auth-providers/README.md)** | 🔑 Documentación de proveedores de autenticación (Google OAuth) |

### 📝 Otros Documentos

| Archivo | Descripción |
|---------|-------------|
| **[../README.md](../README.md)** | 📄 README principal del backend |

---

## 🚀 Inicio Rápido

### 1. Testing con Postman (Recomendado)

```bash
# 1. Abrir Postman
# 2. Importar GymPoint-Postman-Collection.json
# 3. Importar GymPoint-Postman-Environment.json
# 4. Seleccionar entorno "GymPoint Local"
# 5. Ejecutar requests!
```

Ver: [POSTMAN_QUICK_START.md](./POSTMAN_QUICK_START.md)

---

### 2. Testing Manual con cURL

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@test.com",
    "password": "password123",
    "gender": "M",
    "locality": "Resistencia",
    "age": 25,
    "subscription": "FREE",
    "frequency_goal": 3
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "password123"
  }'
```

---

## 📂 Estructura de Documentación

```
docs/
├── README.md                          ← Estás aquí
├── POSTMAN_QUICK_START.md             ← Inicio rápido (3 pasos)
├── POSTMAN_TESTING_GUIDE.md           ← Guía completa de testing
├── GymPoint-Postman-Collection.json   ← Colección de Postman
└── GymPoint-Postman-Environment.json  ← Entorno de Postman
```

---

## 🔗 Enlaces Útiles

- **Swagger UI:** http://localhost:3000/api-docs (cuando el servidor está corriendo)
- **Health Check:** http://localhost:3000/health
- **Ready Check:** http://localhost:3000/ready

---

## 🆘 ¿Necesitas Ayuda?

1. **Para testing:** Ver [POSTMAN_QUICK_START.md](./POSTMAN_QUICK_START.md)
2. **Para entender la arquitectura:** Ver [ARQUITECTURA_ACTUAL.md](../../../ARQUITECTURA_ACTUAL.md)
3. **Para configurar Google OAuth:** Ver [utils/auth-providers/README.md](../utils/auth-providers/README.md)
4. **Para ver endpoints:** Abrir Swagger UI en http://localhost:3000/api-docs

---

## 📊 Categorías de Endpoints

| Categoría | Endpoints | Autenticación |
|-----------|-----------|---------------|
| 🏥 Health | `/health`, `/ready` | ❌ No requerida |
| 🔐 Auth | `/api/auth/*` | ❌ No requerida |
| 🏋️ Gimnasios | `/api/gyms/*` | ⚠️ Parcial |
| ✅ Asistencias | `/api/assistances/*` | ✅ Requerida |
| 🏃‍♂️ Rutinas | `/api/routines/*` | ✅ Requerida |
| 🎁 Recompensas | `/api/rewards/*` | ✅ Requerida |
| 💰 Tokens | `/api/tokens/*` | ✅ Requerida |
| 📊 Progreso | `/api/progress/*` | ✅ Requerida |
| 👤 Usuario | `/api/users/*` | ✅ Requerida |

---

## ✅ Checklist de Onboarding

Para nuevos desarrolladores:

- [ ] Leer [README.md](../README.md) principal del backend
- [ ] Leer [ARQUITECTURA_ACTUAL.md](../../../ARQUITECTURA_ACTUAL.md)
- [ ] Importar colección de Postman
- [ ] Ejecutar el servidor (`npm run dev`)
- [ ] Abrir Swagger UI (http://localhost:3000/api-docs)
- [ ] Hacer un health check
- [ ] Registrar un usuario de prueba
- [ ] Hacer login y probar endpoints protegidos
- [ ] Entender el flujo de tokens y autenticación

---

## 🎯 Flujo de Usuario Típico

```
1. Registro/Login → Obtener tokens
2. Buscar gimnasios cercanos (GPS)
3. Asociarse a un gimnasio
4. Registrar asistencia → Ganar 5 tokens
5. Crear/Importar rutina (≥3 ejercicios)
6. Completar rutina → Ganar 10 tokens
7. Ver recompensas disponibles
8. Canjear tokens por recompensas
9. Ver progreso y estadísticas
```

Ver flujo detallado en: [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md#flujo-de-testing-completo)

---

**Última actualización:** Octubre 2025  
**Mantenido por:** Equipo GymPoint

