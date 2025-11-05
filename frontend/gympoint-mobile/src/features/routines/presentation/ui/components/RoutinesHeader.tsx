import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@shared/hooks';
import { FILTERS } from '../../hooks/useRoutinesFilters';
import { RoutineStatus } from '@features/routines/domain/entities';
import { Input } from '@shared/components/ui';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: 'All' | 'Pending';
  onStatusChange: (s: 'All' | 'Pending') => void;
};

export default function RoutinesHeader({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const primaryColor = '#3B82F6';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <View className="p-4 gap-1">
      <Text className="text-2xl font-bold" style={{ color: textColor }}>
        Mis rutinas
      </Text>
      <Input
        placeholder="Buscar por nombre o músculo…"
        value={search}
        onChangeText={onSearchChange}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-1"
      >
        {FILTERS.map(({ key, label }) => {
          const active = key === status;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onStatusChange(key)}
              className="px-3 py-1.5 rounded-lg mr-1 border"
              style={{
                backgroundColor: active ? primaryColor : cardBg,
                borderColor: active ? primaryColor : borderColor,
                borderWidth: 1,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: active ? '#ffffff' : textColor,
                }}
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
