# 🗺️ Roadmap - Arquitectura v2.0

**Fecha:** 2025-10-04  
**Estado Actual:** ✅ Fase 3 Completada  
**Próximo:** Fase 4 en progreso

---

## ✅ Completado

### **Fase 0: Infra** ✅
- ✅ Umzug en boot
- ✅ `/health` y `/ready` endpoints
- ✅ Logging con `requestId`
- ✅ Manejo de errores centralizado

### **Fase 1: Base de Datos** ✅
- ✅ Diseño de arquitectura v2.0
- ✅ Tablas: `accounts`, `roles`, `account_roles`, `user_profiles`, `admin_profiles`
- ✅ Migración de datos (12 usuarios)
- ✅ Redirección de FKs (4 tablas)
- ✅ Scripts de administración
- ✅ Documentación completa

### **Fase 2: Modelos Sequelize** ✅
- ✅ 5 modelos nuevos (`Account`, `Role`, `AccountRole`, `UserProfile`, `AdminProfile`)
- ✅ `models/index.js` con asociaciones
- ✅ `auth-service.js` refactorizado
- ✅ Documentación de modelos

### **Fase 3: Integración Auth** ✅
- ✅ Middlewares actualizados (`verificarToken`, `verificarAdmin`, etc.)
- ✅ `auth-controller.js` actualizado
- ✅ Retrocompatibilidad garantizada
- ✅ Servidor funcionando
- ✅ Documentación de integración

---

## 🔄 En Progreso

### **Fase 4: Controllers de Dominio**

#### 4.1. User Controller
- [ ] Actualizar `user-controller.js` para usar `UserProfile`
- [ ] Endpoint `/api/users/me` (perfil actual)
- [ ] Endpoint `PUT /api/users/me` (actualizar perfil)
- [ ] Endpoint `DELETE /api/users/me` (eliminar cuenta)
- [ ] Endpoint `GET /api/users/:id` (solo admin)

#### 4.2. Admin Controller (Nuevo)
- [ ] Crear `admin-controller.js`
- [ ] Endpoint `GET /api/admin/users` (listar usuarios)
- [ ] Endpoint `GET /api/admin/stats` (estadísticas)
- [ ] Endpoint `POST /api/admin/tokens/grant` (otorgar tokens)
- [ ] Endpoint `POST /api/admin/tokens/revoke` (revocar tokens)
- [ ] Endpoint `PUT /api/admin/users/:id/subscription` (cambiar plan)

#### 4.3. Controllers de Dominio
- [ ] `assistance-controller.js` → usar `id_user_profile`
- [ ] `progress-controller.js` → usar `id_user_profile`
- [ ] `routine-controller.js` → usar `id_user_profile`
- [ ] `reward-controller.js` → usar `id_user_profile`
- [ ] `transaction-controller.js` → usar `id_user_profile`
- [ ] `frequency-controller.js` → usar `id_user_profile`

---

## ⏳ Pendiente

### **Fase 5: Services de Dominio**
- [ ] `user-service.js` → usar `UserProfile`
- [ ] `assistance-service.js` → usar `UserProfile`
- [ ] `progress-service.js` → usar `UserProfile`
- [ ] `routine-service.js` → usar `UserProfile`
- [ ] `reward-service.js` → usar `UserProfile`
- [ ] `transaction-service.js` → usar `UserProfile`
- [ ] `frequency-service.js` → usar `UserProfile`
- [ ] Crear `admin-service.js`

### **Fase 6: Tests**
- [ ] Tests unitarios para nuevos modelos
- [ ] Tests para `auth-service.js`
- [ ] Tests para middlewares nuevos
- [ ] Tests para `auth-controller.js`
- [ ] Tests de integración end-to-end
- [ ] Cobertura ≥80% en services

### **Fase 7: OpenAPI/Swagger**
- [ ] Actualizar definiciones de schemas
- [ ] Actualizar endpoints de auth
- [ ] Agregar schemas para `Account`, `UserProfile`, `AdminProfile`
- [ ] Documentar nuevos middlewares
- [ ] Actualizar ejemplos de responses

