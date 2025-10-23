const Joi = require('joi');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Media } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');
const entityTypes = ['USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS'];
const mediaTypes = ['IMAGE', 'VIDEO'];
const createSchema = Joi.object({
  entity_type: Joi.string().valid(...entityTypes).required(),
  entity_id: Joi.number().integer().positive().required(),
  media_type: Joi.string().valid(...mediaTypes).default('IMAGE'),
  url: Joi.string().uri().max(500).required(),
  thumbnail_url: Joi.string().uri().max(500).allow(null, ''),
  file_size: Joi.number().integer().min(0).allow(null),
  mime_type: Joi.string().max(100).allow(null, ''),
  width: Joi.number().integer().min(0).allow(null),
  height: Joi.number().integer().min(0).allow(null),
  is_primary: Joi.boolean().default(false),
  display_order: Joi.number().integer().min(0).default(0)
});
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
const crearMedia = async (payload) => {
  const data = validatePayload(createSchema, payload, 'Datos de media inválidos');
  return sequelize.transaction(async (transaction) => {
    if (data.is_primary) {
      await Media.update(
        { is_primary: false },
        {
          where: {
            entity_type: data.entity_type,
            entity_id: data.entity_id
          },
          transaction
        }
      );
    }
    const media = await Media.create(
      {
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        media_type: data.media_type,
        url: data.url,
        thumbnail_url: data.thumbnail_url || null,
        file_size: data.file_size ?? null,
        mime_type: data.mime_type || null,
        width: data.width ?? null,
        height: data.height ?? null,
        is_primary: data.is_primary,
        display_order: data.display_order
      },
      { transaction }
    );
    return media;
  });
};
const listarMediaPorEntidad = async (entity_type, entity_id) => {
  const data = validatePayload(
    Joi.object({
      entity_type: Joi.string().valid(...entityTypes).required(),
      entity_id: Joi.number().integer().positive().required()
    }),
    { entity_type, entity_id },
    'Parámetros inválidos'
  );
  return Media.findAll({
    where: {
      entity_type: data.entity_type,
      entity_id: data.entity_id
    },
    order: [
      ['is_primary', 'DESC'],
      ['display_order', 'ASC'],
      ['uploaded_at', 'DESC']
    ]
  });
};
const establecerPrincipal = async (id_media) => {
  const media = await Media.findByPk(id_media);
  if (!media) {
    throw new NotFoundError('Media');
  }
  await sequelize.transaction(async (transaction) => {
    await Media.update(
      { is_primary: false },
      {
        where: {
          entity_type: media.entity_type,
          entity_id: media.entity_id,
          id_media: { [Op.ne]: media.id_media }
        },
        transaction
      }
    );
    media.is_primary = true;
    await media.save({ transaction });
  });
  return media;
};
const eliminarMedia = async (id_media) => {
  const media = await Media.findByPk(id_media);
  if (!media) {
    throw new NotFoundError('Media');
  }
  await media.destroy();
  return true;
};
module.exports = {
  crearMedia,
  listarMediaPorEntidad,
  establecerPrincipal,
  eliminarMedia
};