# 🚀 Guía de Despliegue a Producción - GymPoint Backend

**Versión:** 2.0  
**Fecha:** Octubre 2025  
**Estado:** ✅ Production-Ready

---

## 📋 Pre-requisitos de Producción

### Infraestructura Mínima

- ✅ **Node.js** v22.14.0 o superior
- ✅ **MySQL** 8.4 con usuario dedicado
- ✅ **SSL/TLS** certificates para HTTPS
- ✅ **Dominio** configurado (ej: api.gympoint.com)
- ✅ **Reverse proxy** (Nginx/Apache) o hosting gestionado
- ⚠️ **Min 512 MB RAM** (recomendado: 1GB+)
- ⚠️ **Min 1 vCPU** (recomendado: 2+)

---

## 🔐 Seguridad Pre-Deploy

### 1. Generar Secrets Seguros

```bash
# JWT Access Token Secret (min 32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Refresh Token Secret (diferente al anterior)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Variables de Entorno Críticas

```env
# NUNCA usar valores de desarrollo en producción
NODE_ENV=production
PORT=3000

# Database (usar usuario dedicado con permisos limitados)
DB_HOST=tu-db-host.com
DB_PORT=3306
DB_NAME=gympoint
DB_USER=gympoint_user  # NO usar root
DB_PASSWORD=<password-seguro-generado>

# JWT (usar los secrets generados arriba)
JWT_SECRET=<secret-generado-64-chars>
JWT_REFRESH_SECRET=<secret-diferente-64-chars>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

# CORS (solo dominios permitidos)
CORS_ORIGIN=https://app.gympoint.com,https://web.gympoint.com

# Google OAuth (si aplica)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com

# Gamificación
PROXIMITY_M=180
TOKENS_ATTENDANCE=10
TOKENS_WORKOUT_COMPLETED=20
WEEKLY_GOAL_BONUS=30
TIMEZONE=America/Argentina/Cordoba
```

### 3. Checklist de Seguridad

- [ ] Secrets únicos y seguros generados
- [ ] Usuario de DB con permisos mínimos necesarios
- [ ] `NODE_ENV=production` configurado
- [ ] CORS limitado a dominios específicos
- [ ] Rate limiting habilitado
- [ ] Helmet configurado
- [ ] Logs NO contienen PII ni tokens
- [ ] `.env` en `.gitignore`
- [ ] SSL/TLS activo (HTTPS)

---

## 🗄️ Preparación de Base de Datos

### 1. Crear Usuario Dedicado

```sql
-- Conectar como root
mysql -u root -p

-- Crear usuario dedicado
CREATE USER 'gympoint_user'@'%' IDENTIFIED BY 'password_seguro_aqui';

-- Crear database
CREATE DATABASE gympoint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Otorgar permisos (solo los necesarios)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER 
ON gympoint.* 
TO 'gympoint_user'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SHOW GRANTS FOR 'gympoint_user'@'%';
```

### 2. Ejecutar Migraciones

Las migraciones se ejecutan **automáticamente** al iniciar el servidor:

```bash
npm start
```

Si necesitas ejecutarlas manualmente:

```bash
node migrate.js
```

### 3. Crear Primer Administrador

```bash
node create-admin-script.js \
  --email admin@gympoint.com \
  --password <password-seguro> \
  --name Admin \
  --lastname System \
  --department IT
```

---

## 🚢 Opciones de Despliegue

### Opción A: Railway (Recomendado)

**Pros:** Configuración simple, CI/CD automático, PostgreSQL/MySQL incluido  
**Cons:** Límite de horas gratis

#### Pasos:

1. **Conectar repositorio GitHub**
   - Ir a [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub"
   - Seleccionar repositorio GymPoint

2. **Configurar servicio**
   ```
   Root Directory: backend/node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Agregar MySQL**
   - "New" → "Database" → "Add MySQL"
   - Railway generará automáticamente las variables de conexión

4. **Configurar variables de entorno**
   - Ir a "Variables"
   - Agregar todas las variables del `.env`
   - Railway provee automáticamente: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

5. **Deploy**
   - Railway hace deploy automático en cada push a `main`
   - Ver logs en tiempo real

---

### Opción B: Render

**Pros:** SSL gratis, fácil configuración  
**Cons:** Límite de servicios gratis

#### Pasos:

