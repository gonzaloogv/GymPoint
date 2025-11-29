# Plan de Migración: Diseño Relacional Consistente (Opción A)

## Objetivo

Mantener y estandarizar el diseño relacional para **amenities** y **services** (datos filtrables), mientras que **rules** permanece como JSON estático (solo informativo).

---

## Decisión Arquitectural

### ✅ **Diseño Relacional** (amenities, services)
- **Por qué**: Filtrado eficiente con JOINs indexados
- **Uso**: Usuario filtra gyms por "WiFi + CrossFit"
- **Implementación**: Tablas relacionales con many-to-many

### ✅ **JSON Estático** (rules)
- **Por qué**: Solo informativo, sin filtrado
- **Uso**: Mostrar reglas al usuario (ej: "No gritar", "Usar toalla")
- **Implementación**: Array JSON simple

---

## Estado Actual vs Estado Objetivo

### ANTES (Estado Actual)

**Amenities** (relacional con bug):
```
Landing → ["WiFi", "Ducha"] (strings)
         ↓
    Controller → convertAmenityNamesToIds() ❌ BUG: pierde datos en arrays mixtos
         ↓
    Service → [1, 2] (IDs)
         ↓
        DB → gym_gym_amenity (IDs)
```

**Services** (JSON sin filtrado eficiente):
```
Landing → ["CrossFit", "Funcional"] (strings)
         ↓
    Service → gym.services (JSON array) ❌ No se puede filtrar eficientemente
         ↓
        DB → gym.services JSON
```

**Rules** (JSON estático - OK):
```
Landing → ["No gritar", "Limpiar máquinas"] (strings)
         ↓
    Service → gym.rules (JSON array) ✅ Solo lectura
         ↓
        DB → gym.rules JSON
```

---

### DESPUÉS (Estado Objetivo)

**Amenities** (relacional sin bugs):
```
Landing → [1, 2] (IDs)
         ↓
    Controller → Joi validation (rechaza si no son IDs)
         ↓
    Service → setAmenities([1, 2])
         ↓
        DB → gym_gym_amenity (IDs) ✅ Filtrado rápido con JOINs
```

**Services** (relacional para filtrado):
```
Landing → [1, 2] (IDs)
         ↓
    Controller → Joi validation
         ↓
    Service → setServices([1, 2])
         ↓
        DB → gym_gym_service (IDs) ✅ Filtrado rápido con JOINs
```

**Rules** (JSON estático - sin cambios):
```
Landing → ["No gritar", "Limpiar máquinas"] (strings)
         ↓
    Service → gym.rules (JSON array) ✅ Sin cambios, solo informativo
         ↓
        DB → gym.rules JSON
```

---

## Beneficios del Enfoque Relacional

### 🚀 Performance
- **JOIN indexado** vs `JSON_CONTAINS`: 10-100x más rápido
- Escalable a 10K, 100K gyms sin degradación

### 🔍 Filtrado Avanzado
```sql
-- Gyms con WiFi Y Duchas (relacional)
SELECT DISTINCT g.*
FROM gym g
INNER JOIN gym_gym_amenity gga1 ON g.id_gym = gga1.id_gym AND gga1.id_amenity = 1
INNER JOIN gym_gym_amenity gga2 ON g.id_gym = gga2.id_gym AND gga2.id_amenity = 2;
-- 5ms con índices

-- Gyms con WiFi O Duchas (JSON)
SELECT * FROM gym
WHERE JSON_CONTAINS(amenities, '["WiFi"]') OR JSON_CONTAINS(amenities, '["Duchas"]');
-- 500ms+ sin índices eficientes
```

### 📊 Catálogo Centralizado
- **18 amenities** estándar (Duchas, WiFi, Lockers...)
- **~10 services** estándar (CrossFit, Funcional, Musculación...)
- Consistencia en nombres (evita "CrossFit" vs "Crossfit" vs "cross fit")

---

## FASE 1: Preparación (2-3 días)

### ✅ Paso 1.1: Fix del bug actual en amenities

**Objetivo**: Corregir `convertAmenityNamesToIds` con validación estricta

**Archivo**: `backend/node/services/gym-request-service.js` (líneas 23-46)

**Implementación**: Según [plan radiant-singing-puffin.md](C:\Users\Gonza\.claude\plans\radiant-singing-puffin.md)

**Tests**:
- 3 nuevos tests (arrays mixtos, duplicados, null/undefined)
- 62 tests existentes deben pasar
- **Resultado esperado**: 65 tests, 100% coverage

