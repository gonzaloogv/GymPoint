import { useState, useEffect } from 'react';
import { CreateGymDTO, UpdateGymDTO, Gym, COMMON_AMENITIES } from '@/domain';
import { Input, Select, Textarea, Button } from './index';

interface GymFormProps {
  gym?: Gym;
  gymTypes: string[];
  onSubmit: (data: CreateGymDTO | UpdateGymDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const GymForm = ({ gym, gymTypes, onSubmit, onCancel, isLoading }: GymFormProps) => {
  const [formData, setFormData] = useState<CreateGymDTO>({
    name: '',
    description: '',
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
  const [isExtractingFromMaps, setIsExtractingFromMaps] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const extractFromGoogleMaps = async (url: string) => {
    try {
      setIsExtractingFromMaps(true);
      let latitude = 0;
      let longitude = 0;
      let placeName = '';
      const coordPattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match1 = url.match(coordPattern1);
      if (match1) {
        latitude = parseFloat(match1[1]);
        longitude = parseFloat(match1[2]);
      } else {
        const coordPattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match2 = url.match(coordPattern2);
        if (match2) {
          latitude = parseFloat(match2[1]);
          longitude = parseFloat(match2[2]);
        }
      }
      const placePattern = /\/place\/([^/@]+)/;
      const placeMatch = url.match(placePattern);
      if (placeMatch) {
        placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
      if (latitude !== 0 && longitude !== 0) {
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          google_maps_url: url,
          ...(placeName && !prev.name ? { name: placeName } : {}),
        }));
        alert(`✅ Datos extraídos de Google Maps:\n\nLatitud: ${latitude}\nLongitud: ${longitude}${placeName ? `\nNombre: ${placeName}` : ''}\n\n${!placeName ? 'Completa manualmente el nombre, dirección y otros datos.' : 'Completa la información faltante.'}`);
      } else {
        alert('⚠️ No se pudieron extraer las coordenadas de esta URL.\n\nPor favor, verifica que la URL sea válida o ingresa las coordenadas manualmente.');
      }
    } catch (error) {
      console.error('Error al extraer datos de Google Maps:', error);
      alert('❌ Error al procesar la URL de Google Maps.');
    } finally {
      setIsExtractingFromMaps(false);
    }
  };

  const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, google_maps_url: url }));
    if (url && (url.includes('google.com/maps') || url.includes('maps.app.goo.gl'))) {
      extractFromGoogleMaps(url);
    }
  };

  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name,
        description: gym.description,
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
      });
      if (Array.isArray(gym.equipment)) {
        setEquipmentInput(gym.equipment.join(', '));
      }
      if (gym.amenities && Array.isArray(gym.amenities)) {
        setSelectedAmenities(gym.amenities.map((a: any) => a.name || a));
      }
    }
  }, [gym]);

  const toggleAmenity = (amenityName: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityName)
        ? prev.filter((a) => a !== amenityName)
        : [...prev, amenityName]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (['latitude', 'longitude', 'month_price', 'week_price', 'area_sqm'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (['max_capacity', 'geofence_radius_meters', 'min_stay_minutes'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEquipmentInput(value);
    const equipmentArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev) => ({ ...prev, equipment: equipmentArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = gym 
      ? { ...formData, id_gym: gym.id_gym } as UpdateGymDTO
      : formData;
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Información Básica</h3>
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

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Ubicación</h3>
        <Input
          label={`🗺️ URL de Google Maps ${isExtractingFromMaps ? '(Extrayendo datos...)' : ''}`}
          type="url"
          name="google_maps_url"
          value={formData.google_maps_url}
          onChange={handleGoogleMapsUrlChange}
          placeholder="Pega aquí la URL de Google Maps para autocompletar coordenadas..."
          disabled={isExtractingFromMaps}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Latitud *"
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            required
            placeholder="-27.4511"
          />
          <Input
            label="Longitud *"
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            required
            placeholder="-58.9867"
          />
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Teléfono" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+54 362 1234567" />
          <Input label="WhatsApp" type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="+54 362 1234567" />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="info@gimnasio.com" />
          <Input label="Sitio Web" type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://gimnasio.com" />
          <Input label="Instagram" type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="@gimnasiocentral" />
          <Input label="Facebook" type="text" name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="facebook.com/gimnasiocentral" />
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Características</h3>
        <Input
          label="Equipamiento * (separado por comas)"
          type="text"
          value={equipmentInput}
          onChange={handleEquipmentChange}
          required
          placeholder="Ej: Pesas, Máquinas, Cardio, Funcional"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Capacidad Máxima" type="number" name="max_capacity" value={formData.max_capacity || ''} onChange={handleInputChange} placeholder="Ej: 50" />
          <Input label="Área (m²)" type="number" step="0.01" name="area_sqm" value={formData.area_sqm || ''} onChange={handleInputChange} placeholder="Ej: 200" />
        </div>
        <div>
          <label className="text-text dark:text-text-dark font-medium text-sm mb-2 block">Amenidades ({selectedAmenities.length} seleccionadas)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMMON_AMENITIES.map((amenity) => (
              <button
                key={amenity.name}
                type="button"
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedAmenities.includes(amenity.name) ? 'border-primary bg-primary/10' : 'border-border'}`}
                onClick={() => toggleAmenity(amenity.name)}
              >
                <span className="text-2xl">{amenity.icon}</span>
                <span className="font-medium">{amenity.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Precios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Precio Mensual *" type="number" step="0.01" name="month_price" value={formData.month_price} onChange={handleInputChange} required placeholder="0.00" />
          <Input label="Precio Semanal *" type="number" step="0.01" name="week_price" value={formData.week_price} onChange={handleInputChange} required placeholder="0.00" />
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Configuración de Auto Check-in</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="auto_checkin_enabled"
            id="auto_checkin_enabled"
            checked={formData.auto_checkin_enabled}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
          />
          <label htmlFor="auto_checkin_enabled" className="text-text dark:text-text-dark font-medium text-sm">Habilitar Auto Check-in</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Radio de Geofence (metros)" type="number" name="geofence_radius_meters" value={formData.geofence_radius_meters} onChange={handleInputChange} placeholder="150" />
          <Input label="Tiempo Mínimo de Estadía (minutos)" type="number" name="min_stay_minutes" value={formData.min_stay_minutes} onChange={handleInputChange} placeholder="10" />
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Opciones Adicionales</h3>
        <Input label="URL de Foto" type="url" name="photo_url" value={formData.photo_url} onChange={handleInputChange} placeholder="https://ejemplo.com/foto.jpg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="verified" id="verified" checked={formData.verified} onChange={handleInputChange} className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary" />
            <label htmlFor="verified" className="text-text dark:text-text-dark font-medium text-sm">Verificado</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="featured" id="featured" checked={formData.featured} onChange={handleInputChange} className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary" />
            <label htmlFor="featured" className="text-text dark:text-text-dark font-medium text-sm">Destacado</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : gym ? 'Actualizar Gimnasio' : 'Crear Gimnasio'}
        </Button>
      </div>
    </form>
  );
};
