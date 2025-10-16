const { Routine, RoutineExercise } = require('../models');
const sequelize = require('../config/database');
const { SUBSCRIPTION_TYPES } = require('../config/constants');
const { BusinessError, NotFoundError } = require('../utils/errors');
const { UserProfile } = require('../models');
const UserImportedRoutine = require('../models/UserImportedRoutine');

const getUserRoutineCounts = async (idUserProfile) => {
  const totalOwned = await Routine.count({ where: { created_by: idUserProfile, is_template: false } });
  const importedCount = await UserImportedRoutine.count({ where: { id_user_profile: idUserProfile } });
  const createdCount = Math.max(0, totalOwned - importedCount);
  return { totalOwned, importedCount, createdCount };
};
const Exercise = require('../models/Exercise');

const getRecommendedRoutines = async (difficulty = 'BEGINNER', limit = 5) => {
  return await Routine.findAll({
    where: {
      is_template: true,
      recommended_for: difficulty
    },
    order: [['template_order', 'ASC']],
    limit
  });
};

const importTemplate = async (userId, templateRoutineId) => {
  // Limites por suscripción para importación
  const profile = await UserProfile.findByPk(userId, { attributes: ['subscription'] });
  const subscription = profile?.subscription || SUBSCRIPTION_TYPES.FREE;
  const { totalOwned } = await getUserRoutineCounts(userId);
  
  if (subscription === SUBSCRIPTION_TYPES.FREE) {
    if (totalOwned >= 5) {
      throw new BusinessError(
        'Límite total de rutinas para usuario FREE (máx 5 entre creadas e importadas)',
        'LIMIT_EXCEEDED'
      );
    }
  } else if (subscription === SUBSCRIPTION_TYPES.PREMIUM) {
    if (totalOwned >= 20) {
      throw new BusinessError('Límite total de rutinas para usuario PREMIUM (máx 20)', 'LIMIT_EXCEEDED');
    }
  }

  const template = await Routine.findByPk(templateRoutineId);
  if (!template || !template.is_template) {
    throw new NotFoundError('Plantilla');
  }

  // Crear copia
  const copy = await Routine.create({
    routine_name: template.routine_name,
    description: template.description,
    created_by: userId,
    is_template: false,
    recommended_for: null,
    template_order: 0
  });

  // Copiar detalles de ejercicios
  const exercises = await RoutineExercise.findAll({ where: { id_routine: templateRoutineId } });
  for (const ex of exercises) {
    await RoutineExercise.create({
      id_routine: copy.id_routine,
      id_exercise: ex.id_exercise,
      series: ex.series,
      reps: ex.reps,
      order: ex.order,
      id_routine_day: ex.id_routine_day || null
    });
  }

  await UserImportedRoutine.create({
    id_user_profile: userId,
    id_routine_original: templateRoutineId,
    id_routine_copy: copy.id_routine
  });

  // Retornar copia con ejercicios
  const withExercises = await Routine.findByPk(copy.id_routine, {
    include: [{ model: Exercise, through: { attributes: ['series', 'reps', 'order'] } }]
  });
  return withExercises;
};

module.exports = {
  getRecommendedRoutines,
  importTemplate,
  // Admin: crear plantilla con ejercicios
  async createTemplate({ routine_name, description, recommended_for, template_order = 0, exercises = [] }) {
    if (!routine_name) throw new Error('routine_name requerido');
    if (!Array.isArray(exercises) || exercises.length < 1) throw new Error('Debe incluir al menos 1 ejercicio');

    return await sequelize.transaction(async (transaction) => {
      const routine = await Routine.create({
        routine_name,
        description: description || null,
        created_by: null, // plantilla del sistema
        is_template: true,
        recommended_for: recommended_for || null,
        template_order: Number.isInteger(template_order) ? template_order : 0
      }, { transaction });

      for (const ex of exercises) {
        if (!ex || ex.id_exercise == null) throw new Error('Cada ejercicio debe incluir id_exercise');
        await RoutineExercise.create({
          id_routine: routine.id_routine,
          id_exercise: ex.id_exercise,
          series: ex.series ?? 3,
          reps: ex.reps ?? 10,
          order: ex.order ?? 1,
          id_routine_day: null
        }, { transaction });
      }

      return routine;
    });
  },

  // Admin: listar y actualizar metadatos
  async listTemplates({ difficulty, limit = 50, offset = 0 } = {}) {
    const where = { is_template: true };
    if (difficulty) where.recommended_for = difficulty;
    return Routine.findAll({ where, order: [['template_order', 'ASC']], limit, offset });
  },

  async updateTemplateMeta(id, data = {}) {
    const routine = await Routine.findByPk(id);
    if (!routine || !routine.is_template) throw new Error('Plantilla no encontrada');
    const fields = ['routine_name', 'description', 'recommended_for', 'template_order'];
    const payload = {};
    for (const f of fields) if (data[f] !== undefined) payload[f] = data[f];
    await routine.update(payload);
    return routine;
  }
};
