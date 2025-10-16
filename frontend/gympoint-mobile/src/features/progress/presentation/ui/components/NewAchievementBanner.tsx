import React from 'react';
import styled from 'styled-components/native';
import { Achievement } from '@features/progress/domain/entities/Progress';

const Container = styled.View`
  background-color: #FFF9E6;
  border-width: 1px;
  border-color: #FFD666;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #FFE699;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const Icon = styled.Text`
  font-size: 24px;
`;

const Content = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #996600;
  margin-bottom: 4px;
`;

const Description = styled.Text`
  font-size: 13px;
  color: #664400;
`;

interface Props {
  achievement: Achievement;
}

export function NewAchievementBanner({ achievement }: Props) {
  return (
    <Container>
      <IconContainer>
        <Icon>{achievement.icon}</Icon>
      </IconContainer>
      <Content>
        <Title>¡Nuevo logro desbloqueado!</Title>
        <Description>{achievement.description}</Description>
      </Content>
    </Container>
  );
}
