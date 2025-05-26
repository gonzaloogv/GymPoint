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

const buscarGimnasiosCercanos = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Faltan parámetros lat y lon' });
    }

    const resultado = await gymService.buscarGimnasiosCercanos(
      parseFloat(lat),
      parseFloat(lon)
    );
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { id_user, city, type, minPrice, maxPrice } = req.query;
    if (!id_user) return res.status(400).json({ error: 'id_user es requerido' });

    const { resultados, advertencia } = await gymService.filtrarGimnasios({
      id_user,
      city,
      type,
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice)
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


module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  buscarGimnasiosCercanos,
  getGymsByCity,
  filtrarGimnasios,
  getGymTypes
};
