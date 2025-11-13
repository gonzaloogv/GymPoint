import { View, Text } from 'react-native';

type Props = {
  setNumber: number;
  done?: boolean;
  current?: boolean;
  label?: string;
};

export function SetPill({ setNumber, done = false, current = false, label }: Props) {
  const displayLabel = label || `Serie ${setNumber}`;

  let bgColor = '#f3f4f6';
  let borderColor = '#f3f4f6';
  let textColor = '#1A1A1A';

  if (done) {
    bgColor = '#4A9CF5';
    borderColor = '#4A9CF5';
    textColor = '#FFFFFF';
  } else if (current) {
    bgColor = '#FFFFFF';
    borderColor = '#DDDDDD';
    textColor = '#1A1A1A';
  }

  return (
    <View
      className="px-2 py-1 rounded-lg border"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <Text className="font-semibold text-sm" style={{ color: textColor }}>
        {displayLabel}
      </Text>
    </View>
  );
}
