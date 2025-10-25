import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  const { isDark } = useTheme();
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const bgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F3F4F6' : '#1F2937';

  return (
    <View
      className="flex-row items-center px-5 py-2 border-b"
      style={{
        backgroundColor: bgColor,
        borderBottomColor: borderColor,
      }}
    >
      <TouchableOpacity onPress={onBack} className="pr-4">
        <Feather name="arrow-left" size={24} color={textColor} />
      </TouchableOpacity>
      <Text className="text-lg font-bold" style={{ color: textColor }}>
        {title}
      </Text>
    </View>
  );
}
