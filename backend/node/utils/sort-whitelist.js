/**
 * Whitelists de campos permitidos para ordenamiento
 *
 * Previene SQL injection y garantiza que solo se ordene por campos válidos.
 * Los campos deben coincidir con los enums definidos en el spec OpenAPI.
 */

/**
 * Campos permitidos para ordenar Gyms
 * Basado en components.parameters.GymSortBy del spec OpenAPI
 */
const GYM_SORTABLE_FIELDS = new Set([
  'name',
  'city',
  'created_at',
  'month_price',
  'distance', // Requiere cálculo especial cuando se usa lat/lng
]);

/**
 * Campos permitidos para ordenar Accounts/Users
 */
const USER_SORTABLE_FIELDS = new Set([
  'email',
  'created_at',
  'last_login',
]);

/**
 * Campos permitidos para ordenar Assistances
 */
const ASSISTANCE_SORTABLE_FIELDS = new Set([
  'check_in_time',
  'check_out_time',
  'duration_minutes',
  'created_at',
]);

/**
 * Campos permitidos para ordenar Reviews
 */
const REVIEW_SORTABLE_FIELDS = new Set([
  'rating',
  'created_at',
  'updated_at',
]);

/**
 * Campos permitidos para ordenar Rewards
 */
const REWARD_SORTABLE_FIELDS = new Set([
  'name',
  'token_cost',
  'created_at',
  'valid_from',
  'valid_until',
]);

/**
 * Campos permitidos para ordenar Routines
 */
const ROUTINE_SORTABLE_FIELDS = new Set([
  'name',
  'created_at',
  'updated_at',
]);

/**
 * Campos permitidos para ordenar Challenges
 */
const CHALLENGE_SORTABLE_FIELDS = new Set([
  'created_at',
  'date',
]);

/**
 * Direcciones de orden permitidas
 */
const ALLOWED_ORDER_DIRECTIONS = new Set(['ASC', 'DESC']);

/**
 * Valida y normaliza los parámetros de ordenamiento
 *
 * @param {string} sortBy - Campo por el que ordenar
 * @param {string} order - Dirección del orden (ASC, DESC)
 * @param {Set<string>} allowedFields - Set de campos permitidos para este recurso
 * @param {string} defaultSortBy - Campo por defecto si sortBy no es válido
 * @param {string} defaultOrder - Orden por defecto si order no es válido
 * @returns {Object} Parámetros normalizados: { sortBy, order }
 */
function normalizeSortParams(
  sortBy,
  order,
  allowedFields,
  defaultSortBy = 'created_at',
  defaultOrder = 'DESC'
) {
  // Normalizar sortBy
  const normalizedSortBy = allowedFields.has(sortBy) ? sortBy : defaultSortBy;

  // Normalizar order
  const normalizedOrder = ALLOWED_ORDER_DIRECTIONS.has(order?.toUpperCase())
    ? order.toUpperCase()
    : defaultOrder;

  return {
    sortBy: normalizedSortBy,
    order: normalizedOrder,
  };
}

/**
 * Valida si un campo está permitido para ordenamiento
 *
 * @param {string} field - Campo a validar
 * @param {Set<string>} allowedFields - Set de campos permitidos
 * @returns {boolean} True si el campo está permitido
 */
function isSortFieldAllowed(field, allowedFields) {
  return allowedFields.has(field);
}

module.exports = {
  // Whitelists por recurso
  GYM_SORTABLE_FIELDS,
  USER_SORTABLE_FIELDS,
  ASSISTANCE_SORTABLE_FIELDS,
  REVIEW_SORTABLE_FIELDS,
  REWARD_SORTABLE_FIELDS,
  ROUTINE_SORTABLE_FIELDS,
  CHALLENGE_SORTABLE_FIELDS,
  ALLOWED_ORDER_DIRECTIONS,

  // Funciones de validación
  normalizeSortParams,
  isSortFieldAllowed,
};
