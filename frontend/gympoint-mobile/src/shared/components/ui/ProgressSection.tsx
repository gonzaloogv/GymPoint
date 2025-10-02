import styled from 'styled-components/native';
import { Row } from './Row';
import { ProgressFill, ProgressTrack } from './ProgressBar';
import { palette } from '@shared/styles';

const Body = styled.View`
  gap: 8px;
`;

const Spread = styled(Row).attrs({ $justify: 'space-between' })``;

const Subtext = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  label?: string;
  description?: string;
};

export function ProgressSection({ 
  current, 
  goal, 
  progressPct, 
  label = "Meta semanal",
  description 
}: Props) {
  const displayDescription = description || `${current} de ${goal} entrenamientos`;

  return (
    <Body>
      <Spread>
        <Subtext>{label}</Subtext>
        <Subtext>{displayDescription}</Subtext>
      </Spread>

      <ProgressTrack>
        <ProgressFill value={progressPct} />
      </ProgressTrack>
    </Body>
  );
}
