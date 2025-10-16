import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

type CodeStatusType = 'active' | 'used' | 'expired';

const FilterContainer = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterButton = styled(TouchableOpacity)<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${({ $active }) => ($active ? '#3b82f6' : '#f3f4f6')};
  border-width: ${({ $active }) => ($active ? 0 : 1)}px;
  border-color: #e5e7eb;
`;

const FilterText = styled(Text)<{ $active: boolean }>`
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#6b7280')};
`;

type CodeStatusFilterProps = {
  activeStatus: CodeStatusType;
  onStatusChange: (status: CodeStatusType) => void;
};

export const CodeStatusFilter: React.FC<CodeStatusFilterProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  return (
    <FilterContainer>
      <FilterButton
        $active={activeStatus === 'active'}
        onPress={() => onStatusChange('active')}
      >
        <FilterText $active={activeStatus === 'active'}>Activos</FilterText>
      </FilterButton>
      <FilterButton
        $active={activeStatus === 'used'}
        onPress={() => onStatusChange('used')}
      >
        <FilterText $active={activeStatus === 'used'}>Usados</FilterText>
      </FilterButton>
      <FilterButton
        $active={activeStatus === 'expired'}
        onPress={() => onStatusChange('expired')}
      >
        <FilterText $active={activeStatus === 'expired'}>Vencidos</FilterText>
      </FilterButton>
    </FilterContainer>
  );
};
