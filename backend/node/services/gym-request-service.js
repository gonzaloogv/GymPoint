const GymRequest = require('../models/GymRequest');
const gymService = require('./gym-service');
const { Amenity } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Convertir nombres de amenidades a IDs
 * Si recibe IDs numéricos, los retorna tal cual
 * Si recibe strings (nombres), busca los IDs correspondientes
 */
async function convertAmenitiesToIds(amenities) {
  if (!Array.isArray(amenities) || amenities.length === 0) {
    return [];
  }

  // Si son todos números, retornar directamente
  const allNumbers = amenities.every(a => typeof a === 'number' || !isNaN(Number(a)));
  if (allNumbers) {
    return amenities.map(a => Number(a)).filter(id => id > 0);
  }

  // Si son strings (nombres), buscar en la BD
  const stringAmenities = amenities.filter(a => typeof a === 'string');
  if (stringAmenities.length === 0) {
    return [];
  }

  const foundAmenities = await Amenity.findAll({
    where: {
      name: stringAmenities
    },
    attributes: ['id_amenity', 'name']
  });

  return foundAmenities.map(a => a.id_amenity);
}

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
    equipment: data.equipment || {},
    services: data.services || [],
    rules: data.rules || [],
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

  // Parse JSON fields if they come as strings (Sequelize sometimes returns JSON as strings)
  const equipment = typeof request.equipment === 'string' ? JSON.parse(request.equipment) : (request.equipment || {});
  const services = typeof request.services === 'string' ? JSON.parse(request.services) : (request.services || []);
  const rules = typeof request.rules === 'string' ? JSON.parse(request.rules) : (request.rules || []);
  const amenitiesRaw = typeof request.amenities === 'string' ? JSON.parse(request.amenities) : (request.amenities || []);

  // Convertir amenities a IDs si vienen como nombres
  const amenityIds = await convertAmenitiesToIds(amenitiesRaw);

  console.log('🔍 DEBUG - GymRequest data (raw):');
  console.log('  services (raw):', request.services, 'type:', typeof request.services);
  console.log('  services (parsed):', services);
  console.log('  amenities (raw):', request.amenities, 'type:', typeof request.amenities);
  console.log('  amenities (parsed):', amenitiesRaw);
  console.log('  amenityIds converted:', amenityIds);

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
    equipment: equipment,
    services: services,
    rules: rules,
    amenities: amenityIds // IDs de amenidades
  };

  console.log('🔍 DEBUG - Gym data to create:');
  console.log('  services:', gymData.services);
  console.log('  amenities:', gymData.amenities);

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
