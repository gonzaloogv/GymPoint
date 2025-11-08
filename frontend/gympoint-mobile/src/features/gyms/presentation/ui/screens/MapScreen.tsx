import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SurfaceScreen } from '@shared/components/ui';
import { View, StyleSheet } from 'react-native';
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
    selectedAmenities,
    selectedFeatures,
    priceFilter,
    ratingFilter,
    openNow,
    timeFilter,
    setSelectedServices,
    setSelectedAmenities,
    setSelectedFeatures,
    setPriceFilter,
    setRatingFilter,
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
    selectedAmenities,
    selectedFeatures,
    priceFilter,
    ratingFilter,
    openNow,
    timeFilter,
  });

  const activeFilters = useActiveFiltersCount(
    selectedServices,
    selectedAmenities,
    selectedFeatures,
    priceFilter,
    ratingFilter,
    timeFilter,
    openNow,
  );

  const listHeader = formatResultsLabel(resultsCount, hasUserLocation);

  const handleGymPress = (gymId: string | number) => {
    const numericGymId = typeof gymId === 'string' ? parseInt(gymId, 10) : gymId;
    navigation.navigate('GymDetail', { gymId: numericGymId });
  };

  const scroll = !isListView;

  return (
    <SurfaceScreen
      scroll={scroll}
      contentContainerStyle={scroll ? styles.scrollContent : styles.staticContent}
      innerStyle={styles.inner}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.body, isListView && styles.bodyList]}>
        <MapScreenHeader
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenFilters={openFilters}
          activeFilters={activeFilters}
          searchText={searchText}
          onChangeSearch={setSearchText}
        />

        {!isListView && (
          <View style={styles.mapModeContent}>
            <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />
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
          </View>
        )}

        {isListView ? (
          <View style={styles.listWrapper}>
            <GymsList
              data={filteredGyms}
              headerText={listHeader}
              onPressItem={handleGymPress}
            />
          </View>
        ) : null}
      </View>

      <FiltersSheet
        visible={filterVisible}
        onClose={closeFilters}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        selectedAmenities={selectedAmenities}
        setSelectedAmenities={setSelectedAmenities}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        openNow={openNow}
        setOpenNow={setOpenNow}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />
    </SurfaceScreen>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  staticContent: {
    flex: 1,
    paddingBottom: 0,
  },
  body: {
    flexGrow: 1,
  },
  bodyList: {
    flex: 1,
  },
  mapModeContent: {
    gap: 16,
  },
  listWrapper: {
    flex: 1,
  },
});
