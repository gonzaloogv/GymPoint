import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { LatLng, MapLocation, Region } from '@features/gyms/presentation/types';
import { useTheme } from '@shared/hooks';

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


export default function MapView({ style, mapHeight = 360 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View 
      className={`w-full rounded-xl border overflow-hidden justify-center items-center relative ${
        isDark 
          ? 'border-borderSubtle-dark bg-surfaceMuted-dark' 
          : 'border-borderSubtle bg-surfaceMuted'
      }`}
      style={[{ height: mapHeight }, style]}
    >
      <View className="items-center justify-center p-6 gap-4">
        <View className={`w-16 h-16 rounded-full items-center justify-center border ${
          isDark 
            ? 'bg-infoSurface-dark border-infoBorder-dark' 
            : 'bg-infoSurface border-infoBorder'
        }`}>
          <Feather name="map-pin" size={28} color={isDark ? '#3B82F6' : '#2563EB'} />
        </View>

        <Text className={`text-lg font-semibold text-center ${
          isDark ? 'text-textStrong-dark' : 'text-textStrong'
        }`}>
          Mapa no disponible en Web
        </Text>

        <Text className={`text-sm text-center leading-5 max-w-70 ${
          isDark ? 'text-textMuted-dark' : 'text-textMuted'
        }`}>
          Los mapas interactivos no están disponibles en la versión web de la aplicación.
          Para una experiencia completa con mapas, descarga la aplicación móvil.
        </Text>

        <Text className={`text-xs text-center italic mt-2 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Usa la vista de lista para explorar los gimnasios disponibles
        </Text>
      </View>
    </View>
  );
}
