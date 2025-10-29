import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Pressable, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';
import { Screen, Card } from '@shared/components/ui';
import { useGymDetail } from '../../hooks/useGymDetail';
import { ScheduleCard } from '../components';


export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const isInRange = gym.distance <= 0.15;

  // Fetch detailed gym data
  const { gym: gymDetail, schedules, loading, error, averageRating, totalReviews } = useGymDetail(gym.id);

  // Use real data from API only
  const gymRules = gymDetail?.rules || [];

  const additionalInfo = {
    phone: gymDetail?.phone || '',
    website: gymDetail?.website || '',
    email: gymDetail?.email || '',
    amenities: gymDetail?.amenities || [],
  };

  const price = gymDetail?.monthPrice ?? gym.price ?? 0;

  // Map equipment from API (categorized object) to array for display
  const equipmentByCategory = gymDetail?.equipment || {};

  // Icon mapping for equipment categories
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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const getTotalQuantity = (items: { name: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${gym.coordinates[0]},${gym.coordinates[1]}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${additionalInfo.phone}`);
  };

  // Format schedules for display
  const formatScheduleText = () => {
    if (!schedules || schedules.length === 0) {
      return 'Sin información de horarios';
    }

    // Map day number to day_of_week string
    const DAY_MAP: Record<number, string> = {
      0: 'dom',
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
      6: 'sab',
    };

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayKey = DAY_MAP[today];
    const todaySchedule = schedules.find(s => s.day_of_week === todayKey);

    if (todaySchedule && !todaySchedule.closed && todaySchedule.opening_time && todaySchedule.closing_time) {
      return `${todaySchedule.opening_time.substring(0, 5)} - ${todaySchedule.closing_time.substring(0, 5)}`;
    }

    if (todaySchedule?.closed) {
      return 'Cerrado hoy';
    }

    return 'Sin información de horarios';
  };

  return (
    <Screen
      scroll={true}
      safeAreaTop={true}
      safeAreaBottom={false}
    >
      {/* Header with Back Button */}
      <View className="flex-row items-center px-4 pt-2 pb-2">
        <Pressable onPress={onBack} className="mr-2">
          <Ionicons name="chevron-back" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
        </Pressable>
        <Text className={`flex-1 text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`} numberOfLines={1}>
          Detalles del Gimnasio
        </Text>
        {loading && (
          <ActivityIndicator size="small" color="#4A9CF5" />
        )}
      </View>

      {/* Hero Image */}
      <View className={`h-44 ${isDark ? 'bg-primary/20' : 'bg-primary/20'} rounded-2xl mx-4 mt-2 justify-center items-center`}>
        <View className="items-center">
          <View className={`w-16 h-16 ${isDark ? 'bg-primary/30' : 'bg-primary/30'} rounded-full justify-center items-center mb-2`}>
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </View>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>Foto del gimnasio</Text>
        </View>
      </View>

      {/* Basic Info Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {gym.name}
        </Text>

        {(averageRating !== null || totalReviews > 0) && (
          <View className="flex-row items-center mb-3">
            <Feather name="star" size={16} color="#FFD700" />
            <Text className={`font-semibold ml-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {averageRating ? averageRating.toFixed(1) : 'N/A'}
            </Text>
            <Text className={`text-sm ml-1 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
            </Text>
          </View>
        )}

        <View className="flex-row items-center mb-2">
          <Feather name="map-pin" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {gym.address}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            • {gym.distance.toFixed(1)} km
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Feather name="clock" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {formatScheduleText()}
          </Text>
          {schedules && schedules.length > 0 && (() => {
            const DAY_MAP: Record<number, string> = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };
            const today = new Date().getDay();
            const todayKey = DAY_MAP[today];
            const todaySchedule = schedules.find(s => s.day_of_week === todayKey);
            const isOpen = todaySchedule && !todaySchedule.closed;

            return isOpen ? (
              <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1 ml-2">
                <Text className="text-xs font-semibold text-green-600">Abierto ahora</Text>
              </View>
            ) : (
              <View className="bg-red-500/20 border border-red-500/40 rounded-2xl px-3 py-1 ml-2">
                <Text className="text-xs font-semibold text-red-600">Cerrado</Text>
              </View>
            );
          })()}
        </View>

        <TouchableOpacity
          className={`${isDark ? 'border-border-dark' : 'border-border'} border rounded-lg px-4 py-3 flex-row items-center justify-center mt-2`}
          onPress={openInMaps}
        >
          <Feather name="external-link" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Abrir en Maps
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Services Card */}
      {gymDetail?.services && gymDetail.services.length > 0 && (
        <Card className="mx-4 mt-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Servicios disponibles
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {gymDetail.services.map((service, index) => (
              <View key={index} className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-full px-4 py-2`}>
                <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Price Card */}
      <Card className="mx-4 mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-lg justify-center items-center mr-4 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
            <Feather name="dollar-sign" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
          </View>
          <View>
            <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Precio mensual
            </Text>
            <Text className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              ${price.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
        <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1">
          <Text className="text-xs font-semibold text-green-600">Por mes</Text>
        </View>
      </Card>

      {/* Equipment Card */}
      {equipment.length > 0 && (
        <Card className="mx-4 mt-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Maquinaria disponible
          </Text>
          {equipment.map((category, index) => {
          const isExpanded = expandedCategories.includes(category.category);
          const totalQuantity = getTotalQuantity(category.items);

          return (
            <View key={index} className="mb-2">
              <TouchableOpacity
                className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-lg p-3 flex-row items-center justify-between`}
                onPress={() => toggleCategory(category.category)}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
                    <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {category.category}
                    </Text>
                  </View>
                  <View className={`${isDark ? 'bg-surface-dark' : 'bg-surface'} rounded-2xl px-3 py-1 mr-2`}>
                    <Text className={`text-xs font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {totalQuantity}
                    </Text>
                  </View>
                  <Feather
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={16}
                    color={isDark ? '#B0B8C8' : '#666666'}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="ml-4 mt-2">
                  {category.items.map((item, itemIndex) => (
                    <View key={itemIndex} className={`flex-row items-center justify-between p-3 ${isDark ? 'bg-surfaceVariant-dark/50' : 'bg-surfaceVariant/50'} rounded-lg mb-1`}>
                      <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
                          {item.name}
                        </Text>
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                        {item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        </Card>
      )}

      {/* Contact & Info Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Información de contacto
        </Text>

        {additionalInfo.phone && (
          <TouchableOpacity onPress={handleCall}>
            <View className="flex-row items-center mb-3">
              <Feather name="phone" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
              <Text className={`text-sm ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {additionalInfo.phone}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {additionalInfo.email && (
          <View className="flex-row items-center mb-3">
            <Feather name="mail" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
            <Text className={`text-sm ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {additionalInfo.email}
            </Text>
          </View>
        )}

        {additionalInfo.website && (
          <View className="flex-row items-center mb-3">
            <Feather name="globe" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
            <Text className="text-sm ml-2 text-blue-500">{additionalInfo.website}</Text>
          </View>
        )}

        {additionalInfo.amenities.length > 0 && (
          <View className="mt-2">
            <Text className={`font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Comodidades
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {additionalInfo.amenities.map((amenity) => (
                <View
                  key={amenity.id_amenity}
                  className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-full px-3 py-1.5`}
                >
                  <Text className={`text-xs ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    {amenity.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Schedule */}
      {schedules && schedules.length > 0 && (
        <View className="mx-4 mt-4">
          <ScheduleCard schedules={schedules} isDark={isDark} />
        </View>
      )}

      {/* Rules Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Reglas del gimnasio
        </Text>
        {gymRules.length > 0 ? (
          <View className="gap-2">
            {gymRules.map((rule, index) => (
              <View key={index} className="flex-row items-start">
                <View className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2" />
                <Text className={`text-sm flex-1 ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {rule}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            El gimnasio no tiene reglas registradas
          </Text>
        )}
      </Card>

      {/* Check-in Alert */}
      {!isInRange && (
        <View className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mx-4 mt-4 flex-row items-start">
          <Feather name="alert-triangle" size={16} color="#856404" />
          <Text className="text-sm text-yellow-800 ml-2 flex-1">
            Estás a {(gym.distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar
            dentro de los 150m para hacer check-in.
          </Text>
        </View>
      )}

      {/* Check-in Button */}
      <TouchableOpacity
        className={`${!isInRange ? 'bg-gray-400' : 'bg-primary'} rounded-2xl p-4 mx-4 mt-4 items-center`}
        disabled={!isInRange}
        onPress={onCheckIn}
      >
        <Text className={`text-base font-semibold ${!isInRange ? 'text-gray-600' : 'text-onPrimary'}`}>
          {isInRange
            ? 'Hacer Check-in'
            : `Acercate ${(gym.distance * 1000 - 150).toFixed(0)}m más`}
        </Text>
      </TouchableOpacity>

      <Text className={`text-xs text-center mx-4 mt-2 mb-8 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
        Al hacer check-in ganarás +10 tokens y extenderás tu racha
      </Text>
    </Screen>
  );
}
