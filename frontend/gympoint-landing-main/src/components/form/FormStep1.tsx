import { useState } from 'react';
import validator from 'validator';
import { Input } from '../ui/Input';
import type { GymFormData } from '../../types/gym.types';
import { LocationInput } from '../ui/LocationInput';

interface FormStep1Props {
  formData: GymFormData;
  updateField: (path: string, value: any) => void;
}

export const FormStep1: React.FC<FormStep1Props> = ({ formData, updateField }) => {
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateField('contact.email', value);
    
    if (value && !validator.isEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateField('contact.phone', value);
    
    const phoneRegex = /^(\+54)?[\s]?[\d\s]{8,15}$/;
    if (value && !phoneRegex.test(value)) {
      setErrors(prev => ({ ...prev, phone: 'Formato: +54 362 4999999 o 362 4999999' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Manejar cambio de ubicación desde el mapa
  const handleLocationChange = (data: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => {
    updateField('location.address', data.address);
    updateField('location.city', data.city);
    updateField('location.latitude', data.latitude);
    updateField('location.longitude', data.longitude);
  };

  return (
    <div className="space-y-6">
      {/* Nombre del Gimnasio */}
      <Input
        label="¿Cómo se llama el gimnasio? *"
        type="text"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Ej: FitCenter Norte"
        helperText="Nombre oficial del gimnasio"
        required
      />

      {/* Mapa de Ubicación */}
      <div>
        <LocationInput
          address={formData.location.address}
          city={formData.location.city}
          latitude={formData.location.latitude}
          longitude={formData.location.longitude}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* Email */}
      <Input
        label="Correo electrónico de contacto *"
        type="email"
        value={formData.contact.email}
        onChange={handleEmailChange}
        placeholder="info@gimnasio.com"
        error={errors.email}
        helperText={errors.email ? '' : 'Email principal de contacto'}
        required
      />

      {/* Teléfono */}
      <Input
        label="Teléfono / Celular de contacto *"
        type="tel"
        value={formData.contact.phone}
        onChange={handlePhoneChange}
        placeholder="+54 362 4999999"
        error={errors.phone}
        helperText={errors.phone ? '' : 'Número de contacto del gimnasio'}
        required
      />

      {/* Indicador de campos obligatorios */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios para continuar.
        </p>
      </div>
    </div>
  );
};