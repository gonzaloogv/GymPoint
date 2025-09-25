import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native';
import { Input } from '../../../shared/components/ui/Input';
import GymsMap from './GymsMap';
import {SafeAreaView} from 'react-native-safe-area-context'
// importa imágenes arriba para que el bundler web las resuelva bien
import DumbbellImg from '../../../../assets/dumbbell.png';
import CrownImg from '../../../../assets/crown.png';
import UsersImg from '../../../../assets/users.png';

// —— helpers seguros para theme —— //
const sp = (theme: any, n: number) =>
  typeof theme?.spacing === 'function'
    ? theme.spacing(n)
    : typeof theme?.spacing === 'number'
    ? theme.spacing * n
    : theme?.spacing?.[n] ?? n * 8; // fallback

const rad = (theme: any, key: string, fallback = 12) =>
  typeof theme?.radius === 'number'
    ? theme.radius
    : theme?.radius?.[key] ?? fallback;

const font = (theme: any, key: string, fallback = 14) =>
  typeof theme?.typography?.[key] === 'number'
    ? theme.typography[key]
    : fallback;

// —— styled components —— //
const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme?.colors?.bg ?? '#fff'};
`;

const HeaderContainer = styled(View)`
  padding: ${({ theme }) => sp(theme, 2)}px;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(Image).attrs({
  resizeMode: 'contain',
})`
  width: 150px;
  height: 40px;
`;

const SearchBarContainer = styled(View)`
  padding-left: ${({ theme }) => sp(theme, 2)}px;
  padding-right: ${({ theme }) => sp(theme, 2)}px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const MapBox = styled(View)`
  margin-left: ${({ theme }) => sp(theme, 2)}px;
  margin-right: ${({ theme }) => sp(theme, 2)}px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  overflow: hidden;
`;

const ButtonsGrid = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

const FeatureButton = styled(TouchableOpacity)`
  width: 45%;
  height: 45vw; /* alternativa a aspectRatio para RN + Web */
  max-height: 180px;
  background-color: ${({ theme }) => theme?.colors?.card ?? '#f5f5f5'};
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#ddd'};
`;

const ButtonIcon = styled(Image)`
  width: 60px;
  height: 60px;
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

const ButtonText = styled(Text)`
  font-size: ${({ theme }) => font(theme, 'small', 14)}px;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  text-align: center;
`;

export default function GymsScreen() {
  const [searchText, setSearchText] = React.useState('');

  const initialRegion = {
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const gymLocations = [
    { id: '1', title: 'FITNIX', coordinate: { latitude: -34.598, longitude: -58.385 } },
    { id: '2', title: 'PANTHER GYM', coordinate: { latitude: -34.595, longitude: -58.375 } },
    { id: '3', title: 'Active Life PILATES', coordinate: { latitude: -34.605, longitude: -58.378 } },
    { id: '4', title: 'GreyFit', coordinate: { latitude: -34.608, longitude: -58.370 } },
    { id: '5', title: 'Smart Fit', coordinate: { latitude: -34.615, longitude: -58.380 } },
  ];

  return (
    <ScreenContainer>
      <HeaderContainer>
        <Logo source={require('../../../../assets/logo.jpeg')} />
      </HeaderContainer>

      <SearchBarContainer>
        <Input
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </SearchBarContainer>

      <MapBox>
        <GymsMap initialRegion={initialRegion} locations={gymLocations} />
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
