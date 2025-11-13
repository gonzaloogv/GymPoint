# GYMPOINT – Evolución del Proyecto e Historial de Cambios

## 1. Introducción

Este documento resume la evolución del proyecto **GymPoint** desde sus inicios en **mayo de 2025** hasta el **cierre funcional** alcanzado el **12 de noviembre de 2025**.

El objetivo principal es dejar documentado:

- Cómo fue creciendo el sistema mes a mes.
- Qué hitos técnicos y funcionales se alcanzaron.
- Un **historial de versiones** claro y práctico para lectura académica o técnica.

> Nota: Los números de versión definidos a continuación son **hitos lógicos de documentación**. No necesariamente coinciden con tags reales del repositorio, pero representan etapas claras de avance del proyecto.

---

## 2. Alcance funcional del sistema

**Objetivo del producto:**
GymPoint es una plataforma de **gamificación para gimnasios**, que combina:

- Registro de asistencias y control de aforo.
- Rachas (streaks), tokens y recompensas (rewards).
- Rutinas y entrenamientos (workouts).
- Progreso semanal y progreso físico.
- Desafíos diarios (Daily Challenges) y logros (Achievements).
- Panel de administración para la gestión de gimnasios, usuarios y métricas.
- Actualizaciones en tiempo real mediante **WebSockets**.

**Módulos principales:**

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

**Apps dentro del monorepo:**

- **Backend**: Node.js + Express
- **Mobile App**: Expo React Native
- **Panel Admin**: React + Vite
- **Landing**: Vite + React
- **Shared**: tipos y modelos compartidos

---

## 3. Estrategia de versionado

Se adopta una convención similar a **Semantic Versioning**, adaptada al contexto del proyecto:

- **Mayor (X.0.0)**
  - Cambios de alto impacto:
    - Modificación de contratos REST (request/response).
    - Cambios en eventos/rooms de WebSockets que rompen compatibilidad.
    - Cambios en base de datos sin migración retrocompatible.
    - Cambios profundos en identidad (Accounts/Profiles) o semántica de tokens/ledger.

- **Menor (0.X.0)**
  - Nuevas funcionalidades o módulos importantes **sin romper** compatibilidad:
    - Nuevos módulos (ej. gamificación avanzada, progress físico).
    - Integración de nuevas pantallas en mobile/admin manteniendo APIs.

- **Parche (0.0.X)**
  - Correcciones de bugs, ajustes visuales o mejoras de rendimiento **sin cambios de contrato**.

En este documento se resumen **grandes hitos** usando principalmente versiones **Mayor** y **Menor**, para que la documentación sea clara y manejable.

---

## 4. Evolución mensual del proyecto (Mayo – Noviembre 2025)

### Mayo 2025 – Cimientos del backend y modelo de datos

- Definición del concepto de plataforma: gamificación para gimnasios con asistencia, rachas y tokens.
- Diseño inicial de la **base de datos** en MySQL Workbench:
  - Primeras tablas para usuarios, gimnasios, asistencias y relaciones básicas.
- Creación del **backend**:
  - Proyecto base con **Node.js + Express**.
  - Configuración de **Sequelize** como ORM.
  - Primeros endpoints CRUD mínimos (usuarios, gyms) para pruebas internas.
- Organización inicial del monorepo y del entorno de desarrollo local.

---

### Junio 2025 – Backend funcional mínimo y autenticación

- Ampliación del backend:
  - Endpoints más completos para **Gyms** (detalles, horarios básicos).
  - Lógica inicial de **Assistance / check-in** (registro de entrada).
- Implementación de **JWT**:
  - Sustitución de la auth básica por **autenticación JWT**.
  - Middleware de protección para rutas privadas.
- Preparación de tipos/modelos pensados para ser consumidos luego por mobile y admin.

---

### Julio 2025 – Primer frontend y Dockerización

- Inicio del **frontend**:
  - Estructura de la **Landing Page** (Vite + React).
  - Diseño de **wireframes** para la app mobile (pantallas y navegación base).
- Infraestructura:
  - Introducción de **Docker** para el entorno local:
    - Dockerización del backend.
    - Dockerización de la base de datos.
  - Se asegura que todo el equipo pueda levantar el entorno de la misma forma.
