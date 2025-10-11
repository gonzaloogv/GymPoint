jest.mock('../models', () => ({
  Media: {
    update: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  }
}));
jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));
const sequelize = require('../config/database');
const mediaService = require('../services/media-service');
const { Media } = require('../models');
const { NotFoundError } = require('../utils/errors');
const createTransactionMock = () => ({});
beforeEach(() => {
  jest.clearAllMocks();
});
describe('media-service.crearMedia', () => {
  it('desmarca otros registros cuando se marca como principal', async () => {
    const tx = createTransactionMock();
    sequelize.transaction.mockImplementation(async (callback) => callback(tx));
    Media.create.mockResolvedValue({ id_media: 1 });
    const payload = {
      entity_type: 'GYM',
      entity_id: 3,
      url: 'https://example.com/image.jpg',
      is_primary: true
    };
    await mediaService.crearMedia(payload);
    expect(Media.update).toHaveBeenCalledWith(
      { is_primary: false },
      expect.objectContaining({
        where: { entity_type: 'GYM', entity_id: 3 },
        transaction: tx
      })
    );
    expect(Media.create).toHaveBeenCalledWith(expect.objectContaining({
      entity_type: 'GYM',
      entity_id: 3,
      url: 'https://example.com/image.jpg',
      is_primary: true
    }), { transaction: tx });
  });
});
describe('media-service.establecerPrincipal', () => {
  it('lanza error si media no existe', async () => {
    Media.findByPk.mockResolvedValue(null);
    await expect(mediaService.establecerPrincipal(10)).rejects.toBeInstanceOf(NotFoundError);
  });
  it('actualiza banderas correctamente', async () => {
    const tx = createTransactionMock();
    sequelize.transaction.mockImplementation(async (callback) => callback(tx));
    const save = jest.fn();
    Media.findByPk.mockResolvedValue({
      id_media: 5,
      entity_type: 'GYM',
      entity_id: 2,
      save
    });
    await mediaService.establecerPrincipal(5);
    expect(Media.update).toHaveBeenCalledWith(
      { is_primary: false },
      expect.objectContaining({
        where: expect.objectContaining({
          entity_type: 'GYM',
          entity_id: 2
        }),
        transaction: tx
      })
    );
    expect(save).toHaveBeenCalledWith({ transaction: tx });
  });
});