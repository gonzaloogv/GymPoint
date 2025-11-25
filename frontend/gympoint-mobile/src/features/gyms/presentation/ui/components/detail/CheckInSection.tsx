import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';

interface Props {
  gym: { name: string };
  isInRange: boolean;
  onCheckIn: () => void;
}

export const CheckInSection = ({ isInRange, onCheckIn }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View className="px-4 py-4 items-center">
      <TouchableOpacity 
        disabled={!isInRange} 
        onPress={onCheckIn}
        className={`px-5 py-3 rounded-lg ${!isInRange ? 'bg-gray-400' : 'bg-primary'}`}
      >
        <Text className="text-white font-bold">
          {isInRange ? 'Hacer Check-In' : 'Fuera de rango'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
