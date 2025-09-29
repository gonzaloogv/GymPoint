import React from 'react';
import styled from 'styled-components/native';
import { Card, Button } from '@shared/components/ui';

const Wrap = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
`;

const Inner = styled.View`
  padding: ${({ theme }) => theme.spacing(3)}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  text-align: center;
`;

const Text = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
`;

const BtnText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;
  font-weight: 600;
`;

export default function EmptyState() {
  return (
    <Wrap>
      <Card>
        <Inner>
          <Title>No tenés rutinas aún</Title>
          <Text>Creá tu primera rutina o importá una plantilla.</Text>
          <Button style={{ minHeight: 44, alignSelf: 'stretch' }}>
            <BtnText>Nueva rutina</BtnText>
          </Button>
        </Inner>
      </Card>
    </Wrap>
  );
}
