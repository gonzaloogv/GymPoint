import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Row } from './Row';
import { palette } from '@shared/styles';

const TokenPillContainer = styled(Row)`
  padding: 4px 8px;
  border-radius: 999px;
  background-color: ${palette.tokenSurface};
`;

const TokenValue = styled.Text`
  margin-left: 4px;
  font-weight: 600;
  color: ${palette.token};
`;

type Props = {
  value: number;
  size?: number;
};

export function TokenPill({ value, size = 14 }: Props) {
  return (
    <TokenPillContainer>
      <FeatherIcon name="zap" size={size} color={palette.token} />
      <TokenValue>{value}</TokenValue>
    </TokenPillContainer>
  );
}
