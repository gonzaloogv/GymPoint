jest.mock('../../../services/auth-service');
jest.mock('../../../services/mappers', () => ({
  auth: {
    toRegisterCommand: jest.fn(),
    toLoginCommand: jest.fn(),
    toRefreshTokenCommand: jest.fn(),
    toGoogleAuthCommand: jest.fn(),
    toLogoutCommand: jest.fn(),
    toAuthSuccessResponse: jest.fn(),
    toRefreshTokenResponse: jest.fn(),
  },
}));

const authController = require('../../../controllers/auth-controller');
const authService = require('../../../services/auth-service');
const { auth: authMapper } = require('../../../services/mappers');
const { ConflictError, ValidationError } = require('../../../utils/errors');

describe('auth-controller register', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        lastname: 'Doe',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('registra usuario exitosamente (201)', async () => {
    const mockCommand = { email: 'test@example.com', password: 'password123' };
    const mockResult = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      account: { id_account: 1 },
      profile: { id_user_profile: 10 },
    };
    const mockResponse = {
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      user: { id_user: 10 },
    };

    authMapper.toRegisterCommand.mockReturnValue(mockCommand);
    authService.register.mockResolvedValue(mockResult);
    authMapper.toAuthSuccessResponse.mockReturnValue(mockResponse);

    await authController.register(req, res);

    expect(authMapper.toRegisterCommand).toHaveBeenCalledWith(req.body);
    expect(authService.register).toHaveBeenCalledWith(mockCommand, req);
    expect(authMapper.toAuthSuccessResponse).toHaveBeenCalledWith(mockResult);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna error 409 cuando el email ya existe', async () => {
    const mockCommand = { email: 'exists@example.com', password: 'password123' };
    authMapper.toRegisterCommand.mockReturnValue(mockCommand);
    authService.register.mockRejectedValue(
      new ConflictError('El email ya esta registrado')
    );

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'El email ya esta registrado',
      },
    });
  });

  it('retorna error 400 cuando la validación falla', async () => {
    const mockCommand = { email: 'invalid', password: '123' };
    authMapper.toRegisterCommand.mockReturnValue(mockCommand);
    authService.register.mockRejectedValue(new ValidationError('Datos inválidos'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_DATA',
        message: 'Datos inválidos',
      },
    });
  });

  it('retorna error 400 genérico para otros errores', async () => {
    const mockCommand = { email: 'test@example.com', password: 'password123' };
    authMapper.toRegisterCommand.mockReturnValue(mockCommand);
    authService.register.mockRejectedValue(new Error('Error interno'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'REGISTER_FAILED',
        message: 'Error interno',
      },
    });
  });
});

describe('auth-controller login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'user@example.com',
        password: 'secret123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('hace login exitosamente (200)', async () => {
    const mockCommand = { email: 'user@example.com', password: 'secret123' };
    const mockResult = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      account: { id_account: 2 },
      profile: { id_user_profile: 20 },
    };
    const mockResponse = {
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      user: { id_user: 20 },
    };

    authMapper.toLoginCommand.mockReturnValue(mockCommand);
    authService.login.mockResolvedValue(mockResult);
    authMapper.toAuthSuccessResponse.mockReturnValue(mockResponse);

    await authController.login(req, res);

    expect(authMapper.toLoginCommand).toHaveBeenCalledWith(req.body);
    expect(authService.login).toHaveBeenCalledWith(mockCommand, req);
    expect(authMapper.toAuthSuccessResponse).toHaveBeenCalledWith(mockResult);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna error 401 cuando las credenciales son inválidas', async () => {
    const mockCommand = { email: 'user@example.com', password: 'wrong' };
    authMapper.toLoginCommand.mockReturnValue(mockCommand);
    authService.login.mockRejectedValue(new Error('Credenciales inválidas'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'LOGIN_FAILED',
        message: 'Credenciales inválidas',
      },
    });
  });

  it('retorna error 400 cuando la validación falla', async () => {
    const mockCommand = { email: 'invalid', password: '' };
    authMapper.toLoginCommand.mockReturnValue(mockCommand);
    authService.login.mockRejectedValue(new ValidationError('Email inválido'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_DATA',
        message: 'Email inválido',
      },
    });
  });
});

describe('auth-controller googleLogin', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        idToken: 'google-id-token-123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('hace login con Google exitosamente (200)', async () => {
    const mockResult = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      account: { id_account: 3 },
      profile: { id_user_profile: 30 },
    };
    const mockResponse = {
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      user: { id_user: 30 },
    };

    authService.googleLogin.mockResolvedValue(mockResult);
    authMapper.toAuthSuccessResponse.mockReturnValue(mockResponse);

    await authController.googleLogin(req, res);

    expect(authService.googleLogin).toHaveBeenCalledWith(
      { idToken: 'google-id-token-123' },
      req
    );
    expect(authMapper.toAuthSuccessResponse).toHaveBeenCalledWith(mockResult);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna error 400 cuando falta el idToken', async () => {
    req.body = {};

    await authController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El idToken de Google es requerido',
      },
    });
    expect(authService.googleLogin).not.toHaveBeenCalled();
  });

  it('retorna error 401 cuando la autenticación de Google falla', async () => {
    authService.googleLogin.mockRejectedValue(new Error('Token de Google inválido'));

    await authController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'GOOGLE_AUTH_FAILED',
        message: 'Token de Google inválido',
      },
    });
  });

  it('retorna error 400 cuando es un ValidationError', async () => {
    authService.googleLogin.mockRejectedValue(new ValidationError('Datos inválidos'));

    await authController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_DATA',
        message: 'Datos inválidos',
      },
    });
  });
});

