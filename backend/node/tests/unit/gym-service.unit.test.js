jest.mock('../../infra/db/repositories', () => ({
  gymRepository: {
    findById: jest.fn(),
    searchGyms: jest.fn(),
    findNearby: jest.fn(),
    findFavorites: jest.fn(),
    findFavorite: jest.fn(),
    createFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
    findByCity: jest.fn(),
  },
  gymTypeRepository: {
    findAll: jest.fn(),
    ensureTypeIdsByNames: jest.fn(),
  },
  gymAmenityRepository: {
    findAll: jest.fn(),
  },
}));

const repositories = require('../../infra/db/repositories');
const gymService = require('../../services/gym-service');
const {
  ValidationError,
  NotFoundError,
} = require('../../utils/errors');

const gymRepository = repositories.gymRepository;
const gymTypeRepository = repositories.gymTypeRepository;
const gymAmenityRepository = repositories.gymAmenityRepository;

describe('gym-service listGyms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna respuesta paginada normalizada', async () => {
    gymRepository.searchGyms.mockResolvedValue({
      rows: [
        { id_gym: 1, name: 'Gym A', created_at: new Date(), updated_at: new Date() },
      ],
      count: 1,
    });

    const result = await gymService.listGyms({ limit: 5, page: 1 });

    expect(gymRepository.searchGyms).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ limit: 5, offset: 0 }),
      })
    );
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items[0]).toHaveProperty('id_gym', 1);
  });
});

describe('gym-service getGymTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filtra tipos activos cuando activeOnly=true', async () => {
    gymTypeRepository.findAll.mockResolvedValue([{ name: 'crossfit' }, { name: 'boxeo' }]);

    const result = await gymService.getGymTypes({ activeOnly: true });

    expect(gymTypeRepository.findAll).toHaveBeenCalledWith({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    expect(result).toEqual(['crossfit', 'boxeo']);
  });
});

describe('gym-service buscarGimnasiosCercanos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza ValidationError con parámetros inválidos', async () => {
    await expect(gymService.buscarGimnasiosCercanos({ lat: 100, lng: 200 }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('retorna gyms normalizados cuando la entrada es válida', async () => {
    const gyms = [{ id_gym: 1, name: 'Gym' }];
    gymRepository.findNearby.mockResolvedValue(gyms);

    const result = await gymService.buscarGimnasiosCercanos({
      lat: 0,
      lng: 0,
      radiusKm: 5,
    });

    expect(gymRepository.findNearby).toHaveBeenCalledWith({
      lat: 0,
      lng: 0,
      radiusKm: 5,
      limit: 50,
      offset: 0,
    });
    expect(result).toEqual(gyms);
  });
});

describe('gym-service toggleFavorito', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza NotFoundError si el gym no existe', async () => {
    gymRepository.findById.mockResolvedValue(null);

    await expect(gymService.toggleFavorito(1, 10)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('crea favorito cuando no existe', async () => {
    gymRepository.findById.mockResolvedValue({ id_gym: 10 });
    gymRepository.findFavorite.mockResolvedValue(null);
    gymRepository.createFavorite.mockResolvedValue({});

    const result = await gymService.toggleFavorito(1, 10);

    expect(gymRepository.createFavorite).toHaveBeenCalledWith({
      id_user_profile: 1,
      id_gym: 10,
    });
    expect(result).toEqual({ id_gym: 10, favorite: true });
  });

  it('elimina favorito existente', async () => {
    gymRepository.findById.mockResolvedValue({ id_gym: 10 });
    gymRepository.findFavorite.mockResolvedValue({ id_gym: 10 });

    const result = await gymService.toggleFavorito(1, 10);

    expect(gymRepository.deleteFavorite).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({ id_gym: 10, favorite: false });
  });
});
