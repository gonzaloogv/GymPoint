# 🚀 Quick Start - Mejoras GymPoint

## 📦 Instalación Inicial

```bash
cd backend/node

# Ya instaladas las dependencias:
# - openapi-typescript
# - winston
# - winston-daily-rotate-file
# - supertest
# - husky
# - lint-staged
```

## ⚡ Comandos Esenciales

### OpenAPI y Tipos

```bash
# Sincronizar todo (bundle + tipos)
npm run openapi:sync

# Solo bundle
npm run openapi:bundle

# Solo tipos TypeScript
npm run openapi:generate-types

# Validar sincronización
npm run openapi:validate

# Validar con Redocly
npm run openapi:lint
```

### Schemas

```bash
# Herramienta interactiva
npm run schema:sync-helper

# Solo reporte
npm run schema:report
```

### Tests

```bash
# Todos los tests
npm test

# Solo integración
npm run test:integration

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Desarrollo

```bash
# Iniciar servidor
npm start

# Modo desarrollo (con nodemon)
npm run dev

# Linter
npm run lint
```

## 🔄 Flujo de Trabajo

### 1. Modificar Schema OpenAPI

```bash
# Editar schema modular
vim docs/openapi/components/schemas/gyms.yaml

# Sincronizar
npm run openapi:sync

# Validar
npm run openapi:validate
```

### 2. Implementar Cambios

**Backend (Mapper)**:
```javascript
// services/mappers/gym.mappers.js
function toGymResponse(gym) {
  return {
    id_gym: gym.id_gym,
    name: gym.name,
    new_field: gym.newField  // Nuevo campo
  };
}
```

**Frontend (Usar tipos generados)**:
```typescript
// Importar tipos generados
import type { components } from '@/data/dto/generated/api.types';

type GymResponse = components['schemas']['GymResponse'];

// TypeScript ahora conoce todos los campos
function useGym(id: number): GymResponse {
  // ...
}
```

### 3. Logging

```javascript
const logger = require('../config/logger');

// En lugar de console.log
logger.info('Gym created', {
  gymId: gym.id_gym,
  userId: req.account.id_account,
  name: gym.name
});

// Errores
logger.logError(error, {
  context: 'createGym',
  userId: req.account.id_account
});
```

### 4. Tests

```javascript
// tests/integration/gyms.integration.test.js
describe('POST /api/gyms', () => {
  it('debe crear un gimnasio', async () => {
    const response = await request(app)
      .post('/api/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymData);
    
    expect(response.status).toBe(201);
  });
});
```

### 5. Commit

```bash
git add .
git commit -m "feat: add new field to gym"
# Pre-commit hooks se ejecutan automáticamente
```

## 📊 Estructura de Archivos

```
backend/node/
├── config/
│   └── logger.js                    # ✨ Nuevo: Logger Winston
├── docs/
│   ├── CONVENTIONS.md               # ✨ Nuevo: Convenciones
│   ├── IMPROVEMENTS.md              # ✨ Nuevo: Guía de mejoras
│   ├── openapi/
│   │   └── components/schemas/      # Schemas modulares
│   └── openapi.yaml                 # Bundle generado
├── logs/                            # ✨ Nuevo: Logs rotados
│   ├── error-2025-10-25.log
│   ├── combined-2025-10-25.log
│   └── http-2025-10-25.log
├── scripts/
│   ├── validate-openapi-sync.js     # ✨ Nuevo: Validación
│   └── schema-sync-helper.js        # ✨ Nuevo: Helper interactivo
├── tests/
│   └── integration/                 # ✨ Nuevo: Tests
│       ├── gyms.integration.test.js
│       └── rewards.integration.test.js
└── .husky/                          # ✨ Nuevo: Git hooks
    └── pre-commit

frontend/gympoint-admin/
└── src/
    └── data/
        └── dto/
            └── generated/           # ✨ Nuevo: Tipos generados
                └── api.types.ts
```

## 🎯 Casos de Uso Comunes

### Agregar un nuevo campo a Gym

1. **Actualizar schema**:
```yaml
# docs/openapi/components/schemas/gyms.yaml
GymResponse:
  properties:
    # ... campos existentes
    new_field:
      type: string
      description: Nuevo campo
```

2. **Sincronizar**:
```bash
npm run openapi:sync
```

3. **Actualizar mapper backend**:
```javascript
function toGymResponse(gym) {
  return {
    // ... campos existentes
    new_field: gym.newField
  };
}
```

4. **Frontend automáticamente tiene el tipo**:
```typescript
// TypeScript ahora conoce 'new_field'
const gym: GymResponse = await fetchGym(id);
console.log(gym.new_field); // ✅ Autocompletado
```

### Debugging de un error

1. **Ver logs estructurados**:
```bash
# Logs de errores
tail -f logs/error-2025-10-25.log

# Todos los logs
tail -f logs/combined-2025-10-25.log

# Solo HTTP
tail -f logs/http-2025-10-25.log
```

2. **Buscar en logs JSON**:
```bash
# Buscar por userId
grep "userId.*123" logs/combined-2025-10-25.log

# Buscar por error específico
grep "VALIDATION_ERROR" logs/error-2025-10-25.log
```

### Verificar sincronización

```bash
# Reporte completo
npm run schema:report

# Salida:
# 🏋️  GIMNASIOS
#    ✓ Sin inconsistencias
# 🎁 RECOMPENSAS
#    ⚠️  Campos en OpenAPI pero no en mapper: image_url
```

## 🔧 Troubleshooting

### Error: "openapi.yaml desactualizado"

```bash
npm run openapi:bundle
```

### Error: "Tipos TypeScript desactualizados"

```bash
npm run openapi:generate-types
```

### Error: "Tests fallan"

```bash
# Ver detalles
npm test -- --verbose

# Ejecutar solo un test
npm test -- -t "debe crear un gimnasio"
```

### Error: "Pre-commit hook falla"

```bash
# Ver qué está fallando
git commit -m "test"

# Arreglar
npm run openapi:sync
git add .
git commit -m "test"
```

## 📚 Documentación Completa

- [CONVENTIONS.md](docs/CONVENTIONS.md) - Convenciones de desarrollo
- [IMPROVEMENTS.md](docs/IMPROVEMENTS.md) - Guía detallada de mejoras
- [MEJORAS_IMPLEMENTADAS.md](../../MEJORAS_IMPLEMENTADAS.md) - Resumen ejecutivo

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Tipos TypeScript sincronizados automáticamente
- ✅ Logging estructurado y profesional
- ✅ Tests de integración
- ✅ Validación automática
- ✅ Herramientas de debugging
- ✅ Pre-commit hooks
- ✅ Documentación completa

**¡A desarrollar con confianza!** 🚀

