import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type ViewMode = 'map' | 'list';

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  size?: 'sm' | 'md';
};

/**
 * ViewModeButtons - Componente que proporciona dos botones separados para cambiar entre vista de Mapa y Lista
 * Reemplaza SegmentedControl con mejor UX para modo fullscreen
 *
 * @param value - Modo actual ('map' | 'list')
 * @param onChange - Callback al cambiar de modo
 * @param size - Tamaño de los botones ('sm' | 'md'), default: 'sm'
 */
export function ViewModeButtons({ value, onChange, size = 'sm' }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores del tema existente (consistencia visual)
  const borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB';
  const inactiveBackgroundColor = isDark ? '#111827' : '#ffffff';
  const activeBackgroundColor = '#4A9CF5'; // Primary color
  const activeTextColor = '#ffffff';
  const inactiveTextColor = isDark ? '#9CA3AF' : '#6B7280';

  // Tamaños según prop
  const buttonSize = size === 'sm' ? 40 : 44;
  const iconSize = size === 'sm' ? 18 : 20;
  const borderRadius = buttonSize / 2;

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      };

  const renderButton = (
    mode: ViewMode,
    icon: keyof typeof Ionicons.glyphMap,
    testID: string
  ) => {
    const isActive = value === mode;

    return (
      <Pressable
        testID={testID}
        onPress={() => onChange(mode)}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius,
            borderWidth: 1,
            borderColor: isActive ? activeBackgroundColor : borderColor,
            backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
          },
          shadowStyle,
        ]}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={isActive ? activeTextColor : inactiveTextColor}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {renderButton('map', 'map', 'mapButton')}
      {renderButton('list', 'list', 'listButton')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
