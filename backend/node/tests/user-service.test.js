jest.mock('../models', () => ({
  Account: { findByPk: jest.fn(), findOne: jest.fn() },
  UserProfile: { findByPk: jest.fn() }
}));
jest.mock('../models/RefreshToken', () => ({ update: jest.fn() }));

const userService = require('../services/user-service');
const { Account, UserProfile } = require('../models');
const RefreshToken = require('../models/RefreshToken');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('actualizarPerfil', () => {
  it('actualiza campos permitidos y recarga perfil', async () => {
    const profile = {
      id_user_profile: 1,
      subscription: 'FREE',
      tokens: 50,
      name: 'old',
      age: 20,
      update: jest.fn(async (data) => Object.assign(profile, data)),
      reload: jest.fn().mockResolvedValue(),
      account: { email: 'a@a.com' }
    };
    UserProfile.findByPk.mockResolvedValue(profile);

    const result = await userService.actualizarPerfil(1, { name: 'n', age: 30, password: 'ignore' });

    expect(profile.update).toHaveBeenCalledWith({ name: 'n', age: 30 });
    expect(profile.reload).toHaveBeenCalledWith({
      include: { model: expect.any(Object), as: 'account', attributes: ['email'] }
    });
    expect(result).toEqual(expect.objectContaining({ name: 'n', age: 30, email: 'a@a.com' }));
  });

  it('lanza error si el perfil no existe', async () => {
    UserProfile.findByPk.mockResolvedValue(null);
    await expect(userService.actualizarPerfil(1, {}))
      .rejects.toThrow('Perfil de usuario no encontrado');
  });
});

describe('obtenerUsuario', () => {
  it('combina datos de account y perfil', async () => {
    Account.findByPk.mockResolvedValue({
      id_account: 2,
      email: 'test@example.com',
      auth_provider: 'local',
      email_verified: true,
      last_login: new Date(),
      userProfile: {
        id_user_profile: 5,
        name: 'User',
        lastname: 'Test',
        gender: 'M',
        age: 25,
        locality: 'City',
        subscription: 'FREE',
        tokens: 10,
        id_streak: 3,
        profile_picture_url: 'pic',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const result = await userService.obtenerUsuario(2);

    expect(result).toEqual(expect.objectContaining({
      id: 2,
      email: 'test@example.com',
      id_user_profile: 5,
      name: 'User'
    }));
  });

  it('lanza error si no encuentra usuario', async () => {
    Account.findByPk.mockResolvedValue(null);
    await expect(userService.obtenerUsuario(1)).rejects.toThrow('Usuario no encontrado');
  });
});

describe('eliminarCuenta', () => {
  it('revoca tokens y desactiva cuenta', async () => {
    const account = {
      id_account: 7,
      update: jest.fn(),
      userProfile: { id_user_profile: 10 }
    };
    Account.findByPk.mockResolvedValue(account);

    await userService.eliminarCuenta(7);

    expect(RefreshToken.update).toHaveBeenCalledWith(
      { revoked: true },
      { where: { id_user: 10 } }
    );
    expect(account.update).toHaveBeenCalledWith({ is_active: false });
  });

  it('lanza error si la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);
    await expect(userService.eliminarCuenta(1)).rejects.toThrow('Cuenta no encontrado');
  });
});