- Backend:
  - Ajustes en endpoints y modelos para alinearse mejor con el dominio del negocio.

---

### Agosto 2025 – Primeras pantallas reales + panel admin

- **Mobile**:
  - Implementación de **primeras pantallas reales** (Home, login, listado de gyms, vista simple de progreso).
  - Integración inicial con el backend (ya no sólo mocks).
- **Landing**:
  - Finalización de la primera versión funcional de la landing (estructura, secciones, formulario básico).
- **Panel Admin**:
  - Creación del **panel de administración**:
    - Vistas para administrar gyms y usuarios.
    - Acceso a datos reales del backend.
- Backend:
  - Reglas iniciales de **tokens diarios** y primeras ideas de streaks.

---

### Septiembre 2025 – Refactor de base de datos y datos consistentes

- Se detectan **inconsistencias** en datos de la BD debido a la evolución rápida del modelo.
- Se realiza una **refactorización fuerte de migraciones**:
  - Ajuste de tablas, claves foráneas y normalización.
  - Separación más clara de entidades relacionadas con usuarios y perfiles.
- Resultado:
  - Base de datos con datos **consistentes y alineados** con el modelo de negocio.
- En paralelo:
  - Se sigue afinando el backend.
  - Se preparan cambios para integrar mobile y admin de forma más robusta.

---

### Octubre 2025 – Core funcional estable

- Continuación y consolidación de la refactorización de datos y modelos.
- Backend:
  - Contratos REST estabilizados (requests/responses coherentes).
  - Lógica de negocio principal consistente:
    - Auth con JWT estable.
    - Gyms, asistencias, progreso básico y primera versión de gamificación.
- Frontends:
  - Mobile y Admin adaptados a los contratos estables del backend.
  - Integración real Landing → Admin para gestionar solicitudes de gimnasios.
- Este mes marca el **primer corte "1.0.0"**: sistema funcionalmente completo a nivel núcleo (sin realtime aún).

---

### Noviembre 2025 – Gamificación avanzada y Realtime (cierre funcional)

- Principios de noviembre:
  - **Gamificación avanzada**:
    - Rewards con reglas más ricas (inventario, cooldown, efectos).
    - Daily Challenges integrados en el flujo diario del usuario.
    - Achievements conectados a eventos de uso (asistencias, progreso, retos).
    - Progreso semanal y físico más completo.
  - **Consistencia visual**:
    - Refactor de mobile para adoptar un **patrón visual consistente**.
    - Ajustes de UI/UX en Admin y Landing para una experiencia más homogénea.
- 12 de noviembre:
  - Integración de **WebSockets** en todo el monorepo:
    - Eventos en tiempo real para tokens, progreso, asistencias, reviews, estado premium, etc.
    - Admin recibe requests y métricas sin necesidad de refrescar.
    - Mobile actualiza pantallas clave sin refetch manual.
  - Este hito se considera el **cierre funcional del proyecto**.

---

## 5. Historial de versiones (hitos de documentación)

A continuación se presenta un historial de versiones **resumido y práctico**, que agrupa los avances clave del proyecto.

> Importante: Estas versiones representan **hitos lógicos** definidos para documentar el avance; no son necesariamente tags reales del repositorio.

---

### 0.1.0 – Backend base y modelo de datos
**Fecha aproximada:** Mayo 2025
**Tipo:** Menor (0.X.0) – Primer hito interno

**Resumen:**
Creación del proyecto backend con Node.js + Express y definición del modelo de datos inicial.

**Cambios principales:**

- Backend:
  - Proyecto base con Express.
  - Configuración de Sequelize como ORM.
  - Primeros endpoints CRUD mínimos para `users` y `gyms`.
- Base de datos:
  - Modelo inicial diseñado en MySQL Workbench.
  - Tablas básicas: usuarios, gimnasios, asistencias (estructura simple).
- Infraestructura:
  - Definición de estructura de carpetas y configuración básica de entorno local.

**Pendientes en esta etapa:**

- Autenticación real.
- Frontend (mobile/admin/landing).
- Gamificación (tokens, rachas, rewards).

---

### 0.2.0 – Autenticación con JWT y backend ampliado
**Fecha aproximada:** Junio 2025
**Tipo:** Menor (0.X.0)

**Resumen:**
El backend pasa de pruebas simples a un **MVP técnico** con autenticación JWT.