---

### ✅ Paso 1.2: Crear tablas relacionales para services

**Objetivo**: Migrar services de JSON a diseño relacional (igual que amenities)

#### A) Migration: Crear tablas gym_service y gym_gym_service

**Archivo**: `backend/node/migrations/20250128-create-gym-service-tables.js` (NUEVO)

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabla catálogo de services
    await queryInterface.createTable('gym_service', {
      id_service: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre del servicio/tipo (CrossFit, Funcional, Musculación, etc.)',
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Categoría opcional (TRAINING, WELLNESS, MARTIAL_ARTS)',
      },
      icon_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Nombre del ícono para la UI',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Tabla many-to-many: gym <-> service
    await queryInterface.createTable('gym_gym_service', {
      id_gym: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'gym',
          key: 'id_gym',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_service: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'gym_service',
          key: 'id_service',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre este servicio en este gym',
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Índice para optimizar filtrado
    await queryInterface.addIndex('gym_gym_service', ['id_service'], {
      name: 'idx_gym_service_service',
    });

    console.log('✅ Tablas gym_service y gym_gym_service creadas');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('gym_gym_service');
    await queryInterface.dropTable('gym_service');
    console.log('✅ Tablas gym_service y gym_gym_service eliminadas');
  },
};
```

#### B) Seeders: Poblar catálogo de services

**Archivo**: `backend/node/seed/initial-data.js` (agregar después de amenities)

```javascript
// Después de insertar amenities (línea ~119)

// ========================================
// SERVICES (Tipos de entrenamiento)
// ========================================
const existingServicesCount = await sequelize.query(
  'SELECT COUNT(*) as count FROM gym_service',
  { type: QueryTypes.SELECT }
);

if (existingServicesCount[0].count > 0) {
  console.log(`✓ Ya existen ${existingServicesCount[0].count} services en la BD`);
} else {
  const services = [
    { name: 'Funcional', category: 'TRAINING', icon: 'dumbbell' },
    { name: 'CrossFit', category: 'TRAINING', icon: 'crossfit' },
    { name: 'Musculación', category: 'TRAINING', icon: 'barbell' },
    { name: 'Yoga', category: 'WELLNESS', icon: 'yoga' },
    { name: 'Pilates', category: 'WELLNESS', icon: 'pilates' },
    { name: 'Spinning', category: 'TRAINING', icon: 'bike' },
    { name: 'Boxeo', category: 'MARTIAL_ARTS', icon: 'boxing' },
    { name: 'Kickboxing', category: 'MARTIAL_ARTS', icon: 'kickboxing' },
    { name: 'Zumba', category: 'WELLNESS', icon: 'dance' },
    { name: 'Cardio', category: 'TRAINING', icon: 'heart' },
  ];

  await queryInterface.bulkInsert('gym_service', services, {});
  console.log(`✓ Insertados ${services.length} services iniciales`);
}
```

#### C) Models: GymService y GymGymService

**Archivo**: `backend/node/models/GymService.js` (NUEVO)

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymService = sequelize.define('GymService', {
  id_service: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Nombre del servicio/tipo (CrossFit, Funcional, etc.)',
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Categoría (TRAINING, WELLNESS, MARTIAL_ARTS)',
  },
  icon_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nombre del ícono para la UI',
  },
}, {
  tableName: 'gym_service',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = GymService;
```

**Archivo**: `backend/node/models/GymGymService.js` (NUEVO)

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymGymService = sequelize.define('GymGymService', {
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'gym',
      key: 'id_gym',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  id_service: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'gym_service',
      key: 'id_service',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre este servicio en este gym',
  },
}, {
  tableName: 'gym_gym_service',
  timestamps: false,
  indexes: [
    {
      fields: ['id_service'],
      name: 'idx_gym_service_service',
    },
  ],
});

module.exports = GymGymService;
```

#### D) Asociaciones en models/index.js

**Archivo**: `backend/node/models/index.js`

```javascript
// Después de las asociaciones de amenities (línea ~625)

// ========================================
// Gym Services
// ========================================
const GymService = require('./GymService');
const GymGymService = require('./GymGymService');

Gym.belongsToMany(GymService, {
  through: GymGymService,
  foreignKey: 'id_gym',
  otherKey: 'id_service',
  as: 'services',
});

GymService.belongsToMany(Gym, {
  through: GymGymService,
  foreignKey: 'id_service',
  otherKey: 'id_gym',
  as: 'gyms',
});

