const Gym = require('../models/Gym');

const getAllGyms = async () => {
  return await Gym.findAll();
};

const getGymById = async (id) => {
  return await Gym.findByPk(id);
};

const createGym = async (data) => {
  return await Gym.create(data);
};

const updateGym = async (id, data) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');
  return await gym.update(data);
};

const deleteGym = async (id) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');
  return await gym.destroy();
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym
};
