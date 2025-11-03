
/**
 * Utilidades de validación para formularios
 */

/**
 * Expresión regular para validar emails
 * Acepta formatos estándar: usuario@dominio.com
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
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