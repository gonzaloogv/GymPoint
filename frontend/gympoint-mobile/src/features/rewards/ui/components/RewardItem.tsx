import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';

import { palette } from '../../../../shared/styles';
import { Reward } from '../../types';
import { getCategoryColor, getCategoryName } from '../../utils/categories';
import {
  RewardCard,
  RewardCardContent,
  RewardIcon,
  RewardIconText,
  RewardInfo,
  RewardHeaderRow,
  RewardHeaderTexts,
  RewardTitle,
  RewardDescription,
  RewardCost,
  CostText,
  BadgeWrapper,
  CategoryBadge,
  CategoryBadgeText,
  ValidityRow,
  ValidityText,
  TermsText,
  ActionButton,
  ActionButtonText,
} from '../styles';

type RewardItemProps = {
  reward: Reward;
  tokens: number;
  onGenerate: (reward: Reward) => void;
};

export const RewardItem: React.FC<RewardItemProps> = ({ reward, tokens, onGenerate }) => {
  const isAffordable = tokens >= reward.cost;
  const isDisabled = !reward.available || !isAffordable;

  return (
    <RewardCard $affordable={isAffordable} $available={reward.available}>
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
              <CategoryBadgeText>{getCategoryName(reward.category)}</CategoryBadgeText>
            </CategoryBadge>

            <ValidityRow>
              <Feather name="clock" size={10} color={palette.slate500} />
              <ValidityText>{reward.validDays} días</ValidityText>
            </ValidityRow>
          </BadgeWrapper>

          {reward.terms ? <TermsText>{reward.terms}</TermsText> : null}

          <ActionButton $disabled={isDisabled} onPress={() => onGenerate(reward)}>
            <ActionButtonText>
              {!reward.available
                ? 'Solo Premium'
                : !isAffordable
                ? `Faltan ${reward.cost - tokens} tokens`
                : 'Generar código'}
            </ActionButtonText>
          </ActionButton>
        </RewardInfo>
      </RewardCardContent>
    </RewardCard>
  );
};
