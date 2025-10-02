import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Avatar, Row, TokenPill } from '@shared/components/ui';
import { palette } from '@shared/styles';

const Container = styled(Row).attrs({ $justify: 'space-between' })``;

const Identity = styled(Row)`
  flex: 1;
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

const Actions = styled(Row)`
  margin-left: 12px;
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
  const firstName = parts[0] ?? userName;
  return (
    <Container>
      <Identity>
        <Avatar userName={userName} />
        <IdentityText>
          <Heading>¡Hola, {firstName}!</Heading>
          <Subtext>Usuario {plan}</Subtext>
        </IdentityText>
      </Identity>

      <Actions>
        <TokenPill value={tokens} />
        <IconButton onPress={onBellPress}>
          <FeatherIcon name="bell" size={20} color={palette.textStrong} />
        </IconButton>
      </Actions>
    </Container>
  );
}
