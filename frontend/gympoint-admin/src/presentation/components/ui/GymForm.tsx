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
  GymFormRules,
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
    addRule,
    removeRule,
  } = useGymForm({ gym, onSubmit });

  const { data: amenitiesData, isLoading: amenitiesLoading } = useAmenities();
  const amenityOptions: Amenity[] = amenitiesData ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GymFormBasicInfo formData={formData} handleInputChange={handleInputChange} />
      <GymFormRules
        rules={formData.rules || []}
        onAddRule={addRule}
        onRemoveRule={removeRule}
      />
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

      <div className="mt-6 flex justify-end gap-4">
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

