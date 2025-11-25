import React, { useMemo, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearbyGyms } from '@features/gyms/presentation/hooks/useNearbyGyms';
import { useCurrentLocation } from '@features/gyms/presentation/hooks/useCurrentLocation';
import type { Gym as GymEntity } from '@features/gyms/domain/entities/Gym';
import { GymDetailScreen } from './GymDetailScreen';
import type { GymsStackParamList } from '@presentation/navigation/types';
import { useTheme, useReviewUpdates, useCheckInUpdates } from '@shared/hooks';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '@shared/services/websocket.service';
import { DI } from '@di/container';

type GymDetailRouteProp = RouteProp<GymsStackParamList, 'GymDetail'>;
type GymDetailNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymDetail'>;

const mapGymEntityToDetail = (foundGym: GymEntity) => ({
  id: foundGym.id,
  name: foundGym.name,
  distance: foundGym.distancia ? foundGym.distancia / 1000 : 0, // metros a km
  services: foundGym.equipment || [],
  hours: undefined,
  rating: undefined,
  address: foundGym.address || 'Dirección no disponible',
  city: foundGym.city || 'Ciudad no disponible',
  coordinates: [foundGym.lat, foundGym.lng] as [number, number],
  price: foundGym.monthPrice,
  equipment: [],
});

export function GymDetailScreenWrapper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const route = useRoute<GymDetailRouteProp>();
  const navigation = useNavigation<GymDetailNavigationProp>();
  const { gymId } = route.params;
  const queryClient = useQueryClient();

  const { coords } = useCurrentLocation();

  const { data: gymsData, loading: gymsLoading, error: gymsError } = useNearbyGyms(
    coords?.latitude,
    coords?.longitude,
  );

  const gym = useMemo(() => {
    if (!gymsData || !gymId) return null;
    const numericGymId = Number(gymId);
    const foundGym = gymsData.find((g: GymEntity) => Number(g.id) === numericGymId);
    return foundGym ? mapGymEntityToDetail(foundGym) : null;
  }, [gymsData, gymId]);

  const [fallbackGym, setFallbackGym] = React.useState<ReturnType<typeof mapGymEntityToDetail> | null>(null);
  const [fallbackLoading, setFallbackLoading] = React.useState(false);

  useEffect(() => {
    let cancelled = false;
    const numericGymId = Number(gymId);
    if (gym || fallbackGym || !gymId || !Number.isFinite(numericGymId)) return;

    setFallbackLoading(true);
    DI.gymRepository
      .getById(String(numericGymId))
      .then((found) => {
        if (!cancelled && found) {
          setFallbackGym(mapGymEntityToDetail(found));
        }
      })
      .finally(() => {
        if (!cancelled) setFallbackLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gym, gymId, fallbackGym]);

  const resolvedGym = gym || fallbackGym;

  const handleBack = () => navigation.goBack();

  const handleCheckIn = () => {
    // TODO: Implementar check-in
  };

  const handleNewReview = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-rating-stats', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  const handleReviewUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-rating-stats', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  const handleRatingUpdated = useCallback(
    (data: { averageRating: number; totalReviews: number }) => {
      Toast.show({
        type: 'info',
        text1: 'Rating actualizado',
        text2: `${data.averageRating.toFixed(1)} ★ (${data.totalReviews} reseñas)`,
        position: 'bottom',
        visibilityTime: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
    },
    [queryClient, gymId],
  );

  const handleHelpfulUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  const handleCheckInUpdate = useCallback(
    (data: { userId: number; gymId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['assistance'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
    [queryClient],
  );

  const handleStreakUpdated = useCallback(
    (data: { currentStreak: number; longestStreak: number }) => {
      Toast.show({
        type: 'success',
        text1: 'Racha actualizada',
        text2: `${data.currentStreak} día${data.currentStreak !== 1 ? 's' : ''} consecutivo${data.currentStreak !== 1 ? 's' : ''}`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
    [queryClient],
  );

  const handleStreakMilestone = useCallback((data: { milestone: number; message: string }) => {
    Toast.show({
      type: 'success',
      text1: '¡Hito alcanzado!',
      text2: data.message,
      position: 'top',
      visibilityTime: 5000,
      topOffset: 60,
    });
  }, []);

  useReviewUpdates(gymId, {
    onNewReview: handleNewReview,
    onReviewUpdated: handleReviewUpdated,
    onRatingUpdated: handleRatingUpdated,
    onHelpfulUpdated: handleHelpfulUpdated,
  });

  useCheckInUpdates({
    onCheckIn: handleCheckInUpdate,
    onStreakUpdated: handleStreakUpdated,
    onStreakMilestone: handleStreakMilestone,
  });

  useEffect(() => {
    if (!gymId) return;
    websocketService.joinGym(gymId);
    return () => websocketService.leaveGym(gymId);
  }, [gymId]);

  if ((gymsLoading || fallbackLoading) && !resolvedGym) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#111827'} />
        <Text className="mt-4" style={{ color: isDark ? '#ffffff' : '#111827' }}>
          Cargando gimnasio...
        </Text>
      </View>
    );
  }

  if (gymsError) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-base text-center" style={{ color: isDark ? '#F87171' : '#DC2626' }}>
          Error al cargar el gimnasio: {String(gymsError)}
        </Text>
      </View>
    );
  }

  if (!resolvedGym) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-base text-center" style={{ color: isDark ? '#ffffff' : '#111827' }}>
          Gimnasio no encontrado (ID: {gymId})
        </Text>
        <Text className="text-sm text-center mt-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          Datos disponibles: {gymsData?.length || 0} gimnasios
        </Text>
      </View>
    );
  }

  return <GymDetailScreen gym={resolvedGym} onBack={handleBack} onCheckIn={handleCheckIn} />;
}
