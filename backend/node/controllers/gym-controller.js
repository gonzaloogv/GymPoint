const gymService = require('../services/gym-service');

const getAllGyms = async (req, res) => {
  try {
    const gyms = await gymService.getAllGyms();
    res.json(gyms);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_ALL_GYMS_FAILED',
        message: err.message
      }
    });
  }
};

const getGymById = async (req, res) => {
  try {
    const gym = await gymService.getGymById(req.params.id);
    if (!gym) {
      return res.status(404).json({
        error: {
          code: 'GYM_NOT_FOUND',
          message: 'Gimnasio no encontrado'
        }
      });
    }
    res.json(gym);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_GYM_FAILED',
        message: err.message
      }
    });
  }
};

const createGym = async (req, res) => {
  try {
    const gym = await gymService.createGym(req.body);
    res.status(201).json(gym);
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'CREATE_GYM_FAILED',
        message: err.message
      }
    });
  }
};

const updateGym = async (req, res) => {
  try {
    const gym = await gymService.updateGym(req.params.id, req.body);
    res.json(gym);
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'UPDATE_GYM_FAILED',
        message: err.message
      }
    });
  }
};

const deleteGym = async (req, res) => {
  try {
    await gymService.deleteGym(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'DELETE_GYM_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Buscar gimnasios cercanos
 * @route GET /api/gyms/cercanos
 * @access Public
 */
const buscarGimnasiosCercanos = async (req, res) => {
  try {
    const { lat, lng, lon, radiusKm, radius, limit, offset } = req.query;
    
    // Soportar tanto 'lng' como 'lon' para retrocompatibilidad
    const longitude = lng || lon;
    
    if (!lat || !longitude) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_PARAMS', 
          message: 'Parámetros requeridos: lat y lng (o lon)' 
        } 
      });
    }

    // Soportar tanto 'radiusKm' como 'radius'
    const radius_km = radiusKm || radius || 5;

    const resultado = await gymService.buscarGimnasiosCercanos(
      parseFloat(lat),
      parseFloat(longitude),
      parseFloat(radius_km),
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0
    );
    
    res.json({
      message: 'Gimnasios cercanos obtenidos con éxito',
      data: resultado,
      meta: {
        total: resultado.length,
        center: { lat: parseFloat(lat), lng: parseFloat(longitude) },
        radius_km: parseFloat(radius_km)
      }
    });
  } catch (err) {
    console.error('Error en buscarGimnasiosCercanos:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'SEARCH_NEARBY_FAILED', 
        message: err.message 
      } 
    });
  }
};

const getGymsByCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CITY',
          message: 'Parámetro city requerido'
        }
      });
    }

    const gyms = await gymService.getGymsByCity(city);
    res.json(gyms);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_GYMS_BY_CITY_FAILED',
        message: err.message
      }
    });
  }
};

const filtrarGimnasios = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const subscription = req.account?.userProfile?.subscription || 'FREE';

    const { city, type, minPrice, maxPrice, amenities } = req.query;

    if ((type || amenities) && subscription !== 'PREMIUM') {
      return res.status(403).json({
        error: {
          code: 'PREMIUM_REQUIRED',
          message: 'Solo usuarios PREMIUM pueden filtrar por tipo o amenidades.'
        }
      });
    }

    const amenityIds = Array.isArray(amenities)
      ? amenities.flat().map(Number).filter(Number.isFinite)
      : (typeof amenities === 'string' && amenities.length
        ? amenities.split(',').map(Number).filter(Number.isFinite)
        : null);

    const { resultados, advertencia } = await gymService.filtrarGimnasios({
      id_user,
      city,
      type: subscription === 'PREMIUM' ? type : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      amenities: subscription === 'PREMIUM' ? amenityIds : null
    });

    res.json({ gimnasios: resultados, advertencia });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'FILTER_GYMS_FAILED',
        message: err.message
      }
    });
  }
};

const getGymTypes = async (req, res) => {
  try {
    const tipos = await gymService.getGymTypes();
    res.json(tipos);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'GET_GYM_TYPES_FAILED',
        message: err.message
      }
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
          message: 'Perfil de usuario requerido'
        }
      });
    }

    const favoritos = await gymService.obtenerFavoritos(userProfile.id_user_profile);
    res.json(favoritos);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: 'GET_FAVORITES_FAILED',
        message: error.message
      }
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
          message: 'Perfil de usuario requerido'
        }
      });
    }

    const idGym = parseInt(req.params.id, 10);
    if (Number.isNaN(idGym)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_GYM_ID',
          message: 'ID de gimnasio inválido'
        }
      });
    }

    const resultado = await gymService.toggleFavorito(userProfile.id_user_profile, idGym);
    res.json(resultado);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: 'TOGGLE_FAVORITE_FAILED',
        message: error.message
      }
    });
  }
};

const getAmenities = async (req, res) => {
  try {
    const amenities = await gymService.listarAmenidades();
    res.json(amenities);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'GET_GYM_AMENITIES_FAILED',
        message: error.message
      }
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
  getGymTypes,
  getAmenities,
  obtenerFavoritos,
  toggleFavorito
};
