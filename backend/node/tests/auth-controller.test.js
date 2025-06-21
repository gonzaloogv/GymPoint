const authController = require('../controllers/auth-controller');
const authService = require('../services/auth-service');

jest.mock('../services/auth-service');

describe('auth-controller.login', () => {
  it('returns 200 with tokens', async () => {
    const req = { body: { email: 'a', password: 'b' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const user = { id_user: 1 };
    authService.login.mockResolvedValue({ token: 't', refreshToken: 'r', user });

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({ accessToken: 't', refreshToken: 'r', user });
  });

  it('returns 401 on error', async () => {
    const req = { body: { email: 'a', password: 'b' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    authService.login.mockRejectedValue(new Error('invalid'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid' });
  });
});