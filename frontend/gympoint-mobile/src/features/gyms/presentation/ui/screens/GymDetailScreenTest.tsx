import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';

type Props = GymDetailScreenProps & {
  dataSource?: 'api' | 'mocks' | null;
};

export function GymDetailScreenTest({ gym, onBack, onCheckIn, dataSource }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-bg-dark' : 'bg-gray-50'}`}>
      <View className={`p-4 mb-2 ${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 mt-2 rounded-lg shadow-sm`}>
        <Text className={`text-xl font-bold mb-3 ${isDark ? 'text-textPrimary-dark' : 'text-gray-800'}`}>
          🏋️ Gimnasio Cargado
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Nombre: {gym.name}
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Dirección: {gym.address}
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Distancia: {gym.distance.toFixed(1)} km
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Horarios: {gym.hours}
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Precio: ${gym.price || 'No disponible'}
        </Text>
        <Text className={`text-sm mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-600'}`}>
          Servicios: {gym.services.join(', ') || 'No disponibles'}
        </Text>
      </View>

      <View className={`p-4 mb-2 ${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 mt-2 rounded-lg shadow-sm`}>
        <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-textPrimary-dark' : 'text-gray-700'}`}>
          🎯 Información de Debug
        </Text>
        <Text className={`text-xs mb-1 font-mono ${isDark ? 'text-textMuted-dark' : 'text-gray-500'}`}>
          ID: {gym.id}
        </Text>
        <Text className={`text-xs mb-1 font-mono ${isDark ? 'text-textMuted-dark' : 'text-gray-500'}`}>
          Coordenadas: {gym.coordinates.join(', ')}
        </Text>
        <Text className={`text-xs mb-1 font-mono ${isDark ? 'text-textMuted-dark' : 'text-gray-500'}`}>
          En rango: {gym.distance <= 0.15 ? 'Sí' : 'No'}
        </Text>
        <Text className={`text-xs mb-1 font-mono ${isDark ? 'text-textMuted-dark' : 'text-gray-500'}`}>
          Rating: {gym.rating || 'No disponible'}
        </Text>
        <Text className={`text-xs mb-1 font-mono font-bold ${
          dataSource === 'api' 
            ? isDark ? 'text-green-400' : 'text-green-600'
            : isDark ? 'text-orange-400' : 'text-orange-600'
        }`}>
          Origen:{' '}
          {dataSource === 'api'
            ? '🌐 API'
            : dataSource === 'mocks'
              ? '📦 Mocks'
              : '❓ Desconocido'}
        </Text>
      </View>

      <View className={`p-4 mb-2 ${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 mt-2 rounded-lg shadow-sm`}>
        <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-textPrimary-dark' : 'text-gray-700'}`}>
          ⚙️ Equipamiento
        </Text>
        {gym.equipment ? (
          gym.equipment.map((eq, index) => (
            <View key={index} className="mb-2">
              <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-textPrimary-dark' : 'text-gray-600'}`}>
                {eq.icon} {eq.category}
              </Text>
              {eq.items.map((item, itemIndex) => (
                <Text key={itemIndex} className={`text-xs ml-4 mb-1 ${isDark ? 'text-textSecondary-dark' : 'text-gray-500'}`}>
                  • {item.name} (x{item.quantity})
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text className={`text-xs font-mono ${isDark ? 'text-textMuted-dark' : 'text-gray-500'}`}>
            No hay equipamiento disponible
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

