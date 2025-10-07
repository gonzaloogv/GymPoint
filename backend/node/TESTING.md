# Testing Guide - GymPoint Backend

Documentación completa sobre la suite de testing del proyecto GymPoint.

## 📊 Estado Actual de Cobertura

### Cobertura Global
- **Statements**: 51.47%
- **Branches**: 33.6%
- **Functions**: 47.32%
- **Lines**: 52.36%
- **Total Tests**: 180 tests

### Servicios con Alta Cobertura (>80%)
- ✅ `token-ledger-service`: **100%** (14 tests)
- ✅ `transaction-service`: **100%** (2 tests)
- ✅ `token-service`: **100%** (3 tests)
- ✅ `gym-schedule-service`: **100%** (4 tests)
- ✅ `frequency-service`: **97.14%** (5 tests)
- ✅ `reward-service`: **91.89%** (8 tests)
- ✅ `gym-special-schedule-service`: **88.88%** (4 tests)
- ✅ `assistance-service`: **87.03%** (5 tests)

### Servicios Prioritarios (cobertura <40%)
- ⚠️ `admin-service`: 0% - **Sin tests**
- ⚠️ `reward-stats-service`: 0% - **Sin tests**
- ⚠️ `progress-service`: 27.53%
- ⚠️ `gym-service`: 37.68%

## 🚀 Comandos de Testing

### Tests Básicos
```bash
# Ejecutar todos los tests
npm test

# Tests con reporte de cobertura
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch
```

### Tests Específicos
```bash
# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Test específico por archivo
npm test tests/token-ledger-service.test.js
```

## 📁 Estructura de Tests

```
tests/
├── integration/          # Tests de integración (E2E)
│   └── admin-rewards-stats.spec.js
├── *-service.test.js     # Tests de servicios
├── *-controller.test.js  # Tests de controladores
└── *.test.js            # Tests generales
```

## 🔧 Configuración de Jest

La configuración se encuentra en `jest.config.js`:

```javascript
{
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 29,
      functions: 45,
      lines: 50,
      statements: 49
    }
  }
}
```

## ✍️ Escribir Tests

### Ejemplo: Test de Servicio

```javascript
// tests/mi-servicio.test.js
jest.mock('../models', () => ({
  MiModelo: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}));

const miServicio = require('../services/mi-servicio');
const { MiModelo } = require('../models');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Mi Servicio', () => {
  describe('metodoEjemplo', () => {
    it('debe hacer algo esperado', async () => {
      // Arrange
      MiModelo.findAll.mockResolvedValue([{ id: 1 }]);

      // Act
      const resultado = await miServicio.metodoEjemplo();

      // Assert
      expect(resultado).toBeDefined();
      expect(MiModelo.findAll).toHaveBeenCalled();
    });
  });
});
```

### Ejemplo: Test de Controlador

```javascript
// tests/mi-controller.test.js
jest.mock('../services/mi-servicio', () => ({
  metodoEjemplo: jest.fn()
}));

const controller = require('../controllers/mi-controller');
const miServicio = require('../services/mi-servicio');

describe('Mi Controller', () => {
  it('debe retornar 200 con datos', async () => {
    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    miServicio.metodoEjemplo.mockResolvedValue({ data: 'test' });

    await controller.handlerEjemplo(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ data: 'test' });
  });
});
```

## 🎯 Mejores Prácticas

### 1. Usar Mocks Apropiadamente
- Mockea dependencias externas (DB, APIs)
- No mockees el módulo que estás testeando
- Usa `jest.clearAllMocks()` en `beforeEach()`

### 2. Estructura AAA (Arrange-Act-Assert)
```javascript
it('debe hacer algo', async () => {
  // Arrange: Preparar datos y mocks
  const mockData = { id: 1 };

  // Act: Ejecutar la función
  const result = await funcion(mockData);

  // Assert: Verificar resultados
  expect(result).toBe(expected);
});
```

### 3. Tests Descriptivos
```javascript
// ❌ Malo
it('test 1', () => { ... });

// ✅ Bueno
it('debe retornar error cuando el usuario no existe', () => { ... });
```

### 4. Un Assert por Test (cuando sea posible)
```javascript
// ✅ Bueno - enfoque específico
it('debe retornar status 200', () => {
  expect(response.status).toBe(200);
});

it('debe retornar los datos correctos', () => {
  expect(response.data).toEqual(expected);
});
```

## 📈 Roadmap de Testing

### Corto Plazo (Next Sprint)
- [ ] Tests para `admin-service` (0% → 60%)
- [ ] Tests para `reward-stats-service` (0% → 60%)
- [ ] Mejorar `progress-service` (27% → 60%)

### Mediano Plazo
- [ ] Incrementar cobertura global a 70%
- [ ] Tests E2E para flujos críticos
- [ ] Tests de performance para queries geoespaciales

### Largo Plazo
- [ ] Integración con CI/CD
- [ ] Tests de carga (k6 o Artillery)
- [ ] Mutation testing (Stryker)

## 🐛 Debugging Tests

### Ver output detallado
```bash
npm test -- --verbose
```

### Ejecutar un solo test
```bash
npm test -- -t "nombre del test"
```

### Ver cobertura de un archivo específico
```bash
npm run test:coverage -- tests/token-ledger-service.test.js
```

## 📊 Reportes de Cobertura

Los reportes se generan en el directorio `coverage/`:
- `coverage/lcov-report/index.html` - Reporte visual HTML
- `coverage/lcov.info` - Formato LCOV para CI/CD
- `coverage/coverage-final.json` - Datos en JSON

Para ver el reporte HTML:
```bash
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

## 🤝 Contribuir con Tests

1. **Antes de crear PR:**
   - Asegúrate que todos los tests pasen: `npm test`
   - Verifica que no baje la cobertura: `npm run test:coverage`
   - Agrega tests para código nuevo

2. **Estándares mínimos:**
   - Servicios nuevos: mínimo 70% cobertura
   - Controladores nuevos: mínimo 80% cobertura
   - Funciones críticas: 100% cobertura

3. **Review checklist:**
   - [ ] Tests descriptivos y claros
   - [ ] Mocks apropiados
   - [ ] Casos edge cubiertos
   - [ ] Tests no dependen del orden de ejecución

---

**Última actualización**: 2025-10-07
**Mantenido por**: Equipo GymPoint
