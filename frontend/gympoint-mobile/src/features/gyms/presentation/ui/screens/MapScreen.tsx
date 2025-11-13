import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SurfaceScreen } from '@shared/components/ui';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SCREEN_CONTENT_STYLE } from '@shared/styles/layouts';

import { MAP_SECTION_HEIGHT } from '@features/gyms/domain/constants/map';
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
    mockData: [], // Sin mocks - mostrar datos reales de la base de datos
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
      innerStyle={{ paddingBottom: 0 }}
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

      <View className="pt-2">
        {/* VISTA DEFAULT: Mapa card + Botón expandir + Texto contador + Lista */}
        {isDefaultView && (
          <View className="gap-6">
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
              className={`flex-row items-center justify-center py-3 px-5 rounded-xl border gap-2 shadow-sm ${
                isDark
                  ? 'bg-gray-800/95 border-gray-700/80'
                  : 'bg-white/95 border-gray-200/80'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons
                name="expand-outline"
                size={20}
                color={isDark ? '#C7D2FE' : '#4338CA'}
              />
              <Text className={`text-sm font-semibold tracking-wide ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
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
          <View className="flex-1">
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
