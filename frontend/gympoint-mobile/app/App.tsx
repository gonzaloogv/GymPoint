import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import '../global.css';

import RootNavigator from '@presentation/navigation/RootNavigator';
import { ThemeProvider, WebSocketProvider, useWebSocketContext } from '@shared/providers';
import { useTheme, useRealtimeSync } from '@shared/hooks';
import { useAuthStore } from '@features/auth';

const qc = new QueryClient();

// Memoizar AppContent para evitar re-renders innecesarios del WebSocketProvider
const AppContent = React.memo(() => {
  const { isDark } = useTheme();
  const { connect } = useWebSocketContext();
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    // Conectar al WebSocket solo cuando hay usuario autenticado
    if (user) {
      connect();
    }
  }, [user, connect]);

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
        <WebSocketProvider autoConnect={false}>
          <AppContent />
        </WebSocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}