# 📊 Estado de Migración de Foreign Keys

**Fecha:** 2025-10-04  
**Estado:** ⚠️ **PARCIAL** - Algunas tablas ya migradas

---

## 📋 Resumen

De las **11 tablas** identificadas con FKs a `user`:

| Estado | Cantidad | Tablas |
|--------|----------|--------|
| ✅ **Ya migradas** | 2 | `assistance`, `claimed_reward` |
| ⏳ **Pendientes** | 9 | Ver lista abajo |

---

## ✅ Tablas Ya Migradas

### 1. `assistance`
- ✅ FK actual: `fk_assistance_user_profile` → `user_profiles.id_user_profile`
- ✅ Columna: `id_user`
- ✅ Estado: **CORRECTA**

### 2. `claimed_reward`
- ⚠️ Sin FK a `user` ni `user_profiles`
- ⚠️ Tiene columna `id_user_new` (de intento previo)
- ⚠️ **NECESITA LIMPIEZA Y RE-MIGRACIÓN**

---

## ⏳ Tablas Pendientes de Migración

### Lista de Tablas (9 totales)

| # | Tabla | Columna | FK Actual | Estado |
|---|-------|---------|-----------|--------|
| 1 | `frequency` | `id_user` | `frequency_ibfk_1` | ⏳ Pendiente |
| 2 | `gym_payment` | `id_user` | `gym_payment_ibfk_1` | ⏳ Pendiente |
| 3 | `progress` | `id_user` | `progress_ibfk_1` | ⏳ Pendiente |
| 4 | `refresh_token` | `id_user` | `refresh_token_ibfk_1` | ⏳ Pendiente |
| 5 | `routine` | `created_by` | `fk_routine_creator` | ⏳ Pendiente |
| 6 | `streak` | `id_user` | `streak_ibfk_1` | ⏳ Pendiente |
| 7 | `transaction` | `id_user` | `fk_transaction_user` | ⏳ Pendiente |
| 8 | `user_gym` | `id_user` | `user_gym_ibfk_1` | ⏳ Pendiente |
| 9 | `user_routine` | `id_user` | `user_routine_ibfk_1` | ⏳ Pendiente |

---

## 🔧 Próximos Pasos

### Opción 1: Migración Automática (Recomendado)

Ejecutar la migración `20251006-redirect-fks-to-user-profiles.js` después de:

1. Limpiar `claimed_reward`:
```sql
-- Eliminar columna temporal
ALTER TABLE claimed_reward DROP COLUMN id_user_new;

-- Agregar FK correcta
ALTER TABLE claimed_reward 
ADD CONSTRAINT fk_claimed_reward_user_profile 
FOREIGN KEY (id_user) 
REFERENCES user_profiles(id_user_profile) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

2. Actualizar la migración para excluir tablas ya migradas

### Opción 2: Manual (Tabla por Tabla)

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

