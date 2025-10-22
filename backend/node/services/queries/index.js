/**
 * Index de Queries
 *
 * Exporta todas las queries del dominio de manera centralizada
 */

const authQueries = require('./auth.queries');
const gymQueries = require('./gym.queries');

module.exports = {
  // Auth Queries
  ...authQueries,

  // Gym Queries
  ...gymQueries,
};
