import { useMemo, useState } from 'react';

import { Screen } from '@shared/components/ui';
import { useUserLocation } from '@shared/hooks/useUserLocation';

import { MAP_SECTION_HEIGHT } from '@features/gyms/constants';
import type { Gym } from '@features/gyms/domain/entities/Gym';
import { MOCK_UI } from '@features/gyms/mocks';
import { useActiveFiltersCount } from '@features/gyms/hooks/useActiveFiltersCount';
import { useGymsFiltering } from '@features/gyms/hooks/useGymsFiltering';
import { useMapInitialRegion } from '@features/gyms/hooks/useMapInitialRegion';
import { useMapLocations } from '@features/gyms/hooks/useMapLocations';
import { useNearbyGyms } from '@features/gyms/hooks/useNearbyGyms';
import { useGymSchedules } from '@features/gyms/hooks/useGymSchedule';

import FiltersSheet from './components/FiltersSheet';
import GymsList from './components/GymsList';
import MapSection from './components/MapSection';
import MapScreenHeader from './components/MapScreenHeader';
import ResultsInfo from './components/ResultsInfo';

const MAP_CONTENT_SPACING = { paddingBottom: 24 } as const;

const formatResultsLabel = (count: number, hasLocation: boolean) => {
  const plural = count === 1 ? '' : 's';
  const suffix = hasLocation ? ' • ordenados por distancia' : '';
  return `${count} gimnasio${plural} encontrado${plural}${suffix}`;
};

const getNumericIds = (gyms: Gym[]) =>
  gyms
    .map((gym) => Number(gym.id))
    .filter((id): id is number => Number.isFinite(id));

export default function MapScreen() {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');

  const { userLocation, error: locError } = useUserLocation();
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const { data, loading, error } = useNearbyGyms(latitude, longitude, 10000);

  const baseGyms: Gym[] = data?.length ? data : MOCK_UI;
  const baseIds = useMemo(() => getNumericIds(baseGyms), [baseGyms]);
  const { schedulesMap } = useGymSchedules(baseIds);

  const filteredGyms = useGymsFiltering(
    data,
    MOCK_UI,
    searchText,
    selectedServices,
    priceFilter,
    openNow,
    timeFilter,
    schedulesMap,
  );

  const resultsCount = filteredGyms.length;
  const hasUserLocation = Boolean(userLocation);
  const initialRegion = useMapInitialRegion(latitude, longitude);
  const mapLocations = useMapLocations(filteredGyms.length ? filteredGyms : MOCK_UI);
  const activeFilters = useActiveFiltersCount(
    selectedServices,
    priceFilter,
    timeFilter,
    openNow,
  );

  const isListView = viewMode === 'list';
  const contentPadding = isListView ? undefined : MAP_CONTENT_SPACING;
  const userLatLng =
    latitude && longitude ? { latitude, longitude } : undefined;
  const isLoading = loading || (!latitude && !longitude);
  const topNearbyGyms = filteredGyms.slice(0, 3);
  const listHeader = formatResultsLabel(resultsCount, hasUserLocation);

  return (
    <Screen scroll={!isListView} contentContainerStyle={contentPadding}>
      <MapScreenHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenFilters={() => setFilterVisible(true)}
        activeFilters={activeFilters}
        searchText={searchText}
        onChangeSearch={setSearchText}
      />

      {!isListView && (
        <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />
      )}

      {isListView ? (
        <GymsList data={filteredGyms} headerText={listHeader} />
      ) : (
        <MapSection
          initialRegion={initialRegion}
          mapLocations={mapLocations}
          userLocation={userLatLng}
          loading={isLoading}
          error={error}
          locError={locError}
          moreList={topNearbyGyms}
          mapHeight={MAP_SECTION_HEIGHT}
          showUserFallbackPin
        />
      )}

      <FiltersSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        openNow={openNow}
        setOpenNow={setOpenNow}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />
    </Screen>
  );
}
