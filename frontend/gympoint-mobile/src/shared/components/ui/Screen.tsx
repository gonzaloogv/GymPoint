import { useTheme } from '@shared/hooks';
import React from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padBottom?: 'safe' | 'none';
  contentContainerStyle?: object;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  padBottom = 'none',
  contentContainerStyle,
  keyboardShouldPersistTaps,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-background-dark' : 'bg-background';

  const Container = scroll ? ScrollView : View;
  const Wrapper = padBottom === 'safe' ? SafeAreaView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <Wrapper className={`flex-1 ${bgColor}`}>
        <Container
          className="flex-1"
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </Wrapper>
    </KeyboardAvoidingView>
  );
};