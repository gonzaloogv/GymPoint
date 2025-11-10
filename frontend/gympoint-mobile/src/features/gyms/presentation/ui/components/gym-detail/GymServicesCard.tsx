import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface GymServicesCardProps {
  services: string[];
}

export function GymServicesCard({ services }: GymServicesCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!services || services.length === 0) {
    return null;
  }

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <View
      className="mx-4 mt-6 px-5 py-[18px] rounded-[28px] border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <Text
        className="text-lg font-bold mb-4"
        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
      >
        Servicios disponibles
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {services.map((service) => (
          <View
            key={service}
            className="rounded-2xl px-3 py-2 border"
            style={{
              backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)',
              borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.28)',
            }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: isDark ? '#C7D2FE' : '#4338CA', letterSpacing: 0.6 }}
            >
              {service}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
