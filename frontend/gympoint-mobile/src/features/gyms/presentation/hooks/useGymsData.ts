import { useMemo } from 'react';
import { useUserLocation } from '../../../../shared/hooks';

type UseGymsDataProps = {
  useNearbyGyms: (lat?: number, lng?: number, radius?: number) => {
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
    priceFilter: string,
    openNow: boolean,
    timeFilter: string,
    schedulesMap: any
  ) => any[];
  useMapInitialRegion: (lat?: number, lng?: number) => any;
  useMapLocations: (gyms: any[]) => any[];
  mockData: any[];
  searchText: string;
  selectedServices: string[];
  priceFilter: string;
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
  priceFilter,
  openNow,
  timeFilter,
}: UseGymsDataProps) {
  const { userLocation, error: locError } = useUserLocation();
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const { data, loading, error } = useNearbyGyms(latitude, longitude, 10000);

  const baseGyms = data?.length ? data : mockData;
  const baseIds = useMemo(
    () => baseGyms
      .map((gym: any) => Number(gym.id))
      .filter((id: any): id is number => Number.isFinite(id)),
    [baseGyms]
  );
  const { schedulesMap } = useGymSchedules(baseIds);

  const filteredGyms = useGymsFiltering(
    data || [],
    mockData,
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
  const mapLocations = useMapLocations(filteredGyms.length ? filteredGyms : mockData);
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
