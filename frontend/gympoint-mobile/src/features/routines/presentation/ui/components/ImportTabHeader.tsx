import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SegmentedControl } from '@shared/components/ui';

type Tab = {
  value: string;
  label: string;
};

type Props = {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function ImportTabHeader({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB',
      overline: isDark ? '#9CA3AF' : '#6B7280',
      description: isDark ? '#9CA3AF' : '#4B5563',
    }),
    [isDark],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderBottomColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.overline, { color: palette.overline }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.description }]}>{description}</Text>
      <View style={styles.segmentWrapper}>
        <SegmentedControl options={tabs} value={activeTab} onChange={onTabChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  overline: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  segmentWrapper: {
    alignItems: 'center',
  },
});
