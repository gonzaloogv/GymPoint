/**
 * PremiumAlert - Componente de alerta promocional
 * Se muestra a usuarios con plan Free para promocionar el plan Premium
 */

import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  AlertCard,
  BodyText,
  SmallText,
  Button,
  ButtonText,
} from '../styles/ProfilesStyles';
import { AppTheme } from '@presentation/theme';

interface PremiumAlertProps {
  onUpgrade: () => void;
  theme: AppTheme;
}

export const PremiumAlert: React.FC<PremiumAlertProps> = ({
  onUpgrade,
  theme,
}) => {
  return (
    <AlertCard purple theme={theme}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing(1.5),
        }}
      >
        {/* Icono de corona */}
        <Feather name="award" size={16} color="#9333EA" />

        {/* Contenido del alert */}
        <View style={{ flex: 1 }}>
          {/* Título */}
          <BodyText
            style={{
              fontWeight: '600',
              color: '#7C3AED',
              marginBottom: 4,
            }}
          >
            ¡Actualizá a Premium!
          </BodyText>

          {/* Descripción */}
          <SmallText
            style={{
              color: '#7C3AED',
              marginBottom: theme.spacing(1.5),
            }}
          >
            Desbloqueá estadísticas avanzadas, recompensas exclusivas y más.
          </SmallText>

          {/* Botón de acción */}
          <Button small purple onPress={onUpgrade} theme={theme}>
            <ButtonText small purple theme={theme}>
              Ver beneficios Premium
            </ButtonText>
          </Button>
        </View>
      </View>
    </AlertCard>
  );
};