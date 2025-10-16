// import React, { useState } from 'react';
// import { TextInput, View, TouchableOpacity } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { useTheme } from '@shared/hooks';

// interface InputProps {
//   value: string;
//   onChangeText: (text: string) => void;
//   placeholder?: string;
//   type?: 'text' | 'email' | 'password';
//   error?: boolean;
//   disabled?: boolean;
//   autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
//   keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
//   className?: string;
// }

// export const Input: React.FC<InputProps> = ({
//   value,
//   onChangeText,
//   placeholder,
//   type = 'text',
//   error = false,
//   disabled = false,
//   autoCapitalize = 'sentences',
//   keyboardType = 'default',
//   className = '',
// }) => {
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';
//   const [isFocused, setIsFocused] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const bgColor = isDark ? 'bg-surfaceVariant-dark' : 'bg-surface';
//   const textColor = isDark ? 'text-text-dark' : 'text-text';
//   const borderColor = error
//     ? 'border-inputBorderError'
//     : isFocused
//     ? 'border-inputBorderFocused'
//     : isDark
//     ? 'border-inputBorder-dark'
//     : 'border-inputBorder';

//   const baseClasses = `
//     w-full
//     px-4 py-4
//     ${bgColor}
//     ${textColor}
//     border-2
//     ${borderColor}
//     rounded-xl
//     text-base
//     ${disabled ? 'opacity-50' : ''}
//     ${className}
//   `.trim();

//   const iconColor = isDark ? '#B0B8C8' : '#666666';

//   if (type === 'password') {
//     return (
//       <View className="relative w-full">
//         <TextInput
//           value={value}
//           onChangeText={onChangeText}
//           placeholder={placeholder}
//           placeholderTextColor={isDark ? '#6B7280' : '#999999'}
//           secureTextEntry={!showPassword}
//           autoCapitalize="none"
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//           editable={!disabled}
//           className={baseClasses}
//         />
//         <TouchableOpacity
//           onPress={() => setShowPassword(!showPassword)}
//           className="absolute right-4 top-4"
//         >
//           <Feather
//             name={showPassword ? 'eye-off' : 'eye'}
//             size={20}
//             color={iconColor}
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <TextInput
//       value={value}
//       onChangeText={onChangeText}
//       placeholder={placeholder}
//       placeholderTextColor={isDark ? '#6B7280' : '#999999'}
//       autoCapitalize={autoCapitalize}
//       keyboardType={keyboardType}
//       onFocus={() => setIsFocused(true)}
//       onBlur={() => setIsFocused(false)}
//       editable={!disabled}
//       className={baseClasses}
//     />
//   );
// };

// export const InputLogin = Input;
// export const PasswordInput = (props: Omit<InputProps, 'type'>) => (
//   <Input {...props} type="password" />
// );

import React,{ useState } from 'react';
import { TextInput, View, TouchableOpacity, type TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

// Extendemos TextInputProps para heredar todas las props nativas
interface InputProps extends TextInputProps {
  error?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  className = '',
  ...props // Usamos el "rest operator" para pasar todas las demás props al TextInput
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const bgColor = isDark ? 'bg-surfaceVariant-dark' : 'bg-surface';
  const textColor = isDark ? 'text-text-dark' : 'text-text';
  const borderColor = error
    ? 'border-inputBorderError'
    : isFocused
    ? 'border-inputBorderFocused'
    : isDark
    ? 'border-inputBorder-dark'
    : 'border-inputBorder';

  const baseClasses = `
    w-full px-4 py-4 ${bgColor} ${textColor} border-2 ${borderColor}
    rounded-xl text-base ${props.editable === false ? 'opacity-50' : ''}
    ${className}
  `.trim();

  const iconColor = isDark ? '#B0B8C8' : '#666666';

  // --- Caso especial para contraseñas, para mostrar el ícono de ojo ---
  // Comprobamos la prop secureTextEntry que ahora recibimos gracias a la herencia
  if (props.secureTextEntry) {
    return (
      <View className="relative w-full">
        <TextInput
          {...props} // Pasamos todas las props al TextInput
          placeholderTextColor={isDark ? '#6B7280' : '#999999'}
          secureTextEntry={!showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e); // Ejecutamos el onFocus original si existe
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e); // Ejecutamos el onBlur original si existe
          }}
          className={baseClasses}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-4"
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TextInput
      {...props} // Pasamos todas las props al TextInput
      placeholderTextColor={isDark ? '#6B7280' : '#999999'}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      className={baseClasses}
    />
  );
};
