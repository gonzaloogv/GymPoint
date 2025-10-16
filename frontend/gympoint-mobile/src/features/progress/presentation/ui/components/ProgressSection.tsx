import React from 'react';
import styled from 'styled-components/native';
import { sp, rad } from '@shared/styles';
import { TouchableOpacity } from 'react-native';

interface ProgressSectionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const Container = styled(TouchableOpacity)`
  background-color: #ffffff;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-width: 1px;
  border-color: #e5e7eb;
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const LeftContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #eff6ff;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.Text`
  font-size: 24px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
`;

const Subtitle = styled.Text`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const Arrow = styled.Text`
  font-size: 20px;
  color: #9ca3af;
`;

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <Container onPress={onPress}>
      <LeftContent>
        <IconContainer>
          <Icon>{icon}</Icon>
        </IconContainer>
        <TextContainer>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TextContainer>
      </LeftContent>
      <Arrow>›</Arrow>
    </Container>
  );
};
