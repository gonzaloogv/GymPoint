import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { UnifiedBadge } from './UnifiedBadge';
import { CardRow, CardTitle } from './Card';
import { Row } from './Row';

const HeaderRow = styled(CardRow)`
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
`;

const TitleRow = styled(Row)`
  flex: 1;
`;

const TitleText = styled(CardTitle)`
  margin-left: ${({ theme }) => theme.spacing(1)}px;
`;

type Props = {
  icon: keyof typeof FeatherIcon.glyphMap;
  title: string;
  badgeText?: string;
  badgeVariant?: 'secondary' | 'outline';
  iconColor?: string;
};

export function CardHeader({ icon, title, badgeText, badgeVariant = 'secondary', iconColor }: Props) {
  const theme = useTheme();
  const color = iconColor || theme.colors.text;
  
  return (
    <HeaderRow>
      <TitleRow>
        <FeatherIcon name={icon} size={20} color={color} />
        <TitleText>{title}</TitleText>
      </TitleRow>
      {badgeText && (
        <UnifiedBadge variant={badgeVariant}>
          {badgeText}
        </UnifiedBadge>
      )}
    </HeaderRow>
  );
}
