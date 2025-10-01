import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, Text, View } from 'react-native';

import type { LatLng, MapLocation, Region } from '@features/gyms/types';

import { WEB_FALLBACK_STYLE } from './mapViewConfig';

type Props = {
  initialRegion: Region;
  locations: MapLocation[];
  style?: StyleProp<ViewStyle>;
  userLocation?: LatLng;
  animateToUserOnChange?: boolean;
  zoomDelta?: number;
  showUserFallbackPin?: boolean;
  mapHeight?: number;
  debugUser?: boolean;
};

export default function MapView({
  style,
  mapHeight = 360,
}: Props) {
  return (
    <View style={[WEB_FALLBACK_STYLE, { height: mapHeight }, style]}>
      <Text accessibilityRole="text" testID="map-fallback-text">
        {Platform.select({
          web: 'Mapa no disponible en Web con react-native-maps',
          default: 'Mapa no disponible',
        })}
      </Text>
    </View>
  );
}