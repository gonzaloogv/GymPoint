import { useState, useEffect } from 'react';
import { CreateGymDTO, UpdateGymDTO, Gym, COMMON_AMENITIES } from '@/domain';

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

  // Función para extraer datos de URL de Google Maps
  const extractFromGoogleMaps = async (url: string) => {
    try {
      setIsExtractingFromMaps(true);
      
      // Patrones para extraer coordenadas de diferentes formatos de URLs de Google Maps
      // Formato 1: https://www.google.com/maps/place/.../@-27.4511,-58.9867,17z/...
      // Formato 2: https://maps.google.com/?q=-27.4511,-58.9867
      // Formato 3: https://www.google.com/maps/@-27.4511,-58.9867,17z
      // Formato 4: https://maps.app.goo.gl/... (shortened URL)
      
      let latitude = 0;
      let longitude = 0;
      let placeName = '';
      let placeAddress = '';

      // Intentar extraer coordenadas del formato @lat,lng
      const coordPattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match1 = url.match(coordPattern1);
      
      if (match1) {
        latitude = parseFloat(match1[1]);
        longitude = parseFloat(match1[2]);
      } else {
        // Intentar extraer del formato ?q=lat,lng
        const coordPattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match2 = url.match(coordPattern2);
        
        if (match2) {
          latitude = parseFloat(match2[1]);
          longitude = parseFloat(match2[2]);
        }
      }

      // Intentar extraer nombre del lugar del formato /place/Nombre+Del+Lugar/
      const placePattern = /\/place\/([^/@]+)/;
      const placeMatch = url.match(placePattern);
      
      if (placeMatch) {
        placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }

      // Si encontramos coordenadas, actualizar el formulario
      if (latitude !== 0 && longitude !== 0) {
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          google_maps_url: url,
          ...(placeName && !prev.name ? { name: placeName } : {}),
        }));

        // Intentar obtener más información usando Reverse Geocoding de Google Maps
        // Nota: Esto requiere una API key de Google Maps
        // Por ahora, solo extraemos lo que podemos de la URL
        
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

  // Detectar cuando se pega o cambia la URL de Google Maps
  const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, google_maps_url: url }));
    
    // Si la URL parece válida de Google Maps, intentar extraer datos
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

      // Cargar amenidades si existen
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
    <form onSubmit={handleSubmit} className="gym-form">
      <div className="form-section">
        <h3>Información Básica</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ej: Gimnasio Central"
            />
          </div>

          <div className="form-group">
            <label>Ciudad *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              placeholder="Ej: Resistencia"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            placeholder="Describe el gimnasio..."
          />
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="Ej: Av. Sarmiento 1234"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Ubicación</h3>
        
        <div className="form-group">
          <label>🗺️ URL de Google Maps {isExtractingFromMaps && '(Extrayendo datos...)'}</label>
          <input
            type="url"
            name="google_maps_url"
            value={formData.google_maps_url}
            onChange={handleGoogleMapsUrlChange}
            placeholder="Pega aquí la URL de Google Maps para autocompletar coordenadas..."
            disabled={isExtractingFromMaps}
          />
          <small>
            💡 Pega una URL de Google Maps y se extraerán automáticamente las coordenadas, nombre y más datos.
            <br />
            Ejemplo: https://www.google.com/maps/place/Gimnasio/@-27.4511,-58.9867,17z
          </small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Latitud *</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              required
              placeholder="-27.4511"
            />
          </div>

          <div className="form-group">
            <label>Longitud *</label>
            <input
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
      </div>

      <div className="form-section">
        <h3>Contacto</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+54 362 1234567"
            />
          </div>

          <div className="form-group">
            <label>WhatsApp</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="+54 362 1234567"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="info@gimnasio.com"
            />
          </div>

          <div className="form-group">
            <label>Sitio Web</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://gimnasio.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              placeholder="@gimnasiocentral"
            />
          </div>

          <div className="form-group">
            <label>Facebook</label>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              placeholder="facebook.com/gimnasiocentral"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Características</h3>
        
        <div className="form-group">
          <label>Equipamiento * (separado por comas)</label>
          <input
            type="text"
            value={equipmentInput}
            onChange={handleEquipmentChange}
            required
            placeholder="Ej: Pesas, Máquinas, Cardio, Funcional"
          />
          <small>Ingrese los equipamientos separados por comas</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capacidad Máxima</label>
            <input
              type="number"
              name="max_capacity"
              value={formData.max_capacity || ''}
              onChange={handleInputChange}
              placeholder="Ej: 50"
            />
          </div>

          <div className="form-group">
            <label>Área (m²)</label>
            <input
              type="number"
              step="0.01"
              name="area_sqm"
              value={formData.area_sqm || ''}
              onChange={handleInputChange}
              placeholder="Ej: 200"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Amenidades ({selectedAmenities.length} seleccionadas)</label>
          <div className="amenities-grid">
            {COMMON_AMENITIES.map((amenity) => (
              <button
                key={amenity.name}
                type="button"
                className={`amenity-button ${selectedAmenities.includes(amenity.name) ? 'selected' : ''}`}
                onClick={() => toggleAmenity(amenity.name)}
              >
                <span className="amenity-icon">{amenity.icon}</span>
                <span className="amenity-name">{amenity.name}</span>
              </button>
            ))}
          </div>
          <small>💡 Las amenidades seleccionadas se mostrarán como información visual. El sistema no las guarda automáticamente en el backend.</small>
        </div>
      </div>

      <div className="form-section">
        <h3>Precios</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Precio Mensual *</label>
            <input
              type="number"
              step="0.01"
              name="month_price"
              value={formData.month_price}
              onChange={handleInputChange}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Precio Semanal *</label>
            <input
              type="number"
              step="0.01"
              name="week_price"
              value={formData.week_price}
              onChange={handleInputChange}
              required
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Configuración de Auto Check-in</h3>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="auto_checkin_enabled"
              checked={formData.auto_checkin_enabled}
              onChange={handleInputChange}
            />
            <span>Habilitar Auto Check-in</span>
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Radio de Geofence (metros)</label>
            <input
              type="number"
              name="geofence_radius_meters"
              value={formData.geofence_radius_meters}
              onChange={handleInputChange}
              placeholder="150"
            />
            <small>Distancia máxima para auto check-in</small>
          </div>

          <div className="form-group">
            <label>Tiempo Mínimo de Estadía (minutos)</label>
            <input
              type="number"
              name="min_stay_minutes"
              value={formData.min_stay_minutes}
              onChange={handleInputChange}
              placeholder="10"
            />
            <small>Tiempo mínimo para validar asistencia</small>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Opciones Adicionales</h3>
        
        <div className="form-group">
          <label>URL de Foto</label>
          <input
            type="url"
            name="photo_url"
            value={formData.photo_url}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleInputChange}
              />
              <span>Verificado</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              <span>Destacado</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : gym ? 'Actualizar Gimnasio' : 'Crear Gimnasio'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

