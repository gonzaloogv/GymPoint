import { useState } from 'react';
import { DI } from '@config/di';
import { useAuthStore } from '../state/auth.store';
import { Screen, CenteredContainer } from '@shared/components/ui/Screen';
import { H1, Subtle } from '@shared/components/ui/Text';
import { Input } from '@shared/components/ui/Input';
import { Button, ButtonText } from '@shared/components/ui/Button';


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
    <Screen>
      <CenteredContainer>
        <H1>Iniciar sesión</H1>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {err && <Subtle>{err}</Subtle>}

        <Button onPress={onLogin} disabled={loading}>
          <ButtonText>{loading ? 'Ingresando…' : 'Ingresar'}</ButtonText>
        </Button>
      </CenteredContainer>
    </Screen>
  );
}
