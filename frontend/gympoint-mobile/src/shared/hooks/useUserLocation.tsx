// src/shared/hooks/useUserLocation.ts
import * as React from 'react';
import * as Location from 'expo-location';

type LatLng = { latitude: number; longitude: number };

interface UseUserLocationOptions {
  /**
   * Distancia mínima en metros para actualizar la ubicación
   * @default 50 (antes era 5, ahora menos updates)
   */
  distanceInterval?: number;
  /**
   * Tiempo mínimo en ms entre actualizaciones
   * @default 5000 (antes era 2000, ahora menos updates)
   */
  timeInterval?: number;
  /**
   * Precisión del GPS
   * @default Location.Accuracy.Balanced
   */
  accuracy?: Location.Accuracy;
}

/**
 * Hook optimizado para obtener ubicación del usuario
 * Por defecto actualiza cada 50 metros o 5 segundos (el que ocurra primero)
 * Esto reduce significativamente los re-renders
 */
export function useUserLocation(options: UseUserLocationOptions = {}) {
  const {
    distanceInterval = 50, // Aumentado de 5m a 50m para menos updates
    timeInterval = 5000,    // Aumentado de 2s a 5s para menos updates
    accuracy = Location.Accuracy.Balanced,
  } = options;

  const [userLocation, setUserLocation] = React.useState<LatLng | undefined>();
  const [error, setError] = React.useState<string | null>(null);
  const subscriptionRef = React.useRef<Location.LocationSubscription | null>(null);

  // Memoizar el objeto de ubicación para evitar re-renders si lat/lng no cambian significativamente
  const memoizedLocation = React.useMemo(() => {
    if (!userLocation) return undefined;

    // Redondear a 5 decimales (~1 metro de precisión)
    // Esto evita updates por cambios insignificantes en GPS
    return {
      latitude: Number(userLocation.latitude.toFixed(5)),
      longitude: Number(userLocation.longitude.toFixed(5)),
    };
  }, [userLocation?.latitude, userLocation?.longitude]);

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      // 1) permisos
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        if (isMounted) {
          setError('Permiso de ubicación denegado');
        }
        return;
      }

      // 2) servicios activos (GPS)
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        if (isMounted) {
          setError('Servicios de ubicación desactivados');
        }
        return;
      }

      // 3) watch continuo con configuración optimizada
      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy,
            timeInterval,
            distanceInterval,
          },
          (loc) => {
            if (isMounted) {
              setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          },
        );
        subscriptionRef.current = subscription;
      } catch (err) {
        if (isMounted) {
          setError('Error al obtener ubicación');
          console.error('Error en watchPositionAsync:', err);
        }
      }
    })();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [distanceInterval, timeInterval, accuracy]);

  return { userLocation: memoizedLocation, error };
}

/**
 * Hook para obtener ubicación de alta precisión
 * Útil para navegación o tracking exacto
 * ⚠️ Consume más batería y causa más re-renders
 */
export function useUserLocationHighPrecision() {
  return useUserLocation({
    distanceInterval: 10,
    timeInterval: 2000,
    accuracy: Location.Accuracy.High,
  });
}

/**
 * Hook para obtener ubicación de baja frecuencia
 * Útil para mostrar ciudad/región aproximada
 * ✅ Mejor para batería y performance
 */
export function useUserLocationLowFrequency() {
  return useUserLocation({
    distanceInterval: 200, // 200 metros
    timeInterval: 30000,   // 30 segundos
    accuracy: Location.Accuracy.Low,
  });
}
