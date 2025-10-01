import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { Row } from '@shared/components/ui';
import { sp } from '@shared/styles';

const Footer = styled.View`
  align-items: center;
  margin-top: ${({ theme }) => sp(theme, 2)}px;
`;

const SmallLink = styled.TouchableOpacity`
  padding: ${({ theme }) => sp(theme, 0.75)}px;
`;

const SmallLinkText = styled.Text`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
`;

const RegisterRow = styled(Row)`
  margin-top: ${({ theme }) => sp(theme, 1.5)}px;
`;

const RegisterText = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

const RegisterLink = styled.Text`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

type LoginFooterProps = {
  onForgotPassword: () => void;
  onRegister: () => void;
};

export function LoginFooter({ onForgotPassword, onRegister }: LoginFooterProps) {
  return (
    <Footer>
      <SmallLink onPress={onForgotPassword}>
        <SmallLinkText>¿Olvidaste tu contraseña?</SmallLinkText>
      </SmallLink>

      <RegisterRow $justify="center">
        <RegisterText>¿No tenés cuenta? </RegisterText>
        <TouchableOpacity onPress={onRegister}>
          <RegisterLink>Crear cuenta</RegisterLink>
        </TouchableOpacity>
      </RegisterRow>
    </Footer>
  );
}
