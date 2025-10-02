import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/presentation/navigation';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <Navigation />
    </>
  );
}
