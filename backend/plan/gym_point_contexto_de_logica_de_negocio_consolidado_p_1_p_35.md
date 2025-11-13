# GymPoint — Contexto de Lógica de Negocio (consolidado p1…p35)

**Fecha:** 2025-10-22\
**Alcance:** reglas de negocio, flujos y restricciones para generar Services, Controllers y DTOs (OpenAPI-first).\
**Fuente:** respuestas p1…p35 del cuestionario.

---

## 0) Convenciones globales

- **Auth**: login permitido aun con `email_verified=false`. `last_login` se actualiza en **cada request** (histórico), no solo en login.
- **Premium requiere email verificado**: si `email_verified=false`, no se permite upgrade a Premium ni el uso de features Premium.
- **Tokens (moneda interna)**: no expiran; tope global por usuario: **1,000,000**. Todos los movimientos via **TokenLedger** y transacciones ACID.
- **Paginación**: límite TBD. Exponer `page`, `limit`, `sortBy`, `order`.
- **Soft-delete de cuentas**: request de borrado crea estado `PENDING`, desactiva cuenta y auto-elimina pasados **30 días** salvo cancelación.
- **Subscripciones a gyms**: máximo **2** activas por usuario, renovación **manual**.
- **Favoritos**: solo usuarios de app; máximo **5**.
- **Reviews**: cualquier usuario verificado por correo puede escribir hasta **3 por gym**; moderación automática por insultos y manual por Admin.
- **Medios de pago Premium**: objetivo futuro usar Google Pay / App Store; MP queda posible para gyms.
- **Tiempos geofence**: `min_stay_minutes` configurable; auto-checkout después de **60 min** sin actualización de ubicación o por reglas de duración (ver §4).

---

## 1) Autenticación y cuentas

### UC-AUTH-01 — Registro

**Flujo**

1. Validar email único.
2. Hashear password.
3. Crear `Account (email_verified=false, is_active=true)`.
4. Crear `UserProfile`.
5. Asignar `Role: USER`.
6. Crear `Streak` inicial.
7. Crear `Frequency` inicial.
8. Crear `UserNotificationSettings` por defecto.
9. Enviar verificación por email.
10. Emitir `access` y `refresh` tokens.

**Errores**: si falla en paso 5 o posterior, **rollback total**.\
**Login previo a verificación**: **permitido**.

### UC-AUTH-02 — Login

**Flujo**

1. Email → `Account`.
2. Validar password.
3. No se bloquea por `email_verified`.
4. Actualizar `last_login`.
5. Generar `access` y `refresh` tokens.
6. Responder `{ user, tokens }`.

**Sesiones**: hasta **3 refresh tokens** activos por usuario (lógica por implementar).\
``: se actualiza **en cada request**.

### UC-AUTH-03 — Refresh token

- Duración `refresh`: **30 días**.
- Entrega nuevo `access`.
- **Rotación**: **no** por ahora (pendiente de diseño futuro).

### UC-AUTH-04 — Google OAuth

**Flujo**

1. Validar ID token. Email, nombre, foto.
2. Si existe por `google_id` → login.
3. Si no existe, buscar por email:
   - Si existe → **vincular automáticamente** `google_id` a la cuenta.
   - Si no existe → crear cuenta `auth_provider='google'`, `email_verified=true`, crear `UserProfile`, `Streak`, `Frequency`, `Settings`.
4. Retornar tokens.

### UC-AUTH-05 — Eliminación de cuenta

**Flujo**

1. Usuario solicita DELETE → `AccountDeletionRequest(status=PENDING)`.
2. `is_active=false` inmediato.
3. Ventana **30 días** para cancelar.
4. Admin **puede** aprobar/rechazar, **no es necesario**: auto-elimina al día 30.

**Retención**: mantener **reviews** y **registro del total de tokens con que se eliminó**; resto según políticas del admin.

---

## 2) Perfil y Premium

### UC-USER-01 — Editar perfil

Campos editables (ejemplo del cuestionario):

```
- name, lastname ✅
- gender ✅
- birth_date ✅
- locality ✅
- profile_picture_url ✅
- email ❌ (requiere verificación)
- tokens ❌ (solo por sistema)
```

Si cambia **email** → `email_verified=false`, enviar nuevo mail de verificación; el usuario **puede loguearse** igual. Mientras `email_verified=false`, **no puede comprar ni usar Premium**.

### UC-USER-02 — Upgrade a Premium

**Precondición:** `email_verified=true`. Si `false` → `403 PRECONDITION_FAILED` (`EMAIL_NOT_VERIFIED`), reenviar mail de verificación.

**Flujo (ejemplo):**

```
1. Usuario inicia pago (Mercado Pago o Store).
2. Crear registro Payment (status: PENDING).
3. Webhook confirma (status: APPROVED).
4. Actualizar UserProfile → app_tier='PREMIUM', premium_since=today.
5. Dar tokens de bienvenida.
6. Notificar usuario.
```

