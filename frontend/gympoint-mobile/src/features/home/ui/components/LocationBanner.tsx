import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card, Row } from '@shared/components/ui';
import { palette, rad } from '@shared/styles';

const BannerCard = styled(Card)`
  border-color: ${palette.warningBorder};
  background-color: ${palette.warningSurface};
`;

const BannerContent = styled(Row).attrs({ $align: 'flex-start' })`
  flex: 1;
`;

const BannerCopy = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Title = styled.Text`
  margin-bottom: 2px;
  font-weight: 600;
  color: ${palette.warningStrong};
`;

const Description = styled.Text`
  margin-bottom: 8px;
  color: ${palette.warningText};
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

const LeadingIcon = styled(FeatherIcon).attrs({ size: 20, color: palette.warningIcon })`
  margin-top: 2px;
`;

type Props = { visible: boolean; onEnable: () => void };

export default function LocationBanner({ visible, onEnable }: Props) {
  if (!visible) return null;

  return (
    <BannerCard>
      <BannerContent>
        <LeadingIcon name="map-pin" />
        <BannerCopy>
          <Title>Activar ubicación</Title>
          <Description>
            Permitinos acceder a tu ubicación para encontrar gimnasios cercanos
          </Description>
          <OutlineButton onPress={onEnable}>
            <OutlineText>Activar ubicación</OutlineText>
          </OutlineButton>
        </BannerCopy>
      </BannerContent>
    </BannerCard>
  );
}
