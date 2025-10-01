import React from 'react';
import styled from 'styled-components/native';
import { Button, ButtonText } from '@shared/components/ui';

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background: ${({ theme }) => theme.colors.bg};
`;

const OutlineBtn = styled.TouchableOpacity`
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  margin-top: ${({ theme }) => theme.spacing(1)}px;
`;

const OutlineText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

type Props = {
  onStartRoutine: () => void;
  onViewHistory: () => void;
};

export function RoutineDetailFooter({ onStartRoutine, onViewHistory }: Props) {
  return (
    <Footer>
      <Button onPress={onStartRoutine}>
        <ButtonText>Empezar rutina</ButtonText>
      </Button>
      <OutlineBtn onPress={onViewHistory}>
        <OutlineText>Ver historial</OutlineText>
      </OutlineBtn>
    </Footer>
  );
}
