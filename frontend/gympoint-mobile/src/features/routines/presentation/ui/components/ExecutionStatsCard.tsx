import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success';
};

/**
 * Card pequeño para mostrar una métrica durante la ejecución
 * Usado para: Duración, Volumen total, Series completadas
 */
export function ExecutionStatsCard({
  label,
  value,
  icon,
  variant = 'default',
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos según variante
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#1f2937' : '#f9fafb';

  let accentColor = '#6b7280';
  if (variant === 'accent') {
    accentColor = '#3b82f6'; // Azul
  } else if (variant === 'success') {
    accentColor = '#10b981'; // Verde
  }

  return (
    <View
      className="flex-1 rounded-lg p-3 items-center justify-center"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Icon opcional */}
      {icon && (
        <View className="mb-1">
          {icon}
        </View>
      )}

      {/* Valor principal */}
      <Text
        className="text-2xl font-black"
        style={{
          color: accentColor,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        className="text-xs font-semibold text-center"
        style={{
          color: secondaryTextColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
