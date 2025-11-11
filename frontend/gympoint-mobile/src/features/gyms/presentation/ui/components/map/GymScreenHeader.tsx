import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Input } from '@shared/components/ui';

type ViewMode = 'default' | 'list' | 'fullscreen';

type Props = {
  searchText: string;
  onChangeSearch: (value: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenFilters: () => void;
};

/**
 * Header para la pantalla de búsqueda de gimnasios
 * Sigue el mismo patrón visual que RoutinesHeader con:
 * - Título grande y subtítulo descriptivo
 * - Input de búsqueda
 * - Pills para cambiar entre vista MAPA/LISTA
 * - Botón circular de filtros
 *
 * Nota: El botón MAPA cambia a vista default (mapa card + lista),
 * el botón LISTA cambia a vista lista sin mapa
 */
export default function GymScreenHeader({
  searchText,
  onChangeSearch,
  viewMode,
  onChangeViewMode,
  onOpenFilters,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Paleta de colores consistente con RoutinesHeader
  const palette = useMemo(
    () => ({
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      activeBg: isDark ? 'rgba(79, 70, 229, 0.24)' : 'rgba(129, 140, 248, 0.2)',
      activeBorder: isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(129, 140, 248, 0.28)',
      activeText: isDark ? '#C7D2FE' : '#4338CA',
      pillBg: isDark ? 'rgba(31, 41, 55, 0.9)' : '#F3F4F6',
      pillBorder: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
      pillText: isDark ? '#E5E7EB' : '#374151',
      filterIcon: isDark ? '#9CA3AF' : '#6B7280',
    }),
    [isDark],
  );

  return (
    <View style={styles.container}>
      {/* Título y subtítulo */}
      <Text style={[styles.title, { color: palette.title }]}>Buscar Gimnasios</Text>
      <Text style={[styles.subtitle, { color: palette.subtitle }]}>
        Encuentra el espacio perfecto para entrenar
      </Text>

      {/* Input de búsqueda */}
      <Input
        placeholder="Buscar por nombre o dirección"
        value={searchText}
        onChangeText={onChangeSearch}
        className="mt-5"
      />

      {/* Pills de vista + botón de filtros */}
      <View style={styles.controlsRow}>
        {/* Pills horizontales */}
        <View style={styles.pillsContainer}>
          {/* Botón MAPA: cambia a vista default (mapa card + lista) */}
          <TouchableOpacity
            onPress={() => onChangeViewMode('default')}
            activeOpacity={0.75}
            style={[
              styles.filterPill,
              {
                backgroundColor: viewMode === 'default' ? palette.activeBg : palette.pillBg,
                borderColor: viewMode === 'default' ? palette.activeBorder : palette.pillBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: viewMode === 'default' ? palette.activeText : palette.pillText },
              ]}
            >
              MAPA
            </Text>
          </TouchableOpacity>

          {/* Botón LISTA: cambia a vista lista */}
          <TouchableOpacity
            onPress={() => onChangeViewMode('list')}
            activeOpacity={0.75}
            style={[
              styles.filterPill,
              {
                backgroundColor: viewMode === 'list' ? palette.activeBg : palette.pillBg,
                borderColor: viewMode === 'list' ? palette.activeBorder : palette.pillBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: viewMode === 'list' ? palette.activeText : palette.pillText },
              ]}
            >
              LISTA
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de filtros circular */}
        <TouchableOpacity
          onPress={onOpenFilters}
          activeOpacity={0.75}
          className={`
            w-10 h-10 rounded-full border
            items-center justify-center
            ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          `}
        >
          <Ionicons name="filter-sharp" size={16} color={palette.filterIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 16 es manejado por el contenedor padre (MapScreen)
    paddingTop: 0,
    paddingBottom: 8,
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 4,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
