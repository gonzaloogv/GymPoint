import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@shared/components/ui';
import { formatResultsLabel } from '@shared/utils';

import { MAP_SECTION_HEIGHT } from '@features/gyms/domain/constants/map';
import { MOCK_UI } from '@features/gyms/data/datasources/GymMocks';
import {
  useActiveFiltersCount,
  useGymSchedules,
  useGymsData,
  useGymsFiltering,
  useGymsFilters,
  useGymsView,
  useMapInitialRegion,
  useMapLocations,
  useNearbyGyms,
} from '@features/gyms/presentation/hooks';

import FiltersSheet from '../components/list/FiltersSheet';
import GymsList from '../components/list/GymsList';
import MapSection from '../components/map/MapSection';
import MapScreenHeader from '../components/map/MapScreenHeader';
import ResultsInfo from '../components/list/ResultsInfo';
import type { GymsStackParamList } from '@presentation/navigation/types';

type GymsNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymsList'>;

export default function MapScreen() {
  const navigation = useNavigation<GymsNavigationProp>();
  const [searchText, setSearchText] = useState('');

  // Custom hooks for state management
  const { viewMode, setViewMode, isListView } = useGymsView('map');
  const {
    filterVisible,
    selectedServices,
    priceFilter,
    openNow,
    timeFilter,
    setFilterVisible,
    setSelectedServices,
    setPriceFilter,
    setOpenNow,
    setTimeFilter,
    openFilters,
    closeFilters,
  } = useGymsFilters();

  // Data management
  const {
    filteredGyms,
    resultsCount,
    hasUserLocation,
    initialRegion,
    mapLocations,
    userLatLng,
    isLoading,
    topNearbyGyms,
    locError,
    error,
  } = useGymsData({
    useNearbyGyms,
    useGymSchedules,
    useGymsFiltering,
    useMapInitialRegion,
    useMapLocations,
    mockData: MOCK_UI,
    searchText,
    selectedServices,
    priceFilter,
    openNow,
    timeFilter,
  });

  const activeFilters = useActiveFiltersCount(
    selectedServices,
    priceFilter,
    timeFilter,
    openNow,
  );

  const listHeader = formatResultsLabel(resultsCount, hasUserLocation);

  const handleGymPress = (gymId: string | number) => {
    navigation.navigate('GymDetail', { gymId: gymId.toString() });
  };

  return (
    <Screen
      scroll={!isListView}
      contentContainerStyle={!isListView ? { paddingBottom: 24 } : undefined}
    >
      <MapScreenHeader
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenFilters={openFilters}
        activeFilters={activeFilters}
        searchText={searchText}
        onChangeSearch={setSearchText}
      />

      {!isListView && (
        <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />
      )}

      {isListView ? (
        <GymsList
          data={filteredGyms}
          headerText={listHeader}
          onPressItem={handleGymPress}
        />
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
          onGymPress={handleGymPress}
        />
      )}

      <FiltersSheet
        visible={filterVisible}
        onClose={closeFilters}
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
