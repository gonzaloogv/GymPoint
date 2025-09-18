import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '../presentation/navigation/RootNavigator';
import { ThemeProvider } from 'styled-components/native';
import { lightTheme } from '../config/theme';
import { StatusBar } from 'expo-status-bar';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={lightTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
