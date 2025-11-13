# GYMPOINT – Historial de Cambios del Proyecto

## Documento de Control de Versiones

Este documento resume la evolución del proyecto **GymPoint** desde sus inicios en **mayo de 2025** hasta el **cierre funcional** alcanzado el **12 de noviembre de 2025**.

---

## Historial de Versiones

| Versión | Fecha | Edición | Descripción |
|---------|-------|---------|-------------|
| 1.2.0 | 12/11/2025 | Realtime E2E (Cierre Funcional) | Integración de WebSockets en todo el monorepo. Configuración de servidor WebSockets con autenticación JWT. Definición de rooms/canales por usuario, admin y recursos. Eventos en tiempo real: user:tokens:updated, user:subscription:updated, attendance:recorded, progress:weekly:updated, review:created, gym:rating:updated. Panel Admin con requests y métricas en vivo. Mobile con actualización automática de pantallas (Home, Profile, Progress). Eliminación de dependencias de refetch manual. Sistema totalmente integrado con lógica de gamificación completa. |
| 1.1.0 | Principios 11/2025 | Gamificación Avanzada y Consistencia Visual | Implementación de Rewards 2.0: inventario de recompensas, efectos asociados (multiplicadores, streak savers), cooldowns y reglas anti-abuso. Daily Challenges integrados al flujo del usuario con impacto en tokens, progreso y rachas. Achievements con desbloqueo vinculado a eventos (asistencias, retos, progreso). Progreso semanal y físico más completo con registros diferenciados para usuarios free vs premium. Refactor de mobile con patrón visual consistente (tipografías, colores, layout). Ajustes visuales en Admin y Landing para experiencia homogénea. |
| 1.0.0 | Octubre 2025 | Core Funcional Estable | Primer release estable a nivel núcleo. Contratos REST estabilizados (requests/responses coherentes). Lógica principal completa: Auth con JWT estable, Gyms (detalles, horarios), Assistance/check-in, progreso básico, gamificación inicial (tokens diarios). Panel Admin con gestión operativa de gyms y usuarios sobre datos reales. Mobile con flujo básico funcional: login, ver gimnasios, registrar asistencias, ver progreso simple. Integración Landing → Admin para gestionar solicitudes de gimnasios. Comportamiento estable en flujos clave. |
| 0.5.0 | Septiembre 2025 | Refactor BD y Datos Consistentes | Hito técnico crítico. Refactorización fuerte de base de datos y migraciones para asegurar consistencia. Revisión completa de tablas y relaciones. Normalización y corrección de claves foráneas. Ajustes para mejor representación de cuentas, usuarios y relaciones con gyms, asistencias. Adaptación de modelos y servicios al nuevo esquema. Limpieza de código relacionado con consultas y mapeos. Ajustes en mobile y admin para consumir cambios de esquema. Resultado: datos coherentes con modelo de negocio, base sólida sin "heridas" en BD. |
| 0.4.0 | Agosto 2025 | Primeras Pantallas Mobile y Panel Admin | Plataforma visible para usuario: mobile, landing y admin muestran datos reales. Mobile: implementación de primeras screens reales (Home, login, listado de gyms, vista básica de progreso) con consumo de endpoints reales del backend. Landing: finalización de primera versión funcional (estructura, secciones, formularios básicos). Panel Admin: creación del panel de administración con vistas para listar y gestionar gyms y usuarios. Backend: reglas iniciales de tokens diarios y primer boceto de streaks. |
| 0.3.0 | Julio 2025 | Primer Frontend y Dockerización | Inicio del trabajo en interfaz de usuario y dockerización del entorno. Frontend: estructura de Landing Page con Vite + React, diseño de wireframes para app mobile (pantallas y navegación inicial). Infraestructura: Dockerización del backend y base de datos, scripts para levantar entorno local completo con un solo comando. Backend: ajustes en endpoints para facilitar integración con futuras pantallas mobile/admin. |
| 0.2.0 | Junio 2025 | Autenticación JWT y Backend Ampliado | Backend pasa de pruebas simples a MVP técnico con autenticación JWT. Auth: implementación de JWT para login, middleware de protección de rutas privadas. Lógica de negocio: endpoints más completos para Gyms (detalles, horarios básicos), lógica inicial de Assistance/check-in. Backend: mejora de estructura de controladores y servicios para prepararse para consumo de frontends. |
| 0.1.0 | Mayo 2025 | Backend Base y Modelo de Datos | Primer hito interno. Creación del proyecto backend con Node.js + Express y definición del modelo de datos inicial. Backend: proyecto base con Express, configuración de Sequelize como ORM, primeros endpoints CRUD mínimos para users y gyms. Base de datos: modelo inicial diseñado en MySQL Workbench, tablas básicas (usuarios, gimnasios, asistencias estructura simple). Infraestructura: definición de estructura de carpetas y configuración básica de entorno local. |

