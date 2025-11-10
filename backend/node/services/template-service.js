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
  const RoutineDay = require('../models/RoutineDay');

  const routines = await Routine.findAll({
    where: {
      is_template: true,
      recommended_for: difficulty
    },
    order: [['template_order', 'ASC']],
    limit,
    include: [
      {
        model: Exercise,
        as: 'Exercises',
        through: {
          attributes: ['sets', 'reps', 'exercise_order', 'id_routine_day']
        },
        attributes: ['id_exercise', 'exercise_name', 'muscular_group', 'difficulty_level', 'description']
      },
      {
        model: RoutineDay,
        as: 'days',
        attributes: ['id_routine_day', 'day_number', 'day_name', 'description'],
        include: [{
          model: RoutineExercise,
          as: 'routineExercises',
          attributes: ['id_exercise', 'sets', 'reps', 'exercise_order'],
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id_exercise', 'exercise_name', 'muscular_group', 'difficulty_level', 'description']
          }]
        }]
      }
    ]
  });

  // Transformar al formato esperado por el frontend
  return routines.map(routine => {
    const plainRoutine = routine.get({ plain: true });
    return {
      ...plainRoutine,
      exercises: plainRoutine.Exercises?.map(ex => ({
        id_exercise: ex.id_exercise,
        exercise_name: ex.exercise_name,
        muscular_group: ex.muscular_group,
        difficulty_level: ex.difficulty_level,
        description: ex.description,
        series: ex.RoutineExercise?.sets,
        reps: ex.RoutineExercise?.reps,
        order: ex.RoutineExercise?.exercise_order,
        id_routine_day: ex.RoutineExercise?.id_routine_day
      })) || [],
      days: plainRoutine.days?.map(day => ({
        id_routine_day: day.id_routine_day,
        day_number: day.day_number,
        title: day.day_name,
        description: day.description,
        exercises: day.routineExercises?.map(re => ({
          id_exercise: re.exercise?.id_exercise,
          exercise_name: re.exercise?.exercise_name,
          muscular_group: re.exercise?.muscular_group,
          difficulty_level: re.exercise?.difficulty_level,
          description: re.exercise?.description,
          series: re.sets,
          reps: re.reps,
          order: re.exercise_order
        })) || []
      })) || []
    };
  });
};

const importTemplate = async (userId, templateRoutineId) => {
  // Limites por suscripción para importación
  const profile = await UserProfile.findByPk(userId, { attributes: ['app_tier'] });
  const subscription = profile?.app_tier || SUBSCRIPTION_TYPES.FREE;
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

  // Verificar si el usuario ya tiene esta plantilla importada y no eliminada
  const alreadyImported = await UserImportedRoutine.findOne({
    where: {
      id_user_profile: userId,
      id_template_routine: templateRoutineId
    },
    include: [{
      model: Routine,
      as: 'userRoutine',
      where: {
        deleted_at: null
      },
      required: true
    }]
  });

  if (alreadyImported) {
    throw new BusinessError('Ya tienes esta rutina en tu lista', 'ALREADY_IMPORTED');
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
      sets: ex.sets,
      reps: ex.reps,
      exercise_order: ex.exercise_order,
      id_routine_day: ex.id_routine_day || null
    });
  }

  await UserImportedRoutine.create({
    id_user_profile: userId,
    id_template_routine: templateRoutineId,
    id_user_routine: copy.id_routine
  });

  // Retornar copia con ejercicios
  const withExercises = await Routine.findByPk(copy.id_routine, {
    include: [{ model: Exercise, as: 'Exercises', through: { attributes: ['sets', 'reps', 'exercise_order'] } }]
  });
  return withExercises;
};

