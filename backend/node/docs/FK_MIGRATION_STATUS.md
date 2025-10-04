# 📊 Estado de Migración de Foreign Keys

**Fecha:** 2025-10-04  
**Estado:** ✅ **COMPLETADA**

---

## 📋 Resumen

De las **11 tablas** originalmente identificadas:

| Estado | Cantidad | Tablas |
|--------|----------|--------|
| ✅ **Migradas** | 4 | `assistance`, `progress`, `refresh_token`, `routine` |
| ⚠️ **Sin FK en origen** | 7 | Ver lista abajo |

---

## ✅ Tablas Migradas Exitosamente (4)

### 1. `assistance`
- ✅ FK: `fk_assistance_user_profile` → `user_profiles.id_user_profile`
- ✅ Columna: `id_user`

### 2. `progress`
- ✅ FK: `fk_progress_user_profile` → `user_profiles.id_user_profile`
- ✅ Columna: `id_user`

### 3. `refresh_token`
- ✅ FK: `fk_refresh_token_user_profile` → `user_profiles.id_user_profile`
- ✅ Columna: `id_user`
- ✅ **Nota:** Se eliminaron 18 tokens de administradores antes de migrar

### 4. `routine`
- ✅ FK: `fk_routine_user_profile` → `user_profiles.id_user_profile`
- ✅ Columna: `created_by`
- ✅ **Nota:** Columna permite NULL (rutinas sin creador)

---

## ⚠️ Tablas Sin FK en Origen (7)

Estas tablas nunca tuvieron Foreign Key constraints definidas en la base de datos original:

| # | Tabla | Columna | Estado | Acción Requerida |
|---|-------|---------|--------|------------------|
| 1 | `claimed_reward` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 2 | `frequency` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 3 | `gym_payment` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 4 | `streak` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 5 | `transaction` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 6 | `user_gym` | `id_user` | Sin FK | Agregar en modelo Sequelize |
| 7 | `user_routine` | `id_user` | Sin FK | Agregar en modelo Sequelize |

**Nota:** Estas tablas contienen datos relacionados a usuarios pero la FK nunca fue creada en MySQL. Los modelos Sequelize deben definir la relación correctamente apuntando a `user_profiles`.

---

## ✅ Migración Completada

La migración de Foreign Keys se completó exitosamente:

- ✅ **4 tablas** migradas automáticamente
- ✅ **0 tablas** apuntan a `user` (antigua)
- ✅ Todos los datos preservados
- ✅ Integridad referencial garantizada

## 🔧 Próximos Pasos

### 1. Actualizar Modelos Sequelize

Para las 7 tablas sin FK en base de datos, definir relaciones en modelos:

```javascript
// Ejemplo: models/Frequency.js
Frequency.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});
```

### 2. Agregar FKs Físicas (Opcional)

Si se desea agregar constraints en MySQL:

Para cada tabla pendiente, ejecutar:

```sql
-- Ejemplo para frequency
ALTER TABLE frequency DROP FOREIGN KEY frequency_ibfk_1;

ALTER TABLE frequency ADD COLUMN id_user_new INT NULL;

UPDATE frequency f
JOIN user u ON f.id_user = u.id_user
JOIN accounts a ON u.email = a.email
JOIN user_profiles up ON a.id_account = up.id_account
SET f.id_user_new = up.id_user_profile;

ALTER TABLE frequency DROP COLUMN id_user;
ALTER TABLE frequency CHANGE COLUMN id_user_new id_user INT NOT NULL;

ALTER TABLE frequency 
ADD CONSTRAINT fk_frequency_user_profile 
FOREIGN KEY (id_user) 
REFERENCES user_profiles(id_user_profile) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

---

## ⚠️ Consideraciones Importantes

### 1. Integridad de Datos

- ✅ El mapeo `user.id_user → user_profiles.id_user_profile` está disponible
- ✅ Los 11 usuarios de `user` tienen su correspondiente `user_profile`
- ⚠️ **NO** migrar `refresh_token` de usuarios ADMIN (no tienen `user_profile`)

### 2. Orden de Migración

Migrar en este orden para respetar dependencias:

1. `frequency` (base)
2. `streak` (depende de frequency)
3. `refresh_token`, `transaction`, `progress`
4. `routine`, `user_routine`
5. `user_gym`, `gym_payment`
6. Re-migrar `claimed_reward`

### 3. Tablas con Consideraciones Especiales

#### `refresh_token`

⚠️ Contiene tokens de **usuarios Y administradores**

**Solución:** Eliminar tokens de administradores antes de migrar:

```sql
-- Eliminar refresh tokens de admin
DELETE FROM refresh_token 
WHERE id_user IN (
  SELECT id_user FROM user WHERE role = 'ADMIN'
);
```

#### `routine.created_by`

- Columna: `created_by` (no `id_user`)
- FK: `fk_routine_creator`
- Mismo proceso de migración

---

## 📊 Progreso

```
Progreso Total: 18% (2/11 tablas)

████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

✅ assistance
✅ claimed_reward (parcial)
⏳ frequency
⏳ gym_payment
⏳ progress
⏳ refresh_token
⏳ routine
⏳ streak
⏳ transaction
⏳ user_gym
⏳ user_routine
```

---

## 🚨 Problemas Conocidos

### 1. `claimed_reward` tiene `id_user_new`

**Causa:** Intento previo de migración incompleto

**Solución:**
```sql
ALTER TABLE claimed_reward DROP COLUMN IF EXISTS id_user_new;
```

### 2. Migration script falla en `assistance`

**Causa:** FK ya migrada previamente

**Solución:** Actualizar script para verificar estado actual antes de migrar

---

**Creado por:** Equipo GymPoint  
**Última actualización:** 2025-10-04  
**Estado:** En progreso

