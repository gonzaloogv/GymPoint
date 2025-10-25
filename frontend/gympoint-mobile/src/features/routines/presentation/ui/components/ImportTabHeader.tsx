import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SegmentedControl } from '@shared/components/ui';

type Tab = {
  value: string;
  label: string;
};

type Props = {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function ImportTabHeader({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View
      className="p-4 border-b"
      style={{
        backgroundColor: cardBg,
        borderBottomColor: borderColor,
      }}
    >
      <Text className="text-sm font-semibold mb-1.5" style={{ color: subtextColor }}>
        {title}
      </Text>
      <Text className="text-sm mb-4" style={{ color: subtextColor }}>
        {description}
      </Text>
      <View className="items-center">
        <SegmentedControl options={tabs} value={activeTab} onChange={onTabChange} />
      </View>
    </View>
  );
}