---

## Información del Proyecto

### Objetivo del Producto
GymPoint es una plataforma de **gamificación para gimnasios**, que combina:
- Registro de asistencias y control de aforo
- Rachas (streaks), tokens y recompensas (rewards)
- Rutinas y entrenamientos (workouts)
- Progreso semanal y progreso físico
- Desafíos diarios (Daily Challenges) y logros (Achievements)
- Panel de administración para gestión de gimnasios, usuarios y métricas
- Actualizaciones en tiempo real mediante WebSockets

### Módulos Principales
- Auth / Accounts & Profiles
- Roles / RBAC
- Gyms (detalles, horarios, servicios especiales)
- Reviews / Ratings
- Presence / Aforo
- Assistance (check-in de asistencias)
- Routines & Workouts
- Progress (semanal y físico)
- Streaks
- Rewards / Tokens / Ledger
- Daily Challenges
- Achievements
- Notifications
- WebSockets / Realtime
- Panel Admin
- Landing pública

### Apps dentro del Monorepo
- **Backend**: Node.js + Express
- **Mobile App**: Expo React Native
- **Panel Admin**: React + Vite
- **Landing**: Vite + React
- **Shared**: tipos y modelos compartidos

---

## Estrategia de Versionado

Se adopta una convención similar a **Semantic Versioning**, adaptada al contexto del proyecto:

- **Mayor (X.0.0)**: Cambios de alto impacto
  - Modificación de contratos REST (request/response)
  - Cambios en eventos/rooms de WebSockets que rompen compatibilidad
  - Cambios en base de datos sin migración retrocompatible
  - Cambios profundos en identidad (Accounts/Profiles) o semántica de tokens/ledger

- **Menor (0.X.0)**: Nuevas funcionalidades o módulos importantes sin romper compatibilidad
  - Nuevos módulos (ej. gamificación avanzada, progress físico)
  - Integración de nuevas pantallas en mobile/admin manteniendo APIs

- **Parche (0.0.X)**: Correcciones de bugs, ajustes visuales o mejoras de rendimiento sin cambios de contrato

---

## Estado Actual del Proyecto

- **Versión actual**: 1.2.0
- **Última actualización**: 12 de noviembre de 2025
- **Estado**: Cierre funcional alcanzado

### Situación al Cierre Funcional (12/11/2025)
- Backend, mobile, admin y landing totalmente integrados
- Lógica de negocio de gamificación completa (rewards, streaks, challenges, achievements)
- Progreso semanal/físico consistente
- Actualizaciones en tiempo real implementadas de punta a punta

---

## Líneas Futuras

Aunque el proyecto alcanza su cierre funcional en la versión 1.2.0, se identifican posibles líneas de trabajo futuras:

- Extender WebSockets a más vistas secundarias si aparecen nuevas necesidades
- Profundizar en analíticas avanzadas (reportes, dashboards más complejos)
- Mejoras en accesibilidad y soporte multilenguaje
- Mayor automatización de tests (unitarios, integración y E2E) sobre todos los módulos

---

## Notas

> Los números de versión definidos representan **hitos lógicos de documentación**. No necesariamente coinciden con tags reales del repositorio, pero representan etapas claras de avance del proyecto.

Este documento sirve tanto como historial de cambios como base para futuras iteraciones, auditorías técnicas o entregas académicas.
