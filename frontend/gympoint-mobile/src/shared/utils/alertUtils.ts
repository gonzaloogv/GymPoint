import { Alert } from 'react-native';

/**
 * Muestra una alerta de éxito con estilo consistente
 */
export function showSuccessAlert(
  title: string,
  message: string,
  onClose?: () => void
) {
  Alert.alert(
    `✅ ${title}`,
    message,
    [
      {
        text: 'Entendido',
        onPress: onClose,
      },
    ]
  );
}

/**
 * Muestra una alerta de error con estilo consistente
 */
export function showErrorAlert(
  title: string,
  message: string,
  onClose?: () => void
) {
  Alert.alert(
    `❌ ${title}`,
    message,
    [
      {
        text: 'Entendido',
        onPress: onClose,
      },
    ]
  );
}

/**
 * Muestra una alerta de confirmación con opciones Cancelar/Confirmar
 */
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirmar',
  cancelText: string = 'Cancelar'
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
}

/**
 * Muestra una alerta de info con estilo consistente
 */
export function showInfoAlert(
  title: string,
  message: string,
  onClose?: () => void
) {
  Alert.alert(
    `ℹ️ ${title}`,
    message,
    [
      {
        text: 'Entendido',
        onPress: onClose,
      },
    ]
  );
}
