import React from 'react';
import { Input } from '../index';

interface GymFormExtraOptionsProps {
  formData: {
    photo_url?: string;
    verified?: boolean;
    featured?: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GymFormExtraOptions: React.FC<GymFormExtraOptionsProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Opciones Adicionales</h3>
      <Input label="URL de Foto" type="url" name="photo_url" value={formData.photo_url || ''} onChange={handleInputChange} placeholder="https://ejemplo.com/foto.jpg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <input type="checkbox" name="verified" id="verified" checked={formData.verified || false} onChange={handleInputChange} className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary" />
          <label htmlFor="verified" className="text-text dark:text-text-dark font-medium text-sm">Verificado</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="featured" id="featured" checked={formData.featured || false} onChange={handleInputChange} className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary" />
          <label htmlFor="featured" className="text-text dark:text-text-dark font-medium text-sm">Destacado</label>
        </div>
      </div>
    </div>
  );
};
