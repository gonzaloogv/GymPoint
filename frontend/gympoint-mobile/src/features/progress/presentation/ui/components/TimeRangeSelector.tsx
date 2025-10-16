import React from 'react';
import { SegmentedControl } from '@shared/components/ui/SegmentedControl';

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '12m', label: '12m' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <SegmentedControl
      options={TIME_RANGE_OPTIONS}
      value={value}
      onChange={onChange}
      size="sm"
    />
  );
};
