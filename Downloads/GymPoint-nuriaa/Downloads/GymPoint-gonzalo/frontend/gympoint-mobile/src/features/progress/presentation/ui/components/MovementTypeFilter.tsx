// src/features/progress/presentation/ui/components/MovementTypeFilter.tsx
import { SegmentedControl } from '@shared/components/ui/SegmentedControl';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const options = [
  { value: 'all', label: 'Todos' },
  { value: 'earned', label: 'Ganados' },
  { value: 'spent', label: 'Gastados' },
];

export function MovementTypeFilter({ value, onChange }: Props) {
  return <SegmentedControl options={options} value={value} onChange={onChange} size="md" />;
}
