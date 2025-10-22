# Guía de Correcciones Críticas - Base de Datos GymPoint

## 🎯 Objetivo
Aplicar correcciones críticas identificadas en la base de datos modificando las **migrations existentes** y actualizando los **modelos Sequelize** correspondientes. No se crearán nuevas migrations; todas las correcciones se aplicarán sobre las migraciones ya existentes.

---

## ⚠️ IMPORTANTE: Flujo de Aplicación

### **Paso 1: Backup de Seguridad**
```bash
# Hacer backup de las migrations actuales
cp -r migrations/ migrations-backup-$(date +%Y%m%d)/

# Opcional: Backup de los datos si hay algo importante
docker exec gympoint-mysql mysqldump -u root -p gympoint > backup_$(date +%Y%m%d).sql
```

### **Paso 2: Eliminar Base de Datos Actual**
```bash
# Detener contenedores
docker-compose down

# Eliminar volúmenes de MySQL (esto borra TODA la data)
docker volume rm $(docker volume ls -q | grep mysql)

# O si tienes el volumen específico:
docker volume rm gympoint_mysql_data
```

### **Paso 3: Aplicar Migraciones Corregidas**
```bash
# Levantar contenedor MySQL limpio
docker-compose up -d mysql

# Esperar a que MySQL esté listo
sleep 10

# Ejecutar migraciones corregidas
npm run staging:migrate

# Verificar que todo esté correcto
docker exec gympoint-mysql mysql -u root -p -e "USE gympoint; SHOW TABLES;"
```

### **Paso 4: Seed (Opcional)**
```bash
npm run staging:seed
```

---

## 🔧 CORRECCIONES POR ARCHIVO

### **Migration 1: `20260104-create-fitness-tracking.js`**

#### **Tabla: `streak`**

**Cambios a aplicar:**

1. **Agregar columna `max_value`** para registrar el streak histórico más alto
2. **Documentar claramente** que `id_streak = id_user_profile` (relación 1:1)

```javascript
// migrations/20260104-create-fitness-tracking.js

// ANTES:
await queryInterface.createTable('streak', {
  id_streak: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // ...
  last_value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Última racha (antes de perderla)'
  },
  // ...
});

// DESPUÉS:
await queryInterface.createTable('streak', {
  id_streak: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID del streak = id_user_profile (relación 1:1)'
  },
  id_user_profile: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'Usuario al que pertenece la racha'
  },
  value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Racha actual (días consecutivos)'
  },
  last_value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Última racha (antes de perderla)'
  },
  max_value: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Racha máxima histórica del usuario'
  },
  recovery_items: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Ítems de recuperación de racha disponibles'
  },
  last_assistance_date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    comment: 'Fecha de la última asistencia'
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }
});

// Agregar FK e índices
await queryInterface.addConstraint('streak', {
  fields: ['id_user_profile'],
  type: 'foreign key',
  name: 'fk_streak_user_profile',
  references: {
    table: 'user_profiles',
    field: 'id_user_profile'
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

await queryInterface.addIndex('streak', ['id_user_profile'], {
  name: 'idx_streak_user'
});

await queryInterface.addIndex('streak', ['value'], {
  name: 'idx_streak_value'
});
```

---

### **Migration 2: `20260102-create-profile-tables.js`**

#### **Tabla: `user_profiles`**

**Cambios a aplicar:**

1. **ELIMINAR columna `id_streak`** (la relación es suficiente desde `streak → user_profiles`)
2. **Renombrar `subscription` a `app_tier`** para evitar confusión
3. **Agregar columnas de premium**

```javascript
// migrations/20260102-create-profile-tables.js

// ANTES:
subscription: {
  type: Sequelize.ENUM('FREE', 'PREMIUM'),
  allowNull: false,
  defaultValue: 'FREE',
  comment: 'Nivel de suscripción del usuario'
},
tokens: {
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0,
  comment: 'Tokens acumulados (balance actual)'
},
id_streak: {
  type: Sequelize.INTEGER,
  allowNull: true,
  comment: 'Racha actual del usuario (FK a streak, se agrega en migración 4)'
},

// DESPUÉS:
app_tier: { // ✅ RENOMBRADO
  type: Sequelize.ENUM('FREE', 'PREMIUM'),
  allowNull: false,
  defaultValue: 'FREE',
  comment: 'Tier de la aplicación (no confundir con suscripciones a gyms)'
},
premium_since: {
  type: Sequelize.DATEONLY,
  allowNull: true,
  comment: 'Fecha desde la cual el usuario es premium'
},
premium_expires: {
  type: Sequelize.DATEONLY,
  allowNull: true,
  comment: 'Fecha de expiración del premium'
},
tokens: {
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0,
  comment: 'Tokens acumulados (balance actual)'
},
// ❌ ELIMINAR id_streak completamente

// Actualizar índice:
await queryInterface.addIndex('user_profiles', ['app_tier'], {
  name: 'idx_user_profiles_app_tier'
});
```

---

### **Migration 3: `20260103-create-gym-ecosystem.js`**

