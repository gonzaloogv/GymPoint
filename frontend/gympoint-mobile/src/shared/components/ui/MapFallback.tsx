import React from 'react';
import { Platform, Text, View } from 'react-native';
import { WEB_FALLBACK_STYLE } from '@features/gyms/presentation/ui/screens/mapViewConfig';

type Props = {
  mapHeight?: number;
  style?: any;
};

export function MapFallback({ mapHeight = 360, style }: Props) {
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
