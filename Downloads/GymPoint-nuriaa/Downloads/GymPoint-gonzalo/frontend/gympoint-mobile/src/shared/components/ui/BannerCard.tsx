import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card } from './Card';
import { Row } from './Row';
import { palette, rad } from '@shared/styles';

const BannerCardContainer = styled(Card)<{ $variant: 'warning' | 'premium' | 'info' }>`
  border-color: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return palette.warningBorder;
      case 'premium':
        return palette.premiumBorder;
      case 'info':
        return palette.infoBorder;
      default:
        return palette.neutralBorder;
    }
  }};
  background-color: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return palette.warningSurface;
      case 'premium':
        return palette.premiumSurface;
      case 'info':
        return palette.infoSurface;
      default:
        return palette.surfaceMuted;
    }
  }};
`;

const BannerContent = styled(Row).attrs({ $align: 'flex-start' })`
  flex: 1;
`;

const BannerCopy = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(1.5)}px;
`;

const Title = styled.Text<{ $variant: 'warning' | 'premium' | 'info' }>`
  margin-bottom: ${({ theme }) => theme.spacing(0.25)}px;
  font-weight: 600;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return palette.warningStrong;
      case 'premium':
        return palette.premiumStrong;
      case 'info':
        return palette.infoStrong;
      default:
        return palette.textStrong;
    }
  }};
`;

const Description = styled.Text<{ $variant: 'warning' | 'premium' | 'info' }>`
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return palette.warningText;
      case 'premium':
        return palette.premiumText;
      case 'info':
        return palette.info;
      default:
        return palette.textMuted;
    }
  }};
`;

const OutlineButton = styled.TouchableOpacity`
  min-height: ${({ theme }) => theme.spacing(5)}px;
  padding: ${({ theme }) => theme.spacing(1.25)}px ${({ theme }) => theme.spacing(1.75)}px;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

const OutlineText = styled.Text`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const LeadingIcon = styled(FeatherIcon)<{ $variant: 'warning' | 'premium' | 'info' }>`
  margin-top: ${({ theme }) => theme.spacing(0.25)}px;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return palette.warningIcon;
      case 'premium':
        return palette.premiumIcon;
      case 'info':
        return palette.info;
      default:
        return palette.textMuted;
    }
  }};
`;

type Props = {
  visible: boolean;
  variant: 'warning' | 'premium' | 'info';
  icon: keyof typeof FeatherIcon.glyphMap;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
};

export function BannerCard({
  visible,
  variant,
  icon,
  title,
  description,
  buttonText,
  onButtonPress,
}: Props) {
  if (!visible) return null;

  return (
    <BannerCardContainer $variant={variant}>
      <BannerContent>
        <LeadingIcon name={icon} size={20} $variant={variant} />
        <BannerCopy>
          <Title $variant={variant}>{title}</Title>
          <Description $variant={variant}>{description}</Description>
          <OutlineButton onPress={onButtonPress}>
            <OutlineText>{buttonText}</OutlineText>
          </OutlineButton>
        </BannerCopy>
      </BannerContent>
    </BannerCardContainer>
  );
}
