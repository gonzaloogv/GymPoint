import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import '../global.css';

import RootNavigator from '@presentation/navigation/RootNavigator';
import { ThemeProvider, WebSocketProvider } from '@shared/providers';
import { useTheme, useRealtimeSync } from '@shared/hooks';

const qc = new QueryClient();

// Completa la sesion de AuthSession una sola vez al arrancar la app
WebBrowser.maybeCompleteAuthSession();

// Memoizar AppContent para evitar re-renders innecesarios del WebSocketProvider
const AppContent = React.memo(() => {
  const { isDark } = useTheme();

  // Sincronización en tiempo real de tokens, suscripciones y perfil
  useRealtimeSync();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
      <Toast />
    </>
  );
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <WebSocketProvider autoConnect={true}>
          <AppContent />
        </WebSocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
