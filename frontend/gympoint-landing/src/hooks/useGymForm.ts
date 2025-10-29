import { useState, useEffect } from 'react';
import type { GymFormData, DaySchedule } from '../types/gym.types.ts';

const STORAGE_KEY = 'gympoint_form_draft';

const getInitialFormData = (): GymFormData => {
  const defaultData: GymFormData = {
    name: '',
    location: {
      address: '',
      city: '',
      latitude: null,
      longitude: null,
    },
    contact: {
      email: '',
      phone: '',
      social_media: {
        instagram: '',
        facebook: '',
      },
    },
    attributes: {
      photos: [],
      equipment: {}, // Objeto categorizado
      services: [], // Array de servicios/tipos
      rules: [], // Array de reglas
    },
    pricing: {
      monthly: null,
      weekly: null,
      daily: null,
    },
    description: '',
    schedule: getDefaultSchedule(),
    amenities: [],
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsedData = JSON.parse(saved);
      // Merge con defaults para asegurar que todos los campos existan
      return {
        ...defaultData,
        ...parsedData,
        attributes: {
          ...defaultData.attributes,
          ...(parsedData.attributes || {}),
        },
        contact: {
          ...defaultData.contact,
          ...(parsedData.contact || {}),
          social_media: {
            ...defaultData.contact.social_media,
            ...(parsedData.contact?.social_media || {}),
          },
        },
        location: {
          ...defaultData.location,
          ...(parsedData.location || {}),
        },
        pricing: {
          ...defaultData.pricing,
          ...(parsedData.pricing || {}),
        },
        amenities: parsedData.amenities || [],
      };
    } catch (e) {
      console.error('Error parsing saved form data:', e);
    }
  }

  return defaultData;
};

const getDefaultSchedule = (): DaySchedule[] => {
  const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  return days.map(day => ({
    day,
    opens: '07:00',
    closes: '22:00',
    is_open: true,
  }));
};

export const useGymForm = () => {
  const [formData, setFormData] = useState<GymFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

const isStep1Complete = () => {
  const { name, location, contact } = formData;

  return !!(
    name.trim() &&
    location.address.trim() &&
    location.city.trim() &&
    location.latitude !== null &&
    location.longitude !== null &&
    contact.phone.trim()
  );
};

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(getInitialFormData());
  };

  const exportJSON = () => {
    return JSON.stringify(formData, null, 2);
  };
  

  return {
    formData,
    updateField,
    currentStep,
    setCurrentStep,
    isStep1Complete,
    clearDraft,
    exportJSON,
  };
};