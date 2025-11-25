import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from './Card';
import { Button } from './Button';

type Props = {
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

export function EmptyState({ title, description, buttonText, onButtonPress }: Props) {
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
          {buttonText && onButtonPress && (
            <Button
              variant="primary"
              className="w-full min-h-11 mt-2"
              onPress={onButtonPress}
            >
              {buttonText}
            </Button>
          )}
        </View>
      </Card>
    </View>
  );
}
