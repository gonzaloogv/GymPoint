import React from 'react';
import { View, Text, Modal } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button } from '@shared/components/ui';

type Props = {
  visible: boolean;
  routineName?: string;
  onContinue: () => void;
  onClose: () => void;
};

export function IncompleteSessionModal({
  visible,
  routineName = 'rutina',
  onContinue,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const overlay = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(17, 24, 39, 0.45)';
  const background = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB';
  const title = isDark ? '#F9FAFB' : '#111827';
  const body = isDark ? '#9CA3AF' : '#4B5563';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: overlay }}>
        <View
          className="px-6 pt-[18px] pb-8 rounded-t-[28px] border"
          style={{ backgroundColor: background, borderColor: border }}
        >
          <View
            className="self-center w-12 h-[5px] rounded-full mb-[18px]"
            style={{ backgroundColor: 'rgba(148, 163, 184, 0.35)' }}
          />
          <Text className="text-xl font-bold mb-3" style={{ color: title }}>
            Sesion incompleta
          </Text>
          <Text className="text-[15px] leading-[22px] mb-7" style={{ color: body }}>
            Tienes una sesion incompleta de {routineName}. Continua donde lo dejaste o cierra
            para iniciar otra.
          </Text>
          <View className="gap-3">
            <Button fullWidth onPress={onContinue}>
              Continuar entrenamiento
            </Button>
            <Button variant="secondary" fullWidth onPress={onClose}>
              Cerrar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

