// src/shared/hooks/useUserLocation.ts
import * as Location from 'expo-location';
import React from 'react';

export function useUserLocation() {
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { if (mounted) setError('Permiso de ubicación denegado'); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (mounted) setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {
        if (mounted) setError('Ubicación no disponible');
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { userLocation, error };
}
