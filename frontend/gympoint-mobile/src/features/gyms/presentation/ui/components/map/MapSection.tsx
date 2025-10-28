import { ActivityIndicator, View, Text } from 'react-native';

import { Card as BaseCard } from '@shared/components/ui';
import { GymListItem } from '../list/GymListItem';
import { useTheme } from '@shared/hooks';

import { LOCATION_FALLBACK_MESSAGE } from '@features/gyms/domain/constants/map';
import { GymLite, LatLng, MapLocation, Region } from '@features/gyms/presentation/types';
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
  moreList?: GymLite[];
  mapHeight?: number;
  showUserFallbackPin?: boolean;
  onGymPress?: (gymId: string | number) => void;
};


const formatDistance = (distance?: number) =>
  typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : '—';

const noop = () => {};

export default function MapSection({
  initialRegion,
  mapLocations,
  userLocation,
  loading,
  error,
  locError,
  moreList = [],
  mapHeight,
  showUserFallbackPin = false,
  onGymPress,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const computedHeight = getMapHeight(mapHeight);
  const hasMoreGyms = moreList.length > 0;
  const hasLocationError = Boolean(error || locError);
  const errorMessage = locError ?? LOCATION_FALLBACK_MESSAGE;

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

      {hasMoreGyms && (
        <BaseCard padding="none" className={`mx-4 mt-4 overflow-hidden ${isDark ? 'bg-gray-900/50' : 'bg-white'}`}>
          <View className="px-4 pt-4">
            <Text className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>
              Más cercanos
            </Text>
          </View>

          {moreList.map(({ id, name, distancia, hours, address }, index) => (
            <GymListItem
              key={String(id)}
              id={id}
              name={name}
              distancia={distancia}
              hours={hours}
              address={address}
              index={index}
              onPress={onGymPress || noop}
            />
          ))}
        </BaseCard>
      )}
    </>
  );
}
