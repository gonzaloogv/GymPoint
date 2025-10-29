import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
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

  return (
    <Card className="mx-4 mt-4">
      <View className="flex-row items-start mb-3">
        <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
          <Feather name="map-pin" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {address}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'} mt-1`}>
            {city}
          </Text>
          {(() => {
            const distanceInMeters = distance * 1000;
            const distanceText = distanceInMeters < 1000
              ? `${distanceInMeters.toFixed(0)} m`
              : `${distance.toFixed(1)} km`;

            const inRange = distance <= 0.15;

            return (
              <View className="flex-row items-center mt-2">
                <View
                  className={`px-3 py-1 rounded-full ${
                    inRange
                      ? isDark ? 'bg-green-500/30' : 'bg-green-100'
                      : isDark ? 'bg-orange-500/30' : 'bg-orange-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      inRange
                        ? isDark ? 'text-green-400' : 'text-green-700'
                        : isDark ? 'text-orange-400' : 'text-orange-700'
                    }`}
                  >
                    {distanceText}
                  </Text>
                </View>
                {inRange && (
                  <Text className={`ml-2 text-xs ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    En rango para check-in
                  </Text>
                )}
              </View>
            );
          })()}
        </View>
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
  );
}
