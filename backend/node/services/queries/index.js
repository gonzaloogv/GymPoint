/**
 * Index de Queries
 *
 * Exporta todas las queries del dominio de manera centralizada
 */

const authQueries = require('./auth.queries');
const gymQueries = require('./gym.queries');
const userQueries = require('./user.queries');

module.exports = {
  // Auth Queries
  ...authQueries,

  // Gym Queries
  ...gymQueries,

  // User Queries
  ...userQueries,
};
