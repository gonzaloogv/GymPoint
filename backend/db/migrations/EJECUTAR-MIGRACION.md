# ⚡ Guía Visual: Ejecutar Migración cleanup-mvp-v1-CORRECTED.sql

## 🎯 Objetivo
Ejecutar la migración que sincroniza la base de datos con el código actualizado en FASES 1-4.

---

## ⏱️ Tiempo Total: 5 minutos

---

## 📋 Pre-requisitos

✅ **Código backend actualizado** (FASES 1-4 completadas)
✅ **MySQL corriendo** en tu máquina
✅ **Acceso root** a la base de datos
✅ **Backup reciente** (lo crearemos en paso 1)

---

## 🚨 IMPORTANTE: ¿Por qué esta migración?

### Antes de la migración:
```
gym                          gym_geofence (tabla separada)
├── id_gym                   ├── id_gym
├── name                     ├── auto_checkin_enabled
├── latitude                 ├── radius_meters
├── longitude                └── min_stay_minutes
└── ...

assistance                   user_profiles
├── hour (confuso)           ├── subscription
├── check_in_time            ├── app_tier (duplicado!)
└── ...                      └── ...
```

### Después de la migración:
```
gym (campos integrados)      ❌ gym_geofence (ELIMINADA)
├── id_gym
├── name
├── latitude
├── longitude
├── auto_checkin_enabled ✨
├── geofence_radius_meters ✨
├── min_stay_minutes ✨
└── ...

assistance                   user_profiles
├── hour (deprecated)        ├── subscription
├── check_in_time ✅         └── ... (app_tier eliminado)
└── ...
```

---

## 📝 Paso a Paso

### 🔹 PASO 1: Crear Backup (1 minuto)

```bash
# Navegar a carpeta de base de datos
cd c:\Users\gonza\OneDrive\Escritorio\project-GymPoint\backend\db

# Crear backup con timestamp
mysqldump -u root -p gympoint > backup_pre_cleanup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
```

**¿Qué esperar?**
```
Enter password: ****
(proceso silencioso de 5-10 segundos)
```

**Verificar backup creado:**
```bash
dir backup_*.sql
```

**Deberías ver algo como:**
```
backup_pre_cleanup_20251014_153045.sql    (tamaño: ~500KB - 2MB)
```

✅ **Checkpoint**: Archivo de backup existe y tiene tamaño > 100KB

---

### 🔹 PASO 2: Conectar a MySQL (10 segundos)

```bash
mysql -u root -p gympoint
```

**Prompt de contraseña:**
```
Enter password: ****
```

**Deberías ver:**
```
Welcome to the MySQL monitor...
mysql>
```

✅ **Checkpoint**: Prompt `mysql>` visible

---

### 🔹 PASO 3: Ejecutar Migración (2 minutos)

```sql
-- Dentro del prompt mysql>
source migrations/cleanup-mvp-v1-CORRECTED.sql
```

**Salida esperada (fragmento):**
```
Query OK, 0 rows affected (0.05 sec)
Query OK, 3 rows affected (0.12 sec)
...
+--------------------------------------------------------------------+
| VERIFICACIÓN 1: gym_geofence eliminada                             |
+--------------------------------------------------------------------+
| ✅ PASS: Tabla gym_geofence no existe                              |
+--------------------------------------------------------------------+

+--------------------------------------------------------------------+
| VERIFICACIÓN 2: gym tiene campos geofencing                        |
+--------------------------------------------------------------------+
| ✅ PASS: Columnas auto_checkin_enabled, geofence_radius_meters... |
+--------------------------------------------------------------------+

... (más verificaciones) ...

+--------------------------------------------------------------------+
| ✅✅✅ MIGRACIÓN COMPLETADA CON ÉXITO ✅✅✅                        |
+--------------------------------------------------------------------+
```

### ⚠️ ¿Qué hacer si ves errores?

#### Error común 1: "Table 'gym_geofence' doesn't exist"
```
ERROR 1051 (42S02): Unknown table 'gympoint.gym_geofence'
```

