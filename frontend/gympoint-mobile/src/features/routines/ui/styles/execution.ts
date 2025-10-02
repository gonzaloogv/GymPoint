import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

export const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 800;
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

export const ProgressTrack = styled.View`
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.muted};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

export const ProgressBar = styled.View<{ $pct: number }>`
  width: ${({ $pct }) => `${$pct}%`};
  height: 8px;
  background: ${({ theme }) => theme.colors.primary};
`;

export const ExerciseCard = styled.View`
  margin: 0 16px;
`;

export const CardContent = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

export const ExerciseName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
`;

export const ExerciseMeta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

export const SetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

export const SetPill = styled.View<{ $done?: boolean; $current?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background: ${({ theme, $done, $current }) =>
    $done ? theme.colors.primary : $current ? theme.colors.card : theme.colors.muted};
  border: 1px solid
    ${({ theme, $done, $current }) =>
      $done ? theme.colors.primary : $current ? theme.colors.border : theme.colors.muted};
`;

export const SetLabel = styled.Text<{ $done?: boolean }>`
  color: ${({ theme, $done }) => ($done ? theme.colors.onPrimary : theme.colors.text)};
  font-weight: 600;
`;

export const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background: ${({ theme }) => theme.colors.bg};
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

export const OutlineButton = styled.TouchableOpacity`
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

export const OutlineLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
