import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card } from '@shared/components/ui/Card';
import { sp } from '@shared/styles';

const Heading = styled.Text`
  font-weight: 700;
  color: ${(p) => p.theme?.colors?.text ?? '#111'};
`;
const Subtext = styled.Text`
  color: ${(p) => p.theme?.colors?.subtext ?? '#70737A'};
`;

const QuickGrid = styled.View`
  flex-direction: row;
  gap: ${(p) => sp(p.theme, 1.5)}px;
`;
const Quick = styled(Card)`
  flex: 1;
  align-items: center;
  padding-vertical: ${(p) => sp(p.theme, 2)}px;
`;
const Circle = styled.View<{ bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.bg ?? 'rgba(17,24,39,0.08)'};
  margin-bottom: ${(p) => sp(p.theme, 1)}px;
`;

type Props = { onFindGyms?: () => void; onMyRoutines?: () => void };

export default function QuickActions({ onFindGyms, onMyRoutines }: Props) {
  const navigation = useNavigation<any>();

  const handleFindGyms = onFindGyms ?? (() => navigation.navigate('Mapa')); // ✅ nombre del tab

  const handleMyRoutines = onMyRoutines ?? (() => navigation.navigate('Rutinas')); // ✅ nombre del tab

  return (
    <QuickGrid>
      <Quick>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center' }}
          activeOpacity={0.6}
          onPress={handleFindGyms}
        >
          <Circle bg="rgba(99,91,255,0.12)">
            <FeatherIcon name="map-pin" size={24} color="#635bff" />
          </Circle>
          <Heading style={{ marginBottom: 2 }}>Encontrar gym</Heading>
          <Subtext>Cerca de ti</Subtext>
        </TouchableOpacity>
      </Quick>

      <Quick>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center' }}
          activeOpacity={0.6}
          onPress={handleMyRoutines}
        >
          <Circle bg="rgba(16,185,129,0.12)">
            <FeatherIcon name="activity" size={24} color="#10b981" />
          </Circle>
          <Heading style={{ marginBottom: 2 }}>Mis rutinas</Heading>
          <Subtext>Entrenamientos</Subtext>
        </TouchableOpacity>
      </Quick>
    </QuickGrid>
  );
}
