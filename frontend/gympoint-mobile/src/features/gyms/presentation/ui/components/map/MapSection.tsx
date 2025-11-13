import { ActivityIndicator, View, Text } from 'react-native';

import { useTheme } from '@shared/hooks';

import { LOCATION_FALLBACK_MESSAGE } from '@features/gyms/domain/constants/map';
import { LatLng, MapLocation, Region } from '@features/gyms/presentation/types';
import { getMapHeight } from '@features/gyms/presentation/utils/layout';

import MapView from '../../screens/MapView';
import { MapBox } from '@shared/components/ui/MapBox';

type Props = {
  initialRegion: Region;
  mapLocations: MapLocation[];
  userLocation?: LatLng;
  loading?: boolean;
  error?: unknown;
  locError?: string | null;
  mapHeight?: number;
  showUserFallbackPin?: boolean;
};

export default function MapSection({
  initialRegion,
  mapLocations,
  userLocation,
  loading,
  error,
  locError,
  mapHeight,
  showUserFallbackPin = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const computedHeight = getMapHeight(mapHeight);
  const hasLocationError = Boolean(error || locError);
  const errorMessage = locError ?? LOCATION_FALLBACK_MESSAGE;

  // Debug logging
  console.log('[MapSection] 🗺️ MapSection rendered with:', {
    initialRegion,
    mapLocationsCount: mapLocations.length,
    mapLocationsSamples: mapLocations.slice(0, 3),
    userLocation,
    loading,
    hasError: Boolean(error),
    locError,
  });

  return (
    <>
      <MapBox style={{ height: computedHeight }}>
        <MapView
          initialRegion={initialRegion}
          locations={mapLocations}
          userLocation={userLocation}
          animateToUserOnChange
          zoomDelta={0.01}
          showUserFallbackPin={showUserFallbackPin}
          style={{ height: computedHeight }}
          debugUser
        />

        {loading && (
          <ActivityIndicator 
            className="absolute top-1.5 right-1.5" 
            color={isDark ? '#fff' : '#000'}
          />
        )}

        {hasLocationError && (
          <View className={`absolute top-1.5 left-1.5 px-1.5 py-1.5 rounded-lg ${
            isDark ? 'bg-surfaceOverlay-dark' : 'bg-surfaceOverlay'
          }`}>
            <Text className={isDark ? 'text-textPrimary-dark text-sm' : 'text-textPrimary text-sm'}>
              {errorMessage}
            </Text>
          </View>
        )}
      </MapBox>
    </>
  );
}
