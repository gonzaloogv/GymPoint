# Docker Troubleshooting Guide - GymPoint Backend

**Última actualización:** 2025-10-24

Esta guía documenta problemas comunes con Docker y cómo resolverlos para prevenir futuros inconvenientes.

---

## 🔥 Problema Resuelto: Loop Infinito de Reinicio

### Síntoma

El contenedor Docker entra en un ciclo infinito de reinicio:
```
gympoint-backend   Up 1 second (health: starting)
gympoint-backend   Restarting (1) 1 second ago
gympoint-backend   Up 1 second (health: starting)
gympoint-backend   Restarting (1) 1 second ago
...
```

### Causa Raíz Identificada

**Fecha:** 2025-10-24

El error ocurrió en [achievement-controller.js:148-156](../controllers/achievement-controller.js#L148-L156):

```javascript
// ❌ ANTES (Causaba el loop)
module.exports = {
  getMyAchievements,
  syncMyAchievements,
  listDefinitions,
  // getDefinitionById,  ← FALTABA EXPORTAR
  createDefinition,
  updateDefinition,
  deleteDefinition
};
```

El problema:
1. [achievement-routes.js:105](../routes/achievement-routes.js#L105) intenta usar `controller.getDefinitionById`
2. Como `getDefinitionById` no estaba exportado, resulta en `undefined`
3. Express recibe `undefined` en lugar de una función → `TypeError: argument handler must be a function`
4. Node.js se crashea con exit code 1
5. Docker reinicia automáticamente por `restart: unless-stopped` en [docker-compose.yml](../../docker-compose.yml)
6. El mismo error ocurre nuevamente → **loop infinito**

### Solución Aplicada

```javascript
// ✅ DESPUÉS (Corregido)
module.exports = {
  getMyAchievements,
  syncMyAchievements,
  listDefinitions,
  getDefinitionById,  // ← Agregado
  createDefinition,
  updateDefinition,
  deleteDefinition
};
```

**Resultado:** El servidor ahora inicia correctamente sin crashear.

---

## 🛡️ Prevención: Checklist de Desarrollo

Antes de hacer commit de cambios en routes o controllers, verifica:

### Para Controllers

```bash
# 1. Verifica que todas las funciones estén exportadas
node -e "const ctrl = require('./controllers/NOMBRE-controller'); console.log('Exported:', Object.keys(ctrl));"

# 2. Verifica que no haya undefined
node -e "const ctrl = require('./controllers/NOMBRE-controller'); Object.entries(ctrl).forEach(([k,v]) => { if(v === undefined) console.error('❌ undefined:', k); });"
```

### Para Routes

```bash
# 1. Verifica que todas las rutas carguen sin errores
node -e "try { require('./routes/NOMBRE-routes'); console.log('✅ Routes OK'); } catch(e) { console.error('❌ Error:', e.message); }"

# 2. Busca referencias a controladores
grep "controller\." routes/NOMBRE-routes.js

# 3. Verifica que cada función referenciada exista en el controlador
node -e "
const ctrl = require('./controllers/NOMBRE-controller');
const fs = require('fs');
const content = fs.readFileSync('./routes/NOMBRE-routes.js', 'utf8');
const matches = content.matchAll(/controller\.(\w+)/g);
for (const match of matches) {
  const fn = match[1];
  if (!ctrl[fn]) console.error('❌ Missing:', fn);
  else console.log('✅ Found:', fn);
}
"
```

### Test Completo Antes de Docker

```bash
# Test de inicio simulado (sin DB)
cd backend/node
NODE_ENV=test node -e "
  const express = require('express');
  const app = express();

  // Cargar todas las rutas
  const routes = [
    'achievement-routes',
    'assistance-routes',
    'gym-special-schedule-routes',
    // ... agregar todas
  ];

  for (const route of routes) {
    try {
      const router = require('./routes/' + route);
      console.log('✅', route);
    } catch (e) {
      console.error('❌', route, ':', e.message);
      process.exit(1);
    }
  }

  console.log('\\n✅ All routes loaded successfully');
"
```

---

## 🔍 Diagnóstico: Cómo Detectar el Problema

### 1. Ver Logs del Contenedor

```bash
# Ver últimas 50 líneas
docker logs gympoint-backend --tail 50

# Seguir logs en tiempo real
docker logs gympoint-backend --follow

# Ver logs con timestamps
docker logs gympoint-backend --timestamps
```

### 2. Buscar el Error Específico

```bash
# Buscar TypeError en logs
docker logs gympoint-backend 2>&1 | grep "TypeError"

# Buscar crashes
docker logs gympoint-backend 2>&1 | grep -i "error\|exception\|crash"
```

### 3. Verificar Estado del Contenedor

```bash
# Ver si está reiniciando constantemente
docker ps --filter name=gympoint-backend

# Ver cuántas veces reinició
docker inspect gympoint-backend --format='{{.RestartCount}}'

# Ver último exit code
docker inspect gympoint-backend --format='{{.State.ExitCode}}'
```

### 4. Entrar al Contenedor (si está corriendo)

```bash
# Abrir shell interactivo
docker exec -it gympoint-backend sh

# Ejecutar Node.js directamente para ver errores
docker exec -it gympoint-backend node index.js
```

---

## 🚑 Soluciones Rápidas

### Problema: Container en Loop

```bash
# 1. Detener el contenedor
docker-compose stop backend

# 2. Ver los logs completos para identificar el error
docker logs gympoint-backend --tail 100 > error.log
cat error.log

# 3. Buscar línea específica con el error
grep -n "TypeError\|ReferenceError\|at Object" error.log

# 4. Corregir el error en el código

# 5. Reconstruir y reiniciar
docker-compose up --build backend
```

### Problema: Cambios en Código No Se Reflejan

```bash
# Si hay volúmenes o caché:
docker-compose down
docker-compose build --no-cache backend
docker-compose up backend
```

### Problema: Base de Datos No Responde

```bash
# Ver estado de DB
docker-compose ps db

# Ver logs de DB
docker logs gympoint-db --tail 50

# Reiniciar solo DB
docker-compose restart db

# Wait-for-db.sh debería manejar esto, pero puedes verificar:
docker exec gympoint-db mysqladmin ping -h localhost
```

---

## 🎯 Mejores Prácticas

### 1. Usar Healthchecks Apropiados

Actualmente en [docker-compose.yml](../../docker-compose.yml):

```yaml
services:
  db:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Recomendación:** Agregar healthcheck al backend también:

```yaml
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 2. Restart Policy Inteligente

Actualmente: `restart: unless-stopped` reinicia siempre.

**Alternativa más segura:**

```yaml
  backend:
    restart: on-failure:5  # Reintentar máximo 5 veces
```

Esto evita loops infinitos y te alerta cuando algo está mal.

### 3. Graceful Shutdown

En [index.js](../index.js) ya implementado:

```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await closeServer();
});
```

Esto permite a Docker detener el contenedor limpiamente.

### 4. Logging Estructurado

**Recomendación:** Usar Winston o Pino para logs estructurados:

```javascript
// Ejemplo con Winston
const winston = require('winston');
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// En lugar de:
console.log('Server started');

// Usar:
logger.info('Server started', { port: 3000, env: process.env.NODE_ENV });
```

Esto facilita buscar errores en logs con `grep` o herramientas de logging.

---

## 📊 Monitoreo Continuo

### Script de Monitoreo

Crea `scripts/monitor-docker.sh`:

```bash
#!/bin/bash

echo "🔍 Monitoring GymPoint Backend..."

while true; do
  STATUS=$(docker ps --filter name=gympoint-backend --format "{{.Status}}")

  if [[ $STATUS == *"Restarting"* ]]; then
    echo "⚠️  Container is restarting! Dumping logs..."
    docker logs gympoint-backend --tail 100 > "crash-$(date +%Y%m%d-%H%M%S).log"
    echo "❌ Crash log saved. Stopping monitor."
    exit 1
  fi

  echo "✅ $(date): $STATUS"
  sleep 5
done
```

Uso:
```bash
chmod +x scripts/monitor-docker.sh
./scripts/monitor-docker.sh
```

### Alertas Automáticas

Si usas Docker Swarm o Kubernetes, configura alertas cuando:
- Un contenedor reinicia más de 3 veces en 5 minutos
- Un contenedor no pasa su healthcheck
- Un contenedor usa >90% CPU/memoria

---

## 🧪 Testing Before Deploy

### Pre-commit Hook

Crea `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🧪 Running pre-commit checks..."

# Test routes loading
cd backend/node
node -e "
  const routes = require('fs').readdirSync('./routes').filter(f => f.endsWith('-routes.js'));
  for (const route of routes) {
    try {
      require('./routes/' + route);
      console.log('✅', route);
    } catch (e) {
      console.error('❌', route, ':', e.message);
      process.exit(1);
    }
  }
"

if [ $? -ne 0 ]; then
  echo "❌ Route check failed. Commit aborted."
  exit 1
fi

echo "✅ All checks passed!"
```

```bash
chmod +x .git/hooks/pre-commit
```

### CI/CD Pipeline

En `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests

on:
  push:
    paths:
      - 'backend/node/**'
  pull_request:
    paths:
      - 'backend/node/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci
        working-directory: backend/node

      - name: Lint
        run: npm run lint
        working-directory: backend/node

      - name: Test routes loading
        run: |
          for route in routes/*-routes.js; do
            node -e "require('./$route'); console.log('✅ $route');"
          done
        working-directory: backend/node

      - name: Run tests
        run: npm test
        working-directory: backend/node
```

---

## 📚 Referencias

- [Docker Compose Docs - Restart Policy](https://docs.docker.com/compose/compose-file/compose-file-v3/#restart)
- [Docker Compose Docs - Healthcheck](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Process Signals](https://nodejs.org/api/process.html#process_signal_events)

---

## 🆘 Cuando Todo Falla

Si después de intentar todo el contenedor sigue crasheando:

1. **Backup de datos:**
   ```bash
   docker exec gympoint-db mysqldump -u root -p gympoint > backup.sql
   ```

2. **Limpiar todo:**
   ```bash
   docker-compose down -v
   docker system prune -a
   ```

3. **Rebuild desde cero:**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

4. **Si persiste, correr sin Docker:**
   ```bash
   cd backend/node
   npm install
   # Configurar .env con DB local
   node index.js
   ```

Esto te permitirá ver el error exacto sin la interferencia de Docker.

---

## 💡 Lecciones Aprendidas

### Del Incidente del 2025-10-24

**Problema:** `getDefinitionById` no exportado en module.exports

**Detección:** Loop infinito en Docker

**Tiempo de resolución:** ~30 minutos

**Prevención futura:**
1. ✅ Crear checklist pre-commit
2. ✅ Agregar test de carga de rutas en CI
3. ✅ Documentar en esta guía
4. ✅ Considerar lint rule para detectar funciones no exportadas

**Herramientas útiles:**
- `docker logs` para ver stack traces
- `node -e` para test rápido de requires
- `grep` para buscar referencias en código

---

**Última actualización:** 2025-10-24
**Mantenedor:** Equipo de Backend GymPoint

**Historial de incidentes resueltos:**
- 2025-10-24: Loop infinito por función no exportada en achievement-controller
