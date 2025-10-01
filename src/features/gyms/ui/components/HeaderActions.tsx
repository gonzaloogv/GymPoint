// src/features/gyms/ui/components/HeaderActions.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { SegmentedControl, BadgeDot } from '@shared/components/ui';
import { rad } from '@shared/styles/uiTokens';
import FilterIcon from '@expo/vector-icons/Ionicons';

const ActionsRow = styled(View)` 
  flex-direction: row; 
  align-items: center; 
  gap: 10px; 
`;
const FilterBtn = styled(TouchableOpacity)`
  position: relative; 
  padding: 7px 12px;
  margin-bottom: 6px;
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

export default function HeaderActions({ viewMode, onChangeViewMode, onOpenFilters, activeFilters }: Props) {
  return (
    <ActionsRow>
      <View style={{ position: 'relative' }}>
        <FilterBtn onPress={onOpenFilters}>
          <FilterIcon name="filter-sharp" size={16}></FilterIcon>
        </FilterBtn>
        {activeFilters > 0 && <BadgeDot count={activeFilters} />}
      </View>

      <SegmentedControl
        value={viewMode}
        onChange={(v) => v && onChangeViewMode(v as 'map' | 'list')}
        options={[{ value: 'map', label: 'Mapa' }, { value: 'list', label: 'Lista' }]}
        size="sm"
      />
    </ActionsRow>
  );
}
