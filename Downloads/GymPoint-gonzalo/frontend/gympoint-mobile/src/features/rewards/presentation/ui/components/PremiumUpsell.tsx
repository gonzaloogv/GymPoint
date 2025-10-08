import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { palette } from '@shared/styles';

const PremiumBanner = styled(View)`
  background-color: ${palette.premiumSurface};
  border-color: ${palette.premiumBorder};
  border-width: 1px;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;

const PremiumContent = styled(View)`
  flex: 1;
  gap: 8px;
`;

const PremiumTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${palette.premiumStrong};
  margin-bottom: 4px;
`;

const PremiumDescription = styled(Text)`
  font-size: 14px;
  color: ${palette.premiumText};
  line-height: 20px;
  margin-bottom: 12px;
`;

const PremiumButton = styled(TouchableOpacity)`
  background-color: ${palette.premiumPrimary};
  padding: 12px 16px;
  border-radius: 8px;
  align-self: flex-start;
`;

const PremiumButtonText = styled(Text)`
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
`;

const PremiumIcon = styled(Feather)`
  margin-top: 2px;
  color: ${palette.premiumIcon};
`;

type PremiumUpsellProps = {
  onPress: () => void;
};

export const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ onPress }) => (
  <PremiumBanner>
    <PremiumIcon name="star" size={20} />
    <PremiumContent>
      <PremiumTitle>¿Querés más recompensas?</PremiumTitle>
      <PremiumDescription>
        Actualizá a Premium y desbloqueá beneficios exclusivos.
      </PremiumDescription>
      <PremiumButton onPress={onPress}>
        <PremiumButtonText>Ver Premium →</PremiumButtonText>
      </PremiumButton>
    </PremiumContent>
  </PremiumBanner>
);
