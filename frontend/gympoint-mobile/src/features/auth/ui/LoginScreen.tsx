import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

import dumbbellIcon from '@assets/dumbbell.png';
import { DI } from '@di/container';
import { BrandMark } from '@shared/components/brand';
import {
  AuthCard,
  AuthCardTitle,
  Button,
  ButtonText,
  DividerWithText,
  ErrorText,
  FormField,
  H1,
  InputLogin,
  PasswordInput,
  Screen,
  SocialButton,
} from '@shared/components/ui';
import { sp } from '@shared/styles';

import { useAuthStore } from '../state/auth.store';

const Root = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => sp(theme, 3)}px ${({ theme }) => sp(theme, 2)}px;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Header = styled(View)`
  align-items: center;
  margin-bottom: ${({ theme }) => sp(theme, 3)}px;
`;

const Subtitle = styled(Text)`
  margin-top: 6px;
  text-align: center;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Footer = styled(View)`
  align-items: center;
  margin-top: ${({ theme }) => sp(theme, 2)}px;
`;

const RegisterRow = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: ${({ theme }) => sp(theme, 1.5)}px;
`;

const RegisterText = styled(Text)`
  color: ${({ theme }) => theme.colors.subtext};
`;

const RegisterLink = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const SmallLink = styled(TouchableOpacity)`
  padding: 6px;
`;

const SmallLinkText = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
`;

export default function LoginScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { user } = await DI.loginUser.execute({ email, password });
      setUser(user);
    } catch (e: any) {
      setUser({ id_user: -1, email });
      setErr(e?.response?.data?.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      scroll
      padBottom="safe"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      <Root>
        <Header>
          <BrandMark icon={dumbbellIcon} />
          <H1>GymPoint</H1>
          <Subtitle>Encontrá tu gym ideal y mantené tu racha</Subtitle>
        </Header>

        <AuthCard>
          <AuthCardTitle>Iniciar sesión</AuthCardTitle>

          <FormField label="Email">
            <InputLogin
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Contraseña">
            <PasswordInput
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
            />
          </FormField>

          {err && <ErrorText>{err}</ErrorText>}

          <Button
            onPress={onLogin}
            disabled={loading}
            style={{ marginTop: 12, width: '100%' }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText style={{ color: '#ffffff' }}>Iniciar sesión</ButtonText>
            )}
          </Button>

          <DividerWithText>o</DividerWithText>

          <SocialButton onPress={() => console.log('Continuar con Google')}>
            Continuar con Google
          </SocialButton>

          <Footer>
            <SmallLink onPress={() => console.log('Olvidé mi contraseña')}>
              <SmallLinkText>¿Olvidaste tu contraseña?</SmallLinkText>
            </SmallLink>

            <RegisterRow>
              <RegisterText>¿No tenés cuenta? </RegisterText>
              <TouchableOpacity onPress={() => console.log('Ir a registro')}>
                <RegisterLink>Crear cuenta</RegisterLink>
              </TouchableOpacity>
            </RegisterRow>
          </Footer>
        </AuthCard>
      </Root>
    </Screen>
  );
}
