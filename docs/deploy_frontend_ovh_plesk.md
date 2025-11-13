# Despliegue Landing + Admin en OVH/Plesk

## Variables y builds

### Landing (`frontend/gympoint-landing`)

1. Configura `.env.development` (local) y `.env.production`:
   ```ini
   # .env.development
   VITE_API_URL=http://localhost:3000

   # .env.production
   VITE_API_URL=https://api.gympoint.app
   ```
2. Build de producción:
   ```bash
   cd frontend/gympoint-landing
   npm install
   npm run build
   ```
   El resultado queda en `dist/`.

### Admin (`frontend/gympoint-admin`)

1. Configura:
   ```ini
   # .env.development
   VITE_API_URL=http://localhost:3000
   VITE_REALTIME_URL=http://localhost:3000
   VITE_REALTIME_UI=on

   # .env.production
   VITE_API_URL=https://api.gympoint.app
   VITE_REALTIME_URL=https://api.gympoint.app
   VITE_REALTIME_UI=on
   VITE_REALTIME_TRANSPORT=websocket,polling
   ```
2. Build:
   ```bash
   cd frontend/gympoint-admin
   npm install
   npm run build
   ```
   Los archivos finales viven en `dist/`.

## Plesk

1. **Certificados SSL**  
   - Para `gympoint.app`, `www.gympoint.app` y `admin.gympoint.app`, emite Let’s Encrypt con redirección HTTP→HTTPS y HSTS.

2. **Landing** (`gympoint.app` / `www.gympoint.app`)  
   - Tipo de hosting: “Hosting estático”.  
   - Sube el contenido de `frontend/gympoint-landing/dist` al directorio raíz del dominio.  
   - Activa gzip/brotli si está disponible.

3. **Admin** (`admin.gympoint.app`)  
   - Otro sitio estático apuntando a los archivos de `frontend/gympoint-admin/dist`.  
   - Habilita la compresión y caching para assets.

4. **Actualizaciones**  
   - Ante cada release, vuelve a ejecutar `npm run build` en ambas apps y reemplaza los contenidos de `dist/` en Plesk (puedes usar el File Manager o FTP/SFTP).

5. **Conexión con backend**  
   - Ambos frontends consumen la API en `https://api.gympoint.app`. Valida que el backend ya esté accesible y que CORS permita estos orígenes (se definió en `.env.production.backend`).
