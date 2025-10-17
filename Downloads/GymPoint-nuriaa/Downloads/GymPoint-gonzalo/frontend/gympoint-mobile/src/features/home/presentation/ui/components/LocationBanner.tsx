import styled from 'styled-components/native';
import { palette } from '@shared/styles';

type Props = { visible: boolean; onEnable: () => void };

const Container = styled.View<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  background-color: #fffbeb;
  border-radius: 16px;
  padding: 16px;
  gap: 12px;
  border: 1px solid #fde68a;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const IconCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #fef3c7;
  align-items: center;
  justify-content: center;
`;

const IconText = styled.Text`
  font-size: 20px;
`;

const TextContent = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${palette.textStrong};
  margin-bottom: 4px;
`;

const Description = styled.Text`
  font-size: 12px;
  color: ${palette.textMuted};
  line-height: 18px;
`;

const Button = styled.TouchableOpacity`
  background-color: #3b82f6;
  border-radius: 12px;
  padding: 12px 16px;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

export default function LocationBanner({ visible, onEnable }: Props) {
  return (
    <Container visible={visible}>
      <Header>
        <IconCircle>
          <IconText>📍</IconText>
        </IconCircle>
        <TextContent>
          <Title>Mejora tu experiencia</Title>
          <Description>
            Permite ubicación para encontrar gyms cercanos y registrar check-ins automáticos
          </Description>
        </TextContent>
      </Header>
      <Button onPress={onEnable}>
        <ButtonText>Activar ubicación</ButtonText>
      </Button>
    </Container>
  );
}
