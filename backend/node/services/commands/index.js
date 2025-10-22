/**
 * Index de Commands
 *
 * Exporta todos los commands del dominio de manera centralizada
 */

const authCommands = require('./auth.commands');
const gymCommands = require('./gym.commands');
const userCommands = require('./user.commands');

module.exports = {
  // Auth Commands
  ...authCommands,

  // Gym Commands
  ...gymCommands,

  // User Commands
  ...userCommands,
};
