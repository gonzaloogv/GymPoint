/**
 * Tests para presence.repository
 */

jest.mock('../../models', () => ({
  Presence: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  }
}));

const {
  findActivePresence,
  createPresence,
  updatePresence,
  listUserPresences,
  markAsConvertedToAssistance
} = require('../../infra/db/repositories/presence.repository');
const { Presence } = require('../../models');
const { Op } = require('sequelize');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('findActivePresence', () => {
  it('retorna presencia activa del usuario en un gimnasio', async () => {
    const mockPresence = {
      id_presence: 1,
      id_user_profile: 5,
      id_gym: 10,
      status: 'CONFIRMED',
      last_seen_at: new Date(),
      get: jest.fn().mockReturnValue({
        id_presence: 1,
        id_user_profile: 5,
        id_gym: 10,
        status: 'CONFIRMED'
      })
    };

    Presence.findOne.mockResolvedValue(mockPresence);

    const result = await findActivePresence(5, 10);

    expect(Presence.findOne).toHaveBeenCalledWith({
      where: {
        id_user_profile: 5,
        id_gym: 10,
        status: { [Op.in]: ['DETECTING', 'CONFIRMED'] }
      },
      order: [['last_seen_at', 'DESC']]
    });
    expect(result.status).toBe('CONFIRMED');
  });

  it('retorna null si no hay presencia activa', async () => {
    Presence.findOne.mockResolvedValue(null);

    const result = await findActivePresence(5, 10);

    expect(result).toBeNull();
  });
});

describe('createPresence', () => {
  it('crea un nuevo registro de presencia', async () => {
    const mockCreated = {
      id_presence: 2,
      id_user_profile: 5,
      id_gym: 10,
      status: 'DETECTING',
      detected_at: new Date(),
      last_seen_at: new Date(),
      get: jest.fn().mockReturnValue({
        id_presence: 2,
        id_user_profile: 5,
        id_gym: 10,
        status: 'DETECTING'
      })
    };

    Presence.create.mockResolvedValue(mockCreated);

    const result = await createPresence({
      id_user_profile: 5,
      id_gym: 10,
      status: 'DETECTING',
      detected_at: new Date(),
      last_seen_at: new Date()
    });

    expect(Presence.create).toHaveBeenCalled();
    expect(result.status).toBe('DETECTING');
  });
});

describe('updatePresence', () => {
  it('actualiza un registro de presencia', async () => {
    const mockPresence = {
      update: jest.fn().mockResolvedValue(),
      get: jest.fn().mockReturnValue({
        id_presence: 1,
        status: 'CONFIRMED',
        confirmed_at: new Date()
      })
    };

    Presence.findOne.mockResolvedValue(mockPresence);

    const result = await updatePresence(1, {
      status: 'CONFIRMED',
      confirmed_at: new Date()
    });

    expect(mockPresence.update).toHaveBeenCalledWith({
      status: 'CONFIRMED',
      confirmed_at: expect.any(Date)
    });
    expect(result.status).toBe('CONFIRMED');
  });

  it('lanza error si no encuentra la presencia', async () => {
    Presence.findOne.mockResolvedValue(null);

    await expect(updatePresence(999, { status: 'CONFIRMED' }))
      .rejects.toThrow('Presencia no encontrada');
  });
});

describe('listUserPresences', () => {
  it('lista presencias de un usuario con paginación', async () => {
    const mockPresences = [
      {
        get: jest.fn().mockReturnValue({
          id_presence: 1,
          id_user_profile: 5,
          id_gym: 10,
          status: 'EXITED'
        })
      },
      {
        get: jest.fn().mockReturnValue({
          id_presence: 2,
          id_user_profile: 5,
          id_gym: 11,
          status: 'CONFIRMED'
        })
      }
    ];

    Presence.findAll.mockResolvedValue(mockPresences);

    const result = await listUserPresences(5, { limit: 10, offset: 0 });

    expect(Presence.findAll).toHaveBeenCalledWith({
      where: { id_user_profile: 5 },
      limit: 10,
      offset: 0,
      order: [['detected_at', 'DESC']]
    });
    expect(result).toHaveLength(2);
  });
});

describe('markAsConvertedToAssistance', () => {
  it('marca presencia como convertida a asistencia', async () => {
    const mockPresence = {
      update: jest.fn().mockResolvedValue(),
      get: jest.fn().mockReturnValue({
        id_presence: 1,
        converted_to_assistance: true,
        id_assistance: 100,
        status: 'EXITED',
        exited_at: expect.any(Date)
      })
    };

    Presence.findOne.mockResolvedValue(mockPresence);

    const result = await markAsConvertedToAssistance(1, 100);

    expect(mockPresence.update).toHaveBeenCalledWith({
      converted_to_assistance: true,
      id_assistance: 100,
      status: 'EXITED',
      exited_at: expect.any(Date)
    });
    expect(result.converted_to_assistance).toBe(true);
    expect(result.id_assistance).toBe(100);
  });
});
