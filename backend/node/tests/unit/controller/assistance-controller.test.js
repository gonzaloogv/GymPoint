jest.mock('../../../services/assistance-service');
jest.mock('../../../services/mappers/assistance.mappers');

const assistanceController = require('../../../controllers/assistance-controller');
const assistanceService = require('../../../services/assistance-service');
const assistanceMappers = require('../../../services/mappers/assistance.mappers');

describe('assistance-controller registrarAsistencia', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_gym: 5,
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 10,
      },
      user: {
        id_user_profile: 10,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('registra asistencia exitosamente (201)', async () => {
    const mockResult = {
      assistance: {
        id_assistance: 1,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
      },
      streak: { value: 5 },
      tokens_earned: 10,
    };
    const mockResponseDTO = {
      assistance: { id_assistance: 1 },
      streak: 5,
      tokens_earned: 10,
    };

    assistanceService.registrarAsistencia.mockResolvedValue(mockResult);
    assistanceMappers.toCheckInResponseDTO.mockReturnValue(mockResponseDTO);

    await assistanceController.registrarAsistencia(req, res);

    expect(assistanceService.registrarAsistencia).toHaveBeenCalled();
    expect(assistanceMappers.toCheckInResponseDTO).toHaveBeenCalledWith(mockResult);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Asistencia registrada con éxito',
      data: mockResponseDTO,
    });
  });

  it('retorna error 400 cuando faltan campos requeridos', async () => {
    req.body = { id_gym: 5 }; // Falta latitude y longitude

    await assistanceController.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_FIELDS',
        message: 'Faltan datos requeridos: id_gym, latitude, longitude',
      },
    });
    expect(assistanceService.registrarAsistencia).not.toHaveBeenCalled();
  });

  it('retorna error 400 cuando el usuario está fuera de rango', async () => {
    const error = new Error('Fuera del rango permitido');
    error.code = 'OUT_OF_RANGE';
    assistanceService.registrarAsistencia.mockRejectedValue(error);

    await assistanceController.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'OUT_OF_RANGE',
        message: 'Fuera del rango permitido',
      },
    });
  });

  it('retorna error 400 cuando el GPS es inaccurate', async () => {
    const error = new Error('GPS poco preciso');
    error.code = 'GPS_INACCURATE';
    assistanceService.registrarAsistencia.mockRejectedValue(error);

    await assistanceController.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'GPS_INACCURATE',
        message: 'GPS poco preciso',
      },
    });
  });

  it('retorna error 400 genérico para otros errores', async () => {
    const error = new Error('Error inesperado');
    assistanceService.registrarAsistencia.mockRejectedValue(error);

    await assistanceController.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'ASSISTANCE_REGISTRATION_FAILED',
        message: 'Error inesperado',
      },
    });
  });
});

describe('assistance-controller obtenerHistorialAsistencias', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        id_user_profile: 10,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('obtiene historial de asistencias exitosamente (200)', async () => {
    const mockHistorial = {
      items: [
        {
          id_assistance: 1,
          date: '2024-01-15',
          gym: { name: 'Gym Central' },
        },
        {
          id_assistance: 2,
          date: '2024-01-14',
          gym: { name: 'Gym North' },
        },
      ],
      total: 2,
    };
    const mockResponseDTO = {
      assistances: mockHistorial.items,
      total: 2,
    };

    assistanceService.obtenerHistorialAsistencias.mockResolvedValue(mockHistorial);
    assistanceMappers.toAssistanceHistoryDTO.mockReturnValue(mockResponseDTO);

    await assistanceController.obtenerHistorialAsistencias(req, res);

    expect(assistanceService.obtenerHistorialAsistencias).toHaveBeenCalled();
    expect(assistanceMappers.toAssistanceHistoryDTO).toHaveBeenCalledWith(mockHistorial);
    expect(res.json).toHaveBeenCalledWith(mockResponseDTO);
  });

  it('retorna error 400 cuando el servicio falla', async () => {
    const error = new Error('Error al obtener historial');
    assistanceService.obtenerHistorialAsistencias.mockRejectedValue(error);

    await assistanceController.obtenerHistorialAsistencias(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'GET_ASSISTANCE_HISTORY_FAILED',
        message: 'Error al obtener historial',
      },
    });
  });
});

