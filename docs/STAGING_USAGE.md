# Uso de Staging (pre‑producción)

Guía corta para levantar y usar el entorno de staging con stack Docker, canary y DB aislada.

## 1) Preparar variables

- Copia `.env.staging.backend` y reemplaza `JWT_SECRET`/`JWT_REFRESH_SECRET` con valores reales.
- Ajusta `CORS_ORIGIN` con los dominios que vayas a usar (`https://staging-api.gympoint.app`, `https://staging-admin.gympoint.app`, etc).
- Si usas Google OAuth en modo testing, mantén los Client IDs de prueba.

## 2) Construir imagen canary

```bash
docker build -t project-gympoint-backend:staging ./backend/node
```

Si tienes la imagen estable publicada, mantenla taggeada como `project-gympoint-backend:stable`. Si no existe, usa la de producción y taggéala así:

```bash
docker pull project-gympoint-backend:prod    # o tu registry
docker tag project-gympoint-backend:prod project-gympoint-backend:stable
```

## 3) Levantar el stack

```bash
docker compose -f deploy/docker-compose.staging.yml up -d
```

- Proxy HTTP: `http://localhost:4000`
- DB MySQL: `127.0.0.1:3309` (database `gympoint_staging`)

Parar el stack:
```bash
docker compose -f deploy/docker-compose.staging.yml down
```

## 4) Verificación rápida

- Backend canary: `curl http://localhost:4000/health`
- Readiness: `curl http://localhost:4000/ready`
- Proxy vivo: `curl http://localhost:4000/healthz`

## 5) Cargar datos de prueba

```bash
cat gympoint-backup.sql | mysql -h 127.0.0.1 -P 3309 -u root -pmitre280 gympoint_staging
```

O usa `create-test-user.js` apuntando a la API de staging.

## 6) Cambiar pesos estable/canary

Edita `deploy/nginx.staging.conf` (sección `upstream backend_upstream`) y ajusta `weight`. Luego recarga el proxy:

```bash
docker compose -f deploy/docker-compose.staging.yml restart proxy
```

Valores típicos:
- 90/10: `backend_stable weight=9`, `backend_canary weight=1`
- 50/50: ambos weight=1
- 0/100: `backend_stable weight=0`, `backend_canary weight=1` (o comenta el estable)

## 7) Logs y debugging

- Backend canary: `docker compose -f deploy/docker-compose.staging.yml logs -f backend_canary`
- Proxy: `docker compose -f deploy/docker-compose.staging.yml logs -f proxy`
- DB: `docker compose -f deploy/docker-compose.staging.yml exec db mysql -uroot -pmitre280`

## 8) Frontend web contra staging (opcional)

- Crea `.env.staging` en `frontend/react-web` apuntando a `http://localhost:4000` o tu dominio staging.
- Build estático y servir con cualquier servidor (o agrega un servicio `web` en el compose si lo necesitas).
