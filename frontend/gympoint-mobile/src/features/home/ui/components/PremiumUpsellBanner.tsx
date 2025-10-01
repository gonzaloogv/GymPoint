import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card, Row } from '@shared/components/ui';
import { palette, rad } from '@shared/styles';

const UpsellCard = styled(Card)`
  border-color: ${palette.premiumBorder};
  background-color: ${palette.premiumSurface};
`;

const UpsellContent = styled(Row).attrs({ $align: 'flex-start' })`
  flex: 1;
`;

const UpsellCopy = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Title = styled.Text`
  margin-bottom: 2px;
  font-weight: 700;
  color: ${palette.premiumStrong};
`;

const Description = styled.Text`
  margin-bottom: 8px;
  color: ${palette.premiumText};
`;

const OutlineButton = styled.TouchableOpacity`
  min-height: 40px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? palette.neutralBorder};
  align-items: center;
  justify-content: center;
`;

const OutlineText = styled.Text`
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
`;

const LeadingIcon = styled(FeatherIcon).attrs({ size: 20, color: palette.premiumIcon })`
  margin-top: 2px;
`;

type Props = { visible: boolean; onPress?: () => void };

export default function PremiumUpsellBanner({ visible, onPress }: Props) {
  if (!visible) return null;

  return (
    <UpsellCard>
      <UpsellContent>
        <LeadingIcon name="zap" />
        <UpsellCopy>
          <Title>Upgrade a Premium</Title>
          <Description>
            Accedé a rutinas personalizadas, métricas avanzadas y más recompensas
          </Description>
          <OutlineButton onPress={onPress}>
            <OutlineText>Ver planes</OutlineText>
          </OutlineButton>
        </UpsellCopy>
      </UpsellContent>
    </UpsellCard>
  );
}
