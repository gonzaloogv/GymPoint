import { ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import {
  Button,
  ButtonText,
  ErrorText,
  FormField,
  InputLogin,
  PasswordInput,
} from '@shared/components/ui';
import { sp } from '@shared/styles';

type LoginFormProps = {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

const Fields = styled.View`
  width: 100%;
`;

const FullWidthInput = styled(InputLogin)`
  width: 100%;
`;

const SubmitButton = styled(Button)`
  margin-top: ${({ theme }) => sp(theme, 1.5)}px;
  width: 100%;
`;

const SubmitText = styled(ButtonText)`
  color: ${({ theme }) => theme.colors?.onPrimary ?? '#ffffff'};
`;

export function LoginForm({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const theme = useTheme();
  const indicatorColor = theme.colors?.onPrimary ?? '#ffffff';

  return (
    <Fields>
      <FormField label="Email">
        <FullWidthInput
          placeholder="tu@email.com"
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </FormField>

      <FormField label="Contraseña">
        <PasswordInput
          placeholder="Tu contraseña"
          value={password}
          onChangeText={onPasswordChange}
        />
      </FormField>

      {error && <ErrorText>{error}</ErrorText>}

      <SubmitButton onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={indicatorColor} />
        ) : (
          <SubmitText>Iniciar sesión</SubmitText>
        )}
      </SubmitButton>
    </Fields>
  );
}
