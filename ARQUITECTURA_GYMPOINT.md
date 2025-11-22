# Documentación de Arquitectura - GymPoint

## 1. Visión General del Sistema

GymPoint es una plataforma integral de gamificación fitness que conecta usuarios con gimnasios mediante geolocalización, desafíos diarios, rutinas personalizadas y recompensas. El sistema está diseñado como monorepo con arquitectura distribuida que separa responsabilidades entre múltiples aplicaciones cliente y un backend centralizado.

### Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Archivos de código | 1,246 |
| Archivos de tests | 186 (76% coverage) |
| Documentación | 70+ archivos MD |
| Tablas en BD | 51 |
| Endpoints REST | 120+ |
| Features principales | 12 |
| Sprints de desarrollo | 7 |

---

## 2. Arquitectura General

### 2.1 Componentes Principales

El ecosistema GymPoint está compuesto por cuatro aplicaciones principales:

**Landing Page (React + Vite)**
Sitio web institucional desarrollado con arquitectura limpia, enfocado en presentación del producto y captación de leads. Implementa separación entre capas de dominio, aplicación e infraestructura.

**Aplicación Móvil (React Native + Expo)**
Cliente principal para iOS y Android. Los usuarios acceden a funcionalidades de gamificación, tracking de asistencia mediante geofencing, desafíos diarios, rutinas personalizadas y sistema de recompensas. Implementa Clean Architecture con organización por features.

**Panel de Administración (React + Vite)**
Aplicación web para gestión operativa. Los administradores gestionan gimnasios, configuran zonas de geofencing, crean desafíos y rutinas, administran recompensas y monitorean métricas. Utiliza tipos TypeScript generados automáticamente desde OpenAPI.

**Backend API (Node.js + Express)**
Servidor que centraliza toda la lógica de negocio. Implementa arquitectura OpenAPI-first con Sequelize como ORM para MySQL. Expone endpoints RESTful con validación automática y documentación completa.

### 2.2 Flujo de Datos

```
Cliente (Mobile/Admin/Landing)
         ↓ HTTPS
    Backend API
         ↓
   Validación OpenAPI
         ↓
    Controllers
         ↓
     Services
         ↓
   Repositories
         ↓
  Sequelize Models
         ↓
     MySQL 8.4
```

Las aplicaciones cliente se comunican exclusivamente con el backend mediante APIs REST. Las operaciones críticas como registro de asistencia por geolocalización, verificación de desafíos y cálculo de recompensas se ejecutan en el servidor para garantizar integridad y seguridad.

---

## 3. Arquitectura del Backend

### 3.1 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js v22.14 |
| Framework | Express 5.1 |
| ORM | Sequelize 6.37 |
| Base de Datos | MySQL 8.4 |
| Especificación API | OpenAPI 3.1 |
| Autenticación | JWT + Refresh Tokens |
| WebSockets | Socket.io 4.8 |
| Logging | Winston + Sentry |
| Testing | Jest + Supertest |

### 3.2 Arquitectura en 3 Capas (Layered Architecture)

El backend implementa una arquitectura en tres capas claramente separadas:

**Capa de Presentación**
- Routes: Definición de endpoints y middlewares
- Controllers: Manejo de HTTP (request/response)
- Middlewares: Auth, validación, rate limiting, RBAC

**Capa de Lógica de Negocio**
- Services: Casos de uso y reglas de negocio
- Orquestación de operaciones
- Transacciones y validaciones complejas

**Capa de Acceso a Datos**
- Repositories: Abstracción de queries
- Models: Definiciones Sequelize
- Mappers: Conversión entre modelos y DTOs

### 3.3 Organización de Módulos

El backend está organizado en 12 dominios principales:

**Autenticación y Seguridad**
Gestiona registro, login, OAuth con Google, recuperación de contraseñas, validación de tokens JWT y control de sesiones. Implementa RBAC con roles: usuario, administrador de gimnasio y super admin.

**Gestión de Usuarios**
Administra perfiles incluyendo datos personales, preferencias de entrenamiento, objetivos fitness, historial de actividad y estadísticas. Maneja la relación entre usuarios y gimnasios asociados.

**Gestión de Gimnasios**
Controla registro y administración de gimnasios: información institucional, horarios, servicios, equipamiento y administradores. Gestiona aprobación y verificación de establecimientos.

**Geolocalización y Asistencia**
Sistema de geofencing para validar presencia física en el gimnasio. Registra check-ins automáticos cuando el usuario entra en la zona geográfica, acumula puntos por asistencia y genera estadísticas de frecuencia.

