/**
 * LocationSettings - Configuración de ubicación
 * Permite al usuario controlar el acceso a su ubicación para encontrar gimnasios cercanos
 */

import React from 'react';
import { View, Text, Switch as RNSwitch } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { AppTheme } from '@presentation/theme';

interface LocationSettingsProps {
  locationEnabled: boolean;
  onToggle: (value: boolean) => void;
  theme: AppTheme;
}

const Container = styled(View)`
  margin-bottom: 24px;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
`;

const Card = styled(View)`
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  border-width: 1px;
  border-color: #f0f0f0;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftContent = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const IconContainer = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #f5f5f5;
  align-items: center;
  justify-content: center;
`;

const TextContent = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
`;

const Subtitle = styled(Text)`
  font-size: 13px;
  color: #666;
`;

export const LocationSettings: React.FC<LocationSettingsProps> = ({
  locationEnabled,
  onToggle,
  theme,
}) => {
  return (
    <Container>
      <SectionTitle>Ubicación</SectionTitle>

      <Card>
        <Row>
          <LeftContent>
            <IconContainer>
              <Feather name="map-pin" size={20} color="#635BFF" />
            </IconContainer>
            <TextContent>
              <Title>Acceso a ubicación</Title>
              <Subtitle>Para encontrar gyms cercanos y check-ins automáticos</Subtitle>
            </TextContent>
          </LeftContent>
          <RNSwitch
            value={locationEnabled}
            onValueChange={onToggle}
            trackColor={{ false: '#E5E7EB', true: '#635BFF' }}
            thumbColor="#FFFFFF"
          />
        </Row>
      </Card>
    </Container>
  );
};
