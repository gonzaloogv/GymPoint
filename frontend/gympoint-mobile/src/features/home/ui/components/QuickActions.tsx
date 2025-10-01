import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card, Circle, Row } from '@shared/components/ui';
import { palette, sp } from '@shared/styles';

const Heading = styled.Text`
  margin-bottom: 2px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
`;

const Subtext = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

const QuickGrid = styled(Row)`
  width: 100%;
`;

const QuickCard = styled(Card)<{ $spaced?: boolean }>`
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

type Props = { onFindGyms?: () => void; onMyRoutines?: () => void };

type QuickAction = {
  key: 'gyms' | 'routines';
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  color: string;
  background: string;
  onPress: () => void;
};

export default function QuickActions({ onFindGyms, onMyRoutines }: Props) {
  const navigation = useNavigation<any>();

  const actions: QuickAction[] = [
    {
      key: 'gyms',
      label: 'Encontrar gym',
      description: 'Cerca de ti',
      icon: 'map-pin',
      color: palette.gymPrimary,
      background: 'rgba(59, 130, 246, 0.12)',
      onPress: onFindGyms ?? (() => navigation.navigate('Mapa')),
    },
    {
      key: 'routines',
      label: 'Mis rutinas',
      description: 'Entrenamientos',
      icon: 'activity',
      color: palette.lifestylePrimary,
      background: 'rgba(16, 185, 129, 0.12)',
      onPress: onMyRoutines ?? (() => navigation.navigate('Rutinas')),
    },
  ];

  return (
    <QuickGrid>
      {actions.map(({ key, label, description, icon, color, background, onPress }, index) => (
        <QuickCard key={key} $spaced={index === 0}>
          <ActionButton onPress={onPress}>
            <ActionCircle $size={48} $background={background}>
              <FeatherIcon name={icon} size={24} color={color} />
            </ActionCircle>
            <Heading>{label}</Heading>
            <Subtext>{description}</Subtext>
          </ActionButton>
        </QuickCard>
      ))}
    </QuickGrid>
  );
}
