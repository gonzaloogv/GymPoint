import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearbyGyms } from '@features/gyms/hooks';
import { useCurrentLocation } from '@features/gyms/hooks';
import type { Gym as GymEntity } from '@features/gyms/domain/entities/Gym';
import { GymDetailScreen } from './GymDetailScreen';
import type { GymsStackParamList } from '@presentation/navigation/types';

type GymDetailRouteProp = RouteProp<GymsStackParamList, 'GymDetail'>;
type GymDetailNavigationProp = NativeStackNavigationProp<GymsStackParamList, 'GymDetail'>;

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
    
    // Mapear la entidad Gym al formato esperado por GymDetailScreen
    return {
      id: foundGym.id,
      name: foundGym.name,
      distance: foundGym.distancia ? foundGym.distancia / 1000 : 0, // Convertir metros a km
      services: foundGym.equipment || ['Pesas', 'Cardio', 'Funcional'],
      hours: '6:00 - 23:00',
      rating: 4.5,
      address: foundGym.address || 'Dirección no disponible',
      coordinates: [foundGym.lat, foundGym.lng] as [number, number],
      price: foundGym.monthPrice,
      equipment: [
        {
          category: 'Máquinas de peso',
          icon: '🏋️',
          items: [
            { name: 'Prensa', quantity: 2 },
            { name: 'Polea', quantity: 3 },
            { name: 'Extensión de piernas', quantity: 3 }
          ]
        },
        {
          category: 'Cardio',
          icon: '🏃',
          items: [
            { name: 'Cintas de correr', quantity: 10 },
            { name: 'Bicicletas fijas', quantity: 5 }
          ]
        },
        {
          category: 'Pesas libres',
          icon: '💪',
          items: [
            { name: 'Mancuernas', quantity: 12 },
            { name: 'Barras', quantity: 8 }
          ]
        }
      ]
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
    <GymDetailScreen
      gym={gym}
      onBack={handleBack}
      onCheckIn={handleCheckIn}
    />
  );
}
