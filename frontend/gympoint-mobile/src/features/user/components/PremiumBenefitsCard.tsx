/**
 * PremiumBenefitsCard - Card que muestra los beneficios del plan Premium
 * Se muestra solo a usuarios con plan Free para incentivar el upgrade
 */

import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  SectionTitle,
  Title,
  SmallText,
  Button,
  ButtonText,
} from '../styles/ProfilesStyles';
import { AppTheme } from '@config/theme';

interface PremiumBenefitsCardProps {
  onUpgrade: () => void;
  theme: AppTheme;
}

// Lista de beneficios del plan Premium
const PREMIUM_BENEFITS = [
  'Estadísticas detalladas ilimitadas',
  'Filtros de búsqueda avanzados',
  'Recompensas exclusivas Premium',
  'Soporte prioritario',
  'Sin publicidad',
];

export const PremiumBenefitsCard: React.FC<PremiumBenefitsCardProps> = ({
  onUpgrade,
  theme,
}) => {
  return (
    <Card
      theme={theme}
      style={{ borderColor: '#C084FC', borderWidth: 1 }}
    >
      {/* Título del card */}
      <SectionTitle theme={theme}>
        <Feather size={20} color="#7C3AED" />
        <Title style={{ color: '#7C3AED' }}>Beneficios Premium</Title>
      </SectionTitle>

      {/* Lista de beneficios */}
      <View style={{ marginVertical: theme.spacing(2) }}>
        {PREMIUM_BENEFITS.map((benefit, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing(1),
              marginBottom: theme.spacing(1),
            }}
          >
            {/* Bullet point */}
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#9333EA',
              }}
            />
            {/* Texto del beneficio */}
            <SmallText>{benefit}</SmallText>
          </View>
        ))}
      </View>

      {/* Botón de upgrade */}
      <Button purple onPress={onUpgrade} theme={theme}>
        <ButtonText purple theme={theme}>
          Actualizar a Premium
        </ButtonText>
      </Button>
    </Card>
  );
};