import { useState, useEffect } from 'react';
import { CreateGymDTO, UpdateGymDTO, Gym } from '@/domain';
import { useGoogleMapsExtractor } from './useGoogleMapsExtractor';

interface UseGymFormProps {
  gym?: Gym;
  onSubmit: (data: CreateGymDTO | UpdateGymDTO) => Promise<void>;
}

export const useGymForm = ({ gym, onSubmit }: UseGymFormProps) => {
  const [formData, setFormData] = useState<CreateGymDTO>({
    name: '',
    description: '',
    rules: [],
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    google_maps_url: '',
    equipment: [],
    max_capacity: undefined,
    area_sqm: undefined,
    verified: false,
    featured: false,
    month_price: 0,
    week_price: 0,
    photo_url: '',
    auto_checkin_enabled: true,
    geofence_radius_meters: 150,
    min_stay_minutes: 10,
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const { isExtracting, extractData } = useGoogleMapsExtractor();

  useEffect(() => {
    if (gym) {
      const initialFormData = {
        name: gym.name,
        description: gym.description,
        rules: Array.isArray(gym.rules) ? gym.rules : [],
        city: gym.city,
        address: gym.address,
        latitude: typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude,
        longitude: typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude,
        phone: gym.phone || '',
        whatsapp: gym.whatsapp || '',
        email: gym.email || '',
        website: gym.website || '',
        instagram: gym.instagram || '',
        facebook: gym.facebook || '',
        google_maps_url: gym.google_maps_url || '',
        equipment: Array.isArray(gym.equipment) ? gym.equipment : [],
        max_capacity: gym.max_capacity || undefined,
        area_sqm: gym.area_sqm || undefined,
        verified: gym.verified,
        featured: gym.featured,
        month_price: gym.month_price,
        week_price: gym.week_price,
        photo_url: gym.photo_url || '',
        auto_checkin_enabled: gym.auto_checkin_enabled,
        geofence_radius_meters: gym.geofence_radius_meters,
        min_stay_minutes: gym.min_stay_minutes,
      };
      setFormData(initialFormData as CreateGymDTO);

      if (Array.isArray(gym.equipment)) {
        setEquipmentInput(gym.equipment.join(', '));
        setFormData(prev => ({ ...prev, equipment: gym.equipment }));
      }
      if (Array.isArray(gym.amenities)) {
        const ids = gym.amenities
          .map((amenity: any) => Number(amenity?.id_amenity))
          .filter((id) => Number.isInteger(id) && id > 0);
        setSelectedAmenityIds(ids);
      }
    } else {
      setSelectedAmenityIds([]);
    }
  }, [gym]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (
      ['latitude', 'longitude', 'month_price', 'week_price', 'area_sqm'].includes(name)
    ) {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (
      ['max_capacity', 'geofence_radius_meters', 'min_stay_minutes'].includes(name)
    ) {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGoogleMapsUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, google_maps_url: url }));
    const extracted = await extractData(url);
    if (extracted) {
      const { latitude, longitude, name } = extracted;
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude,
        ...(name && !prev.name ? { name } : {}),
      }));
      alert(
        `Datos extraidos de Google Maps:\n\nLatitud: ${latitude}\nLongitud: ${longitude}${name ? `\nNombre: ${name}` : ''}\n\n${!name ? 'Completa manualmente el nombre, direccion y otros datos.' : 'Completa la informacion faltante.'}`
      );
    } else if (url.trim() !== '' && !url.includes('goo.gl/maps')) {
      alert(
        'No se pudieron extraer las coordenadas de esta URL.\n\nPor favor, verifica que la URL sea valida o ingresa las coordenadas manualmente.'
      );
    }
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEquipmentInput(value);
    const equipmentArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, equipment: equipmentArray }));
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenityIds(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedRules = (formData.rules || [])
      .map((rule) => rule.trim())
      .filter((rule) => rule.length > 0);

    const baseData = {
      ...formData,
      rules: normalizedRules
    };

    const submitData = gym
      ? ({ ...baseData, id_gym: gym.id_gym, amenities: selectedAmenityIds } as UpdateGymDTO)
      : ({ ...baseData, amenities: selectedAmenityIds } as CreateGymDTO);

    await onSubmit(submitData);
  };

  const addRule = (rule: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: [...(prev.rules || []), rule]
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: (prev.rules || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleJsonImport = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);

      // Extraer equipment del landing
      const equipment = data.attributes?.equipment || [];

      // Extraer datos del JSON del landing
      const extractedData: Partial<CreateGymDTO> = {
        name: data.name || '',
        description: data.description || '',
        city: data.location?.city || '',
        address: data.location?.address || '',
        latitude: data.location?.latitude || 0,
        longitude: data.location?.longitude || 0,
        phone: data.contact?.phone || '',
        email: data.contact?.email || '',
        instagram: data.contact?.social_media?.instagram || '',
        facebook: data.contact?.social_media?.facebook || '',
        month_price: data.pricing?.monthly || 0,
        week_price: data.pricing?.weekly || 0,
        equipment: equipment,
        photo_url: data.attributes?.photos?.[0] || '',
      };

      // Actualizar formData
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));

      // Actualizar equipment input
      if (Array.isArray(equipment) && equipment.length > 0) {
        setEquipmentInput(equipment.join(', '));
      }

      // Limpiar el input después de importar
      setJsonInput('');

      alert(`✅ Datos importados correctamente desde el JSON!\n\nRevisa y completa la información faltante antes de guardar.\n\nNOTA: Las amenidades ya fueron convertidas automáticamente al recibir el JSON en el backend.`);
    } catch (error) {
      alert('❌ Error al importar JSON\n\nAsegúrate de pegar un JSON válido del formulario de la landing.');
      console.error('Error parsing JSON:', error);
    }
  };

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  return {
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
  };
};

