import { useMemo } from 'react';
import { useUserLocation } from '../../../../shared/hooks';

type UseGymsDataProps = {
  useNearbyGyms: (
    lat?: number,
    lng?: number,
    radius?: number,
  ) => {
    data: any[] | null;
    loading: boolean;
    error: any;
  };
  useGymSchedules: (ids: number[]) => { schedulesMap: any };
  useGymsFiltering: (
    data: any[],
    mockData: any[],
    searchText: string,
    selectedServices: string[],
    selectedAmenities: string[],
    selectedFeatures: string[],
    priceFilter: string,
    ratingFilter: string,
    openNow: boolean,
    timeFilter: string,
    schedulesMap: any,
    ratingsByGym?: Record<number, { averageRating: number; totalReviews: number }>,
  ) => any[];
  useMapInitialRegion: (lat?: number, lng?: number) => any;
  useMapLocations: (gyms: any[]) => any[];
  mockData: any[];
  searchText: string;
  selectedServices: string[];
  selectedAmenities: string[];
  selectedFeatures: string[];
  priceFilter: string;
  ratingFilter: string;
  openNow: boolean;
  timeFilter: string;
};

export function useGymsData({
  useNearbyGyms,
  useGymSchedules,
  useGymsFiltering,
  useMapInitialRegion,
  useMapLocations,
  mockData,
  searchText,
  selectedServices,
  selectedAmenities,
  selectedFeatures,
  priceFilter,
  ratingFilter,
  openNow,
  timeFilter,
}: UseGymsDataProps) {
  const { userLocation, error: locError } = useUserLocation();
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const { data, loading, error } = useNearbyGyms(latitude, longitude, 10000);

  // Usar solo datos reales, sin mocks/fallbacks
  const baseGyms = data || [];
  const baseIds = useMemo(
    () =>
      baseGyms
        .map((gym: any) => Number(gym.id))
        .filter((id: any): id is number => Number.isFinite(id)),
    [baseGyms],
  );
  const { schedulesMap } = useGymSchedules(baseIds);

  const filteredGyms = useGymsFiltering(
    data || [],
    [], // Sin mocks
    searchText,
    selectedServices,
    selectedAmenities,
    selectedFeatures,
    priceFilter,
    ratingFilter,
    openNow,
    timeFilter,
    schedulesMap,
    undefined, // ratingsByGym - será implementado después
  );

  const resultsCount = filteredGyms.length;
  const hasUserLocation = Boolean(userLocation);
  const initialRegion = useMapInitialRegion(latitude, longitude);
  const mapLocations = useMapLocations(filteredGyms); // Sin fallback a mocks
  const userLatLng = latitude && longitude ? { latitude, longitude } : undefined;
  const isLoading = loading || (!latitude && !longitude);
  const topNearbyGyms = filteredGyms.slice(0, 3);

  return {
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
  };
}