Gym.hasMany(GymGymService, {
  foreignKey: 'id_gym',
  as: 'gymServicesLinks',
});

GymService.hasMany(GymGymService, {
  foreignKey: 'id_service',
  as: 'gymLinks',
});

module.exports = {
  // ... exports existentes
  GymService,
  GymGymService,
};
```

---

### ✅ Paso 1.3: Migración de datos services JSON → relacional

**Objetivo**: Migrar services existentes de `gym.services` (JSON) a `gym_gym_service` (relacional)

**Archivo**: `backend/node/migrations/20250128-migrate-services-json-to-relational.js` (NUEVO)

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = Sequelize;

    // 1. Obtener todos los gyms con services JSON
    const gyms = await queryInterface.sequelize.query(
      'SELECT id_gym, services FROM gym WHERE services IS NOT NULL',
      { type: QueryTypes.SELECT }
    );

    console.log(`📊 Migrando services de ${gyms.length} gyms...`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const gym of gyms) {
      try {
        const servicesArray = typeof gym.services === 'string'
          ? JSON.parse(gym.services)
          : gym.services;

        if (!Array.isArray(servicesArray) || servicesArray.length === 0) {
          continue;
        }

        // 2. Para cada service name, buscar ID en gym_service
        for (const serviceName of servicesArray) {
          const [service] = await queryInterface.sequelize.query(
            'SELECT id_service FROM gym_service WHERE name = :name',
            {
              replacements: { name: serviceName },
              type: QueryTypes.SELECT,
            }
          );

          if (service) {
            // 3. Insertar en gym_gym_service (ignorar duplicados)
            await queryInterface.sequelize.query(
              `INSERT IGNORE INTO gym_gym_service (id_gym, id_service)
               VALUES (:id_gym, :id_service)`,
              {
                replacements: {
                  id_gym: gym.id_gym,
                  id_service: service.id_service,
                },
              }
            );
            migratedCount++;
          } else {
            console.warn(`⚠️  Service no encontrado: "${serviceName}" (gym ${gym.id_gym})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error migrando gym ${gym.id_gym}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Migrados ${migratedCount} services`);
    console.log(`⚠️  ${errorCount} errores`);

    // 4. NO eliminar gym.services JSON aún (mantener backward compatibility)
    console.log('⚠️  Columna gym.services mantenida para backward compatibility');
  },

  async down(queryInterface) {
    // Rollback: eliminar todas las relaciones
    await queryInterface.sequelize.query('DELETE FROM gym_gym_service');
    console.log('✅ Rollback: gym_gym_service limpiada');
  },
};
```

---

### ✅ Paso 1.4: Endpoints GET /api/amenities y GET /api/services

**Archivo**: `backend/node/controllers/catalog-controller.js` (NUEVO)

```javascript
const { Amenity, GymService } = require('../models');
const { logger } = require('../utils/logger');

async function getAllAmenities(req, res) {
  try {
    const amenities = await Amenity.findAll({
      attributes: ['id_amenity', 'name', 'category', 'icon_name'],
      order: [['name', 'ASC']],
    });

    return res.json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    logger.error('Error fetching amenities', { error });
    return res.status(500).json({
      success: false,
      error: 'Error al obtener amenities',
    });
  }
}

async function getAllServices(req, res) {
  try {
    const services = await GymService.findAll({
      attributes: ['id_service', 'name', 'category', 'icon_name'],
      order: [['name', 'ASC']],
    });

    return res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    logger.error('Error fetching services', { error });
    return res.status(500).json({
      success: false,
      error: 'Error al obtener services',
    });
  }
}

module.exports = { getAllAmenities, getAllServices };
```

**Archivo**: `backend/node/routes/catalog-routes.js` (NUEVO)

```javascript
const express = require('express');
const router = express.Router();
const { getAllAmenities, getAllServices } = require('../controllers/catalog-controller');

router.get('/amenities', getAllAmenities);
router.get('/services', getAllServices);

module.exports = router;
```

**Registrar en app.js**:

```javascript
app.use('/api/catalog', require('./routes/catalog-routes'));
```

---

## FASE 2: Migrar Frontend Landing (2-3 días)

### ✅ Paso 2.1: Hooks para amenities y services

**Archivo**: `frontend/gympoint-landing/src/hooks/useCatalog.ts` (NUEVO)

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface CatalogItem {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}

export interface Amenity extends CatalogItem {
  id_amenity: number;
}

export interface Service extends CatalogItem {
  id_service: number;
}

