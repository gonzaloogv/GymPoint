import React from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import styled from 'styled-components/native';

import { MapBox, ListItem, IndexBadge } from '@shared/components/ui';
import GymsMap from '../GymsMap';

type LatLng = { latitude: number; longitude: number };
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
type MapLocation = { id: string; title: string; coordinate: LatLng };

export type GymLite = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  hours?: string;
};

type Props = {
  initialRegion: Region;
  mapLocations: MapLocation[];
  userLocation?: LatLng;
  loading?: boolean;
  error?: unknown;
  locError?: string | null;

  /** ✅ lista para el bloque “Más cercanos” debajo del mapa */
  moreList?: GymLite[];

  /** 🔹 NUEVO: permitir setear la altura del mapa desde arriba (opcional) */
  mapHeight?: number;

  /** 🔹 NUEVO: mostrar un pin fallback del usuario si el dot nativo no aparece */
  showUserFallbackPin?: boolean;
};

const Card = styled.View`
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  border-radius: 14px;
  margin: 16px;
  overflow: hidden;
`;

const CardHeader = styled.View`
  padding: 12px 16px 0 16px;
`;

const CardTitle = styled.Text`
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
`;

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
  // Altura responsive por defecto (~50% de pantalla, clamped)
  const screenH = Dimensions.get('window').height;
  const computedHeight = mapHeight ?? Math.min(520, Math.max(320, Math.round(screenH * 0.5)));

  return (
    <>
      {/* Aplicamos altura al contenedor y al mapa para evitar recortes */}
      <MapBox style={{ height: computedHeight }}>
        <GymsMap
          initialRegion={initialRegion}
          locations={mapLocations}
          userLocation={userLocation}
          animateToUserOnChange
          zoomDelta={0.01}
          showUserFallbackPin={showUserFallbackPin}
          // altura del mapa por style
          style={{ height: computedHeight }}
          debugUser
        />

        {loading && (
          <ActivityIndicator style={{ position: 'absolute', top: 12, right: 12 }} />
        )}

        {(error || locError) && (
          <Text
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#fff8',
              padding: 6,
              borderRadius: 8,
            }}
          >
            {locError ? locError : 'Sin conexión / usando datos locales'}
          </Text>
        )}
      </MapBox>

      {/* ✅ Más cercanos debajo del mapa */}
      {Array.isArray(moreList) && moreList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Más cercanos</CardTitle>
          </CardHeader>

          <View>
            {moreList.map((g, idx) => (
              <ListItem
                key={String(g.id)}
                onPress={() => {}}
                Left={<IndexBadge n={idx + 1} />}
                Right={<Text style={{ color: '#9ca3af' }}>{'>'}</Text>}
              >
                <Text style={{ fontWeight: '600' }}>{g.name}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>
                  {typeof g.distancia === 'number'
                    ? `${(g.distancia / 1000).toFixed(1)} km`
                    : '—'}{' '}
                  • {g.hours ?? '—'}
                </Text>
                {!!g.address && (
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>{g.address}</Text>
                )}
              </ListItem>
            ))}
          </View>
        </Card>
      )}
    </>
  );
}
