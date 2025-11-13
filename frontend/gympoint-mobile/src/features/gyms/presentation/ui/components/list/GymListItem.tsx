import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { LocationBadge } from '@shared/components/ui';

type Props = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  onPress?: (id: string | number) => void;
};

/**
 * GymListItem - Tarjeta de gimnasio para el listado
 *
 * Cambios en esta refactorización (FASE 2 - Redesign):
 * - IndexBadge (número) → LocationBadge (icono ubicación con gradiente)
 * - ListItem genérico → Custom layout con card styling
 * - Flecha de texto → Icono chevron-forward
 * - Aplicado: bg-surface, border, padding, shadow
 * - Removido: hours (no se usa) e index (no se necesita)
 *
 * Sigue el patrón visual del prototipo UI/UX con cards profesionales
 */
export function GymListItem({
  id,
  name,
  distancia,
  address,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDistance = (distance?: number) =>
    typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : '—';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 2,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 1,
      };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id)}
      activeOpacity={0.75}
      style={[
        {
          marginBottom: 12,
        },
      ]}
    >
      <View
        style={[
          {
            backgroundColor: isDark ? '#1A1F2E' : '#FFFFFF',
            borderColor: isDark ? '#2C3444' : '#DDDDDD',
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          },
          shadowStyle,
        ]}
      >
        {/* LocationBadge - Icono ubicación con gradiente */}
        <LocationBadge size={40} />

        {/* Contenido central: nombre, distancia, dirección */}
        <View style={{ flex: 1, gap: 4 }}>
          {/* Nombre del gimnasio */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
            numberOfLines={1}
          >
            {name}
          </Text>

          {/* Distancia */}
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {formatDistance(distancia)}
          </Text>

          {/* Dirección */}
          {address && (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}
              numberOfLines={1}
            >
              {address}
            </Text>
          )}
        </View>

        {/* Icono flecha derecha */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
      </View>
    </TouchableOpacity>
  );
}
