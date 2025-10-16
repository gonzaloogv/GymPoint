// import { StatusBar } from 'expo-status-bar';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ThemeProvider } from 'styled-components/native';
import '../index.css'

// import RootNavigator from '@presentation/navigation/RootNavigator';
// import { lightTheme } from '@presentation/theme';

// const qc = new QueryClient();

// export default function App() {
//   return (
//     <QueryClientProvider client={qc}>
//       <ThemeProvider theme={lightTheme}>
//         <StatusBar style="light" />
//         <RootNavigator />
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}