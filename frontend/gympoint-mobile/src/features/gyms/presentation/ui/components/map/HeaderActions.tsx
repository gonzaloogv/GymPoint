import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Row } from '@shared/components/ui';
import { SegmentedControl } from '@shared/components/ui/SegmentedControl';
import { BadgeDot } from '@shared/components/ui/BadgeDot';
import { useTheme } from '@shared/hooks';

type Props = {
  viewMode: 'map' | 'list';
  onChangeViewMode: (v: 'map' | 'list') => void;
  onOpenFilters: () => void;
  activeFilters: number;
};

export default function HeaderActions({
  viewMode,
  onChangeViewMode,
  onOpenFilters,
  activeFilters,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores estandarizados
  const borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      };

  const filterButtonStyle = StyleSheet.flatten([
    {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor,
      backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shadowStyle,
  ]);

  return (
    <View className="flex-row gap-2 items-center">
      <View className="relative flex-shrink-0">
        <TouchableOpacity
          onPress={onOpenFilters}
          style={filterButtonStyle}
        >
          <Ionicons name="filter-sharp" size={16} color={iconColor} />
        </TouchableOpacity>
        {activeFilters > 0 && <BadgeDot count={activeFilters} />}
      </View>

      <View className="flex-1">
        <SegmentedControl
          value={viewMode}
          onChange={(value: any) => value && onChangeViewMode(value as 'map' | 'list')}
          options={[
            { value: 'map', label: 'Mapa' },
            { value: 'list', label: 'Lista' },
          ]}
          size="sm"
        />
      </View>
    </View>
  );
}
