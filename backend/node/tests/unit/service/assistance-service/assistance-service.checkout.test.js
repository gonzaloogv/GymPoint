/**
 * Tests para assistance-service - checkOut y obtenerHistorialAsistencias
 */

const {
  mockAssistanceRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockErrors,
} = require('./test-setup');

const assistanceService = require('../../../../services/assistance-service');

describe('assistance-service checkOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra checkout exitosamente y calcula duración', async () => {
    const command = {
      assistanceId: 1,
      userProfileId: 1,
    };

    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '11:30:00',
      duration_minutes: null,
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 125,
    });

    const result = await assistanceService.checkOut(command);

    expect(result).toMatchObject({
      asistencia: expect.objectContaining({
        id_assistance: 1,
        check_out_time: '11:30:00',
      }),
      duration_minutes: 90,
      tokens_awarded: 5, // 15 - 10 base
      tokens_total: 125,
    });

    expect(mockAssistanceRepository.updateAssistance).toHaveBeenCalledWith(1, {
      check_out_time: expect.any(String),
    });
  });

  it('otorga bonus de 15 tokens por duración >= 60 min', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '11:05:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 115,
    });

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.duration_minutes).toBe(65);
    expect(result.tokens_awarded).toBe(5); // 15 - 10
  });

  it('otorga bonus de 12 tokens por duración >= 45 min', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '10:50:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 112,
    });

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.duration_minutes).toBe(50);
    expect(result.tokens_awarded).toBe(2); // 12 - 10
  });

  it('otorga bonus de 10 tokens por duración >= 30 min', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '10:35:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 110,
    });

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.duration_minutes).toBe(35);
    expect(result.tokens_awarded).toBe(0); // 10 - 10 = 0
  });

  it('no otorga tokens extras si duración < 30 min', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '10:20:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.duration_minutes).toBe(20);
    expect(result.tokens_awarded).toBe(0);
    expect(mockTokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si asistencia no existe', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue(null);

    await expect(
      assistanceService.checkOut({ assistanceId: 999, userProfileId: 1 })
    ).rejects.toThrow(mockErrors.NotFoundError);
  });

  it('lanza BusinessError si asistencia no pertenece al usuario', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 2,
      check_in_time: '10:00:00',
    });

    await expect(
      assistanceService.checkOut({ assistanceId: 1, userProfileId: 1 })
    ).rejects.toThrow(mockErrors.BusinessError);
  });

  it('lanza ConflictError si ya tiene checkout registrado', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: '11:00:00',
    });

    await expect(
      assistanceService.checkOut({ assistanceId: 1, userProfileId: 1 })
    ).rejects.toThrow(mockErrors.ConflictError);
  });

  it('lanza BusinessError si no hay check-in registrado', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: null,
    });

    await expect(
      assistanceService.checkOut({ assistanceId: 1, userProfileId: 1 })
    ).rejects.toThrow(mockErrors.BusinessError);
  });

  it('no registra tokens si ya existe movimiento de checkout', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '11:30:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(true);

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.tokens_awarded).toBe(0);
    expect(mockTokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('aplica multiplicador a tokens de duración', async () => {
    mockAssistanceRepository.findAssistanceById.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      check_in_time: '10:00:00',
      check_out_time: null,
    });

    mockAssistanceRepository.updateAssistance.mockResolvedValue({
      id_assistance: 1,
      check_in_time: '10:00:00',
      check_out_time: '11:30:00',
    });

    mockTokenLedgerService.existeMovimiento.mockResolvedValue(false);
    mockRewardService.getActiveMultiplier.mockResolvedValue(2);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 130,
    });

    const result = await assistanceService.checkOut({
      assistanceId: 1,
      userProfileId: 1,
    });

    expect(result.tokens_awarded).toBe(10); // (15 - 10) * 2
    expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: 1,
      delta: 10,
      reason: 'ATTENDANCE',
      refType: 'assistance_checkout',
      refId: 1,
    });
  });
});

describe('assistance-service obtenerHistorialAsistencias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('obtiene historial con paginación por defecto', async () => {
    const query = {
      userProfileId: 1,
    };

    mockAssistanceRepository.findAssistances.mockResolvedValue({
      data: [
        {
          id_assistance: 1,
          date: '2025-01-27',
          gym: { name: 'Gym A' },
        },
        {
          id_assistance: 2,
          date: '2025-01-26',
          gym: { name: 'Gym B' },
        },
      ],
    });

    const result = await assistanceService.obtenerHistorialAsistencias(query);

    expect(result).toHaveLength(2);
    expect(mockAssistanceRepository.findAssistances).toHaveBeenCalledWith(
      {
        userProfileId: 1,
        gymId: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 100,
      },
      { includeGym: true }
    );
  });

  it('aplica filtros de fecha y gimnasio', async () => {
    const query = {
      userProfileId: 1,
      gymId: 5,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      page: 2,
      limit: 20,
    };

    mockAssistanceRepository.findAssistances.mockResolvedValue({
      data: [],
    });

    await assistanceService.obtenerHistorialAsistencias(query);

    expect(mockAssistanceRepository.findAssistances).toHaveBeenCalledWith(
      {
        userProfileId: 1,
        gymId: 5,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        page: 2,
        limit: 20,
      },
      { includeGym: true }
    );
  });

  it('permite excluir detalles de gym', async () => {
    const query = {
      userProfileId: 1,
      includeGymDetails: false,
    };

    mockAssistanceRepository.findAssistances.mockResolvedValue({
      data: [],
    });

    await assistanceService.obtenerHistorialAsistencias(query);

    expect(mockAssistanceRepository.findAssistances).toHaveBeenCalledWith(
      expect.any(Object),
      { includeGym: false }
    );
  });
});
