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
const challengeCommands = require('./challenge.commands');
const streakCommands = require('./streak.commands');
const frequencyCommands = require('./frequency.commands');
const exerciseCommands = require('./exercise.commands');
const routineCommands = require('./routine.commands');
const userRoutineCommands = require('./user-routine.commands');
const workoutCommands = require('./workout.commands');

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

  // Challenge Commands (Lote 6)
  ...challengeCommands,

  // Streak Commands (Lote 6)
  ...streakCommands,

  // Frequency Commands (Lote 6)
  ...frequencyCommands,

  // Exercise Commands (Lote 7)
  ...exerciseCommands,

  // Routine Commands (Lote 7)
  ...routineCommands,

  // UserRoutine Commands (Lote 7)
  ...userRoutineCommands,

  // Workout Commands (Lote 7)
  ...workoutCommands,
};
