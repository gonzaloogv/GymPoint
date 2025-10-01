import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { UnifiedBadge } from './UnifiedBadge';
import { CardRow, CardTitle } from './Card';
import { Row } from './Row';
import { palette } from '@shared/styles';

const HeaderRow = styled(CardRow)`
  margin-bottom: 8px;
`;

const TitleRow = styled(Row)`
  flex: 1;
`;

const TitleText = styled(CardTitle)`
  margin-left: 8px;
`;

type Props = {
  icon: keyof typeof FeatherIcon.glyphMap;
  title: string;
  badgeText?: string;
  badgeVariant?: 'secondary' | 'outline';
};

export function CardHeader({ icon, title, badgeText, badgeVariant = 'secondary' }: Props) {
  return (
    <HeaderRow>
      <TitleRow>
        <FeatherIcon name={icon} size={20} color={palette.textStrong} />
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
