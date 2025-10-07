jest.mock('../models/UserGym', () => ({ findOne: jest.fn(), create: jest.fn(), count: jest.fn(), findAll: jest.fn() }));
jest.mock('../models/Gym', () => ({}));
jest.mock('../models', () => ({ UserProfile: {} }));

const service = require('../services/user-gym-service');
const UserGym = require('../models/UserGym');

beforeEach(() => { jest.clearAllMocks(); });

describe('darAltaEnGimnasio', () => {
  it('throws if already active', async () => {
    UserGym.findOne.mockResolvedValue({ active: true });
    await expect(service.darAltaEnGimnasio({ id_user:1, id_gym:1, plan:'a' })).rejects.toThrow('El usuario ya está activo en este gimnasio.');
  });

  it('creates new membership', async () => {
    UserGym.findOne.mockResolvedValue(null);
    UserGym.create.mockResolvedValue('ok');
    const result = await service.darAltaEnGimnasio({ id_user:1, id_gym:1, plan:'a' });
    expect(UserGym.create).toHaveBeenCalled();
    expect(result).toBe('ok');
  });
});

describe('contarUsuariosActivosEnGimnasio', () => {
  it('returns count', async () => {
    UserGym.count.mockResolvedValue(3);
    const total = await service.contarUsuariosActivosEnGimnasio(1);
    expect(total).toBe(3);
  });
});