import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface InfoSectionProps {
  title: string;
  content: string | ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export function InfoSection({ title, content, icon, variant = 'default' }: InfoSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getVariantClasses = () => {
    const variants = {
      default: isDark ? 'bg-gray-700/50' : 'bg-gray-100',
      info: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      success: isDark ? 'bg-green-900/20' : 'bg-green-50',
      warning: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      danger: isDark ? 'bg-red-900/20' : 'bg-red-50',
    };
    return variants[variant];
  };

  const getIconColor = () => {
    const colors = {
      default: isDark ? '#9CA3AF' : '#6B7280',
      info: isDark ? '#60A5FA' : '#3B82F6',
      success: isDark ? '#34D399' : '#10B981',
      warning: isDark ? '#FBBF24' : '#F59E0B',
      danger: isDark ? '#F87171' : '#EF4444',
    };
    return colors[variant];
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {icon && (
            <Ionicons
              name={icon}
              size={14}
              color={getIconColor()}
            />
          )}
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </Text>
        </View>
      </View>
      <View className={`p-3 rounded-lg ${getVariantClasses()}`}>
        {typeof content === 'string' ? (
          <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {content}
          </Text>
        ) : (
          content
        )}
      </View>
    </View>
  );
}
