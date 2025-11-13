export interface Amenity {
  id_amenity: number;
  name: string;
  category?: 'FACILITY' | 'SERVICE' | 'SAFETY' | 'EXTRA' | string;
  icon?: string | null;
}

/**
 * Fallback de iconos para amenidades conocidas (cuando la API no provee icono)
 */
export const COMMON_AMENITY_ICONS: Record<string, string> = {
  Vestuarios: '🧖',
  Duchas: '🚿',
  Casilleros: '🔐',
  WiFi: '📶',
  'Aire Acondicionado': '❄️',
  Estacionamiento: '🅿️',
  'Bar de Proteínas': '🥤',
  'Área Cardio': '❤️‍🔥',
  'Área de Pesas': '🏋️',
  'Clases Grupales': '🧑‍🤝‍🧑',
  'Entrenador Personal': '🧑‍🏫',
  Sauna: '🧘',
  Piscina: '🏊',
  'Zona de Stretching': '🤸',
  'Máquinas de Última Generación': '🤖',
  'Área Funcional': '🎯',
  'Ring de Boxeo': '🥊',
  'Tienda Deportiva': '🛍️',
};
