import React from 'react';
import { Input } from '../index';

interface GymFormContactProps {
  formData: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GymFormContact: React.FC<GymFormContactProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Contacto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Teléfono" type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="+54 362 1234567" />
        <Input label="WhatsApp" type="tel" name="whatsapp" value={formData.whatsapp || ''} onChange={handleInputChange} placeholder="+54 362 1234567" />
        <Input label="Email" type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="info@gimnasio.com" />
        <Input label="Sitio Web" type="url" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="https://gimnasio.com" />
        <Input label="Instagram" type="text" name="instagram" value={formData.instagram || ''} onChange={handleInputChange} placeholder="@gimnasiocentral" />
        <Input label="Facebook" type="text" name="facebook" value={formData.facebook || ''} onChange={handleInputChange} placeholder="facebook.com/gimnasiocentral" />
      </div>
    </div>
  );
};
