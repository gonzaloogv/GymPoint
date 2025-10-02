import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';

import { palette } from '../../../../shared/styles';
import { TipsBanner, TipsTitle, TipsRow, TipsText } from '../styles';

export const TokensTips: React.FC = () => (
  <TipsBanner>
    <TipsTitle>💡 ¿Cómo ganar más tokens?</TipsTitle>
    <TipsRow>
      <Ionicons name="flash" size={12} color={palette.info} />
      <TipsText>Check-in diario: +10 tokens</TipsText>
    </TipsRow>
    <TipsRow>
      <Feather name="calendar" size={12} color={palette.info} />
      <TipsText>Racha de 7 días: +25 tokens extra</TipsText>
    </TipsRow>
    <TipsRow>
      <Ionicons name="trophy-outline" size={12} color={palette.info} />
      <TipsText>Racha de 30 días: +100 tokens extra</TipsText>
    </TipsRow>
  </TipsBanner>
);