**Causa**: Ya ejecutaste esta migración antes o la tabla nunca existió.

**Solución**:
```sql
-- Verificar si gym ya tiene los campos
DESCRIBE gym;
-- Si ves auto_checkin_enabled, geofence_radius_meters, min_stay_minutes
-- la migración ya se ejecutó. Puedes continuar.
```

#### Error común 2: "Duplicate column name"
```
ERROR 1060 (42S21): Duplicate column name 'auto_checkin_enabled'
```

**Causa**: Columnas ya existen en gym.

**Solución**: Migración ya ejecutada. Verificar:
```sql
SHOW TABLES LIKE 'gym_geofence';
-- Empty set = migración exitosa anterior
```

#### Error común 3: Faltan verificaciones PASS
```
❌ VERIFICACIÓN 3: ... FAIL
```

**Acción**:
1. Leer mensaje de error específico
2. NO continuar con PASO 4
3. Consultar sección Troubleshooting en [README-MIGRATION-CLEANUP.md](README-MIGRATION-CLEANUP.md)
4. Considerar ROLLBACK (ver PASO 6)

---

### 🔹 PASO 4: Verificar Cambios (30 segundos)

```sql
-- VERIFICACIÓN 1: gym_geofence eliminada
SHOW TABLES LIKE 'gym_geofence';
-- Debe retornar: Empty set ✅

-- VERIFICACIÓN 2: gym tiene campos nuevos
DESCRIBE gym;
-- Debes ver estas líneas:
-- | auto_checkin_enabled      | tinyint(1) | NO   |     | 1       |
-- | geofence_radius_meters    | int        | NO   |     | 150     |
-- | min_stay_minutes          | int        | NO   |     | 30      |
```

```sql
-- VERIFICACIÓN 3: check_in_time es NOT NULL
DESCRIBE assistance;
-- Debe mostrar:
-- | check_in_time | time | NO   |     | NULL |
```

```sql
-- VERIFICACIÓN 4: app_tier eliminado
DESCRIBE user_profiles;
-- NO debe aparecer app_tier en la lista
-- subscription debe estar presente ✅
```

```sql
-- VERIFICACIÓN 5: user_device_tokens creada
SHOW TABLES LIKE 'user_device_tokens';
-- Debe retornar:
-- +--------------------------------------+
-- | Tables_in_gympoint (user_device_to...|
-- +--------------------------------------+
-- | user_device_tokens                   |
-- +--------------------------------------+
```

```sql
-- VERIFICACIÓN 6: Rutinas plantilla corregidas
SELECT routine_name, category, target_goal, equipment_level
FROM routine
WHERE is_template = TRUE;
-- Debe retornar 5 rutinas con TODOS los campos completos (no NULL)
```

✅ **Checkpoint**: Todas las verificaciones PASS

---

### 🔹 PASO 5: Salir de MySQL y Reiniciar Servidor (1 minuto)

```sql
-- Salir de MySQL
exit;
```

```bash
# Navegar a carpeta del servidor
cd ..\..\backend\node

# Reiniciar servidor (si está corriendo)
# OPCIÓN A: Si usas npm run dev
# Presionar Ctrl+C y luego:
npm run dev

# OPCIÓN B: Si usas PM2
pm2 restart gympoint-backend

# OPCIÓN C: Si usas nodemon (se reinicia automáticamente)
# No hacer nada, nodemon detecta cambios en BD
```

**Salida esperada (servidor iniciando):**
```
> node index.js

Server running on port 3000
Database connected successfully
✓ Models loaded: Gym, Assistance, UserProfile, ...
```

**⚠️ Buscar ERRORES en logs:**
```bash
# Buscar errores relacionados con modelos
# (abre otra terminal)
cd c:\Users\gonza\OneDrive\Escritorio\project-GymPoint\backend\node
tail -f logs/app.log | findstr /i "error gym assistance"
```

**Si ves errores como:**
```
Error: Unknown column 'hour' in 'order clause'
```

