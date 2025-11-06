import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      divider: isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(148, 163, 184, 0.28)',
      title: isDark ? '#F9FAFB' : '#111827',
      icon: isDark ? '#E5E7EB' : '#334155',
    }),
    [isDark],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderBottomColor: palette.divider,
        },
      ]}
    >
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={palette.icon} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
});
