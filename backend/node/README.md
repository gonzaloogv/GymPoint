# GymPoint Backend

Backend del proyecto GymPoint, una plataforma para la gestión de gimnasios, usuarios, rutinas, asistencia, rachas y recompensas.

---

## 🚀 Descripción

GymPoint permite a los usuarios:

- Registrar asistencia diaria con validación por GPS
- Mantener rachas activas de entrenamiento
- Obtener y canjear tokens por recompensas
- Gestionar rutinas personalizadas y progreso físico

Los administradores pueden gestionar gimnasios, usuarios, recompensas y contenido general.

---

## ⚙️ Requisitos del sistema

- Node.js v22.14.0
- npm v10.9.2
- MySQL 8.4
- (Opcional) Docker y Docker Compose

---

## ⚡ Instalación

```bash
git clone https://github.com/gonzaloogv/GymPoint.git
cd GymPoint/backend/node
npm install
```

---

## 📞 Variables de entorno

Crea un archivo `.env` en la raíz basado en `.env.example` y completa los valores:

```env
# Base de datos
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=pass
DB_NAME=gympoint
DB_PORT=3306

# Servidor
PORT=3000

# JWT
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_refresh

# Google
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## ▶️ Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

### Con Docker

```bash
# Construir la imagen
docker build -t gympoint-backend .
# Ejecutar con las variables de entorno de .env
docker run --env-file .env -p 3000:3000 gympoint-backend
```

También puedes iniciar todo el proyecto usando `docker compose up` desde la raíz del repositorio.

---

## 🔐 Autenticación con Access y Refresh Token

El sistema implementa autenticación basada en **JWT con doble token**:

| Token          | Duración   | Uso                                                 |
| -------------- | ---------- | --------------------------------------------------- |
| `accessToken`  | 15 minutos | Acceso a rutas protegidas (`Authorization: Bearer`) |
| `refreshToken` | 30 días    | Renovar `accessToken` vía `/auth/refresh-token`     |

### Flujo de sesion

1. Al iniciar sesión, se devuelven `accessToken` y `refreshToken`.
2. El `accessToken` se envía en headers para acceder a rutas protegidas.
3. Si el `accessToken` expira, el cliente usa el `refreshToken` para obtener uno nuevo.
4. El `refreshToken` se guarda en la base de datos y puede ser revocado (logout).
5. Si expira o es revocado, el usuario debe volver a iniciar sesión.

### Logout

Para cerrar sesión de forma segura, se debe enviar el `refreshToken` a:

```http
POST /api/auth/logout
{
  "token": "<refreshToken>"
}
```

El backend lo marca como revocado.

---

## 📖 Documentación de la API

Swagger:  
📍 `http://localhost:3000/api-docs`

### Endpoints comunes

| Método | Ruta                    | Descripción                           |
| ------ | ----------------------- | ------------------------------------- |
| POST   | /api/auth/register      | Registro de usuario con meta semanal  |
| POST   | /api/auth/login         | Iniciar sesión con email y contraseña |
| POST   | /api/auth/google        | Login con Google OAuth2               |
| POST   | /api/auth/refresh-token | Obtener nuevo access token            |
| POST   | /api/auth/logout        | Revocar refresh token                 |
| GET    | /api/users/me           | Obtener perfil del usuario            |

---

## 📂 Estructura del proyecto

```
backend/
└── node/
    ├── controllers/    # Lógica de rutas
    ├── models/         # Modelos Sequelize
    ├── routes/         # Definición de endpoints
    ├── services/       # Lógica de negocio
    ├── middlewares/    # Validaciones, auth
    ├── utils/          # JWT, helpers
    ├── config/         # Conexión a DB y variables
    └── index.js        # Entry point principal
```

---

## 📃 Base de datos

- MySQL 8.4
- ORM: Sequelize
- Diagramas en `/docs/diagram.png`

Entidades clave: `User`, `Gym`, `Routine`, `Exercise`, `Streak`, `RefreshToken`, `Reward`, `Assistance`, `Transaction`.

### Cargar `gympoint_db.sql`

1. Crea una base de datos MySQL con el nombre indicado en `DB_NAME` y con un
   usuario que coincida con `DB_USER` y `DB_PASSWORD`.
2. Importa el archivo de dump ubicado en `../db/gympoint_db.sql`:

   ```bash
   mysql -u $DB_USER -p $DB_NAME < ../db/gympoint_db.sql
   ```

Este proyecto **no utiliza migraciones** automáticas de Sequelize. Toda la
estructura inicial se define en el dump anterior y debe cargarse manualmente.

---

## 🧪 Testing

El backend cuenta con pruebas unitarias implementadas con Jest.
Para ejecutarlas se usa:

```bash
npm test
```

Estas pruebas cubren los servicios y controladores principales.

---

## 🛠️ Despliegue

_Aún no implementado_  
Sugerencia: usar Railway, Render, Vercel (backend), o Docker.

---

## 📄 Estilo de código

- camelCase para funciones/variables
- PascalCase para modelos y clases

---

## 🥇 Dependencias exactas

```
Node.js v22.14.0
npm v10.9.2

"bcryptjs": "^3.0.2"
"dotenv": "^16.5.0"
"express": "^5.1.0"
"google-auth-library": "^9.15.1"
"jsonwebtoken": "^9.0.2"
"mysql2": "^3.14.1"
"sequelize": "^6.37.7"
"swagger-jsdoc": "^6.2.8"
"swagger-ui-express": "^5.0.1"
```

---

## 👥 Autores y colaboradores

- Gonzalo Gomez Vignudo – Backend & Tech Lead
- Nahuel Noir – PM & Frontend
- Cristian Benetti – FullStack & Marketing
- Santiago Mandagaran – QA & Frontend
- Nuria Gonzalez – QA & Frontend

---

## 🎯 To Do

- [ ] Dockerizar backend completo
- [ ] Validaciones centralizadas con Joi o middlewares personalizados
