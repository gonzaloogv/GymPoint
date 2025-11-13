import { View, Text } from 'react-native';

type Props = {
  status: 'Active' | 'Scheduled' | 'Completed';
  labels?: {
    Active?: string;
    Scheduled?: string;
    Completed?: string;
  };
};

const defaultLabels = {
  Active: 'Activa',
  Scheduled: 'Programada',
  Completed: 'Completada',
};

export function StatusPill({ status, labels = {} }: Props) {
  const finalLabels = { ...defaultLabels, ...labels };

  const isActive = status === 'Active';
  const bgColor = isActive ? '#4A9CF5' : '#FFFFFF';
  const borderColor = isActive ? '#4A9CF5' : '#DDDDDD';
  const textColor = isActive ? '#FFFFFF' : '#1A1A1A';

  return (
    <View
      className="px-2 py-1 rounded-lg border"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <Text className="text-xs font-semibold" style={{ color: textColor }}>
        {finalLabels[status]}
      </Text>
    </View>
  );
}
