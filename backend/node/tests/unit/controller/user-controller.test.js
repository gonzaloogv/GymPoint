jest.mock('../../../services/user-service');
jest.mock('../../../services/mappers', () => ({
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
    toUserProfileResponse: jest.fn(),
    toEmailUpdateResponse: jest.fn(),
    toAccountDeletionResponse: jest.fn(),
  },
}));

const controller = require('../../../controllers/user-controller');
const userService = require('../../../services/user-service');
const { user: userMapper } = require('../../../services/mappers');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('user-controller obtenerPerfil', () => {
  it('retorna perfil del usuario autenticado (200)', async () => {
    const req = { user: { id: 10 } };
    const res = createRes();

    const mockQuery = { accountId: 10 };
    const mockProfile = {
      id_user_profile: 5,
      id_account: 10,
      name: 'Juan',
      email: 'juan@example.com',
    };
    const mockResponse = {
      id_user_profile: 5,
      email: 'juan@example.com',
      name: 'Juan',
    };

    userMapper.toGetUserByAccountIdQuery.mockReturnValue(mockQuery);
    userService.getUserByAccountId.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.obtenerPerfil(req, res);

    expect(userMapper.toGetUserByAccountIdQuery).toHaveBeenCalledWith(10);
    expect(userService.getUserByAccountId).toHaveBeenCalledWith(mockQuery);
    expect(userMapper.toUserProfileResponse).toHaveBeenCalledWith(mockProfile);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna 404 cuando el usuario no existe', async () => {
    const req = { user: { id: 999 } };
    const res = createRes();

    userMapper.toGetUserByAccountIdQuery.mockReturnValue({ accountId: 999 });
    userService.getUserByAccountId.mockRejectedValue(new Error('Usuario no encontrado'));

    await controller.obtenerPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  });
});

describe('user-controller actualizarPerfil', () => {
  it('retorna 403 si no hay id_user_profile en el token', async () => {
    const req = { user: {}, body: {} };
    const res = createRes();

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Solo usuarios pueden actualizar perfil',
      },
    });
    expect(userService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('actualiza el perfil correctamente (200)', async () => {
    const req = {
      user: { id_user_profile: 5 },
      body: { name: 'Juan Carlos', locality: 'Buenos Aires' },
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires',
    };
    const mockProfile = {
      id_user_profile: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires',
    };
    const mockResponse = {
      id_user_profile: 5,
      name: 'Juan Carlos',
      locality: 'Buenos Aires',
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

  it('retorna 400 cuando hay error de validación', async () => {
    const req = {
      user: { id_user_profile: 5 },
      body: { birth_date: 'invalid' },
    };
    const res = createRes();

    userMapper.toUpdateUserProfileCommand.mockReturnValue({});
    userService.updateUserProfile.mockRejectedValue(new Error('Fecha inválida'));

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'UPDATE_FAILED',
        message: 'Fecha inválida',
      },
    });
  });
});

describe('user-controller actualizarEmail', () => {
  it('retorna 400 si no se proporciona email', async () => {
    const req = { user: { id_account: 10 }, body: {} };
    const res = createRes();

    await controller.actualizarEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_EMAIL',
        message: 'Email es requerido',
      },
    });
  });

  it('actualiza el email correctamente (200)', async () => {
    const req = {
      user: { id_account: 10 },
      body: { email: 'nuevo@example.com' },
    };
    const res = createRes();

    const mockCommand = { accountId: 10, email: 'nuevo@example.com' };
    const mockResult = { email: 'nuevo@example.com', email_verified: false };
    const mockResponse = {
      email: 'nuevo@example.com',
      email_verified: false,
      message: 'Email actualizado',
    };

    userMapper.toUpdateEmailCommand.mockReturnValue(mockCommand);
    userService.updateEmail.mockResolvedValue(mockResult);
    userMapper.toEmailUpdateResponse.mockReturnValue(mockResponse);

    await controller.actualizarEmail(req, res);

    expect(userMapper.toUpdateEmailCommand).toHaveBeenCalledWith({
      email: 'nuevo@example.com',
      accountId: 10,
    });
    expect(userService.updateEmail).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna 400 cuando el email ya está en uso', async () => {
    const req = {
      user: { id_account: 10 },
      body: { email: 'usado@example.com' },
    };
    const res = createRes();

    userMapper.toUpdateEmailCommand.mockReturnValue({});
    userService.updateEmail.mockRejectedValue(new Error('El email ya está en uso'));

    await controller.actualizarEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'EMAIL_UPDATE_FAILED',
        message: 'El email ya está en uso',
      },
    });
  });
});