#### **Tabla: `gym`**

**Cambios a aplicar:**

1. **ELIMINAR columna `id_type`** (usar solo `gym_gym_type` para relación N:M)

```javascript
// migrations/20260103-create-gym-ecosystem.js

// ANTES:
id_type: {
  type: Sequelize.INTEGER,
  allowNull: true,
  references: {
    model: 'gym_type',
    key: 'id_type'
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
},

// DESPUÉS:
// ❌ ELIMINAR completamente esta columna

// El resto de la tabla permanece igual
name: {
  type: Sequelize.STRING(100),
  allowNull: false
},
// ... resto de columnas
```

---

#### **Tabla: `presence`**

**Cambios a aplicar:**

1. **Agregar índice único condicional** para prevenir múltiples presencias activas

```javascript
// migrations/20260103-create-gym-ecosystem.js

// AL FINAL de la creación de la tabla presence:
await queryInterface.addIndex('presence', {
  fields: ['id_user_profile', 'status'],
  name: 'idx_presence_active_unique',
  unique: true,
  where: {
    exited_at: null,
    status: ['DETECTING', 'CONFIRMED']
  }
});
```

---

### **Migration 4: `20260105-create-exercise-routines.js`**

#### **Tabla: `user_routine`**

**Cambios a aplicar:**

1. **Agregar índice único condicional** para garantizar solo 1 rutina activa por usuario

```javascript
// migrations/20260105-create-exercise-routines.js

// AL FINAL de la creación de la tabla user_routine:
await queryInterface.addIndex('user_routine', {
  fields: ['id_user_profile', 'is_active'],
  name: 'idx_one_active_routine_per_user',
  unique: true,
  where: {
    is_active: true
  }
});
```

---

## 📝 ACTUALIZACIÓN DE MODELOS SEQUELIZE

### **Modelo: `models/Streak.js`**

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Streak extends Model {
    static associate(models) {
      // Relación 1:1 con UserProfile
      this.belongsTo(models.UserProfile, {
        foreignKey: 'id_user_profile',
        as: 'user'
      });
      
      // Relación 1:N con Assistance
      this.hasMany(models.Assistance, {
        foreignKey: 'id_streak',
        as: 'assistances'
      });
    }
  }

  Streak.init({
    id_streak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID del streak = id_user_profile (relación 1:1)'
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    max_value: { // ✅ NUEVO CAMPO
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    recovery_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_assistance_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Streak',
    tableName: 'streak',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hook para actualizar max_value automáticamente
      beforeUpdate: (streak) => {
        if (streak.value > streak.max_value) {
          streak.max_value = streak.value;
        }
      }
    }
  });

  return Streak;
};
```

---

### **Modelo: `models/UserProfile.js`**

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      this.belongsTo(models.Account, {
        foreignKey: 'id_account',
        as: 'account'
      });
      
      // ✅ Relación correcta: UserProfile HAS ONE Streak
      this.hasOne(models.Streak, {
        foreignKey: 'id_user_profile',
        as: 'streak'
      });
      
      // Otras relaciones...
      this.hasMany(models.Assistance, {
        foreignKey: 'id_user_profile',
        as: 'assistances'
      });
      
      this.hasOne(models.Frequency, {
        foreignKey: 'id_user_profile',
        as: 'frequency'
      });
    }
  }

  UserProfile.init({
    id_user_profile: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_account: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: false,
      defaultValue: 'O'
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    locality: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    app_tier: { // ✅ RENOMBRADO
      type: DataTypes.ENUM('FREE', 'PREMIUM'),
      allowNull: false,
      defaultValue: 'FREE'
    },
    premium_since: { // ✅ NUEVO
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    premium_expires: { // ✅ NUEVO
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // ❌ ELIMINAR id_streak
    profile_picture_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'user_profiles',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete
    deletedAt: 'deleted_at'
  });

  return UserProfile;
};
```

---

### **Modelo: `models/Assistance.js`**

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assistance extends Model {
    static associate(models) {
      this.belongsTo(models.UserProfile, {
        foreignKey: 'id_user_profile',
        as: 'user'
      });
      
      this.belongsTo(models.Gym, {
        foreignKey: 'id_gym',
        as: 'gym'
      });
      
      this.belongsTo(models.Streak, {
        foreignKey: 'id_streak',
        as: 'streak'
      });
    }
  }

  Assistance.init({
    id_assistance: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_gym: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_streak: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    auto_checkin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    distance_meters: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Assistance',
    tableName: 'assistance',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['id_user_profile', 'id_gym', 'date'],
        name: 'unique_user_gym_date'
      }
    ]
  });

  return Assistance;
};
```

---

### **Modelo: `models/Gym.js`**

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gym extends Model {
    static associate(models) {
      // ❌ ELIMINAR esta relación:
      // this.belongsTo(models.GymType, { foreignKey: 'id_type' });
      
      // ✅ MANTENER solo la relación N:M:
      this.belongsToMany(models.GymType, {
        through: models.GymGymType,
        foreignKey: 'id_gym',
        otherKey: 'id_type',
        as: 'types'
      });
      
      // Otras relaciones...
      this.hasMany(models.Assistance, {
        foreignKey: 'id_gym',
        as: 'assistances'
      });
      
      this.belongsToMany(models.GymAmenity, {
        through: models.GymGymAmenity,
        foreignKey: 'id_gym',
        otherKey: 'id_amenity',
        as: 'amenities'
      });
    }
  }

  Gym.init({
    id_gym: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // ❌ ELIMINAR id_type
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    // ... resto de campos
    geofence_radius_meters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 150
    },
    min_stay_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    }
  }, {
    sequelize,
    modelName: 'Gym',
    tableName: 'gym',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at'
  });

  return Gym;
};
```

