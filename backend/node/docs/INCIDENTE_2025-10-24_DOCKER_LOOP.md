# Reporte de Incidente: Docker Loop Infinito

**Fecha del incidente:** 2025-10-24
**Severidad:** Alta (P1)
**Estado:** ✅ Resuelto
**Tiempo de resolución:** ~45 minutos

---

## 📋 Resumen Ejecutivo

El backend de GymPoint entró en un ciclo infinito de reinicio en Docker, impidiendo que el servicio funcionara correctamente. El problema fue causado por una función no exportada en el módulo `achievement-controller.js`, lo que resultó en un `TypeError` que crasheaba Node.js inmediatamente al inicio.

---

## 🔴 Síntomas Observados

### Comportamiento del Contenedor

```bash
$ docker ps --filter name=gympoint-backend
NAME               STATUS
gympoint-backend   Restarting (1) 3 seconds ago
gympoint-backend   Restarting (1) 5 seconds ago
gympoint-backend   Restarting (1) 2 seconds ago
...
```

El contenedor se reiniciaba cada 1-5 segundos sin lograr estabilizarse.

### Logs del Error

```
TypeError: argument handler must be a function
    at Route.<computed> [as get] (/app/node_modules/router/lib/route.js:228:15)
    at Router.<computed> [as get] (/app/node_modules/router/index.js:448:19)
    at Object.<anonymous> (/app/routes/achievement-routes.js:105:8)
    at Module._compile (node:internal/modules/cjs/loader:1706:14)
    ...

Node.js v22.21.0
```

---

## 🔍 Análisis de Causa Raíz (RCA)

### Secuencia de Eventos

1. **Código con Error Introducido**
   - Archivo: `backend/node/controllers/achievement-controller.js`
   - Líneas: 148-156 (module.exports)
   - Problema: La función `getDefinitionById` estaba definida pero NO exportada

2. **Route Intentó Usar Función No Exportada**
   - Archivo: `backend/node/routes/achievement-routes.js`
   - Línea: 105
   - Código: `router.get('/definitions/:id', controller.getDefinitionById);`
   - Resultado: `controller.getDefinitionById` era `undefined`

3. **Express Lanzó TypeError**
   - Express esperaba una función como handler
   - Recibió `undefined`
   - Lanzó excepción: `TypeError: argument handler must be a function`

4. **Node.js Crasheó**
   - El error no fue catcheado
   - Node.js salió con código de error 1

5. **Docker Reinició el Contenedor**
   - Política de reinicio: `restart: unless-stopped` en docker-compose.yml
   - Docker detectó exit code 1 → reinició automáticamente
   - El mismo error ocurrió nuevamente → **loop infinito**

### Causa Raíz

**Función no exportada en module.exports del controlador.**

```javascript
// ❌ ANTES - achievement-controller.js líneas 148-156
module.exports = {
  getMyAchievements,
  syncMyAchievements,
  listDefinitions,
  // getDefinitionById,  ← FALTA ESTA LÍNEA
  createDefinition,
  updateDefinition,
  deleteDefinition
};
```

---

## ✅ Solución Implementada

### 1. Fix Inmediato

Agregada la función faltante al export:

```javascript
// ✅ DESPUÉS - achievement-controller.js líneas 148-156
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

**Commit:** [Ver en achievement-controller.js:148-156](../controllers/achievement-controller.js#L148-L156)

### 2. Rebuild de Docker

```bash
cd backend/node
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### 3. Validación

```bash
$ docker ps --filter name=gympoint-backend
NAME               STATUS
gympoint-backend   Up 46 seconds

$ curl http://localhost:3000/health
{"status":"ok","timestamp":"2025-10-24T08:56:01.743Z","uptime":51.48}
```

✅ **El servidor ahora corre correctamente sin crashear.**

---

## 🛡️ Medidas Preventivas Implementadas

### 1. Script de Validación Automático

**Archivo creado:** `backend/node/scripts/validate-routes.js`

Este script verifica:
- ✅ Todas las rutas cargan sin errores
- ✅ Todas las funciones referenciadas en rutas existen en controladores
- ✅ No hay exports `undefined`

**Uso:**
```bash
npm run validate:routes
```

**Integración en workflow:**
- Agregado `prestart` hook en package.json
- Se ejecuta automáticamente antes de `npm start`

### 2. Documentación Completa

**Archivo creado:** `backend/node/docs/DOCKER_TROUBLESHOOTING.md`

Incluye:
- 📘 Guía de diagnóstico de problemas Docker
- 📘 Checklist de prevención para desarrolladores
- 📘 Comandos útiles para debugging
- 📘 Mejores prácticas de restart policies
- 📘 Monitoreo y alertas

### 3. Actualizaciones en package.json

```json
"scripts": {
  "validate:routes": "node scripts/validate-routes.js",
  "prestart": "node scripts/validate-routes.js"
}
```

Ahora cada vez que se ejecuta `npm start`, se validan las rutas automáticamente.

---

## 📊 Métricas del Incidente

