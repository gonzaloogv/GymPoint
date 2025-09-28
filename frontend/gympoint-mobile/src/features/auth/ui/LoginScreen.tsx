import { useState } from 'react';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';
import { ErrorText, Screen, BrandMark, H1, AuthCard, AuthCardTitle, FormField, InputLogin, PasswordInput, Button, ButtonText, SocialButton, DividerWithText } from '@shared/components/ui';

import styled from 'styled-components/native';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { sp } from '@shared/styles/uiTokens';
// --- layout local (propio de esta pantalla) ---
const Root = styled(View)`
  flex: 1; align-items: center; justify-content: center;
  padding: ${p => sp(p.theme, 3)}px ${p => sp(p.theme, 2)}px;
  background-color: ${p => p.theme?.colors?.bg ?? '#fafafa'};
`;
const Header = styled(View)` align-items: center; margin-bottom: ${p => sp(p.theme, 3)}px; `;

const Subtitle = styled(Text)`
  color: ${p => p.theme?.colors?.subtext ?? '#6b7280'};
  text-align: center; margin-top: 6px;
`;

const Footer = styled(View)` align-items: center; margin-top: ${p => sp(p.theme, 2)}px; `;
const RegisterRow = styled(View)` flex-direction: row; justify-content: center; margin-top: ${p => sp(p.theme, 1.5)}px; `;
const RegisterText = styled(Text)` color: ${p => p.theme?.colors?.subtext ?? '#6b7280'}; `;
const RegisterLink = styled(Text)` color: ${p => p.theme?.colors?.primary ?? '#111827'}; font-weight: 600; `;
const SmallLink = styled(TouchableOpacity)` padding: 6px; `;
const SmallLinkText = styled(Text)` color: ${p => p.theme?.colors?.primary ?? '#111827'}; font-weight: 500; `;

export default function LoginScreen() {
  const setUser = useAuthStore(s => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true); setErr(null);
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
          <BrandMark icon={require('../../../../assets/dumbbell.png')} />
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

          <Button onPress={onLogin} disabled={loading} style={{ marginTop: 12, width: '100%' }}>
            {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Iniciar sesión</ButtonText>}
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
