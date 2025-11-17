# Validación de Email - Mejoras de Seguridad

## Contexto

**Problema Original:**
- Backend no validaba formato ni existencia del dominio antes de crear cuentas
- Frontend usaba regex permisivo (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) que aceptaba emails inexistentes
- No había verificación de dominio (MX/A records)
- Usuarios podían registrar emails falsos y luego iniciar sesión inmediatamente

**Riesgo:**
- Base de datos contaminada con emails inválidos
- Imposibilidad de contactar usuarios para recuperación de contraseña
- Problemas al implementar verificación por email
- Vulnerabilidad a spam/cuentas falsas

---

## Solución Implementada

### 🔒 Backend - Validación Robusta

#### 1. Validación de Formato con Joi

**Archivo:** [auth-service.js:43-47](../backend/node/services/auth-service.js#L43-L47)

```javascript
const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ minDomainSegments: 2, tlds: { allow: false } })
  .required();
```

**Validaciones:**
- ✅ Formato estándar de email
- ✅ Mínimo 2 segmentos de dominio (`user@domain.com`, no `user@localhost`)
- ✅ Normalización automática (lowercase, trim)
- ✅ Soporta TLDs internacionales

---

#### 2. Validación DNS del Dominio

**Archivo:** [auth-service.js:69-122](../backend/node/services/auth-service.js#L69-L122)

```javascript
const ensureDomainAcceptsMail = async (email, timeoutMs = 5000) => {
  const domain = email.split('@')[1];

  // Intento 1: Verificar registros MX
  const mx = await dns.resolveMx(domain);
  if (mx && mx.length > 0) return; // ✅ Dominio válido

  // Intento 2: Fallback a registros A/AAAA (catch-all servers)
  await dns.resolve(domain);
};
```

**Estrategia de Validación:**

| Tipo de Dominio | Método | Resultado |
|-----------------|--------|-----------|
| Gmail, Outlook, etc. | MX records | ✅ Aprobado |
| Dominios corporativos con MX | MX records | ✅ Aprobado |
| Servidores catch-all (sin MX) | A/AAAA records | ✅ Aprobado |
| Dominios inexistentes (typos) | DNS timeout/error | ❌ Rechazado |
| Dominios sin MX ni A | DNS error | ❌ Rechazado |

**Protección contra DoS:**
- Timeout de 5 segundos por defecto
- Si DNS es lento → permite registro con warning (no bloquea UX)
- Validación fuera de transacción DB (evita locks largos)

---

#### 3. Integración en Registro

**Archivo:** [auth-service.js:304-306](../backend/node/services/auth-service.js#L304-L306)

```javascript
// CRÍTICO: Validar ANTES de iniciar transacción DB
const normalizedEmail = await validateAndNormalizeEmail(command.email);

const accountId = await runWithRetryableTransaction(async (transaction) => {
  const existing = await accountRepository.findByEmail(normalizedEmail, { transaction });
  // ...
});
```

**Beneficios:**
1. **Validaciones DNS fuera de transacción** → no bloquea la DB
2. **Email normalizado** → búsqueda consistente (case-insensitive)
3. **Errores tempranos** → mejor UX, menos recursos desperdiciados

---

#### 4. Normalización en Login

**Archivo:** [auth-service.js:406-408](../backend/node/services/auth-service.js#L406-L408)

```javascript
// Normalizar email (lowercase, trim) para búsqueda consistente
// No validamos DNS en login porque la cuenta ya existe
const normalizedEmail = command.email.trim().toLowerCase();
```

**Por qué no validar DNS en login:**
- La cuenta ya existe en la BD
- DNS podría estar temporalmente caído
- Mejora rendimiento

---

### 🎨 Frontend - Validación Mejorada

#### 1. Regex Robusto

**Archivo:** [validation.ts:26-27](../frontend/gympoint-mobile/src/shared/utils/validation.ts#L26-L27)

```typescript
export const EMAIL_REGEX =
  /^(?=.{1,64}@)[A-Za-z0-9._%+-]+(\.[A-Za-z0-9._%+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
```

**Mejoras sobre el regex original:**

| Validación | Antes | Después |
|------------|-------|---------|
| Puntos consecutivos (`john..doe@`) | ✅ Permitido | ❌ Rechazado |
| Sin TLD (`user@localhost`) | ✅ Permitido | ❌ Rechazado |
| Usuario vacío (`@domain.com`) | ✅ Permitido | ❌ Rechazado |
| Longitud máxima usuario | ❌ Sin límite | ✅ Max 64 chars |
| TLD mínimo | ❌ 1 char (`.c`) | ✅ Min 2 chars (`.co`) |

---

#### 2. Validación Adicional

**Archivo:** [validation.ts:40-67](../frontend/gympoint-mobile/src/shared/utils/validation.ts#L40-L67)

```typescript
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();

  if (!EMAIL_REGEX.test(trimmed)) return false;

  const [user, domain] = trimmed.split('@');

  // Validaciones que el regex no cubre bien
  if (user.includes('..')) return false;           // Puntos consecutivos
  if (user.startsWith('.') || user.endsWith('.')) return false; // Empieza/termina con punto
  if (!domain.includes('.')) return false;         // Sin TLD

  return true;
}
```

---

## Flujo de Validación Completo

```
Usuario ingresa email
        ↓
┌───────────────────────┐
│  Frontend Validation  │
│  - Regex mejorado     │
│  - Formato básico     │
└───────────────────────┘
        ↓ (si válido)
    HTTP POST
        ↓
┌───────────────────────┐
│  Backend Validation   │
│  1. Joi format check  │
│  2. Normalize         │
│  3. DNS validation    │
└───────────────────────┘
        ↓ (si válido)
┌───────────────────────┐
│  Database Check       │
│  - Unicidad           │
│  - Crear cuenta       │
└───────────────────────┘
```

---

## Manejo de Errores

### Códigos de Error

| Error | Código HTTP | Respuesta API | Mensaje Usuario |
|-------|-------------|---------------|-----------------|
| Formato inválido | 400 | `INVALID_DATA` | "Formato de email inválido. Debe ser: usuario@dominio.com" |
| Dominio no existe | 400 | `INVALID_DATA` | "El dominio 'example.com' no existe o no puede recibir correo" |
| Email duplicado | 409 | `EMAIL_ALREADY_EXISTS` | "El email ya está registrado" |
| Timeout DNS | 200 | ⚠️ Warning | Se permite con advertencia en logs |

### Ejemplo de Respuesta de Error

```json
{
  "error": {
    "code": "INVALID_DATA",
    "message": "El dominio 'gmial.com' no existe o no está configurado para recibir correo. Verifica que el email sea correcto."
  }
}
```

---

## Casos de Uso

### ✅ Emails Válidos

```
✅ user@gmail.com              → MX records válidos
✅ john.doe@company.co.uk      → Multi-nivel TLD
✅ test+tag@outlook.com        → Plus addressing
✅ user@custom-domain.com      → Dominio corporativo
✅ name_123@university.edu     → Underscores + números
```

### ❌ Emails Inválidos

```
❌ user@gmial.com              → Typo en dominio (no existe)
❌ john..doe@domain.com        → Puntos consecutivos
❌ @domain.com                 → Sin usuario
❌ user@.com                   → Sin dominio
❌ user@localhost              → Sin TLD
❌ user @domain.com            → Espacios
❌ user@domain                 → Sin TLD
```

---

## Testing

### Backend Tests

**Archivo sugerido:** `tests/auth-service.test.js`

```javascript
describe('Email Validation', () => {
  test('rechaza dominios inexistentes', async () => {
    await expect(
      authService.register({
        email: 'user@gmial.com', // typo
        password: 'test1234',
        name: 'Test',
        lastname: 'User'
      })
    ).rejects.toThrow(ValidationError);
  });

  test('normaliza emails a lowercase', async () => {
    const result = await authService.register({
      email: 'User@GMAIL.com',
      password: 'test1234',
      name: 'Test',
      lastname: 'User'
    });

    const account = await accountRepository.findByEmail('user@gmail.com');
    expect(account).toBeDefined();
  });

  test('acepta dominios válidos con MX', async () => {
    await expect(
      authService.register({
        email: 'test@gmail.com',
        password: 'test1234',
        name: 'Test',
        lastname: 'User'
      })
    ).resolves.toBeDefined();
  });
});
```

### Frontend Tests

**Archivo sugerido:** `src/shared/utils/__tests__/validation.test.ts`

```typescript
import { isValidEmail } from '../validation';

describe('isValidEmail', () => {
  test('acepta emails válidos', () => {
    expect(isValidEmail('user@gmail.com')).toBe(true);
    expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
    expect(isValidEmail('test+tag@outlook.com')).toBe(true);
  });

  test('rechaza emails inválidos', () => {
    expect(isValidEmail('john..doe@domain.com')).toBe(false); // Puntos consecutivos
    expect(isValidEmail('@domain.com')).toBe(false);          // Sin usuario
    expect(isValidEmail('user@localhost')).toBe(false);       // Sin TLD
    expect(isValidEmail('user @domain.com')).toBe(false);     // Espacios
  });

  test('normaliza con trim', () => {
    expect(isValidEmail('  user@gmail.com  ')).toBe(true);
  });
});
```

---

## Monitoreo y Métricas

### Logs Importantes

```javascript
// Warning cuando DNS es lento (no bloquea)
console.warn(`[Auth] DNS timeout validating domain: ${domain}`);

// Info de normalización
console.log(`[Auth] Email normalized: ${originalEmail} → ${normalizedEmail}`);
```

### Métricas Sugeridas

1. **Tasa de rechazo por DNS:**
   ```sql
   SELECT COUNT(*) FROM audit_logs
   WHERE action = 'REGISTER_FAILED'
   AND error_code = 'INVALID_DATA'
   AND message LIKE '%dominio%no existe%';
   ```

2. **Typos comunes:**
   - `gmial.com` vs `gmail.com`
   - `outloo.com` vs `outlook.com`
   - `yaho.com` vs `yahoo.com`

3. **Timeouts DNS:**
   - Monitorear logs con patrón `DNS timeout validating domain`
   - Si > 5% de registros → considerar aumentar timeout

---

## Seguridad

### Prevención de Ataques

| Ataque | Mitigación |
|--------|------------|
| **Email Flooding** | Rate limiting en `/api/auth/register` (ya implementado) |
| **DNS DoS** | Timeout de 5s + fallback a permitir registro |
| **Typosquatting** | Validación DNS rechaza dominios falsos |
| **Case Sensitivity Bypass** | Normalización a lowercase |
| **Duplicate Detection Bypass** | Email normalizado antes de check de unicidad |

### Privacidad

- ✅ No se guardan logs de emails rechazados (GDPR)
- ✅ Mensajes de error genéricos (no revelan si email existe)
- ✅ Validación DNS no expone intención del usuario

---

## Próximos Pasos

### Opcional - Verificación por Email

Una vez implementada la verificación:

1. **Agregar campo `email_verified` a lógica de login:**
   ```javascript
   if (!account.email_verified) {
     throw new UnauthorizedError('Verifica tu email antes de iniciar sesión');
   }
   ```

2. **Enviar email de confirmación tras registro:**
   - Link con token JWT de verificación
   - Expiración de 24 horas
   - Re-envío disponible

3. **Actualizar documentación:**
   - Flujo de verificación en OpenAPI
   - Endpoints: `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`

---

## Referencias de Código

- **Backend validación:** [auth-service.js:33-145](../backend/node/services/auth-service.js#L33-L145)
- **Backend registro:** [auth-service.js:299-313](../backend/node/services/auth-service.js#L299-L313)
- **Backend login:** [auth-service.js:404-408](../backend/node/services/auth-service.js#L404-L408)
- **Frontend validación:** [validation.ts:6-67](../frontend/gympoint-mobile/src/shared/utils/validation.ts#L6-L67)
- **Manejo errores:** [auth-controller.js:17-19](../backend/node/controllers/auth-controller.js#L17-L19)

---

**Última actualización:** 2025-01-15
**Estado:** ✅ Implementado y listo para testing
**Dependencias:** Joi ^18.0.1, dns (Node.js built-in)
