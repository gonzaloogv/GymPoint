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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const GymFormBasicInfo: React.FC<GymFormBasicInfoProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
      <h3 className="mb-4 text-lg font-semibold text-text dark:text-text-dark">Informacion basica</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        label="Descripcion *"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        required
        rows={3}
        placeholder="Describe el gimnasio..."
      />
      <Input
        label="Direccion *"
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
