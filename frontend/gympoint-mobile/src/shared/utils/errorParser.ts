/**
 * Utilidad para parsear errores del backend
 * Extrae mensajes de error legibles desde diferentes formatos de respuesta
 */

interface BackendError {
  response?: {
    data?: {
      error?: {
        message?: string;
        code?: string;
      };
      message?: string;
      details?: Array<{
        path?: string;
        message?: string;
        errorCode?: string;
      }>;
      code?: string;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

/**
 * Traduce códigos de error a mensajes amigables en español
 */
const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Este email ya está registrado',
  INVALID_DATA: 'Los datos ingresados no son válidos',
  VALIDATION_ERROR: 'Error de validación en los datos',
  REGISTER_FAILED: 'No se pudo completar el registro',
  LOGIN_FAILED: 'Email o contraseña incorrectos',
  NETWORK_ERROR: 'Error de conexión. Verificá tu internet',
  UNAUTHORIZED: 'No tenés autorización para esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error del servidor. Intentá más tarde',
};

/**
 * Parsea un error del backend y retorna un mensaje legible
 */
export function parseBackendError(err: any): string {
  const error = err as BackendError;

  // 1. Network error (sin conexión al backend)
  if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // 2. Timeout
  if (error.code === 'ECONNABORTED') {
    return 'La solicitud tardó demasiado. Intentá nuevamente.';
  }

  // 3. Error con código conocido
  const errorCode = error.response?.data?.error?.code || error.response?.data?.code;
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // 4. Mensaje de error directo del backend
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // 5. Detalles de validación
  if (error.response?.data?.details) {
    const details = error.response.data.details;
    if (Array.isArray(details) && details.length > 0) {
      const firstDetail = details[0];

      // Traducir mensajes de validación comunes
      if (firstDetail.message) {
        const msg = firstDetail.message;

        if (msg.includes('must NOT have fewer than')) {
          const match = msg.match(/must NOT have fewer than (\d+)/);
          if (match) {
            return `Debe tener al menos ${match[1]} caracteres`;
          }
        }

        if (msg.includes('must NOT be longer than')) {
          const match = msg.match(/must NOT be longer than (\d+)/);
          if (match) {
            return `No puede tener más de ${match[1]} caracteres`;
          }
        }

        if (msg.includes('must match format')) {
          return 'El formato no es válido';
        }

        if (msg.includes('must be equal to one of the allowed values')) {
          const fieldPath = firstDetail.path || '';
          if (fieldPath.includes('gender')) {
            return 'Seleccioná un género válido (Hombre, Mujer u Otro)';
          }
          return 'El valor seleccionado no es válido';
        }

        return msg;
      }

      if (firstDetail.path) {
        return `Error en el campo: ${firstDetail.path}`;
      }
    }
  }

  // 6. Status code específico
  const status = error.response?.status;
  if (status) {
    switch (status) {
      case 400:
        return 'Los datos enviados no son válidos';
      case 401:
        return 'No estás autenticado. Iniciá sesión nuevamente';
      case 403:
        return 'No tenés permisos para realizar esta acción';
      case 404:
        return 'El recurso solicitado no existe';
      case 409:
        return 'Conflicto con los datos existentes';
      case 500:
        return 'Error del servidor. Intentá más tarde';
      case 503:
        return 'Servicio no disponible temporalmente';
    }
  }

  // 7. Mensaje genérico del error
  if (error.message) {
    return error.message;
  }

  // 8. Fallback
  return 'Ocurrió un error inesperado. Intentá nuevamente.';
}

/**
 * Log detallado de error para debugging
 */
export function logError(context: string, error: any) {
  console.group(`❌ Error en ${context}`);
  console.error('Error completo:', error);
  console.error('Response data:', error?.response?.data);
  console.error('Status:', error?.response?.status);
  console.error('Mensaje parseado:', parseBackendError(error));
  console.groupEnd();
}
