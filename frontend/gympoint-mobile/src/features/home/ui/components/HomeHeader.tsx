import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Circle, Row } from '@shared/components/ui';
import { palette } from '@shared/styles';

const Container = styled(Row).attrs({ $justify: 'space-between' })``;

const Identity = styled(Row)`
  flex: 1;
`;

const Avatar = styled(Circle)`
  background-color: ${({ theme }) => theme?.colors?.bg ?? palette.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? palette.neutralBorder};
`;

const IdentityText = styled.View`
  margin-left: 12px;
`;

const Heading = styled.Text`
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
`;

const Subtext = styled.Text`
  margin-top: 2px;
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

const Initials = styled.Text`
  font-weight: 700;
  color: ${palette.textStrong};
`;

const Actions = styled(Row)`
  margin-left: 12px;
`;

const TokenPill = styled(Row)`
  padding: 4px 8px;
  border-radius: 999px;
  background-color: ${palette.tokenSurface};
`;

const TokenValue = styled.Text`
  margin-left: 4px;
  font-weight: 600;
  color: ${palette.token};
`;

const IconButton = styled.TouchableOpacity`
  margin-left: 8px;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
`;

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  onBellPress?: () => void;
};

export default function HomeHeader({ userName, plan, tokens, onBellPress }: Props) {
  const parts = userName.trim().split(/\s+/);
  const initials = parts.map((part) => part?.[0] ?? '').join('');
  const firstName = parts[0] ?? userName;
  return (
    <Container>
      <Identity>
        <Avatar>
          <Initials>{initials}</Initials>
        </Avatar>
        <IdentityText>
          <Heading>¡Hola, {firstName}!</Heading>
          <Subtext>Usuario {plan}</Subtext>
        </IdentityText>
      </Identity>

      <Actions>
        <TokenPill>
          <FeatherIcon name="zap" size={14} color={palette.token} />
          <TokenValue>{tokens}</TokenValue>
        </TokenPill>
        <IconButton onPress={onBellPress}>
          <FeatherIcon name="bell" size={20} color={palette.textStrong} />
        </IconButton>
      </Actions>
    </Container>
  );
}
