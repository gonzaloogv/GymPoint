import React from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';
import { Screen, Card } from '@shared/components/ui';
import { useGymDetail } from '../../hooks/useGymDetail';
import { ScheduleCard } from '../components';
import { useGymSubscriptionStatus } from '@features/subscriptions';
import {
  GymLocationCard,
  GymServicesCard,
  GymPriceCard,
  GymSubscriptionCard,
  GymEquipmentCard,
  GymRulesCard,
  CheckInSection,
} from '../components/gym-detail';

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  console.log('🔴 [GymDetailScreen] gym.id:', gym.id, 'tipo:', typeof gym.id);
  console.log('🔴 [GymDetailScreen] gym completo:', gym);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch detailed gym data
  const { gym: gymDetail, schedules, loading, error, averageRating, totalReviews } = useGymDetail(gym.id);

  // Subscription status
  const subscriptionStatus = useGymSubscriptionStatus(
    gym.id,
    gym.name,
    gymDetail?.trial_allowed || false
  );

  // Additional info
  const additionalInfo = {
    phone: gymDetail?.phone || '',
    website: gymDetail?.website || '',
    email: gymDetail?.email || '',
    amenities: gymDetail?.amenities || [],
  };

  const price = gymDetail?.monthPrice ?? gym.price ?? 0;
  const gymRules = gymDetail?.rules || [];

  // Map equipment from API (categorized object) to array for display
  const equipmentByCategory = gymDetail?.equipment || {};
  const categoryIcons: Record<string, string> = {
    fuerza: '🏋️',
    cardio: '🏃',
    funcional: '🤸',
    pesas: '💪',
    maquinas: '⚙️',
  };

  const equipment = Object.entries(equipmentByCategory).map(([category, items]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    icon: categoryIcons[category.toLowerCase()] || '🏋️',
    items: items || [],
  }));

  const handleCall = () => {
    if (additionalInfo.phone) {
      Linking.openURL(`tel:${additionalInfo.phone}`);
    }
  };

  // Format schedules for display
  const formatScheduleText = () => {
    if (!schedules || schedules.length === 0) {
      return 'Sin información de horarios';
    }

    const DAY_MAP: Record<number, string> = {
      0: 'dom',
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
      6: 'sab',
    };

    const today = new Date().getDay();
    const todayKey = DAY_MAP[today];
    const todaySchedule = schedules.find((s) => s.day_of_week === todayKey);

    if (todaySchedule && !todaySchedule.closed && todaySchedule.opening_time && todaySchedule.closing_time) {
      return `${todaySchedule.opening_time.substring(0, 5)} - ${todaySchedule.closing_time.substring(0, 5)}`;
    }

    if (todaySchedule?.closed) {
      return 'Cerrado hoy';
    }

    return 'Ver horarios completos';
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center px-4">
          <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Error al cargar el gimnasio
          </Text>
          <Text className={`text-center ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            {error}
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-lg px-6 py-3 mt-4"
            onPress={onBack}
          >
            <Text className="text-onPrimary font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={onBack}>
              <Ionicons name="chevron-back" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </Pressable>
            <Text className={`ml-3 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {gym.name}
            </Text>
          </View>
        </View>

        {/* Rating and Schedule */}
        <View className="flex-row items-center justify-between px-4 pb-2">
          {totalReviews > 0 ? (
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-2">
                <Text style={{ fontSize: 16, marginRight: 4 }}>⭐</Text>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {averageRating.toFixed(1)}
                </Text>
              </View>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
              </Text>
            </View>
          ) : (
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sin reseñas aún
            </Text>
          )}

          <View className="flex-row items-center">
            <Feather name="clock" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatScheduleText()}
            </Text>
          </View>
        </View>

      {/* Location Card */}
      <GymLocationCard
        address={gym.address}
        city={gym.city}
        distance={gym.distance}
        coordinates={gym.coordinates}
      />

      {/* Services Card */}
      {gymDetail?.services && <GymServicesCard services={gymDetail.services} />}

      {/* Price Card */}
      <GymPriceCard price={price} />

      {/* Subscription Card */}
      <GymSubscriptionCard
        gymId={gym.id}
        gymName={gym.name}
        subscriptionStatus={subscriptionStatus}
      />

      {/* Equipment Card */}
      {equipment.length > 0 && <GymEquipmentCard equipment={equipment} />}

      {/* Schedule Card */}
      {schedules && schedules.length > 0 && (
        <Card className="mx-4 mt-4">
          <View className="flex-row items-center mb-3">
            <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
              <Feather name="clock" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text className={`text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Horarios
            </Text>
          </View>
          <ScheduleCard schedules={schedules} />
        </Card>
      )}

      {/* Contact Info */}
      {(additionalInfo.phone || additionalInfo.email || additionalInfo.website) && (
        <Card className="mx-4 mt-4">
          <View className="flex-row items-center mb-3">
            <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-green-500/30' : 'bg-green-100'}`}>
              <Feather name="phone" size={20} color={isDark ? '#4ade80' : '#22c55e'} />
            </View>
            <Text className={`text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Información de contacto
            </Text>
          </View>

          <View className="gap-3">
            {additionalInfo.phone && (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleCall}
              >
                <Feather name="phone" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
                <Text className={`ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {additionalInfo.phone}
                </Text>
              </TouchableOpacity>
            )}
            {additionalInfo.email && (
              <View className="flex-row items-center">
                <Feather name="mail" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
                <Text className={`ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {additionalInfo.email}
                </Text>
              </View>
            )}
            {additionalInfo.website && (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => Linking.openURL(additionalInfo.website)}
              >
                <Feather name="globe" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
                <Text className={`ml-2 ${isDark ? 'text-primary-light' : 'text-primary'} underline`}>
                  {additionalInfo.website}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* Rules Card */}
      <GymRulesCard rules={gymRules} />

      {/* Check-in Section */}
      <CheckInSection
        gymId={gym.id}
        gymName={gym.name}
        distance={gym.distance}
        subscriptionStatus={subscriptionStatus}
        onCheckIn={onCheckIn}
      />
      </View>
    </Screen>
  );
}
