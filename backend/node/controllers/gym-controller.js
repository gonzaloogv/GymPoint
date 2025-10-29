const gymService = require('../services/gym-service');
const { gym: gymMapper } = require('../services/mappers');
const { ValidationError, NotFoundError } = require('../utils/errors');

const getAllGyms = async (req, res) => {
  try {
    const query = gymMapper.toListGymsQuery(req.query || {});
    const page = await gymService.listGyms(query);
    res.json(gymMapper.toPaginatedGymsResponse(page));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_QUERY' : 'GET_ALL_GYMS_FAILED',
        message: err.message,
      },
    });
  }
};

const getGymById = async (req, res) => {
  try {
    const query = gymMapper.toGetGymDetailQuery(req.params.id);
    const gym = await gymService.getGymById(query);
    if (!gym) {
      return res.status(404).json({
        error: {
          code: 'GYM_NOT_FOUND',
          message: 'Gimnasio no encontrado',
        },
      });
    }
    res.json(gymMapper.toGymResponse(gym));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_GYM_ID' : 'GET_GYM_FAILED',
        message: err.message,
      },
    });
  }
};

const createGym = async (req, res) => {
  try {
    console.log('=== CONTROLLER createGym ===');
    console.log('Request body equipment:', JSON.stringify(req.body.equipment));
    console.log('Request body rules:', JSON.stringify(req.body.rules));
    console.log('Request body services:', JSON.stringify(req.body.services));
    console.log('Request body amenities:', JSON.stringify(req.body.amenities));
    
    const command = gymMapper.toCreateGymCommand(req.body, req.account?.id_account || null);
    const gym = await gymService.createGym(command);
    res.status(201).json(gymMapper.toGymResponse(gym));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_DATA' : 'CREATE_GYM_FAILED',
        message: err.message,
      },
    });
  }
};

const updateGym = async (req, res) => {
  try {
    const command = gymMapper.toUpdateGymCommand(
      req.body,
      req.params.id,
      req.account?.id_account || null
    );
    const gym = await gymService.updateGym(command.gymId, command);
    res.json(gymMapper.toGymResponse(gym));
  } catch (err) {
    const status =
      err instanceof ValidationError ? 400 : err instanceof NotFoundError ? 404 : 500;
    res.status(status).json({
      error: {
        code:
          status === 400
            ? 'INVALID_DATA'
            : status === 404
            ? 'GYM_NOT_FOUND'
            : 'UPDATE_GYM_FAILED',
        message: err.message,
      },
    });
  }
};

const deleteGym = async (req, res) => {
  try {
    const command = gymMapper.toDeleteGymCommand(
      req.params.id,
      req.account?.id_account || null
    );
    await gymService.deleteGym(command);
    res.status(204).send();
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    res.status(status).json({
      error: {
        code: status === 404 ? 'GYM_NOT_FOUND' : 'DELETE_GYM_FAILED',
        message: err.message,
      },
    });
  }
};

const buscarGimnasiosCercanos = async (req, res) => {
  try {
    const gyms = await gymService.buscarGimnasiosCercanos(req.query);
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng ?? req.query.lon);
    const radiusKm = parseFloat(req.query.radiusKm ?? req.query.radius ?? 5);

    res.json({
      message: 'Gimnasios cercanos obtenidos con éxito',
      data: gyms.map((gym) => gymMapper.toGymResponse(gym)),
      meta: {
        total: gyms.length,
        center: {
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null,
        },
        radius_km: Number.isFinite(radiusKm) ? radiusKm : null,
      },
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_QUERY' : 'SEARCH_NEARBY_FAILED',
        message: err.message,
      },
    });
  }
};

const getGymsByCity = async (req, res) => {
  try {
    const gyms = await gymService.getGymsByCity(req.params.city || req.query.city);
    res.json(gyms.map((gym) => gymMapper.toGymResponse(gym)));
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_GYMS_BY_CITY_FAILED',
        message: err.message,
      },
    });
  }
};

const filtrarGimnasios = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'USER_PROFILE_REQUIRED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const { subscription } = userProfile;
    const amenityIds = Array.isArray(req.query.amenities)
      ? req.query.amenities.flat().map(Number).filter(Number.isFinite)
      : typeof req.query.amenities === 'string' && req.query.amenities.length
      ? req.query.amenities.split(',').map(Number).filter(Number.isFinite)
      : [];

    const { resultados, advertencia } = await gymService.filtrarGimnasios({
      city: req.query.city || null,
      type: subscription === 'PREMIUM' ? req.query.type : null,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      amenities: subscription === 'PREMIUM' ? amenityIds : null,
    });

    res.json({
      gimnasios: resultados.map((gym) => gymMapper.toGymResponse(gym)),
      advertencia,
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({
      error: {
        code: status === 400 ? 'INVALID_FILTER' : 'FILTER_GYMS_FAILED',
        message: err.message,
      },
    });
  }
};

// getGymTypes - ELIMINADO: Ya no se usa, los tipos están en gym.services como array de strings

const getAmenities = async (req, res) => {
  try {
    const amenities = await gymService.listarAmenidades(req.query);
    res.json(amenities.map((item) => gymMapper.toGymAmenityResponse(item)));
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_GYM_AMENITIES_FAILED',
        message: err.message,
      },
    });
  }
};

const obtenerFavoritos = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'USER_PROFILE_REQUIRED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const favoritos = await gymService.obtenerFavoritos(userProfile.id_user_profile);
    res.json(
      favoritos.map((fav) => ({
        id_gym: fav.id_gym,
        created_at: fav.created_at,
        gym: gymMapper.toGymResponse(fav.gym),
      }))
    );
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_FAVORITES_FAILED',
        message: err.message,
      },
    });
  }
};

const toggleFavorito = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'USER_PROFILE_REQUIRED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const idGym = Number(req.params.id);
    if (!Number.isFinite(idGym)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_GYM_ID',
          message: 'ID de gimnasio inválido',
        },
      });
    }

    const resultado = await gymService.toggleFavorito(userProfile.id_user_profile, idGym);
    res.json(resultado);
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    res.status(status).json({
      error: {
        code: status === 404 ? 'GYM_NOT_FOUND' : 'TOGGLE_FAVORITE_FAILED',
        message: err.message,
      },
    });
  }
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  buscarGimnasiosCercanos,
  getGymsByCity,
  filtrarGimnasios,
  // getGymTypes - eliminado
  getAmenities,
  obtenerFavoritos,
  toggleFavorito,
};
