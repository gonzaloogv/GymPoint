import React from 'react';
import { Input } from '../index';

interface GymFormPricingProps {
  formData: {
    month_price: number;
    week_price: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GymFormPricing: React.FC<GymFormPricingProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Precios</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Precio Mensual *" type="number" step="0.01" name="month_price" value={formData.month_price} onChange={handleInputChange} required placeholder="0.00" />
        <Input label="Precio Semanal *" type="number" step="0.01" name="week_price" value={formData.week_price} onChange={handleInputChange} required placeholder="0.00" />
      </div>
    </div>
  );
};
