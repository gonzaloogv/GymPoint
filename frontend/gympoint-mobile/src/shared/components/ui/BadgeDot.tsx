import { View, Text, StyleProp, ViewStyle } from 'react-native';

type Props = { count: number | string; style?: StyleProp<ViewStyle> };

/** Se usa superpuesto a cualquier botón: posición relativa en el parent */
export function BadgeDot({ count, style }: Props) {
  return (
    <View
      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-primary items-center justify-center"
      style={style}
    >
      <Text className="text-white text-xs font-bold">{count}</Text>
    </View>
  );
}

export default BadgeDot;
