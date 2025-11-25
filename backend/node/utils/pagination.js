/**
 * Utilidades para paginación
 *
 * Provee funciones para normalizar y validar parámetros de paginación
 * según el contrato OpenAPI.
 */

/**
 * Normaliza y valida los parámetros de paginación
 *
 * @param {Object} params - Parámetros de entrada
 * @param {number} [params.page] - Número de página (mínimo 1)
 * @param {number} [params.limit] - Cantidad de resultados (mínimo 1, máximo 100)
 * @param {number} [defaultPage=1] - Página por defecto
 * @param {number} [defaultLimit=20] - Límite por defecto
 * @param {number} [maxLimit=100] - Límite máximo permitido
 * @returns {Object} Parámetros normalizados: { page, limit, offset }
 */
function normalizePagination(
  { page, limit },
  { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = {}
) {
  // Normalizar page
  let normalizedPage = parseInt(page, 10);
  if (isNaN(normalizedPage) || normalizedPage < 1) {
    normalizedPage = defaultPage;
  }

  // Normalizar limit
  let normalizedLimit = parseInt(limit, 10);
  if (isNaN(normalizedLimit) || normalizedLimit < 1) {
    normalizedLimit = defaultLimit;
  }
  if (normalizedLimit > maxLimit) {
    normalizedLimit = maxLimit;
  }

  // Calcular offset
  const offset = (normalizedPage - 1) * normalizedLimit;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset,
  };
}

/**
 * Construye un objeto de respuesta paginada
 *
 * @param {Object} params - Parámetros
 * @param {Array} params.items - Items de la página actual
 * @param {number} params.total - Total de items (sin paginar)
 * @param {number} params.page - Número de página actual
 * @param {number} params.limit - Límite de items por página
 * @returns {Object} Respuesta paginada: { items, page, limit, total, totalPages }
 */
function buildPaginatedResponse({ items, total, page, limit }) {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Valida si hay una página siguiente
 *
 * @param {number} page - Página actual
 * @param {number} limit - Límite de items por página
 * @param {number} total - Total de items
 * @returns {boolean} True si hay página siguiente
 */
function hasNextPage(page, limit, total) {
  return page * limit < total;
}

/**
 * Valida si hay una página anterior
 *
 * @param {number} page - Página actual
 * @returns {boolean} True si hay página anterior
 */
function hasPreviousPage(page) {
  return page > 1;
}

module.exports = {
  normalizePagination,
  buildPaginatedResponse,
  hasNextPage,
  hasPreviousPage,
};
