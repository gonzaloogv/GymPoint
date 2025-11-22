import React, { useMemo, useCallback, useEffect } from 'react';
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

type GymDetailRouteProp = RouteProp<GymsStackParamList, 'GymDetail'>;
type GymDetailNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymDetail'>;

export function GymDetailScreenWrapper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const route = useRoute<GymDetailRouteProp>();
  const navigation = useNavigation<GymDetailNavigationProp>();
  const { gymId } = route.params;
  const queryClient = useQueryClient();

  // Obtener ubicación del usuario
  const { coords } = useCurrentLocation();

  // Obtener la lista de gimnasios para encontrar el seleccionado
  const { data: gymsData, loading: gymsLoading, error: gymsError, hasRequested } = useNearbyGyms(
    coords?.latitude,
    coords?.longitude,
  );

  const gym = useMemo(() => {
    if (!gymsData || !gymId) {
      return null;
    }

    const numericGymId = Number(gymId);
    const foundGym = gymsData.find((g: GymEntity) => Number(g.id) === numericGymId);

    if (!foundGym) {
      return null;
    }

    // Mapear la entidad Gym al formato esperado por GymDetailScreen
    return {
      id: foundGym.id,
      name: foundGym.name,
      distance: foundGym.distancia ? foundGym.distancia / 1000 : 0, // Convertir metros a km
      services: foundGym.equipment || [],
      hours: undefined, // Will be populated from schedules in useGymDetail
      rating: undefined, // Will be populated from reviews in useGymDetail
      address: foundGym.address || 'Dirección no disponible',
      city: foundGym.city || 'Ciudad no disponible',
      coordinates: [foundGym.lat, foundGym.lng] as [number, number],
      price: foundGym.monthPrice,
      equipment: [], // Will be populated from API data in GymDetailScreen
    };
  }, [gymsData, gymId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCheckIn = () => {
    // Implementar lógica de check-in
    // Aquí puedes agregar la lógica para hacer check-in
    // Por ejemplo, llamar a una API, mostrar un modal, etc.
  };

  /**
   * WebSocket callbacks para reviews
   */
  const handleNewReview = useCallback(() => {
    console.log('[GymDetailWrapper] New review received, invalidating queries...');
    // Invalidar queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-rating-stats', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  const handleReviewUpdated = useCallback(() => {
    console.log('[GymDetailWrapper] Review updated, invalidating queries...');
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-rating-stats', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  const handleRatingUpdated = useCallback(
    (data: { averageRating: number; totalReviews: number }) => {
      console.log('[GymDetailWrapper] Rating updated:', data);
      Toast.show({
        type: 'info',
        text1: 'Rating actualizado',
        text2: `${data.averageRating.toFixed(1)} ⭐ (${data.totalReviews} reseñas)`,
        position: 'bottom',
        visibilityTime: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
    },
    [queryClient, gymId],
  );

  const handleHelpfulUpdated = useCallback(() => {
    console.log('[GymDetailWrapper] Helpful updated, invalidating queries...');
    queryClient.invalidateQueries({ queryKey: ['gym-reviews', gymId] });
    queryClient.invalidateQueries({ queryKey: ['gym-detail', gymId] });
  }, [queryClient, gymId]);

  /**
   * WebSocket callbacks para check-ins
   */
  const handleCheckInUpdate = useCallback(
    (data: { userId: number; gymId: number }) => {
      console.log('[GymDetailWrapper] New check-in:', data);
      // Invalidar queries relacionadas con asistencias
      queryClient.invalidateQueries({ queryKey: ['assistance'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
    [queryClient],
  );

  const handleStreakUpdated = useCallback(
    (data: { currentStreak: number; longestStreak: number }) => {
      console.log('[GymDetailWrapper] Streak updated:', data);
      Toast.show({
        type: 'success',
        text1: '🔥 Racha actualizada',
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
    console.log('[GymDetailWrapper] Streak milestone:', data);
    Toast.show({
      type: 'success',
      text1: '🎉 ¡Hito alcanzado!',
      text2: data.message,
      position: 'top',
      visibilityTime: 5000,
      topOffset: 60,
    });
  }, []);

  /**
   * Registrar listeners de WebSocket
   */
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

  /**
   * Join gym room when component mounts to receive real-time updates
   */
  useEffect(() => {
    if (gymId) {
      console.log('[GymDetailWrapper] Joining gym room:', gymId);
      websocketService.joinGym(gymId);

      return () => {
        console.log('[GymDetailWrapper] Leaving gym room:', gymId);
        websocketService.leaveGym(gymId);
      };
    }
  }, [gymId]);

  // Estados de loading y error
  if (gymsLoading) {
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

  if (!gym) {
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

  return <GymDetailScreen gym={gym} onBack={handleBack} onCheckIn={handleCheckIn} />;
}

