import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';

type Gym = {
  id: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
};

type Props = {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  locations: Gym[];
  style?: StyleProp<ViewStyle>;
};

export default function GymsMap({ style }: Props) {
  return (
    <View
      style={[
        {
          width: '100%',
          height: 250,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text>Mapa no disponible en Web con react-native-maps</Text>
    </View>
  );
}
