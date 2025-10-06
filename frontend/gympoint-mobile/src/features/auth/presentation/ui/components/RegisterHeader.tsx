import { Image, Text, View } from 'react-native';

interface Props {
  icon: any;
}

export function RegisterHeader({ icon }: Props) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <Image source={icon} style={{ width: 64, height: 64, marginBottom: 8 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>GymPoint</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        Encontrá tu gym ideal y mantené tu racha
      </Text>
    </View>
  );
}
