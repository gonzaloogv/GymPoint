# Despliegue a Producción (Fase 3.2)

Objetivos:
- Backup pre-deploy de la base de datos
- Deploy por fases (10% → 50% → 100%)
- Monitoreo: queries lentas, errores, latencia

## 1) Backup pre-deploy

Con Docker Compose (DB = servicio `db`):

```
# Dentro de la carpeta raíz del repo
mkdir -p backup
TS=$(date +"%Y%m%d_%H%M%S")
docker compose exec db mysqldump -uroot -pmitre280 gympoint > backup/gympoint_${TS}.sql
```

Windows PowerShell (equivalente):

```
New-Item -ItemType Directory -Force backup | Out-Null
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
docker compose exec db sh -lc "mysqldump -uroot -pmitre280 gympoint" | Set-Content -Path "backup/gympoint_$ts.sql"
```

Verifica tamaño del dump (> 0 bytes) y restaura en un entorno de prueba si necesitás validar.

## 2) Build + Deploy (backend + db)

```
docker compose up -d --build
```

Las migraciones se ejecutan automáticamente. Para forzarlas:

```
docker compose exec backend node migrate.js
```

## 3) Canary (10% → 50% → 100%) con Nginx (opcional)

Este ejemplo crea dos backends: `backend_stable` (imagen con versión estable) y `backend_canary` (nueva versión), y un Nginx que balancea con pesos (inicialmente 90/10). Ajustando pesos subimos a 50/50 y luego 0/100.

Pasos:

1. Taggear imágenes
```
# Tomar imagen estable actual como tag 'stable'
docker image tag project-gympoint-backend:latest project-gympoint-backend:stable
# Build nueva versión como 'canary'
docker build -t project-gympoint-backend:canary backend/node
```

2. Levantar canary stack
```
# docker compose -f deploy/docker-compose.canary.yml up -d --build
```

3. Ajustar pesos en `deploy/nginx.conf` y recargar
- 10%: `weight=9` (stable) / `weight=1` (canary)
- 50%: `weight=1` (stable) / `weight=1` (canary)
- 100%: `weight=0` (stable) / `weight=1` (canary)
```
docker compose exec proxy nginx -s reload
```

4. Promover canary a estable
- Taggear `canary` → `latest` (o `stable`) y volver a la compose normal.

Nota: En entornos con un LB cloud (ALB/NGINX Ingress) usá weighted routing del proveedor.

## 4) Monitoreo en producción

### 4.1 Latencia HTTP
- Se agregó un middleware que:
  - Añade `X-Response-Time` a cada respuesta
  - Loguea requests que superen `SLOW_HTTP_MS` (por defecto 300 ms)
- Configuración por env:
```
SLOW_HTTP_MS=300
```

### 4.2 Queries lentas (Sequelize)
- Se habilita por env y loguea queries con duración >= `SLOW_QUERY_MS` (por defecto 200 ms)
- Configuración por env:
```
SQL_BENCHMARK=1
SLOW_QUERY_MS=200
```

### 4.3 Errores
- El middleware global `errorHandler` centraliza excepciones; revisá logs del contenedor `backend`.

### 4.4 Cron de desafíos diarios
- Job programado a las 00:01 UTC que asegura el desafío del día
- Archivo: `backend/node/jobs/daily-challenge-job.js`
- Inicio automático en producción (no test) desde `index.js`

## 5) Decisiones MVP Readiness
- Campo oficial para planes: `user_profiles.subscription` (no se usa `app_tier`)
- Índice de rendimiento: `idx_assistance_duration` creado si falta (migración 20251054)
- Plantillas: disponer de ≥ 4; con el seed de staging actual hay 5 plantillas

## 6) Checklist de producción
- [ ] Backup exitoso (archivo en `backup/`)
- [ ] `docker compose up -d --build` sin errores
- [ ] Migraciones OK (`node migrate.js` no reporta pendientes)
- [ ] Health/ready OK (`/health`, `/ready`)
- [ ] Latencia avg < 200ms; sin picos sostenidos
- [ ] Sin queries > 500ms en logs
- [ ] Canary 10% estable 10–15 min
- [ ] Subir a 50% y observar
- [ ] Promover a 100%

## 7) Rollback
- Restaura imagen `project-gympoint-backend:stable` (o `latest` previo)
- Ejecuta migraciones “down” si hay scripts compatibles (Umzug)
- O, si es crítico, restaura dump: `mysql < backup/archivo.sql`