---

### **Modelo: `models/UserRoutine.js`**

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRoutine extends Model {
    static associate(models) {
      this.belongsTo(models.UserProfile, {
        foreignKey: 'id_user_profile',
        as: 'user'
      });
      
      this.belongsTo(models.Routine, {
        foreignKey: 'id_routine',
        as: 'routine'
      });
    }
  }

  UserRoutine.init({
    id_user_routine: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user_profile: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_routine: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserRoutine',
    tableName: 'user_routine',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_user_profile', 'is_active'],
        name: 'idx_one_active_routine_per_user',
        where: {
          is_active: true
        }
      }
    ]
  });

  return UserRoutine;
};
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de aplicar todas las correcciones:

### **1. Verificar Estructura de Tablas**
```bash
docker exec gympoint-mysql mysql -u root -p -e "
USE gympoint;

-- Verificar que streak tenga max_value
DESCRIBE streak;

-- Verificar que gym NO tenga id_type
DESCRIBE gym;

-- Verificar que user_profiles NO tenga id_streak
DESCRIBE user_profiles;

-- Verificar que user_profiles tenga app_tier
DESCRIBE user_profiles;
"
```

### **2. Verificar Constraints**
```sql
-- Assistance debe tener UNIQUE constraint
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'assistance' AND TABLE_SCHEMA = 'gympoint';

-- Debe aparecer: unique_user_gym_date
```

### **3. Verificar Índices**
```sql
SHOW INDEX FROM presence WHERE Key_name = 'idx_presence_active_unique';
SHOW INDEX FROM user_routine WHERE Key_name = 'idx_one_active_routine_per_user';
```

### **4. Test de Integridad**
```javascript
// tests/db-integrity.test.js
const { UserProfile, Streak, Gym, GymType } = require('../models');

describe('DB Integrity Tests', () => {
  test('User should have exactly one streak', async () => {
    const user = await UserProfile.create({
      id_account: 1,
      name: 'Test',
      lastname: 'User',
      gender: 'M'
    });
    
    const streak = await Streak.create({
      id_user_profile: user.id_user_profile,
      value: 5
    });
    
    expect(streak.id_user_profile).toBe(user.id_user_profile);
  });
  
  test('Gym should have multiple types', async () => {
    const gym = await Gym.create({
      name: 'Test Gym',
      city: 'Resistencia',
      address: 'Test 123',
      latitude: -27.4511,
      longitude: -58.9867
    });
    
    const types = await GymType.findAll({ limit: 3 });
    await gym.addTypes(types);
    
    const gymTypes = await gym.getTypes();
    expect(gymTypes.length).toBe(3);
  });
});
```

---

## 🚨 TROUBLESHOOTING

### **Error: "Cannot add foreign key constraint"**
```bash
# Solución: Asegurarse de que las tablas se creen en el orden correcto
# El orden debe ser:
# 1. accounts, roles
# 2. user_profiles, admin_profiles
# 3. gym, gym_type
# 4. streak, frequency
# 5. assistance
```

### **Error: "Duplicate key name 'idx_...'"**
```bash
# Solución: Eliminar índice duplicado en la migration
# Verificar que no haya dos addIndex con el mismo nombre
```

### **Error: "Unknown column 'id_streak' in 'field list'"**
```bash
# Solución: Asegurarse de que el modelo UserProfile NO tenga id_streak
# y que todas las referencias a user_profiles.id_streak sean eliminadas
```

---

## 📋 RESUMEN DE CAMBIOS

| **Tabla** | **Cambio** | **Razón** |
|-----------|------------|-----------|
| `streak` | + `max_value` | Registrar streak histórico más alto |
| `user_profiles` | - `id_streak` | Relación suficiente desde streak → user |
| `user_profiles` | `subscription` → `app_tier` | Evitar confusión con suscripciones a gyms |
| `user_profiles` | + `premium_since`, `premium_expires` | Controlar período premium |
| `gym` | - `id_type` | Usar solo relación N:M con gym_gym_type |
| `assistance` | `id_streak` nullable | Asignar en lógica de backend |
| `assistance` | + UNIQUE constraint | Prevenir asistencias duplicadas |
| `presence` | + Índice único condicional | Prevenir múltiples presencias activas |
| `user_routine` | + Índice único condicional | Garantizar solo 1 rutina activa |

---