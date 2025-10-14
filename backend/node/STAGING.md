# Staging Setup (Fase 3.1)

Objetivo: ejecutar migraciones y seedear datos mínimos para probar el wireframe en un entorno de staging.

Contenido seed:
- 3 desafíos diarios (hoy y próximos 2 días)
- 5 rutinas plantilla (cada una con 1 ejercicio base)

Scripts disponibles:
- `npm run staging:migrate` — Ejecuta migraciones pendientes
- `npm run staging:seed` — Inserta datos mínimos de staging (idempotente)
- `npm run staging:setup` — Migraciones + seeds

## Opción A: Staging local (sin Docker)

1) Configurar `backend/node/.env.local` con tu MySQL local

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gympoint
DB_USER=root
DB_PASSWORD=***
```

2) Instalar dependencias y ejecutar setup

```
cd backend/node
npm ci
npm run staging:setup
```

## Opción B: DB en Docker, correr seeds desde host

1) Levantar solo la DB (desde raíz del repo)

```
docker compose up -d db
```

2) Exportar variables para conectar al contenedor MySQL (puerto 3308) y correr setup

PowerShell:
```
$env:DB_HOST="localhost"; $env:DB_PORT="3308"; cd backend/node; npm ci; npm run staging:setup
```

## Opción C: Todo con Docker

1) Levantar servicios
```
docker compose up -d
```

2) Ejecutar seeds dentro del contenedor backend
```
docker compose exec backend node seed/seed-staging.js
```

## Verificación rápida

- Desafíos: tabla `daily_challenge` debe tener 3 filas (fechas: hoy, +1, +2)
- Plantillas: `SELECT COUNT(*) FROM routine WHERE is_template = 1;` ≥ 5
- Swagger: http://localhost:3000/api-docs (si backend está arriba)

Notas:
- El seed es idempotente; puedes re-ejecutarlo sin duplicar datos.
- Si no existen ejercicios, el seed crea uno ("Push Ups") solo para asociar a plantillas.

