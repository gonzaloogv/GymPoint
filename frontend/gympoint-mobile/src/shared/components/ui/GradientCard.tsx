import { View, ViewProps } from 'react-native';
import { palette } from '@shared/styles';

/**
 * GradientCard - Card con estilo premium (fondo y borde premium)
 * Reutilizable en cualquier feature que necesite mostrar contenido premium
 */
export const GradientCard = ({
  className = '',
  style,
  ...props
}: ViewProps) => (
  <View
    className={`p-4 mb-4 rounded-md border ${className}`}
    style={{
      backgroundColor: palette.premiumBg,
      borderColor: palette.premiumBorderAlt,
      ...style,
    }}
    {...props}
  />
);
