
/**
 * Utilidades de validación para formularios
 */

/**
 * Expresión regular mejorada para validar emails
 *
 * Validaciones:
 * - Usuario: 1-64 caracteres alfanuméricos, puntos, guiones, underscores
 * - No permite puntos consecutivos en el nombre de usuario
 * - Dominio: al menos 2 segmentos (ej: domain.com, no localhost)
 * - TLD: al menos 2 caracteres (ej: .com, .es, .info)
 *
 * Casos válidos:
 * ✅ user@example.com
 * ✅ john.doe@company.co.uk
 * ✅ test+tag@gmail.com
 *
 * Casos inválidos:
 * ❌ user@localhost (no tiene TLD)
 * ❌ john..doe@domain.com (puntos consecutivos)
 * ❌ @domain.com (sin usuario)
 * ❌ user@.com (sin dominio)
 */
export const EMAIL_REGEX =
  /^(?=.{1,64}@)[A-Za-z0-9._%+-]+(\.[A-Za-z0-9._%+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Validar email con formato mejorado
 *
 * IMPORTANTE: Esta validación es solo de formato del lado del cliente.
 * El backend realiza validación adicional de:
 * - Normalización (lowercase, trim)
 * - Verificación DNS del dominio (registros MX/A)
 *
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();

  // Validar formato básico con regex
  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  // Validaciones adicionales que el regex no cubre bien
  const [user, domain] = trimmed.split('@');

  // No permitir puntos consecutivos en usuario
  if (user.includes('..')) {
    return false;
  }

  // No permitir que empiece o termine con punto
  if (user.startsWith('.') || user.endsWith('.')) {
    return false;
  }

  // Verificar que el dominio tenga al menos un punto
  if (!domain.includes('.')) {
    return false;
  }

  return true;
}

/**
 * Validar contraseña (mínimo 8 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password && password.length >= 8;
}

/**
 * Validar nombre (mínimo 2 caracteres)
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Validar que dos contraseñas coincidan
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}