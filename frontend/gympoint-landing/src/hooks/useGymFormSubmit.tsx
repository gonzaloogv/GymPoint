import { useState } from 'react';
import type { GymFormData } from '../types/gym.types';

interface UseGymFormSubmitReturn {
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  errorMessage: string;
  submitToWeb3Forms: (formData: GymFormData) => Promise<boolean>;
  resetSubmitStatus: () => void;
}

const normalizePhotos = (photos: string[]) => (Array.isArray(photos) ? photos.slice(0, 1) : []);

export const useGymFormSubmit = (): UseGymFormSubmitReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const formatJSONForEmail = (data: GymFormData): string => {
    const photos = normalizePhotos(data.attributes.photos);
    const formatted = {
      '=== INFORMACIÓN DEL GIMNASIO ===': '',
      Nombre: data.name,
      Descripción: data.description || 'No proporcionada',

      '=== UBICACIÓN ===': '',
      Dirección: data.location.address,
      Ciudad: data.location.city,
      Coordenadas: `Lat: ${data.location.latitude}, Lng: ${data.location.longitude}`,

      '=== CONTACTO ===': '',
      Email: data.contact.email,
      Teléfono: data.contact.phone,
      Instagram: data.contact.social_media.instagram || 'No proporcionado',
      Facebook: data.contact.social_media.facebook || 'No proporcionado',

      '=== HORARIOS ===': '',
      'Horarios de atención': data.schedule
        .map((day) => (day.is_open ? `${day.day}: ${day.opens} - ${day.closes}` : `${day.day}: Cerrado`))
        .join('\n'),

      '=== SERVICIOS/TIPOS DE ENTRENAMIENTO ===': '',
      Servicios:
        data.attributes.services.length > 0 ? data.attributes.services.join(', ') : 'No especificados',

      '=== EQUIPAMIENTO ===': '',
      'Equipamiento por categoría':
        Object.keys(data.attributes.equipment).length > 0
          ? Object.entries(data.attributes.equipment)
              .map(
                ([category, items]) =>
                  `${category}: ${items.map((item) => `${item.name} (${item.quantity})`).join(', ')}`
              )
              .join('\n')
          : 'No especificado',

      '=== REGLAS ===': '',
      'Reglas del gimnasio': data.attributes.rules.length > 0 ? data.attributes.rules.join(', ') : 'No especificadas',

      '=== PRECIOS ===': '',
      'Cuota Mensual': data.pricing.monthly ? `$${data.pricing.monthly}` : 'No especificado',
      'Pase Semanal': data.pricing.weekly ? `$${data.pricing.weekly}` : 'No especificado',
      'Pase Diario': data.pricing.daily ? `$${data.pricing.daily}` : 'No especificado',

      '=== SERVICIOS ADICIONALES ===': '',
      Amenidades: data.amenities.length > 0 ? data.amenities.join(', ') : 'No especificadas',

      '=== FOTOS ===': '',
      'Total de fotos': photos.length,
      'URLs de fotos': photos.length > 0 ? photos.join('\n') : 'Sin fotos',

      '=== JSON COMPLETO (para base de datos) ===': '',
      JSON_DATA: JSON.stringify({ ...data, attributes: { ...data.attributes, photos } }, null, 2),
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
      const photos = normalizePhotos(formData.attributes.photos);

      // 1. Enviar al backend API (principal)
      const apiResponse = await fetch(`${API_URL}/api/gym-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description.trim() || 'Sin descripción proporcionada',
          location: formData.location,
          contact: {
            ...formData.contact,
            email: formData.contact.email.trim() || undefined,
          },
          attributes: {
            ...formData.attributes,
            photos,
          },
          pricing: formData.pricing,
          schedule: formData.schedule,
          amenities: formData.amenities,
          trial_allowed: formData.trial_allowed ?? false,
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        throw new Error(error.error?.message || 'Error al enviar la solicitud');
      }

      // 2. También enviar email a Web3Forms (como notificación adicional)
      try {
        const submitData = new FormData();

        submitData.append('access_key', ACCESS_KEY);
        submitData.append('subject', `🚀 Nuevo Registro de Gimnasio: ${formData.name}`);
        submitData.append('from_name', 'GymPoint - Sistema de Registro');

        const formattedMessage = formatJSONForEmail({ ...formData, attributes: { ...formData.attributes, photos } });
        submitData.append('message', formattedMessage);

        submitData.append('gimnasio_nombre', formData.name);
        submitData.append('gimnasio_ciudad', formData.location.city);
        submitData.append('gimnasio_email', formData.contact.email);

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: submitData,
        });
      } catch (emailError) {
        console.error('Error enviando notificación por email:', emailError);
      }

      setSubmitStatus('success');
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Error de conexión. Por favor, intenta nuevamente.'
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
