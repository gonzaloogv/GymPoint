import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, Text, View } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

import type { LatLng, MapLocation, Region } from '@features/gyms/presentation/types';
import { palette } from '@shared/styles';

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

const FallbackContainer = styled(View)`
  width: 100%;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${palette.borderSubtle};
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: ${palette.surfaceMuted};
  position: relative;
`;

const ContentContainer = styled(View)`
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
`;

const IconContainer = styled(View)`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${palette.infoSurface};
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${palette.infoBorder};
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: ${palette.textStrong};
  text-align: center;
`;

const Description = styled(Text)`
  font-size: 14px;
  color: ${palette.textMuted};
  text-align: center;
  line-height: 20px;
  max-width: 280px;
`;

const SuggestionText = styled(Text)`
  font-size: 12px;
  color: ${palette.slate500};
  text-align: center;
  font-style: italic;
  margin-top: 8px;
`;

export default function MapView({ style, mapHeight = 360 }: Props) {
  return (
    <FallbackContainer style={[{ height: mapHeight }, style]}>
      <ContentContainer>
        <IconContainer>
          <Feather name="map-pin" size={28} color={palette.info} />
        </IconContainer>

        <Title>Mapa no disponible en Web</Title>

        <Description>
          Los mapas interactivos no están disponibles en la versión web de la aplicación.
          Para una experiencia completa con mapas, descarga la aplicación móvil.
        </Description>

        <SuggestionText>
          Usa la vista de lista para explorar los gimnasios disponibles
        </SuggestionText>
      </ContentContainer>
    </FallbackContainer>
  );
}
