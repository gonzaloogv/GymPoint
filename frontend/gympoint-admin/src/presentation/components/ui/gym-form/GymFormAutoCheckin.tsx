import React from 'react';
import { Input } from '../index';

interface GymFormAutoCheckinProps {
  formData: {
    auto_checkin_enabled?: boolean;
    geofence_radius_meters?: number;
    min_stay_minutes?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GymFormAutoCheckin: React.FC<GymFormAutoCheckinProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Configuración de Auto Check-in</h3>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="auto_checkin_enabled"
          id="auto_checkin_enabled"
          checked={formData.auto_checkin_enabled || false}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
        />
        <label htmlFor="auto_checkin_enabled" className="text-text dark:text-text-dark font-medium text-sm">Habilitar Auto Check-in</label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Radio de Geofence (metros)" type="number" name="geofence_radius_meters" value={formData.geofence_radius_meters || ''} onChange={handleInputChange} placeholder="150" />
        <Input label="Tiempo Mínimo de Estadía (minutos)" type="number" name="min_stay_minutes" value={formData.min_stay_minutes || ''} onChange={handleInputChange} placeholder="10" />
      </div>
    </div>
  );
};
