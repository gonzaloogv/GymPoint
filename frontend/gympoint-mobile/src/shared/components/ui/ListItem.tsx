import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, View, Text, ViewStyle, StyleProp } from 'react-native';
import { sp } from '@shared/styles';

type Props = {
  children: React.ReactNode;
  Left?: React.ReactNode;
  Right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => sp(theme, 1.5)}px ${({ theme }) => sp(theme, 2)}px;
`;

const LeftWrap = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 1;
`;
export const ItemPad = styled.View`
  padding: 0 ${({ theme }) => theme.spacing(2)}px;
`;

export function ListItem({ children, Left, Right, onPress, style }: Props) {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container onPress={onPress}>
      <Row style={style}>
        <LeftWrap>
          {Left}
          <View style={{ flex: 1 }}>{children}</View>
        </LeftWrap>
        {Right}
      </Row>
    </Container>
  );
}

export default ListItem;
