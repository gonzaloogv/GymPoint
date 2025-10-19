import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

import { Card, Button, ButtonText } from '@shared/components/ui';
import { palette } from '@shared/styles';
import { Reward } from '@features/rewards/domain/entities';

// Styled components específicos para RewardCard
const RewardCardContent = styled(View)`
  gap: 12px;
`;

const RewardHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RewardIconWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const RewardIcon = styled(View)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: #dbeafe;
  align-items: center;
  justify-content: center;
`;

const RewardIconText = styled(Text)`
  font-size: 22px;
`;

const RewardDiscount = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled(View)<{ $available: boolean }>`
  background-color: ${({ $available }) => ($available ? '#dbeafe' : '#f3f4f6')};
  padding: 6px 12px;
  border-radius: 12px;
`;

const StatusText = styled(Text)<{ $available: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $available }) => ($available ? '#2563eb' : '#6b7280')};
`;

const RewardTitle = styled(Text)`
  font-size: 14px;
  color: #6b7280;
  line-height: 20px;
`;

const RewardCost = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

const CostText = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: ${palette.highlight};
`;

const ButtonsRow = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-top: 8px;
`;

type RewardCardProps = {
  reward: Reward;
  tokens: number;
  onGenerate: (reward: Reward) => void;
  getCategoryColor: (category: string) => string;
  getCategoryName: (category: string) => string;
};

export function RewardCard({
  reward,
  tokens,
  onGenerate,
  getCategoryColor,
  getCategoryName,
}: RewardCardProps) {
  const isAffordable = tokens >= reward.cost;
  const isDisabled = !reward.available || !isAffordable;

  // Extraer el porcentaje de descuento del título si existe
  const discountMatch = reward.title.match(/(\d+%)/);
  const discount = discountMatch ? discountMatch[1] : '';

  return (
    <Card
      style={{
        opacity: reward.available ? 1 : 0.6,
        borderWidth: 1,
        borderColor: reward.available ? '#e5e7eb' : '#f3f4f6',
      }}
    >
      <RewardCardContent>
        {/* Header con icono, descuento y estado */}
        <RewardHeader>
          <RewardIconWrapper>
            <RewardIcon>
              <RewardIconText>{reward.icon}</RewardIconText>
            </RewardIcon>
            {discount && <RewardDiscount>{discount}</RewardDiscount>}
          </RewardIconWrapper>
          <StatusBadge $available={reward.available && isAffordable}>
            <StatusText $available={reward.available && isAffordable}>
              {!reward.available ? 'Solo Premium' : isAffordable ? 'Disponible' : 'No disponible'}
            </StatusText>
          </StatusBadge>
        </RewardHeader>

        {/* Título/Descripción */}
        <RewardTitle>{reward.description || reward.title}</RewardTitle>

        {/* Costo en tokens */}
        <RewardCost>
          <Ionicons name="flash" size={14} color={palette.highlight} />
          <CostText>{reward.cost} tokens</CostText>
        </RewardCost>

        {/* Botón de acción */}
        <Button
          variant={isDisabled ? undefined : 'primary'}
          onPress={() => onGenerate(reward)}
          disabled={isDisabled}
          style={{
            opacity: isDisabled ? 0.5 : 1,
            backgroundColor: isDisabled ? '#f3f4f6' : '#3b82f6',
            minHeight: 44,
          }}
        >
          <ButtonText
            style={{
              color: isDisabled ? '#9ca3af' : '#ffffff',
              fontWeight: '600',
            }}
          >
            {!reward.available
              ? 'Solo Premium'
              : !isAffordable
                ? `Faltan ${reward.cost - tokens} tokens`
                : 'Canjear'}
          </ButtonText>
        </Button>
      </RewardCardContent>
    </Card>
  );
}
