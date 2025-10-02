import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';

import RootNavigator from '@presentation/navigation/RootNavigator';
import { lightTheme } from '@presentation/theme';

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
