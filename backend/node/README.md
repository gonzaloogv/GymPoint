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
- Node.js >= 22.14.0
- MySQL 8.4
- npm >= 10.9.2

---

## ⚡ Instalación
```bash
git clone https://github.com/gonzaloogv/GymPoint
cd gympoint-backend
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
```bash
npm run test
```
_Frameworks sugeridos: Jest + Supertest_

---

## 📖 Documentación de la API
- Acceso Swagger: `http://localhost:3000/api-docs`
- Archivo: `/docs/swagger.yaml`

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
├── src/
│   ├── controllers/    # Lógica de rutas
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Definición de endpoints
│   ├── services/       # Lógica de negocio
│   ├── middlewares/    # Validaciones, auth
│   └── utils/          # Helpers
├── config/             # Conexión a DB y dotenv
├── docs/               # Swagger y ERD
└── index.js            # Entry point principal
```

---

## 📃 Base de datos
- Motor: MySQL 8.4
- ORM: Sequelize v6.31.1
- Driver: mysql2 v3.9.2
- Diagrama ER disponible en `/docs/diagram.png`

Entidades clave: `User`, `Gym`, `Routine`, `Exercise`, `Streak`, `Reward`, `Transaction`, `Assistance`, etc.

---

## 🛠️ Despliegue
(Completá según usés Heroku, Vercel, Railway, Docker, etc.)

---

## 🥇 Estilo de código
- Seguir [Guía de estilos GymPoint](../GUIA%20DE%20ESTILOS%20GYMPOINT.pdf)
- Nombres descriptivos, camelCase para funciones/variables, PascalCase para modelos/componentes
- Validaciones con Joi o middlewares custom

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
- [ ] Tests automáticos de integración
- [ ] Dockerizar el backend

---
