// import { useState } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// import dumbbellIcon from '@assets/dumbbell.png';
// import {
//   Button,
//   Card,
//   Divider,
//   FormField,
//   Input,
//   PasswordInput,
//   ErrorText,
//   Screen,
//   H1,
//   H2,
//   Row,
// } from '@shared/components/ui';
// import { BrandMark } from '@shared/components/brand';
// import { useAuthStore } from '../state/auth.store';
// import { useTheme } from '@shared/hooks';

// type RootStackParamList = {
//   Login: undefined;
//   Register: undefined;
//   App: undefined;
// };

// type Nav = NativeStackNavigationProp<RootStackParamList>;

// export default function LoginScreen() {
//   const navigation = useNavigation<Nav>();
//   const setUser = useAuthStore((state) => state.setUser);
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       setUser({
//         id_user: -1,
//         name: 'Usuario Demo',
//         email: email || 'demo@gympoint.app',
//         role: 'USER',
//         tokens: 0,
//         plan: 'Free',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogle = () => console.log('Continuar con Google');
//   const handleForgotPassword = () => console.log('Olvidé mi contraseña');
//   const handleRegister = () => navigation.navigate('Register');

//   const subtitleColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

//   return (
//     <Screen
//       scroll
//       padBottom="safe"
//       contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//       keyboardShouldPersistTaps="handled"
//     >
//       <View className="flex-1 justify-center items-center px-4 py-6">
//         <View className="items-center mb-8">
//           <BrandMark icon={dumbbellIcon} />
//           <H1 className="mt-2">GymPoint</H1>
//           <Text className={`mt-2 text-center ${subtitleColor}`}>
//             Encontrá tu gym ideal y mantené tu racha
//           </Text>
//         </View>

//         <Card variant="elevated" padding="lg" className="w-full max-w-md">
//           <H2 align="center" className="mb-6">
//             Iniciar sesión
//           </H2>

//           <View className="w-full">
//             <FormField label="Email">
//               <Input
//                 placeholder="tu@email.com"
//                 value={email}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//               />
//             </FormField>

//             <FormField label="Contraseña">
//               <PasswordInput
//                 placeholder="Tu contraseña"
//                 value={password}
//                 onChangeText={setPassword}
//               />
//             </FormField>

//             {error && <ErrorText>{error}</ErrorText>}

//             <Button
//               onPress={handleLogin}
//               disabled={loading}
//               loading={loading}
//               fullWidth
//               className="mt-4"
//             >
//               Iniciar sesión
//             </Button>
//           </View>

//           <Divider text="o" />

//           <Button onPress={handleGoogle} variant="secondary" fullWidth>
//             Continuar con Google
//           </Button>

//           <View className="items-center mt-4">
//             <TouchableOpacity onPress={handleForgotPassword} className="py-2">
//               <Text className="font-medium text-primary">
//                 ¿Olvidaste tu contraseña?
//               </Text>
//             </TouchableOpacity>

//             <Row justify="center" className="mt-3">
//               <Text className={subtitleColor}>¿No tenés cuenta? </Text>
//               <TouchableOpacity onPress={handleRegister}>
//                 <Text className="font-semibold text-primary">Crear cuenta</Text>
//               </TouchableOpacity>
//             </Row>
//           </View>
//         </Card>
//       </View>
//     </Screen>
//   );
// }


// src/features/auth/presentation/ui/screens/LoginScreenTest.tsx

import { useTheme } from '@shared/hooks';
import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreenTest() {
  const { theme, setThemeMode } = useTheme();
  const isDark = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Login con:', email);
    }, 1500);
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6 py-8">
            
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">🏋️</Text>
              </View>
              <Text className={`text-3xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                GymPoint
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                Encontrá tu gym ideal
              </Text>
            </View>

            {/* Card */}
            <View className={`w-full max-w-md ${isDark ? 'bg-surface-dark' : 'bg-surface'} rounded-2xl p-6 shadow-lg`}>
              
              {/* Toggle Theme Button */}
              <TouchableOpacity
                onPress={toggleTheme}
                className="absolute top-4 right-4 p-2"
              >
                <Text className="text-2xl">{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>

              <Text className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                Iniciar sesión
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor={isDark ? '#6B7280' : '#999999'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={`
                    w-full px-4 py-4 rounded-xl border-2 text-base
                    ${isDark ? 'bg-surfaceVariant-dark text-text-dark border-inputBorder-dark' : 'bg-surface text-text border-inputBorder'}
                  `}
                />
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Contraseña
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  placeholderTextColor={isDark ? '#6B7280' : '#999999'}
                  secureTextEntry
                  className={`
                    w-full px-4 py-4 rounded-xl border-2 text-base
                    ${isDark ? 'bg-surfaceVariant-dark text-text-dark border-inputBorder-dark' : 'bg-surface text-text border-inputBorder'}
                  `}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
                className={`w-full bg-primary rounded-xl py-4 items-center justify-center ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-onPrimary text-base font-semibold">
                    Iniciar sesión
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className={`flex-1 h-[1px] ${isDark ? 'bg-divider-dark' : 'bg-divider'}`} />
                <Text className={`mx-4 text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                  o
                </Text>
                <View className={`flex-1 h-[1px] ${isDark ? 'bg-divider-dark' : 'bg-divider'}`} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                className={`
                  w-full rounded-xl py-4 items-center justify-center border-2
                  ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-surface border-border'}
                `}
              >
                <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Continuar con Google
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View className="items-center mt-6">
                <TouchableOpacity className="py-2">
                  <Text className="font-medium text-primary">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center mt-3">
                  <Text className={isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}>
                    ¿No tenés cuenta?{' '}
                  </Text>
                  <TouchableOpacity>
                    <Text className="font-semibold text-primary">
                      Crear cuenta
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Debug Info */}
            <View className="mt-8 p-4 bg-info/10 rounded-lg">
              <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
                🎨 Tema actual: {theme}
              </Text>
              <Text className={`text-xs mt-1 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                Toca el ícono ☀️/🌙 para cambiar
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}