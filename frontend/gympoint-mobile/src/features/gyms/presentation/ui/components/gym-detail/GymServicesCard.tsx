import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@shared/components/ui';
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
    <Card className="mx-4 mt-4">
      <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
        Servicios disponibles
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {services.map((service, index) => (
          <View
            key={index}
            className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-full px-4 py-2`}
          >
            <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {service}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
