import { Dimensions } from 'react-native';

import { MAP_MAX_HEIGHT, MAP_MIN_HEIGHT, MAP_VIEWPORT_RATIO } from '../constants';

export const getMapHeight = (customHeight?: number) => {
  if (typeof customHeight === 'number') {
    return customHeight;
  }

  const screenHeight = Dimensions.get('window').height;
  const desiredHeight = Math.round(screenHeight * MAP_VIEWPORT_RATIO);

  return Math.min(MAP_MAX_HEIGHT, Math.max(MAP_MIN_HEIGHT, desiredHeight));
};
