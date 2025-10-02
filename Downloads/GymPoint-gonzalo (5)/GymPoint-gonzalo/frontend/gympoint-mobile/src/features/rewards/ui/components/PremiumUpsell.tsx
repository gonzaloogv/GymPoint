import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '../../../../shared/styles';

import {
  PremiumBanner,
  PremiumContent,
  PremiumText,
  PremiumStrong,
  PremiumLink,
  PremiumLinkText,
} from '../styles';

type PremiumUpsellProps = {
  onPress: () => void;
};

export const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ onPress }) => (
  <PremiumBanner>
    <PremiumContent>
      <Ionicons name="trophy-outline" size={20} color={palette.premiumPrimary} />
      <PremiumText>
        <PremiumStrong>¿Querés más recompensas?</PremiumStrong>
        {' '}Actualizá a Premium y desbloqueá beneficios exclusivos.
      </PremiumText>
    </PremiumContent>
    <PremiumLink onPress={onPress}>
      <PremiumLinkText>Ver Premium &gt;</PremiumLinkText>
    </PremiumLink>
  </PremiumBanner>
);
