import type { ViewStyle } from 'react-native';

import type { LatLng, Region } from '@features/gyms/presentation/types';

export const WEB_FALLBACK_STYLE: ViewStyle = {
  width: '100%',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#ddd',
  overflow: 'hidden',
  justifyContent: 'center',
  alignItems: 'center',
};

export const MAP_STYLE: ViewStyle = {
  width: '100%',
  borderRadius: 12,
  overflow: 'hidden',
};

export const DEBUG_BADGE_STYLE: ViewStyle = {
  backgroundColor: '#fff',
  padding: 6,
  borderRadius: 6,
};

export const USER_PIN_SIZE = 30;
export const USER_PIN_PULSE_DURATION = 900;
export const USER_FOCUS_DURATION = 450;
export const USER_UPDATE_DURATION = 500;

export const createRegion = ({ latitude, longitude }: LatLng, delta: number): Region => ({
  latitude,
  longitude,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

export const USER_PIN_SOURCE = (() => {
  try {
    return require('../../../../assets/icons/gym.svg');
  } catch {
    return undefined;
  }
})();
