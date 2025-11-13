/**
 * Repository para Assistance
 * Capa de acceso a datos con proyecciones explícitas y sin mass assignment
 */

const Assistance = require('../../../models/Assistance');
const Gym = require('../../../models/Gym');
const { UserProfile } = require('../../../models');
const { toAssistance, toAssistances, toPaginatedAssistances } = require('../mappers/assistance.mapper');
const { Op } = require('sequelize');

/**
 * Crear nueva asistencia con campos explícitos (sin mass assignment)
 * @param {Object} payload - Datos de la asistencia
 * @param {Object} options - Opciones (transaction, etc.)
 * @returns {Promise<Object>} POJO de asistencia creada
 */
async function createAssistance(payload, options = {}) {
  const assistance = await Assistance.create({
    id_user_profile: payload.id_user_profile,
    id_gym: payload.id_gym,
    date: payload.date,
    check_in_time: payload.check_in_time,
    check_out_time: payload.check_out_time || null,
    duration_minutes: payload.duration_minutes || null,
    auto_checkin: payload.auto_checkin || false,
    distance_meters: payload.distance_meters || null,
    verified: payload.verified || false
  }, {
    transaction: options.transaction
  });

  return toAssistance(assistance);
}

/**
 * Buscar asistencia por ID
 * @param {number} id - ID de la asistencia
 * @param {Object} options - Opciones (includeGym, includeUser, transaction)
 * @returns {Promise<Object|null>} POJO de asistencia o null
 */
async function findAssistanceById(id, options = {}) {
  const include = [];

  if (options.includeGym) {
    include.push({
      model: Gym,
      as: 'gym',
      attributes: ['id_gym', 'name', 'city', 'address', 'latitude', 'longitude']
    });
  }

  if (options.includeUser) {
    include.push({
      model: UserProfile,
      as: 'userProfile',
      attributes: ['id_user_profile', 'full_name', 'username']
    });
  }

  const assistance = await Assistance.findByPk(id, {
    attributes: [
      'id_assistance',
      'id_user_profile',
      'id_gym',
      'date',
      'check_in_time',
      'check_out_time',
      'duration_minutes',
      'auto_checkin',
      'distance_meters',
      'verified',
      'created_at'
    ],
    include,
    transaction: options.transaction
  });

  return toAssistance(assistance);
}

/**
 * Listar asistencias con filtros y paginación
 * @param {Object} filters - Filtros (userProfileId, gymId, startDate, endDate, page, limit)
 * @param {Object} options - Opciones (includeGym, transaction)
 * @returns {Promise<Object>} Resultado paginado con POJOs
 */
async function findAssistances(filters = {}, options = {}) {
  const {
    userProfileId,
    gymId,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters;

  const offset = (page - 1) * limit;
  const where = {};

  if (userProfileId !== undefined && userProfileId !== null) {
    where.id_user_profile = userProfileId;
  }

  if (gymId !== undefined && gymId !== null) {
    where.id_gym = gymId;
  }

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  const include = [];
  if (options.includeGym) {
    include.push({
      model: Gym,
      as: 'gym',
      attributes: ['id_gym', 'name', 'city', 'address']
    });
  }

  const result = await Assistance.findAndCountAll({
    where,
    attributes: [
      'id_assistance',
      'id_user_profile',
      'id_gym',
      'date',
      'check_in_time',
      'check_out_time',
      'duration_minutes',
      'auto_checkin',
      'distance_meters',
      'verified',
      'created_at'
    ],
    include,
    limit,
    offset,
    order: [['date', 'DESC'], ['check_in_time', 'DESC']],
    transaction: options.transaction
  });

  return {
    ...toPaginatedAssistances(result),
    page,
    limit,
    totalPages: Math.ceil(result.count / limit)
  };
}

/**
 * Buscar asistencia por usuario y fecha
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {Object} options - Opciones (transaction)
 * @returns {Promise<Object|null>} POJO de asistencia o null
 */
async function findAssistanceByUserAndDate(userProfileId, date, options = {}) {
  const assistance = await Assistance.findOne({
    where: {
      id_user_profile: userProfileId,
      date
    },
    attributes: [
      'id_assistance',
      'id_user_profile',
      'id_gym',
      'date',
      'check_in_time',
      'check_out_time',
      'duration_minutes',
      'auto_checkin',
      'distance_meters',
      'verified',
      'created_at'
    ],
    transaction: options.transaction
  });

  return toAssistance(assistance);
}

/**
 * Actualizar asistencia con campos explícitos
 * @param {number} id - ID de la asistencia
 * @param {Object} updates - Campos a actualizar
 * @param {Object} options - Opciones (transaction)
 * @returns {Promise<Object|null>} POJO de asistencia actualizada
 */
async function updateAssistance(id, updates, options = {}) {
  const assistance = await Assistance.findByPk(id, {
    transaction: options.transaction
  });

  if (!assistance) return null;

  // Actualizar solo campos permitidos (evitar mass assignment)
  if (updates.check_out_time !== undefined) {
    assistance.check_out_time = updates.check_out_time;
  }
  if (updates.duration_minutes !== undefined) {
    assistance.duration_minutes = updates.duration_minutes;
  }
  if (updates.verified !== undefined) {
    assistance.verified = updates.verified;
  }
  if (updates.distance_meters !== undefined) {
    assistance.distance_meters = updates.distance_meters;
  }

  await assistance.save({ transaction: options.transaction });

  return toAssistance(assistance);
}

/**
 * Contar asistencias por usuario
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {Object} filters - Filtros opcionales (startDate, endDate, gymId)
 * @param {Object} options - Opciones (transaction)
 * @returns {Promise<number>} Cantidad de asistencias
 */
async function countAssistancesByUser(userProfileId, filters = {}, options = {}) {
  const where = { id_user_profile: userProfileId };

  if (filters.gymId) {
    where.id_gym = filters.gymId;
  }

  if (filters.startDate && filters.endDate) {
    where.date = { [Op.between]: [filters.startDate, filters.endDate] };
  } else if (filters.startDate) {
    where.date = { [Op.gte]: filters.startDate };
  } else if (filters.endDate) {
    where.date = { [Op.lte]: filters.endDate };
  }

  return await Assistance.count({
    where,
    transaction: options.transaction
  });
}

/**
 * Obtener asistencia del día anterior
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {number} gymId - ID del gimnasio
 * @param {string} yesterdayDate - Fecha del día anterior en formato YYYY-MM-DD
 * @param {Object} options - Opciones (transaction)
 * @returns {Promise<Object|null>} POJO de asistencia o null
 */
async function findYesterdayAssistance(userProfileId, gymId, yesterdayDate, options = {}) {
  const assistance = await Assistance.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
      date: yesterdayDate
    },
    attributes: ['id_assistance', 'date'],
    transaction: options.transaction
  });

  return toAssistance(assistance);
}

module.exports = {
  createAssistance,
  findAssistanceById,
  findAssistances,
  findAssistanceByUserAndDate,
  updateAssistance,
  countAssistancesByUser,
  findYesterdayAssistance
};
