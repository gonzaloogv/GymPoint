import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

const Circle = styled(View)`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background-color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  align-items: center;
  justify-content: center;
`;

const Num = styled(Text)`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;

type Props = { n: number | string };

export function IndexBadge({ n }: Props) {
  return (
    <Circle>
      <Num>{n}</Num>
    </Circle>
  );
}

export default IndexBadge;
