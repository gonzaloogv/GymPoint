import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Row } from './Row';

const TokenPillContainer = styled(Row)`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: 999px;
  background-color: #fff7ed;
`;

const TokenValue = styled.Text`
  margin-left: ${({ theme }) => theme.spacing(0.5)}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

type Props = {
  value: number;
  size?: number;
};

export function TokenPill({ value, size = 14 }: Props) {
  return (
    <TokenPillContainer>
      <FeatherIcon name="zap" size={size} color="#F59E0B" />
      <TokenValue>{value}</TokenValue>
    </TokenPillContainer>
  );
}
