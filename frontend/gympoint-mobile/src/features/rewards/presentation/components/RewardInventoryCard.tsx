import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RewardInventoryItem } from '../../domain/entities/Reward';
import { useTheme } from '@shared/hooks';

interface Props {
  item: RewardInventoryItem;
  onUse?: (item: RewardInventoryItem) => void;
}

export const RewardInventoryCard: React.FC<Props> = ({ item, onUse }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getIconName = () => {
    switch (item.itemType) {
      case 'streak_saver':
        return 'shield-checkmark-outline' as const;
      case 'token_multiplier':
        return 'flame-outline' as const;
      default:
        return 'gift-outline' as const;
    }
  };

  const getIconColor = () => {
    switch (item.itemType) {
      case 'streak_saver':
        return '#3B82F6'; // Blue
      case 'token_multiplier':
        return '#F97316'; // Orange
      default:
        return '#8B5CF6'; // Purple
    }
  };

  const getDescription = () => {
    if (item.itemType === 'streak_saver') {
      return 'Protege tu racha automáticamente si fallas un día';
    }
    if (item.itemType === 'token_multiplier') {
      return `Multiplica tus tokens x${item.reward.effectValue || 1} durante ${item.reward.durationDays || 7} días`;
    }
    return item.reward.description || 'Item acumulable';
  };

  const handleUse = () => {
    if (!onUse) return;

    Alert.alert(
      'Usar multiplicador',
      `¿Deseas activar ${item.reward.name} ahora?\n\nMultiplica tus tokens x${item.reward.effectValue || 1} durante ${item.reward.durationDays || 7} días`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Activar',
          onPress: () => onUse(item),
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  const iconColor = getIconColor();

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: iconColor,
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <View
      className="rounded-[28px] px-5 py-[18px] border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row gap-3">
        {/* Icon Container */}
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? `${iconColor}20` : `${iconColor}15`,
            borderColor: isDark ? `${iconColor}50` : `${iconColor}35`,
          }}
        >
          <Ionicons name={getIconName()} size={22} color={iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1 gap-2">
          {/* Title */}
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {item.reward.name}
          </Text>

          {/* Description */}
          <Text
            className="text-[13px] font-medium leading-[18px] text-[#78716C]"
            numberOfLines={2}
          >
            {getDescription()}
          </Text>

          {/* Footer */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              {/* Quantity Badge */}
              <View
                className="rounded-2xl px-3 py-2 border"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.25)',
                }}
              >
                <Text className="text-xs font-bold" style={{ color: '#22C55E' }}>
                  {item.quantity} / {item.maxStack}
                </Text>
              </View>

              {/* Auto Label */}
              {item.itemType === 'streak_saver' && (
                <Text className="text-[10px] font-medium italic" style={{ color: isDark ? '#9CA3AF' : '#78716C' }}>
                  Uso automático
                </Text>
              )}
            </View>

            {/* Use Button */}
            {item.itemType === 'token_multiplier' && onUse && (
              <TouchableOpacity
                onPress={handleUse}
                activeOpacity={0.78}
                className="py-2 px-4 rounded-2xl"
                style={{
                  backgroundColor: isDark ? '#4C51BF' : '#4338CA',
                }}
              >
                <Text
                  className="text-xs font-bold uppercase"
                  style={{
                    color: '#ffffff',
                    letterSpacing: 0.6,
                  }}
                >
                  Usar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
