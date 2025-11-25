# Colección de Postman - GymPoint API

Esta carpeta contiene una colección completa de Postman para probar todos los endpoints de la API de GymPoint.

## 📋 Contenido

- **GymPoint-API-Collection.postman_collection.json**: Colección completa con más de 100 requests organizados por módulos
- **GymPoint-Local.postman_environment.json**: Variables de entorno para desarrollo local
- **GymPoint-Production.postman_environment.json**: Variables de entorno para producción

## 🚀 Cómo Usar

### 1. Importar la Colección

1. Abre Postman
2. Click en **Import** (botón superior izquierdo)
3. Selecciona el archivo `GymPoint-API-Collection.postman_collection.json`
4. La colección aparecerá en tu sidebar

### 2. Importar el Entorno

1. Click en **Import**
2. Selecciona `GymPoint-Local.postman_environment.json` (o el de producción si corresponde)
3. En el selector de entornos (esquina superior derecha), selecciona **GymPoint - Local Development**

### 3. Configurar el Entorno

Asegúrate de configurar las variables de entorno:

- `base_url`: URL base de tu API (por defecto: `http://localhost:3000`)
- `auth_token`: Se configurará automáticamente al hacer login
- `user_id`: Se configurará automáticamente al hacer login
- `gym_id`: ID de un gimnasio de prueba
- `exercise_id`: ID de un ejercicio de prueba

### 4. Ejecutar los Tests

#### Flujo Básico de Prueba:

1. **Health Check**: Verifica que el servidor esté funcionando
   ```
   20 - Health Check > Health Check
   ```

2. **Registro de Usuario**:
   ```
   01 - Authentication > Register User
   ```

3. **Login**:
   ```
   01 - Authentication > Login User
   ```
   ⚠️ **Importante**: El token se guardará automáticamente en `auth_token`

4. **Probar Endpoints Autenticados**: 
   Una vez logueado, puedes probar cualquier endpoint que requiera autenticación

## 📁 Organización de la Colección

La colección está organizada en 20 módulos:

### 1. Authentication (01)
- Register User
- Login User
- Refresh Token
- Logout

### 2. Users (02)
- Get Current User Profile
- Update Current User Profile
- Get User By ID
- List Users (Admin)
- Delete Account

### 3. Gyms (03)
- List Gyms
- Get Gym By ID
- Create Gym (Admin)
- Update Gym (Admin)
- Delete Gym (Admin)
- Get Gym Types
- Get Gym Amenities

### 4. Gym Schedules (04)
- Get Gym Schedules
- Create Gym Schedule (Admin)
- Get Special Schedules
- Create Special Schedule (Admin)

### 5. Exercises (05)
- List Exercises
- Get Exercise By ID
- Create Exercise (Admin)
- Update Exercise (Admin)
- Delete Exercise (Admin)

### 6. Routines (06)
- List My Routines
- Get Routine By ID
- Create Routine
- Update Routine
- Delete Routine

### 7. Workouts (07)
- List My Workout Sessions
- Start Workout Session
- Log Exercise Set
- Complete Workout Session
- Get Workout Statistics

### 8. Progress & Body Metrics (08)
- Get My Progress
- List Body Metrics
- Add Body Metric
- Get Exercise Progress

### 9. Challenges (09)
- List Active Challenges
- Get Challenge By ID
- Join Challenge
- Get My Challenges
- Create Challenge (Admin)

### 10. Rewards & Tokens (10)
- List Available Rewards
- Get My Tokens Balance
- Claim Reward
- Get My Claimed Rewards
- Get Token Transactions

### 11. Achievements (11)
- List Achievements
- Get My Achievements
- Get Achievement By ID

### 12. Reviews (12)
- Get Gym Reviews
- Create Gym Review
- Update My Review
- Delete My Review

### 13. Payments (13)
- Get My Gym Payments
- Create Gym Payment
- Get Payment By ID

### 14. Notifications (14)
- Get My Notifications
- Mark Notification as Read
- Mark All Notifications as Read

### 15. Streaks & Frequency (15)
- Get My Streak
- Get Frequency Status
- Update Frequency Goal

### 16. Gym Membership (16)
- Get My Gym Memberships
- Subscribe to Gym
- Get My Favorite Gyms
- Add Gym to Favorites
- Remove Gym from Favorites

### 17. Assistance (Check-in) (17)
- Check-in to Gym
- Check-out from Gym
- Get My Assistance History

### 18. Media (18)
- Upload Media
- Get Media By ID
- Delete Media

### 19. Admin (19)
- Get System Stats
- List All Users (Admin)
- Update User Role (Admin)

### 20. Health Check (20)
- Health Check
- Database Health Check

## 🧪 Tests Automatizados

Cada request incluye tests automáticos que verifican:

- ✅ Status code correcto (200, 201, 204, etc.)
- ✅ Estructura de respuesta válida
- ✅ Datos requeridos presentes
- ✅ Variables de entorno actualizadas automáticamente

