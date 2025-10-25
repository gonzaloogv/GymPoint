const toRad = (v: number) => (v * Math.PI) / 180;

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * Usa el radio WGS84 (6378.137 km) - mismo que Mapbox y GPS
 */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) {
  const R = 6378.137; // WGS84 - usado por Mapbox y GPS
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2),
    sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
