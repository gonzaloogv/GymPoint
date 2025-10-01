import MapView, { Marker } from 'react-native-maps';
import { ViewStyle, StyleProp } from 'react-native';

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

export default function GymsMap({ initialRegion, locations, style }: Props) {
  return (
    <MapView
      initialRegion={initialRegion}
      style={[
        { width: '100%', height: 250, borderRadius: 12, overflow: 'hidden' },
        style,
      ]}
    >
      {locations.map((g) => (
        <Marker key={g.id} coordinate={g.coordinate} title={g.title} />
      ))}
    </MapView>
  );
}
