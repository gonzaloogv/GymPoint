import React from 'react';
import { Input } from '../index';
import { COMMON_AMENITIES } from '@/domain';

interface GymFormCharacteristicsProps {
  equipmentInput: string;
  handleEquipmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: {
    max_capacity?: number;
    area_sqm?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedAmenities: string[];
  toggleAmenity: (amenityName: string) => void;
}

export const GymFormCharacteristics: React.FC<GymFormCharacteristicsProps> = ({
  equipmentInput,
  handleEquipmentChange,
  formData,
  handleInputChange,
  selectedAmenities,
  toggleAmenity,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Características</h3>
      <Input
        label="Equipamiento * (separado por comas)"
        type="text"
        value={equipmentInput}
        onChange={handleEquipmentChange}
        required
        placeholder="Ej: Pesas, Máquinas, Cardio, Funcional"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Capacidad Máxima" type="number" name="max_capacity" value={formData.max_capacity || ''} onChange={handleInputChange} placeholder="Ej: 50" />
        <Input label="Área (m²)" type="number" step="0.01" name="area_sqm" value={formData.area_sqm || ''} onChange={handleInputChange} placeholder="Ej: 200" />
      </div>
      <div>
        <label className="text-text dark:text-text-dark font-medium text-sm mb-2 block">
          Amenidades ({selectedAmenities.length} seleccionadas)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {COMMON_AMENITIES.map((amenity) => (
            <button
              key={amenity.name}
              type="button"
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                selectedAmenities.includes(amenity.name)
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              }`}
              onClick={() => toggleAmenity(amenity.name)}
            >
              <span className="text-2xl">{amenity.icon}</span>
              <span className="font-medium">{amenity.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
