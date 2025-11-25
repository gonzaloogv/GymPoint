/**
 * Tests para user-controller refactorizado con mappers
 */

jest.mock('../services/user-service');
jest.mock('../services/mappers', () => ({
  user: {
    toGetUserByAccountIdQuery: jest.fn(),
    toUpdateUserProfileCommand: jest.fn(),
    toUpdateEmailCommand: jest.fn(),
    toRequestAccountDeletionCommand: jest.fn(),
    toGetAccountDeletionStatusQuery: jest.fn(),
    toCancelAccountDeletionCommand: jest.fn(),
    toGetUserProfileByIdQuery: jest.fn(),
    toUpdateUserTokensCommand: jest.fn(),
    toUpdateUserSubscriptionCommand: jest.fn(),
    toUpdateNotificationSettingsCommand: jest.fn(),
    toGetNotificationSettingsQuery: jest.fn(),
    toUserProfileResponse: jest.fn(),
    toEmailUpdateResponse: jest.fn(),
    toAccountDeletionResponse: jest.fn(),
    toNotificationSettingsResponse: jest.fn()
  }
}));

const controller = require('../controllers/user-controller');
const userService = require('../services/user-service');
const { user: userMapper } = require('../services/mappers');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('obtenerPerfil (GET /api/users/me)', () => {
  it('obtiene y mapea el perfil del usuario autenticado', async () => {
    const req = { user: { id: 10 } };
    const res = createRes();

    const mockQuery = { accountId: 10 };
    const mockProfile = {
      id_user_profile: 5,
      id_account: 10,
      name: 'Juan',
      email: 'juan@example.com'
    };
    const mockResponse = {
      id_user_profile: 5,
      email: 'juan@example.com',
      name: 'Juan'
    };

    userMapper.toGetUserByAccountIdQuery.mockReturnValue(mockQuery);
    userService.getUserByAccountId.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.obtenerPerfil(req, res);

    expect(userMapper.toGetUserByAccountIdQuery).toHaveBeenCalledWith({ accountId: 10 });
    expect(userService.getUserByAccountId).toHaveBeenCalledWith(mockQuery);
    expect(userMapper.toUserProfileResponse).toHaveBeenCalledWith(mockProfile);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('maneja errores devolviendo 404', async () => {
    const req = { user: { id: 999 } };
    const res = createRes();

    userMapper.toGetUserByAccountIdQuery.mockReturnValue({ accountId: 999 });
    userService.getUserByAccountId.mockRejectedValue(new Error('Usuario no encontrado'));

    await controller.obtenerPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      }
    });
  });
});

describe('actualizarPerfil (PUT /api/users/me)', () => {
  it('requiere id_user_profile en el token', async () => {
    const req = { user: {}, body: {} };
    const res = createRes();

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Solo usuarios pueden actualizar perfil'
      }
    });
    expect(userService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('actualiza el perfil usando command y mapper', async () => {
    const req = {
      user: { id_user_profile: 5 },
      body: { name: 'Juan Carlos', locality: 'Buenos Aires' }
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires'
    };
    const mockProfile = {
      id_user_profile: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires'
    };
    const mockResponse = {
      id_user_profile: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires'
    };

    userMapper.toUpdateUserProfileCommand.mockReturnValue(mockCommand);
    userService.updateUserProfile.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.actualizarPerfil(req, res);

    expect(userMapper.toUpdateUserProfileCommand).toHaveBeenCalledWith(req.body, 5);
    expect(userService.updateUserProfile).toHaveBeenCalledWith(mockCommand);
    expect(userMapper.toUserProfileResponse).toHaveBeenCalledWith(mockProfile);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('maneja errores devolviendo 400', async () => {
    const req = {
      user: { id_user_profile: 5 },
      body: { birth_date: 'invalid' }
    };
    const res = createRes();

    userMapper.toUpdateUserProfileCommand.mockReturnValue({});
    userService.updateUserProfile.mockRejectedValue(new Error('Fecha inválida'));

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'UPDATE_FAILED',
        message: 'Fecha inválida'
      }
    });
  });
});

