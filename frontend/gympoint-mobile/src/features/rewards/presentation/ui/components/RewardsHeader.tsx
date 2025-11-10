import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@features/auth/domain/entities/User';
import { useTheme } from '@shared/hooks';

type RewardsHeaderProps = {
  user: User;
  onViewHistory?: () => void;
};

export const RewardsHeader: React.FC<RewardsHeaderProps> = ({ user, onViewHistory }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#FACC15',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      };

  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Ionicons name="gift" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text
            className="text-[28px] font-extrabold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            Recompensas
          </Text>
        </View>
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
        >
          Canjeá tus tokens por beneficios
        </Text>
      </View>

      <View className="h-px rounded-full" style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }} />

      <View
        className="rounded-[28px] p-5 border"
        style={[
          {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)',
          },
          shadowStyle,
        ]}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="gap-1">
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
            >
              Tokens disponibles
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="flash" size={24} color="#FACC15" />
              <Text className="text-[32px] font-bold" style={{ color: '#FACC15' }}>
                {user.tokens}
              </Text>
            </View>
          </View>
          <View
            className="w-14 h-14 rounded-full border items-center justify-center"
            style={{
              borderColor: 'rgba(250, 204, 21, 0.25)',
              backgroundColor: 'rgba(250, 204, 21, 0.15)',
            }}
          >
            <Ionicons name="wallet" size={24} color="#FACC15" />
          </View>
        </View>

        {/* Botón Ver Historial */}
        {onViewHistory && (
          <Pressable
            onPress={onViewHistory}
            className="py-2.5 px-4 rounded-2xl border flex-row items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.15)',
              borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.25)',
            }}
          >
            <Ionicons name="time-outline" size={18} color="#FACC15" style={{ marginRight: 8 }} />
            <Text className="text-sm font-semibold" style={{ color: '#FACC15' }}>
              Ver historial
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FACC15" style={{ marginLeft: 8 }} />
          </Pressable>
        )}
      </View>
    </View>
  );
};
