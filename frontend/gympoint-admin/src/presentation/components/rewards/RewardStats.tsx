import React from 'react';
import { Card } from '../ui';
import { RewardStats as RewardStat } from '@/domain';

interface RewardStatsProps {
  stats: RewardStat[] | null | undefined;
}

export const RewardStats: React.FC<RewardStatsProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <Card title="📊 Estadísticas de Canjes (Top 5)" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.slice(0, 5).map((stat) => (
          <div key={stat.id_reward} className="bg-bg dark:bg-bg-dark p-4 rounded-lg text-center border border-border dark:border-border-dark">
            <div className="font-semibold text-text-muted text-sm truncate" title={stat.name}>{stat.name}</div>
            <div className="text-2xl font-bold text-primary">{stat.total_canjes} canjes</div>
            <div className="text-xs text-text-muted">{stat.total_tokens_gastados} tokens</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
