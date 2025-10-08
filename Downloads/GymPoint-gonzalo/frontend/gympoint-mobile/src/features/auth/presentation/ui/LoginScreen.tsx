import { useState } from 'react';

import dumbbellIcon from '@assets/dumbbell.png';
import {
  AuthCard,
  AuthCardTitle,
  DividerWithText,
  Screen,
  SocialButton,
} from '@shared/components/ui';

import { useAuthStore } from '../state/auth.store';
import { LoginFooter } from './components/LoginFooter';
import { LoginForm } from './components/LoginForm';
import { LoginHeader } from './components/LoginHeader';
import { Root, contentContainerStyle } from './LoginScreen.styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Integrar con la API real cuando esté disponible.
      // const { user } = await DI.loginUser.execute({ email, password });
      // setUser(user);

      setUser({
        id_user: -1,
        name: 'Usuario Demo',
        email: email || 'demo@gympoint.app',
        role: 'USER',
        tokens: 0,
        plan: 'Free',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleForgotPassword = () => console.log('Olvidé mi contraseña');
  const handleRegister = () => {
    navigation.navigate('Register'); // 👈 redirige al RegisterScreen
  };

  return (
    <Screen
      scroll
      padBottom="safe"
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      <Root>
        <LoginHeader icon={dumbbellIcon} />

        <AuthCard>
          <AuthCardTitle>Iniciar sesión</AuthCardTitle>

          <LoginForm
            email={email}
            password={password}
            error={error}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
          />

          <DividerWithText>o</DividerWithText>

          <SocialButton onPress={handleGoogle}>Continuar con Google</SocialButton>

          <LoginFooter
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
          />
        </AuthCard>
      </Root>
    </Screen>
  );
}
