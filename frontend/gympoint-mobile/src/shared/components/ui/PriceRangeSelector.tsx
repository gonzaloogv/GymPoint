import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type PriceOption = {
  value: string;
  label: string;
  range: string;
  icon: 'cash-outline' | 'card-outline' | 'wallet-outline' | 'diamond-outline';
};

const PRICE_OPTIONS: PriceOption[] = [
  { value: 'Gratis', label: 'Gratis', range: '$0', icon: 'cash-outline' },
  { value: '$5000-12000', label: 'Económico', range: '$5K - $12K', icon: 'cash-outline' },
  { value: '$12000-20000', label: 'Moderado', range: '$12K - $20K', icon: 'card-outline' },
  { value: '$20000+', label: 'Premium', range: 'Más de $20K', icon: 'diamond-outline' },
];

type Props = {
  title?: string;
  selectedPrice: string;
  onSelectPrice: (value: string) => void;
  spaced?: boolean;
};

export function PriceRangeSelector({
  title,
  selectedPrice,
  onSelectPrice,
  spaced = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {title && (
        <View className="flex-row items-center gap-2 mb-2" style={{ marginTop: spaced ? 16 : 0 }}>
          <Ionicons
            name="cash"
            size={18}
            color={isDark ? '#F9FAFB' : '#111827'}
          />
          <Text
            className="font-semibold text-base"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            {title}
          </Text>
        </View>
      )}
      <View className="gap-2">
        {PRICE_OPTIONS.map((option) => {
          const active = selectedPrice === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelectPrice(option.value)}
              className="px-4 py-3.5 rounded-xl border flex-row items-center justify-between"
              style={{
                backgroundColor: active ? '#4A9CF5' : isDark ? '#1F2937' : '#ffffff',
                borderColor: active ? '#4A9CF5' : isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: active
                      ? 'rgba(255, 255, 255, 0.2)'
                      : isDark
                      ? 'rgba(75, 85, 99, 0.5)'
                      : '#F3F4F6',
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
                  />
                </View>
                <View>
                  <Text
                    className="font-semibold text-base"
                    style={{
                      color: active ? '#FFFFFF' : isDark ? '#F9FAFB' : '#111827',
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{
                      color: active
                        ? 'rgba(255, 255, 255, 0.8)'
                        : isDark
                        ? '#9CA3AF'
                        : '#6B7280',
                    }}
                  >
                    {option.range}
                  </Text>
                </View>
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