### **Fase 8: Cleanup**
- [ ] Eliminar `auth-legacy.js`
- [ ] Eliminar `auth-service-legacy.js`
- [ ] Deprecar modelo `User.js`
- [ ] Eliminar referencias a `User` en código
- [ ] Limpiar migraciones obsoletas

### **Fase 9: Validación Final**
- [ ] Tests e2e completos
- [ ] Performance testing
- [ ] Security audit
- [ ] Code review
- [ ] Merge a `main`

---

## 🎯 Prioridades

### Alta Prioridad
1. **Fase 4:** Controllers de dominio (critical path)
2. **Fase 5:** Services de dominio (refactoring)
3. **Fase 6:** Tests (quality assurance)

### Media Prioridad
4. **Fase 7:** OpenAPI (documentation)
5. **Fase 8:** Cleanup (code quality)

### Baja Prioridad
6. **Fase 9:** Validación final (pre-merge)

---

## 📊 Estimaciones

| Fase | Esfuerzo | Estado |
|------|----------|--------|
| Fase 0 | 2h | ✅ Completada |
| Fase 1 | 6h | ✅ Completada |
| Fase 2 | 4h | ✅ Completada |
| Fase 3 | 3h | ✅ Completada |
| **Fase 4** | **5h** | 🔄 En progreso |
| Fase 5 | 4h | ⏳ Pendiente |
| Fase 6 | 6h | ⏳ Pendiente |
| Fase 7 | 2h | ⏳ Pendiente |
| Fase 8 | 1h | ⏳ Pendiente |
| Fase 9 | 3h | ⏳ Pendiente |
| **TOTAL** | **36h** | **42% completado** |

---

## 🚧 Bloqueadores

### Actuales
- Ninguno

### Potenciales
- Tests pueden revelar issues no anticipados
- Performance de queries con nuevas relaciones
- Compatibilidad con frontend (contratos)

---

## 📝 Notas Importantes

### Decisiones de Diseño

1. **Retrocompatibilidad:**
   - Mantener `req.user` con estructura antigua
   - No eliminar `User.js` hasta migrar todos los controllers
   - Legacy files como respaldo

2. **Separación Admin/User:**
   - Admin NO tiene refresh tokens
   - Admin NO puede usar endpoints de usuario
   - Verificación de perfil en cada request

3. **RBAC:**
   - Roles en catálogo extensible
   - Multiple roles por account posible
   - Permisos granulares vía middlewares

### Aprendizajes

1. **Sequelize Associations:**
   - Definir todas en `models/index.js`
   - Importar siempre desde index, no directamente
   - Usar aliases claros (`userProfile`, `adminProfile`)

2. **Migraciones:**
   - Siempre usar transacciones
   - Verificar existencia antes de crear/eliminar
   - Logs detallados para debugging

3. **JWT:**
   - Incluir roles como array
   - Incluir IDs de perfiles
   - Refresh tokens solo para usuarios

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor
npm run dev

# Ejecutar migraciones
node migrate.js

# Crear admin
node create-admin-script.js admin@example.com Pass123 Admin User IT

# Tests
npm test

# Cobertura
npm run test:coverage
```

### Verificación

```bash
# Health check
curl http://localhost:3000/health

# Ready check
curl http://localhost:3000/ready

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Base de Datos

```sql
-- Ver accounts y perfiles
SELECT a.email, r.role_name, 
       up.name as user_name, up.subscription,
       ap.name as admin_name, ap.department
FROM accounts a
LEFT JOIN account_roles ar ON a.id_account = ar.id_account
LEFT JOIN roles r ON ar.id_role = r.id_role
LEFT JOIN user_profiles up ON a.id_account = up.id_account
LEFT JOIN admin_profiles ap ON a.id_account = ap.id_account;

-- Verificar FKs
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IN ('user', 'user_profiles')
  AND TABLE_SCHEMA = DATABASE();
```

---

## 📚 Referencias

- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Arquitectura de BD
- [MODELS_IMPLEMENTATION.md](./MODELS_IMPLEMENTATION.md) - Modelos Sequelize
- [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - Integración de auth
- [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) - Resumen completo

---

**Última actualización:** 2025-10-04  
**Versión:** 2.0  
**Progreso:** 42% (15h / 36h estimadas)