export function useAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAmenities() {
      try {
        const response = await api.get('/catalog/amenities');
        setAmenities(response.data.data);
      } catch (err) {
        setError('Error al cargar amenities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAmenities();
  }, []);

  return { amenities, loading, error };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await api.get('/catalog/services');
        setServices(response.data.data);
      } catch (err) {
        setError('Error al cargar services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return { services, loading, error };
}
```

---

### ✅ Paso 2.2: Actualizar form para enviar IDs

**Archivo**: `frontend/gympoint-landing/src/components/GymRegistrationForm.tsx`

**ANTES**:
```typescript
const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
const [selectedServices, setSelectedServices] = useState<string[]>([]);

// Al submit
formData.amenities = selectedAmenities; // ["WiFi", "Ducha"]
formData.services = selectedServices; // ["CrossFit", "Funcional"]
```

**DESPUÉS**:
```typescript
import { useAmenities, useServices } from '../hooks/useCatalog';

function GymRegistrationForm() {
  const { amenities, loading: loadingAmenities } = useAmenities();
  const { services, loading: loadingServices } = useServices();

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const handleSubmit = async () => {
    const formData = {
      ...otherFields,
      amenities: selectedAmenityIds, // [1, 2, 3] ✅
      services: selectedServiceIds,   // [1, 2] ✅
    };

    await api.post('/gym-requests', formData);
  };

  if (loadingAmenities || loadingServices) return <Spinner />;

  return (
    <form onSubmit={handleSubmit}>
      {/* Amenities section */}
      <div className="amenities-section">
        <h3>Amenidades</h3>
        <div className="grid">
          {amenities.map(amenity => (
            <label key={amenity.id_amenity}>
              <input
                type="checkbox"
                checked={selectedAmenityIds.includes(amenity.id_amenity)}
                onChange={() => handleToggle(amenity.id_amenity, setSelectedAmenityIds)}
              />
              {amenity.name}
            </label>
          ))}
        </div>
      </div>

      {/* Services section */}
      <div className="services-section">
        <h3>Tipos de entrenamiento</h3>
        <div className="grid">
          {services.map(service => (
            <label key={service.id_service}>
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(service.id_service)}
                onChange={() => handleToggle(service.id_service, setSelectedServiceIds)}
              />
              {service.name}
            </label>
          ))}
        </div>
      </div>

      <button type="submit">Enviar solicitud</button>
    </form>
  );
}
```

---

## FASE 3: Backend Validation (2-3 días)

### ✅ Paso 3.1: Schema Joi con validación estricta

**Archivo**: `backend/node/validators/gym-request.schema.js` (NUEVO)

```javascript
const Joi = require('joi');

const createGymRequestSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  city: Joi.string().required().min(2).max(50),
  address: Joi.string().required().min(5).max(100),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  description: Joi.string().max(500).optional(),
  phone: Joi.string().pattern(/^\+?\d{10,15}$/).optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  instagram: Joi.string().optional(),
  facebook: Joi.string().optional(),
  monthly_price: Joi.number().min(0).optional(),
  weekly_price: Joi.number().min(0).optional(),
  daily_price: Joi.number().min(0).optional(),
  trial_allowed: Joi.boolean().optional(),

  // ✅ AMENITIES: Solo IDs numéricos
  amenities: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'amenities debe ser un array',
      'number.base': 'Todos los elementos de amenities deben ser números enteros positivos',
      'number.integer': 'Los IDs de amenities deben ser enteros',
      'number.positive': 'Los IDs de amenities deben ser mayores a 0',
    }),

  // ✅ SERVICES: Solo IDs numéricos
  services: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'services debe ser un array',
      'number.base': 'Todos los elementos de services deben ser números enteros positivos',
      'number.integer': 'Los IDs de services deben ser enteros',
      'number.positive': 'Los IDs de services deben ser mayores a 0',
    }),

  // ✅ RULES: Array de strings (sin cambios)
  rules: Joi.array().items(Joi.string()).optional(),

  equipment: Joi.object().optional(),
  schedule: Joi.array().optional(),
  photos: Joi.array().items(Joi.string().uri()).max(1).optional(),
})
.or('email', 'phone') // Al menos uno requerido
.messages({
  'object.missing': 'Debe proporcionar al menos un email o teléfono de contacto',
});

module.exports = { createGymRequestSchema };
```

---

### ✅ Paso 3.2: Repository para services (igual que amenities)

**Archivo**: `backend/node/infra/db/repositories/gym.repository.js`

**Agregar**:

```javascript
// Después de setAmenities (línea ~82)

