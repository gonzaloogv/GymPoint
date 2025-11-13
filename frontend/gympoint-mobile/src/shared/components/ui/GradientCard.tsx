import { View, ViewProps, StyleSheet } from 'react-native';
import { palette } from '@shared/styles';

/**
 * GradientCard - Card con estilo premium (fondo y borde premium)
 * Reutilizable en cualquier feature que necesite mostrar contenido premium
 */
export const GradientCard = ({
  className = '',
  style,
  ...props
}: ViewProps) => {
  const computedStyle = StyleSheet.flatten([
    {
      backgroundColor: palette.premiumBg,
      borderColor: palette.premiumBorderAlt,
    },
    style,
  ]);

  return (
    <View
      className={`p-4 mb-4 rounded-md border ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};
