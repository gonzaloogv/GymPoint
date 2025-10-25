import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

import RootNavigator from '@presentation/navigation/RootNavigator';
import { ThemeProvider } from '@shared/providers';
import { useTheme } from '@shared/hooks';

const qc = new QueryClient();

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}