describe('user-controller solicitarEliminacionCuenta', () => {
  it('crea solicitud de eliminación con reason (200)', async () => {
    const req = {
      user: { id_account: 10 },
      body: { reason: 'Ya no uso la app' },
    };
    const res = createRes();

    const mockCommand = { accountId: 10, reason: 'Ya no uso la app' };
    const mockRequest = {
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
      metadata: { grace_period_days: 30 },
    };
    const mockResponse = {
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
    };

    userMapper.toRequestAccountDeletionCommand.mockReturnValue(mockCommand);
    userService.requestAccountDeletion.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.solicitarEliminacionCuenta(req, res);

    expect(userMapper.toRequestAccountDeletionCommand).toHaveBeenCalledWith(
      { reason: 'Ya no uso la app' },
      10
    );
    expect(userService.requestAccountDeletion).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Solicitud de eliminación registrada'),
        request: mockResponse,
      })
    );
  });

  it('usa reason desde query si no está en body', async () => {
    const req = {
      user: { id_account: 10 },
      query: { reason: 'Desde query' },
      body: {},
    };
    const res = createRes();

    const mockCommand = { accountId: 10, reason: 'Desde query' };
    const mockRequest = {
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
      metadata: { grace_period_days: 30 },
    };

    userMapper.toRequestAccountDeletionCommand.mockReturnValue(mockCommand);
    userService.requestAccountDeletion.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue({});

    await controller.solicitarEliminacionCuenta(req, res);

    expect(userMapper.toRequestAccountDeletionCommand).toHaveBeenCalledWith(
      { reason: 'Desde query' },
      10
    );
  });

  it('retorna 400 si no hay accountId', async () => {
    const req = {
      user: {},
      body: {},
    };
    const res = createRes();

    await controller.solicitarEliminacionCuenta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_ACCOUNT_ID',
        message: 'No se pudo determinar el ID de la cuenta',
      },
    });
  });

  it('retorna error del servicio con statusCode apropiado', async () => {
    const req = {
      user: { id_account: 10 },
      body: {},
    };
    const res = createRes();

    const error = new Error('Ya existe una solicitud pendiente');
    error.statusCode = 409;
    error.code = 'CONFLICT';

    userMapper.toRequestAccountDeletionCommand.mockReturnValue({});
    userService.requestAccountDeletion.mockRejectedValue(error);

    await controller.solicitarEliminacionCuenta(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Ya existe una solicitud pendiente',
      },
    });
  });
});

