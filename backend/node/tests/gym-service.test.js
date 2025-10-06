jest.mock('../models/Gym', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));
jest.mock('../models/User', () => ({}));
jest.mock('../models/GymType', () => jest.fn(() => ({})));

const gymService = require('../services/gym-service');
const Gym = require('../models/Gym');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('buscarGimnasiosCercanos', () => {
  it('formatea distancia con dos decimales', async () => {
    Gym.findAll.mockResolvedValue([
      { id: 1, latitude: 0, longitude: 0, distance_km: '0.1234' }
    ]);

    const result = await gymService.buscarGimnasiosCercanos(0, 0, 5, 50, 0);

    expect(Gym.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, latitude: 0, longitude: 0, distance_km: '0.12' }]);
  });
});
