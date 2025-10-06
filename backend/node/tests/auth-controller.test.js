process.env.GOOGLE_CLIENT_ID = 'test-client-id';

jest.mock('../services/auth-service');
jest.mock('../utils/auth-providers/google-provider', () => {
  return jest.fn().mockImplementation(() => ({
    verifyToken: jest.fn(),
    validateGoogleUser: jest.fn()
  }));
});

const authController = require('../controllers/auth-controller');
const authService = require('../services/auth-service');

describe('auth-controller.login', () => {
  it('returns 200 with tokens', async () => {
    const req = { body: { email: 'a', password: 'b' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const mockAccount = {
      id_account: 1,
      email: 'a',
      roles: [{ role_name: 'USER' }]
    };
    const mockProfile = {
      id_user_profile: 1,
      name: 'Test',
      lastname: 'User',
      subscription: 'FREE',
      tokens: 100
    };
    authService.login.mockResolvedValue({ 
      token: 't', 
      refreshToken: 'r', 
      account: mockAccount,
      profile: mockProfile
    });

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({ 
      accessToken: 't', 
      refreshToken: 'r', 
      user: expect.objectContaining({
        id: 1,
        email: 'a',
        roles: ['USER']
      })
    });
  });

  it('returns 401 on error', async () => {
    const req = { body: { email: 'a', password: 'b' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    authService.login.mockRejectedValue(new Error('invalid'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      error: {
        code: 'LOGIN_FAILED',
        message: 'invalid'
      }
    });
  });
});