describe('auth-controller refreshAccessToken', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        refreshToken: 'refresh-token-123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('refresca el token exitosamente (200)', async () => {
    const mockCommand = { refreshToken: 'refresh-token-123' };
    const mockResult = { accessToken: 'new-access-token' };
    const mockResponse = { token: 'new-access-token' };

    authMapper.toRefreshTokenCommand.mockReturnValue(mockCommand);
    authService.refreshAccessToken.mockResolvedValue(mockResult);
    authMapper.toRefreshTokenResponse.mockReturnValue(mockResponse);

    await authController.refreshAccessToken(req, res);

    expect(authMapper.toRefreshTokenCommand).toHaveBeenCalledWith({
      refresh_token: 'refresh-token-123',
    });
    expect(authService.refreshAccessToken).toHaveBeenCalledWith(mockCommand);
    expect(authMapper.toRefreshTokenResponse).toHaveBeenCalledWith(mockResult);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('maneja refreshToken con nombre alternativo "token"', async () => {
    req.body = { token: 'refresh-token-456' };
    const mockCommand = { refreshToken: 'refresh-token-456' };
    const mockResult = { accessToken: 'new-access-token' };
    const mockResponse = { token: 'new-access-token' };

    authMapper.toRefreshTokenCommand.mockReturnValue(mockCommand);
    authService.refreshAccessToken.mockResolvedValue(mockResult);
    authMapper.toRefreshTokenResponse.mockReturnValue(mockResponse);

    await authController.refreshAccessToken(req, res);

    expect(authMapper.toRefreshTokenCommand).toHaveBeenCalledWith({
      refresh_token: 'refresh-token-456',
    });
  });

  it('retorna error 400 cuando falta el refreshToken', async () => {
    req.body = {};

    await authController.refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido',
      },
    });
    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('retorna error 401 cuando el refresh token es inválido', async () => {
    const mockCommand = { refreshToken: 'invalid-token' };
    authMapper.toRefreshTokenCommand.mockReturnValue(mockCommand);
    authService.refreshAccessToken.mockRejectedValue(new Error('Token inválido'));

    await authController.refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'TOKEN_REFRESH_FAILED',
        message: 'Token inválido',
      },
    });
  });

  it('retorna error 400 cuando es un ValidationError', async () => {
    const mockCommand = { refreshToken: 'invalid-token' };
    authMapper.toRefreshTokenCommand.mockReturnValue(mockCommand);
    authService.refreshAccessToken.mockRejectedValue(
      new ValidationError('Token mal formado')
    );

    await authController.refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_DATA',
        message: 'Token mal formado',
      },
    });
  });
});

describe('auth-controller logout', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        refreshToken: 'refresh-token-123',
      },
      account: {
        id_account: 42,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('hace logout exitosamente (204)', async () => {
    const mockCommand = { refreshToken: 'refresh-token-123', accountId: 42 };
    authMapper.toLogoutCommand.mockReturnValue(mockCommand);
    authService.logout.mockResolvedValue();

    await authController.logout(req, res);

    expect(authMapper.toLogoutCommand).toHaveBeenCalledWith(
      { refresh_token: 'refresh-token-123' },
      42
    );
    expect(authService.logout).toHaveBeenCalledWith(mockCommand);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('maneja refreshToken con nombre alternativo "token"', async () => {
    req.body = { token: 'refresh-token-456' };
    const mockCommand = { refreshToken: 'refresh-token-456', accountId: 42 };
    authMapper.toLogoutCommand.mockReturnValue(mockCommand);
    authService.logout.mockResolvedValue();

    await authController.logout(req, res);

    expect(authMapper.toLogoutCommand).toHaveBeenCalledWith(
      { refresh_token: 'refresh-token-456' },
      42
    );
  });

  it('maneja accountId null cuando no está autenticado', async () => {
    req.account = null;
    const mockCommand = { refreshToken: 'refresh-token-123', accountId: null };
    authMapper.toLogoutCommand.mockReturnValue(mockCommand);
    authService.logout.mockResolvedValue();

    await authController.logout(req, res);

    expect(authMapper.toLogoutCommand).toHaveBeenCalledWith(
      { refresh_token: 'refresh-token-123' },
      null
    );
  });

  it('retorna error 400 cuando falta el refreshToken', async () => {
    req.body = {};

    await authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido',
      },
    });
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('retorna error 500 cuando el servicio falla', async () => {
    const mockCommand = { refreshToken: 'refresh-token-123', accountId: 42 };
    authMapper.toLogoutCommand.mockReturnValue(mockCommand);
    authService.logout.mockRejectedValue(new Error('Error de BD'));

    await authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Error de BD',
      },
    });
  });
});
