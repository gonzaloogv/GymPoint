import React from 'react';
import styled from 'styled-components/native';
import { sp, rad } from '@shared/styles';
import { TouchableOpacity } from 'react-native';

interface TokenTipsButtonProps {
  onPress: () => void;
}

const Container = styled(TouchableOpacity)`
  background-color: #f5f3ff;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2)}px ${({ theme }) => sp(theme, 2.5)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-width: 1px;
  border-color: #ddd6fe;
  margin-top: ${({ theme }) => sp(theme, 2)}px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #5b21b6;
  margin-bottom: 2px;
`;

const Arrow = styled.Text`
  font-size: 18px;
  color: #7c3aed;
`;

export const TokenTipsButton: React.FC<TokenTipsButtonProps> = ({ onPress }) => {
  return (
    <Container onPress={onPress}>
      <TextContainer>
        <Title>¿Cómo ganar más tokens?</Title>
      </TextContainer>
      <Arrow>›</Arrow>
    </Container>
  );
};
