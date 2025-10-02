import styled from 'styled-components/native';
import { TouchableOpacity, View } from 'react-native';
import { BadgeDot } from './BadgeDot';
import { Row } from './Row';
import { rad, sp } from '@shared/styles';
import FilterIcon from '@expo/vector-icons/Ionicons';

const ActionsRow = styled(Row)`
  gap: ${({ theme }) => sp(theme, 1.25)}px;
`;

const FiltersWrapper = styled(View)`
  position: relative;
`;

const FilterButtonContainer = styled(TouchableOpacity)`
  padding: ${({ theme }) => `${sp(theme, 0.875)}px ${sp(theme, 1.5)}px`};
  margin-bottom: ${({ theme }) => sp(theme, 0.75)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
`;

type Props = {
  onPress: () => void;
  activeFilters: number;
};

export function FilterButton({ onPress, activeFilters }: Props) {
  return (
    <ActionsRow $align="center">
      <FiltersWrapper>
        <FilterButtonContainer onPress={onPress}>
          <FilterIcon name="filter-sharp" size={16} />
        </FilterButtonContainer>
        {activeFilters > 0 && <BadgeDot count={activeFilters} />}
      </FiltersWrapper>
    </ActionsRow>
  );
}
