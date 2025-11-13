import React from 'react';
import { MetricTile } from '@shared/components/ui';

type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success';
};

export function ExecutionStatsCard({
  label,
  value,
  icon,
  variant = 'default',
}: Props) {
  const tone = variant === 'accent' ? 'primary' : variant === 'success' ? 'success' : 'neutral';

  return (
    <MetricTile
      size="compact"
      label={label}
      value={value}
      icon={icon}
      tone={tone}
    />
  );
}
