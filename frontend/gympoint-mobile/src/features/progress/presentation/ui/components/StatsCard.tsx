import React from 'react';
import { TrendCard } from '@shared/components/ui';

interface StatsCardProps {
  label: string;
  currentValue: number | null;
  previousValue?: number | null;
  unit: string;
  decimals?: number;
  /** Si true, valores más altos son mejores (verde). Si false, valores más bajos son mejores */
  higherIsBetter?: boolean;
}

/**
 * @deprecated Use TrendCard from @shared/components/ui instead
 * StatsCard wrapper for backward compatibility
 */
export function StatsCard({
  label,
  currentValue,
  previousValue,
  unit,
  decimals = 1,
  higherIsBetter = true,
}: StatsCardProps) {
  return (
    <TrendCard
      label={label}
      currentValue={currentValue}
      previousValue={previousValue}
      unit={unit}
      decimals={decimals}
      higherIsBetter={higherIsBetter}
    />
  );
}