/**
 * Asignar services a un gym (reemplaza existentes)
 * @param {number} gymId - ID del gym
 * @param {number[]} serviceIds - Array de IDs de services
 */
async function setServices(gymId, serviceIds) {
  if (!Array.isArray(serviceIds)) {
    throw new TypeError('serviceIds debe ser un array');
  }

  const gym = await Gym.findByPk(gymId);
  if (!gym) {
    throw new NotFoundError('Gym no encontrado');
  }

  await gym.setServices(serviceIds);
  logger.info('Services updated', { gymId, serviceCount: serviceIds.length });
}

module.exports = {
  // ... exports existentes
  setServices,
};
```

---

### ✅ Paso 3.3: Actualizar gym-service.js

**Archivo**: `backend/node/services/gym-service.js`

**Cambios**:

```javascript
// Línea ~83: Cambiar de JSON a IDs
async function createGym(input) {
  const payload = {
    // ... otros campos
    amenities: input.amenities || [], // IDs numéricos
    services: input.services || [],   // IDs numéricos (YA NO JSON)
    rules: input.rules || [],          // JSON strings (sin cambios)
  };

  const gym = await gymRepository.createGym(payload);

  // Línea ~331: Setear services relacionales
  if (command.services !== undefined) {
    const serviceIds = normalizeServiceIds(command.services); // Nueva función
    await gymRepository.setServices(command.gymId, serviceIds);
  }
}

// Nueva función helper
function normalizeServiceIds(services) {
  if (!Array.isArray(services)) return [];
  return services
    .filter(id => typeof id === 'number' && id > 0)
    .filter((id, index, self) => self.indexOf(id) === index); // Eliminar duplicados
}
```

---

### ✅ Paso 3.4: Actualizar filtrado en gym.repository.js

**Archivo**: `backend/node/infra/db/repositories/gym.repository.js`

**Cambios en searchGyms** (líneas 114-121):

**ANTES** (sin filtrado de services):
```javascript
if (filters.type) {
  include.push({
    ...TYPE_ASSOC, // Esto ya no existe
    where: {
      name: { [Op.like]: `%${filters.type}%` },
    },
  });
}
```

**DESPUÉS** (filtrado relacional por services):
```javascript
// Filtrado por service IDs (igual que amenities)
if (filters.serviceIds?.length) {
  include.push({
    model: GymService,
    as: 'services',
    through: { attributes: [] },
    where: {
      id_service: filters.serviceIds,
    },
    required: true, // INNER JOIN
  });
}
```

---

## FASE 4: Testing (2-3 días)

### ✅ Tests para services (igual que amenities)

**Archivo**: `backend/node/tests/unit/service/gym-request-service/gym-request-service.approve.test.js`

**Agregar tests**:

```javascript
it('convierte services de nombres a IDs numéricos', async () => {
  const mockRequest = {
    id_gym_request: 30,
    name: 'Gym Test Services',
    city: 'CABA',
    address: 'Calle 100',
    status: 'pending',
    monthly_price: 12000,
    equipment: {},
    services: ['CrossFit', 'Funcional'], // Strings
    rules: [],
    schedule: [],
    amenities: [],
    update: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn(),
  };

  mockService.findAll.mockResolvedValue([
    { id_service: 1, name: 'CrossFit' },
    { id_service: 2, name: 'Funcional' },
  ]);

  await gymRequestService.approveRequest(30, 3000);

  const createCall = mockGymService.createGym.mock.calls[0][0];
  expect(createCall.services).toEqual([1, 2]);
});

it('acepta services como IDs numéricos directamente', async () => {
  const mockRequest = {
    id_gym_request: 31,
    name: 'Gym Test Services IDs',
    city: 'Rosario',
    address: 'Calle 200',
    status: 'pending',
    monthly_price: 11000,
    equipment: {},
    services: [1, 2, 3], // IDs
    rules: [],
    schedule: [],
    amenities: [],
    update: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn(),
  };

  await gymRequestService.approveRequest(31, 3100);

  const createCall = mockGymService.createGym.mock.calls[0][0];
  expect(createCall.services).toEqual([1, 2, 3]);
  expect(mockService.findAll).not.toHaveBeenCalled();
});
```

---

## FASE 5: Cleanup y Deprecación (después de 2 semanas)

### ✅ Eliminar columna gym.services (JSON)

**Archivo**: `backend/node/migrations/20250215-remove-services-json-column.js` (NUEVO)

```javascript
'use strict';

