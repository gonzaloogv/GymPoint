# Despliegue Backend + MySQL en OVH (Plesk / Debian 12)

## DNS requeridos

Configura los siguientes registros **A** (o AAAA si usas IPv6) apuntando a `51.222.159.43`:

- `gympoint.app`
- `www.gympoint.app`
- `api.gympoint.app`
- `admin.gympoint.app`

## Preparación del VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker --now
mkdir -p /srv/app && cd /srv/app
git clone <URL_DEL_REPO> gympoint
cd gympoint
cp .env.example .env.production.backend
nano .env.production.backend  # Rellena valores reales (DB, JWT, etc.)
```

## Docker Compose (producción)

El archivo `deploy/docker-compose.yml` levanta MySQL + backend sin exponer puertos públicos:

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

- `db` usa `mysql:8.4`, mantiene datos en el volumen `db-data` y sólo es accesible por la red interna.
- `backend` se publica en `127.0.0.1:3000`, listo para ser proxificado por Plesk/Nginx.

Para revisar logs:

```bash
docker compose -f deploy/docker-compose.yml logs -f backend
```

## Configuración en Plesk (api.gympoint.app)

1. Añade el dominio/subdominio `api.gympoint.app`.
2. Emite un certificado Let’s Encrypt (activa renovación e incluye `www` si corresponde).
3. En “Apache & Nginx Settings” añade las directivas adicionales:

```
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_read_timeout 60s;
location / { proxy_pass http://127.0.0.1:3000; }
```

4. Habilita la redirección HTTP→HTTPS y HSTS.
5. Reinicia Nginx/Apache desde Plesk o con `plesk bin nginx --restart`.

## Notas finales

- Guarda `.env.production.backend` fuera del control de versiones.
- Actualiza `DB_PASSWORD`, `JWT_SECRET` y `JWT_REFRESH_SECRET` con valores fuertes.
- Define `GOOGLE_CLIENT_IDS` con la lista de client IDs autorizados (web + android) para Google OAuth.
- Si necesitas importar datos, usa: `docker exec -i <db-container> mysql -u root -p < backup.sql`.
- Configura backups (Plesk + snapshots OVH) y monitoreo (Fail2ban, Firewall) antes de abrir producción.
