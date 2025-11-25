# Scripts de Inicialización

Este directorio contiene scripts que se ejecutan automáticamente durante el inicio del servidor.

## seed-admin.js

Script que crea un usuario administrador inicial en el sistema.

### Configuración Automática

Este script se ejecuta automáticamente cuando se levanta Docker a través de `wait-for-db.sh`:

1. Espera a que MySQL esté disponible
2. Ejecuta las migraciones pendientes
3. **Ejecuta seed-admin.js** → Crea usuario admin si no existe
4. Inicia el servidor

### Credenciales del Admin Inicial

```
Email:    admin@gympoint.com
Password: AdminGPMitre280!
```

### Comportamiento

- ✅ **Idempotente**: Si el usuario ya existe, NO lo sobrescribe
- ✅ **Automático**: Se ejecuta en cada inicio de Docker
- ⚠️  **Solo Desarrollo**: Este seed debe ser removido en producción

### Roles Asignados

El usuario admin creado tiene:
- Rol: `ADMIN`
- Acceso completo a todos los endpoints administrativos
- Perfil de AdminProfile con:
  - Nombre: Admin GymPoint
  - Departamento: IT

### Para Producción

En producción:
1. Remover la línea de `seed-admin.js` de `wait-for-db.sh`
2. Crear usuarios admin manualmente con contraseñas seguras
3. Implementar rotación de credenciales

### Modificar Credenciales

Para cambiar el email o password del admin inicial, editar las constantes en `seed-admin.js`:

```javascript
const ADMIN_EMAIL = 'admin@gympoint.com';
const ADMIN_PASSWORD = 'AdminGPMitre280!';
```

Luego reconstruir el contenedor:
```bash
docker-compose down
docker-compose up -d --build
```
