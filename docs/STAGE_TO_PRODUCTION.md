# Pasar de Staging a Producción

Checklist para promover una build probada en staging hacia producción minimizando riesgo.

## 1) Congelar y etiquetar la build

- Verifica staging en 90/10 o 50/50 sin errores críticos.
- Etiqueta la imagen aprobada:
  ```bash
  docker tag project-gympoint-backend:staging project-gympoint-backend:stable
  docker push <registry>/project-gympoint-backend:stable   # si usas registry
  ```
- Opcional: conserva la etiqueta de la versión (`project-gympoint-backend:vX.Y.Z`).

## 2) Preparar variables de producción

- Rellena `.env.production.backend` con secretos de producción (no reutilices los de staging).
- Ajusta `CORS_ORIGIN` a dominios finales (`https://api.gympoint.app`, `https://admin.gympoint.app`, etc).
- Si usas OAuth, confirma que los Client IDs tengan los redirect URIs de producción.

## 3) Desplegar producción

```bash
docker compose -f deploy/docker-compose.yml pull   # si usas registry
docker compose -f deploy/docker-compose.yml up -d --build
```

Health checks:
- API: `curl http://localhost:3000/health`
- Readiness: `curl http://localhost:3000/ready`

## 4) Canary en producción (opcional)

Si quieres repetir el canary en prod, usa `deploy/docker-compose.canary.yml`:
- Taggea la build antigua como `stable`.
- Taggea la build nueva como `canary`.
- Ajusta pesos en `deploy/nginx.conf` y reinicia el proxy.

## 5) Migraciones y datos

- Verifica que las migraciones corran solas al boot (ya configurado).
- Haz backup de la base productiva antes de subir cambios mayores.
- No reutilices la DB de staging; usa snapshot o migraciones limpias.

## 6) Post‑deploy

- Monitorear logs (`backend`, `proxy`) y latencias (`SLOW_HTTP_MS`, `SLOW_QUERY_MS`).
- Validar login local/Google, asistencia, canje de recompensas y rutinas.
- Si todo está OK, fija el peso 100/0 a la versión estable definitiva y elimina el contenedor canary.