Beneficios Premium: >5 rutinas, auto-checkin habilitado, sin anuncios, estadísticas avanzadas, rutinas exclusivas, **tokens x2** periódicos.\
Al expirar Premium: volver a Free, avisar antes de expirar, **pierde** acceso a features.

---

## 3) Catálogo de Gyms

### UC-GYM-01 — Listar gyms

Filtros (ejemplo del cuestionario):

```
- Por ciudad ✅
- Por nombre (búsqueda parcial) ✅
- Por distancia (latitude, longitude, radius) ✅
- Por tipo (FUNCIONAL, CROSSFIT) ✅
- Por servicios (WiFi, Ducha, Estacionamiento) ✅
- Solo verificados ✅
- Solo featured ✅
- Por rango de precio (min_price, max_price) ✅
```

Orden por distancia requiere `lat,lng`.\
Límite/paginación: **TBD**.

### UC-GYM-02 — Detalle de gym

Incluir: datos básicos, tipos, amenities, fotos, equipamiento, horarios y especiales, precios, rating y reviews, si tiene auto-checkin, verificado, si el usuario está suscrito, si es favorito.\
Usuarios anónimos: **no** ven detalle completo (requiere autenticación).

### UC-GYM-03 — Favoritos

Solo usuarios autenticados.\
Límite: **5**.\
Afecta orden en búsquedas: **sí**, priorizar favoritos del usuario cuando aplique.

### UC-GYM-04 — Reviews

Cualquier usuario con correo verificado puede reseñar, **no necesita asistencia previa**.\
Hasta **3 reviews** por gym.\
Validar 1–5 estrellas; filtro de insultos. Si insulta **≥3** veces → sanción: 30 días solo estrellas, sin texto.\
Admin ve todas y **puede eliminar**; no se notifica al gym.\
Ediciones ilimitadas; recalcular `GymRatingStats` en cada edición.

### UC-GYM-06 — Suscripción a gym

Usuario puede asociarse a **máximo 2** gyms en paralelo.\
No requiere pago para asociarse, pero puede pagar; se notifica al gym por **WhatsApp** y **email**.\
Renovación: **manual**.

---

## 4) Presencia, asistencias y check-in/out

### UC-PRESENCE-01 — Geofencing

La app envía ubicación; backend calcula distancias.

- Si dentro de radio y sin otra presencia activa → crear `Presence(status=DETECTING)`, iniciar temporizador `min_stay_minutes`.
- Si permanece ≥ `min_stay_minutes` → `Presence→CONFIRMED`, crear `Assistance(auto_checkin=true)`, marcar `converted_to_assistance`, **incrementar Streak**.
- Si hay dos gyms en rango → elegir **más cercano**; si luego se acerca a otro, **cambiar automáticamente** y reiniciar ventana si **no** se creó `Assistance`.
- `exited_at`: al salir del radio **o** tras **60 min** sin update.

### UC-PRESENCE-02 — Check-in manual

Permitido.\
Validar cercanía: **sí**.\
Si estaba en `DETECTING`: convertir a `CONFIRMED` y **crear **``** inmediata**.

### UC-PRESENCE-03 — Check-out

Check-out manual permitido.\
Registrar `check_out_time`, `duration_minutes` (auto). Actualizar `Presence.exited_at`.\
Validaciones: **mínimo 8 minutos**, **máximo 3 horas**. Auto-checkout por máximo.

---

## 5) Streaks y frecuencia

### UC-STREAK-01 — Lógica

Días de descanso **no** cuentan como gap.\
La racha se rompe solo si **no** se cumple la **frecuencia semanal**.\
Streak **incrementa por día**. Al registrar una asistencia, actualizar el valor del día.\
`Recovery items`: el usuario puede comprar con tokens hasta **5 por mes**. No puede acumular >5. Puede consumir uno y volver a comprar dentro del mismo mes.

### UC-FREQ-01 — Cron semanal (lunes 00:05)

Si `assist < goal` de la semana → romper racha (guardar `last_value`, reset).\
Registrar `FrequencyHistory`.\
Resetear contadores semanales.\
Cambios de `goal` en mitad de semana: **aplican la semana siguiente**.\
Si cambió de 3 a 5 y llevaba 3, **mantiene** streak (cumplió meta original).

---

## 6) Tokens y rewards

### Ganar tokens

Formas (ejemplo del cuestionario):

```
- Por asistencia: +10 tokens
- Por completar challenge diario: +X tokens (depende del challenge)
- Por cumplir meta semanal de frequency: +20 tokens
- Por desbloquear achievement: +X tokens (depende del achievement)
- Por referir amigo: +50 tokens
- Por dejar review: +5 tokens
- Por upgrade a Premium: +100 tokens (bienvenida)
```

Además: bonus por eventos definidos.

### Gastar tokens

Recompensas, comprar `recovery`, desbloquear rutinas premium, otros futuros.\
Validar saldo.\
**ACID**: `User.tokens`, `TokenLedger`, `ClaimedReward` en una transacción.

### Reclamar reward

