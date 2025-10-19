import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@shared/styles';

const Container = styled.View`
  width: 100%;
  gap: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${palette.textStrong};
  margin-bottom: 4px;
`;

const QuickGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const ActionCard = styled.TouchableOpacity<{ backgroundColor: string; borderColor: string }>`
  flex: 1;
  min-width: 48%;
  max-width: 48%;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-width: 1.5px;
  border-color: ${({ borderColor }) => borderColor};
  border-radius: 16px;
  padding: 16px;
  gap: 8px;
`;

const IconCircle = styled.View<{ backgroundColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  align-items: center;
  justify-content: center;
`;

const Label = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${palette.textStrong};
  margin-top: 4px;
`;

const Description = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${palette.textMuted};
`;

type Props = {
  onFindGyms?: () => void;
  onMyRoutines?: () => void;
  onProgress?: () => void;
  onRewards?: () => void;
};

type QuickAction = {
  key: 'gyms' | 'routines' | 'progress' | 'rewards';
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  cardBackground: string;
  borderColor: string;
  onPress: () => void;
};

export default function QuickActions({
  onFindGyms,
  onMyRoutines,
  onProgress,
  onRewards
}: Props) {
  const navigation = useNavigation<any>();

  const actions: QuickAction[] = [
    {
      key: 'gyms',
      label: 'Encontrar gym',
      description: '3 cerca de ti',
      iconName: 'location',
      iconColor: '#3b82f6',
      iconBackground: '#dbeafe',
      cardBackground: '#eff6ff',
      borderColor: '#93c5fd',
      onPress: onFindGyms ?? (() => navigation.navigate('Mapa')),
    },
    {
      key: 'routines',
      label: 'Mis rutinas',
      description: '2 activas',
      iconName: 'barbell',
      iconColor: '#a855f7',
      iconBackground: '#f3e8ff',
      cardBackground: '#faf5ff',
      borderColor: '#d8b4fe',
      onPress: onMyRoutines ?? (() => navigation.navigate('Rutinas')),
    },
    {
      key: 'progress',
      label: 'Progreso',
      description: 'Ver estadísticas',
      iconName: 'trending-up',
      iconColor: '#10b981',
      iconBackground: '#d1fae5',
      cardBackground: '#ecfdf5',
      borderColor: '#86efac',
      onPress: onProgress ?? (() => navigation.navigate('Progreso')),
    },
    {
      key: 'rewards',
      label: 'Recompensas',
      description: '2 disponibles',
      iconName: 'gift',
      iconColor: '#f59e0b',
      iconBackground: '#fef3c7',
      cardBackground: '#fffbeb',
      borderColor: '#fcd34d',
      onPress: onRewards ?? (() => navigation.navigate('Usuario', { screen: 'Rewards' })),
    },
  ];

  return (
    <Container>
      <SectionTitle>Accesos rápidos</SectionTitle>
      <QuickGrid>
        {actions.map(({ key, label, description, iconName, iconColor, iconBackground, cardBackground, borderColor, onPress }) => (
          <ActionCard key={key} backgroundColor={cardBackground} borderColor={borderColor} onPress={onPress}>
            <IconCircle backgroundColor={iconBackground}>
              <Ionicons name={iconName} size={24} color={iconColor} />
            </IconCircle>
            <Label>{label}</Label>
            <Description>{description}</Description>
          </ActionCard>
        ))}
      </QuickGrid>
    </Container>
  );
}
