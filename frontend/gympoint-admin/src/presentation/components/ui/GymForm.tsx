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
    jsonInput,
    isExtracting,
    handleInputChange,
    handleGoogleMapsUrlChange,
    handleEquipmentChange,
    handleJsonImport,
    handleJsonInputChange,
    toggleAmenity,
    handleSubmit,
    addRule,
    removeRule,
  } = useGymForm({ gym, onSubmit });

  const { data: amenitiesData, isLoading: amenitiesLoading } = useAmenities();
  const amenityOptions: Amenity[] = amenitiesData ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* JSON Importer - Solo visible al crear un nuevo gimnasio */}
      {!gym && (
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-2 flex items-center gap-2">
            <span className="text-lg">📋</span>
            Importar desde JSON (Landing)
          </h3>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mb-3">
            Si tienes un JSON del formulario de la landing, pégalo aquí para autocompletar los campos.
          </p>
          <textarea
            value={jsonInput}
            onChange={handleJsonInputChange}
            placeholder='{"name": "Gimnasio X", "location": {...}, "contact": {...}, ...}'
            className="w-full h-24 px-3 py-2 text-sm border border-border dark:border-border-dark rounded-md bg-bg dark:bg-bg-dark text-text dark:text-text-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark font-mono resize-none"
          />
          <button
            type="button"
            onClick={() => handleJsonImport(jsonInput)}
            disabled={!jsonInput.trim()}
            className="mt-3 px-4 py-2 bg-primary dark:bg-primary-dark text-white text-sm font-medium rounded-md hover:bg-primary/90 dark:hover:bg-primary-dark/90 disabled:bg-muted dark:disabled:bg-muted-dark disabled:text-text-muted dark:disabled:text-text-muted-dark disabled:cursor-not-allowed transition-colors"
          >
            Importar Datos
          </button>
        </div>
      )}

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

