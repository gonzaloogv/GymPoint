const gymRequestService = require('../services/gym-request-service');
const { ValidationError, NotFoundError } = require('../utils/errors');
const GymAmenity = require('../models/GymAmenity');

/**
 * Convierte nombres de amenidades a IDs
 * @param {string[]} amenityNames - Array de nombres de amenidades
 * @returns {Promise<number[]>} - Array de IDs de amenidades
 */
async function convertAmenityNamesToIds(amenityNames) {
  if (!Array.isArray(amenityNames) || amenityNames.length === 0) {
    return [];
  }

  try {
    // Buscar amenidades en la base de datos
    const amenities = await GymAmenity.findAll({
      where: {
        name: amenityNames
      },
      attributes: ['id_amenity', 'name']
    });

    return amenities.map(amenity => amenity.id_amenity);
  } catch (error) {
    console.error('Error converting amenity names to IDs:', error);
    return [];
  }
}

/**
 * Obtener todas las solicitudes de gimnasios
 */
const getAllGymRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await gymRequestService.getAllRequests(status);
    res.json({
      message: 'Solicitudes obtenidas exitosamente',
      data: requests
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_QUERY' : 'GET_REQUESTS_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Obtener una solicitud por ID
 */
const getGymRequestById = async (req, res) => {
  try {
    const request = await gymRequestService.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Solicitud no encontrada',
        },
      });
    }
    res.json({
      message: 'Solicitud obtenida exitosamente',
      data: request
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_REQUEST_ID' : 'GET_REQUEST_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Crear una nueva solicitud de gimnasio (desde la landing)
 */
const createGymRequest = async (req, res) => {
  try {
    // Convertir nombres de amenidades a IDs
    const amenityNames = req.body.amenities || [];
    const amenityIds = await convertAmenityNamesToIds(amenityNames);

    const requestData = {
      name: req.body.name,
      description: req.body.description || null,
      city: req.body.location?.city || req.body.city,
      address: req.body.location?.address || req.body.address,
      latitude: req.body.location?.latitude || req.body.latitude,
      longitude: req.body.location?.longitude || req.body.longitude,
      phone: req.body.contact?.phone || req.body.phone,
      email: req.body.contact?.email || req.body.email,
      website: req.body.website || null,
      instagram: req.body.contact?.social_media?.instagram || req.body.instagram,
      facebook: req.body.contact?.social_media?.facebook || req.body.facebook,
      photos: req.body.attributes?.photos || req.body.photos || [],
      equipment: req.body.attributes?.equipment || req.body.equipment || [],
      monthly_price: req.body.pricing?.monthly || req.body.monthly_price,
      weekly_price: req.body.pricing?.weekly || req.body.weekly_price,
      daily_price: req.body.pricing?.daily || req.body.daily_price,
      schedule: req.body.schedule || [],
      amenities: amenityIds // Ahora son IDs numéricos
    };

    console.log('🔍 DEBUG - Equipment recibido:', req.body.attributes?.equipment);
    console.log('🔍 DEBUG - RequestData equipment:', requestData.equipment);

    const request = await gymRequestService.createRequest(requestData);

    res.status(201).json({
      message: 'Solicitud creada exitosamente. Será revisada por nuestro equipo.',
      data: request
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_DATA' : 'CREATE_REQUEST_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Aprobar una solicitud de gimnasio
 */
const approveGymRequest = async (req, res) => {
  try {
    const adminId = req.account?.id_account || null;
    const gym = await gymRequestService.approveRequest(req.params.id, adminId);

    res.json({
      message: 'Solicitud aprobada y gimnasio creado exitosamente',
      data: {
        request_id: req.params.id,
        gym: gym
      }
    });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 404 ? 'REQUEST_NOT_FOUND' : status === 400 ? 'INVALID_DATA' : 'APPROVE_REQUEST_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Rechazar una solicitud de gimnasio
 */
const rejectGymRequest = async (req, res) => {
  try {
    const adminId = req.account?.id_account || null;
    const { reason } = req.body;

    const request = await gymRequestService.rejectRequest(req.params.id, reason, adminId);

    res.json({
      message: 'Solicitud rechazada exitosamente',
      data: request
    });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 404 ? 'REQUEST_NOT_FOUND' : status === 400 ? 'INVALID_DATA' : 'REJECT_REQUEST_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Eliminar una solicitud
 */
const deleteGymRequest = async (req, res) => {
  try {
    await gymRequestService.deleteRequest(req.params.id);
    res.status(204).send();
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    res.status(status).json({
      error: {
        code: status === 404 ? 'REQUEST_NOT_FOUND' : 'DELETE_REQUEST_FAILED',
        message: err.message,
      },
    });
  }
};

module.exports = {
  getAllGymRequests,
  getGymRequestById,
  createGymRequest,
  approveGymRequest,
  rejectGymRequest,
  deleteGymRequest
};
