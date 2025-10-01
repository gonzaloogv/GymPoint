import React from 'react';
import { Feather } from '@expo/vector-icons';

import { palette } from '../../../../shared/styles';
import {
  EmptyStateWrapper,
  EmptyStateTitle,
  EmptyStateDescription,
  ActionButton,
  ActionButtonText,
} from '../styles';

type EmptyCodesProps = {
  onViewRewards: () => void;
};

export const EmptyCodes: React.FC<EmptyCodesProps> = ({ onViewRewards }) => (
  <EmptyStateWrapper>
    <Feather name="gift" size={48} color={palette.slate400} />
    <EmptyStateTitle>No tenés códigos generados</EmptyStateTitle>
    <EmptyStateDescription>
      Canjeá tokens por recompensas para generar códigos
    </EmptyStateDescription>
    <ActionButton $variant="secondary" onPress={onViewRewards}>
      <ActionButtonText $variant="secondary">Ver recompensas disponibles</ActionButtonText>
    </ActionButton>
  </EmptyStateWrapper>
);
