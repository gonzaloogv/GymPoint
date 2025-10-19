import styled from 'styled-components/native';
import { Row } from '@shared/components/ui';
import { palette } from '@shared/styles';

const Container = styled(Row).attrs({ $justify: 'space-between', $align: 'flex-start' })``;

const Identity = styled.View`
  flex: 1;
`;

const Heading = styled.Text`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
  margin-bottom: 2px;
`;

const Subtext = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

const Actions = styled(Row)`
  gap: 8px;
`;

const TokenBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: #fef3c7;
  padding: 8px 12px;
  border-radius: 20px;
`;

const TokenIcon = styled.Text`
  font-size: 18px;
`;

const TokenCount = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
`;

const FireBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: #fed7d7;
  padding: 8px 12px;
  border-radius: 20px;
`;

const FireIcon = styled.Text`
  font-size: 18px;
`;

const FireCount = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #991b1b;
`;

type Props = {
  userName: string;
  tokens: number;
  streak?: number;
};

export default function HomeHeader({ userName, tokens, streak = 7 }: Props) {
  const parts = userName.trim().split(/\s+/);
  const firstName = parts[0] ?? userName;
  return (
    <Container>
      <Identity>
        <Heading>¡Hola, {firstName}!</Heading>
        <Subtext>¿Listo para entrenar hoy?</Subtext>
      </Identity>

      <Actions>
        <TokenBadge>
          <TokenIcon>⚡</TokenIcon>
          <TokenCount>{tokens}</TokenCount>
        </TokenBadge>
        <FireBadge>
          <FireIcon>🔥</FireIcon>
          <FireCount>{streak}</FireCount>
        </FireBadge>
      </Actions>
    </Container>
  );
}
