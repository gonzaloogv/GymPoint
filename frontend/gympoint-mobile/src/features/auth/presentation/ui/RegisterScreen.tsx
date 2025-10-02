import { useState } from 'react';

import dumbbellIcon from '@assets/dumbbell.png';
import { AuthCard, AuthCardTitle, DividerWithText, Screen, SocialButton } from '@shared/components/ui';

import { useAuthStore } from '../state/auth.store';
import { RegisterForm } from './components/RegisterForm';
import { RegisterHeader } from './components/RegisterHeader';
import { RegisterFooter } from './components/RegisterFooter';
import { Root, contentContainerStyle } from './RegisterScreen.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;
export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();

  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);

  const handleRegister = async (userData: {
    fullName: string;
    email: string;
    password: string;
    location: string;
    age: number;
    gender: string;
    weeklyFrequency: number;
  }) => {
    setLoading(true);
    try {
      // TODO: integrar con API real
      setUser({
        id_user: -1,
        name: userData.fullName,
        email: userData.email,
        role: 'USER',
        tokens: 0,
        plan: 'Free',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleBackToLogin = () => {navigation.navigate("Login")};

  return (
    <Screen
      scroll
      padBottom="safe"
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      <Root>
        <RegisterHeader icon={dumbbellIcon} />

        <AuthCard>
          <AuthCardTitle>Crear cuenta</AuthCardTitle>

          <RegisterForm loading={loading} onSubmit={handleRegister} />

          <DividerWithText>o</DividerWithText>

          <SocialButton onPress={handleGoogle}>Continuar con Google</SocialButton>

          <RegisterFooter onBackToLogin={handleBackToLogin} />
        </AuthCard>
      </Root>
    </Screen>
  );
}