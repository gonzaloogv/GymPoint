import { Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Circle } from './Circle';

type Props = {
  userName: string;
  size?: number;
};

export function Avatar({ userName, size = 40 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const parts = (userName || '').trim().split(/\s+/);
  const initials = parts.map((part) => part?.[0] ?? '').join('');

  return (
    <Circle
      size={size}
      backgroundColor={isDark ? '#252B3D' : '#F5F5F5'}
      className="border"
      style={{
        borderColor: isDark ? '#2C3444' : '#DDDDDD',
      }}
    >
      <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
        {initials}
      </Text>
    </Circle>
  );
}
