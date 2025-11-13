# 🔧 Troubleshooting - Problemas Comunes

## Problemas con el Endpoint de Registro

### ❌ Error: "INVALID_DATA" o campos faltantes

**Síntoma**: Al ejecutar el endpoint de registro recibes un error 400 con mensaje sobre datos inválidos o campos requeridos.

**Causa**: El backend espera campos específicos que deben estar presentes en el body del request.

**Solución**: Asegúrate de enviar todos estos campos requeridos:

```json
{
  "name": "Usuario",           // ✅ Requerido
  "lastname": "Test",           // ✅ Requerido
  "email": "test@example.com",  // ✅ Requerido
  "password": "Test123456!",    // ✅ Requerido
  "gender": "M",                // ✅ Requerido (M o F)
  "locality": "Buenos Aires",   // ✅ Requerido
  "frequency_goal": 3,          // ✅ Requerido (número entero)
  "birth_date": "1990-01-15",   // ⚠️ Opcional (formato: YYYY-MM-DD)
  "role": "USER"                // ⚠️ Opcional (USER, PREMIUM, ADMIN)
}
```

**Campos que NO debes usar**:
- ❌ `full_name` (usa `name` y `lastname` por separado)
- ❌ `username` (no está en el modelo actual)
- ❌ `date_of_birth` (usa `birth_date`)

### ❌ Error: "EMAIL_ALREADY_EXISTS"

**Síntoma**: Error 409 indicando que el email ya está registrado.

**Causa**: Ya existe un usuario con ese email en la base de datos.

**Solución**:
1. Usa un email diferente
2. O elimina el usuario existente desde la base de datos:
```sql
DELETE FROM account WHERE email = 'test@example.com';
```

### ❌ Error: "notNull Violation: Streak.id_user_profile cannot be null"

**Síntoma**: Error 400 con mensaje "REGISTER_FAILED" y detalles sobre violaciones de NOT NULL en la tabla Streak.

**Causa**: Problema en el código del backend al crear el registro de Streak durante el registro.

**Solución**: Este error fue corregido en el backend. Asegúrate de:
1. Tener la última versión del código
2. Reiniciar el servidor: `npm run dev`
3. Si el problema persiste, verifica que las migraciones estén actualizadas:
```bash
cd backend/node
npm run staging:migrate
```

**Nota técnica**: El problema estaba en `auth-service.js` donde se usaba `id_user` en lugar de `id_user_profile` y `last_value: null` cuando debía ser `0`.

### ❌ Error: No se guarda el token automáticamente

**Síntoma**: Después del login, `{{auth_token}}` sigue vacío.

**Causa**: El script de test no se ejecutó correctamente o la respuesta no tiene el formato esperado.

**Solución**:
1. Verifica que la respuesta del login incluya `access_token`
2. Ve a la pestaña "Tests" del request y verifica que el script esté activo
3. Revisa la consola de Postman para ver errores en los scripts

## Problemas de Autenticación

### ❌ Error: 401 Unauthorized

**Síntoma**: Recibes error 401 en endpoints que requieren autenticación.

**Causa**: No estás enviando el token de autenticación o el token es inválido.

**Solución**:
1. Asegúrate de haber hecho login primero
2. Verifica que `{{auth_token}}` tenga un valor:
   - Ve a la pestaña de Variables (ojo 👁️ en la barra superior)
   - Busca `auth_token` en las variables de colección
   - Debería tener un valor JWT
3. Si el token está vacío, ejecuta nuevamente el Login
4. Si el problema persiste, el token puede haber expirado (válido 15 minutos)

### ❌ Error: 403 Forbidden

**Síntoma**: Error 403 en endpoints administrativos.

**Causa**: Tu usuario no tiene permisos de administrador.

**Solución**:
1. Crea un usuario con rol ADMIN:
```json
{
  "name": "Admin",
  "lastname": "User",
  "email": "admin@test.com",
  "password": "Admin123!",
  "gender": "M",
  "locality": "Buenos Aires",
  "frequency_goal": 5,
  "role": "ADMIN"
}
```
2. O actualiza el rol en la base de datos:
```sql
UPDATE account SET role = 'ADMIN' WHERE email = 'tu-email@test.com';
```

## Problemas de Conexión

### ❌ Error: "Could not get response" o timeout

**Síntoma**: Postman no puede conectarse al servidor.

**Causa**: El servidor no está corriendo o hay un problema de red.

**Solución**:
1. Verifica que el servidor esté corriendo:
```bash
cd backend/node
npm run dev
```
2. Verifica que el puerto sea el correcto (por defecto: 3000)
3. Verifica la variable `{{base_url}}`:
   - Debería ser `http://localhost:3000`
   - NO debe tener "/" al final
4. Verifica que no haya un firewall bloqueando el puerto

### ❌ Error: ECONNREFUSED

**Síntoma**: Error de conexión rechazada.

**Causa**: El servidor no está escuchando en el puerto especificado.

**Solución**:
1. Inicia el servidor: `npm run dev`
2. Verifica que veas el mensaje: "Server running on port 3000"
3. Si el puerto está ocupado, cambia el puerto en las variables de entorno

## Problemas con Variables

### ❌ Variables no se actualizan

**Síntoma**: Los IDs (gym_id, exercise_id, etc.) no se guardan automáticamente.

**Causa**: Los scripts de test no se ejecutan o hay un error en la respuesta.

**Solución**:
1. Ve a la pestaña "Test Results" después de ejecutar un request
2. Verifica que los tests hayan pasado
3. Si hay errores, revisa la estructura de la respuesta en la pestaña "Body"
4. Manualmente actualiza las variables si es necesario:
   - Click en el ícono de ojo (👁️) en la esquina superior derecha
   - Edita las variables de colección
   - Guarda los cambios

