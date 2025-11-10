import React from 'react';
import { PillSelector } from '@shared/components/ui';

type PeriodValue = '7d' | '30d' | '90d' | '12m';

interface TimeSelectorProps {
  periods: Array<{ value: PeriodValue; label: string }>;
  selected: PeriodValue;
  onSelect: (period: PeriodValue) => void;
}

/**
 * @deprecated Use PillSelector from @shared/components/ui instead
 * TimeSelector wrapper for backward compatibility
 */
export function TimeSelector({ periods, selected, onSelect }: TimeSelectorProps) {
  return (
    <PillSelector
      options={periods}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
