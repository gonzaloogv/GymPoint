import { Gym } from '@/domain';
import { Card, Button, Badge } from './index';

interface GymCardProps {
  gym: Gym;
  onEdit: (gym: Gym) => void;
  onDelete: (id: number, name: string) => void;
  onManageSchedule?: (gym: Gym) => void;
  onManageSpecialSchedule?: (gym: Gym) => void;
  isDeleting?: boolean;
}

export const GymCard = ({ gym, onEdit, onDelete, onManageSchedule, onManageSpecialSchedule, isDeleting }: GymCardProps) => {
  const equipment = Array.isArray(gym.equipment) 
    ? gym.equipment.join(', ') 
    : gym.equipment;

  return (
    <Card className="flex flex-col">
      {gym.photo_url && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <img src={gym.photo_url} alt={gym.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {gym.verified && <Badge variant="active">✓ Verificado</Badge>}
            {gym.featured && <Badge variant="warning">⭐ Destacado</Badge>}
          </div>
        </div>
      )}
      
      <div className="flex flex-col flex-grow p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-text dark:text-text-dark">{gym.name}</h3>
          <span className="text-sm text-text-muted flex items-center gap-1">📍 {gym.city}</span>
        </div>
        
        <p className="text-sm text-text-muted mb-4 flex-grow">{gym.description}</p>
        
        <div className="border-y border-border dark:border-border-dark py-4 mb-4 flex flex-col gap-2 text-sm text-text dark:text-text-dark">
          <div className="flex justify-between">
            <span className="font-semibold text-text-muted">Dirección:</span>
            <span>{gym.address}</span>
          </div>
          {gym.phone && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Teléfono:</span>
              <span>{gym.phone}</span>
            </div>
          )}
          {gym.whatsapp && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">WhatsApp:</span>
              <span>{gym.whatsapp}</span>
            </div>
          )}
          {gym.email && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Email:</span>
              <span>{gym.email}</span>
            </div>
          )}
        </div>

        <div className="bg-bg dark:bg-bg-dark p-3 rounded-lg mb-4 flex flex-col gap-2 text-sm text-text dark:text-text-dark">
          <div className="flex justify-between">
            <span className="font-semibold text-text-muted">Equipamiento:</span>
            <span className="font-semibold text-right">{equipment}</span>
          </div>
          {gym.max_capacity && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Capacidad:</span>
              <span className="font-semibold">{gym.max_capacity} personas</span>
            </div>
          )}
          {gym.area_sqm && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Área:</span>
              <span className="font-semibold">{gym.area_sqm} m²</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-bg dark:bg-bg-dark p-3 rounded-lg text-center">
            <span className="text-sm font-semibold text-text-muted">Mensual</span>
            <p className="text-lg font-bold text-primary">${gym.month_price.toLocaleString()}</p>
          </div>
          <div className="bg-bg dark:bg-bg-dark p-3 rounded-lg text-center">
            <span className="text-sm font-semibold text-text-muted">Semanal</span>
            <p className="text-lg font-bold text-primary">${gym.week_price.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-bg dark:bg-bg-dark p-3 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <Badge variant={gym.auto_checkin_enabled ? 'active' : 'inactive'}>
              {gym.auto_checkin_enabled ? '✓ Auto Check-in' : '✗ Auto Check-in'}
            </Badge>
            {gym.auto_checkin_enabled && (
              <span className="text-xs text-text-muted">
                {gym.geofence_radius_meters}m · {gym.min_stay_minutes} min
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
            <div className="flex gap-2">
                <Button onClick={() => onEdit(gym)} variant="primary" size="sm" className="flex-1">✏️ Editar</Button>
                <Button onClick={() => onDelete(gym.id_gym, gym.name)} variant="danger" size="sm" disabled={isDeleting} className="flex-1">🗑️ Eliminar</Button>
            </div>
            <div className="flex gap-2">
                {onManageSchedule && (
                    <Button onClick={() => onManageSchedule(gym)} variant="success" size="sm" className="flex-1">📅 Horarios</Button>
                )}
                {onManageSpecialSchedule && (
                    <Button onClick={() => onManageSpecialSchedule(gym)} variant="secondary" size="sm" className="flex-1">🎉 Especiales</Button>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
};