**Sistema de Desafíos**
Crea y administra desafíos diarios. Los desafíos pueden ser de ejercicios específicos, tiempo de permanencia, frecuencia de asistencia o combinaciones. Valida automáticamente el cumplimiento basándose en datos de sensores y tracking.

**Rutinas de Entrenamiento**
Permite crear plantillas de rutinas personalizables. Los usuarios pueden seguir rutinas predefinidas o crear propias. El sistema registra progreso, pesos, repeticiones y tiempos para cada ejercicio.

**Sistema de Puntos y Gamificación**
Motor que calcula y asigna puntos por actividades: asistencias, desafíos completados, rutinas finalizadas, metas alcanzadas. Implementa niveles, rankings y logros desbloqueables.

**Catálogo de Recompensas**
Administra productos y servicios canjeables con puntos. Los gimnasios configuran su catálogo: productos físicos, descuentos, clases especiales o acceso a áreas premium.

**Transacciones y Canjes**
Procesa canjes de puntos por recompensas, genera códigos QR únicos para validación presencial, registra historial de transacciones y gestiona inventario de recompensas.

**Notificaciones**
Sistema de mensajería push que alerta sobre nuevos desafíos, logros, recompensas disponibles, recordatorios de asistencia. Implementa segmentación y personalización.

**Procesamiento de Pagos**
Integra pasarelas de pago para suscripciones premium, permite gestionar planes de membresía y procesa cobros recurrentes.

**Analytics y Reportes**
Genera métricas sobre uso de la plataforma, tasas de retención, desafíos populares, horarios pico y efectividad de recompensas. Proporciona dashboards para gimnasios y administradores.

### 3.4 Jobs Programados (Cron)

El sistema incluye 7 jobs automatizados:
- Generación de desafíos diarios (00:01 UTC)
- Actualización de estadísticas de recompensas (cada 5 min)
- Limpieza de datos antiguos (3 AM)
- Procesamiento de eliminaciones de cuenta (2 AM)
- Vencimiento de suscripciones (9 AM)
- Reset de metas semanales (Lunes 00:00)
- Envío de notificaciones programadas

### 3.5 Comunicación en Tiempo Real

WebSockets implementados con Socket.io para:
- Notificaciones de check-ins en tiempo real
- Actualizaciones de reviews
- Alertas de desafíos completados
- Sincronización de estado entre dispositivos

---

## 4. Arquitectura del Frontend Mobile

### 4.1 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | React Native 0.81 + Expo 54 |
| Lenguaje | TypeScript 5.9 |
| Estado Global | Zustand 5.0 + Immer |
| Navegación | React Navigation 7 |
| Estilos | NativeWind + Tailwind |
| HTTP Client | Axios 1.12 |
| Data Fetching | TanStack Query 5 |
| Validación | Zod |

### 4.2 Clean Architecture (3 Capas)

La aplicación móvil implementa Clean Architecture con organización por features:

**Capa de Presentación**
- UI Components y Screens
- Hooks personalizados
- State Management (Zustand stores)
- Utils de presentación

**Capa de Dominio**
- Entities (objetos de negocio puros)
- Use Cases (interactors)
- Repository Interfaces (contratos)
- Constants y reglas de negocio
- Sin dependencias externas

**Capa de Datos**
- DTOs (Data Transfer Objects)
- Mappers (DTO ↔ Entity)
- DataSources (Remote/Local/Mock)
- Repository Implementations

### 4.3 Features Implementadas

| Feature | Descripción | Store |
|---------|-------------|-------|
| auth | Login, Register, Google OAuth | authStore |
| gyms | Búsqueda de gimnasios cercanos | - |
| routines | Rutinas de entrenamiento | routinesStore |
| rewards | Sistema de recompensas | rewardsStore |
| home | Dashboard principal | homeStore |
| user | Perfil de usuario | userStore |
| progress | Progreso y logros | progressStore |
| tokens | Historial de tokens | tokensStore |
| assistance | Check-ins | - |
| reviews | Reseñas de gimnasios | - |
| subscriptions | Suscripciones premium | - |
| workouts | Sesiones de entrenamiento | - |

### 4.4 Dependency Injection

Contenedor DI centralizado que inyecta:
- Repository implementations
- Use Cases con sus dependencias
- Configuración de entorno

Permite intercambiar implementaciones (real vs mock) para testing sin modificar código de dominio.

