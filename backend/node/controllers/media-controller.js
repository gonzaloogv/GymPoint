/**
 * Media Controller - Refactorizado con Mappers (Lote 8)
 * Gestiona endpoints de archivos multimedia
 */

const mediaService = require('../services/media-service');
const mediaMappers = require('../services/mappers/media.mappers');
const { NotFoundError } = require('../utils/errors');

const listarMedia = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const id = Number(entity_id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { code: 'INVALID_ENTITY_ID', message: 'ID de entidad inválido' } });
    }
    const query = mediaMappers.toListMediaByEntityQuery({
      entityType: entity_type.toUpperCase(),
      entityId: id
    });
    const mediaList = await mediaService.listMediaByEntity(query);
    res.json({
      data: mediaMappers.toMediaListResponse(mediaList)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: { code: 'MEDIA_NOT_FOUND', message: err.message } });
    }
    res.status(err.statusCode || 500).json({ error: { code: 'GET_MEDIA_FAILED', message: err.message } });
  }
};

const crearMedia = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.entity_type) {
      payload.entity_type = String(payload.entity_type).toUpperCase();
    }
    const command = mediaMappers.toCreateMediaCommand(payload);
    const media = await mediaService.createMedia(command);
    res.status(201).json({
      message: 'Media creado con éxito',
      data: mediaMappers.toMediaResponse(media)
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: { code: 'CREATE_MEDIA_FAILED', message: err.message } });
  }
};

const establecerPrincipal = async (req, res) => {
  try {
    const id = Number(req.params.id_media);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { code: 'INVALID_MEDIA_ID', message: 'ID de media inválido' } });
    }
    const command = mediaMappers.toSetPrimaryMediaCommand(id);
    const media = await mediaService.setPrimaryMedia(command);
    res.json({
      message: 'Media establecido como principal',
      data: mediaMappers.toMediaResponse(media)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: { code: 'MEDIA_NOT_FOUND', message: err.message } });
    }
    res.status(err.statusCode || 500).json({ error: { code: 'SET_PRIMARY_FAILED', message: err.message } });
  }
};

const eliminarMedia = async (req, res) => {
  try {
    const id = Number(req.params.id_media);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: { code: 'INVALID_MEDIA_ID', message: 'ID de media inválido' } });
    }
    const command = mediaMappers.toDeleteMediaCommand(id);
    await mediaService.deleteMedia(command);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: { code: 'MEDIA_NOT_FOUND', message: err.message } });
    }
    res.status(err.statusCode || 500).json({ error: { code: 'DELETE_MEDIA_FAILED', message: err.message } });
  }
};

module.exports = {
  listarMedia,
  crearMedia,
  establecerPrincipal,
  eliminarMedia
};
