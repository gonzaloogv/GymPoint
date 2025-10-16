import styled, { useTheme } from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { sp } from '@shared/styles';

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => sp(theme, 2)}px ${({ theme }) => sp(theme, 2.5)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => sp(theme, 0.5)}px;
  margin-right: ${({ theme }) => sp(theme, 2)}px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  const theme = useTheme();

  return (
    <Container>
      <BackButton onPress={onBack}>
        <Feather name="arrow-left" size={24} color={theme.colors.text} />
      </BackButton>
      <Title>{title}</Title>
    </Container>
  );
}