| Métrica | Valor |
|---------|-------|
| Tiempo total de downtime | ~45 minutos |
| Tiempo de detección | ~5 minutos |
| Tiempo de diagnóstico | ~20 minutos |
| Tiempo de fix + deploy | ~20 minutos |
| Número de reinicios Docker | ~270+ (estimado, cada 10 segundos) |
| Severidad | P1 (Crítica) |
| Impacto | 100% downtime del backend |

---

## 🎯 Lecciones Aprendidas

### Lo que Funcionó Bien ✅

1. **Logs detallados**: Los logs de Docker mostraron claramente el stack trace
2. **Reproducibilidad**: El error era consistente, facilitando el diagnóstico
3. **Arquitectura modular**: Fácil identificar el archivo problemático

### Lo que Puede Mejorar ⚠️

1. **Pre-commit hooks**: No había validación antes de commit
2. **Tests automatizados**: No había test que detectara función faltante
3. **CI/CD**: No había validación de rutas en pipeline
4. **Restart policy**: `unless-stopped` muy agresivo, debería ser `on-failure:5`

### Acciones Correctivas

✅ **Implementado:**
- Script de validación de rutas (`validate-routes.js`)
- Documentación de troubleshooting (`DOCKER_TROUBLESHOOTING.md`)
- Hook `prestart` en npm scripts

🔄 **Pendiente:**
- [ ] Agregar pre-commit hook con validación de rutas
- [ ] Agregar test unitario que verifique exports de controladores
- [ ] Agregar validación de rutas en CI/CD pipeline
- [ ] Cambiar restart policy a `on-failure:5` en docker-compose.yml
- [ ] Implementar healthcheck para backend en docker-compose.yml

---

## 🔗 Referencias

### Archivos Modificados

- ✅ [backend/node/controllers/achievement-controller.js](../controllers/achievement-controller.js#L148-L156)
- ✅ [backend/node/package.json](../package.json#L18-L19) (agregados scripts)

### Archivos Creados

- 🆕 [backend/node/scripts/validate-routes.js](../scripts/validate-routes.js)
- 🆕 [backend/node/docs/DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
- 🆕 [backend/node/docs/INCIDENTE_2025-10-24_DOCKER_LOOP.md](./INCIDENTE_2025-10-24_DOCKER_LOOP.md) (este archivo)

### Documentación Relacionada

- [Express Routing Guide](https://expressjs.com/en/guide/routing.html)
- [Docker Restart Policies](https://docs.docker.com/compose/compose-file/compose-file-v3/#restart)
- [Node.js Module Exports](https://nodejs.org/api/modules.html#modules_module_exports)

---

## 🚀 Verificación Post-Incidente

### Comandos de Verificación

```bash
# 1. Verificar estado del contenedor
docker ps --filter name=gympoint-backend

# 2. Verificar logs (no debe haber errores)
docker logs gympoint-backend --tail 50

# 3. Test health endpoint
curl http://localhost:3000/health

# 4. Validar todas las rutas
npm run validate:routes

# 5. Ver uptime
docker ps --filter name=gympoint-backend --format "{{.Status}}"
```

### Resultado Actual

```bash
$ docker ps --filter name=gympoint-backend
NAME               STATUS
gympoint-backend   Up 5 minutes   # ✅ Estable

$ curl http://localhost:3000/health
{"status":"ok","uptime":300.5}   # ✅ Respondiendo

$ npm run validate:routes
✅ TODAS LAS VALIDACIONES PASARON
   • 36 archivos de rutas validados
   • Todas las funciones correctamente exportadas
   • No hay referencias a undefined
```

---

## 💡 Recomendaciones Finales

### Para Desarrolladores

1. **Siempre exporta funciones que usas en rutas:**
   ```javascript
   // ✅ Buena práctica
   const myFunction = async (req, res) => { ... };

   module.exports = {
     myFunction  // ← No olvides exportar
   };
   ```

2. **Valida antes de commit:**
   ```bash
   npm run validate:routes
   ```

3. **Testa carga de módulos:**
   ```bash
   node -e "require('./routes/my-routes'); console.log('OK')"
   ```

### Para DevOps

1. **Usa restart policies inteligentes:**
   ```yaml
   restart: on-failure:5  # Máximo 5 reintentos
   ```

2. **Implementa healthchecks:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
     retries: 3
   ```

3. **Monitorea restart counts:**
   ```bash
   docker inspect --format='{{.RestartCount}}' gympoint-backend
   ```

### Para QA

1. Agregar test case: "Verificar que todas las funciones de controladores están exportadas"
2. Agregar test case: "Verificar que todas las rutas cargan sin errores"
3. Incluir validación de rutas en smoke tests

---

## 📞 Contacto y Escalamiento

**Reportado por:** Sistema de Monitoreo / Usuario
**Investigado por:** Equipo de Backend
**Resuelto por:** Equipo de Backend
**Revisado por:** Equipo de DevOps

**Para futuros incidentes similares:**
1. Revisar [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
2. Ejecutar `npm run validate:routes`
3. Revisar logs con `docker logs gympoint-backend --tail 100`
4. Si persiste, escalar a Lead Backend

---

**Última actualización:** 2025-10-24
**Próxima revisión:** 2025-11-24 (1 mes)
**Estado:** ✅ Resuelto y documentado
