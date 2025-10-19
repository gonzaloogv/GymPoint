import { CreateGymDTO, UpdateGymDTO, Gym, Amenity } from '@/domain';
import { Button } from './index';
import { useAmenities, useGymForm } from '@/presentation/hooks';
import {
  GymFormBasicInfo,
  GymFormLocation,
  GymFormContact,
  GymFormCharacteristics,
  GymFormPricing,
  GymFormAutoCheckin,
  GymFormExtraOptions,
} from './gym-form';

interface GymFormProps {
  gym?: Gym;
  onSubmit: (data: CreateGymDTO | UpdateGymDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const GymForm = ({ gym, onSubmit, onCancel, isLoading }: GymFormProps) => {
  const {
    formData,
    equipmentInput,
    selectedAmenityIds,
    isExtracting,
    handleInputChange,
    handleGoogleMapsUrlChange,
    handleEquipmentChange,
    toggleAmenity,
    handleSubmit,
  } = useGymForm({ gym, onSubmit });

  const { data: amenitiesData, isLoading: amenitiesLoading } = useAmenities();
  const amenityOptions: Amenity[] = amenitiesData ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GymFormBasicInfo formData={formData} handleInputChange={handleInputChange} />
      <GymFormLocation
        formData={formData}
        handleInputChange={handleInputChange}
        handleGoogleMapsUrlChange={handleGoogleMapsUrlChange}
        isExtracting={isExtracting}
      />
      <GymFormContact formData={formData} handleInputChange={handleInputChange} />
      <GymFormCharacteristics
        equipmentInput={equipmentInput}
        handleEquipmentChange={handleEquipmentChange}
        formData={formData}
        handleInputChange={handleInputChange}
        amenities={amenityOptions}
        selectedAmenityIds={selectedAmenityIds}
        amenitiesLoading={amenitiesLoading}
        toggleAmenity={toggleAmenity}
      />
      <GymFormPricing formData={formData} handleInputChange={handleInputChange} />
      <GymFormAutoCheckin formData={formData} handleInputChange={handleInputChange} />
      <GymFormExtraOptions formData={formData} handleInputChange={handleInputChange} />

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : gym ? 'Actualizar Gimnasio' : 'Crear Gimnasio'}
        </Button>
      </div>
    </form>
  );
};
