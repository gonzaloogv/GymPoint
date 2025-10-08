import styled, { DefaultTheme, useTheme } from 'styled-components/native';
import { useState } from 'react';
import { TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const Input = styled.TextInput.attrs(({ theme }: { theme: DefaultTheme }) => ({
  placeholderTextColor: theme.colors.subtext,
}))`
  background-color: ${({ theme }) => theme.colors.inputBg};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  padding: ${({ theme }) => theme.spacing(1.5)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
  width: 100%;
`;

export const InputLogin = styled.TextInput.attrs(
  ({ theme }: { theme: DefaultTheme }) => ({
    placeholderTextColor: theme.colors.subtext,
  }),
)`
  background-color: ${({ theme }) => theme.colors.inputBg};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  padding: ${({ theme }) => theme.spacing(1.5)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
  width: 80%;
`;

//password

const Relative = styled.View`
  position: relative;
  width: 100%;
`;
const EyeToggle = styled(TouchableOpacity)`
  position: absolute;
  right: 12px;
  top: 0;
  bottom: 12px;
  justify-content: center;
  padding: 6px;
`;

export function PasswordInput(props: TextInputProps) {
  const [show, setShow] = useState(false);
  const theme = useTheme() as any;
  return (
    <Relative>
      <InputLogin
        {...props}
        secureTextEntry={!show}
        style={[{ width: '100%', paddingRight: 44 }, props.style]}
      />
      <EyeToggle onPress={() => setShow((v) => !v)}>
        <Feather
          name={show ? 'eye-off' : 'eye'}
          size={20}
          color={theme?.colors?.subtext ?? '#6b7280'}
        />
      </EyeToggle>
    </Relative>
  );
}
