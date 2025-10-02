import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card } from './Card';
import { Circle } from './Circle';
import { Row } from './Row';
import { palette, sp } from '@shared/styles';

const ActionCardContainer = styled(Card)<{ $spaced?: boolean }>`
  flex: 1;
  align-items: center;
  padding-vertical: ${({ theme }) => sp(theme, 2)}px;
  ${({ $spaced, theme }) => ($spaced ? `margin-right: ${sp(theme, 1.5)}px;` : '')}
`;

const ActionButton = styled.TouchableOpacity.attrs({ activeOpacity: 0.6 })`
  flex: 1;
  align-items: center;
`;

const ActionCircle = styled(Circle)`
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

const Heading = styled.Text`
  margin-bottom: 2px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
`;

const Subtext = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

type Props = {
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  spaced?: boolean;
};

export function ActionCard({
  label,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  spaced = false,
}: Props) {
  return (
    <ActionCardContainer $spaced={spaced}>
      <ActionButton onPress={onPress}>
        <ActionCircle $size={48} $background={iconBackground}>
          <FeatherIcon name={icon} size={24} color={iconColor} />
        </ActionCircle>
        <Heading>{label}</Heading>
        <Subtext>{description}</Subtext>
      </ActionButton>
    </ActionCardContainer>
  );
}
