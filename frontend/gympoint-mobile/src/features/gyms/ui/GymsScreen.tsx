import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Input } from '../../../shared/components/ui/Input';
import GymsMap from './GymsMap';
import * as Location from 'expo-location';

import DumbbellImg from '../../../../assets/dumbbell.png';
import CrownImg from '../../../../assets/crown.png';
import UsersImg from '../../../../assets/users.png';

import { useNearbyGyms } from '../hooks/useNearbyGyms';

// helpers theme
const sp = (theme: any, n: number) =>
  typeof theme?.spacing === 'function'
    ? theme.spacing(n)
    : typeof theme?.spacing === 'number'
    ? theme.spacing * n
    : theme?.spacing?.[n] ?? n * 8;
const rad = (theme: any, key: string, fallback = 12) =>
  typeof theme?.radius === 'number' ? theme.radius : theme?.radius?.[key] ?? fallback;
const font = (theme: any, key: string, fallback = 14) =>
  typeof theme?.typography?.[key] === 'number' ? theme.typography[key] : fallback;

// styled
const ScreenContainer = styled(SafeAreaView)`flex:1;background-color:${({theme})=>theme?.colors?.bg ?? '#fff'};`;
const HeaderContainer = styled(View)`padding:${({theme})=>sp(theme,2)}px;align-items:center;justify-content:center;`;
const Logo = styled(Image).attrs({ resizeMode: 'contain' })`width:150px;height:40px;`;
const SearchBarContainer = styled(View)`padding:0 ${({theme})=>sp(theme,2)}px;margin-bottom:${({theme})=>sp(theme,2)}px;`;
const MapBox = styled(View)`margin:0 ${({theme})=>sp(theme,2)}px;border-radius:${({theme})=>rad(theme,'md',12)}px;overflow:hidden;`;
const ButtonsGrid = styled(View)`flex-direction:row;flex-wrap:wrap;justify-content:space-around;padding:${({theme})=>sp(theme,2)}px;`;
const FeatureButton = styled(TouchableOpacity)`
  width:45%;height:45vw;max-height:180px;background-color:${({theme})=>theme?.colors?.card ?? '#f5f5f5'};
  border-radius:${({theme})=>rad(theme,'md',12)}px;justify-content:center;align-items:center;
  margin-bottom:${({theme})=>sp(theme,2)}px;border-width:1px;border-color:${({theme})=>theme?.colors?.border ?? '#ddd'};
`;
const ButtonIcon = styled(Image)`width:60px;height:60px;margin-bottom:${({theme})=>sp(theme,1)}px;`;
const ButtonText = styled(Text)`font-size:${({theme})=>font(theme,'small',14)}px;color:${({theme})=>theme?.colors?.text ?? '#111'};text-align:center;`;

export default function GymsScreen() {
  const [searchText, setSearchText] = React.useState('');
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [locError, setLocError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { if (mounted) setLocError('Permiso de ubicación denegado'); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (mounted) { setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }); setLocError(null); }
      } catch (e: any) {
        if (mounted) setLocError('Ubicación no disponible');
        console.log('Location error:', e?.code, e?.message);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;
  const { data, loading, error } = useNearbyGyms(lat, lng, 100000); // 10km para probar

  const initialRegion = React.useMemo(() => ({
    latitude: lat ?? -27.4482833,
    longitude: lng ?? -58.9875387,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [lat, lng]);

  const apiLocations = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const sorted = [...data].sort((a: any, b: any) => {
      const da = typeof a?.distancia === 'number' ? a.distancia : Number.POSITIVE_INFINITY;
      const db = typeof b?.distancia === 'number' ? b.distancia : Number.POSITIVE_INFINITY;
      return da - db;
    });
    return sorted.map((g: any) => ({
      id: String(g.id),
      title: g.name,
      coordinate: { latitude: g.lat, longitude: g.lng },
    }));
  }, [data]);

  const locationsWithUser = React.useMemo(() => {
    const gyms = apiLocations ?? [];
    return lat && lng
      ? [...gyms, { id: 'user', title: 'Tu ubicación', coordinate: { latitude: lat, longitude: lng } }]
      : gyms;
  }, [apiLocations, lat, lng]);

  // Fallback visual si no hay datos aún
  const mockLocations = React.useMemo(() => [
    { id: '1', title: 'FITNIX', coordinate: { latitude: -34.598, longitude: -58.385 } },
    { id: '2', title: 'PANTHER GYM', coordinate: { latitude: -34.595, longitude: -58.375 } },
    { id: '3', title: 'Active Life PILATES', coordinate: { latitude: -34.605, longitude: -58.378 } },
    { id: '4', title: 'GreyFit', coordinate: { latitude: -34.608, longitude: -58.370 } },
    { id: '5', title: 'Smart Fit', coordinate: { latitude: -34.615, longitude: -58.380 } },
  ], []);
  const gymLocations = (locationsWithUser && locationsWithUser.length > 0) ? locationsWithUser : mockLocations;

  return (
    <ScreenContainer>
      <HeaderContainer>
        {/* 👇 Asegurate que el archivo exista como .png */}
        <Logo source={require('../../../../assets/logo.jpeg')} />
      </HeaderContainer>

      <SearchBarContainer>
        <Input placeholder="Search" value={searchText} onChangeText={setSearchText} />
      </SearchBarContainer>

      <MapBox>
        <GymsMap initialRegion={initialRegion} locations={gymLocations} />
        {(loading || (!lat && !lng)) && (
          <ActivityIndicator style={{ position: 'absolute', top: 12, right: 12 }} />
        )}
        {(error || locError) && (
          <Text style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#fff8', padding: 6, borderRadius: 8 }}>
            {locError ? locError : 'Sin conexión / usando datos locales'}
          </Text>
        )}
      </MapBox>

      <ButtonsGrid>
        <FeatureButton onPress={() => console.log('Mi rutina')}>
          <ButtonIcon source={DumbbellImg} />
          <ButtonText>Mi rutina</ButtonText>
        </FeatureButton>
        <FeatureButton onPress={() => console.log('Desbloquear premium')}>
          <ButtonIcon source={CrownImg} />
          <ButtonText>Desbloquear premium</ButtonText>
        </FeatureButton>
        <FeatureButton onPress={() => console.log('Amigos')}>
          <ButtonIcon source={UsersImg} />
          <ButtonText>Amigos</ButtonText>
        </FeatureButton>
      </ButtonsGrid>
    </ScreenContainer>
  );
}
