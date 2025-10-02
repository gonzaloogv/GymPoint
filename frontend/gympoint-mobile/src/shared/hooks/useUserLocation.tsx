// src/shared/hooks/useUserLocation.ts
import * as React from 'react';
import * as Location from 'expo-location';

type LatLng = { latitude: number; longitude: number };

export function useUserLocation() {
  const [userLocation, setUserLocation] = React.useState<LatLng | undefined>();
  const [error, setError] = React.useState<string | null>(null);
  const subscriptionRef = React.useRef<Location.LocationSubscription | null>(null);

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

      // 3) watch continuo
      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced, // o High si querés
            timeInterval: 2000,
            distanceInterval: 5,
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
  }, []);

  return { userLocation, error };
}
