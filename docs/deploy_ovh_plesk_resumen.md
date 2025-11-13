# Resumen de Despliegue (OVH + Plesk)

## 1. DNS

Apunta todos los registros **A** a `51.222.159.43`:

- `gympoint.app`
- `www.gympoint.app`
- `api.gympoint.app`
- `admin.gympoint.app`

## 2. Preparar el VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker --now
mkdir -p /srv/app && cd /srv/app
git clone <URL_DEL_REPO> gympoint
cd gympoint
cp .env.example .env.production.backend
nano .env.production.backend  # completar DB/JWT/CORS, etc.
```

## 3. Backend + MySQL

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

- MySQL queda aislado en la red interna; el backend escucha en `127.0.0.1:3000`.
- Revisa logs con `docker compose -f deploy/docker-compose.yml logs -f backend`.

## 4. Plesk

1. **api.gympoint.app**  
   - Certificado Let’s Encrypt (+ redirección HTTPS).  
   - En “Apache & Nginx Settings” agrega:
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

2. **Landing (`gympoint.app` + `www.gympoint.app`)**  
   - Hosting estático con el contenido de `frontend/gympoint-landing/dist`.  
   - SSL Let’s Encrypt y redirección HTTPS.

3. **Admin (`admin.gympoint.app`)**  
   - Hosting estático con `frontend/gympoint-admin/dist`.  
   - SSL Let’s Encrypt y redirección HTTPS.

## 5. Builds Frontend

```bash
# Landing
cd frontend/gympoint-landing
npm install
npm run build

# Admin
cd ../gympoint-admin
npm install
npm run build
```

Sube cada `dist/` a su dominio en Plesk (File Manager, SFTP o Git Deploy).

## 6. APK con Expo / EAS

```bash
cd frontend/gympoint-mobile
npx expo login
npx eas login
cp .env.production .env  # o usa secrets
npx eas build -p android --profile production
```

Descarga el APK generado y distribúyelo al equipo de QA/producción.

## 7. Checklist final

- `.env.production.backend` completado y fuera del repositorio.
- Docker Compose en ejecución (`docker ps` → backend + db).
- Certificados SSL activos en los 4 dominios.
- Landing/Admin servidos como sitios estáticos y apuntando a `https://api.gympoint.app`.
- WebSockets funcionando (ver consola admin o `wscat`).
- APK generado con URLs HTTPS.
