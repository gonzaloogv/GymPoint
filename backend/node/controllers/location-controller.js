const gymService = require('../services/gym-service');

/**
 * Actualiza ubicación actual y retorna gimnasios cercanos
 * @route POST /api/location/update
 * @access Private (Usuario app)
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, radiusKm } = req.body || {};
    if (latitude == null || longitude == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: latitude, longitude'
        }
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = radiusKm ? parseFloat(radiusKm) : undefined;

    const nearby = await gymService.buscarGimnasiosCercanos(lat, lng, radius);
    return res.json({
      nearby_gyms: nearby,
      meta: { lat, lng, accuracy: accuracy ?? null, radius_km: radius ?? undefined }
    });
  } catch (err) {
    return res.status(400).json({ error: { code: 'LOCATION_UPDATE_FAILED', message: err.message } });
  }
};

module.exports = { updateLocation };

