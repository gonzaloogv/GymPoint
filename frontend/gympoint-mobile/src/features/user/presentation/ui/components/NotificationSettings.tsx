import React from 'react';
import { View, Text, Switch as RNSwitch } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { NotificationSettings as NotificationSettingsType } from '../../../types/userTypes';
import { AppTheme } from '@presentation/theme';

interface NotificationSettingsProps {
  notifications: NotificationSettingsType;
  onToggle: (key: keyof NotificationSettingsType, value: boolean) => void;
  theme: AppTheme;
}

const Container = styled(View)`
  margin-top: 16px;
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
  margin-bottom: 12px;
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

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onToggle,
  theme,
}) => {
  return (
    <Container>
      <SectionTitle>Notificaciones</SectionTitle>

      {/* Recordatorios de check-in */}
      <Card>
        <Row>
          <LeftContent>
            <IconContainer>
              <Feather name="bell" size={20} color="#635BFF" />
            </IconContainer>
            <TextContent>
              <Title>Recordatorios de check-in</Title>
              <Subtitle>Recibe avisos para registrar tu entrenamiento</Subtitle>
            </TextContent>
          </LeftContent>
          <RNSwitch
            value={notifications.checkinReminders}
            onValueChange={(value) => onToggle('checkinReminders', value)}
            trackColor={{ false: '#E5E7EB', true: '#635BFF' }}
            thumbColor="#FFFFFF"
          />
        </Row>
      </Card>

      {/* Alertas de racha */}
      <Card>
        <Row>
          <LeftContent>
            <IconContainer>
              <Feather name="bell" size={20} color="#635BFF" />
            </IconContainer>
            <TextContent>
              <Title>Alertas de racha</Title>
              <Subtitle>Te avisamos si tu racha está en riesgo</Subtitle>
            </TextContent>
          </LeftContent>
          <RNSwitch
            value={notifications.streakAlerts}
            onValueChange={(value) => onToggle('streakAlerts', value)}
            trackColor={{ false: '#E5E7EB', true: '#635BFF' }}
            thumbColor="#FFFFFF"
          />
        </Row>
      </Card>

      {/* Nuevas recompensas */}
      <Card>
        <Row>
          <LeftContent>
            <IconContainer>
              <Feather name="bell" size={20} color="#635BFF" />
            </IconContainer>
            <TextContent>
              <Title>Nuevas recompensas</Title>
              <Subtitle>Notificaciones de tokens y ofertas disponibles</Subtitle>
            </TextContent>
          </LeftContent>
          <RNSwitch
            value={notifications.rewardUpdates}
            onValueChange={(value) => onToggle('rewardUpdates', value)}
            trackColor={{ false: '#E5E7EB', true: '#635BFF' }}
            thumbColor="#FFFFFF"
          />
        </Row>
      </Card>
    </Container>
  );
};
