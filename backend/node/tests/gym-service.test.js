jest.mock('../models/Gym', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/User', () => ({}));
jest.mock('../models/GymType', () => jest.fn(() => ({})));

const gymService = require('../services/gym-service');
const Gym = require('../models/Gym');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('buscarGimnasiosCercanos', () => {
  it('orders gyms by distance', async () => {
    const gym1 = {
      latitude: 0,
      longitude: 0,
      toJSON: () => ({ id: 1, latitude: 0, longitude: 0 }),
    };
    const gym2 = {
      latitude: 0,
      longitude: 1,
      toJSON: () => ({ id: 2, latitude: 0, longitude: 1 }),
    };
    Gym.findAll.mockResolvedValue([gym2, gym1]);

    const result = await gymService.buscarGimnasiosCercanos(0, 0);

    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});
