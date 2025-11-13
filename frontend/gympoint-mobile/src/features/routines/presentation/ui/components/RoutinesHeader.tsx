import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { createScreenPalette } from '@shared/theme/palettes';
import { FILTERS } from '../../hooks/useRoutinesFilters';
import { Input } from '@shared/components/ui';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: 'All' | 'Pending';
  onStatusChange: (s: 'All' | 'Pending') => void;
};

/**
 * RoutinesHeader - Encabezado de la pantalla de rutinas
 *
 * Cambios en esta refactorización (FASE 2):
 * - Antes: useMemo con paleta duplicada de GymScreenHeader
 * - Ahora: Usa createScreenPalette(isDark) para colores centralizados
 * - Elimina duplicación y mejora mantenibilidad
 */
export default function RoutinesHeader({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = createScreenPalette(isDark);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: palette.title }]}>Mis rutinas</Text>
      <Text style={[styles.subtitle, { color: palette.subtitle }]}>
        Organiza, crea y sigue tus entrenamientos
      </Text>

      <Input
        placeholder="Buscar por nombre o musculo"
        value={search}
        onChangeText={onSearchChange}
        className="mt-5"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(({ key, label }) => {
          const active = key === status;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onStatusChange(key)}
              activeOpacity={0.75}
              style={[
                styles.filterPill,
                styles.filterPillSpacing,
                {
                  backgroundColor: active ? palette.activeBg : palette.pillBg,
                  borderColor: active ? palette.activeBorder : palette.pillBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? palette.activeText : palette.pillText },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  filterRow: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterPillSpacing: {
    marginRight: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