describe('actualizarEmail (PUT /api/users/me/email)', () => {
  it('requiere email en el body', async () => {
    const req = { user: { id_account: 10 }, body: {} };
    const res = createRes();

    await controller.actualizarEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_EMAIL',
        message: 'Email es requerido'
      }
    });
  });

  it('actualiza el email usando command y mapper', async () => {
    const req = {
      user: { id_account: 10 },
      body: { email: 'nuevo@example.com' }
    };
    const res = createRes();

    const mockCommand = { accountId: 10, email: 'nuevo@example.com' };
    const mockResult = { email: 'nuevo@example.com', email_verified: false };
    const mockResponse = {
      email: 'nuevo@example.com',
      email_verified: false,
      message: 'Email actualizado'
    };

    userMapper.toUpdateEmailCommand.mockReturnValue(mockCommand);
    userService.updateEmail.mockResolvedValue(mockResult);
    userMapper.toEmailUpdateResponse.mockReturnValue(mockResponse);

    await controller.actualizarEmail(req, res);

    expect(userMapper.toUpdateEmailCommand).toHaveBeenCalledWith({
      email: 'nuevo@example.com',
      accountId: 10
    });
    expect(userService.updateEmail).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });
});

describe('solicitarEliminacionCuenta (DELETE /api/users/me)', () => {
  it('crea solicitud de eliminación con reason opcional', async () => {
    const req = {
      user: { id_account: 10 },
      body: { reason: 'Ya no uso la app' }
    };
    const res = createRes();

    const mockCommand = { accountId: 10, reason: 'Ya no uso la app' };
    const mockRequest = {
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: new Date(),
      metadata: { grace_period_days: 30 }
    };
    const mockResponse = {
      status: 'PENDING',
      scheduled_deletion_date: mockRequest.scheduled_deletion_date
    };

    userMapper.toRequestAccountDeletionCommand.mockReturnValue(mockCommand);
    userService.requestAccountDeletion.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.solicitarEliminacionCuenta(req, res);

    expect(userMapper.toRequestAccountDeletionCommand).toHaveBeenCalledWith({
      accountId: 10,
      reason: 'Ya no uso la app'
    });
    expect(userService.requestAccountDeletion).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        request: mockResponse
      })
    );
  });

  it('usa reason desde query si no está en body', async () => {
    const req = {
      user: { id_account: 10 },
      query: { reason: 'Desde query' },
      body: {}
    };
    const res = createRes();

    userMapper.toRequestAccountDeletionCommand.mockReturnValue({});
    userService.requestAccountDeletion.mockResolvedValue({
      status: 'PENDING',
      scheduled_deletion_date: new Date()
    });
    userMapper.toAccountDeletionResponse.mockReturnValue({});

    await controller.solicitarEliminacionCuenta(req, res);

    expect(userMapper.toRequestAccountDeletionCommand).toHaveBeenCalledWith({
      accountId: 10,
      reason: 'Desde query'
    });
  });
});

describe('obtenerEstadoEliminacion (GET /api/users/me/deletion-request)', () => {
  it('retorna el estado de la solicitud si existe', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    const mockQuery = { accountId: 10 };
    const mockRequest = {
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: new Date()
    };
    const mockResponse = {
      status: 'PENDING',
      scheduled_deletion_date: mockRequest.scheduled_deletion_date
    };

    userMapper.toGetAccountDeletionStatusQuery.mockReturnValue(mockQuery);
    userService.getAccountDeletionStatus.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.obtenerEstadoEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      request: mockResponse,
      has_active_request: true
    });
  });

  it('retorna null si no hay solicitud', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    userMapper.toGetAccountDeletionStatusQuery.mockReturnValue({ accountId: 10 });
    userService.getAccountDeletionStatus.mockResolvedValue(null);

    await controller.obtenerEstadoEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      request: null,
      has_active_request: false
    });
  });
});

