const { Op } = require('sequelize');
const { Presence, Gym, UserProfile } = require('../../../models');
const { toPresence, toPresences } = require('../../db/mappers/presence.mapper');

/**
 * Crea una nueva presencia
 */
async function createPresence(payload, options = {}) {
  const presence = await Presence.create(
    {
      id_user_profile: payload.userProfileId || payload.id_user_profile,
      id_gym: payload.gymId || payload.id_gym,
      first_seen_at: payload.firstSeenAt || new Date(),
      last_seen_at: payload.lastSeenAt || new Date(),
      status: payload.status || 'DETECTING',
      distance_meters: payload.distanceMeters || payload.distance_meters,
      accuracy_meters: payload.accuracyMeters || payload.accuracy_meters || null,
      location_updates_count: payload.locationUpdatesCount || 1,
    },
    {
      transaction: options.transaction,
    }
  );
  return toPresence(presence);
}

/**
 * Actualiza una presencia
 */
async function updatePresence(idPresence, payload, options = {}) {
  await Presence.update(payload, {
    where: { id_presence: idPresence },
    transaction: options.transaction,
  });

  if (options.returning === false) {
    return null;
  }

  return findById(idPresence, options);
}

/**
 * Encuentra una presencia por ID
 */
async function findById(idPresence, options = {}) {
  const presence = await Presence.findByPk(idPresence, {
    include: options.includeRelations
      ? [
          {
            model: UserProfile,
            as: 'userProfile',
            attributes: ['id_user_profile', 'name', 'lastname'],
          },
          {
            model: Gym,
            as: 'gym',
            attributes: ['id_gym', 'name', 'city', 'address'],
          },
        ]
      : undefined,
    transaction: options.transaction,
  });
  return toPresence(presence);
}

/**
 * Encuentra presencia activa de un usuario en un gym
 */
async function findActivePresence(idUserProfile, idGym, options = {}) {
  const presence = await Presence.findOne({
    where: {
      id_user_profile: idUserProfile,
      id_gym: idGym,
      status: {
        [Op.in]: ['DETECTING', 'CONFIRMED'],
      },
    },
    order: [['last_seen_at', 'DESC']],
    transaction: options.transaction,
  });
  return toPresence(presence);
}

/**
 * Lista presencias de un usuario con filtros
 */
async function findAll({ filters = {}, pagination = {}, sort = {}, options = {} }) {
  const where = {};

  // Filtros obligatorios
  if (filters.userProfileId) {
    where.id_user_profile = filters.userProfileId;
  }

  // Filtros opcionales
  if (filters.gymId) {
    where.id_gym = filters.gymId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  // Rango de fechas
  if (filters.startDate || filters.endDate) {
    where.first_seen_at = {};
    if (filters.startDate) {
      where.first_seen_at[Op.gte] = filters.startDate;
    }
    if (filters.endDate) {
      where.first_seen_at[Op.lte] = filters.endDate;
    }
  }

  // Paginación
  const limit = pagination.limit ?? 20;
  const offset = pagination.offset ?? 0;

  // Ordenamiento
  const order = [[sort.field || 'first_seen_at', sort.direction || 'DESC']];

  const { rows, count } = await Presence.findAndCountAll({
    where,
    include: options.includeRelations
      ? [
          {
            model: Gym,
            as: 'gym',
            attributes: ['id_gym', 'name', 'city'],
          },
        ]
      : undefined,
    limit,
    offset,
    order,
    transaction: options.transaction,
  });

  return {
    rows: toPresences(rows),
    count,
  };
}

/**
 * Marca una presencia como convertida a asistencia
 */
async function markAsConvertedToAssistance(idPresence, idAssistance, options = {}) {
  return updatePresence(
    idPresence,
    {
      converted_to_assistance: true,
      id_assistance: idAssistance,
      status: 'EXITED',
      exited_at: new Date(),
    },
    options
  );
}

module.exports = {
  createPresence,
  updatePresence,
  findById,
  findActivePresence,
  findAll,
  markAsConvertedToAssistance,
};
