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
const PurpleCard = styled(Card)`
  border-color: #ddd6fe;
  background-color: #f5f3ff;
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

type Props = { visible: boolean; onPress?: () => void };

export default function PremiumUpsellBanner({ visible, onPress }: Props) {
  if (!visible) return null;
  return (
    <PurpleCard>
      <Row>
        <FeatherIcon name="zap" size={20} color="#7c3aed" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#4c1d95', fontWeight: '700', marginBottom: 2 }}>
            Upgrade a Premium
          </Text>
          <Text style={{ color: '#5b21b6', marginBottom: 8 }}>
            Accedé a rutinas personalizadas, métricas avanzadas y más recompensas
          </Text>
          <OutlineButton onPress={onPress}>
            <OutlineText>Ver planes</OutlineText>
          </OutlineButton>
        </View>
      </Row>
    </PurpleCard>
  );
}
