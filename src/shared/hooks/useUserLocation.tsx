// src/shared/hooks/useUserLocation.ts
import * as React from 'react';
import * as Location from 'expo-location';

type LatLng = { latitude: number; longitude: number };

export function useUserLocation() {
  const [userLocation, setUserLocation] = React.useState<LatLng | undefined>();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      // 1) permisos
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      // 2) servicios activos (GPS)
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        setError('Servicios de ubicación desactivados');
        return;
      }

      // 3) watch continuo
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // o High si querés
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();

    return () => { sub?.remove?.(); };
  }, []);

  return { userLocation, error };
}