1. **Crear Web Service**
   - Ir a [render.com](https://render.com)
   - "New" → "Web Service"
   - Conectar repositorio

2. **Configuración**
   ```
   Name: gympoint-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend/node
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Agregar MySQL externo**
   - Usar PlanetScale, ClearDB o MySQL de otro proveedor
   - Configurar variables de conexión

4. **Variables de entorno**
   - En "Environment" agregar todas las variables

5. **Deploy**
   - Render hace deploy automático

---

### Opción C: Docker + VPS

**Pros:** Control total, escalable  
**Cons:** Requiere más configuración

#### Pasos:

1. **Preparar VPS**
   ```bash
   # Conectar via SSH
   ssh user@tu-vps.com
   
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Clonar repositorio**
   ```bash
   git clone https://github.com/gonzaloogv/GymPoint.git
   cd GymPoint/backend/node
   ```

3. **Configurar .env**
   ```bash
   cp .env.example .env
   nano .env  # Editar con valores de producción
   ```

4. **Docker Compose**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     db:
       image: mysql:8.4
       environment:
         MYSQL_DATABASE: gympoint
         MYSQL_USER: gympoint_user
         MYSQL_PASSWORD: ${DB_PASSWORD}
         MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
       volumes:
         - mysql-data:/var/lib/mysql
       restart: always

     api:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DB_HOST=db
       env_file:
         - .env
       depends_on:
         - db
       restart: always

   volumes:
     mysql-data:
   ```

5. **Ejecutar**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

6. **Configurar Nginx (reverse proxy)**
   ```nginx
   server {
       listen 80;
       server_name api.gympoint.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **SSL con Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.gympoint.com
   ```

---

## 📊 Monitoreo Post-Deploy

### 1. Health Checks

Configurar monitoreo de:

- **Liveness:** `GET /health`
  - Debe retornar `200 OK`
  - Intervalo: cada 30 segundos

- **Readiness:** `GET /ready`
  - Valida DB + migraciones
  - Intervalo: cada 60 segundos

### 2. Logs

```bash
# Ver logs en tiempo real
tail -f logs/combined.log

# O con Docker
docker logs -f <container-id>

# O en Railway/Render
# Ver logs en el dashboard
```

### 3. Métricas a Monitorear

- ✅ **Uptime** (objetivo: >99.5%)
- ✅ **Response time** (objetivo: p95 < 500ms)
- ✅ **Error rate** (objetivo: <1%)
- ✅ **Database connections** (monitor pool usage)
- ✅ **Memory usage** (alert si >80%)
- ✅ **CPU usage** (alert si >70% por >5min)

### 4. Alertas Recomendadas

- 🚨 Server down (>2 minutos)
- 🚨 Database connection errors
- 🚨 Error rate >5%
- ⚠️ Memory usage >85%
- ⚠️ Response time p95 >1000ms

---

## 🔄 CI/CD Automático

### GitHub Actions (Ejemplo)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'backend/node/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        working-directory: backend/node
        run: npm ci
      
      - name: Run tests
        working-directory: backend/node
        run: npm test
      
      - name: Deploy to Railway
        if: success()
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

---

## 🛡️ Backup y Recuperación

### 1. Backup de Base de Datos

```bash
# Backup automático diario (cron)
0 2 * * * /usr/bin/mysqldump -u gympoint_user -p'password' gympoint > /backups/gympoint_$(date +\%Y\%m\%d).sql

# Comprimir backups antiguos
find /backups -name "*.sql" -mtime +7 -exec gzip {} \;

# Eliminar backups >30 días
find /backups -name "*.sql.gz" -mtime +30 -delete
```

### 2. Restauración

```bash
# Restaurar desde backup
mysql -u gympoint_user -p gympoint < backup_20251004.sql

# O con Docker
docker exec -i mysql-container mysql -u root -p gympoint < backup.sql
```

---

## 🚀 Optimizaciones de Producción

### 1. PM2 (Process Manager)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start index.js --name gympoint-api -i max

# Configurar auto-restart
pm2 startup
pm2 save

# Monitorear
pm2 monit
```

### 2. Nginx Caching

```nginx
# Cache para assets estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### 3. Database Indexing

```sql
-- Índices críticos ya creados en migraciones
-- Verificar con:
SHOW INDEX FROM accounts;
SHOW INDEX FROM user_profiles;
SHOW INDEX FROM assistances;
```

---

## 📝 Checklist Final Pre-Launch

### Seguridad
- [ ] Secrets únicos generados
- [ ] HTTPS activo
- [ ] CORS configurado
- [ ] Rate limiting activo
- [ ] Helmet configurado
- [ ] DB usuario con permisos mínimos

### Base de Datos
- [ ] Migraciones ejecutadas
- [ ] Primer admin creado
- [ ] Backup automático configurado
- [ ] Índices verificados

### Monitoreo
- [ ] Health checks configurados
- [ ] Logs funcionando
- [ ] Alertas configuradas
- [ ] Métricas monitoreando

### Documentación
- [ ] README actualizado
- [ ] OpenAPI accesible
- [ ] Variables de entorno documentadas
- [ ] Equipo notificado

### Testing
- [ ] Tests críticos pasando
- [ ] Smoke tests en staging
- [ ] Load testing completado
- [ ] Rollback plan definido

---

## 🆘 Troubleshooting

### Server no inicia

```bash
# Verificar logs
tail -f logs/error.log

# Verificar puerto disponible
lsof -i :3000

# Verificar variables de entorno
env | grep DB_
```

### Database connection errors

```bash
# Verificar conectividad
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME

# Verificar migraciones
node migrate.js

# Ver estado de migraciones
SELECT * FROM migrations;
```

### High memory usage

```bash
# Ver procesos
pm2 monit

# Restart app
pm2 restart gympoint-api

# Verificar memory leaks
node --inspect index.js
```

---

## 📞 Soporte Post-Deploy

### Contactos del Equipo

- **Tech Lead:** Gonzalo Gomez Vignudo
- **Backend:** gonzaloogv@gmail.com
- **On-Call:** [Configurar rotación]

### Documentación de Referencia

- [README Principal](../README.md)
- [Arquitectura de DB](DATABASE_ARCHITECTURE.md)
- [Guía de Testing](POSTMAN_TESTING_GUIDE.md)
- [Roadmap](ROADMAP.md)

---

## 🎉 ¡Deploy Completado!

Una vez completados todos los pasos:

1. ✅ Verificar `/health` retorna 200
2. ✅ Verificar `/ready` retorna 200
3. ✅ Verificar `/api-docs` carga correctamente
4. ✅ Hacer login de prueba
5. ✅ Registrar asistencia de prueba
6. ✅ Verificar logs sin errores

**¡GymPoint está en producción y listo para usuarios! 🚀💪**

---

**Última actualización:** Octubre 2025  
**Versión de la guía:** 1.0

