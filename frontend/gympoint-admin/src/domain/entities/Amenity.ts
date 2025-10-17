/**
 * Entidad de Amenidad/Amenaza de Gimnasio
 */
export interface Amenity {
  name: string;
  icon?: string;
}

/**
 * Lista de amenidades comunes predefinidas
 */
export const COMMON_AMENITIES = [
  { name: 'Vestuarios', icon: '🚿' },
  { name: 'Duchas', icon: '🚿' },
  { name: 'Casilleros', icon: '🔒' },
  { name: 'WiFi', icon: '📶' },
  { name: 'Aire Acondicionado', icon: '❄️' },
  { name: 'Estacionamiento', icon: '🅿️' },
  { name: 'Bar de Proteínas', icon: '🥤' },
  { name: 'Área Cardio', icon: '🏃' },
  { name: 'Área de Pesas', icon: '🏋️' },
  { name: 'Clases Grupales', icon: '👥' },
  { name: 'Entrenador Personal', icon: '💪' },
  { name: 'Sauna', icon: '🧖' },
  { name: 'Piscina', icon: '🏊' },
  { name: 'Zona de Stretching', icon: '🧘' },
  { name: 'Máquinas de Última Generación', icon: '⚙️' },
  { name: 'Área Funcional', icon: '🤸' },
  { name: 'Ring de Boxeo', icon: '🥊' },
  { name: 'Tienda Deportiva', icon: '🛍️' },
] as const;


