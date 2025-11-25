/**
 * Clases de error personalizadas para manejo estructurado de errores
 *
 * Todas las clases extienden de AppError que marca errores operacionales
 * (errores esperados que se pueden manejar de forma controlada)
 */

/**
 * Clase base para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Validación
 * Usado cuando los datos de entrada no cumplen las reglas de validación
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Error 401 - No autenticado
 * Usado cuando no hay token o el token es inválido
 */
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error 403 - Sin permisos
 * Usado cuando el usuario está autenticado pero no tiene permisos
 */
class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos para esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error 404 - No encontrado
 * Usado cuando un recurso no existe
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

/**
 * Error 409 - Conflicto
 * Usado para duplicados, estado inválido, violación de restricciones únicas
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error 422 - Error de negocio
 * Usado cuando se viola una regla de negocio (lógica de dominio)
 */
class BusinessError extends AppError {
  constructor(message, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

/**
 * Error 429 - Too Many Requests
 * Usado para rate limiting
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas peticiones, intenta más tarde') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/**
 * Error 503 - Servicio no disponible
 * Usado cuando un servicio externo no está disponible
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio temporalmente no disponible') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BusinessError,
  TooManyRequestsError,
  ServiceUnavailableError
};
