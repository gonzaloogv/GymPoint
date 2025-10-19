import { Gym } from '@/domain';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';

interface GymCardProps {
  gym: Gym;
  onEdit: (gym: Gym) => void;
  onDelete: (id: number, name: string) => void;
  onManageSchedule?: (gym: Gym) => void;
  onManageSpecialSchedule?: (gym: Gym) => void;
  isDeleting?: boolean;
}

export const GymCard = ({
  gym,
  onEdit,
  onDelete,
  onManageSchedule,
  onManageSpecialSchedule,
  isDeleting,
}: GymCardProps) => {
  const equipmentList = Array.isArray(gym.equipment) ? gym.equipment.join(', ') : gym.equipment;

  return (
    <Card className="flex flex-col">
      {gym.photo_url && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <img src={gym.photo_url} alt={gym.name} className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            {gym.verified && <Badge variant="active">Verificado</Badge>}
            {gym.featured && <Badge variant="warning">Destacado</Badge>}
          </div>
        </div>
      )}

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-xl font-bold text-text dark:text-text-dark">{gym.name}</h3>
          {gym.city && <span className="text-sm text-text-muted">Ciudad: {gym.city}</span>}
        </div>

        {gym.description && (
          <p className="mb-4 flex-grow text-sm text-text-muted">{gym.description}</p>
        )}

        <div className="mb-4 flex flex-col gap-2 border-y border-border py-4 text-sm text-text dark:border-border-dark dark:text-text-dark">
          <div className="flex justify-between">
            <span className="font-semibold text-text-muted">Direccion:</span>
            <span>{gym.address}</span>
          </div>
          {gym.phone && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Telefono:</span>
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

        <div className="mb-4 flex flex-col gap-2 rounded-lg bg-bg p-3 text-sm text-text dark:bg-bg-dark dark:text-text-dark">
          <div className="flex justify-between">
            <span className="font-semibold text-text-muted">Equipamiento:</span>
            <span className="font-semibold text-right">{equipmentList}</span>
          </div>
          {gym.max_capacity && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Capacidad:</span>
              <span className="font-semibold">{gym.max_capacity} personas</span>
            </div>
          )}
          {gym.area_sqm && (
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Area:</span>
              <span className="font-semibold">{gym.area_sqm} m2</span>
            </div>
          )}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-bg p-3 text-center dark:bg-bg-dark">
            <span className="text-sm font-semibold text-text-muted">Mensual</span>
            <p className="text-lg font-bold text-primary">
              ${gym.month_price.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-bg p-3 text-center dark:bg-bg-dark">
            <span className="text-sm font-semibold text-text-muted">Semanal</span>
            <p className="text-lg font-bold text-primary">
              ${gym.week_price.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-bg p-3 dark:bg-bg-dark">
          <div className="flex items-center justify-between">
            <Badge variant={gym.auto_checkin_enabled ? 'active' : 'inactive'}>
              {gym.auto_checkin_enabled ? 'Auto Check-in activado' : 'Auto Check-in desactivado'}
            </Badge>
            {gym.auto_checkin_enabled && (
              <span className="text-xs text-text-muted">
                {gym.geofence_radius_meters}m / {gym.min_stay_minutes} min
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <Button onClick={() => onEdit(gym)} variant="primary" size="sm" className="flex-1">
              Editar
            </Button>
            <Button
              onClick={() => onDelete(gym.id_gym, gym.name)}
              variant="danger"
              size="sm"
              disabled={isDeleting}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
          <div className="flex gap-2">
            {onManageSchedule && (
              <Button onClick={() => onManageSchedule(gym)} variant="success" size="sm" className="flex-1">
                Horarios
              </Button>
            )}
            {onManageSpecialSchedule && (
              <Button
                onClick={() => onManageSpecialSchedule(gym)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Especiales
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
