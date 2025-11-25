import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { createScreenPalette } from '@shared/theme/palettes';
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
 * GymScreenHeader - Header para la pantalla de búsqueda de gimnasios
 *
 * Cambios en esta refactorización (FASE 2):
 * - Antes: useMemo con paleta idéntica a RoutinesHeader (duplicación)
 * - Ahora: Usa createScreenPalette(isDark) para colores centralizados
 * - Elimina duplicación y mejora mantenibilidad
 *
 * Sigue el patrón visual de RoutinesHeader con:
 * - Título grande y subtítulo descriptivo
 * - Input de búsqueda
 * - Pills para cambiar entre vista MAPA/LISTA
 * - Botón circular de filtros
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
  const palette = createScreenPalette(isDark);

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
    paddingHorizontal: 16,
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
