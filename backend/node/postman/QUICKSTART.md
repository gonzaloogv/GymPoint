# 🚀 Guía Rápida - Tests de API con Postman

## Instalación Rápida (5 minutos)

### 1. Instalar Postman Desktop
Descarga e instala Postman desde: https://www.postman.com/downloads/

### 2. Importar la Colección

**Método 1 - Drag & Drop:**
- Arrastra el archivo `GymPoint-API-Collection.postman_collection.json` a Postman

**Método 2 - Import Button:**
1. Click en **Import** (esquina superior izquierda)
2. Selecciona `GymPoint-API-Collection.postman_collection.json`
3. Click en **Import**

### 3. Importar el Entorno
1. Click en **Import**
2. Selecciona `GymPoint-Local.postman_environment.json`
3. Selecciona el entorno en el dropdown (esquina superior derecha)

## 🎯 Primera Prueba (2 minutos)

### 1. Verificar el Servidor
```bash
# Asegúrate de que el servidor esté corriendo
cd backend/node
npm run dev
```

### 2. Health Check
En Postman:
1. Navega a: `20 - Health Check > Health Check`
2. Click en **Send**
3. Deberías ver: Status 200 y `{"status": "OK"}`

### 3. Crear un Usuario
1. Navega a: `01 - Authentication > Register User`
2. Click en **Send**
3. Se creará un usuario de prueba

### 4. Iniciar Sesión
1. Navega a: `01 - Authentication > Login User`
2. Click en **Send**
3. El token se guardará automáticamente en `{{auth_token}}`

### 5. Probar un Endpoint Autenticado
1. Navega a: `02 - Users > Get Current User Profile`
2. Click en **Send**
3. Verás tu perfil de usuario

## 💻 Ejecutar Tests desde Terminal (CLI)

### Instalar Newman (CLI de Postman)
```bash
npm install -g newman
```

### Ejecutar Tests

**Windows:**
```bash
cd backend/node/postman
.\run-tests.bat local
```

**Linux/Mac:**
```bash
cd backend/node/postman
./run-tests.sh local
```

**Con npm (desde backend/node):**
```bash
npm run test:postman          # Test básico
npm run test:postman:html     # Test con reporte HTML
```

## 📊 Ver Reportes

Los reportes se generan en `backend/node/postman/test-reports/`

Abre el archivo HTML en tu navegador para ver:
- ✅ Tests que pasaron
- ❌ Tests que fallaron
- ⏱️ Tiempos de respuesta
- 📈 Estadísticas generales

## 🔑 Flujo de Tests Recomendado

### Para Usuarios Nuevos:
```
1. Health Check
2. Register User
3. Login User
4. Get Current User Profile
5. List Gyms
6. Get Gym By ID
```

### Para Testing Completo:
```
1. Todos los endpoints de Authentication
2. Todos los endpoints de Users
3. Todos los endpoints de Gyms
4. Selecciona los módulos que necesites probar
```

## 🛠️ Personalizar los Tests

### Cambiar Datos de Prueba:
1. Abre cualquier request
2. Ve a la pestaña **Body**
3. Modifica el JSON con tus datos
4. Click en **Send**

### Agregar Nuevos Tests:
1. Click derecho en una carpeta
2. Selecciona **Add Request**
3. Configura el método, URL y body
4. Agrega tests en la pestaña **Tests**

### Ejemplo de Test en JavaScript:
```javascript
pm.test('Status code is 200', function() {
    pm.response.to.have.status(200);
});

pm.test('Response has required field', function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

## 🐛 Solución de Problemas Comunes

### Error: "Could not get response"
- ✅ Verifica que el servidor esté corriendo en `http://localhost:3000`
- ✅ Verifica que no haya firewall bloqueando el puerto

### Error: 401 Unauthorized
- ✅ Ejecuta primero el Login User
- ✅ Verifica que `{{auth_token}}` tenga un valor en el entorno

### Error: 404 Not Found
- ✅ Verifica que el endpoint exista en el servidor
- ✅ Verifica que los IDs en la URL sean válidos

### Tests fallan en Newman pero pasan en Postman
- ✅ Verifica que las variables de entorno estén configuradas
- ✅ Algunos tests pueden depender de datos previos

## 📚 Recursos Adicionales

- **README.md**: Documentación completa de la colección
- **test-data-examples.json**: Ejemplos de datos para pruebas
- **Documentación OpenAPI**: `backend/node/docs/openapi.yaml`

## 🎓 Aprende Más

- [Documentación de Postman](https://learning.postman.com/docs/)
- [Postman Tests Examples](https://www.postman.com/postman/workspace/postman-team-collections/collection/1559645-20479124-6684-44b3-9b2b-6b5c8b1e0a47)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

---

¿Listo para empezar? 🚀

1. Importa la colección y el entorno
2. Ejecuta el Health Check
3. Crea un usuario y haz login
4. ¡Empieza a probar los endpoints!

