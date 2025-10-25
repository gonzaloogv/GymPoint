import { View } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button } from './Button';

type Action = {
  label: string;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

export function FloatingActionBar({ actions }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className="absolute left-0 right-0 bottom-0 p-4 flex-row gap-2 border-t"
      style={{
        backgroundColor: isDark ? '#0F1419' : '#FAFAFA',
        borderColor: isDark ? '#2C3444' : '#DDDDDD',
      }}
    >
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="primary"
          onPress={action.onPress}
          className="flex-1 min-h-12"
        >
          {action.label}
        </Button>
      ))}
    </View>
  );
}
