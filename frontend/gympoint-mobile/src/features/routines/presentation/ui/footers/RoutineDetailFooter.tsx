import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  onStartRoutine: () => void;
  onViewHistory: () => void;
};

export function RoutineDetailFooter({ onStartRoutine, onViewHistory }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className={`px-4 pt-5 pb-8 gap-3 border-t ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{
        borderTopColor: isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB',
      }}
    >
      <Button fullWidth onPress={onStartRoutine}>
        <ButtonText>Empezar rutina</ButtonText>
      </Button>
      <Button fullWidth variant="secondary" onPress={onViewHistory}>
        <ButtonText>Ver historial</ButtonText>
      </Button>
    </View>
  );
}
