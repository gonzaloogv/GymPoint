import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InfoCard } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface GymLocationCardProps {
  address: string;
  city: string;
  distance: number;
  coordinates: [number, number];
}

export function GymLocationCard({ address, city, distance, coordinates }: GymLocationCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${coordinates[0]},${coordinates[1]}`;
    Linking.openURL(url);
  };

  const distanceInMeters = distance * 1000;
  const displayDistance = distanceInMeters < 1000 ? `${distanceInMeters.toFixed(0)} m` : `${distance.toFixed(1)} km`;
  const inRange = distance <= 0.15;

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header Row */}
      <View className="flex-row items-start mb-4">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center mr-4"
          style={{
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(129, 140, 248, 0.18)',
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
          }}
        >
          <Feather name="map-pin" size={20} color={isDark ? '#C7D2FE' : '#4338CA'} />
        </View>
        <View className="flex-1 gap-2">
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            numberOfLines={2}
          >
            {address}
          </Text>
          <Text className="text-sm font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {city}
          </Text>
        </View>
      </View>

      {/* Distance Row */}
      <View className="flex-row items-center mb-5">
        <View
          className="rounded-full px-[14px] py-1.5 border"
          style={{
            backgroundColor: inRange
              ? isDark
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(16, 185, 129, 0.16)'
              : isDark
              ? 'rgba(245, 158, 11, 0.16)'
              : 'rgba(245, 158, 11, 0.12)',
            borderColor: inRange
              ? isDark
                ? 'rgba(16, 185, 129, 0.4)'
                : 'rgba(16, 185, 129, 0.28)'
              : isDark
              ? 'rgba(245, 158, 11, 0.32)'
              : 'rgba(245, 158, 11, 0.24)',
          }}
        >
          <Text
            className="text-xs font-bold uppercase tracking-wider"
            style={{
              color: inRange ? (isDark ? '#34D399' : '#047857') : isDark ? '#FBBF24' : '#B45309',
            }}
          >
            {displayDistance}
          </Text>
        </View>
        {inRange && (
          <Text
            className="text-xs font-semibold ml-2.5"
            style={{ color: isDark ? '#34D399' : '#047857' }}
          >
            En rango para check-in
          </Text>
        )}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        className="border rounded-2xl py-3 flex-row items-center justify-center gap-2"
        style={{
          borderColor: isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.26)',
        }}
        onPress={openInMaps}
        activeOpacity={0.75}
      >
        <Feather name="external-link" size={16} color={isDark ? '#C7D2FE' : '#4338CA'} />
        <Text className="text-sm font-semibold" style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}>
          Abrir en Maps
        </Text>
      </TouchableOpacity>
    </InfoCard>
  );
}

