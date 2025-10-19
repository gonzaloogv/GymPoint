import React from 'react';
import { Input, Textarea } from '../index';

interface GymFormBasicInfoProps {
  formData: {
    name: string;
    city: string;
    description: string;
    address: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const GymFormBasicInfo: React.FC<GymFormBasicInfoProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
        Información Básica
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre *"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="Ej: Gimnasio Central"
        />
        <Input
          label="Ciudad *"
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
          placeholder="Ej: Resistencia"
        />
      </div>
      <Textarea
        label="Descripción *"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        required
        rows={3}
        placeholder="Describe el gimnasio..."
      />
      <Input
        label="Dirección *"
        type="text"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        required
        placeholder="Ej: Av. Sarmiento 1234"
      />
    </div>
  );
};
