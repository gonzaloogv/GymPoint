import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';

interface GymContactCardProps {
  phone?: string;
  email?: string;
  website?: string;
}

export function GymContactCard({ phone, email, website }: GymContactCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!phone && !email && !website) {
    return null;
  }

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWebsite = () => {
    if (website) {
      Linking.openURL(website);
    }
  };

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center mr-[14px]"
          style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.14)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.38)' : 'rgba(16, 185, 129, 0.24)',
          }}
        >
          <Feather name="phone" size={20} color={isDark ? '#6EE7B7' : '#047857'} />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          Información de contacto
        </Text>
      </View>

      {/* Items */}
      <View className="gap-3">
        {phone && (
          <TouchableOpacity className="flex-row items-center gap-2.5" onPress={handleCall} activeOpacity={0.75}>
            <Feather name="phone" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {phone}
            </Text>
          </TouchableOpacity>
        )}

        {email && (
          <View className="flex-row items-center gap-2.5">
            <Feather name="mail" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {email}
            </Text>
          </View>
        )}

        {website && (
          <TouchableOpacity className="flex-row items-center gap-2.5" onPress={handleWebsite} activeOpacity={0.75}>
            <Feather name="globe" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              className="text-sm font-semibold underline flex-1"
              style={{ color: isDark ? '#60A5FA' : '#2563EB' }}
              numberOfLines={1}
            >
              {website}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </InfoCard>
  );
}

