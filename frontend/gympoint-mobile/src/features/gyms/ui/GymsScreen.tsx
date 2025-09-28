// src/features/gyms/ui/GymsScreen.tsx
import React from 'react';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';

import { Screen, SearchBarContainer, Input } from '@shared/components/ui';
import { sp, font } from '@shared/styles/uiTokens';

import FiltersSheet from './components/FiltersSheet';      // ✅ nombre consistente
import HeaderActions from './components/HeaderActions';
import MapSection from './components/MapSection';
import GymsList from './components/GymsList';              // ✅ nombre consistente
import ResultsInfo from './components/ResultsInfo';

import { useUserLocation } from '@shared/hooks/useUserLocation';
import { useNearbyGyms } from '../hooks/useNearbyGyms';
import { useGymsFiltering } from '../hooks/useGymsFiltering'
import { useMapInitialRegion } from '../hooks/useMapInitialRegion';
import { useMapLocations } from '../hooks/useMapLocations';
import { useActiveFiltersCount } from '../hooks/useActiveFiltersCount'; // ✅ plural y nombre de archivo
import { useGymSchedules } from '../hooks/useGymSchedule';

import { MOCK_UI } from '../mocks';
import type { Gym } from '../domain/entities/Gym';

/* ---------- UI ---------- */
const HeaderRow = styled(View)`
  padding: ${({ theme }) => sp(theme, 2)}px ${({ theme }) => sp(theme, 2)}px 0;
  flex-direction: row; align-items: center; justify-content: space-between;
`;
const Title = styled(Text)`
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  font-size: ${({ theme }) => font(theme, 'h4', 18)}px; font-weight: 700;
`;

export default function GymsScreen() {
  const [searchText, setSearchText] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'map' | 'list'>('map');

  // Filtros
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [priceFilter, setPriceFilter] = React.useState('');
  const [openNow, setOpenNow] = React.useState(false);     // 👈 NUEVO
  const [timeFilter, setTimeFilter] = React.useState('');  // 👈 ventana

  // Ubicación
  const { userLocation, error: locError } = useUserLocation();
  const lat = userLocation?.latitude; 
  const lng = userLocation?.longitude;

  // Data (API + fallback al mock si no hay cercanos)
  const { data, loading, error } = useNearbyGyms(lat, lng, 10000);

  // Base de gyms para pedir horarios (data o MOCK_UI si no hay)
  const baseGyms: Gym[] = (data && data.length ? data : MOCK_UI);
  const baseIds = baseGyms.map(g => Number(g.id)).filter(n => Number.isFinite(n));

  // 🔹 Traemos horarios de todos los gyms base
  const { schedulesMap } = useGymSchedules(baseIds);


  // Filtrado (texto + servicios)
  const filteredGyms: Gym[] = useGymsFiltering(
    data, 
    MOCK_UI, 
    searchText, 
    selectedServices,
    priceFilter,
    openNow,
    timeFilter,
    schedulesMap
  );
  const resultsCount = filteredGyms.length;

  // Región + pines del mapa
  const initialRegion = useMapInitialRegion(lat, lng);
  const mapLocations = useMapLocations(filteredGyms.length ? filteredGyms : MOCK_UI);

  // Vista + badge filtros
  const isList = viewMode === 'list';
  const activeFilters = useActiveFiltersCount(selectedServices, priceFilter, timeFilter, openNow);

  return (
    <Screen scroll={!isList} contentContainerStyle={isList ? undefined : { paddingBottom: 24 }}>
      {/* Header */}
      <HeaderRow>
        <Title>Buscar gimnasios</Title>
        <HeaderActions
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenFilters={() => setFilterVisible(true)}
          activeFilters={activeFilters}
        />
      </HeaderRow>

      {/* Buscador */}
      <SearchBarContainer>
        <Input 
          placeholder="Buscar por nombre o dirección…" 
          value={searchText} 
          onChangeText={setSearchText} 
        />
      </SearchBarContainer>

      {/* Info de resultados (solo mapa) */}
      {!isList && (
        <ResultsInfo count={resultsCount} hasUserLocation={!!userLocation} />
      )}

      {/* Contenido */}
      {isList ? (
        <GymsList
          data={filteredGyms}
          headerText={
            `${resultsCount} gimnasio${resultsCount !== 1 ? 's' : ''} ` +
            `encontrado${resultsCount !== 1 ? 's' : ''}` +
            `${userLocation ? ' • ordenados por distancia' : ''}`
          }
        />
      ) : (
        <MapSection
          initialRegion={initialRegion}
          mapLocations={mapLocations}
          userLocation={lat && lng ? { latitude: lat, longitude: lng } : undefined}
          loading={loading || (!lat && !lng)}
          error={error}
          locError={locError}
          moreList={filteredGyms.slice(0, 3)}   // ✅ “Más cercanos” debajo del mapa
        />
      )}

      {/* Filtros */}
      <FiltersSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedServices={selectedServices}   setSelectedServices={setSelectedServices}
        priceFilter={priceFilter}             setPriceFilter={setPriceFilter}
        openNow={openNow}                    setOpenNow={setOpenNow}         // 👈
        timeFilter={timeFilter}              setTimeFilter={setTimeFilter}   
      />
    </Screen>
  );
}
