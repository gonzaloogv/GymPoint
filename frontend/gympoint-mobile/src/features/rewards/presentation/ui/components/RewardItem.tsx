import React from 'react';
import { RewardCard } from './RewardCard';
import { Reward } from '@features/rewards/domain/entities';

type RewardItemProps = {
  reward: Reward;
  tokens: number;
  isPremium: boolean;
  onGenerate: (reward: Reward) => void;
};

export const RewardItem: React.FC<RewardItemProps> = ({ reward, tokens, isPremium, onGenerate }) => {
  return (
    <RewardCard
      reward={reward}
      tokens={tokens}
      isPremium={isPremium}
      onGenerate={onGenerate}
    />
  );
};
