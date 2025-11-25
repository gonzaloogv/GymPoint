import React from 'react';
import { Input } from '../index';

interface GymFormLocationProps {
  formData: {
    google_maps_url?: string;
    latitude: number;
    longitude: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGoogleMapsUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExtracting: boolean;
}

export const GymFormLocation: React.FC<GymFormLocationProps> = ({
  formData,
  handleInputChange,
  handleGoogleMapsUrlChange,
  isExtracting,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Ubicación</h3>
      <Input
        label={`🗺️ URL de Google Maps ${isExtracting ? '(Extrayendo datos...)' : ''}`}
        type="url"
        name="google_maps_url"
        value={formData.google_maps_url || ''}
        onChange={handleGoogleMapsUrlChange}
        placeholder="Pega aquí la URL de Google Maps para autocompletar coordenadas..."
        disabled={isExtracting}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Latitud *"
          type="number"
          step="any"
          name="latitude"
          value={formData.latitude}
          onChange={handleInputChange}
          required
          placeholder="-27.4511"
        />
        <Input
          label="Longitud *"
          type="number"
          step="any"
          name="longitude"
          value={formData.longitude}
          onChange={handleInputChange}
          required
          placeholder="-58.9867"
        />
      </div>
    </div>
  );
};
