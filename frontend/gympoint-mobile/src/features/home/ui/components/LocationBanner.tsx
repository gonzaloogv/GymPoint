import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card } from '@shared/components/ui/Card';
import { rad } from '@shared/styles';

const Row = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;
const Banner = styled(Card)`
  border-color: #fed7aa;
  background-color: #fff7ed;
`;
const OutlineButton = styled(TouchableOpacity)`
  min-height: 40px;
  padding: 10px 14px;
  border-radius: ${(p) => rad(p.theme, 'lg', 12)}px;
  border-width: 1px;
  border-color: ${(p) => p.theme?.colors?.border ?? '#e5e7eb'};
  align-items: center;
  justify-content: center;
`;
const OutlineText = styled(Text)`
  color: ${(p) => p.theme?.colors?.text ?? '#111'};
  font-weight: 600;
`;

type Props = { visible: boolean; onEnable: () => void };

export default function LocationBanner({ visible, onEnable }: Props) {
  if (!visible) return null;
  return (
    <Banner>
      <Row>
        <FeatherIcon name="map-pin" size={20} color="#ea580c" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#7c2d12', fontWeight: '600', marginBottom: 2 }}>
            Activar ubicación
          </Text>
          <Text style={{ color: '#9a3412', marginBottom: 8 }}>
            Permitinos acceder a tu ubicación para encontrar gimnasios cercanos
          </Text>
          <OutlineButton onPress={onEnable}>
            <OutlineText>Activar ubicación</OutlineText>
          </OutlineButton>
        </View>
      </Row>
    </Banner>
  );
}
