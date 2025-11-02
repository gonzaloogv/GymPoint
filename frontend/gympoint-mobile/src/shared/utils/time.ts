/**
 * Utilidades para formateo de tiempo
 */

/**
 * Convierte segundos a formato MM:SS
 * @param seconds - Número de segundos
 * @returns String en formato "MM:SS", ej: "03:45"
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convierte segundos a formato legible para duración
 * @param seconds - Número de segundos
 * @returns String, ej: "45 min" o "1h 23min"
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${mins} min`;
  }

  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
};

/**
 * Formatea un timestamp a fecha/hora legible
 * @param timestamp - Timestamp en ms
 * @returns String, ej: "14:30"
 */
export const formatTimeOnly = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

/**
 * Formatea un timestamp a fecha completa
 * @param timestamp - Timestamp en ms
 * @returns String, ej: "14 Nov, 2024"
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