Los tests se ejecutan automáticamente después de cada request. Puedes ver los resultados en la pestaña **Test Results**.

## 🔐 Autenticación

La colección usa Bearer Token Authentication. El token se obtiene automáticamente al hacer login y se guarda en la variable `auth_token`.

Para endpoints que requieren permisos de administrador:
1. Asegúrate de usar una cuenta con rol ADMIN
2. El token de admin se puede guardar en `admin_token` si quieres mantener dos sesiones

## 🏃‍♂️ Ejecutar la Colección Completa

### Opción 1: Collection Runner (UI)

1. Click derecho en la colección
2. Selecciona **Run collection**
3. Configura las opciones:
   - Selecciona el entorno correcto
   - Opcional: configura delay entre requests
   - Opcional: guarda las respuestas
4. Click en **Run GymPoint API**

### Opción 2: Newman (CLI)

Instalar Newman:
```bash
npm install -g newman
```

Ejecutar la colección:
```bash
newman run GymPoint-API-Collection.postman_collection.json \
  -e GymPoint-Local.postman_environment.json \
  --reporters cli,json,html
```

Ejecutar con reporte HTML:
```bash
newman run GymPoint-API-Collection.postman_collection.json \
  -e GymPoint-Local.postman_environment.json \
  --reporters html \
  --reporter-html-export newman-report.html
```

## 📊 Variables de Colección

Las siguientes variables se actualizan automáticamente durante la ejecución:

- `auth_token`: Token JWT después del login
- `user_id`: ID del usuario autenticado
- `gym_id`: ID del último gimnasio creado/consultado
- `routine_id`: ID de la última rutina creada
- `exercise_id`: ID del último ejercicio creado/consultado
- `workout_session_id`: ID de la última sesión de entrenamiento

## 🔄 Flujos de Prueba Recomendados

### Flujo Completo de Usuario

1. **Registro y Autenticación**
   - Register User
   - Login User

2. **Exploración de Gimnasios**
   - List Gyms
   - Get Gym By ID
   - Add Gym to Favorites

3. **Suscripción a Gimnasio**
   - Subscribe to Gym
   - Check-in to Gym

4. **Creación de Rutina**
   - List Exercises
   - Create Routine
   - Get Routine By ID

5. **Sesión de Entrenamiento**
   - Start Workout Session
   - Log Exercise Set (múltiples veces)
   - Complete Workout Session

6. **Progreso y Métricas**
   - Add Body Metric
   - Get My Progress
   - Get Exercise Progress

7. **Gamificación**
   - Get My Streak
   - List Active Challenges
   - Join Challenge
   - Get My Tokens Balance

### Flujo de Administrador

1. **Login como Admin**
   - Login User (con credenciales de admin)

2. **Gestión de Gimnasios**
   - Create Gym
   - Update Gym
   - Create Gym Schedule
   - Create Special Schedule

3. **Gestión de Ejercicios**
   - Create Exercise
   - Update Exercise

4. **Gestión de Desafíos**
   - Create Challenge

5. **Monitoreo**
   - Get System Stats
   - List All Users

## 🐛 Troubleshooting

### Error 401 - Unauthorized
- Verifica que hayas hecho login
- Verifica que la variable `auth_token` esté configurada
- El token puede haber expirado, intenta hacer login nuevamente

### Error 403 - Forbidden
- El endpoint requiere permisos de administrador
- Verifica que tu usuario tenga el rol ADMIN

### Error 404 - Not Found
- Verifica que el ID del recurso (gym_id, exercise_id, etc.) sea válido
- Algunos recursos deben ser creados antes de poder consultarlos

### Variables no se actualizan
- Verifica que los tests estén habilitados
- Revisa la consola de Postman para ver errores en los scripts de test

## 📝 Notas Adicionales

- **Rate Limiting**: La API puede tener límites de tasa. Si recibes errores 429, espera antes de hacer más requests.
- **Datos de Prueba**: Se recomienda usar datos ficticios para las pruebas.
- **Limpieza**: Después de las pruebas, puedes eliminar los datos creados usando los endpoints DELETE.
- **Documentación Completa**: Para más detalles sobre cada endpoint, consulta el archivo OpenAPI en `backend/node/docs/openapi.yaml`.

## 🤝 Contribuir

Si encuentras algún error o quieres agregar más tests:

1. Actualiza la colección en Postman
2. Exporta la colección actualizada
3. Reemplaza el archivo JSON
4. Actualiza este README si es necesario

## 📞 Soporte

Si tienes problemas con la colección:
1. Verifica que el servidor esté corriendo
2. Revisa los logs del servidor
3. Consulta la documentación de la API
4. Revisa los tests en la pestaña de resultados

---

**Última actualización**: Octubre 2025
**Versión de la API**: 1.0.0
**Compatibilidad**: Postman v10.0+, Newman v5.0+

