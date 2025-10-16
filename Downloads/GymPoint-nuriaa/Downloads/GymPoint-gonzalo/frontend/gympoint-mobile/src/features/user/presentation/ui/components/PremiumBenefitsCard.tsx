/**
 * PremiumBenefitsCard - Card que muestra los beneficios del plan Premium
 * Se muestra solo a usuarios con plan Free para incentivar el upgrade
 */

import React from 'react';
import { View } from 'react-native';
import { PremiumCard } from '@shared/components/ui';

interface PremiumBenefitsCardProps {
  onUpgrade: () => void;
  theme?: any;
}

// Lista de beneficios del plan Premium (reducida)
const PREMIUM_BENEFITS = [
  'Estadísticas detalladas',
  'Recompensas exclusivas',
  'Sin publicidad',
];

export const PremiumBenefitsCard: React.FC<PremiumBenefitsCardProps> = ({
  onUpgrade,
  theme,
}) => {
  return (
    <View style={{ marginTop: 8 }}>
      <PremiumCard
        title="Beneficios Premium"
        description="Desbloqueá todas las funcionalidades premium"
        benefits={PREMIUM_BENEFITS}
        buttonText="Actualizar a Premium"
        onButtonPress={onUpgrade}
        icon="gift"
      />
    </View>
  );
};
