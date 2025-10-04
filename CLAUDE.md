# claude.md — **Contrato No Negociable (GymPoint Backend)**

> **Propósito & precedencia.** Este documento define **reglas obligatorias** para trabajar en el **backend** de GymPoint. Si cualquier instrucción (Project/User Rules, prompts, PRs) contradice algo aquí, **prevalece este archivo**.

## 1) Alcance, stack y compatibilidad del repo
- **Ámbito:** solo **backend**. No tocar web/móvil salvo **contratos (OpenAPI)**.
- **Stack actual:** Node.js **CommonJS**, **Express 5**, **Sequelize**, **MySQL 8.x**.
- **Compatibilidad:** **no renombrar** carpetas/archivos públicos ni cambiar rutas existentes. Mantener layout `controllers/`, `services/`, `models/`, `routes/`, `middlewares/`, `utils/`, `migrations/`.

## 2) Arquitectura (3 capas estrictas)
- **Controllers (I/O HTTP):** validan y mapean; **sin** lógica de negocio; **sin** SQL/ORM.
- **Services (dominio):** orquestan casos de uso; **sin** dependencias de HTTP/Express.
- **Data (Sequelize):** acceso a datos; **sin** reglas de negocio.

## 3) Boot & migraciones (obligatorio)
- Usar **Umzug + Sequelize** y **correr migraciones antes** de `app.listen()`.
- Migraciones **idempotentes** y **transaccionales**; no romper datos existentes.
- Scripts mínimos:
  - `migrator.js` (Umzug + SequelizeStorage)
  - `migrate.js` (authenticate → pending → up)
  - Ejecutar `node migrate.js` en el arranque (Docker/script).

## 4) Autenticación & sesiones (dos flujos)
- **Local:** `email + password` (bcrypt 12–14).
- **Google:** `POST /auth/google { idToken }` (verificar audience; `email_verified`).
- **JWT:** `access=15m`, `refresh=30d` con **rotación**. Persistir refresh:
  `{ userId, userAgent, ipAddress, expiresAt, revoked }`.
- **Endpoints mínimos:** `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh` (rota), `/auth/logout` (revoca), `/me`, `DELETE /me`.

## 5) Invariantes de dominio (deben cumplirse)
- **Búsqueda de gimnasios:** query con `lat,lng,radiusKm` (+ filtros).  
  **Pre-filtro**: **bounding box** en DB → **orden final** por **Haversine**. Paginado; `limit ≤ 50`.
- **Membresía a gym:** asociación idempotente (si ya existe, no duplicar).
- **Asistencia:** válida si `distance ≤ PROXIMITY_M` (configurable, 150–200 m).  
  **Máx. 1/día/gym**; idempotente por `(userId,gymId,YYYY-MM-DD)`.
- **Racha (global):** ayer ⇒ `+1`; hueco >1 día ⇒ **se rompe** (salvo recuperación por recompensa).
- **Frecuencia semanal:** `weeklyTarget ≥ 1`; contar `assistCount` semanal; **bonus** al cumplir (cron semanal en TZ del proyecto).
- **Rutinas:** para premiar, una rutina debe tener **≥ 3 ejercicios**; al **completar**, otorgar tokens (idempotencia por key natural o `idempotencyKey`).
- **Tokens & Ledger:** saldo **no negativo**; registrar `{ delta, reason, refType, refId, balance_after }`.  
  **Transacción DB** obligatoria en asistencia, completion, canje, bonus. Usar **SELECT FOR UPDATE** donde aplique (stock/canje).
- **Recompensas:** proveedor `system|gym`; canje con `stock` (si finito) y estados `pending|redeemed|revoked` con ajuste de ledger correspondiente.
- **Suscripciones a gym (opcional):** lifecycle `pending|active|cancelled`.

## 6) Seguridad mínima
- **Helmet**, **CORS** con allowlist, **rate-limit** en `/auth/*`.
- **Logs**: estructurados con `requestId`; **no** loggear PII ni tokens en claro (opcional hash de refresh).
- **RBAC**: `FREE|PREMIUM|ADMIN`; proteger endpoints admin.

## 7) Contratos, pruebas, observabilidad y SLO
- **OpenAPI** actualizado con cada cambio; `/docs` (Swagger UI).
- **Pruebas:**  
  - **Unit** en services (≥ **80%** de cobertura en services).  
  - **Integración** básica para `auth/assistances/rewards`.
- **Salud:** `/health` (liveness) y `/ready` (DB + migraciones OK).
- **Rendimiento objetivo:** `/gyms/search` p50 < **200 ms** local (datos mock/índices).

## 8) Estilo y calidad de código
- **Módulos objetivo ≤ 80 LOC** (exceder solo con justificación en PR).
- Nombres claros > comentarios redundantes. Comentarios solo en partes no obvias.
- Convenciones: archivos `kebab-case`; variables/funciones `camelCase`; clases/modelos `PascalCase`; constantes `UPPER_SNAKE_CASE`.

## 9) Definition of Done (cada cambio debe incluir)
1. Migraciones (si aplica) **+** código.
2. **OpenAPI** actualizado.
3. **Tests** (unit; y si toca endpoints críticos, integración).
4. **README** o notas de despliegue.
5. Sin romper rutas/contratos públicos existentes.

## 10) Configuración (ENV sugeridos)
```
PORT=3000
NODE_ENV=development
DB_HOST=db
DB_PORT=3306
DB_NAME=gympoint
DB_USER=root
DB_PASSWORD=******
JWT_SECRET=******
JWT_REFRESH_SECRET=******
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
GOOGLE_CLIENT_ID=******.apps.googleusercontent.com
CORS_ORIGIN=https://app.example,https://web.example
PROXIMITY_M=180
TOKENS_ATTENDANCE=5
TOKENS_WORKOUT_COMPLETED=10
WEEKLY_GOAL_BONUS=20
TIMEZONE=America/Argentina/Cordoba
```

## 11) Errores (formato uniforme)
```json
{ "error": { "code": "ATTENDANCE_TOO_FAR", "message": "You are too far from the gym." } }
```
Usar **códigos semánticos**; mapear excepciones a HTTP consistente.

## 12) **Entrega incremental (fases sugeridas)**
- **Fase 0 (Infra):** Umzug en boot, `/health` y `/ready`, logging con `requestId`.
- **Fase 1 (Auth):** local + Google, refresh rotativo, logout, `DELETE /me`.
- **Fase 2 (Gyms):** search (bbox + Haversine), detail, membresía.
- **Fase 3 (Core):** asistencia + racha + weekly target + ledger (tokens).
- **Fase 4 (Rutinas):** crear/importar, completar (idempotencia) + tokens.
- **Fase 5 (Rewards):** catálogo, claim/redeem/revoke con stock y ledger.
- **Fase 6 (Admin):** CRUD gyms, stats, ajustes de tokens.

## 13) Prohibido
- Migrar a TS/ESM o reestructurar carpetas **sin** pedido explícito.
- Introducir breaking changes en rutas/contratos **sin** versión nueva/documentación.
- Loggear PII/tokens; ejecutar consultas con strings concatenados (siempre parámetros).

---

### Anexo (opcional) — **Hook “Repository-light” sin big-bang**
> **Usar solo donde duela** (p. ej., búsqueda por mapa y canjes).
- Definir pequeñas **interfaces** (p. ej., `GymsRepo`, `RewardsRepo`) consumidas por los **services**.
- Implementar las interfaces con **Sequelize** en `data/` (o `infra/data/`), archivos **≤ 80 LOC**.
- Beneficios: tests más simples (dobles), queries complejas encapsuladas, **sin** reestructurar todo el repo.
