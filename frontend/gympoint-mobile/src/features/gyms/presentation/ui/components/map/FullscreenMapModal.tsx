import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

import MapView from '../../screens/MapView';
import type { LatLng, MapLocation, Region } from '@features/gyms/presentation/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialRegion: Region;
  mapLocations: MapLocation[];
  userLocation?: LatLng;
  showUserFallbackPin?: boolean;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Modal que muestra el mapa en pantalla completa
 * - Ocupa toda la pantalla
 * - Tiene un botón de cerrar en la esquina superior derecha
 * - No muestra lista de gimnasios ni texto contador
 * - Se cierra con animación slide
 */
export default function FullscreenMapModal({
  visible,
  onClose,
  initialRegion,
  mapLocations,
  userLocation,
  showUserFallbackPin = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Mapa a pantalla completa */}
        <View style={styles.mapContainer}>
          <MapView
            initialRegion={initialRegion}
            locations={mapLocations}
            userLocation={userLocation}
            animateToUserOnChange
            zoomDelta={0.01}
            showUserFallbackPin={showUserFallbackPin}
            style={{ height: SCREEN_HEIGHT }}
            debugUser
          />
        </View>

        {/* Botón de volver */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.75}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(229, 231, 235, 0.8)',
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#F9FAFB' : '#111827'}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
