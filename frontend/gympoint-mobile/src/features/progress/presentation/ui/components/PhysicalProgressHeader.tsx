import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as S from '../screens/PhysicalProgressScreen.styles';

interface PhysicalProgressHeaderProps {
  onBack: () => void;
  onInfo: () => void;
}

export const PhysicalProgressHeader: React.FC<PhysicalProgressHeaderProps> = ({
  onBack,
  onInfo,
}) => {
  return (
    <S.Header>
      <S.BackButton onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </S.BackButton>
      <S.HeaderTitle>Progreso Fisico</S.HeaderTitle>
      <S.ActionsRow>
        <S.ActionButton onPress={onInfo}>
          <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
        </S.ActionButton>
      </S.ActionsRow>
    </S.Header>
  );
};
