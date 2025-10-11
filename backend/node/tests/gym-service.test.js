jest.mock('../models', () => ({
  Gym: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  GymType: jest.fn(() => ({})),
  UserFavoriteGym: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  UserProfile: {}
}));

const gymService = require('../services/gym-service');
const { Gym, UserFavoriteGym } = require('../models');

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

describe('toggleFavorito', () => {
  it('agrega favorito cuando no existe', async () => {
    Gym.findByPk.mockResolvedValue({ id_gym: 3, name: 'Test Gym', city: 'Cordoba' });
    UserFavoriteGym.findOne.mockResolvedValue(null);
    UserFavoriteGym.create.mockResolvedValue({ id_user_profile: 5, id_gym: 3 });
    const resultado = await gymService.toggleFavorito(5, 3);
    expect(UserFavoriteGym.create).toHaveBeenCalledWith({ id_user_profile: 5, id_gym: 3 });
    expect(resultado).toEqual({ id_gym: 3, favorite: true });
  });
  it('elimina favorito cuando ya existía', async () => {
    const destroy = jest.fn();
    Gym.findByPk.mockResolvedValue({ id_gym: 3 });
    UserFavoriteGym.findOne.mockResolvedValue({ destroy });
    const resultado = await gymService.toggleFavorito(5, 3);
    expect(destroy).toHaveBeenCalled();
    expect(resultado).toEqual({ id_gym: 3, favorite: false });
  });
});
describe('obtenerFavoritos', () => {
  it('devuelve favoritos con datos del gimnasio', async () => {
    UserFavoriteGym.findAll.mockResolvedValue([
      {
        id_gym: 1,
        created_at: '2025-01-01',
        gym: { id_gym: 1, name: 'Gym 1' }
      }
    ]);
    const favoritos = await gymService.obtenerFavoritos(2);
    expect(UserFavoriteGym.findAll).toHaveBeenCalledWith({
      where: { id_user_profile: 2 },
      include: [
        {
          model: Gym,
          as: 'gym',
          required: true
        }
      ],
      order: [['created_at', 'DESC']]
    });
    expect(favoritos).toEqual([
      { id_gym: 1, created_at: '2025-01-01', gym: { id_gym: 1, name: 'Gym 1' } }
    ]);
  });
});