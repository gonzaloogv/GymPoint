import { memo } from 'react';
import styled from 'styled-components/native';

import { Input, Row, SearchBarContainer } from '@shared/components/ui';
import { font, sp } from '@shared/styles';

import HeaderActions from './HeaderActions';

const Container = styled.View`
  padding: ${({ theme }) => sp(theme, 2)}px ${({ theme }) => sp(theme, 2)}px 0;
`;

const TitleRow = styled(Row)`
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  font-size: ${({ theme }) => font(theme, 'h4', 18)}px;
  font-weight: 700;
`;

type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;
  searchText: string;
  onChangeSearch: (value: string) => void;
};

function MapScreenHeader({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  activeFilters,
  searchText,
  onChangeSearch,
}: Props) {
  return (
    <Container>
      <TitleRow $justify="space-between">
        <Title>Buscar gimnasios</Title>
        <HeaderActions
          viewMode={viewMode}
          onChangeViewMode={onChangeViewMode}
          onOpenFilters={onOpenFilters}
          activeFilters={activeFilters}
        />
      </TitleRow>

      <SearchBarContainer>
        <Input
          placeholder="Buscar por nombre o dirección…"
          value={searchText}
          onChangeText={onChangeSearch}
        />
      </SearchBarContainer>
    </Container>
  );
}

export default memo(MapScreenHeader);
