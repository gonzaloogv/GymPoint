# Uso en Desarrollo (local)

Pasos rápidos para levantar GymPoint en modo desarrollo (backend, web y móvil).

## 1) Backend (Node)
- Ir a `backend/node`.
- Variables: copia `.env.example` a `.env` y ajusta:
  - `DB_HOST=localhost`, `DB_PORT=3306`, `DB_NAME=gympoint`, `DB_USER=root`, `DB_PASSWORD=<tu_pwd>`.
  - Genera `JWT_SECRET` y `JWT_REFRESH_SECRET` (32+ chars).
  - `CORS_ORIGIN=http://localhost:5173,http://localhost:19006`.
- Instalar dependencias: `npm install`.
- DB: usa MySQL local o Docker (ej.: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=<pwd> -e MYSQL_DATABASE=gympoint mysql:8.4`).
- Ejecutar con recarga: `npm run dev`.
- Health: `http://localhost:3000/health` y `/ready`.

## 2) Frontend Web (React + Vite)
- Ir a `frontend/react-web`.
- Variables: copia `.env.example` a `.env` y pon `VITE_API_URL=http://localhost:3000`.
- Instalar: `npm install`.
- Correr: `npm run dev` (sirve en `http://localhost:5173`).

## 3) Mobile (Expo)
- Ir a `frontend/react-native`.
- Variables: copia `.env.example` a `.env` y pon `API_URL=http://<IP_local>:3000` (no uses `localhost` para dispositivos).
- Instalar: `npm install`.
- Correr: `npm start` (o `expo start`).
- Si pruebas en dispositivo físico, usa la IP de tu máquina y asegúrate que esté en la misma red.

## 4) Datos de prueba
- Importar dump: `cat gympoint-backup.sql | mysql -h 127.0.0.1 -P 3306 -u root -p gympoint`.
- Crear usuarios de prueba: `node create-test-user.js` (apunta a tu API dev).

## 5) Testing
- Backend: `npm test` (en `backend/node`).
- Filtrar: `npm test -- auth-controller.test.js`.
- Cobertura: `npm test -- --coverage`.

## 6) Tips rápidos
- Si hay error de CORS, revisa `CORS_ORIGIN` en `.env` del backend.
- Si Expo no conecta, revisa que la API use IP accesible y que el puerto 3000 esté abierto.
- Para limpiar la DB rápida: `DROP DATABASE gympoint; CREATE DATABASE gympoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` y relanza el backend para que aplique migraciones.