**Solución**: Revisar que FASE 2 se aplicó correctamente (check_in_time en ordenamiento).

✅ **Checkpoint**: Servidor corriendo sin errores de modelos

---

## ✅ Verificación Final (30 segundos)

### Test rápido de endpoints nuevos

```bash
# Test 1: Gimnasios con geofencing habilitado
curl http://localhost:3000/api/gyms/auto-checkin/enabled
```

**Respuesta esperada:**
```json
{
  "message": "Gimnasios con auto check-in habilitado obtenidos",
  "data": [
    {
      "id_gym": 1,
      "name": "PowerGym Centro",
      "auto_checkin_enabled": 1,
      "geofence_radius_meters": 150,
      "min_stay_minutes": 30
    }
  ]
}
```

```bash
# Test 2: Configuración de geofencing de un gym
curl http://localhost:3000/api/gyms/1/geofencing
```

**Respuesta esperada:**
```json
{
  "id_gym": 1,
  "name": "PowerGym Centro",
  "geofencing": {
    "enabled": true,
    "radius_meters": 150,
    "min_stay_minutes": 30
  },
  "location": {
    "latitude": -34.603722,
    "longitude": -58.381592
  }
}
```

✅ **Checkpoint**: Endpoints responden correctamente

---

## 🎉 Migración Exitosa

Si llegaste aquí sin errores:

```
✅ Base de datos migrada correctamente
✅ Tabla gym_geofence eliminada
✅ Campos de geofencing en gym
✅ check_in_time como campo principal
✅ app_tier eliminado
✅ user_device_tokens creada
✅ Rutinas plantilla corregidas
✅ 7 índices de performance agregados
✅ Servidor corriendo sin errores
✅ Endpoints funcionando
```

**🎯 Base de datos al 95% lista para MVP!**

---

## 🔄 PASO 6: Rollback (Solo si algo salió mal)

### Opción A: Rollback con script automático

```bash
cd c:\Users\gonza\OneDrive\Escritorio\project-GymPoint\backend\db\migrations
mysql -u root -p gympoint < ROLLBACK-cleanup-mvp-v1.sql
```

**¿Qué hace?**
- Recrea `gym_geofence` desde gym
- Restaura `app_tier` en user_profiles
- Revierte `check_in_time` a nullable
- Elimina índices agregados
- **NO** restaura datos eliminados (por eso necesitas backup)

### Opción B: Restaurar desde backup

```bash
cd c:\Users\gonza\OneDrive\Escritorio\project-GymPoint\backend\db

# Listar backups disponibles
dir backup_*.sql

# Restaurar el backup creado en PASO 1
mysql -u root -p gympoint < backup_pre_cleanup_YYYYMMDD_HHMMSS.sql
```

**⚠️ ADVERTENCIA**: Esto restaura TODA la base de datos al estado anterior. Perderás cualquier dato creado DESPUÉS del backup.

---

## 📊 Checklist de Migración

Usa este checklist para asegurarte de completar todos los pasos:

```
PRE-MIGRACIÓN
[ ] Navegué a backend/db
[ ] Creé backup con mysqldump
[ ] Verifiqué que archivo de backup existe y tiene tamaño > 100KB

MIGRACIÓN
[ ] Me conecté a MySQL: mysql -u root -p gympoint
[ ] Ejecuté: source migrations/cleanup-mvp-v1-CORRECTED.sql
[ ] Vi 8 verificaciones ✅ PASS
[ ] Vi mensaje "MIGRACIÓN COMPLETADA CON ÉXITO"

POST-MIGRACIÓN
[ ] Salí de MySQL: exit
[ ] Reinicié servidor Node.js
[ ] Verifiqué logs sin errores
[ ] Probé endpoint: GET /api/gyms/auto-checkin/enabled
[ ] Probé endpoint: GET /api/gyms/1/geofencing
[ ] Ambos endpoints responden correctamente

VERIFICACIONES BD
[ ] gym_geofence NO existe (SHOW TABLES LIKE 'gym_geofence')
[ ] gym tiene auto_checkin_enabled, geofence_radius_meters, min_stay_minutes
[ ] assistance.check_in_time es NOT NULL
[ ] user_profiles NO tiene app_tier
[ ] user_device_tokens existe
[ ] 5 rutinas plantilla con metadata completa
```

