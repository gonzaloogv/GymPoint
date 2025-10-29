import React, { useMemo } from 'react';
import { Input } from '../index';
import { Amenity, COMMON_AMENITY_ICONS } from '@/domain';

interface GymFormCharacteristicsProps {
  formData: {
    max_capacity?: number;
    area_sqm?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  amenities: Amenity[];
  amenitiesLoading: boolean;
  selectedAmenityIds: number[];
  toggleAmenity: (amenityId: number) => void;
}

export const GymFormCharacteristics: React.FC<GymFormCharacteristicsProps> = ({
  formData,
  handleInputChange,
  amenities,
  amenitiesLoading,
  selectedAmenityIds,
  toggleAmenity,
}) => {
  const sortedAmenities = useMemo(() => {
    return [...amenities].sort((a, b) => {
      const categoryComparison = (a.category || '').localeCompare(b.category || '');
      if (categoryComparison !== 0) return categoryComparison;
      return a.name.localeCompare(b.name);
    });
  }, [amenities]);

  const selectedCount = selectedAmenityIds.length;

  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark transition-all duration-200 hover:shadow-md">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Características del local</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Capacidad Máxima"
          type="number"
          name="max_capacity"
          value={formData.max_capacity ?? ''}
          onChange={handleInputChange}
          placeholder="Ej: 50"
        />
        <Input
          label="Área (m²)"
          type="number"
          step="0.01"
          name="area_sqm"
          value={formData.area_sqm ?? ''}
          onChange={handleInputChange}
          placeholder="Ej: 200"
        />
      </div>
      <div>
        <label className="text-text dark:text-text-dark font-medium text-sm mb-2 block">
          Amenidades ({selectedCount} seleccionadas)
        </label>
        {amenitiesLoading ? (
          <p className="text-sm text-text-muted">Cargando amenidades...</p>
        ) : sortedAmenities.length === 0 ? (
          <p className="text-sm text-text-muted">
            Aún no hay amenidades configuradas en el sistema.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedAmenities.map((amenity) => {
              const isSelected = selectedAmenityIds.includes(amenity.id_amenity);
              const rawIcon = amenity.icon?.trim() || '';
              const looksLikeToken = /^[A-Za-z0-9_-]+$/.test(rawIcon);
              const fallbackIcon = COMMON_AMENITY_ICONS[amenity.name] || '🏋️';
              const iconToRender = looksLikeToken || rawIcon.length === 0 ? fallbackIcon : rawIcon;
              const iconLabel = looksLikeToken ? rawIcon : amenity.name;

              return (
                <button
                  key={amenity.id_amenity}
                  type="button"
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => toggleAmenity(amenity.id_amenity)}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {iconToRender}
                  </span>
                  <span className="sr-only">{iconLabel}</span>
                  <span className="font-medium text-left leading-tight">
                    {amenity.name}
                    {amenity.category ? (
                      <span className="block text-xs text-text-muted uppercase">
                        {amenity.category}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