describe('user-controller obtenerEstadoEliminacion', () => {
  it('retorna estado de solicitud pendiente (200)', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    const mockQuery = { accountId: 10 };
    const mockRequest = {
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
    };
    const mockResponse = {
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
    };

    userMapper.toGetAccountDeletionStatusQuery.mockReturnValue(mockQuery);
    userService.getAccountDeletionStatus.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.obtenerEstadoEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      request: mockResponse,
      has_active_request: true,
    });
  });

  it('retorna null si no hay solicitud (200)', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    userMapper.toGetAccountDeletionStatusQuery.mockReturnValue({ accountId: 10 });
    userService.getAccountDeletionStatus.mockResolvedValue(null);

    await controller.obtenerEstadoEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      request: null,
      has_active_request: false,
    });
  });

  it('retorna error del servicio (500)', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    userMapper.toGetAccountDeletionStatusQuery.mockReturnValue({});
    userService.getAccountDeletionStatus.mockRejectedValue(new Error('Database error'));

    await controller.obtenerEstadoEliminacion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('user-controller cancelarSolicitudEliminacion', () => {
  it('cancela la solicitud correctamente (200)', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    const mockCommand = { accountId: 10 };
    const mockRequest = {
      id_account: 10,
      status: 'CANCELLED',
      cancelled_at: '2025-11-02T12:00:00.000Z',
    };
    const mockResponse = {
      status: 'CANCELLED',
      cancelled_at: '2025-11-02T12:00:00.000Z',
    };

    userMapper.toCancelAccountDeletionCommand.mockReturnValue(mockCommand);
    userService.cancelAccountDeletion.mockResolvedValue(mockRequest);
    userMapper.toAccountDeletionResponse.mockReturnValue(mockResponse);

    await controller.cancelarSolicitudEliminacion(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Solicitud de eliminación cancelada correctamente',
      request: mockResponse,
    });
  });

  it('retorna error si no hay solicitud para cancelar (404)', async () => {
    const req = { user: { id_account: 10 } };
    const res = createRes();

    const error = new Error('Solicitud de eliminación no encontrada');
    error.statusCode = 404;

    userMapper.toCancelAccountDeletionCommand.mockReturnValue({});
    userService.cancelAccountDeletion.mockRejectedValue(error);

    await controller.cancelarSolicitudEliminacion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('user-controller obtenerUsuarioPorId (Admin)', () => {
  it('obtiene perfil de otro usuario por ID (200)', async () => {
    const req = { params: { id: '42' } };
    const res = createRes();

    const mockQuery = { userProfileId: 42 };
    const mockProfile = {
      id_user_profile: 42,
      name: 'Usuario',
      email: 'usuario@example.com',
    };
    const mockResponse = {
      id_user_profile: 42,
      name: 'Usuario',
    };

    userMapper.toGetUserProfileByIdQuery.mockReturnValue(mockQuery);
    userService.getUserProfileById.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.obtenerUsuarioPorId(req, res);

    expect(userMapper.toGetUserProfileByIdQuery).toHaveBeenCalledWith({ userProfileId: 42 });
    expect(userService.getUserProfileById).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna 404 cuando el usuario no existe', async () => {
    const req = { params: { id: '999' } };
    const res = createRes();

    userMapper.toGetUserProfileByIdQuery.mockReturnValue({ userProfileId: 999 });
    userService.getUserProfileById.mockRejectedValue(new Error('Usuario no encontrado'));

    await controller.obtenerUsuarioPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  });
});

describe('user-controller actualizarTokens (Admin)', () => {
  it('retorna 400 si no se proporciona delta', async () => {
    const req = { params: { id: '5' }, body: {} };
    const res = createRes();

    await controller.actualizarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_DELTA',
        message: 'Delta es requerido',
      },
    });
  });

  it('actualiza tokens del usuario correctamente (200)', async () => {
    const req = {
      params: { id: '5' },
      body: { delta: 100, reason: 'Bonus' },
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      delta: 100,
      reason: 'Bonus',
    };

    userMapper.toUpdateUserTokensCommand.mockReturnValue(mockCommand);
    userService.updateUserTokens.mockResolvedValue(250);

    await controller.actualizarTokens(req, res);

    expect(userMapper.toUpdateUserTokensCommand).toHaveBeenCalledWith({
      userProfileId: 5,
      delta: 100,
      reason: 'Bonus',
    });
    expect(userService.updateUserTokens).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith({
      id_user_profile: 5,
      new_balance: 250,
      delta: 100,
    });
  });

  it('retorna 400 cuando hay error en el servicio', async () => {
    const req = {
      params: { id: '5' },
      body: { delta: -1000 },
    };
    const res = createRes();

    userMapper.toUpdateUserTokensCommand.mockReturnValue({});
    userService.updateUserTokens.mockRejectedValue(new Error('Balance insuficiente'));

    await controller.actualizarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'TOKEN_UPDATE_FAILED',
        message: 'Balance insuficiente',
      },
    });
  });
});

describe('user-controller actualizarSuscripcion (Admin)', () => {
  it('retorna 400 si no se proporciona subscription', async () => {
    const req = { params: { id: '5' }, body: {} };
    const res = createRes();

    await controller.actualizarSuscripcion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_SUBSCRIPTION',
        message: 'Subscription es requerido',
      },
    });
  });

  it('actualiza la suscripción del usuario a PREMIUM (200)', async () => {
    const req = {
      params: { id: '5' },
      body: { subscription: 'PREMIUM' },
    };
    const res = createRes();

    const mockCommand = {
      userProfileId: 5,
      subscription: 'PREMIUM',
    };
    const mockProfile = {
      id_user_profile: 5,
      subscription: 'PREMIUM',
      premium_since: '2025-11-02T00:00:00.000Z',
    };
    const mockResponse = {
      id_user_profile: 5,
      subscription: 'PREMIUM',
    };

    userMapper.toUpdateUserSubscriptionCommand.mockReturnValue(mockCommand);
    userService.updateUserSubscription.mockResolvedValue(mockProfile);
    userMapper.toUserProfileResponse.mockReturnValue(mockResponse);

    await controller.actualizarSuscripcion(req, res);

    expect(userMapper.toUpdateUserSubscriptionCommand).toHaveBeenCalledWith({
      userProfileId: 5,
      subscription: 'PREMIUM',
    });
    expect(userService.updateUserSubscription).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('retorna 400 cuando la suscripción es inválida', async () => {
    const req = {
      params: { id: '5' },
      body: { subscription: 'INVALID' },
    };
    const res = createRes();

    userMapper.toUpdateUserSubscriptionCommand.mockReturnValue({});
    userService.updateUserSubscription.mockRejectedValue(new Error('Suscripción inválida'));

    await controller.actualizarSuscripcion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'SUBSCRIPTION_UPDATE_FAILED',
        message: 'Suscripción inválida',
      },
    });
  });
});
