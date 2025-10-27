import { TouchableOpacity, View } from 'react-native';
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
  
  return (
    <View className="flex-row gap-2 items-center">
      <View className="relative flex-shrink-0">
        <TouchableOpacity
          onPress={onOpenFilters}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? '#d1d5db' : '#d1d5db',
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="filter-sharp" size={16} color="#6b7280" />
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
