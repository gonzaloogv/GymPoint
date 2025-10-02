import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GymsScreenLayout } from '@shared/components/ui';
import { useGymsData, useGymsFilters, useGymsView } from '@shared/hooks';
import { formatResultsLabel } from '@shared/utils';

import { MAP_SECTION_HEIGHT } from '@features/gyms/constants';
import { MOCK_UI } from '@features/gyms/mocks';
import { useActiveFiltersCount } from '@features/gyms/hooks/useActiveFiltersCount';
import { useGymsFiltering } from '@features/gyms/hooks/useGymsFiltering';
import { useMapInitialRegion } from '@features/gyms/hooks/useMapInitialRegion';
import { useMapLocations } from '@features/gyms/hooks/useMapLocations';
import { useNearbyGyms } from '@features/gyms/hooks/useNearbyGyms';
import { useGymSchedules } from '@features/gyms/hooks/useGymSchedule';

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
    <GymsScreenLayout isListView={isListView}>
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
        <GymsList data={filteredGyms} headerText={listHeader} onPressItem={handleGymPress} />
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
    </GymsScreenLayout>
  );
}