describe('cancelarSolicitudEliminacion (DELETE /api/users/me/deletion-request)', () => {
  it('cancela la solicitud de eliminación', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    const mockCommand = { accountId: 10 };
    const mockRequest = {
      id_account: 10,
      status: 'CANCELLED',
      cancelled_at: new Date()
    };
    const mockResponse = {
      status: 'CANCELLED',
      cancelled_at: mockRequest.cancelled_at
    };

    userMapper.toCancelAccountDeletionCommand.mockReturnValue(mockCommand);
    userService.cancelAccountDeletion.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.cancelarSolicitudEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Solicitud de eliminación cancelada correctamente',
      request: mockResponse
    });
  });
});

describe('obtenerUsuarioPorId (GET /api/users/:id) - Admin', () => {
  it('obtiene perfil de otro usuario por ID', async () => {
    const req = { params: { id: '42' } };
    const res = createRes();

    const mockQuery = { userProfileId: 42 };
    const mockProfile = {
      id_user_profile: 42,
      name: 'Usuario',
      email: 'usuario@example.com'
    };
    const mockResponse = {
      id_user_profile: 42,
      name: 'Usuario'
    };

    userMapper.toGetUserProfileByIdQuery.mockReturnValue(mockQuery);
    userService.getUserProfileById.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.obtenerUsuarioPorId(req, res);

    expect(userMapper.toGetUserProfileByIdQuery).toHaveBeenCalledWith({ userProfileId: 42 });
    expect(userService.getUserProfileById).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });
});

describe('actualizarTokens (POST /api/users/:id/tokens) - Admin', () => {
  it('requiere delta en el body', async () => {
    const req = { params: { id: '5' }, body: {} };
    const res = createRes();

    await controller.actualizarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_DELTA',
        message: 'Delta es requerido'
      }
    });
  });

  it('actualiza tokens del usuario', async () => {
    const req = {
      params: { id: '5' },
      body: { delta: 100, reason: 'Bonus' }
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      delta: 100,
      reason: 'Bonus'
    };

    userMapper.toUpdateUserTokensCommand.mockReturnValue(mockCommand);
    userService.updateUserTokens.mockResolvedValue(250);

    await controller.actualizarTokens(req, res);

    expect(userMapper.toUpdateUserTokensCommand).toHaveBeenCalledWith({
      userProfileId: 5,
      delta: 100,
      reason: 'Bonus'
    });
    expect(userService.updateUserTokens).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith({
      id_user_profile: 5,
      new_balance: 250,
      delta: 100
    });
  });
});

describe('actualizarSuscripcion (PUT /api/users/:id/subscription) - Admin', () => {
  it('requiere subscription en el body', async () => {
    const req = { params: { id: '5' }, body: {} };
    const res = createRes();

    await controller.actualizarSuscripcion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_SUBSCRIPTION',
        message: 'Subscription es requerido'
      }
    });
  });

  it('actualiza la suscripción del usuario', async () => {
    const req = {
      params: { id: '5' },
      body: { subscription: 'PREMIUM' }
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      subscription: 'PREMIUM'
    };
    const mockProfile = {
      id_user_profile: 5,
      subscription: 'PREMIUM',
      premium_since: new Date()
    };
    const mockResponse = {
      id_user_profile: 5,
      subscription: 'PREMIUM'
    };

    userMapper.toUpdateUserSubscriptionCommand.mockReturnValue(mockCommand);
    userService.updateUserSubscription.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.actualizarSuscripcion(req, res);

    expect(userMapper.toUpdateUserSubscriptionCommand).toHaveBeenCalledWith({
      userProfileId: 5,
      subscription: 'PREMIUM'
    });
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });
});
