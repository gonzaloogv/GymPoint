import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useTheme } from '../../hooks';

interface LocationInputProps {
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (data: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => void;
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const LocationInput: React.FC<LocationInputProps> = ({
  address,
  city,
  latitude,
  longitude,
  onLocationChange,
}) => {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const geocoder = useRef<MapboxGeocoder | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const getAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es&country=ar`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const result = data.features[0];
        const cityContext = result.context?.find((c: any) => 
          c.id.includes('place') || c.id.includes('locality')
        );
        
        return {
          address: result.place_name,
          city: cityContext?.text || city,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  const createMarker = (lng: number, lat: number, addDragHandler: boolean = true) => {
    if (marker.current) {
      marker.current.remove();
    }

    marker.current = new mapboxgl.Marker({ 
      color: '#4F9CF9',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    if (addDragHandler) {
      marker.current.on('drag', () => {
        const lngLat = marker.current!.getLngLat();
        
        const bounds = map.current!.getBounds();
        
        const restrictedLng = Math.max(bounds!.getWest(), Math.min(lngLat.lng, bounds!.getEast()));
        const restrictedLat = Math.max(bounds!.getSouth(), Math.min(lngLat.lat, bounds!.getNorth()));
        
        if (restrictedLng !== lngLat.lng || restrictedLat !== lngLat.lat) {
          marker.current!.setLngLat([restrictedLng, restrictedLat]);
        }
      });

      marker.current.on('dragend', async () => {
        const lngLat = marker.current!.getLngLat();
        const addressData = await getAddressFromCoordinates(lngLat.lng, lngLat.lat);
        
        if (addressData) {
          onLocationChange({
            address: addressData.address,
            city: addressData.city,
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          });
        }
      });
    }
  };

  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;

    createMarker(lng, lat);

    const addressData = await getAddressFromCoordinates(lng, lat);
    
    if (addressData) {
      onLocationChange({
        address: addressData.address,
        city: addressData.city,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        console.log('Ubicación obtenida:', { lat, lng });

        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 2000,
          });
        }

        createMarker(lng, lat);

        const addressData = await getAddressFromCoordinates(lng, lat);
        if (addressData) {
          onLocationChange({
            address: addressData.address,
            city: addressData.city,
            latitude: lat,
            longitude: lng,
          });
        } else {
          setLocationError('No se pudo obtener la dirección de tu ubicación');
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        let errorMessage = 'No se pudo obtener tu ubicación. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permiso denegado. Habilita la ubicación en la configuración de tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage += 'La solicitud expiró. Intenta nuevamente.';
            break;
          default:
            errorMessage += 'Error desconocido.';
        }
        
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, 
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: theme === 'light' 
        ? 'mapbox://styles/mapbox/streets-v12' 
        : 'mapbox://styles/mapbox/dark-v11',
      center: longitude && latitude ? [longitude, latitude] : [-60.6393, -32.9468],
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    geocoder.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl: mapboxgl as any,
      placeholder: 'Buscar dirección del gimnasio...',
      countries: 'ar',
      language: 'es',
      marker: false,
    });

    map.current.addControl(geocoder.current as any);

    geocoder.current.on('result', (e: any) => {
      const result = e.result;
      const coords = result.geometry.coordinates;
      
      const cityContext = result.context?.find((c: any) => 
        c.id.includes('place') || c.id.includes('locality')
      );
      const extractedCity = cityContext?.text || city;

      createMarker(coords[0], coords[1]);

      onLocationChange({
        address: result.place_name,
        city: extractedCity,
        latitude: coords[1],
        longitude: coords[0],
      });
    });

    if (latitude && longitude) {
      createMarker(longitude, latitude);
    }

    map.current.on('click', handleMapClick);

    map.current.on('zoom', () => {
      if (marker.current && latitude && longitude) {
        const markerLngLat = marker.current.getLngLat();
        const bounds = map.current!.getBounds();
        
        if (!bounds!.contains(markerLngLat)) {
          map.current!.panTo(markerLngLat);
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const newStyle = theme === 'light' 
      ? 'mapbox://styles/mapbox/streets-v12' 
      : 'mapbox://styles/mapbox/dark-v11';

    const center = map.current.getCenter();
    const zoom = map.current.getZoom();

    map.current.setStyle(newStyle);

    map.current.once('styledata', () => {
      map.current!.setCenter(center);
      map.current!.setZoom(zoom);

      if (latitude && longitude) {
        createMarker(longitude, latitude);
      }
    });
  }, [theme]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loadingLocation}
        className={`
          w-full py-2.5 px-4 rounded-lg font-medium transition-colors
          ${loadingLocation
            ? 'bg-gray-400 cursor-not-allowed'
            : theme === 'light'
              ? 'bg-secondary text-white hover:bg-button-hover'
              : 'bg-secondary text-white hover:bg-button-hover'
          }
        `}
      >
        {loadingLocation ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Obteniendo ubicación...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            📍 Usar mi ubicación actual
          </span>
        )}
      </button>

      {locationError && (
        <div className={`p-4 rounded-lg ${
          theme === 'light' 
            ? 'bg-red-50 border border-red-300' 
            : 'bg-red-900/30 border border-red-700'
        }`}>
          <p className={`text-sm ${
            theme === 'light' ? 'text-red-900' : 'text-red-200'
          }`}>
            ⚠️ {locationError}
          </p>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className={`w-full h-96 rounded-lg border-2 overflow-hidden ${
          theme === 'light' ? 'border-gray-300' : 'border-gray-600'
        }`}
        style={{ position: 'relative' }}
      />

      {address && (
        <div className={`p-4 rounded-lg ${
          theme === 'light' 
            ? 'bg-green-50 border border-green-300' 
            : 'bg-green-900/30 border border-green-700'
        }`}>
          <p className={`text-sm font-semibold mb-1 ${
            theme === 'light' ? 'text-green-900' : 'text-green-200'
          }`}>
            ✓ Ubicación seleccionada:
          </p>
          <p className={`text-sm ${
            theme === 'light' ? 'text-green-800' : 'text-green-300'
          }`}>
            <strong>Dirección:</strong> {address}
          </p>
          <p className={`text-sm ${
            theme === 'light' ? 'text-green-800' : 'text-green-300'
          }`}>
            <strong>Ciudad:</strong> {city}
          </p>
          <p className={`text-xs mt-2 ${
            theme === 'light' ? 'text-green-700' : 'text-green-400'
          }`}>
            Coordenadas: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          </p>
        </div>
      )}

      <div className={`p-4 rounded-lg ${
        theme === 'light' 
          ? 'bg-blue-50 border border-blue-300' 
          : 'bg-blue-900/30 border border-blue-700'
      }`}>
        <p className={`text-sm ${
          theme === 'light' ? 'text-blue-900' : 'text-blue-200'
        }`}>
          💡 <strong>3 formas de seleccionar ubicación:</strong>
        </p>
        <ul className={`text-sm mt-2 space-y-1 list-disc list-inside ${
          theme === 'light' ? 'text-blue-800' : 'text-blue-300'
        }`}>
          <li>Usa el botón "Usar mi ubicación actual" para detectar tu posición</li>
          <li>Busca la dirección en el buscador del mapa</li>
          <li>Haz click directamente en el mapa o arrastra el marcador azul (se mantiene dentro del mapa)</li>
        </ul>
      </div>
    </div>
  );
};