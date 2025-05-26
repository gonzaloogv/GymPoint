# GymPoint Backend

Backend del proyecto GymPoint, una plataforma para la gestión de gimnasios, usuarios, rutinas, asistencia, rachas y recompensas.

---

## 🚀 Descripción
GymPoint permite a los usuarios:
- Registrar su asistencia al gimnasio mediante GPS
- Mantener rachas activas de entrenamiento
- Obtener y canjear tokens por recompensas
- Gestionar rutinas personalizadas y progreso físico

Los administradores pueden gestionar gimnasios, recompensas, usuarios y contenido general.

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
Crear un archivo `.env` en la raíz con el siguiente contenido:
```env
PORT=3000
DB_NAME=gympoint
DB_USER=root
DB_PASS=1234
DB_HOST=localhost
JWT_SECRET=unasecretaclave
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

---

## 🔬 Testing
_Aún no implementado_

Sugerencia: utilizar Jest + Supertest para testing automatizado.

---

## 📖 Documentación de la API
- Acceso Swagger: `http://localhost:3000/api-docs`

### Endpoints principales
| Método | Ruta                     | Descripción                        |
|--------|--------------------------|------------------------------------|
| GET    | /api/users               | Lista de usuarios                  |
| POST   | /api/auth/login          | Login con JWT                      |
| POST   | /api/routines            | Asignar rutina a usuario           |
| PUT    | /api/users/:id/profile   | Editar perfil del usuario          |

---

## 🔐 Autenticación
- Basada en JWT (Json Web Token)
- Agregar `Authorization: Bearer <token>` en headers para acceder a rutas protegidas

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
    ├── utils/          # Helpers
    ├── config/         # Conexión a DB y dotenv
    └── index.js        # Entry point principal
```

---

## 📃 Base de datos
- Motor: MySQL 8.4
- ORM: Sequelize v6.37.7
- Driver: mysql2 v3.14.1
- Diagrama ER disponible en `/docs/diagram.png`

Entidades clave: `User`, `Gym`, `Routine`, `Exercise`, `Streak`, `Reward`, `Transaction`, `Assistance`, etc.

---

## 🛠️ Despliegue
_Aún no implementado_

Sugerencia: agregar soporte para despliegue con Docker, Railway o plataformas similares.

---

## 🥇 Dependencias exactas utilizadas
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

## 📄 Estilo de código
- Seguir [Guía de estilos GymPoint](../GUIA%20DE%20ESTILOS%20GYMPOINT.pdf)
- Nombres descriptivos, camelCase para funciones/variables, PascalCase para modelos/componentes
- Sugerencia: incorporar validaciones con Joi u otras estrategias centralizadas

---

## 👥 Autores y colaboradores
- Gonzalo Gomez Vignudo - Backend & Tech Lead
- Nahuel Noir - PM & Frontend
- Cristian Benetti - FullStack & Marketing
- Santiago Mandagaran - QA & Frontend
- Nuria Gonzalez - QA & Frontend

---

## ℹ️ Licencia
[MIT](LICENSE)

---

## 🎡 To Do
- [ ] Documentar rutas de asistencia y rachas
- [ ] Implementar tests automáticos de integración
- [ ] Dockerizar el backend
- [ ] Incorporar validaciones centralizadas (middleware o Joi)

---
