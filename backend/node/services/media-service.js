/**
 * Media Service - Refactorizado con CQRS pattern
 * Gestión de archivos multimedia (imágenes y videos)
 */

const { mediaRepository } = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');
const sequelize = require('../config/database');
const Joi = require('joi');

// Constantes
const ENTITY_TYPES = ['USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS'];
const MEDIA_TYPES = ['IMAGE', 'VIDEO'];

// Schemas de validación
const createSchema = Joi.object({
  entityType: Joi.string().valid(...ENTITY_TYPES).required(),
  entityId: Joi.number().integer().positive().required(),
  mediaType: Joi.string().valid(...MEDIA_TYPES).default('IMAGE'),
  url: Joi.string().uri().max(500).required(),
  thumbnailUrl: Joi.string().uri().max(500).allow(null, ''),
  fileSize: Joi.number().integer().min(0).allow(null),
  mimeType: Joi.string().max(100).allow(null, ''),
  width: Joi.number().integer().min(0).allow(null),
  height: Joi.number().integer().min(0).allow(null),
  isPrimary: Joi.boolean().default(false),
  displayOrder: Joi.number().integer().min(0).default(0)
});

const ensureCommand = (input) => input;
const ensureQuery = (input) => input;

const validatePayload = (schema, payload, message) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    throw new ValidationError(
      message,
      error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    );
  }
  return value;
};

const getMediaById = async (query) => {
  const q = typeof query === 'object' && query.idMedia ? query : { idMedia: query };
  const media = await mediaRepository.findById(q.idMedia);
  if (!media) throw new NotFoundError('Media');
  return media;
};

const listMediaByEntity = async (query) => {
  const q = ensureQuery(query);
  if (!q.entityType) throw new ValidationError('entityType es requerido');
  if (!q.entityId) throw new ValidationError('entityId es requerido');
  return mediaRepository.findByEntity(q.entityType, q.entityId, { mediaType: q.mediaType });
};

const createMedia = async (command) => {
  const cmd = ensureCommand(command);
  const validatedData = validatePayload(createSchema, cmd, 'Datos de media inválidos');
  return sequelize.transaction(async (transaction) => {
    if (validatedData.isPrimary) {
      await mediaRepository.unsetPrimaryForEntity(validatedData.entityType, validatedData.entityId, null, { transaction });
    }
    return mediaRepository.create(validatedData, { transaction });
  });
};

const setPrimaryMedia = async (command) => {
  const cmd = typeof command === 'object' && command.idMedia ? command : { idMedia: command };
  return sequelize.transaction(async (transaction) => {
    const media = await mediaRepository.findById(cmd.idMedia);
    if (!media) throw new NotFoundError('Media');
    await mediaRepository.unsetPrimaryForEntity(media.entity_type, media.entity_id, media.id_media, { transaction });
    return mediaRepository.update(media.id_media, { isPrimary: true }, { transaction });
  });
};

const deleteMedia = async (command) => {
  const cmd = typeof command === 'object' && command.idMedia ? command : { idMedia: command };
  return sequelize.transaction(async (transaction) => {
    const deleted = await mediaRepository.deleteById(cmd.idMedia, { transaction });
    if (!deleted) throw new NotFoundError('Media');
    return true;
  });
};

const crearMedia = async (payload) => createMedia({
  entityType: payload.entity_type || payload.entityType,
  entityId: payload.entity_id || payload.entityId,
  mediaType: payload.media_type || payload.mediaType || 'IMAGE',
  url: payload.url,
  thumbnailUrl: payload.thumbnail_url || payload.thumbnailUrl,
  fileSize: payload.file_size || payload.fileSize,
  mimeType: payload.mime_type || payload.mimeType,
  width: payload.width,
  height: payload.height,
  isPrimary: payload.is_primary !== undefined ? payload.is_primary : payload.isPrimary,
  displayOrder: payload.display_order !== undefined ? payload.display_order : payload.displayOrder
});

const listarMediaPorEntidad = async (entityType, entityId) => listMediaByEntity({ entityType, entityId });
const establecerPrincipal = async (idMedia) => setPrimaryMedia(idMedia);
const eliminarMedia = async (idMedia) => deleteMedia(idMedia);

module.exports = {
  getMediaById,
  listMediaByEntity,
  createMedia,
  setPrimaryMedia,
  deleteMedia,
  crearMedia,
  listarMediaPorEntidad,
  establecerPrincipal,
  eliminarMedia,
  ENTITY_TYPES,
  MEDIA_TYPES
};
