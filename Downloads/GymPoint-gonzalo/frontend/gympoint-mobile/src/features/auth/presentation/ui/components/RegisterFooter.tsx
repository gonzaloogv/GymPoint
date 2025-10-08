import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onBackToLogin: () => void;
}

export function RegisterFooter({ onBackToLogin }: Props) {
  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Text style={{ fontSize: 12, color: '#666' }}>¿Ya tenés cuenta?</Text>
      <TouchableOpacity onPress={onBackToLogin}>
        <Text style={{ fontSize: 14, color: '#007bff', marginTop: 4 }}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
