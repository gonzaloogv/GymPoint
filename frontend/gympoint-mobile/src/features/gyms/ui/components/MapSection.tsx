import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import {
  Card as BaseCard,
  CardMeta,
  CardTitle as BaseCardTitle,
  IndexBadge,
  ListItem,
  MapBox,
  Subtle,
} from '@shared/components/ui';
import { palette, rad, sp } from '@shared/styles';

import { LOCATION_FALLBACK_MESSAGE } from '@features/gyms/constants';
import { GymLite, LatLng, MapLocation, Region } from '@features/gyms/types';
import { getMapHeight } from '@features/gyms/utils/layout';

import MapView from '../MapView';

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
};

const SectionCard = styled(BaseCard)`
  margin: ${({ theme }) => sp(theme, 2)}px;
  padding: 0;
  overflow: hidden;
  elevation: 0;
`;

const SectionHeader = styled.View`
  padding: ${({ theme }) => `${sp(theme, 1.5)}px ${sp(theme, 2)}px 0`};
`;

const LoadingIndicator = styled(ActivityIndicator)`
  position: absolute;
  top: ${({ theme }) => sp(theme, 1.5)}px;
  right: ${({ theme }) => sp(theme, 1.5)}px;
`;

const ErrorBanner = styled(Subtle)`
  position: absolute;
  top: ${({ theme }) => sp(theme, 1.5)}px;
  left: ${({ theme }) => sp(theme, 1.5)}px;
  padding: ${({ theme }) => sp(theme, 0.75)}px;
  background-color: ${palette.surfaceOverlay};
  border-radius: ${({ theme }) => rad(theme, 'overlay', 8)}px;
`;

const Accessory = styled(CardMeta)`
  color: ${palette.slate400};
`;

const ItemTitle = styled(BaseCardTitle)`
  margin-bottom: ${({ theme }) => sp(theme, 0.5)}px;
`;

const Meta = styled(CardMeta)`
  color: ${palette.slate500};
`;

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
}: Props) {
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

        {loading && <LoadingIndicator />}

        {hasLocationError && <ErrorBanner>{errorMessage}</ErrorBanner>}
      </MapBox>

      {hasMoreGyms && (
        <SectionCard>
          <SectionHeader>
            <BaseCardTitle>Más cercanos</BaseCardTitle>
          </SectionHeader>

          {moreList.map(({ id, name, distancia, hours, address }, index) => (
            <ListItem
              key={String(id)}
              onPress={noop}
              Left={<IndexBadge n={index + 1} />}
              Right={<Accessory>{'>'}</Accessory>}
            >
              <ItemTitle>{name}</ItemTitle>
              <Meta>
                {formatDistance(distancia)} • {hours ?? '—'}
              </Meta>
              {address ? <Meta>{address}</Meta> : null}
            </ListItem>
          ))}
        </SectionCard>
      )}
    </>
  );
}
