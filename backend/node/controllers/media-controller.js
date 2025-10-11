const mediaService = require('../services/media-service');
const listarMedia = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const id = Number(entity_id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID de entidad inválido' });
    }
    const media = await mediaService.listarMediaPorEntidad(entity_type.toUpperCase(), id);
    res.json(media);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const crearMedia = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.entity_type) {
      payload.entity_type = String(payload.entity_type).toUpperCase();
    }
    const media = await mediaService.crearMedia(payload);
    res.status(201).json(media);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const establecerPrincipal = async (req, res) => {
  try {
    const id = Number(req.params.id_media);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID de media inválido' });
    }
    const media = await mediaService.establecerPrincipal(id);
    res.json(media);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const eliminarMedia = async (req, res) => {
  try {
    const id = Number(req.params.id_media);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID de media inválido' });
    }
    await mediaService.eliminarMedia(id);
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
module.exports = {
  listarMedia,
  crearMedia,
  establecerPrincipal,
  eliminarMedia
};