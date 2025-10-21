import { useState } from 'react';

import dumbbellIcon from '@assets/dumbbell.png';
import {
  AuthCard,
  AuthCardTitle,
  DividerWithText,
  Screen,
  SocialButton,
} from '@shared/components/ui';

import { LoginFooter } from './components/LoginFooter';
import { LoginForm } from './components/LoginForm';
import { LoginHeader } from './components/LoginHeader';
import { Root, contentContainerStyle } from './LoginScreen.styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLogin } from '../hooks/useLogin';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await login({ email, password });
    if (result.success) {
      navigation.navigate('App');
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleForgotPassword = () => console.log('Olvidé mi contraseña');
  const handleRegister = () => {
    navigation.navigate('Register');
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