Validar `is_active`, `stock`, ventana `valid_from/valid_until`, saldo.\
Si requiere código → asignar **no usado** y marcar **usado** al reclamar.\
Crear `ClaimedReward(status=ACTIVE)`, restar tokens, decrementar stock, notificar.\
Reclamo múltiple: **depende del reward** (`once_per_user`).\
Si se acaban códigos: error y **deshabilitar automáticamente** hasta que admin los reponga.

### Usar reward

Endpoint de uso; marcar `USED` y `used_at=NOW()`.\
Expiración: sí, automática por cron según `expires_at`.

---

## 7) Challenges y achievements

### Challenge diario

Se genera a las **00:01**.\
Se **asigna automáticamente** a usuarios y se notifica si tienen notificaciones activas.\
Progreso **acumulativo** en el día.\
Al completar, otorgar tokens, notificar e intentar desbloquear achievements relacionados.

### Achievements

Evaluar después de cualquier acción que afecte métricas.\
Notificación inmediata y banner al finalizar la sesión.

---

## 8) Rutinas y workouts

### Importar rutina template

Clonar estructura completa a copia del usuario; activar como actual.\
**Solo Premium** puede editar importadas; usuarios Free las tienen **read-only**.

### Crear rutina custom

Validaciones (ejemplo del cuestionario):

```
- Mínimo 1 día
- Máximo N días
- Al menos 1 ejercicio por día
- Validar que los ejercicios existan
```

### Sesión de entrenamiento

Iniciar, agregar sets, detectar PR, acumular métricas.\
**Pausar/reanudar** permitido.\
**No** se marca `CANCELLED` por inactividad: queda **pendiente** y el usuario decide terminar otro día o cancelarla.

### Finalizar sesión

Completar, calcular duración, tokens por completar, progress diario, evaluar achievements.

Usuarios free pueden tener maximo 5 rutinas simultaneas e ir rotando cual quieren que este activa, usuarios premium pueden hacer lo mismo pero con maximo de 20 rutinas puueden importarlas o crearlas pero no pueden tener mas de 20

---

## 9) Progreso y métricas

### PR (Personal Record)

Detección: no trivial, ponderar volumen y estimación de 1RM; distinguir 80×30 vs 100×1.\
PRs visibles en feed/timeline.

### Medidas corporales

Frecuencia: Premium diario/semanal/mensual y a demanda; Free mensual.\
`BMI` automático; `Body Fat` manual u opcional.

---

## 10) Pagos

Webhook MP: **incompleto**; falta robustecer.\
**No hay** manejo de pagos duplicados aún.\
**No hay** manejo de refunds aún (revertir subs y tokens cuando se implemente).

---

## 11) Notificaciones

Crear después de achievements, challenges, streak en peligro, suscripción por vencer, nueva reward, respuesta de review.\
Canales: **push** principalmente; **email** solo algunos casos.\
Quiet hours: **no implementado** todavía, previsto a futuro.

---

## 12) Admin

**Gyms**: crear/editar/eliminar; verificación manual (`verified=true`).\
**Challenges**: pueden crear manuales y **editar el del día actual** y futuros.\
**Moderación**: eliminar reviews, banear usuarios (`is_active=false`).

---

## 13) Impacto en OpenAPI/DTOs (resumen)

Parámetros compartidos: `Page`, `Limit`, `Order`, `SortBy<Recurso>`.\
Schemas clave: `Account`, `UserProfile`, `Streak`, `Frequency`, `Presence`, `Assistance`, `Gym`, `GymReview`, `GymRatingStats`, `UserGym`, `Reward`, `RewardCode`, `ClaimedReward`, `TokenLedger`, `DailyChallenge`, `UserDailyChallenge`, `AchievementDefinition`, `UserAchievement`, `Routine*`, `Workout*`, `MercadoPagoPayment`, `Notification`.\
Endpoints: mantener paths actuales; versionar en `/v2` si se requieren rompientes.

---

## 14) Gaps y TODOs

- Definir `limit` por defecto y máximo.
- Diseñar **rotación** de refresh tokens si se adopta.
- Implementar anti-duplicado en Webhook MP y flujo de refunds.
- Definir reglas de cálculo de PR (e.g., fórmulas 1RM).
- Quiet hours y estrategias de batching de notificaciones.
- Reglas de priorización en listados cuando `favoritos` y otros filtros coexisten.

---

## 15) Ready-to-implement (para Services)

Todos los **side-effects** descritos deben realizarse dentro de **transacciones** cuando impactan múltiples tablas.\
`last_login` y escritura de métricas deben ser idempotentes por request-id cuando aplique.\
Whitelists de orden/paginación desde constantes compartidas.\
No exponer modelos; mapear a DTOs de respuesta.\
Incluir `reason` en `TokenLedger` para cada evento (`ASSISTANCE`, `DAILY_CHALLENGE`, `PREMIUM_WELCOME`, `REWARD_CLAIM`, `RECOVERY_BUY`, etc.).

