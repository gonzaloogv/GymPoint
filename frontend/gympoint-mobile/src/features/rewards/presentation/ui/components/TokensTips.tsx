import React from 'react';
import { TipsBanner } from '@shared/components/ui';
import { Ionicons, Feather } from '@expo/vector-icons';

export const TokensTips: React.FC = () => {
  const tips: Array<
    | { icon: keyof typeof Ionicons.glyphMap; iconType: 'ionicons'; text: string }
    | { icon: keyof typeof Feather.glyphMap; iconType: 'feather'; text: string }
  > = [
    { icon: 'flash', iconType: 'ionicons' as const, text: 'Check-in diario: +10 tokens' },
    {
      icon: 'calendar',
      iconType: 'feather' as const,
      text: 'Racha de 7 días: +25 tokens extra',
    },
    {
      icon: 'trophy-outline',
      iconType: 'ionicons' as const,
      text: 'Racha de 30 días: +100 tokens extra',
    },
  ];

  return <TipsBanner title="💡 ¿Cómo ganar más tokens?" tips={tips} />;
};