### ❌ Error: {{variable}} no se reemplaza

**Síntoma**: Las URLs aparecen literalmente como `{{base_url}}/api/...`

**Causa**: No has seleccionado un entorno o las variables no están definidas.

**Solución**:
1. Selecciona el entorno "GymPoint - Local Development" en el dropdown (esquina superior derecha)
2. Verifica que las variables estén definidas en el entorno
3. Si usas variables de colección, asegúrate de que estén en la colección

## Problemas con Newman (CLI)

### ❌ Error: "newman: command not found"

**Síntoma**: El comando newman no se encuentra.

**Causa**: Newman no está instalado.

**Solución**:
```bash
npm install -g newman
```

### ❌ Error: "Collection not found"

**Síntoma**: Newman no puede encontrar el archivo de colección.

**Causa**: Ruta incorrecta al archivo.

**Solución**:
1. Asegúrate de estar en el directorio correcto:
```bash
cd backend/node/postman
```
2. Verifica que el archivo exista:
```bash
ls -la GymPoint-API-Collection.postman_collection.json
```

### ❌ Muchos tests fallan en Newman

**Síntoma**: Los tests pasan en Postman pero fallan en Newman.

**Causa**: Diferencias en el entorno o problemas de sincronización.

**Solución**:
1. Agrega delay entre requests:
```bash
newman run collection.json -e environment.json --delay-request 200
```
2. Verifica que las variables de entorno estén correctamente configuradas
3. Ejecuta los tests en orden (algunos dependen de datos previos)

## Problemas con Gimnasios

### ❌ Error: 404 al obtener gimnasio

**Síntoma**: No se encuentra el gimnasio con el ID especificado.

**Causa**: El ID del gimnasio no existe en la base de datos.

**Solución**:
1. Primero ejecuta "List Gyms" para obtener IDs válidos
2. Crea un gimnasio nuevo con "Create Gym" (requiere permisos de admin)
3. Actualiza la variable `{{gym_id}}` con un ID válido

### ❌ Error al crear gimnasio: Missing gym_type_id

**Síntoma**: Error al intentar crear un gimnasio.

**Causa**: Falta el tipo de gimnasio o no existe en la base de datos.

**Solución**:
1. Primero ejecuta "Get Gym Types" para ver los tipos disponibles
2. Usa un `gym_type_id` válido (generalmente 1, 2 o 3)
3. Si no hay tipos, crea uno en la base de datos o ejecuta el seed

## Problemas con Rutinas y Ejercicios

### ❌ Error: No se pueden crear ejercicios

**Síntoma**: Error 403 al intentar crear ejercicios.

**Causa**: Se requieren permisos de administrador.

**Solución**:
1. Inicia sesión con un usuario ADMIN
2. O solicita ejercicios precargados al equipo de desarrollo

### ❌ Error al iniciar sesión de entrenamiento

**Síntoma**: Error al intentar iniciar una workout session.

**Causa**: Faltan datos requeridos o IDs inválidos.

**Solución**:
1. Asegúrate de tener una rutina creada (ejecuta "Create Routine" primero)
2. Verifica que `{{routine_id}}` y `{{exercise_id}}` tengan valores válidos
3. El body debe incluir ejercicios con sus sets y reps

## Problemas con la Base de Datos

### ❌ Error: Database connection failed

**Síntoma**: El servidor no puede conectarse a la base de datos.

**Causa**: La base de datos no está corriendo o las credenciales son incorrectas.

**Solución**:
1. Verifica que MySQL esté corriendo
2. Revisa el archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gympoint
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```
3. Verifica la conexión:
```bash
mysql -u tu_usuario -p -h localhost gympoint
```

### ❌ Error: Table doesn't exist

**Síntoma**: Error indicando que una tabla no existe.

**Causa**: Las migraciones no se han ejecutado.

**Solución**:
```bash
cd backend/node
npm run staging:migrate
```

## Preguntas Frecuentes (FAQ)

### ¿Por qué algunos endpoints no requieren autenticación?

Los endpoints públicos (como listar gimnasios o ver detalles) no requieren autenticación. Los endpoints que modifican datos sí la requieren.

### ¿Cuánto tiempo dura el token?

El access token dura 15 minutos. Después debes usar el refresh token para obtener uno nuevo.

### ¿Puedo usar la misma colección para diferentes entornos?

Sí, solo cambia el entorno seleccionado (Local vs Production) en Postman.

### ¿Cómo limpio los datos de prueba?

Puedes ejecutar las migraciones nuevamente (esto borrará todos los datos) o eliminar manualmente desde la base de datos.

## Tips para Debugging

### Ver Logs del Servidor

```bash
cd backend/node
npm run dev
```

Los logs mostrarán información detallada sobre cada request.

### Ver Request Completo en Postman

1. Abre la consola de Postman (View → Show Postman Console)
2. Ejecuta el request
3. Verás el request completo con headers, body, y response

### Ver Variables Actuales

1. Click en el ícono de ojo (👁️) en la esquina superior derecha
2. Verás todas las variables y sus valores actuales

### Copiar Request como cURL

1. Click en "Code" debajo del botón Send
2. Selecciona "cURL"
3. Copia y ejecuta en terminal para debuggear

## ¿Aún tienes problemas?

Si ninguna de estas soluciones funciona:

1. Revisa los logs del servidor
2. Verifica la documentación OpenAPI: `backend/node/docs/openapi.yaml`
3. Consulta el README.md para más información
4. Revisa el código del endpoint específico en `backend/node/routes/`

---

**Última actualización**: 25 de Octubre, 2025

