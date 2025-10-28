const GymRequest = require('../models/GymRequest');
const gymService = require('./gym-service');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obtener todas las solicitudes, opcionalmente filtradas por estado
 */
async function getAllRequests(status = null) {
  const where = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where.status = status;
  }

  const requests = await GymRequest.findAll({
    where,
    order: [['created_at', 'DESC']]
  });

  return requests;
}

/**
 * Obtener una solicitud por ID
 */
async function getRequestById(id) {
  const request = await GymRequest.findByPk(id);
  return request;
}

/**
 * Crear una nueva solicitud
 */
async function createRequest(data) {
  // Validaciones básicas
  if (!data.name || !data.city || !data.address) {
    throw new ValidationError('Nombre, ciudad y dirección son campos obligatorios');
  }

  if (!data.email && !data.phone) {
    throw new ValidationError('Debe proporcionar al menos un email o teléfono de contacto');
  }

  const request = await GymRequest.create({
    name: data.name,
    description: data.description,
    city: data.city,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone,
    email: data.email,
    website: data.website,
    instagram: data.instagram,
    facebook: data.facebook,
    photos: data.photos || [],
    equipment: data.equipment || [],
    monthly_price: data.monthly_price,
    weekly_price: data.weekly_price,
    daily_price: data.daily_price,
    schedule: data.schedule || [],
    amenities: data.amenities || [],
    status: 'pending'
  });

  return request;
}

/**
 * Aprobar una solicitud y crear el gimnasio
 */
async function approveRequest(requestId, adminId) {
  const request = await GymRequest.findByPk(requestId);

  if (!request) {
    throw new NotFoundError('Solicitud no encontrada');
  }

  if (request.status !== 'pending') {
    throw new ValidationError('Solo se pueden aprobar solicitudes pendientes');
  }

  // Mapear los datos de la solicitud al formato esperado por gymService
  const gymData = {
    name: request.name,
    city: request.city,
    address: request.address,
    latitude: request.latitude || 0,
    longitude: request.longitude || 0,
    month_price: request.monthly_price || 0,
    description: request.description,
    phone: request.phone,
    email: request.email,
    website: request.website,
    instagram: request.instagram,
    facebook: request.facebook,
    is_active: true,
    verified: false,
    featured: false,
    auto_checkin_enabled: false,
    equipment: request.equipment || [],
    rules: [],
    amenities: request.amenities || [], // IDs de amenidades
    // Mapear equipment a type_names para compatibilidad con el servicio de gym
    type_names: request.equipment || []
  };

  // Si tiene precio semanal, agregarlo a las reglas o descripción
  if (request.weekly_price) {
    gymData.week_price = request.weekly_price;
  }

  // Crear el gimnasio usando el servicio existente
  const gym = await gymService.createGym(gymData);

  // Actualizar la solicitud
  await request.update({
    status: 'approved',
    id_gym: gym.id_gym,
    processed_by: adminId,
    processed_at: new Date()
  });

  return gym;
}

/**
 * Rechazar una solicitud
 */
async function rejectRequest(requestId, reason, adminId) {
  const request = await GymRequest.findByPk(requestId);

  if (!request) {
    throw new NotFoundError('Solicitud no encontrada');
  }

  if (request.status !== 'pending') {
    throw new ValidationError('Solo se pueden rechazar solicitudes pendientes');
  }

  await request.update({
    status: 'rejected',
    rejection_reason: reason,
    processed_by: adminId,
    processed_at: new Date()
  });

  return request;
}

/**
 * Eliminar una solicitud
 */
async function deleteRequest(requestId) {
  const request = await GymRequest.findByPk(requestId);

  if (!request) {
    throw new NotFoundError('Solicitud no encontrada');
  }

  await request.destroy();
}

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  deleteRequest
};
