import React from 'react';
import { EmptyState } from '@shared/components/ui';

type EmptyCodesProps = {
  onViewRewards: () => void;
};

export const EmptyCodes: React.FC<EmptyCodesProps> = ({ onViewRewards }) => (
  <EmptyState
    title="No tenés códigos generados"
    description="Canjeá tokens por recompensas para generar códigos"
    buttonText="Ver recompensas disponibles"
    onButtonPress={onViewRewards}
  />
);
