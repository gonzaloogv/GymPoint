import styled from "styled-components/native";

const Wrapper = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
`;

const Item = styled.Text`
  color: #444;
  margin-bottom: 4px;
`;

export const Rules = () => (
  <Wrapper>
    <Title>Reglamento</Title>
    <Item>• Usar toalla obligatoria</Item>
    <Item>• No gritar ni soltar pesas</Item>
    <Item>• Respetar turnos en máquinas</Item>
  </Wrapper>
);
