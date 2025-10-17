import { Gym } from '@/domain';

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
    <div className="gym-card">
      {gym.photo_url && (
        <div className="gym-photo">
          <img src={gym.photo_url} alt={gym.name} />
          <div className="gym-badges">
            {gym.verified && <span className="badge badge-verified">✓ Verificado</span>}
            {gym.featured && <span className="badge badge-featured">⭐ Destacado</span>}
          </div>
        </div>
      )}
      
      <div className="gym-card-content">
        <div className="gym-header">
          <h3>{gym.name}</h3>
          <span className="gym-city">📍 {gym.city}</span>
        </div>
        
        <p className="gym-description">{gym.description}</p>
        
        <div className="gym-details">
          <div className="detail-item">
            <span className="label">Dirección:</span>
            <span>{gym.address}</span>
          </div>
          
          {gym.phone && (
            <div className="detail-item">
              <span className="label">Teléfono:</span>
              <span>{gym.phone}</span>
            </div>
          )}
          
          {gym.whatsapp && (
            <div className="detail-item">
              <span className="label">WhatsApp:</span>
              <span>{gym.whatsapp}</span>
            </div>
          )}
          
          {gym.email && (
            <div className="detail-item">
              <span className="label">Email:</span>
              <span>{gym.email}</span>
            </div>
          )}
        </div>

        <div className="gym-features">
          <div className="feature-item">
            <span className="label">Equipamiento:</span>
            <span className="value">{equipment}</span>
          </div>
          
          {gym.max_capacity && (
            <div className="feature-item">
              <span className="label">Capacidad:</span>
              <span className="value">{gym.max_capacity} personas</span>
            </div>
          )}
          
          {gym.area_sqm && (
            <div className="feature-item">
              <span className="label">Área:</span>
              <span className="value">{gym.area_sqm} m²</span>
            </div>
          )}
        </div>

        <div className="gym-pricing">
          <div className="price-item">
            <span className="label">Mensual</span>
            <span className="price">${gym.month_price.toLocaleString()}</span>
          </div>
          <div className="price-item">
            <span className="label">Semanal</span>
            <span className="price">${gym.week_price.toLocaleString()}</span>
          </div>
        </div>

        <div className="gym-config">
          <div className="config-item">
            <span className={`status ${gym.auto_checkin_enabled ? 'active' : 'inactive'}`}>
              {gym.auto_checkin_enabled ? '✓' : '✗'} Auto Check-in
            </span>
            {gym.auto_checkin_enabled && (
              <span className="config-details">
                {gym.geofence_radius_meters}m · {gym.min_stay_minutes} min
              </span>
            )}
          </div>
        </div>

        <div className="gym-actions">
          <button
            onClick={() => onEdit(gym)}
            className="btn-edit"
          >
            ✏️ Editar
          </button>
          {onManageSchedule && (
            <button
              onClick={() => onManageSchedule(gym)}
              className="btn-schedule"
            >
              📅 Horarios
            </button>
          )}
          {onManageSpecialSchedule && (
            <button
              onClick={() => onManageSpecialSchedule(gym)}
              className="btn-special-schedule"
            >
              🎉 Especiales
            </button>
          )}
          <button
            onClick={() => onDelete(gym.id_gym, gym.name)}
            className="btn-danger-sm"
            disabled={isDeleting}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

