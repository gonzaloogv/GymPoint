import React from 'react';
import { TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';

type Props = {
  children: React.ReactNode;
  Left?: React.ReactNode;
  Right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ItemPad = ({ children, ...props }: any) => (
  <View className="px-4" {...props}>
    {children}
  </View>
);

export function ListItem({ children, Left, Right, onPress, style }: Props) {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container onPress={onPress} style={style}>
      <View className="flex-row items-center justify-between py-3 px-4">
        <View className="flex-row items-center gap-2.5 flex-1">
          {Left}
          <View style={{ flex: 1 }}>{children}</View>
        </View>
        {Right}
      </View>
    </Container>
  );
}

export default ListItem;
