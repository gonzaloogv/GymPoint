import { SegmentedControl } from '@shared/components/ui/SegmentedControl';

const options = [
  { value: 'all', label: 'Todos' },
  { value: 'workout', label: 'Esta semana' },
  { value: 'personal_record', label: 'PRs' },
  { value: 'streak', label: 'Rachas' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AchievementCategoryTabs({ value, onChange }: Props) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      size="md"
    />
  );
}
