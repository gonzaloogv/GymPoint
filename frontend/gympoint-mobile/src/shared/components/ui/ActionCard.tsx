import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Layout = 'horizontal' | 'vertical';

type Props = {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  spaced?: boolean;
  layout?: Layout;
};

export function ActionCard({
  label,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  spaced = false,
  layout = 'horizontal',
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isVertical = layout === 'vertical';

  // Mantener sombras exactas con style inline para preservar apariencia
  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 16 },
        shadowRadius: 22,
        elevation: 10,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 5,
      };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      className={`flex-1 ${spaced ? 'mr-3' : ''} rounded-[24px] border px-[18px] py-4 ${
        isVertical ? 'items-center' : 'flex-row items-center'
      } ${isDark ? 'bg-gray-900 border-gray-600/60' : 'bg-white border-gray-200'}`}
      style={shadowStyle}
    >
      <View
        className={`w-14 h-14 rounded-[20px] border items-center justify-center ${
          isVertical ? 'mb-3' : 'mr-4'
        }`}
        style={{
          borderColor: isDark ? 'rgba(79, 70, 229, 0.36)' : 'rgba(129, 140, 248, 0.24)',
          backgroundColor: isDark ? 'rgba(79, 70, 229, 0.16)' : 'rgba(129, 140, 248, 0.14)',
        }}
      >
        <View
          className="w-12 h-12 rounded-[18px] items-center justify-center"
          style={{ backgroundColor: iconBackground }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
      </View>

      <View className={isVertical ? 'items-center w-full' : 'flex-1 mr-4'}>
        <Text
          className={`text-sm font-bold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}
          style={{ textAlign: isVertical ? 'center' : 'left' }}
        >
          {label}
        </Text>
        <Text
          className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          style={{ textAlign: isVertical ? 'center' : 'left' }}
        >
          {description}
        </Text>
      </View>

      {!isVertical && (
        <View className="ml-auto">
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </View>
      )}
    </TouchableOpacity>
  );
}
