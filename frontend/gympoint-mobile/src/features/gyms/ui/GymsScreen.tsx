import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { DI } from '../../../config/di';


export default function GymsScreen() {
// TODO: integrar expo-location y permisos reales
const { data, isLoading, error } = useQuery({
queryKey: ['gyms', -27.45, -58.99, 10],
queryFn: () => DI.listNearbyGyms.execute({ lat: -27.45, lng: -58.99, radiusKm: 10 })
});


if (isLoading) return <Text>Cargando...</Text>;
if (error) return <Text>Error</Text>;


return (
<View style={{ padding: 16 }}>
<FlatList
data={data}
keyExtractor={(g) => String(g.id_gym)}
renderItem={({ item }) => (
<View style={{ padding:12, borderWidth:1, marginBottom:8, borderRadius:8 }}>
<Text style={{ fontWeight:'700' }}>{item.name}</Text>
<Text>{item.premium ? 'Premium' : 'Free'}</Text>
</View>
)}
/>
</View>
);
}