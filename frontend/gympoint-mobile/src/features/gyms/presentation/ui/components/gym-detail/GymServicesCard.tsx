import React from 'react';
import { View, Text } from 'react-native';
import { InfoCard } from '@shared/components/ui';
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

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      <Text
        className="text-lg font-bold mb-[14px]"
        style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
      >
        Servicios disponibles
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {services.map((service) => (
          <View
            key={service}
            className="rounded-full px-[14px] py-2"
            style={{
              backgroundColor: isDark ? 'rgba(79, 70, 229, 0.18)' : 'rgba(129, 140, 248, 0.14)',
            }}
          >
            <Text className="text-[13px] font-semibold" style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}>
              {service}
            </Text>
          </View>
        ))}
      </View>
    </InfoCard>
  );
}