module.exports = {
  async up(queryInterface) {
    // Verificar que no haya gyms usando JSON
    const { QueryTypes } = queryInterface.sequelize.Sequelize;
    const gymsWithJson = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM gym WHERE services IS NOT NULL AND services != "[]"',
      { type: QueryTypes.SELECT }
    );

    if (gymsWithJson[0].count > 0) {
      console.warn(`⚠️  ${gymsWithJson[0].count} gyms todavía tienen services JSON`);
      console.warn('⚠️  Abortando eliminación de columna');
      throw new Error('Migración incompleta: gyms con services JSON detectados');
    }

    // Eliminar columna
    await queryInterface.removeColumn('gym', 'services');
    console.log('✅ Columna gym.services eliminada');
  },

  async down(queryInterface, Sequelize) {
    // Recrear columna
    await queryInterface.addColumn('gym', 'services', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array de servicios/tipos del gimnasio (DEPRECATED)',
    });
    console.log('✅ Columna gym.services restaurada');
  },
};
```

---

## CRONOGRAMA ESTIMADO

| Fase | Duración | Tareas Clave |
|------|----------|--------------|
| **FASE 1: Preparación** | 2-3 días | Fix bug amenities + Crear tablas services + Migración datos + Endpoints |
| **FASE 2: Frontend Landing** | 2-3 días | Hooks useCatalog + Form con IDs + Tests E2E |
| **FASE 3: Backend Validation** | 2-3 días | Joi schemas + Repository setServices + Filtrado relacional |
| **FASE 4: Testing** | 2-3 días | Unit tests + Integration tests + Manual testing |
| **FASE 5: Cleanup** | 1 día | Eliminar gym.services JSON + Deprecar funciones |
| **TOTAL** | **10-14 días** | - |

---

## CRITERIOS DE ÉXITO

### ✅ Funcionalidad
- Filtrado de gyms por amenities funciona (ej: "WiFi + Estacionamiento")
- Filtrado de gyms por services funciona (ej: "CrossFit + Funcional")
- Rules se mantiene como JSON (solo lectura)

### ✅ Performance
- Queries de filtrado < 50ms (con índices)
- No queries N+1
- Response time sin degradación

### ✅ Testing
- 70+ tests pasando (gym-request-service)
- 100% coverage en funciones críticas
- E2E tests en landing

### ✅ Backward Compatibility
- Gym.services JSON mantenido temporalmente (2 semanas)
- Migración gradual sin downtime
- Rollback plan documentado

---

## VENTAJAS DE ESTE ENFOQUE

### 🎯 Consistencia Arquitectural
```
FILTRABLE (relacional):
├── amenities → gym_gym_amenity (JOIN indexado)
└── services  → gym_gym_service (JOIN indexado)

ESTÁTICO (JSON):
└── rules → gym.rules (array de strings)
```

### 🚀 Performance
- Filtrado combinado: "Gyms con WiFi Y CrossFit" → 1 query eficiente
- Escalable a 100K gyms
- Índices optimizados

### 🔧 Mantenibilidad
- Catálogo centralizado (18 amenities, 10 services)
- Sin strings hardcodeados en frontend
- Fácil agregar nuevos items al catálogo

---

## ROLLBACK PLAN

### Si falla en producción:

1. **Rollback inmediato** (< 5 min):
   ```bash
   git revert <commit-hash>
   pm2 reload gympoint-api
   ```

2. **Rollback parcial** (backend):
   - Reactivar conversión de strings temporalmente
   - Mantener endpoints /catalog activos

3. **Rollback de datos**:
   - Restaurar gym.services desde gym_gym_service:
   ```sql
   UPDATE gym g
   SET services = (
     SELECT JSON_ARRAYAGG(gs.name)
     FROM gym_gym_service ggs
     JOIN gym_service gs ON ggs.id_service = gs.id_service
     WHERE ggs.id_gym = g.id_gym
   );
   ```

---

## PRÓXIMOS PASOS

Una vez completada esta migración, el sistema tendrá:

✅ **Amenities**: Relacional con filtrado eficiente
✅ **Services**: Relacional con filtrado eficiente
✅ **Rules**: JSON estático (solo lectura)

**Futuras optimizaciones**:
- Cache de catálogos en Redis (TTL 24h)
- Full-text search con Elasticsearch
- Agregaciones de filtros más complejos ("CrossFit cerca de Palermo")
