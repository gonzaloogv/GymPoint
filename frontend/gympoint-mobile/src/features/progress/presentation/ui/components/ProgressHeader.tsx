import React from 'react';
import styled from 'styled-components/native';
import { sp } from '@shared/styles';

const Container = styled.View`
  padding: ${({ theme }) => sp(theme, 2)}px 0;
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 800;
  color: #111827;
`;

export const ProgressHeader: React.FC = () => {
  return (
    <Container>
      <Title>Progreso</Title>
    </Container>
  );
};
