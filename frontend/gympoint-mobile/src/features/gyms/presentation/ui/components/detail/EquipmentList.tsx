import { View, Text } from 'react-native';
import { Gym } from '@features/gyms/domain/entities/Gym';
import { useTheme } from '@shared/hooks';

interface Props {
  equipment?: Gym['equipment'];
}

export const EquipmentList = ({ equipment }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!equipment || equipment.length === 0) return null;

  return (
    <View className="px-4 py-4">
      <Text className={isDark ? 'text-base font-bold mb-3 text-textPrimary-dark' : 'text-base font-bold mb-3 text-textPrimary'}>
        Equipamiento
      </Text>
      {equipment.map((item, index) => (
        <Text 
          key={index} 
          className={isDark ? 'ml-3 mb-1 text-textSecondary-dark' : 'ml-3 mb-1 text-textSecondary'}
        >
          • {item}
        </Text>
      ))}
    </View>
  );
};