describe('assistance-controller autoCheckIn', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id_gym: 5,
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 10,
      },
      user: {
        id_user_profile: 10,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('registra auto check-in exitosamente (201)', async () => {
    const mockResult = {
      assistance: {
        id_assistance: 1,
        auto_checkin: true,
      },
      streak: { value: 5 },
      tokens_earned: 15,
    };
    const mockResponseDTO = {
      assistance: { id_assistance: 1, auto_checkin: true },
      streak: 5,
      tokens_earned: 15,
    };

    assistanceService.autoCheckIn.mockResolvedValue(mockResult);
    assistanceMappers.toCheckInResponseDTO.mockReturnValue(mockResponseDTO);

    await assistanceController.autoCheckIn(req, res);

    expect(assistanceService.autoCheckIn).toHaveBeenCalled();
    expect(assistanceMappers.toCheckInResponseDTO).toHaveBeenCalledWith(mockResult);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Auto check-in registrado con éxito',
      data: mockResponseDTO,
    });
  });

  it('retorna error 400 cuando faltan campos requeridos', async () => {
    req.body = { id_gym: 5 }; // Falta latitude y longitude

    await assistanceController.autoCheckIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_FIELDS',
        message: 'Faltan datos requeridos: id_gym, latitude, longitude',
      },
    });
    expect(assistanceService.autoCheckIn).not.toHaveBeenCalled();
  });

  it('retorna error 400 cuando auto check-in está deshabilitado', async () => {
    const error = new Error('Auto check-in no está habilitado');
    error.code = 'AUTO_CHECKIN_DISABLED';
    assistanceService.autoCheckIn.mockRejectedValue(error);

    await assistanceController.autoCheckIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'AUTO_CHECKIN_DISABLED',
        message: 'Auto check-in no está habilitado',
      },
    });
  });

  it('retorna error 400 cuando está fuera del geofence', async () => {
    const error = new Error('Fuera del rango de geofence');
    error.code = 'OUT_OF_GEOFENCE_RANGE';
    assistanceService.autoCheckIn.mockRejectedValue(error);

    await assistanceController.autoCheckIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'OUT_OF_GEOFENCE_RANGE',
        message: 'Fuera del rango de geofence',
      },
    });
  });

  it('retorna error 400 genérico para otros errores', async () => {
    const error = new Error('Error inesperado');
    error.code = 'UNKNOWN_ERROR';
    assistanceService.autoCheckIn.mockRejectedValue(error);

    await assistanceController.autoCheckIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Error inesperado',
      },
    });
  });
});

describe('assistance-controller checkOut', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: '1',
      },
      user: {
        id_user_profile: 10,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('realiza check-out exitosamente (200)', async () => {
    const mockResult = {
      id_assistance: 1,
      check_out_time: '10:30:00',
      duration_minutes: 120,
    };
    const mockResponseDTO = {
      assistance: mockResult,
    };

    assistanceService.checkOut.mockResolvedValue(mockResult);
    assistanceMappers.toCheckOutResponseDTO.mockReturnValue(mockResponseDTO);

    await assistanceController.checkOut(req, res);

    expect(assistanceService.checkOut).toHaveBeenCalled();
    expect(assistanceMappers.toCheckOutResponseDTO).toHaveBeenCalledWith(mockResult);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Check-out completado',
      data: mockResponseDTO,
    });
  });

  it('retorna error 400 cuando el ID es inválido', async () => {
    req.params.id = 'invalid';

    await assistanceController.checkOut(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_ID',
        message: 'ID de asistencia inválido',
      },
    });
    expect(assistanceService.checkOut).not.toHaveBeenCalled();
  });

  it('retorna error 403 cuando el código de error es FORBIDDEN', async () => {
    const error = new Error('No autorizado');
    error.code = 'FORBIDDEN';
    assistanceService.checkOut.mockRejectedValue(error);

    await assistanceController.checkOut(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'FORBIDDEN',
        message: 'No autorizado',
      },
    });
  });

  it('retorna error 403 cuando se requiere check-in', async () => {
    const error = new Error('Se requiere check-in primero');
    error.code = 'CHECKIN_REQUIRED';
    assistanceService.checkOut.mockRejectedValue(error);

    await assistanceController.checkOut(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CHECKIN_REQUIRED',
        message: 'Se requiere check-in primero',
      },
    });
  });

  it('retorna error 400 genérico para otros errores', async () => {
    const error = new Error('Error inesperado');
    assistanceService.checkOut.mockRejectedValue(error);

    await assistanceController.checkOut(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Error inesperado',
      },
    });
  });
});
