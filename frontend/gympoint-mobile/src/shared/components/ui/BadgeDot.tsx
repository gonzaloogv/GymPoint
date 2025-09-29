import styled from 'styled-components/native';
import { View, Text, StyleProp, ViewStyle } from 'react-native';

const Dot = styled(View)`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  align-items: center;
  justify-content: center;
`;

const DotText = styled(Text)`
  color: #fff;
  font-size: 10px;
  font-weight: 700;
`;

type Props = { count: number | string; style?: StyleProp<ViewStyle> };

/** Se usa superpuesto a cualquier botón: posición relativa en el parent */
export function BadgeDot({ count, style }: Props) {
  return (
    <Dot style={style}>
      <DotText>{count}</DotText>
    </Dot>
  );
}

export default BadgeDot;