**Si todos los checkboxes están marcados: ✅ MIGRACIÓN EXITOSA!**

---

## 🆘 Troubleshooting

### Problema: "Access denied for user 'root'@'localhost'"

**Causa**: Contraseña incorrecta o usuario sin permisos.

**Solución**:
```bash
# Verificar usuario y contraseña
mysql -u root -p
# Probar usuario alternativo
mysql -u gympoint_user -p gympoint
```

### Problema: "Can't connect to MySQL server"

**Causa**: MySQL no está corriendo.

**Solución**:
```bash
# Windows: Iniciar servicio MySQL
net start MySQL80

# Verificar que está corriendo
sc query MySQL80
```

### Problema: Migración se ejecutó pero falta tabla user_device_tokens

**Causa**: La creación falló silenciosamente.

**Solución**:
```sql
-- Ejecutar manualmente
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id_device_token INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  device_token VARCHAR(500) NOT NULL,
  platform ENUM('ios', 'android', 'web') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_user) REFERENCES user_profiles(id_user_profile) ON DELETE CASCADE,
  UNIQUE KEY unique_user_device (id_user, device_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Problema: Servidor no inicia después de migración

**Causa**: Posible error en modelos Sequelize.

**Solución**:
```bash
# Ver logs detallados
cd backend/node
npm run dev 2>&1 | tee migration_server_log.txt

# Buscar línea exacta del error
type migration_server_log.txt | findstr /i "error"
```

**Errores comunes**:
- `Unknown column 'geofence'` → Modelo GymGeofence no está comentado en models/index.js
- `Table 'gym_geofence' doesn't exist` → Algún código sigue usando GymGeofence

---

## 📚 Recursos Adicionales

- **[GUIA-RAPIDA-EJECUCION.md](GUIA-RAPIDA-EJECUCION.md)** - Versión resumida de esta guía
- **[README-MIGRATION-CLEANUP.md](README-MIGRATION-CLEANUP.md)** - Documentación técnica completa
- **[ANALISIS-SCRIPT-ORIGINAL.md](ANALISIS-SCRIPT-ORIGINAL.md)** - Análisis de problemas detectados
- **[ROLLBACK-cleanup-mvp-v1.sql](ROLLBACK-cleanup-mvp-v1.sql)** - Script de rollback
- **[RESUMEN-FASES-1-4.md](../../RESUMEN-FASES-1-4.md)** - Resumen de cambios en código

---

## 🎯 Siguiente Paso

Una vez completada la migración exitosamente:

1. **Commit de código** (FASES 1-4 ya aplicadas)
   ```bash
   cd c:\Users\gonza\OneDrive\Escritorio\project-GymPoint
   git add .
   git commit -m "feat: cleanup MVP - eliminar gym_geofence, unificar check_in_time, geolocation endpoints

   - FASE 1: Eliminar dependencia GymGeofence, integrar campos en gym
   - FASE 2: Migrar a check_in_time como campo principal
   - FASE 3: Verificar eliminación app_tier
   - FASE 4: Implementar endpoints de geolocalización
   - Migración SQL ejecutada: cleanup-mvp-v1-CORRECTED.sql

   Closes #X (número de issue si existe)"
   ```

2. **Testing manual** de funcionalidades principales
   - Check-in con geofencing
   - Consulta de gimnasios cercanos
   - Historial de asistencias

3. **Considerar FASE 5/6** (si aplica)
   - FASE 5: Challenges/Desafíos
   - FASE 6: Push Notifications

---

**Tiempo total estimado**: 5 minutos
**Nivel de riesgo**: Bajo (con backup)
**Reversible**: Sí (con ROLLBACK o backup)

🚀 **¡Éxito en tu migración!**
