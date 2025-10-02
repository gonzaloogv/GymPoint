import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

import { Card, Button, ButtonText } from '@shared/components/ui';
import { palette } from '@shared/styles';
import { Reward } from '@features/rewards/domain/entities';

// Styled components específicos para RewardCard
const RewardCardContent = styled(View)`
  flex-direction: row;
  gap: 12px;
`;

const RewardIcon = styled(View)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${palette.infoSurface};
  align-items: center;
  justify-content: center;
`;

const RewardIconText = styled(Text)`
  font-size: 20px;
`;

const RewardInfo = styled(View)`
  flex: 1;
  gap: 8px;
`;

const RewardHeaderRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const RewardHeaderTexts = styled(View)`
  flex: 1;
  gap: 4px;
`;

const RewardTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const RewardDescription = styled(Text)`
  font-size: 14px;
  color: ${palette.textMuted};
  line-height: 18px;
`;

const RewardCost = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CostText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${palette.highlight};
`;

const BadgeWrapper = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CategoryBadge = styled(View)<{ $color: string }>`
  background-color: ${({ $color }) => $color}20;
  border-color: ${({ $color }) => $color};
  border-width: 1px;
  border-radius: 12px;
  padding: 4px 8px;
`;

const CategoryBadgeText = styled(Text)<{ $color: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $color }) => $color};
`;

const ValidityRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ValidityText = styled(Text)`
  font-size: 12px;
  color: ${palette.slate500};
`;

const TermsText = styled(Text)`
  font-size: 12px;
  color: ${palette.textMuted};
  font-style: italic;
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
  getCategoryName 
}: RewardCardProps) {
  const isAffordable = tokens >= reward.cost;
  const isDisabled = !reward.available || !isAffordable;

  return (
    <Card style={{ 
      opacity: reward.available ? 1 : 0.5,
      borderColor: isAffordable ? palette.lifestylePrimary : palette.neutralBorder 
    }}>
      <RewardCardContent>
        <RewardIcon>
          <RewardIconText>{reward.icon}</RewardIconText>
        </RewardIcon>

        <RewardInfo>
          <RewardHeaderRow>
            <RewardHeaderTexts>
              <RewardTitle>{reward.title}</RewardTitle>
              <RewardDescription>{reward.description}</RewardDescription>
            </RewardHeaderTexts>

            <RewardCost>
              <Ionicons name="flash" size={14} color={palette.highlight} />
              <CostText>{reward.cost}</CostText>
            </RewardCost>
          </RewardHeaderRow>

          <BadgeWrapper>
            <CategoryBadge $color={getCategoryColor(reward.category)}>
              <CategoryBadgeText $color={getCategoryColor(reward.category)}>
                {getCategoryName(reward.category)}
              </CategoryBadgeText>
            </CategoryBadge>

            <ValidityRow>
              <Feather name="clock" size={10} color={palette.slate500} />
              <ValidityText>{reward.validDays} días</ValidityText>
            </ValidityRow>
          </BadgeWrapper>

          {reward.terms && <TermsText>{reward.terms}</TermsText>}

          <Button 
            variant={isDisabled ? undefined : 'primary'} 
            onPress={() => onGenerate(reward)}
            style={{ 
              opacity: isDisabled ? 0.5 : 1,
              backgroundColor: isDisabled ? palette.neutralBg : undefined,
              minHeight: 44
            }}
          >
            <ButtonText style={{ 
              color: isDisabled ? palette.textMuted : '#ffffff',
              fontWeight: '600'
            }}>
              {!reward.available
                ? 'Solo Premium'
                : !isAffordable
                ? `Faltan ${reward.cost - tokens} tokens`
                : 'Generar código'}
            </ButtonText>
          </Button>
        </RewardInfo>
      </RewardCardContent>
    </Card>
  );
}
