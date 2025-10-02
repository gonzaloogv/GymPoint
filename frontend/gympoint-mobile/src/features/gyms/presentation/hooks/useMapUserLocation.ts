import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng, Region } from '@features/gyms/presentation/types';

const USER_FOCUS_DURATION = 450;
const USER_UPDATE_DURATION = 500;

const createRegion = ({ latitude, longitude }: LatLng, delta: number): Region => ({
  latitude,
  longitude,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

type Props = {
  userLocation?: LatLng;
  animateToUserOnChange?: boolean;
  zoomDelta?: number;
};

export function useMapUserLocation({
  userLocation,
  animateToUserOnChange = true,
  zoomDelta = 0.01,
}: Props) {
  const mapRef = useRef<any>(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const focusUserRegion = useCallback(
    (duration: number) => {
      if (!mapRef.current || !userLocation) return;
      mapRef.current.animateToRegion(createRegion(userLocation, zoomDelta), duration);
    },
    [userLocation, zoomDelta],
  );

  const handleReady = useCallback(() => {
    if (!animateToUserOnChange) return;
    focusUserRegion(USER_FOCUS_DURATION);
  }, [animateToUserOnChange, focusUserRegion]);

  const handleUserMarkerLayout = useCallback(() => {
    requestAnimationFrame(() => setTracksViewChanges(false));
  }, []);

  useEffect(() => {
    if (!animateToUserOnChange || !userLocation) return;
    focusUserRegion(USER_UPDATE_DURATION);
  }, [animateToUserOnChange, userLocation, focusUserRegion]);

  const startRegion = userLocation
    ? createRegion(userLocation, zoomDelta)
    : undefined;

  return {
    mapRef,
    startRegion,
    tracksViewChanges,
    handleReady,
    handleUserMarkerLayout,
  };
}