module.exports = {
  getRecommendedRoutines,
  importTemplate,
  // Admin: crear plantilla con ejercicios y días
  async createTemplate({ routine_name, description, recommended_for, template_order = 0, days = [], exercises = [] }) {
    if (!routine_name) throw new Error('routine_name requerido');
    if (!Array.isArray(exercises) || exercises.length < 1) throw new Error('Debe incluir al menos 1 ejercicio');

    const RoutineDay = require('../models/RoutineDay');

    return await sequelize.transaction(async (transaction) => {
      const routine = await Routine.create({
        routine_name,
        description: description || null,
        created_by: null, // plantilla del sistema
        is_template: true,
        recommended_for: recommended_for || null,
        template_order: Number.isInteger(template_order) ? template_order : 0
      }, { transaction });

      // Crear días si existen
      const dayMap = new Map(); // day_number -> id_routine_day
      if (Array.isArray(days) && days.length > 0) {
        for (const day of days) {
          if (typeof day.day_number !== 'number') {
            throw new Error('Cada día debe especificar day_number');
          }
          const routineDay = await RoutineDay.create({
            id_routine: routine.id_routine,
            day_number: day.day_number,
            day_name: day.title || `Día ${day.day_number}`,
            description: day.description || null,
            rest_day: false
          }, { transaction });
          dayMap.set(day.day_number, routineDay.id_routine_day);
        }
      }

      // Crear ejercicios y vincularlos a días si corresponde
      for (const ex of exercises) {
        if (!ex || ex.id_exercise == null) throw new Error('Cada ejercicio debe incluir id_exercise');

        let idRoutineDay = null;
        if (ex.day_number && dayMap.has(ex.day_number)) {
          idRoutineDay = dayMap.get(ex.day_number);
        }

        await RoutineExercise.create({
          id_routine: routine.id_routine,
          id_exercise: ex.id_exercise,
          sets: ex.series ?? 3,
          reps: ex.reps ?? 10,
          exercise_order: ex.order ?? 1,
          id_routine_day: idRoutineDay
        }, { transaction });
      }

      return routine;
    });
  },

  // Admin: listar plantillas con ejercicios
  async listTemplates({ difficulty, limit = 50, offset = 0 } = {}) {
    const where = { is_template: true };
    if (difficulty) where.recommended_for = difficulty;

    const routines = await Routine.findAll({
      where,
      order: [['template_order', 'ASC']],
      limit,
      offset,
      include: [{
        model: Exercise,
        as: 'Exercises',
        through: {
          attributes: ['sets', 'reps', 'exercise_order', 'id_routine_day']
        },
        attributes: ['id_exercise', 'exercise_name', 'muscular_group']
      }]
    });

    // Transformar al formato esperado
    return routines.map(routine => ({
      ...routine.get({ plain: true }),
      exercises: routine.Exercises?.map(ex => ({
        id_exercise: ex.id_exercise,
        exercise_name: ex.exercise_name,
        muscular_group: ex.muscular_group,
        series: ex.RoutineExercise?.sets,
        reps: ex.RoutineExercise?.reps,
        order: ex.RoutineExercise?.exercise_order,
        id_routine_day: ex.RoutineExercise?.id_routine_day
      })) || []
    }));
  },

  async updateTemplateMeta(id, data = {}) {
    const routine = await Routine.findByPk(id);
    if (!routine || !routine.is_template) throw new Error('Plantilla no encontrada');

    const RoutineDay = require('../models/RoutineDay');

    return await sequelize.transaction(async (transaction) => {
      // Actualizar metadatos básicos
      const fields = ['routine_name', 'description', 'recommended_for', 'template_order'];
      const payload = {};
      for (const f of fields) if (data[f] !== undefined) payload[f] = data[f];
      await routine.update(payload, { transaction });

      // Si se envían días y ejercicios, actualizar todo
      if (data.days !== undefined || data.exercises !== undefined) {
        // Eliminar días y ejercicios existentes
        await RoutineDay.destroy({ where: { id_routine: id }, transaction });
        await RoutineExercise.destroy({ where: { id_routine: id }, transaction });

        // Crear días nuevos
        const dayMap = new Map();
        if (Array.isArray(data.days) && data.days.length > 0) {
          for (const day of data.days) {
            if (typeof day.day_number !== 'number') {
              throw new Error('Cada día debe especificar day_number');
            }
            const routineDay = await RoutineDay.create({
              id_routine: id,
              day_number: day.day_number,
              day_name: day.title || `Día ${day.day_number}`,
              description: day.description || null,
              rest_day: false
            }, { transaction });
            dayMap.set(day.day_number, routineDay.id_routine_day);
          }
        }

        // Crear ejercicios nuevos
        if (Array.isArray(data.exercises) && data.exercises.length > 0) {
          for (const ex of data.exercises) {
            if (!ex || ex.id_exercise == null) throw new Error('Cada ejercicio debe incluir id_exercise');

            let idRoutineDay = null;
            if (ex.day_number && dayMap.has(ex.day_number)) {
              idRoutineDay = dayMap.get(ex.day_number);
            }

            await RoutineExercise.create({
              id_routine: id,
              id_exercise: ex.id_exercise,
              sets: ex.series ?? 3,
              reps: ex.reps ?? 10,
              exercise_order: ex.order ?? 1,
              id_routine_day: idRoutineDay
            }, { transaction });
          }
        }
      }

      return routine;
    });
  },

  async deleteTemplate(id) {
    const routine = await Routine.findByPk(id);
    if (!routine || !routine.is_template) throw new Error('Plantilla no encontrada');
    
    // Eliminar primero los ejercicios asociados
    await RoutineExercise.destroy({ where: { id_routine: id } });
    
    // Eliminar la plantilla
    await routine.destroy();
    return true;
  }
};
