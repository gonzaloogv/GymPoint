import { FilterButton, SegmentedControl } from '@shared/components/ui';

type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (v: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;
};

export default function HeaderActions({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  activeFilters,
}: Props) {
  return (
    <>
      <FilterButton onPress={onOpenFilters} activeFilters={activeFilters} />

      <SegmentedControl
        value={viewMode}
        onChange={(value) => value && onChangeViewMode(value as 'map' | 'list')}
        options={[
          { value: 'map', label: 'Mapa' },
          { value: 'list', label: 'Lista' },
        ]}
        size="sm"
      />
    </>
  );
}
