import { useState } from 'react';

import dumbbellIcon from '@assets/dumbbell.png';
import { DI } from '@di/container';
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

export default function LoginScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await DI.loginUser.execute({ email, password });
      setUser(user);
    } catch (e: any) {
      setUser({ id_user: -1, email });
      setError(e?.response?.data?.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleForgotPassword = () => console.log('Olvidé mi contraseña');
  const handleRegister = () => console.log('Ir a registro');

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
