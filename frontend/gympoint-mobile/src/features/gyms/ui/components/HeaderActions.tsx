import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

import { BadgeDot, Row, SegmentedControl } from '@shared/components/ui';
import { rad, sp } from '@shared/styles';

import FilterIcon from '@expo/vector-icons/Ionicons';

const ActionsRow = styled(Row)`
  gap: ${({ theme }) => sp(theme, 1.25)}px;
`;

const FiltersWrapper = styled(View)`
  position: relative;
`;

const FilterButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => `${sp(theme, 0.875)}px ${sp(theme, 1.5)}px`};
  margin-bottom: ${({ theme }) => sp(theme, 0.75)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
`;

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
    <ActionsRow $align="center">
      <FiltersWrapper>
        <FilterButton onPress={onOpenFilters}>
          <FilterIcon name="filter-sharp" size={16} />
        </FilterButton>
        {activeFilters > 0 && <BadgeDot count={activeFilters} />}
      </FiltersWrapper>

      <SegmentedControl
        value={viewMode}
        onChange={(value) => value && onChangeViewMode(value as 'map' | 'list')}
        options={[
          { value: 'map', label: 'Mapa' },
          { value: 'list', label: 'Lista' },
        ]}
        size="sm"
      />
    </ActionsRow>
  );
}
