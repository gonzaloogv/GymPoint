/**
 * Index de Commands
 *
 * Exporta todos los commands del dominio de manera centralizada
 */

const authCommands = require('./auth.commands');
const gymCommands = require('./gym.commands');
const userCommands = require('./user.commands');
const gymScheduleCommands = require('./gym-schedule.commands');
const gymReviewCommands = require('./gym-review.commands');
const gymPaymentCommands = require('./gym-payment.commands');

module.exports = {
  // Auth Commands
  ...authCommands,

  // Gym Commands
  ...gymCommands,

  // User Commands
  ...userCommands,

  // Gym Schedule Commands (Lote 4)
  ...gymScheduleCommands,

  // Gym Review Commands (Lote 4)
  ...gymReviewCommands,

  // Gym Payment Commands (Lote 4)
  ...gymPaymentCommands,
};
