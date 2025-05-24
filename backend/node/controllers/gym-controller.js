const gymService = require('../services/gym-service');

const getAllGyms = async (req, res) => {
  const gyms = await gymService.getAllGyms();
  res.json(gyms);
};

const getGymById = async (req, res) => {
  const gym = await gymService.getGymById(req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });
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

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym
};
