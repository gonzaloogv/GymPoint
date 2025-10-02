import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, HeaderTitle } from '../styles/layout';

export const LoadingState: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <Container>
        <HeaderTitle style={{ textAlign: 'center', marginTop: 50 }}>
          Cargando información de usuario...
        </HeaderTitle>
      </Container>
    </SafeAreaView>
  );
};
