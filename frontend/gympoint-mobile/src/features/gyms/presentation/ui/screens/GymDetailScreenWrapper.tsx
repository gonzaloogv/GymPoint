import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearbyGyms } from '@features/gyms/presentation/hooks/useNearbyGyms';
import { useCurrentLocation } from '@features/gyms/presentation/hooks/useCurrentLocation';
import type { Gym as GymEntity } from '@features/gyms/domain/entities/Gym';
import { GymDetailScreen } from './GymDetailScreen';
import type { GymsStackParamList } from '@presentation/navigation/types';
import { useTheme } from '@shared/hooks';

type GymDetailRouteProp = RouteProp<GymsStackParamList, 'GymDetail'>;
type GymDetailNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymDetail'>;

export function GymDetailScreenWrapper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const route = useRoute<GymDetailRouteProp>();
  const navigation = useNavigation<GymDetailNavigationProp>();
  const { gymId } = route.params;

  // Obtener ubicación del usuario
  const { coords } = useCurrentLocation();

  // Debug de coordenadas
  console.log('📍 Coordenadas del usuario:', coords);

  // Obtener la lista de gimnasios para encontrar el seleccionado
  const {
    data: gymsData,
    loading: gymsLoading,
    error: gymsError,
    dataSource,
  } = useNearbyGyms(coords?.latitude, coords?.longitude);

  const gym = useMemo(() => {
    console.log('🔍 Buscando gimnasio:', { gymId, gymsDataLength: gymsData?.length, gymIdType: typeof gymId });

    if (!gymsData || !gymId) {
      console.log('❌ No hay datos o gymId:', { gymsData: !!gymsData, gymId });
      return null;
    }

    console.log('📋 IDs disponibles:', gymsData.map((g) => ({ id: g.id, type: typeof g.id })));
    console.log('📋 Comparando gymId:', gymId, 'con tipo:', typeof gymId);

    const foundGym = gymsData.find((g: GymEntity) => {
      const match = g.id === gymId;
      console.log(`  Comparando ${g.id} (${typeof g.id}) === ${gymId} (${typeof gymId}) -> ${match}`);
      return match;
    });

    if (!foundGym) {
      console.log('❌ Gimnasio no encontrado con ID:', gymId, 'tipo:', typeof gymId);
      console.log('❌ Intentando comparación flexible (== en lugar de ===)');
      const foundGymFlexible = gymsData.find((g: GymEntity) => g.id == gymId);
      if (foundGymFlexible) {
        console.log('✅ Encontrado con ==:', foundGymFlexible.name, 'ID:', foundGymFlexible.id);
        // Usar foundGymFlexible para mapear
        return {
          id: foundGymFlexible.id,
          name: foundGymFlexible.name,
          distance: foundGymFlexible.distancia ? foundGymFlexible.distancia / 1000 : 0,
          services: foundGymFlexible.equipment || [],
          hours: undefined,
          rating: undefined,
          address: foundGymFlexible.address || 'Dirección no disponible',
          city: foundGymFlexible.city || 'Ciudad no disponible',
          coordinates: [foundGymFlexible.lat, foundGymFlexible.lng] as [number, number],
          price: foundGymFlexible.monthPrice,
          equipment: [],
        };
      }
      return null;
    }

    console.log('✅ Gimnasio encontrado:', foundGym.name);

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
    console.log('Check-in en gimnasio:', gym?.name);
    // Aquí puedes agregar la lógica para hacer check-in
    // Por ejemplo, llamar a una API, mostrar un modal, etc.
  };

  // Estados de loading y error
  if (gymsLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
          Cargando gimnasio...
        </Text>
      </View>
    );
  }

  if (gymsError) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className={`text-base text-center text-red-500 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          Error al cargar el gimnasio: {String(gymsError)}
        </Text>
      </View>
    );
  }

  if (!gym) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className={`text-base text-center ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
          Gimnasio no encontrado (ID: {gymId})
        </Text>
        <Text className={`text-sm text-center mt-2 ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
          Datos disponibles: {gymsData?.length || 0} gimnasios
        </Text>
        <Text className={`text-xs text-center mt-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
          Origen:{' '}
          {dataSource === 'api'
            ? '🌐 API'
            : dataSource === 'mocks'
              ? '📦 Mocks'
              : '❓ Desconocido'}
        </Text>
      </View>
    );
  }

  return <GymDetailScreen gym={gym} onBack={handleBack} onCheckIn={handleCheckIn} />;
}
