import React from 'react';
import { Reward } from '@/domain';
import { RewardCard } from '../ui/RewardCard';
import { Button } from '../ui';
import { UseMutationResult } from '@tanstack/react-query';

interface RewardsListProps {
  rewards: Reward[];
  onEdit: (reward: Reward) => void;
  onDelete: (id: number, name: string) => void;
  deleteRewardMutation: UseMutationResult<void, Error, number, unknown>;
  clearSearch: () => void;
  hasActiveFilter: boolean;
}

export const RewardsList: React.FC<RewardsListProps> = ({
  rewards,
  onEdit,
  onDelete,
  deleteRewardMutation,
  clearSearch,
  hasActiveFilter,
}) => {
  if (rewards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-text-muted">
        <div className="text-center">
          <p className="text-lg">📦 No hay recompensas que coincidan</p>
          {hasActiveFilter && (
            <Button onClick={clearSearch} variant="secondary" className="mt-4">
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id_reward}
          reward={reward}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deleteRewardMutation.isPending && deleteRewardMutation.variables === reward.id_reward}
        />
      ))}
    </div>
  );
};
