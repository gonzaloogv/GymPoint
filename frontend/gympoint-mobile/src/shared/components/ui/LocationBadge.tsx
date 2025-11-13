import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  size?: number;
};

/**
 * LocationBadge - Icono de ubicación con gradiente dinámico según tema
 *
 * Características:
 * - Light mode: Gradiente azul (#3b82f6 → #4F9CF9)
 * - Dark mode: Gradiente morado (#8b5cf6 → #9333EA)
 * - Icono blanco centrado
 * - Border radius: rounded-lg (12px)
 *
 * @param size - Tamaño del badge en pixels (default: 40)
 */
export function LocationBadge({ size = 40 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores del gradiente según el tema
  const gradientColors: [string, string] = isDark
    ? ['#8b5cf6', '#9333EA'] // Morado (dark mode)
    : ['#3b82f6', '#4F9CF9']; // Azul (light mode)

  const iconSize = size * 0.5; // 20px para badge de 40px

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: 12, // rounded-lg
        justifyContent: 'center',
        alignItems: 'center',
      } as any}
    >
      <Ionicons name="location" size={iconSize} color="#FFFFFF" />
    </LinearGradient>
  );
}

export default LocationBadge;