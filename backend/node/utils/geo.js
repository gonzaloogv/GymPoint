/**
 * Utilidades de Geolocalización
 * @module utils/geo
 */

/**
 * Calcular distancia entre dos coordenadas usando fórmula Haversine
 * 
 * @param {number} lat1 - Latitud punto 1 (grados decimales)
 * @param {number} lon1 - Longitud punto 1 (grados decimales)
 * @param {number} lat2 - Latitud punto 2 (grados decimales)
 * @param {number} lon2 - Longitud punto 2 (grados decimales)
 * @returns {number} Distancia en metros
 * 
 * @example
 * const distancia = calculateDistance(-34.603722, -58.38159, -34.604, -58.382);
 * console.log(distancia); // ~150 metros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6378137; // Radio de la Tierra en metros (WGS84 - usado por Mapbox y GPS)
  const rad = Math.PI / 180;
  
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distancia en metros
}

/**
 * Validar que las coordenadas GPS sean válidas
 * 
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {boolean} true si son válidas
 */
function isValidCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  return (
    !isNaN(lat) && 
    !isNaN(lon) &&
    lat >= -90 && 
    lat <= 90 &&
    lon >= -180 && 
    lon <= 180
  );
}

/**
 * Validar precisión GPS
 * 
 * @param {number} accuracy - Precisión en metros
 * @param {number} maxAccuracy - Precisión máxima aceptable
 * @returns {boolean} true si es aceptable
 */
function isAcceptableAccuracy(accuracy, maxAccuracy) {
  if (accuracy == null) return true; // Si no se envía, aceptar
  const acc = parseFloat(accuracy);
  return !isNaN(acc) && acc >= 0 && acc <= maxAccuracy;
}

module.exports = {
  calculateDistance,
  isValidCoordinates,
  isAcceptableAccuracy
};

