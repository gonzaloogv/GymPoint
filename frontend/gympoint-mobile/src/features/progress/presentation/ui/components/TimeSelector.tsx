import React from 'react';
import { PillSelector } from '@shared/components/ui';

interface TimeSelectorProps {
  periods: Array<{ value: | '30d' | '90d' | '12m'; label: string }>;
  selected: '30d' | '90d' | '12m';
  onSelect: (period: '30d' | '90d' | '12m') => void;
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
