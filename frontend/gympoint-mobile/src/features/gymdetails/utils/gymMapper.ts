import type { Gym as GymEntity } from '@features/gyms/domain/entities/Gym';
import type { Gym as GymDetail } from '../ui/types';

export function mapGymEntityToGymDetail(gymEntity: GymEntity): GymDetail {
  return {
    id: gymEntity.id,
    name: gymEntity.name,
    distance: (gymEntity.distancia || 0) / 1000, // Convertir metros a kilómetros
    services: gymEntity.equipment || [],
    hours: '06:00 - 22:00', // Valor por defecto, se puede obtener de otro endpoint
    rating: undefined, // No disponible en la entidad
    address: gymEntity.address || 'Dirección no disponible',
    coordinates: [gymEntity.lat, gymEntity.lng],
    price: gymEntity.monthPrice || undefined,
    equipment: gymEntity.equipment ? parseEquipment(gymEntity.equipment) : undefined,
  };
}

function parseEquipment(equipment: string[]) {
  return [
    {
      category: 'Equipamiento',
      icon: '🏋️',
      items: equipment.map(item => ({
        name: item,
        quantity: 1, // Valor por defecto
      })),
    },
  ];
}
