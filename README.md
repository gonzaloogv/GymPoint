# GymPoint Monorepo

Este repositorio contiene la API del backend y dos clientes frontend para la plataforma GymPoint.

## Estructura del proyecto

- **backend/node** – API REST de Express.js (consulta [`backend/node/README.md`](backend/node/README.md) para el detalle de instalación y documentación)
- **frontend/react-web** – Cliente web desarrollado con React y Vite
- **frontend/react-native** – Cliente móvil basado en Expo

## Inicio rápido

1. Clona el repositorio
    ```bash
    git clone <repo-url>
    cd GymPoint
    ```
2. Instala las dependencias y levanta el backend (ver el README del backend para las variables de entorno)
    ```bash
    cd backend/node
    npm install
    npm run dev
    ```
3. Para la aplicación web
    ```bash
    cd ../../frontend/react-web
    npm install
    npm run dev
    ```
4. Para la app de React Native (requiere Expo)
    ```bash
    cd ../react-native
    npm install
    npm start
    ```

Consulta el README del backend para más detalles sobre el entorno, pruebas y demás información.
