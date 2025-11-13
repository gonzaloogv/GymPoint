import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import ProteinIcon from '@assets/icons/proteins.svg'

type Props = {
  value: number;
  size?: number;
};

export function TokenPill({ value, size = 14 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(248, 191, 52, 0.2)',
    border: isDark ? 'rgba(252, 211, 77, 0.35)' : 'rgba(245, 158, 11, 0.2)',
    text: isDark ? '#FCD34D' : '#B45309',
  };

  return (
    <View
      className="flex-row items-center px-3 py-1.5 rounded-full border"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        shadowColor: 'rgba(245, 158, 11, 0.4)',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <ProteinIcon
        size={size}
        width={20} height={20} accessibilityLabel="tokens"
      />
      <Text className="ml-1 font-semibold" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
