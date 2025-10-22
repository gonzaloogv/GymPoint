/**
 * Index de Mappers
 *
 * Exporta todos los mappers del dominio de manera centralizada
 */

const authMappers = require('./auth.mappers');
const gymMappers = require('./gym.mappers');
const userMappers = require('./user.mappers');

module.exports = {
  auth: authMappers,
  gym: gymMappers,
  user: userMappers,
};
