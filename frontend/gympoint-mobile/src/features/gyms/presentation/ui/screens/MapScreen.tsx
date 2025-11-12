import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SurfaceScreen } from '@shared/components/ui';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SCREEN_CONTENT_STYLE } from '@shared/styles/layouts';

import { MAP_SECTION_HEIGHT } from '@features/gyms/domain/constants/map';
import { MOCK_UI } from '@features/gyms/data/datasources/GymMocks';
import {
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
import GymScreenHeader from '../components/map/GymScreenHeader';
import FullscreenMapModal from '../components/map/FullscreenMapModal';
import ResultsInfo from '../components/list/ResultsInfo';
import type { GymsStackParamList } from '@presentation/navigation/types';

type GymsNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymsList'>;

export default function MapScreen() {
  const navigation = useNavigation<GymsNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Custom hooks for state management
  // Inicializa en vista 'default' (mapa card + lista)
  const { viewMode, setViewMode, isDefaultView, isListView, openFullscreenMap, closeFullscreenMap } =
    useGymsView('default');
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

  const handleGymPress = (gymId: string | number) => {
    const numericGymId = typeof gymId === 'string' ? parseInt(gymId, 10) : gymId;
    navigation.navigate('GymDetail', { gymId: numericGymId });
  };

  // Scroll siempre activo (excepto cuando no hay contenido)
  const shouldScroll = true;

  return (
    <SurfaceScreen
      scroll={shouldScroll}
      contentContainerStyle={SCREEN_CONTENT_STYLE}
      innerStyle={styles.inner}
      edges={['top', 'left', 'right']}
    >
      {/* Header siempre visible */}
      <GymScreenHeader
        searchText={searchText}
        onChangeSearch={setSearchText}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenFilters={openFilters}
      />

      <View style={styles.body}>
        {/* VISTA DEFAULT: Mapa card + Botón expandir + Texto contador + Lista */}
        {isDefaultView && (
          <View style={styles.defaultViewContent}>
            {/* Mapa como card */}
            <MapSection
              initialRegion={initialRegion}
              mapLocations={mapLocations}
              userLocation={userLatLng}
              loading={isLoading}
              error={error}
              locError={locError}
              mapHeight={MAP_SECTION_HEIGHT}
              showUserFallbackPin
            />

            {/* Botón Expandir Mapa */}
            <TouchableOpacity
              onPress={openFullscreenMap}
              activeOpacity={0.75}
              style={[
                styles.expandMapButton,
                {
                  backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(229, 231, 235, 0.8)',
                },
              ]}
            >
              <Ionicons
                name="expand-outline"
                size={20}
                color={isDark ? '#C7D2FE' : '#4338CA'}
              />
              <Text
                style={[
                  styles.expandMapText,
                  { color: isDark ? '#C7D2FE' : '#4338CA' },
                ]}
              >
                Expandir Mapa
              </Text>
            </TouchableOpacity>

            {/* Texto contador: "6 gimnasios encontrados..." */}
            <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />

            {/* Lista de gimnasios */}
            <GymsList
              data={filteredGyms}
              onPressItem={handleGymPress}
            />
          </View>
        )}

        {/* VISTA LISTA: Solo texto contador + lista (sin mapa) */}
        {isListView && (
          <View style={styles.listViewContent}>
            {/* Texto contador: "6 gimnasios encontrados..." */}
            <ResultsInfo count={resultsCount} hasUserLocation={hasUserLocation} />

            {/* Lista de gimnasios */}
            <GymsList
              data={filteredGyms}
              onPressItem={handleGymPress}
            />
          </View>
        )}
      </View>

      {/* Modal de Mapa Fullscreen */}
      <FullscreenMapModal
        visible={viewMode === 'fullscreen'}
        onClose={closeFullscreenMap}
        initialRegion={initialRegion}
        mapLocations={mapLocations}
        userLocation={userLatLng}
        showUserFallbackPin
      />

      {/* Filters Sheet */}
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
  body: {
    paddingTop: 8,            // Separación del header
  },
  defaultViewContent: {
    gap: 24,                  // Consistente con SCREEN_GAP
  },
  listViewContent: {
    flex: 1,                  // Solo flex, sin paddingHorizontal
  },
  expandMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  expandMapText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
