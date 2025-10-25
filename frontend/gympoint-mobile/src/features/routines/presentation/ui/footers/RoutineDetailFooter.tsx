import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  onStartRoutine: () => void;
  onViewHistory: () => void;
};

export function RoutineDetailFooter({ onStartRoutine, onViewHistory }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  return (
    <View className="p-4" style={{ backgroundColor: bgColor }}>
      <Button onPress={onStartRoutine}>
        <ButtonText>Empezar rutina</ButtonText>
      </Button>
      <TouchableOpacity
        onPress={onViewHistory}
        className="min-h-12 items-center justify-center rounded-lg border mt-1"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
        }}
      >
        <Text className="font-semibold" style={{ color: textColor }}>
          Ver historial
        </Text>
      </TouchableOpacity>
    </View>
  );
}
