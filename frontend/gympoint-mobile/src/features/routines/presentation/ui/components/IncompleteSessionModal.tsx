import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  visible: boolean;
  routineName?: string;
  onContinue: () => void;
  onClose: () => void;
};

/**
 * Modal para sesión de entrenamiento incompleta
 * Muestra opciones para continuar el entrenamiento anterior o cerrar el modal
 */
export function IncompleteSessionModal({
  visible,
  routineName = 'Rutina',
  onContinue,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const overlayColor = isDark ? '#00000080' : '#00000050';
  const dividerColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      {/* Overlay */}
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: overlayColor }}
      >
        {/* Modal Card */}
        <View
          className="rounded-t-3xl p-6"
          style={{ backgroundColor }}
        >
          {/* Header con icono */}
          <View className="items-center mb-4">
            <Text
              className="text-2xl font-black text-center"
              style={{ color: textColor }}
            >
              No terminaste tu sesión
            </Text>
          </View>

          {/* Descripción */}
          <Text
            className="text-center text-base mb-6"
            style={{ color: secondaryTextColor }}
          >
            Tienes una sesión incompleta de {routineName}. Continúa donde lo dejaste o cierra para empezar otra.
          </Text>

          {/* Divider */}
          <View
            className="mb-6"
            style={{
              height: 1,
              backgroundColor: dividerColor,
            }}
          />

          {/* Botones */}
          <View className="gap-3">
            {/* Botón Continuar - Primario */}
            <Button
              onPress={onContinue}
              className="w-full"
            >
              <ButtonText>Continuar Entrenamiento</ButtonText>
            </Button>

            {/* Botón Cerrar - Secundario */}
            <TouchableOpacity
              onPress={onClose}
              className="w-full py-3 rounded-lg border items-center justify-center"
              style={{
                borderColor: secondaryTextColor,
              }}
              activeOpacity={0.6}
            >
              <Text
                className="font-semibold"
                style={{ color: secondaryTextColor }}
              >
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
