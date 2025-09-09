jest.mock('../models/User', () => ({
    findByPk: jest.fn()
  }));
  
  const userService = require('../services/user-service');
  const User = require('../models/User');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('actualizarPerfil', () => {
    it('updates user profile', async () => {
      const instance = { update: jest.fn().mockResolvedValue('updated') };
      User.findByPk.mockResolvedValue(instance);
  
      const result = await userService.actualizarPerfil(1, { name: 'new' });
  
      expect(instance.update).toHaveBeenCalledWith({ name: 'new' });
      expect(result).toBe('updated');
    });
  
    it('throws if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      await expect(userService.actualizarPerfil(1, {})).rejects.toThrow('Usuario no encontrado');
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
  
    it('throws if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      await expect(userService.obtenerUsuario(1)).rejects.toThrow('Usuario no encontrado');
    });
  });