**Cambios principales:**

- Auth:
  - Implementación de **JWT** para login.
  - Middleware de protección de rutas privadas.
- Lógica de negocio:
  - Endpoints más completos para **Gyms** (detalles, horarios básicos).
  - Lógica inicial de **Assistance / check-in**.
- Backend:
  - Mejora de estructura de controladores y servicios para prepararse para consumo de frontends.

**Pendientes:**

- Frontend (landing, mobile, admin).
- Reglas de gamificación y progreso.

---

### 0.3.0 – Primer frontend y Dockerización
**Fecha aproximada:** Julio 2025
**Tipo:** Menor (0.X.0)

**Resumen:**
Se inicia el trabajo en la interfaz de usuario y se dockeriza el entorno.

**Cambios principales:**

- Frontend:
  - Estructura de la **Landing Page** con Vite + React.
  - Diseño de **wireframes** para la app mobile (pantallas y navegación inicial).
- Infraestructura:
  - **Dockerización** del backend y de la base de datos.
  - Scripts para levantar el entorno local completo con un solo comando.
- Backend:
  - Ajustes en endpoints para facilitar integración con futuras pantallas mobile/admin.

**Pendientes:**

- Pantallas reales en mobile.
- Panel admin funcional.
- Gamificación 1.0.

---

### 0.4.0 – Primeras pantallas mobile y panel admin inicial
**Fecha aproximada:** Agosto 2025
**Tipo:** Menor (0.X.0)

**Resumen:**
La plataforma comienza a ser visible para el usuario: mobile, landing y admin ya muestran datos reales.

**Cambios principales:**

- Mobile:
  - Implementación de **primeras screens** (Home, login, listado de gyms, alguna vista básica de progreso).
  - Consumo de endpoints reales del backend.
- Landing:
  - Finalización de la **primera versión funcional** (estructura, secciones, formularios básicos).
- Panel Admin:
  - Creación del **panel de administración**:
    - Vistas para listar y gestionar gyms y usuarios.
- Backend:
  - Reglas iniciales de **tokens diarios** y primer boceto de streaks.

**Pendientes:**

- Madurar el modelo de datos (se detectan posibles inconsistencias).
- Progreso semanal y físico más claro.
- Gamificación más robusta.

---

### 0.5.0 – Refactor de base de datos y datos consistentes
**Fecha aproximada:** Septiembre 2025
**Tipo:** Menor (0.X.0) – Hito técnico crítico

**Resumen:**
Se realiza una refactorización fuerte de la base de datos y migraciones para asegurar consistencia de datos.

**Cambios principales:**

- Base de datos:
  - Revisión completa de tablas y relaciones.
  - Normalización y corrección de claves foráneas.
  - Ajustes para representar mejor cuentas, usuarios y relaciones con gyms, asistencias, etc.
- Backend:
  - Adaptación de modelos y servicios al nuevo esquema.
  - Limpieza de código relacionado con consultas y mapeos.
- Frontends:
  - Ajustes puntuales en mobile y admin para consumir los cambios de esquema.

**Resultado:**

- Datos coherentes con el modelo de negocio.
- Base sólida para seguir creciendo sin "heridas" en la BD.

---

### 1.0.0 – Core funcional estable
**Fecha aproximada:** Octubre 2025
**Tipo:** Mayor (1.0.0) – Primer release "estable" a nivel núcleo

**Resumen:**
La plataforma alcanza un **núcleo funcional estable**: backend, mobile, admin y landing integrados sobre contratos REST consistentes.

**Cambios principales:**

- Backend:
  - Contratos REST estabilizados (requests/responses coherentes).
  - Lógica principal de:
    - Auth con JWT estable.
    - Gyms (detalles, horarios).
    - Assistance / check-in.
    - Progreso básico.
    - Gamificación inicial (tokens diarios).
- Panel Admin:
  - Gestión operativa de gyms y usuarios sobre datos reales.
- Mobile:
  - Flujo básico de usuario funcional: login, ver gimnasios, registrar asistencias y ver progreso simple.
- Landing:
  - Integración **Landing → Admin** para gestionar solicitudes de gimnasios u onboarding.
- Calidad:
  - Comportamiento estable en flujos clave (login, asistencia, navegación principal).