---

## 5. Modelo de Datos

### 5.1 Estadísticas de Base de Datos

| Métrica | Valor |
|---------|-------|
| Total de tablas | 51 |
| Foreign Keys | ~60 relaciones |
| Índices optimizados | ~70 |
| ENUMs definidos | 15+ |
| Soft Deletes | 10+ tablas |

### 5.2 Dominios Principales

**Autenticación (4 tablas)**
accounts, roles, account_roles, refresh_token

**Perfiles (3 tablas)**
user_profiles, admin_profiles, account_deletion_request

**Gimnasios (12 tablas)**
gym, gym_schedule, gym_review, gym_rating_stats, gym_amenity, etc.

**Fitness Tracking (5 tablas)**
frequency, streak, user_gym, assistance, user_body_metric

**Ejercicios y Rutinas (11 tablas)**
exercise, routine, routine_day, workout_session, etc.

**Recompensas y Gamificación (10 tablas)**
reward, claimed_reward, token_ledger, achievement, daily_challenge, etc.

**Media y Notificaciones (5 tablas)**
media, notification, user_notification_setting, etc.

### 5.3 Relaciones Clave

- Usuarios tienen múltiples asistencias registradas en gimnasios específicos
- Gimnasios definen múltiples zonas de geofencing y ofrecen múltiples recompensas
- Desafíos están asociados a gimnasios y tienen múltiples completaciones por usuarios
- Rutinas contienen múltiples ejercicios y son ejecutadas por usuarios con tracking detallado
- Transacciones vinculan usuarios, recompensas y gimnasios con códigos QR únicos

El esquema implementa índices estratégicos, claves foráneas con integridad referencial y triggers para mantener consistencia en operaciones críticas.

---

## 6. Patrones de Diseño Aplicados

### 6.1 Patrones Creacionales

**Singleton Pattern**
DI Container como única instancia que gestiona todas las dependencias de la aplicación mobile.

**Factory Pattern**
Sequelize centraliza la creación de modelos con sus asociaciones en models/index.js.

### 6.2 Patrones Estructurales

**Repository Pattern**
20+ repositories en backend encapsulan queries complejas y proveen métodos específicos del dominio. Frontend define interfaces en dominio e implementaciones en capa de datos.

**Mapper Pattern**
25+ mappers convierten entre modelos Sequelize y DTOs (backend) y entre DTOs y Entities (frontend).

**Adapter Pattern**
GoogleAuthProvider adapta la API de Google OAuth al formato interno de la aplicación.

**Facade Pattern**
Services actúan como facades coordinando múltiples repositories para operaciones complejas.

**Module Pattern (Barrel Exports)**
Cada feature exporta solo su API pública, ocultando detalles de implementación.

### 6.3 Patrones de Comportamiento

**Strategy Pattern**
Diferentes estrategias para calcular tokens según tipo de recompensa.

**Observer Pattern**
Zustand stores implementan patrón observer - componentes se suscriben y re-renderizan automáticamente cuando cambia el estado.

**Command Pattern**
Use Cases encapsulan operaciones con método execute().

**Middleware Pattern (Chain of Responsibility)**
Cadena de middlewares: CORS → JSON → Monitoreo → Validación → Rate Limiting → Auth → RBAC → Controller.

**Dependency Injection**
Container centralizado conecta todas las dependencias al inicio de la aplicación.

---

## 7. Seguridad

### 7.1 Autenticación y Autorización

- JWT con refresh tokens
- RBAC (Role-Based Access Control)
- OAuth 2.0 con Google
- Bcrypt para hashing de passwords (cost factor 12)

### 7.2 Validación y Protección

- Validación automática de entrada con OpenAPI
- Rate limiting en endpoints críticos
- Prevención de SQL injection con Sequelize
- Comunicaciones HTTPS exclusivas
- Operaciones sensibles requieren verificación adicional de permisos

### 7.3 Almacenamiento Seguro

- Tokens en SecureStore (mobile)
- Passwords hasheados (nunca en texto plano)
- Refresh tokens con expiración configurable

---

## 8. Testing y Calidad

### 8.1 Cobertura de Tests

| Tipo | Cantidad | Estado |
|------|----------|--------|
| Suites totales | 36 | - |
| Unit tests | 20 suites | Activos |
| Integration tests | 14 suites | Activos |
| E2E tests | 2 suites | Activos |
| Tests totales | 124 | 76% cobertura |

