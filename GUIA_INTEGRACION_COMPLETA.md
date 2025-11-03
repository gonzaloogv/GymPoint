# 📘 Guía Completa de Integración - Backend & Frontend

Esta guía documenta el proceso completo para crear e integrar una nueva entidad en GymPoint, desde la base de datos hasta el frontend, siguiendo Clean Architecture.

**Basado en la integración exitosa de Routine & UserRoutine (Noviembre 2025)**

---

## 📋 Índice

1. [Backend - Parte 1: Base de Datos](#backend-parte-1-base-de-datos)
2. [Backend - Parte 2: Modelo Sequelize](#backend-parte-2-modelo-sequelize)
3. [Backend - Parte 3: Repository Pattern](#backend-parte-3-repository-pattern)
4. [Backend - Parte 4: Mappers](#backend-parte-4-mappers)
5. [Backend - Parte 5: Services (CQRS)](#backend-parte-5-services-cqrs)
6. [Backend - Parte 6: Controllers](#backend-parte-6-controllers)
7. [Backend - Parte 7: Routes](#backend-parte-7-routes)
8. [Backend - Parte 8: OpenAPI Documentation](#backend-parte-8-openapi-documentation)
9. [Backend - Parte 9: Testing](#backend-parte-9-testing)
10. [Frontend - Parte 1: Domain Layer](#frontend-parte-1-domain-layer)
11. [Frontend - Parte 2: Data Layer](#frontend-parte-2-data-layer)
12. [Frontend - Parte 3: Presentation Layer](#frontend-parte-3-presentation-layer)
13. [Checklist de Integración](#checklist-de-integración)
14. [Best Practices](#best-practices)

---

## Backend - Parte 1: Base de Datos

### 1.1 Crear Migration

📁 `backend/node/migrations/YYYYMMDDHHMMSS-create-example.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('example', {
      id_example: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único del ejemplo'
      },
      id_user_profile: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profile',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Usuario dueño del ejemplo'
      },
      example_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del ejemplo'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción opcional'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo/inactivo'
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
    }, {
      comment: 'Tabla de ejemplos',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // Índices
    await queryInterface.addIndex('example', ['id_user_profile'], {
      name: 'idx_example_user_profile'
    });

    await queryInterface.addIndex('example', ['is_active'], {
      name: 'idx_example_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('example');
  }
};
```

### 1.2 Ejecutar Migration

```bash
# Dentro del container de Docker
docker exec -it gympoint-backend npm run migrate

# O si usas docker-compose
docker-compose exec backend npm run migrate
```

---

## Backend - Parte 2: Modelo Sequelize

### 2.1 Crear Modelo

📁 `backend/node/models/Example.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Example Model
 * Representa un ejemplo en el sistema
 */
const Example = sequelize.define('Example', {
  id_example: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID único del ejemplo'
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profile',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Usuario dueño del ejemplo'
  },
  example_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del ejemplo'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado activo/inactivo'
  }
}, {
  tableName: 'example',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: 'Tabla de ejemplos'
});

module.exports = Example;
```

### 2.2 Agregar Asociaciones en models/index.js

📁 `backend/node/models/index.js`

```javascript
// 1. Importar el modelo al inicio del archivo
const Example = require('./Example');

// 2. Agregar asociaciones en la sección correspondiente
// UserProfile ←→ Example
UserProfile.hasMany(Example, {
  foreignKey: 'id_user_profile',
  as: 'examples'
});

Example.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// 3. Exportar el modelo
module.exports = {
  // ... otros modelos
  Example,
  // ... más modelos
};
```

⚠️ **IMPORTANTE**: Los alias (`as`) deben coincidir exactamente con los usados en las queries del repository.

---

## Backend - Parte 3: Repository Pattern

### 3.1 Crear Repository

📁 `backend/node/infra/db/repositories/example.repository.js`

```javascript
const Example = require('../../../models/Example');
const UserProfile = require('../../../models/UserProfile');
const { toExample, toExamples } = require('../mappers/example.mapper');

/**
 * Example Repository
 * Capa de acceso a datos para Example
 */

/**
 * Crear un nuevo ejemplo
 */
async function createExample(data, options = {}) {
  const example = await Example.create(data, {
    transaction: options.transaction
  });
  return toExample(example);
}

/**
 * Buscar ejemplos por usuario
 */
async function findByUser(idUserProfile, options = {}) {
  const where = { id_user_profile: idUserProfile };

  if (options.active !== undefined) {
    where.is_active = options.active;
  }

  const examples = await Example.findAll({
    where,
    include: options.includeUser ? [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile', 'name', 'lastname']
      }
    ] : [],
    order: [['created_at', 'DESC']],
    limit: options.limit,
    offset: options.offset,
    transaction: options.transaction
  });

  return toExamples(examples);
}

/**
 * Buscar ejemplo por ID
 */
async function findById(idExample, options = {}) {
  const example = await Example.findByPk(idExample, {
    include: options.includeUser ? [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile', 'name', 'lastname']
      }
    ] : [],
    transaction: options.transaction
  });

  return toExample(example);
}

/**
 * Actualizar ejemplo
 */
async function updateExample(idExample, data, options = {}) {
  const [updated] = await Example.update(data, {
    where: { id_example: idExample },
    transaction: options.transaction
  });

  if (updated === 0) return null;

  return findById(idExample, options);
}

/**
 * Eliminar ejemplo
 */
async function deleteExample(idExample, options = {}) {
  const deleted = await Example.destroy({
    where: { id_example: idExample },
    transaction: options.transaction
  });

  return deleted > 0;
}

/**
 * Contar ejemplos por usuario
 */
async function countByUser(idUserProfile, options = {}) {
  return await Example.count({
    where: {
      id_user_profile: idUserProfile,
      is_active: true
    },
    transaction: options.transaction
  });
}

module.exports = {
  createExample,
  findByUser,
  findById,
  updateExample,
  deleteExample,
  countByUser
};
```

---

## Backend - Parte 4: Mappers

### 4.1 DB Mapper

📁 `backend/node/infra/db/mappers/example.mapper.js`

```javascript
const { toPlain } = require('./utils');

/**
 * Example DB Mapper
 * Transforma instancias de Sequelize a POJOs
 */

function toExample(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_example: plain.id_example,
    id_user_profile: plain.id_user_profile,
    example_name: plain.example_name,
    description: plain.description,
    is_active: plain.is_active,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include user profile if present
  if (plain.userProfile) {
    result.userProfile = {
      id_user_profile: plain.userProfile.id_user_profile,
      name: plain.userProfile.name,
      lastname: plain.userProfile.lastname
    };
  }

  return result;
}

function toExamples(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toExample);
}

module.exports = {
  toExample,
  toExamples
};
```

### 4.2 Service Mapper

📁 `backend/node/services/mappers/example.mappers.js`

```javascript
/**
 * Example Service Mappers
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateExampleCommand,
  UpdateExampleCommand,
  DeleteExampleCommand
} = require('../commands/example.commands');

const {
  GetExampleByIdQuery,
  ListExamplesQuery,
  GetExampleCountQuery
} = require('../queries/example.queries');

// ==================== RequestDTO → Command/Query ====================

function toCreateExampleCommand(dto, idUserProfile) {
  return new CreateExampleCommand({
    idUserProfile,
    exampleName: dto.example_name || dto.exampleName,
    description: dto.description
  });
}

function toUpdateExampleCommand(idExample, dto) {
  return new UpdateExampleCommand({
    idExample,
    exampleName: dto.example_name || dto.exampleName,
    description: dto.description,
    isActive: dto.is_active ?? dto.isActive
  });
}

function toDeleteExampleCommand(idExample) {
  return new DeleteExampleCommand({ idExample });
}

function toGetExampleByIdQuery(idExample) {
  return new GetExampleByIdQuery({ idExample });
}

function toListExamplesQuery(dto, idUserProfile) {
  return new ListExamplesQuery({
    idUserProfile,
    active: dto.active,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20
  });
}

function toGetExampleCountQuery(idUserProfile) {
  return new GetExampleCountQuery({ idUserProfile });
}

// ==================== Entity → ResponseDTO ====================

function toExampleResponse(example) {
  if (!example) return null;

  return {
    id_example: example.id_example,
    id_user_profile: example.id_user_profile,
    example_name: example.example_name,
    description: example.description,
    is_active: example.is_active,
    created_at: example.created_at,
    updated_at: example.updated_at,
    userProfile: example.userProfile
  };
}

function toExamplesResponse(examples) {
  if (!examples || !Array.isArray(examples)) return [];
  return examples.map(toExampleResponse);
}

function toPaginatedExamplesResponse({ items, page, limit, total }) {
  return {
    items: toExamplesResponse(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toCreateExampleCommand,
  toUpdateExampleCommand,
  toDeleteExampleCommand,
  toGetExampleByIdQuery,
  toListExamplesQuery,
  toGetExampleCountQuery,

  // Entity → Response
  toExampleResponse,
  toExamplesResponse,
  toPaginatedExamplesResponse
};
```

---

## Backend - Parte 5: Services (CQRS)

### 5.1 Commands

📁 `backend/node/services/commands/example.commands.js`

```javascript
/**
 * Example Commands
 * Operaciones que modifican el estado
 */

class CreateExampleCommand {
  constructor({ idUserProfile, exampleName, description }) {
    this.idUserProfile = idUserProfile;
    this.exampleName = exampleName;
    this.description = description;
  }
}

class UpdateExampleCommand {
  constructor({ idExample, exampleName, description, isActive }) {
    this.idExample = idExample;
    this.exampleName = exampleName;
    this.description = description;
    this.isActive = isActive;
  }
}

class DeleteExampleCommand {
  constructor({ idExample }) {
    this.idExample = idExample;
  }
}

module.exports = {
  CreateExampleCommand,
  UpdateExampleCommand,
  DeleteExampleCommand
};
```

### 5.2 Queries

📁 `backend/node/services/queries/example.queries.js`

```javascript
/**
 * Example Queries
 * Operaciones de solo lectura
 */

class GetExampleByIdQuery {
  constructor({ idExample }) {
    this.idExample = idExample;
  }
}

class ListExamplesQuery {
  constructor({ idUserProfile, active, page = 1, limit = 20 }) {
    this.idUserProfile = idUserProfile;
    this.active = active;
    this.page = page;
    this.limit = limit;
  }
}

class GetExampleCountQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

module.exports = {
  GetExampleByIdQuery,
  ListExamplesQuery,
  GetExampleCountQuery
};
```

### 5.3 Service

📁 `backend/node/services/example-service.js`

```javascript
const exampleRepository = require('../infra/db/repositories/example.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Example Service
 * Lógica de negocio para Examples
 */

/**
 * Crear un nuevo ejemplo
 */
const createExample = async (command) => {
  const cmd = ensureCommand(command);

  // Validaciones
  if (!cmd.exampleName || cmd.exampleName.trim().length === 0) {
    throw new ValidationError('El nombre del ejemplo es requerido');
  }

  return exampleRepository.createExample({
    id_user_profile: cmd.idUserProfile,
    example_name: cmd.exampleName,
    description: cmd.description || null,
    is_active: true
  });
};

/**
 * Obtener ejemplo por ID
 */
const getExampleById = async (query) => {
  const q = ensureQuery(query);

  const example = await exampleRepository.findById(q.idExample, {
    includeUser: true
  });

  if (!example) {
    throw new NotFoundError('Ejemplo no encontrado');
  }

  return example;
};

/**
 * Listar ejemplos del usuario
 */
const listExamples = async (query) => {
  const q = ensureQuery(query);

  const offset = (q.page - 1) * q.limit;

  const examples = await exampleRepository.findByUser(q.idUserProfile, {
    active: q.active,
    limit: q.limit,
    offset,
    includeUser: false
  });

  const total = await exampleRepository.countByUser(q.idUserProfile);

  return {
    items: examples,
    page: q.page,
    limit: q.limit,
    total
  };
};

/**
 * Actualizar ejemplo
 */
const updateExample = async (command) => {
  const cmd = ensureCommand(command);

  const updateData = {};
  if (cmd.exampleName !== undefined) updateData.example_name = cmd.exampleName;
  if (cmd.description !== undefined) updateData.description = cmd.description;
  if (cmd.isActive !== undefined) updateData.is_active = cmd.isActive;

  const updated = await exampleRepository.updateExample(cmd.idExample, updateData);

  if (!updated) {
    throw new NotFoundError('Ejemplo no encontrado');
  }

  return updated;
};

/**
 * Eliminar ejemplo
 */
const deleteExample = async (command) => {
  const cmd = ensureCommand(command);

  const deleted = await exampleRepository.deleteExample(cmd.idExample);

  if (!deleted) {
    throw new NotFoundError('Ejemplo no encontrado');
  }

  return { success: true };
};

/**
 * Obtener contador de ejemplos
 */
const getExampleCount = async (query) => {
  const q = ensureQuery(query);
  return await exampleRepository.countByUser(q.idUserProfile);
};

// Helper functions
function ensureCommand(cmd) {
  if (!cmd || typeof cmd !== 'object') {
    throw new ValidationError('Comando inválido');
  }
  return cmd;
}

function ensureQuery(query) {
  if (!query || typeof query !== 'object') {
    throw new ValidationError('Query inválida');
  }
  return query;
}

module.exports = {
  createExample,
  getExampleById,
  listExamples,
  updateExample,
  deleteExample,
  getExampleCount
};
```

---

## Backend - Parte 6: Controllers

📁 `backend/node/controllers/example-controller.js`

```javascript
const exampleService = require('../services/example-service');
const exampleMappers = require('../services/mappers/example.mappers');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * POST /api/examples
 * Crear un nuevo ejemplo
 */
const createExample = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const command = exampleMappers.toCreateExampleCommand(req.body, idUserProfile);
    const example = await exampleService.createExample(command);

    res.status(201).json({
      message: 'Ejemplo creado con éxito',
      data: exampleMappers.toExampleResponse(example)
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'CREATE_EXAMPLE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/examples/me
 * Obtener ejemplos del usuario actual
 */
const getMyExamples = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = exampleMappers.toListExamplesQuery(req.query, idUserProfile);
    const result = await exampleService.listExamples(query);

    res.json({
      message: 'Ejemplos obtenidos con éxito',
      ...exampleMappers.toPaginatedExamplesResponse(result)
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_EXAMPLES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/examples/:id
 * Obtener ejemplo por ID
 */
const getExampleById = async (req, res) => {
  try {
    const query = exampleMappers.toGetExampleByIdQuery(parseInt(req.params.id));
    const example = await exampleService.getExampleById(query);

    res.json({
      message: 'Ejemplo obtenido con éxito',
      data: exampleMappers.toExampleResponse(example)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'EXAMPLE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'GET_EXAMPLE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/examples/:id
 * Actualizar ejemplo
 */
const updateExample = async (req, res) => {
  try {
    const idExample = parseInt(req.params.id);
    const command = exampleMappers.toUpdateExampleCommand(idExample, req.body);
    const example = await exampleService.updateExample(command);

    res.json({
      message: 'Ejemplo actualizado con éxito',
      data: exampleMappers.toExampleResponse(example)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'EXAMPLE_NOT_FOUND',
          message: err.message
        }
      });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'UPDATE_EXAMPLE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/examples/:id
 * Eliminar ejemplo
 */
const deleteExample = async (req, res) => {
  try {
    const command = exampleMappers.toDeleteExampleCommand(parseInt(req.params.id));
    await exampleService.deleteExample(command);

    res.json({
      message: 'Ejemplo eliminado con éxito'
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'EXAMPLE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'DELETE_EXAMPLE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/examples/me/count
 * Obtener contador de ejemplos
 */
const getMyExamplesCount = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = exampleMappers.toGetExampleCountQuery(idUserProfile);
    const count = await exampleService.getExampleCount(query);

    res.json({
      data: { count }
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_COUNT_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  createExample,
  getMyExamples,
  getExampleById,
  updateExample,
  deleteExample,
  getMyExamplesCount
};
```

---

## Backend - Parte 7: Routes

📁 `backend/node/routes/example-routes.js`

```javascript
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/example-controller');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Examples
 *   description: API de gestión de ejemplos
 */

/**
 * @swagger
 * /api/examples:
 *   post:
 *     summary: Crear un nuevo ejemplo
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExampleRequest'
 *     responses:
 *       201:
 *         description: Ejemplo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleResponse'
 */
router.post('/', authenticate, exampleController.createExample);

/**
 * @swagger
 * /api/examples/me:
 *   get:
 *     summary: Obtener ejemplos del usuario actual
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de ejemplos
 */
router.get('/me', authenticate, exampleController.getMyExamples);

/**
 * @swagger
 * /api/examples/me/count:
 *   get:
 *     summary: Obtener contador de ejemplos
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contador de ejemplos
 */
router.get('/me/count', authenticate, exampleController.getMyExamplesCount);

/**
 * @swagger
 * /api/examples/{id}:
 *   get:
 *     summary: Obtener ejemplo por ID
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ejemplo encontrado
 *       404:
 *         description: Ejemplo no encontrado
 */
router.get('/:id', authenticate, exampleController.getExampleById);

/**
 * @swagger
 * /api/examples/{id}:
 *   put:
 *     summary: Actualizar ejemplo
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExampleRequest'
 *     responses:
 *       200:
 *         description: Ejemplo actualizado
 */
router.put('/:id', authenticate, exampleController.updateExample);

/**
 * @swagger
 * /api/examples/{id}:
 *   delete:
 *     summary: Eliminar ejemplo
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ejemplo eliminado
 */
router.delete('/:id', authenticate, exampleController.deleteExample);

module.exports = router;
```

### Registrar rutas en app.js

📁 `backend/node/app.js`

```javascript
// Agregar al inicio con las otras rutas
const exampleRoutes = require('./routes/example-routes');

// Registrar la ruta
app.use('/api/examples', exampleRoutes);
```

---

## Backend - Parte 8: OpenAPI Documentation

### 8.1 Crear Schema

📁 `backend/node/docs/openapi/components/schemas/examples.yaml`

```yaml
components:
  schemas:
    Example:
      type: object
      properties:
        id_example:
          type: integer
          description: ID único del ejemplo
        id_user_profile:
          type: integer
          description: ID del usuario dueño
        example_name:
          type: string
          maxLength: 100
          description: Nombre del ejemplo
        description:
          type: string
          nullable: true
          description: Descripción opcional
        is_active:
          type: boolean
          description: Estado activo/inactivo
        created_at:
          type: string
          format: date-time
          description: Fecha de creación
        updated_at:
          type: string
          format: date-time
          description: Fecha de actualización
      required:
        - id_example
        - id_user_profile
        - example_name
        - is_active

    CreateExampleRequest:
      type: object
      additionalProperties: false
      properties:
        example_name:
          type: string
          minLength: 1
          maxLength: 100
          description: Nombre del ejemplo
        description:
          type: string
          description: Descripción opcional
      required:
        - example_name

    UpdateExampleRequest:
      type: object
      additionalProperties: false
      properties:
        example_name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
        is_active:
          type: boolean

    ExampleResponse:
      type: object
      properties:
        message:
          type: string
        data:
          $ref: '#/components/schemas/Example'
```

### 8.2 Crear Paths

📁 `backend/node/docs/openapi/paths/examples.yaml`

```yaml
paths:
  /api/examples:
    post:
      operationId: createExample
      tags:
        - Examples
      summary: Crear un nuevo ejemplo
      description: Crea un ejemplo asociado al usuario autenticado
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: ../components/schemas/examples.yaml#/components/schemas/CreateExampleRequest
      responses:
        '201':
          description: Ejemplo creado exitosamente
          content:
            application/json:
              schema:
                $ref: ../components/schemas/examples.yaml#/components/schemas/ExampleResponse
        '400':
          description: Error de validación
        '401':
          description: No autenticado

  /api/examples/me:
    get:
      operationId: getMyExamples
      tags:
        - Examples
      summary: Obtener ejemplos del usuario actual
      description: Lista todos los ejemplos del usuario autenticado
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: active
          schema:
            type: boolean
          description: Filtrar por estado activo
        - in: query
          name: page
          schema:
            type: integer
            minimum: 1
            default: 1
          description: Número de página
        - in: query
          name: limit
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: Items por página
      responses:
        '200':
          description: Lista de ejemplos
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  items:
                    type: array
                    items:
                      $ref: ../components/schemas/examples.yaml#/components/schemas/Example
                  page:
                    type: integer
                  limit:
                    type: integer
                  total:
                    type: integer
                  totalPages:
                    type: integer

  /api/examples/{id}:
    get:
      operationId: getExampleById
      tags:
        - Examples
      summary: Obtener ejemplo por ID
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: ID del ejemplo
      responses:
        '200':
          description: Ejemplo encontrado
          content:
            application/json:
              schema:
                $ref: ../components/schemas/examples.yaml#/components/schemas/ExampleResponse
        '404':
          description: Ejemplo no encontrado

    put:
      operationId: updateExample
      tags:
        - Examples
      summary: Actualizar ejemplo
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: ../components/schemas/examples.yaml#/components/schemas/UpdateExampleRequest
      responses:
        '200':
          description: Ejemplo actualizado
        '404':
          description: Ejemplo no encontrado

    delete:
      operationId: deleteExample
      tags:
        - Examples
      summary: Eliminar ejemplo
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Ejemplo eliminado
        '404':
          description: Ejemplo no encontrado
```

### 8.3 Registrar en openapi.yaml principal

📁 `backend/node/docs/openapi/openapi.yaml`

```yaml
# Agregar en la sección paths
paths:
  # ... otros paths
  $ref: './paths/examples.yaml'
```

### 8.4 Generar bundle

```bash
npm run openapi:bundle
```

⚠️ **IMPORTANTE**: Siempre ejecutar el bundle después de modificar archivos OpenAPI. El middleware de validación usa el archivo bundled.

---

## Backend - Parte 9: Testing

### 9.1 Crear Script de Testing Manual

📁 `backend/node/test-examples.sh`

```bash
#!/bin/bash

# Registrar usuario y obtener token
echo "=== Registrando usuario de prueba ==="
REGISTER_RESP=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","lastname":"Example","email":"test-example@test.com","password":"password123","birth_date":"1990-01-01"}')

TOKEN=$(echo "$REGISTER_RESP" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token obtenido: ${TOKEN:0:20}..."
echo ""

echo "=== TEST 1: POST /api/examples - Crear ejemplo ==="
CREATE_RESP=$(curl -s -X POST http://localhost:3000/api/examples \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"example_name":"Mi primer ejemplo","description":"Descripción de prueba"}')
echo "$CREATE_RESP"
ID_EXAMPLE=$(echo "$CREATE_RESP" | grep -o '"id_example":[0-9]*' | grep -o '[0-9]*')
echo "ID creado: $ID_EXAMPLE"
echo ""

echo "=== TEST 2: GET /api/examples/me - Listar ejemplos ==="
curl -s -X GET "http://localhost:3000/api/examples/me?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== TEST 3: GET /api/examples/$ID_EXAMPLE - Obtener por ID ==="
curl -s -X GET "http://localhost:3000/api/examples/$ID_EXAMPLE" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== TEST 4: PUT /api/examples/$ID_EXAMPLE - Actualizar ==="
curl -s -X PUT "http://localhost:3000/api/examples/$ID_EXAMPLE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"example_name":"Ejemplo actualizado","description":"Nueva descripción"}'
echo ""
echo ""

echo "=== TEST 5: GET /api/examples/me/count - Contador ==="
curl -s -X GET "http://localhost:3000/api/examples/me/count" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== TEST 6: DELETE /api/examples/$ID_EXAMPLE - Eliminar ==="
curl -s -X DELETE "http://localhost:3000/api/examples/$ID_EXAMPLE" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== TESTS COMPLETADOS ==="
```

### 9.2 Ejecutar tests

```bash
chmod +x test-examples.sh
./test-examples.sh
```

### 9.3 Verificar Resultados Esperados

✅ **TEST 1**: Debería crear el ejemplo y devolver status 201 con los datos
✅ **TEST 2**: Debería listar los ejemplos con paginación
✅ **TEST 3**: Debería obtener el ejemplo específico por ID
✅ **TEST 4**: Debería actualizar el ejemplo y devolver datos actualizados
✅ **TEST 5**: Debería devolver el contador de ejemplos
✅ **TEST 6**: Debería eliminar el ejemplo y devolver success

---

## Frontend - Parte 1: Domain Layer

### 1.1 Crear Entity

📁 `frontend/gympoint-mobile/src/features/examples/domain/entities/Example.ts`

```typescript
/**
 * Example Entity - Dominio
 * Representa un ejemplo en el sistema
 */
export interface Example {
  id_example: number;
  id_user_profile: number;
  example_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

/**
 * Create Example Request
 */
export interface CreateExampleRequest {
  example_name: string;
  description?: string;
}

/**
 * Update Example Request
 */
export interface UpdateExampleRequest {
  example_name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Example with user info
 */
export interface ExampleWithUser extends Example {
  userProfile?: {
    id_user_profile: number;
    name: string;
    lastname: string;
  };
}
```

### 1.2 Crear Repository Interface

📁 `frontend/gympoint-mobile/src/features/examples/domain/repositories/ExampleRepository.ts`

```typescript
import { Example, CreateExampleRequest, UpdateExampleRequest } from '../entities/Example';

/**
 * Example Repository Interface
 * Define las operaciones disponibles para Examples
 */
export interface ExampleRepository {
  /**
   * Crear un nuevo ejemplo
   * POST /api/examples
   */
  create(request: CreateExampleRequest): Promise<Example>;

  /**
   * Obtener ejemplos del usuario actual
   * GET /api/examples/me
   */
  getMyExamples(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Example[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;

  /**
   * Obtener ejemplo por ID
   * GET /api/examples/:id
   */
  getById(id: number): Promise<Example>;

  /**
   * Actualizar ejemplo
   * PUT /api/examples/:id
   */
  update(id: number, request: UpdateExampleRequest): Promise<Example>;

  /**
   * Eliminar ejemplo
   * DELETE /api/examples/:id
   */
  delete(id: number): Promise<void>;

  /**
   * Obtener contador de ejemplos
   * GET /api/examples/me/count
   */
  getMyCount(): Promise<number>;
}
```

### 1.3 Crear exports

📁 `frontend/gympoint-mobile/src/features/examples/domain/entities/index.ts`

```typescript
export * from './Example';
```

📁 `frontend/gympoint-mobile/src/features/examples/domain/repositories/index.ts`

```typescript
export * from './ExampleRepository';
```

📁 `frontend/gympoint-mobile/src/features/examples/domain/index.ts`

```typescript
export * from './entities';
export * from './repositories';
```

---

## Frontend - Parte 2: Data Layer

### 2.1 Crear DTOs

📁 `frontend/gympoint-mobile/src/features/examples/data/dto/ExampleDTO.ts`

```typescript
/**
 * Example DTOs - Data Transfer Objects
 * Representan la estructura de datos que viene/va a la API
 */

export interface ExampleDTO {
  id_example: number;
  id_user_profile: number;
  example_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExampleRequestDTO {
  example_name: string;
  description?: string;
}

export interface UpdateExampleRequestDTO {
  example_name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * API Response wrappers
 */
export interface ExampleApiResponse {
  message: string;
  data: ExampleDTO;
}

export interface ExamplesListApiResponse {
  message?: string;
  items: ExampleDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExampleCountApiResponse {
  data: {
    count: number;
  };
}
```

### 2.2 Crear Mappers

📁 `frontend/gympoint-mobile/src/features/examples/data/mappers/example.mapper.ts`

```typescript
import {
  Example,
  CreateExampleRequest,
  UpdateExampleRequest,
} from '../../domain/entities/Example';
import {
  ExampleDTO,
  CreateExampleRequestDTO,
  UpdateExampleRequestDTO,
} from '../dto/ExampleDTO';

/**
 * Example Mappers
 * Convierten entre DTO (API) y Entity (Domain)
 */

/**
 * Convierte ExampleDTO a Example entity
 */
export const exampleDTOToEntity = (dto: ExampleDTO): Example => {
  return {
    id_example: dto.id_example,
    id_user_profile: dto.id_user_profile,
    example_name: dto.example_name,
    description: dto.description,
    is_active: dto.is_active,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

/**
 * Convierte array de ExampleDTOs a array de Example entities
 */
export const exampleDTOsToEntities = (dtos: ExampleDTO[]): Example[] => {
  return dtos.map(exampleDTOToEntity);
};

/**
 * Convierte CreateExampleRequest a CreateExampleRequestDTO
 */
export const createExampleRequestToDTO = (
  request: CreateExampleRequest
): CreateExampleRequestDTO => {
  return {
    example_name: request.example_name,
    description: request.description,
  };
};

/**
 * Convierte UpdateExampleRequest a UpdateExampleRequestDTO
 */
export const updateExampleRequestToDTO = (
  request: UpdateExampleRequest
): UpdateExampleRequestDTO => {
  return {
    example_name: request.example_name,
    description: request.description,
    is_active: request.is_active,
  };
};

export const exampleMappers = {
  exampleDTOToEntity,
  exampleDTOsToEntities,
  createExampleRequestToDTO,
  updateExampleRequestToDTO,
};
```

### 2.3 Crear API Service

📁 `frontend/gympoint-mobile/src/features/examples/data/remote/example.api.ts`

```typescript
import { apiClient } from '@shared/http/apiClient';
import {
  ExampleApiResponse,
  ExamplesListApiResponse,
  ExampleCountApiResponse,
  CreateExampleRequestDTO,
  UpdateExampleRequestDTO,
} from '../dto/ExampleDTO';

/**
 * Example API Service
 * Maneja todas las llamadas HTTP a los endpoints de Example
 */

const BASE_PATH = '/api/examples';

export const exampleApi = {
  /**
   * POST /api/examples
   * Crear un nuevo ejemplo
   */
  create: async (request: CreateExampleRequestDTO): Promise<ExampleApiResponse> => {
    const response = await apiClient.post<ExampleApiResponse>(BASE_PATH, request);
    return response.data;
  },

  /**
   * GET /api/examples/me
   * Obtener ejemplos del usuario actual
   */
  getMyExamples: async (params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ExamplesListApiResponse> => {
    const response = await apiClient.get<ExamplesListApiResponse>(`${BASE_PATH}/me`, {
      params,
    });
    return response.data;
  },

  /**
   * GET /api/examples/:id
   * Obtener ejemplo por ID
   */
  getById: async (id: number): Promise<ExampleApiResponse> => {
    const response = await apiClient.get<ExampleApiResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * PUT /api/examples/:id
   * Actualizar ejemplo
   */
  update: async (
    id: number,
    request: UpdateExampleRequestDTO
  ): Promise<ExampleApiResponse> => {
    const response = await apiClient.put<ExampleApiResponse>(`${BASE_PATH}/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/examples/:id
   * Eliminar ejemplo
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * GET /api/examples/me/count
   * Obtener contador de ejemplos
   */
  getMyCount: async (): Promise<ExampleCountApiResponse> => {
    const response = await apiClient.get<ExampleCountApiResponse>(`${BASE_PATH}/me/count`);
    return response.data;
  },
};
```

### 2.4 Crear Repository Implementation

📁 `frontend/gympoint-mobile/src/features/examples/data/ExampleRepositoryImpl.ts`

```typescript
import { ExampleRepository } from '../domain/repositories/ExampleRepository';
import {
  Example,
  CreateExampleRequest,
  UpdateExampleRequest,
} from '../domain/entities/Example';
import { exampleApi } from './remote/example.api';
import {
  exampleMappers,
  createExampleRequestToDTO,
  updateExampleRequestToDTO,
} from './mappers/example.mapper';

/**
 * Example Repository Implementation
 * Implementa la interfaz ExampleRepository usando la API real
 */
export class ExampleRepositoryImpl implements ExampleRepository {
  async create(request: CreateExampleRequest): Promise<Example> {
    const requestDTO = createExampleRequestToDTO(request);
    const response = await exampleApi.create(requestDTO);
    return exampleMappers.exampleDTOToEntity(response.data);
  }

  async getMyExamples(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Example[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const response = await exampleApi.getMyExamples(params);
    return {
      items: exampleMappers.exampleDTOsToEntities(response.items),
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    };
  }

  async getById(id: number): Promise<Example> {
    const response = await exampleApi.getById(id);
    return exampleMappers.exampleDTOToEntity(response.data);
  }

  async update(id: number, request: UpdateExampleRequest): Promise<Example> {
    const requestDTO = updateExampleRequestToDTO(request);
    const response = await exampleApi.update(id, requestDTO);
    return exampleMappers.exampleDTOToEntity(response.data);
  }

  async delete(id: number): Promise<void> {
    await exampleApi.delete(id);
  }

  async getMyCount(): Promise<number> {
    const response = await exampleApi.getMyCount();
    return response.data.count;
  }
}

// Export singleton instance
export const exampleRepository = new ExampleRepositoryImpl();
```

### 2.5 Crear exports

📁 `frontend/gympoint-mobile/src/features/examples/data/dto/index.ts`

```typescript
export * from './ExampleDTO';
```

📁 `frontend/gympoint-mobile/src/features/examples/data/mappers/index.ts`

```typescript
export * from './example.mapper';
```

📁 `frontend/gympoint-mobile/src/features/examples/data/remote/index.ts`

```typescript
export * from './example.api';
```

📁 `frontend/gympoint-mobile/src/features/examples/data/index.ts`

```typescript
export * from './ExampleRepositoryImpl';
export * from './dto';
export * from './mappers';
export * from './remote';
```

---

## Frontend - Parte 3: Presentation Layer

### 3.1 Crear Hook Personalizado

📁 `frontend/gympoint-mobile/src/features/examples/presentation/hooks/useExamples.ts`

```typescript
import { useState, useEffect } from 'react';
import { exampleRepository } from '../../data/ExampleRepositoryImpl';
import { Example, CreateExampleRequest, UpdateExampleRequest } from '../../domain/entities/Example';

export const useExamples = () => {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExamples = async (params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await exampleRepository.getMyExamples(params);
      setExamples(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejemplos');
    } finally {
      setLoading(false);
    }
  };

  const createExample = async (request: CreateExampleRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newExample = await exampleRepository.create(request);
      setExamples((prev) => [newExample, ...prev]);
      return newExample;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear ejemplo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExample = async (id: number, request: UpdateExampleRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await exampleRepository.update(id, request);
      setExamples((prev) =>
        prev.map((ex) => (ex.id_example === id ? updated : ex))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar ejemplo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExample = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await exampleRepository.delete(id);
      setExamples((prev) => prev.filter((ex) => ex.id_example !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar ejemplo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    examples,
    loading,
    error,
    fetchExamples,
    createExample,
    updateExample,
    deleteExample,
  };
};
```

### 3.2 Crear Store (Zustand - opcional)

📁 `frontend/gympoint-mobile/src/features/examples/presentation/state/examples.store.ts`

```typescript
import { create } from 'zustand';
import { Example } from '../../domain/entities/Example';
import { exampleRepository } from '../../data/ExampleRepositoryImpl';

interface ExamplesState {
  examples: Example[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchExamples: (params?: { active?: boolean; page?: number; limit?: number }) => Promise<void>;
  setExamples: (examples: Example[]) => void;
  addExample: (example: Example) => void;
  updateExample: (id: number, example: Example) => void;
  removeExample: (id: number) => void;
  clearError: () => void;
}

export const useExamplesStore = create<ExamplesState>((set) => ({
  examples: [],
  loading: false,
  error: null,

  fetchExamples: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await exampleRepository.getMyExamples(params);
      set({ examples: response.items, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar ejemplos',
        loading: false,
      });
    }
  },

  setExamples: (examples) => set({ examples }),

  addExample: (example) =>
    set((state) => ({ examples: [example, ...state.examples] })),

  updateExample: (id, example) =>
    set((state) => ({
      examples: state.examples.map((ex) =>
        ex.id_example === id ? example : ex
      ),
    })),

  removeExample: (id) =>
    set((state) => ({
      examples: state.examples.filter((ex) => ex.id_example !== id),
    })),

  clearError: () => set({ error: null }),
}));
```

### 3.3 Crear exports

📁 `frontend/gympoint-mobile/src/features/examples/presentation/hooks/index.ts`

```typescript
export * from './useExamples';
```

📁 `frontend/gympoint-mobile/src/features/examples/presentation/state/index.ts`

```typescript
export * from './examples.store';
```

📁 `frontend/gympoint-mobile/src/features/examples/presentation/index.ts`

```typescript
export * from './hooks';
export * from './state';
```

### 3.4 Crear index principal del feature

📁 `frontend/gympoint-mobile/src/features/examples/index.ts`

```typescript
export * from './domain';
export * from './data';
export * from './presentation';
```

---

## Checklist de Integración

### ✅ Backend Checklist

- [ ] **Parte 1: Base de Datos**
  - [ ] Crear migration
  - [ ] Ejecutar migration
  - [ ] Verificar tabla en DB

- [ ] **Parte 2: Modelo**
  - [ ] Crear modelo Sequelize
  - [ ] Agregar asociaciones en models/index.js
  - [ ] Exportar modelo

- [ ] **Parte 3: Repository**
  - [ ] Crear repository con CRUD básico
  - [ ] Implementar queries específicas

- [ ] **Parte 4: Mappers**
  - [ ] Crear DB mapper (Sequelize → POJO)
  - [ ] Crear service mapper (DTO ↔ Entity)

- [ ] **Parte 5: Services**
  - [ ] Crear Commands
  - [ ] Crear Queries
  - [ ] Crear Service con lógica de negocio

- [ ] **Parte 6: Controllers**
  - [ ] Implementar endpoints CRUD
  - [ ] Manejo de errores

- [ ] **Parte 7: Routes**
  - [ ] Crear archivo de rutas
  - [ ] Registrar en app.js
  - [ ] Agregar middleware de autenticación

- [ ] **Parte 8: OpenAPI**
  - [ ] Crear schemas YAML
  - [ ] Crear paths YAML
  - [ ] Registrar en openapi.yaml principal
  - [ ] Ejecutar `npm run openapi:bundle`

- [ ] **Parte 9: Testing**
  - [ ] Crear script de testing manual
  - [ ] Ejecutar y validar todos los endpoints
  - [ ] Verificar respuestas correctas

### ✅ Frontend Checklist

- [ ] **Parte 1: Domain Layer**
  - [ ] Crear entities/interfaces
  - [ ] Crear repository interface
  - [ ] Crear exports (index.ts)

- [ ] **Parte 2: Data Layer**
  - [ ] Crear DTOs
  - [ ] Crear mappers (DTO ↔ Entity)
  - [ ] Crear API service
  - [ ] Crear repository implementation
  - [ ] Crear exports

- [ ] **Parte 3: Presentation Layer**
  - [ ] Crear hooks personalizados
  - [ ] Crear store (Zustand) si es necesario
  - [ ] Crear exports
  - [ ] Crear index principal del feature

- [ ] **Verificación Final**
  - [ ] Compilación sin errores TypeScript
  - [ ] Imports funcionando correctamente
  - [ ] Probar integración end-to-end

---

## Best Practices

### 🎯 Naming Conventions

#### Backend
- **Archivos**: `kebab-case` → `example-service.js`, `example.repository.js`
- **Clases**: `PascalCase` → `CreateExampleCommand`, `ExampleService`
- **Funciones**: `camelCase` → `createExample`, `findByUser`
- **Constantes**: `UPPER_SNAKE_CASE` → `DEFAULT_LIMIT`, `MAX_RETRIES`
- **Campos DB**: `snake_case` → `id_example`, `is_active`, `created_at`

#### Frontend
- **Archivos**: `PascalCase` para componentes/clases, `camelCase` para utilidades
  - Entities: `Example.ts`
  - Repository: `ExampleRepository.ts`
  - Hook: `useExamples.ts`
- **Interfaces/Types**: `PascalCase` → `Example`, `CreateExampleRequest`
- **Funciones**: `camelCase` → `createExample`, `fetchExamples`
- **Constantes**: `UPPER_SNAKE_CASE` → `API_BASE_URL`

### 🔒 Seguridad

1. **Validación**:
   - Siempre validar en OpenAPI schema
   - Validar en controllers
   - Validar en services

2. **Autenticación**:
   - Usar middleware `authenticate` en todas las rutas protegidas
   - Obtener `id_user_profile` de `req.user`

3. **Autorización**:
   - Verificar ownership antes de operaciones
   - Implementar checks de permisos

### 📊 Performance

1. **Queries**:
   - Usar índices en columnas frecuentemente consultadas
   - Limitar resultados con paginación
   - Evitar N+1 queries (usar `include` correctamente)

2. **Caching** (si aplica):
   - Cachear respuestas costosas
   - Invalidar cache apropiadamente

### 🧪 Testing

1. **Backend**:
   - Probar cada endpoint manualmente
   - Verificar códigos de estado HTTP
   - Validar estructura de respuestas

2. **Frontend**:
   - Probar integración con API real
   - Manejo de estados de loading/error
   - Validar transformaciones de datos

### 📝 Documentación

1. **Comentarios**:
   - JSDoc en funciones públicas
   - Comentarios explicativos en lógica compleja
   - Documentar parámetros y retornos

2. **OpenAPI**:
   - Descripción clara de cada endpoint
   - Ejemplos de request/response
   - Documentar códigos de error

3. **README**:
   - Actualizar con nuevos endpoints
   - Documentar cambios en DB schema

---

## 🎓 Ejemplo Real: Routine & UserRoutine

Para ver un ejemplo completo de integración, revisar:

### Backend
- Models: `backend/node/models/Routine.js`, `UserRoutine.js`
- Repository: `backend/node/infra/db/repositories/routine.repository.js`
- Service: `backend/node/services/routine-service.js`
- Controller: `backend/node/controllers/routine-controller.js`
- Routes: `backend/node/routes/routine-routes.js`
- OpenAPI: `backend/node/docs/openapi/paths/routines.yaml`

### Frontend
- Entities: `frontend/gympoint-mobile/src/features/routines/domain/entities/Routine.ts`
- Repository: `frontend/gympoint-mobile/src/features/routines/domain/repositories/RoutineRepository.ts`
- DTOs: `frontend/gympoint-mobile/src/features/routines/data/dto/RoutineDTO.ts`
- Mappers: `frontend/gympoint-mobile/src/features/routines/data/mappers/routine.mapper.ts`
- API: `frontend/gympoint-mobile/src/features/routines/data/remote/routine.api.ts`
- Implementation: `frontend/gympoint-mobile/src/features/routines/data/RoutineRepositoryImpl.ts`

---

## 📞 Soporte

Si tienes dudas sobre algún paso de la integración:

1. Revisa esta guía completa
2. Consulta el ejemplo de Routine/UserRoutine
3. Verifica la estructura de otros features similares
4. Revisa la documentación de OpenAPI generada

---

## 🔄 Proceso Completo en Resumen

```
1. BACKEND
   Migration → Model → Associations → Repository → Mappers → Service → Controller → Routes → OpenAPI → Testing

2. FRONTEND
   Entity → Repository Interface → DTO → Mapper → API Service → Repository Impl → Hook/Store

3. VERIFICACIÓN
   Compilación → Testing Manual → Validación End-to-End
```

---

**Última actualización**: Noviembre 2025
**Versión**: 2.0
**Autor**: Claude + Equipo GymPoint
