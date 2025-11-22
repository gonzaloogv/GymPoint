const GymRequest = require('../models/GymRequest');
const gymService = require('./gym-service');
const { Amenity } = require('../models');
const { gymScheduleRepository } = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { appEvents, EVENTS } = require('../websocket/events/event-emitter');

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
    trial_allowed: data.trial_allowed || false,
    amenities: data.amenities || [],
    status: 'pending'
  });

  // Emitir evento para actualizaciones en tiempo real
  appEvents.emit(EVENTS.GYM_REQUEST_CREATED, {
    gymRequest: request.toJSON(),
    timestamp: new Date()
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
  const scheduleRaw = typeof request.schedule === 'string' ? JSON.parse(request.schedule) : (request.schedule || []);
  const amenitiesRaw = typeof request.amenities === 'string' ? JSON.parse(request.amenities) : (request.amenities || []);
  const trialAllowed = typeof request.trial_allowed === 'string'
    ? ['true', '1', 'yes', 'si', 'sí'].includes(request.trial_allowed.toLowerCase())
    : Boolean(request.trial_allowed);

  // Convertir amenities a IDs si vienen como nombres
  const amenityIds = await convertAmenitiesToIds(amenitiesRaw);

  console.log('🔍 DEBUG - GymRequest data (raw):');
  console.log('  id:', request.id_gym_request);
  console.log('  name:', request.name);
  console.log('  city:', request.city);
  console.log('  address:', request.address);
  console.log('  latitude:', request.latitude, 'longitude:', request.longitude);
  console.log('  description:', request.description);
  console.log('  phone:', request.phone, 'email:', request.email);
  console.log('  services (raw):', request.services, 'type:', typeof request.services);
  console.log('  services (parsed):', services);
  console.log('  amenities (raw):', request.amenities, 'type:', typeof request.amenities);
  console.log('  amenities (parsed):', amenitiesRaw);
  console.log('  amenityIds converted:', amenityIds);

  // Mapear los datos de la solicitud al formato esperado por gymService
  const gymData = {
    name: request.name,
    city: request.city,
    address: (request.address || '').slice(0, 100),
    latitude: request.latitude || 0,
    longitude: request.longitude || 0,
    month_price: request.monthly_price || 0,
    description: (request.description || 'Sin descripción').slice(0, 500),
    phone: request.phone,
    email: request.email,
    website: request.website,
    instagram: request.instagram,
    facebook: request.facebook,
    is_active: true,
    verified: false,
    featured: false,
    auto_checkin_enabled: false,
    trial_allowed: trialAllowed,
    equipment: equipment,
    services: services,
    rules: rules,
    amenities: amenityIds // IDs de amenidades
  };

  console.log('🔍 DEBUG - Gym data to create:');
  console.log('  name:', gymData.name);
  console.log('  city:', gymData.city);
  console.log('  address:', gymData.address);
  console.log('  coords:', gymData.latitude, gymData.longitude);
  console.log('  description:', gymData.description);
  console.log('  phone/email:', gymData.phone, gymData.email);
  console.log('  week_price:', gymData.week_price, 'month_price:', gymData.month_price);
  console.log('  services:', gymData.services);
  console.log('  amenities:', gymData.amenities);

  // Si tiene precio semanal, setearlo
  if (request.weekly_price) {
    gymData.week_price = request.weekly_price;
  }

  // Crear el gimnasio usando el servicio existente
  const gym = await gymService.createGym(gymData);

  // Crear horarios regulares a partir del schedule enviado
  const dayMap = {
    domingo: 0, sunday: 0,
    lunes: 1, monday: 1,
    martes: 2, tuesday: 2,
    miércoles: 3, miercoles: 3, wednesday: 3,
    jueves: 4, thursday: 4,
    viernes: 5, friday: 5,
    sábado: 6, sabado: 6, saturday: 6,
  };

  const normalizedSchedule = Array.isArray(scheduleRaw) ? scheduleRaw : [];
  const schedulePayloads = normalizedSchedule
    .map((item) => {
      const key = typeof item.day === 'string' ? item.day.toLowerCase() : '';
      const day_of_week = dayMap[key];
      if (day_of_week === undefined) return null;

      const isOpen = item.is_open !== false && item.is_open !== 'false';
      return {
        id_gym: gym.id_gym,
        day_of_week,
        open_time: isOpen && item.opens ? item.opens : '00:00',
        close_time: isOpen && item.closes ? item.closes : '00:00',
        is_closed: !isOpen,
      };
    })
    .filter(Boolean);

  if (schedulePayloads.length > 0) {
    await Promise.all(
      schedulePayloads.map((payload) =>
        gymScheduleRepository.createSchedule(payload).catch((err) => {
          console.error('[GymRequest] Error creando horario', payload, err.message);
          return null;
        })
      )
    );
  }

  // Actualizar la solicitud
  await request.update({
    status: 'approved',
    id_gym: gym.id_gym,
    processed_by: adminId,
    processed_at: new Date()
  });

  // Emitir evento para actualizaciones en tiempo real
  appEvents.emit(EVENTS.GYM_REQUEST_APPROVED, {
    requestId: request.id_gym_request,
    gymId: gym.id_gym,
    gymRequest: request.toJSON(),
    gym: gym.toJSON ? gym.toJSON() : gym,
    timestamp: new Date()
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

  // Emitir evento para actualizaciones en tiempo real
  appEvents.emit(EVENTS.GYM_REQUEST_REJECTED, {
    requestId: request.id_gym_request,
    gymRequest: request.toJSON(),
    reason: reason,
    timestamp: new Date()
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
