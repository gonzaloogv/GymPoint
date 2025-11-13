jest.mock('../models', () => ({
  Gym: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  GymType: jest.fn(() => ({})),
  GymAmenity: {
    findAll: jest.fn()
  },
  UserFavoriteGym: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  UserProfile: {}
}));

const gymService = require('../services/gym-service');
const { Gym, UserFavoriteGym, GymAmenity } = require('../models');

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
        expect.objectContaining({
          model: Gym,
          as: 'gym',
          required: true,
          include: expect.arrayContaining([
            expect.objectContaining({
              as: 'amenities',
              through: expect.objectContaining({ attributes: [] })
            })
          ])
        })
      ],
      order: [['created_at', 'DESC']]
    });
    expect(favoritos).toEqual([
      { id_gym: 1, created_at: '2025-01-01', gym: { id_gym: 1, name: 'Gym 1' } }
    ]);
  });
});

describe('filtrarGimnasios', () => {
  it('filtra gimnasios que cumplen todas las amenidades solicitadas', async () => {
    Gym.findAll.mockResolvedValue([
      {
        id_gym: 10,
        month_price: 100,
        amenities: [{ id_amenity: 1 }, { id_amenity: 2 }]
      },
      {
        id_gym: 20,
        month_price: 80,
        amenities: [{ id_amenity: 1 }]
      }
    ]);

    const { resultados, advertencia } = await gymService.filtrarGimnasios({
      city: null,
      type: null,
      minPrice: null,
      maxPrice: null,
      amenities: [1, 2]
    });

    expect(Gym.findAll).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.arrayContaining([
        expect.objectContaining({ as: 'amenities' })
      ]),
      order: [['month_price', 'ASC']]
    }));

    expect(resultados.map((gym) => gym.id_gym)).toEqual([10]);
    expect(advertencia).toBeTruthy();
  });
});
