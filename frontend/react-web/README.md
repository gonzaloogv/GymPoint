# React + TypeScript + Vite

Este proyecto de React y TypeScript proporciona la interfaz web de la plataforma GymPoint. Permite a los usuarios iniciar sesion, explorar gimnasios cercanos e interactuar con la API del backend.

## Instalacion

```bash
npm install
npm run dev
```

El servidor de desarrollo usa Vite y se inicia en `http://localhost:5173`. Las solicitudes que comienzan con `/api` se redirigen automaticamente a `http://localhost:3000`, asi que inicia el backend Node ubicado en `../backend/node` antes de ejecutar la aplicacion web.

## Conexion con el backend

Toda la informacion se obtiene del backend de GymPoint, que expone una API REST. La configuracion de proxy en `vite.config.ts` maneja el entorno local. Para despliegues en produccion, configura la URL base de la API para que apunte a tu instancia del backend.