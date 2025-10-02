import React from 'react';
import { RewardCard } from './RewardCard';
import { Reward } from '../../types';
import { getCategoryColor, getCategoryName } from '../../utils/categories';

type RewardItemProps = {
  reward: Reward;
  tokens: number;
  onGenerate: (reward: Reward) => void;
};

export const RewardItem: React.FC<RewardItemProps> = ({ reward, tokens, onGenerate }) => {
  return (
    <RewardCard
      reward={reward}
      tokens={tokens}
      onGenerate={onGenerate}
      getCategoryColor={getCategoryColor}
      getCategoryName={getCategoryName}
    />
  );
};
