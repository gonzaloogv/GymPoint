/**
 * UserRoutine DB Mapper
 * Transforma instancias de Sequelize a POJOs (UserRoutine, UserImportedRoutine)
 */

const { toPlain } = require('./utils');

function toUserRoutine(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_user_routine: plain.id_user_routine,
    id_user: plain.id_user,
    id_routine: plain.id_routine,
    start_date: plain.start_date,
    finish_date: plain.finish_date || null,
    active: plain.active || false,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include routine relation if present
  if (plain.routine) {
    result.routine = {
      id_routine: plain.routine.id_routine,
      routine_name: plain.routine.routine_name,
      description: plain.routine.description || null
    };
  }

  return result;
}

function toUserRoutines(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toUserRoutine);
}

function toUserImportedRoutine(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_user_imported_routine: plain.id_user_imported_routine,
    id_user_profile: plain.id_user_profile,
    id_template_routine: plain.id_template_routine,
    id_imported_routine: plain.id_imported_routine,
    imported_at: plain.imported_at,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };
}

function toUserImportedRoutines(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toUserImportedRoutine);
}

module.exports = {
  toUserRoutine,
  toUserRoutines,
  toUserImportedRoutine,
  toUserImportedRoutines
};
