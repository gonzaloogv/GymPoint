# 🔐 Cómo Hacer Login en el Panel de Administración

## Problema
El panel de administración requiere un token JWT válido para acceder a las rutas de admin. El error **403 (Forbidden)** significa que no tienes un token válido o no tienes permisos de administrador.

## Solución: Crear un Usuario Admin

Tienes **3 opciones** para crear un usuario administrador:

---

### Opción 1: Usar el Usuario Admin por Defecto (Docker) ✅

Si estás usando Docker, ya tienes un usuario admin creado automáticamente:

**Credenciales:**
- **Email:** `admin@gympoint.com`
- **Password:** `admin123`

Solo haz login con estas credenciales en: http://localhost:3001/login

---

### Opción 2: Crear Admin via API (Registro Manual)

1. **Registrar un nuevo usuario con rol ADMIN:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "lastname": "GymPoint",
    "email": "tu-admin@example.com",
    "password": "tu-password-seguro",
    "gender": "M",
    "locality": "Tu Ciudad",
    "age": 30,
    "frequency_goal": 3,
    "role": "ADMIN"
  }'
```

2. **Hacer login con las credenciales:**

Ve a http://localhost:3001/login y usa:
- Email: `tu-admin@example.com`
- Password: `tu-password-seguro`

---

### Opción 3: Actualizar Usuario Existente a Admin (Base de Datos)

Si ya tienes un usuario creado, puedes convertirlo en admin directamente en la base de datos:

#### Usando psql (PostgreSQL):

```sql
-- 1. Encontrar el id_account del usuario
SELECT id_account, email FROM accounts WHERE email = 'tu-email@example.com';

-- 2. Obtener el id del rol ADMIN
SELECT id_role FROM roles WHERE role_name = 'ADMIN';

-- 3. Asignar el rol ADMIN al usuario (suponiendo id_account=1 y id_role=2)
INSERT INTO account_roles (id_account, id_role)
VALUES (1, 2);

-- 4. Verificar que el usuario ahora es admin
SELECT a.email, r.role_name
FROM accounts a
JOIN account_roles ar ON a.id_account = ar.id_account
JOIN roles r ON ar.id_role = r.id_role
WHERE a.email = 'tu-email@example.com';
```

#### Usando Docker Compose:

```bash
# Conectarse al contenedor de PostgreSQL
docker-compose exec postgres psql -U gympoint_user -d gympoint_db

# Luego ejecutar los comandos SQL de arriba
```

---

## Verificar que Funciona

1. Ve a http://localhost:3001/login
2. Ingresa tus credenciales de admin
3. Si el login es exitoso, serás redirigido al Dashboard
4. Deberías ver tu nombre en la esquina superior derecha del navbar

---

## Troubleshooting

### Error: "Access denied. Admin privileges required"
- Tu usuario no tiene el rol ADMIN asignado
- Usa la Opción 3 para asignarle el rol ADMIN

### Error: "Invalid credentials"
- Email o password incorrectos
- Verifica las credenciales en la base de datos

### Error: "Login failed"
- El backend no está corriendo
- Verifica que el backend esté en http://localhost:3000
- Ejecuta: `docker-compose up` o `npm run dev` en el backend

### Error: 403 después del login
- El token expiró
- Haz logout (botón en navbar) y vuelve a hacer login

---

## Flujo Completo de Autenticación

```
1. Usuario ingresa email/password en /login
   ↓
2. Frontend hace POST a /api/auth/login
   ↓
3. Backend valida credenciales
   ↓
4. Backend verifica que el usuario tenga rol ADMIN
   ↓
5. Backend retorna accessToken JWT
   ↓
6. Frontend guarda token en localStorage
   ↓
7. Frontend incluye token en todas las peticiones:
   Authorization: Bearer <token>
   ↓
8. Backend valida token en cada petición
   ↓
9. Si es válido, devuelve los datos
```

---

## Comandos Útiles

### Ver todos los admins en la BD:
```sql
SELECT a.id_account, a.email, r.role_name
FROM accounts a
JOIN account_roles ar ON a.id_account = ar.id_account
JOIN roles r ON ar.id_role = r.id_role
WHERE r.role_name = 'ADMIN';
```

### Crear un nuevo rol ADMIN (si no existe):
```sql
INSERT INTO roles (role_name, description)
VALUES ('ADMIN', 'Administrator with full access')
ON CONFLICT (role_name) DO NOTHING;
```

---

## Seguridad

⚠️ **Importante:**
- Nunca uses contraseñas débiles en producción
- Cambia las credenciales por defecto en producción
- Los tokens JWT expiran después de cierto tiempo (configurado en el backend)
- En producción, usa HTTPS para todas las comunicaciones
