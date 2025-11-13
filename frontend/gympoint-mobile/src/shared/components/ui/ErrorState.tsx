import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from './Card';
import { Button } from './Button';

type Props = {
  title?: string;
  description?: string;
  buttonText?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Error al cargar',
  description = 'Verificá tu conexión e intentá nuevamente.',
  buttonText = 'Reintentar',
  onRetry,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="p-4">
      <Card>
        <View className="p-6 items-center gap-2">
          <Text className={`text-2xl font-bold text-center ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {title}
          </Text>
          <Text className={`text-center ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            {description}
          </Text>
          {onRetry && (
            <Button className="w-full min-h-11 mt-2" onPress={onRetry}>
              {buttonText}
            </Button>
          )}
        </View>
      </Card>
    </View>
  );
}
