import { Alert } from 'react-native';

import dumbbellIcon from '@assets/dumbbell.png';
import {
  AuthCard,
  AuthCardTitle,
  DividerWithText,
  Screen,
  SocialButton,
} from '@shared/components/ui';

import { RegisterForm } from './components/RegisterForm';
import { RegisterHeader } from './components/RegisterHeader';
import { RegisterFooter } from './components/RegisterFooter';
import { Root, contentContainerStyle } from './RegisterScreen.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useRegister } from '../hooks/useRegister';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;
export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register, loading, error } = useRegister();

  const handleRegister = async (userData: {
    fullName: string;
    email: string;
    password: string;
    location: string;
    age: number;
    gender: string;
    weeklyFrequency: number;
  }) => {
    const result = await register(userData);

    if (result.success) {
      // Navegar a la app principal después del registro exitoso
      navigation.navigate('App');
    } else {
      // Mostrar error al usuario
      Alert.alert('Error de registro', result.error || 'No se pudo completar el registro');
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen
      scroll
      padBottom="safe"
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      <Root>
        <RegisterHeader icon={dumbbellIcon} />

        <AuthCard>
          <AuthCardTitle>Crear cuenta</AuthCardTitle>

          <RegisterForm loading={loading} onSubmit={handleRegister} />

          <DividerWithText>o</DividerWithText>

          <SocialButton onPress={handleGoogle}>Continuar con Google</SocialButton>

          <RegisterFooter onBackToLogin={handleBackToLogin} />
        </AuthCard>
      </Root>
    </Screen>
  );
}
