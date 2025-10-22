/**
 * Index de Commands
 *
 * Exporta todos los commands del dominio de manera centralizada
 */

const authCommands = require('./auth.commands');
const gymCommands = require('./gym.commands');

module.exports = {
  // Auth Commands
  ...authCommands,

  // Gym Commands
  ...gymCommands,
};
