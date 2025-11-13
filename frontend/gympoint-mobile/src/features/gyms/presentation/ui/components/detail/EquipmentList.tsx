import { View, Text } from 'react-native';
import { Gym } from '@features/gyms/domain/entities/Gym';
import { useTheme } from '@shared/hooks';

interface Props {
  equipment?: Gym['equipment'];
}

export const EquipmentList = ({ equipment }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!equipment || Object.keys(equipment).length === 0) return null;

  return (
    <View className="px-4 py-4">
      <Text className={isDark ? 'text-base font-bold mb-3 text-textPrimary-dark' : 'text-base font-bold mb-3 text-textPrimary'}>
        Equipamiento
      </Text>
      {Object.entries(equipment).map(([category, items]) => (
        <View key={category} className="mb-4">
          <Text className={isDark ? 'font-semibold mb-1 capitalize text-textPrimary-dark' : 'font-semibold mb-1 capitalize text-textPrimary'}>
            {category}
          </Text>
          {items.map((item, index) => (
            <Text
              key={`${category}-${index}`}
              className={isDark ? 'ml-3 mb-1 text-textSecondary-dark' : 'ml-3 mb-1 text-textSecondary'}
            >
              • {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