### 8.2 Calidad de Código

- ESLint + Prettier para formateo consistente
- Husky pre-commit hooks (lint, test, OpenAPI bundle)
- Definición de Done estricta por sprint

---

## 9. DevOps e Infraestructura

### 9.1 Containerización

Docker Compose orquesta los servicios:
- MySQL 8.4 con healthchecks
- Backend Node.js con variables de entorno
- Volúmenes persistentes para datos

### 9.2 Monitoreo

- Winston para logging estructurado
- Sentry para tracking de errores
- Health checks y readiness probes

### 9.3 Despliegue

- Diseñado para contenedores Docker
- Escalado horizontal según demanda
- Configuración para réplicas de lectura en MySQL

---

## 10. Metodología de Desarrollo

### 10.1 Ciclo de Vida RUP

**Inception**
Documentación de visión, casos de uso principales, modelo de dominio preliminar, estudio de viabilidad.

**Elaboration**
Arquitectura en 3 capas (backend), Clean Architecture (mobile), diseño de base de datos, especificación OpenAPI, prototipo funcional.

**Construction**
7 sprints iterativos, 12 features completas, 124 tests implementados, integración continua.

**Transition**
Docker Compose para deployment, scripts automatizados, migraciones versionadas, logs y monitoreo.

### 10.2 Metodología Scrum

**Sprints Completados:**
- Sprint 1-2: Auth + Gyms Foundation
- Sprint 3-4: Fitness Tracking + Routines
- Sprint 5-6: Gamification + Social
- Sprint 7: Admin + Optimizations

**Métricas:**
- Velocity promedio: 19.14 SP/sprint
- Sprints completados: 7/7 (100%)
- Features entregadas: 12/12 (100%)

**Definición de Done:**
- Código revisado
- Tests pasando (coverage > 70%)
- Documentación OpenAPI actualizada
- Sin errores de ESLint
- Merged a main

---

## 11. API REST

### 11.1 Documentación

- Especificación OpenAPI 3.1
- 50+ schemas modulares
- 120+ endpoints documentados
- Swagger UI integrado

### 11.2 Grupos de Endpoints

| Dominio | Endpoints | Operaciones principales |
|---------|-----------|------------------------|
| Auth | 7 | register, login, google, refresh, logout, me |
| Users | 6 | profile, settings, stats, upgrade-premium |
| Gyms | 6 | list, nearby, detail, schedules, reviews |
| Check-ins | 4 | create, history, streak, recover |
| Routines | 7 | CRUD, import, execute |
| Rewards | 8 | list, redeem, claimed, codes, validate |
| Tokens | 3 | balance, history, transactions |
| Achievements | 3 | list, me, detail |
| Challenges | 3 | daily, me, progress |
| Reviews | 5 | list, create, update, delete, helpful |
| Admin | 15+ | stats, users, gyms, rewards, reviews |

---

## 12. Próximas Fases de Desarrollo

### Corto Plazo
1. Aumentar coverage de tests a 85%+
2. Implementar caché con Redis
3. Optimizaciones de performance
4. Autenticación de dos factores (2FA)

### Mediano Plazo
5. Monitoreo avanzado (Grafana)
6. Escalabilidad (Load balancer, Kubernetes)
7. Features adicionales (Chat, IA para recomendaciones, Nutrición)

### Largo Plazo
8. Arquitectura de microservicios
9. Machine Learning para recomendaciones personalizadas
10. Expansión multiplataforma (PWA, Desktop)
11. APIs públicas para integración con wearables y aplicaciones de terceros
12. Modelo SaaS para gimnasios con planes de suscripción, facturación automatizada y gestión multi-tenant

---

## 13. Conclusiones

GymPoint es un proyecto de calidad profesional que demuestra:

- **Arquitectura sólida**: Clean Architecture + Layered Architecture correctamente aplicadas
- **Metodología efectiva**: Scrum + RUP con entrega del 100% de features
- **Calidad de código**: Tests automatizados y documentación completa
- **Stack moderno**: Node.js 22, React Native 0.81, TypeScript 5.9
- **Production-ready**: Docker, logging, monitoreo, seguridad implementada

La arquitectura proporciona una base escalable y mantenible que permite agregar funcionalidades progresivamente mientras mantiene separación de responsabilidades, seguridad de datos e integridad del sistema.

---

**Documento:** ARQUITECTURA_GYMPOINT.md
**Versión:** 1.0
**Fecha:** Noviembre 2025
