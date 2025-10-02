import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearbyGyms } from '@features/gyms/hooks';
import { useCurrentLocation } from '@features/gyms/hooks';
import type { Gym as GymEntity } from '@features/gyms/domain/entities/Gym';
import { mapGymEntityToGymDetail } from '../utils/gymMapper';
import { GymDetailScreen } from './GymDetailScreen';
import { GymDetailScreenTest } from './GymDetailScreenTest';

type RootStackParamList = {
  App: undefined;
  GymDetail: { gymId: string };
};

type GymDetailRouteProp = RouteProp<RootStackParamList, 'GymDetail'>;
type GymDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GymDetail'>;

export function GymDetailScreenWrapper() {
  const route = useRoute<GymDetailRouteProp>();
  const navigation = useNavigation<GymDetailNavigationProp>();
  const { gymId } = route.params;

  // Obtener ubicación del usuario
  const { coords } = useCurrentLocation();
  
  // Debug de coordenadas
  console.log('📍 Coordenadas del usuario:', coords);
  
  // Obtener la lista de gimnasios para encontrar el seleccionado
  const { data: gymsData, loading: gymsLoading, error: gymsError, dataSource } = useNearbyGyms(
    coords?.latitude, 
    coords?.longitude
  );

  const gym = useMemo(() => {
    console.log('🔍 Buscando gimnasio:', { gymId, gymsDataLength: gymsData?.length });
    
    if (!gymsData || !gymId) {
      console.log('❌ No hay datos o gymId:', { gymsData: !!gymsData, gymId });
      return null;
    }
    
    console.log('📋 IDs disponibles:', gymsData.map(g => g.id));
    
    const foundGym = gymsData.find((g: GymEntity) => g.id === gymId);
    if (!foundGym) {
      console.log('❌ Gimnasio no encontrado con ID:', gymId);
      return null;
    }
    
    console.log('✅ Gimnasio encontrado:', foundGym.name);
    return mapGymEntityToGymDetail(foundGym);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando gimnasio...</Text>
      </View>
    );
  }

  if (gymsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'red' }}>
          Error al cargar el gimnasio: {String(gymsError)}
        </Text>
      </View>
    );
  }

  if (!gym) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          Gimnasio no encontrado (ID: {gymId})
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 8, color: 'gray' }}>
          Datos disponibles: {gymsData?.length || 0} gimnasios
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 4, color: 'blue' }}>
          Origen: {dataSource === 'api' ? '🌐 API' : dataSource === 'mocks' ? '📦 Mocks' : '❓ Desconocido'}
        </Text>
      </View>
    );
  }

  return (
    <GymDetailScreenTest
      gym={gym}
      onBack={handleBack}
      onCheckIn={handleCheckIn}
      dataSource={dataSource}
    />
  );
}
