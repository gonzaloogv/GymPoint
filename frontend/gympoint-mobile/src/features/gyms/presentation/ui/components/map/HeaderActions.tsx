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
    <>
      <Row className="gap-2.5" align="center">
        <View className="relative">
          <TouchableOpacity 
            onPress={onOpenFilters}
            className={`px-3 py-2 mb-1.5 border rounded-md ${
              isDark 
                ? 'border-border-dark bg-card-dark' 
                : 'border-border bg-card'
            }`}
          >
            <Ionicons name="filter-sharp" size={16} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          {activeFilters > 0 && <BadgeDot count={activeFilters} />}
        </View>
      </Row>

      <SegmentedControl
        value={viewMode}
        onChange={(value: any) => value && onChangeViewMode(value as 'map' | 'list')}
        options={[
          { value: 'map', label: 'Mapa' },
          { value: 'list', label: 'Lista' },
        ]}
        size="sm"
      />
    </>
  );
}
