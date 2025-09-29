import React from 'react';
import styled from 'styled-components/native';
import { Button } from '@shared/components/ui';

const Bar = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: ${({ theme }) => theme.spacing(2)}px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing(1)}px;
  flex-direction: row;
`;

const One = styled(Button)`
  flex: 1;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const BtnText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;
  font-weight: 600;
`;

type Props = {
  onCreate: () => void;
  onImport: () => void;
};

export default function FloatingActions({ onCreate, onImport }: Props) {
  return (
    <Bar>
      <One onPress={onCreate}>
        <BtnText>Nueva rutina</BtnText>
      </One>
      <One onPress={onImport}>
        <BtnText>Importar</BtnText>
      </One>
    </Bar>
  );
}
