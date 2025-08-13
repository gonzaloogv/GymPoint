jest.mock('../models/User', () => ({
    findByPk: jest.fn()
  }));
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

const userService = require('../services/user-service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('actualizarPerfil', () => {
  it('filters out forbidden fields', async () => {
    const instance = { update: jest.fn().mockResolvedValue('updated') };
    User.findByPk.mockResolvedValue(instance);

    const result = await userService.actualizarPerfil(1, { name: 'new', role: 'ADMIN', subscription: 'PREMIUM' });

    expect(instance.update).toHaveBeenCalledWith({ name: 'new' });
    expect(result).toBe('updated');
  });

  it('throws if user not found', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(userService.actualizarPerfil(1, {})).rejects.toThrow('Usuario no encontrado');
  });
});

describe('cambiarPassword', () => {
  it('updates password when current matches', async () => {
    const instance = { password: 'hash', update: jest.fn() };
    User.findByPk.mockResolvedValue(instance);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newhash');

    await userService.cambiarPassword(1, 'old', 'new');

    expect(instance.update).toHaveBeenCalledWith({ password: 'newhash' });
  });

  it('throws if current password invalid', async () => {
    const instance = { password: 'hash' };
    User.findByPk.mockResolvedValue(instance);
    bcrypt.compare.mockResolvedValue(false);

    await expect(userService.cambiarPassword(1, 'bad', 'new')).rejects.toThrow('Contraseña actual incorrecta');
  });
});

describe('obtenerUsuario', () => {
  it('returns user info', async () => {
    const user = { id_user: 1 };
    User.findByPk.mockResolvedValue(user);

    const result = await userService.obtenerUsuario(1);
    expect(User.findByPk).toHaveBeenCalledWith(1, { attributes: { exclude: ['password'] } });
    expect(result).toBe(user);
  });
});

it('throws if user not found', async () => {
  User.findByPk.mockResolvedValue(null);
  await expect(userService.obtenerUsuario(1)).rejects.toThrow('Usuario no encontrado');
});