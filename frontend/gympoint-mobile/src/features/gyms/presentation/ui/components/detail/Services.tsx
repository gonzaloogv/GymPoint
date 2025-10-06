import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const Wrapper = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Service = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 12px;
  margin-bottom: 6px;
`;

const Label = styled.Text`
  font-size: 14px;
  margin-left: 4px;
`;

interface Props {
  services: string[];
}

export const Services = ({ services }: Props) => {
  const icons: Record<string, string> = {
    Pesas: 'activity',
    WiFi: 'wifi',
    Cafetería: 'coffee',
    Agua: 'droplet',
  };

  return (
    <Wrapper>
      <Title>Servicios</Title>
      <Row>
        {services.map((s) => (
          <Service key={s}>
            <Feather wname="circle" size={16} color="black" />
            <Label>{s}</Label>
          </Service>
        ))}
      </Row>
    </Wrapper>
  );
};
