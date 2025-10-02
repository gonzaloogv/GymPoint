import { memo } from 'react';
import styled from 'styled-components/native';
import { Row } from '@shared/components/ui';
import { SearchHeader } from '@shared/components/ui';
import HeaderActions from './HeaderActions';


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
    <SearchHeader
      title="Buscar gimnasios"
      searchText={searchText}
      onChangeSearch={onChangeSearch}
      searchPlaceholder="Buscar por nombre o dirección…"
    >
      <HeaderActions
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        onOpenFilters={onOpenFilters}
        activeFilters={activeFilters}
      />
    </SearchHeader>
  );
}

export default memo(MapScreenHeader);
