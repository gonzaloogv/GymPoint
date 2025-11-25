import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@shared/hooks';

export const LoadingState: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: bgColor }}
      edges={['top', 'left', 'right']}
    >
      <View className="flex-1">
        <Text
          className="text-2xl font-bold text-center mt-12"
          style={{ color: textColor }}
        >
          Cargando información de usuario...
        </Text>
      </View>
    </SafeAreaView>
  );
};
