import { useState } from 'react';
import type { GymFormData } from '../types/gym.types';

interface UseGymFormSubmitReturn {
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  errorMessage: string;
  submitToWeb3Forms: (formData: GymFormData) => Promise<boolean>;
  resetSubmitStatus: () => void;
}

export const useGymFormSubmit = (): UseGymFormSubmitReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const formatJSONForEmail = (data: GymFormData): string => {
    const formatted = {
      '=== INFORMACIÓN DEL GIMNASIO ===': '',
      'Nombre': data.name,
      'Descripción': data.description || 'No proporcionada',
      
      '=== UBICACIÓN ===': '',
      'Dirección': data.location.address,
      'Ciudad': data.location.city,
      'Coordenadas': `Lat: ${data.location.latitude}, Lng: ${data.location.longitude}`,
      
      '=== CONTACTO ===': '',
      'Email': data.contact.email,
      'Teléfono': data.contact.phone,
      'Instagram': data.contact.social_media.instagram || 'No proporcionado',
      'Facebook': data.contact.social_media.facebook || 'No proporcionado',
      
      '=== HORARIOS ===': '',
      'Horarios de atención': data.schedule.map(day => 
        day.is_open 
          ? `${day.day}: ${day.opens} - ${day.closes}`
          : `${day.day}: Cerrado`
      ).join('\n'),
      
      '=== TIPOS DE ENTRENAMIENTO ===': '',
      'Entrenamientos': data.attributes.training_types.length > 0 
        ? data.attributes.training_types.join(', ') 
        : 'No especificados',
      
      '=== PRECIOS ===': '',
      'Cuota Mensual': data.pricing.monthly ? `$${data.pricing.monthly}` : 'No especificado',
      'Pase Semanal': data.pricing.weekly ? `$${data.pricing.weekly}` : 'No especificado',
      'Pase Diario': data.pricing.daily ? `$${data.pricing.daily}` : 'No especificado',
      
      '=== SERVICIOS ADICIONALES ===': '',
      'Amenidades': data.amenities.length > 0 
        ? data.amenities.join(', ') 
        : 'No especificadas',
      
      '=== FOTOS ===': '',
      'Total de fotos': data.attributes.photos.length,
      'URLs de fotos': data.attributes.photos.length > 0 
        ? data.attributes.photos.join('\n') 
        : 'Sin fotos',
      
      '=== JSON COMPLETO (para base de datos) ===': '',
      'JSON_DATA': JSON.stringify(data, null, 2)
    };

    return Object.entries(formatted)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n\n');
  };

  const submitToWeb3Forms = async (formData: GymFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {

      const submitData = new FormData();
      
      submitData.append('access_key', ACCESS_KEY);
      submitData.append('subject', `🏋️ Nuevo Registro de Gimnasio: ${formData.name}`);
      submitData.append('from_name', 'GymPoint - Sistema de Registro');
      
      const formattedMessage = formatJSONForEmail(formData);
      submitData.append('message', formattedMessage);
      
      submitData.append('gimnasio_nombre', formData.name);
      submitData.append('gimnasio_ciudad', formData.location.city);
      submitData.append('gimnasio_email', formData.contact.email);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setIsSubmitting(false);
        return true;
      } else {
        throw new Error(result.message || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Error de conexión. Por favor, intenta nuevamente.'
      );
      setIsSubmitting(false);
      return false;
    }
  };

  const resetSubmitStatus = () => {
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  return {
    isSubmitting,
    submitStatus,
    errorMessage,
    submitToWeb3Forms,
    resetSubmitStatus,
  };
};