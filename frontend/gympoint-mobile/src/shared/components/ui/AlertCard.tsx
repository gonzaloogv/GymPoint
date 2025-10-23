import { View, ViewProps } from 'react-native';
import { palette } from '@shared/styles';

type AlertCardProps = ViewProps & {
  premium?: boolean;
};

/**
 * AlertCard - Card con variante de alerta (puede ser premium o estándar)
 * Reutilizable para mostrar mensajes importantes con borde destacado
 */
export const AlertCard = ({
  premium = false,
  className = '',
  style,
  ...props
}: AlertCardProps) => (
  <View
    className={`p-4 mb-4 rounded-xl border ${className}`}
    style={{
      backgroundColor: premium ? palette.premiumBg : palette.surfaceMuted,
      borderColor: premium ? palette.premiumBorderAlt : palette.neutralBorder,
      ...style,
    }}
    {...props}
  />
);
