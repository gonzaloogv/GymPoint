const gymService = require('../services/gym-service');

const getAllGyms = async (req, res) => {
  const gyms = await gymService.getAllGyms();
  res.json(gyms);
};

const getGymById = async (req, res) => {
  const gym = await gymService.getGymById(req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym no encontrado' });
  res.json(gym);
};

const createGym = async (req, res) => {
  const gym = await gymService.createGym(req.body);
  res.status(201).json(gym);
};

const updateGym = async (req, res) => {
  try {
    const gym = await gymService.updateGym(req.params.id, req.body);
    res.json(gym);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const deleteGym = async (req, res) => {
  try {
    await gymService.deleteGym(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
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
    if (!city) return res.status(400).json({ error: 'Parámetro city requerido' });

    const gyms = await gymService.getGymsByCity(city);
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const filtrarGimnasios = async (req, res) => {
  try {
    const id_user = req.user.id;
    const rol = req.user.rol;// 'FREE' o 'PREMIUM'

    const { city, type, minPrice, maxPrice } = req.query;

    // Solo usuarios PREMIUM pueden usar el filtro "type"
    if (type && rol !== 'PREMIUM') {
      return res.status(403).json({
        error: 'Solo usuarios PREMIUM pueden filtrar por tipo de gimnasio.'
      });
    }

    const { resultados, advertencia } = await gymService.filtrarGimnasios({
      id_user,
      city,
      type: rol === 'PREMIUM' ? type : null, // si no es premium, se ignora
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null
    });

    res.json({ gimnasios: resultados, advertencia });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getGymTypes = (req, res) => {
  const tipos = gymService.getGymTypes();
  res.json(tipos);
};

const obtenerFavoritos = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({ error: 'Perfil de usuario requerido' });
    }
    
    const favoritos = await gymService.obtenerFavoritos(userProfile.id_user_profile);
    res.json(favoritos);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const toggleFavorito = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({ error: 'Perfil de usuario requerido' });
    }

    const idGym = parseInt(req.params.id, 10);
    if (Number.isNaN(idGym)) {
      return res.status(400).json({ error: 'ID de gimnasio inválido' });
    }

    const resultado = await gymService.toggleFavorito(userProfile.id_user_profile, idGym);
    res.json(resultado);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
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
  obtenerFavoritos,
  toggleFavorito
};