**Pendientes:**

- Gamificación avanzada (rewards, challenges, achievements).
- Progreso físico más rico.
- Actualizaciones en tiempo real (WebSockets).
- Consistencia visual más pulida (sobre todo en mobile).

---

### 1.1.0 – Gamificación avanzada y consistencia visual
**Fecha aproximada:** Principios de Noviembre 2025
**Tipo:** Menor (1.1.0)

**Resumen:**
Se incorporan las piezas clave de gamificación y se refina fuertemente la experiencia de usuario.

**Cambios principales:**

- Gamificación:
  - **Rewards 2.0**:
    - Inventario de recompensas.
    - Efectos asociados (ej. multiplicadores, streak savers, etc.).
    - Cooldowns y reglas para evitar abuso.
  - **Daily Challenges**:
    - Desafíos diarios integrados al flujo normal del usuario.
    - Impacto en tokens, progreso y rachas.
  - **Achievements**:
    - Desbloqueo de logros vinculado a eventos (asistencias, retos, progreso).
- Progreso:
  - **Progreso semanal** y **progreso físico** más completos:
    - Registros diferenciados para usuarios free vs premium.
    - Métricas más claras para el usuario.
- UI/UX:
  - Refactor de mobile con **patrón visual consistente**:
    - Tipografías, colores, layout.
  - Ajustes visuales en Admin y Landing para unificar la experiencia.

**Pendientes:**

- Integrar todos estos eventos de gamificación en una capa de **tiempo real**.
- Ajustes finos en métricas y resúmenes (por ejemplo, weekly progress en vivo).

---

### 1.2.0 – Realtime de punta a punta (WebSockets E2E)
**Fecha:** 12 de Noviembre de 2025
**Tipo:** Menor (1.2.0) – Cierre funcional del proyecto

**Resumen:**
Se integra **WebSockets** en todo el monorepo, logrando una experiencia en tiempo real sin necesidad de refrescar manualmente.

**Cambios principales:**

- WebSockets / Realtime:
  - Configuración de servidor de WebSockets asociado al backend.
  - Autenticación del handshake mediante JWT.
  - Definición de **rooms/canales** por usuario, por admin y por recursos (gyms, etc.).
  - Eventos en tiempo real, por ejemplo:
    - `user:tokens:updated`
    - `user:subscription:updated`
    - `user:profile:updated`
    - `attendance:recorded`
    - `progress:weekly:updated`
    - `review:created` / `review:updated`
    - `gym:rating:updated`
- Admin:
  - Panel que muestra:
    - Requests de gyms en vivo.
    - Métricas y cambios sin necesidad de recargar la página.
  - Toasters y estados de UI que reaccionan a eventos en tiempo real.
- Mobile:
  - Pantallas como Home, Profile y Progress se actualizan automáticamente cuando:
    - Cambian tokens.
    - Cambia el estado premium.
    - Se registra una asistencia.
    - Se aplica una recompensa.
- UX:
  - Eliminación de dependencias fuertes de "refetch manual".
  - Experiencia más fluida, alineada con el objetivo de tener un sistema activo y responsivo.

**Situación al cierre funcional (12/11):**

- Backend, mobile, admin y landing **totalmente integrados**.
- Lógica de negocio de gamificación completa (rewards, streaks, challenges, achievements).
- Progreso semanal/físico consistente.
- Actualizaciones en tiempo real implementadas de punta a punta.

---

## 6. Pendientes y líneas futuras

Aunque el proyecto alcanza su **cierre funcional** en la versión 1.2.0, se identifican posibles líneas de trabajo futuras:

- Extender WebSockets a más vistas secundarias si aparecen nuevas necesidades.
- Profundizar en analíticas avanzadas (reportes, dashboards más complejos).
- Mejoras en accesibilidad y soporte multilenguaje.
- Mayor automatización de tests (unitarios, integración y E2E) sobre todos los módulos.

---

## 7. Conclusión

Este documento deja trazado:

- **Cómo** creció GymPoint desde mayo de 2025.
- **Qué** hitos técnicos y funcionales se lograron.
- **Cuándo** se alcanzó el cierre funcional (12/11/2025) con WebSockets integrados.

Sirve tanto como **historial de cambios** como base para futuras iteraciones, auditorías técnicas o entregas académicas.
