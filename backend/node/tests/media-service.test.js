/**
 * Media Service Tests - CQRS Pattern
 * Tests for Media service with repository-level mocking
 */

jest.mock('../infra/db/repositories', () => ({
  mediaRepository: {
    findById: jest.fn(),
    findByEntity: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    unsetPrimaryForEntity: jest.fn(),
    deleteById: jest.fn()
  }
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn(async (callback) => callback({}))
}));

jest.mock('../utils/errors', () => ({
  NotFoundError: class NotFoundError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(msg, details) {
      super(msg);
      this.name = 'ValidationError';
      this.details = details;
    }
  }
}));

const mediaService = require('../services/media-service');
const { mediaRepository } = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');

describe('Media Service - CQRS Pattern', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== QUERIES ====================

  describe('Queries', () => {

    describe('getMediaById', () => {
      it('debería obtener un media por ID', async () => {
        const mockMedia = {
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5,
          media_type: 'IMAGE',
          url: 'https://example.com/gym.jpg',
          is_primary: true
        };
        mediaRepository.findById.mockResolvedValue(mockMedia);

        const query = { idMedia: 1 };
        const result = await mediaService.getMediaById(query);

        expect(result).toEqual(mockMedia);
        expect(mediaRepository.findById).toHaveBeenCalledWith(1);
      });

      it('debería lanzar NotFoundError si no existe el media', async () => {
        mediaRepository.findById.mockResolvedValue(null);

        const query = { idMedia: 999 };
        await expect(mediaService.getMediaById(query)).rejects.toThrow(NotFoundError);
        expect(mediaRepository.findById).toHaveBeenCalledWith(999);
      });
    });

    describe('listMediaByEntity', () => {
      it('debería listar todos los media de una entidad', async () => {
        const mockMediaList = [
          {
            id_media: 1,
            entity_type: 'GYM',
            entity_id: 5,
            url: 'https://example.com/gym1.jpg',
            is_primary: true
          },
          {
            id_media: 2,
            entity_type: 'GYM',
            entity_id: 5,
            url: 'https://example.com/gym2.jpg',
            is_primary: false
          }
        ];
        mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

        const query = { entityType: 'GYM', entityId: 5 };
        const result = await mediaService.listMediaByEntity(query);

        expect(result).toEqual(mockMediaList);
        expect(mediaRepository.findByEntity).toHaveBeenCalledWith('GYM', 5, { mediaType: undefined });
      });

      it('debería filtrar por tipo de media', async () => {
        const mockMediaList = [
          {
            id_media: 1,
            entity_type: 'GYM',
            entity_id: 5,
            media_type: 'VIDEO',
            url: 'https://example.com/gym-tour.mp4'
          }
        ];
        mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

        const query = { entityType: 'GYM', entityId: 5, mediaType: 'VIDEO' };
        const result = await mediaService.listMediaByEntity(query);

        expect(result).toEqual(mockMediaList);
        expect(mediaRepository.findByEntity).toHaveBeenCalledWith('GYM', 5, { mediaType: 'VIDEO' });
      });

      it('debería retornar array vacío si no hay media', async () => {
        mediaRepository.findByEntity.mockResolvedValue([]);

        const query = { entityType: 'GYM', entityId: 999 };
        const result = await mediaService.listMediaByEntity(query);

        expect(result).toEqual([]);
        expect(mediaRepository.findByEntity).toHaveBeenCalledWith('GYM', 999, { mediaType: undefined });
      });
    });

  });

  // ==================== COMMANDS ====================

  describe('Commands', () => {

    describe('createMedia', () => {
      it('debería crear un nuevo media sin marcarlo como principal', async () => {
        const mockMedia = {
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5,
          media_type: 'IMAGE',
          url: 'https://example.com/gym.jpg',
          is_primary: false,
          display_order: 0
        };
        mediaRepository.create.mockResolvedValue(mockMedia);

        const command = {
          entityType: 'GYM',
          entityId: 5,
          mediaType: 'IMAGE',
          url: 'https://example.com/gym.jpg',
          isPrimary: false,
          displayOrder: 0
        };
        const result = await mediaService.createMedia(command);

        expect(result).toEqual(mockMedia);
        expect(mediaRepository.unsetPrimaryForEntity).not.toHaveBeenCalled();
        expect(mediaRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            entityType: 'GYM',
            entityId: 5,
            mediaType: 'IMAGE',
            url: 'https://example.com/gym.jpg',
            isPrimary: false,
            displayOrder: 0
          }),
          { transaction: {} }
        );
      });

      it('debería crear un media y marcarlo como principal', async () => {
        const mockMedia = {
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5,
          url: 'https://example.com/gym.jpg',
          is_primary: true
        };
        mediaRepository.unsetPrimaryForEntity.mockResolvedValue(true);
        mediaRepository.create.mockResolvedValue(mockMedia);

        const command = {
          entityType: 'GYM',
          entityId: 5,
          mediaType: 'IMAGE',
          url: 'https://example.com/gym.jpg',
          isPrimary: true,
          displayOrder: 0
        };
        const result = await mediaService.createMedia(command);

        expect(result).toEqual(mockMedia);
        expect(mediaRepository.unsetPrimaryForEntity).toHaveBeenCalledWith('GYM', 5, null, { transaction: {} });
        expect(mediaRepository.create).toHaveBeenCalled();
      });

      it('debería validar campos requeridos con Joi', async () => {
        const command = {
          entityType: 'GYM',
          entityId: 5
          // Falta url requerido
        };

        await expect(mediaService.createMedia(command)).rejects.toThrow();
      });

      it('debería crear media con metadata completa', async () => {
        const mockMedia = {
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5,
          url: 'https://example.com/gym.jpg',
          thumbnail_url: 'https://example.com/gym-thumb.jpg',
          file_size: 1024000,
          mime_type: 'image/jpeg',
          width: 1920,
          height: 1080,
          is_primary: false
        };
        mediaRepository.create.mockResolvedValue(mockMedia);

        const command = {
          entityType: 'GYM',
          entityId: 5,
          mediaType: 'IMAGE',
          url: 'https://example.com/gym.jpg',
          thumbnailUrl: 'https://example.com/gym-thumb.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          width: 1920,
          height: 1080,
          isPrimary: false,
          displayOrder: 0
        };
        const result = await mediaService.createMedia(command);

        expect(result).toEqual(mockMedia);
        expect(mediaRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            entityType: 'GYM',
            entityId: 5,
            mediaType: 'IMAGE',
            url: 'https://example.com/gym.jpg',
            thumbnailUrl: 'https://example.com/gym-thumb.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            width: 1920,
            height: 1080,
            isPrimary: false,
            displayOrder: 0
          }),
          { transaction: {} }
        );
      });
    });

    describe('setPrimaryMedia', () => {
      it('debería establecer un media como principal', async () => {
        const mockMedia = {
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5,
          url: 'https://example.com/gym.jpg',
          is_primary: true
        };
        mediaRepository.findById.mockResolvedValue({
          id_media: 1,
          entity_type: 'GYM',
          entity_id: 5
        });
        mediaRepository.unsetPrimaryForEntity.mockResolvedValue(true);
        mediaRepository.update.mockResolvedValue(mockMedia);

        const command = { idMedia: 1 };
        const result = await mediaService.setPrimaryMedia(command);

        expect(result).toEqual(mockMedia);
        expect(mediaRepository.findById).toHaveBeenCalledWith(1);
        expect(mediaRepository.unsetPrimaryForEntity).toHaveBeenCalledWith('GYM', 5, 1, { transaction: {} });
        expect(mediaRepository.update).toHaveBeenCalledWith(1, { isPrimary: true }, { transaction: {} });
      });

      it('debería lanzar NotFoundError si el media no existe', async () => {
        mediaRepository.findById.mockResolvedValue(null);

        const command = { idMedia: 999 };
        await expect(mediaService.setPrimaryMedia(command)).rejects.toThrow(NotFoundError);
        expect(mediaRepository.findById).toHaveBeenCalledWith(999);
        expect(mediaRepository.unsetPrimaryForEntity).not.toHaveBeenCalled();
        expect(mediaRepository.update).not.toHaveBeenCalled();
      });
    });

    describe('deleteMedia', () => {
      it('debería eliminar un media existente', async () => {
        mediaRepository.deleteById.mockResolvedValue(true);

        const command = { idMedia: 1 };
        await mediaService.deleteMedia(command);

        expect(mediaRepository.deleteById).toHaveBeenCalledWith(1, { transaction: {} });
      });

      it('debería lanzar NotFoundError si el media no existe', async () => {
        mediaRepository.deleteById.mockResolvedValue(false);

        const command = { idMedia: 999 };
        await expect(mediaService.deleteMedia(command)).rejects.toThrow(NotFoundError);
        expect(mediaRepository.deleteById).toHaveBeenCalledWith(999, { transaction: {} });
      });
    });

  });

  // ==================== LEGACY ALIASES ====================

  describe('Legacy Aliases', () => {

    it('crearMedia debería llamar a createMedia', async () => {
      const mockMedia = {
        id_media: 1,
        entity_type: 'GYM',
        entity_id: 5,
        url: 'https://example.com/gym.jpg'
      };
      mediaRepository.create.mockResolvedValue(mockMedia);

      const payload = {
        entity_type: 'GYM',
        entity_id: 5,
        url: 'https://example.com/gym.jpg',
        is_primary: false
      };
      const result = await mediaService.crearMedia(payload);

      expect(result).toEqual(mockMedia);
      expect(mediaRepository.create).toHaveBeenCalled();
    });

    it('listarMediaPorEntidad debería llamar a listMediaByEntity', async () => {
      const mockMediaList = [
        { id_media: 1, entity_type: 'GYM', entity_id: 5 }
      ];
      mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

      const result = await mediaService.listarMediaPorEntidad('GYM', 5);

      expect(result).toEqual(mockMediaList);
      expect(mediaRepository.findByEntity).toHaveBeenCalledWith('GYM', 5, { mediaType: undefined });
    });

    it('establecerPrincipal debería llamar a setPrimaryMedia', async () => {
      const mockMedia = { id_media: 1, is_primary: true };
      mediaRepository.findById.mockResolvedValue({
        id_media: 1,
        entity_type: 'GYM',
        entity_id: 5
      });
      mediaRepository.unsetPrimaryForEntity.mockResolvedValue(true);
      mediaRepository.update.mockResolvedValue(mockMedia);

      const result = await mediaService.establecerPrincipal(1);

      expect(result).toEqual(mockMedia);
      expect(mediaRepository.unsetPrimaryForEntity).toHaveBeenCalled();
      expect(mediaRepository.update).toHaveBeenCalled();
    });

    it('eliminarMedia debería llamar a deleteMedia', async () => {
      mediaRepository.deleteById.mockResolvedValue(true);

      await mediaService.eliminarMedia(1);

      expect(mediaRepository.deleteById).toHaveBeenCalledWith(1, { transaction: {} });
    });

  });

  // ==================== ENTITY TYPES ====================

  describe('Entity Type Support', () => {

    it('debería soportar entity_type GYM', async () => {
      const mockMediaList = [];
      mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

      const query = { entityType: 'GYM', entityId: 5 };
      await mediaService.listMediaByEntity(query);

      expect(mediaRepository.findByEntity).toHaveBeenCalledWith('GYM', 5, { mediaType: undefined });
    });

    it('debería soportar entity_type USER_PROFILE', async () => {
      const mockMediaList = [];
      mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

      const query = { entityType: 'USER_PROFILE', entityId: 10 };
      await mediaService.listMediaByEntity(query);

      expect(mediaRepository.findByEntity).toHaveBeenCalledWith('USER_PROFILE', 10, { mediaType: undefined });
    });

    it('debería soportar entity_type EXERCISE', async () => {
      const mockMediaList = [];
      mediaRepository.findByEntity.mockResolvedValue(mockMediaList);

      const query = { entityType: 'EXERCISE', entityId: 15 };
      await mediaService.listMediaByEntity(query);

      expect(mediaRepository.findByEntity).toHaveBeenCalledWith('EXERCISE', 15, { mediaType: undefined });
    });

  });

});
