import styled from 'styled-components/native';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SegmentedControl, BadgeDot, Row } from '@shared/components/ui';

const ActionsRow = styled(Row)`
  gap: ${({ theme }) => theme.spacing(1.25)}px;
`;

const FiltersWrapper = styled(View)`
  position: relative;
`;

const FilterButtonContainer = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing(0.875)}px ${({ theme }) => theme.spacing(1.5)}px;
  margin-bottom: ${({ theme }) => theme.spacing(0.75)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.md}px;
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
    <>
      <ActionsRow $align="center">
        <FiltersWrapper>
          <FilterButtonContainer onPress={onOpenFilters}>
            <Ionicons name="filter-sharp" size={16} />
          </FilterButtonContainer>
          {activeFilters > 0 && <BadgeDot count={activeFilters} />}
        </FiltersWrapper>
      </ActionsRow>

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
