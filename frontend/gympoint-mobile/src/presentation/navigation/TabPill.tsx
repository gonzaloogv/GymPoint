import React from 'react';
import { View, Text } from 'react-native';
import { useTheme as useAppTheme } from 'styled-components/native';

function addOpacity(hex: string, alphaPct = 0.1) {
  // Convierte 0..1 a AA en hex; espera #RRGGBB
  const aa = Math.round(Math.min(1, Math.max(0, alphaPct)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return /^#([0-9a-fA-F]{6})$/.test(hex) ? `${hex}${aa}` : hex;
}

export function TabPill({
  focused,
  label,
  children,
}: {
  focused: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 4,     // ~py-1
        paddingHorizontal: 12,  // ~px-3
        borderRadius: theme.radius.md,
        backgroundColor: focused ? addOpacity(theme.colors.primary, 0.1) : 'transparent',
      }}
    >
      {children}
      <Text
        style={{
          fontSize: 12, // text-xs
          marginTop: 4, // mt-1
          color: focused ? theme.colors.primary : theme.colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
