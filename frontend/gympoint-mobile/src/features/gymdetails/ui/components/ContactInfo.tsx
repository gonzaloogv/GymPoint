import React from "react";
import styled from "styled-components/native";
import { Feather } from '@expo/vector-icons';

const Wrapper = styled.View`
  padding: 16px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const Text = styled.Text`
  margin-left: 8px;
`;

export const ContactInfo = () => (
  <Wrapper>
    <Row>
      <Feather name="phone" size={16} />
      <Text>(011) 4567-8901</Text>
    </Row>
    <Row>
      <Feather name="globe" size={16} />
      <Text>www.gympoint.com</Text>
    </Row>
  </Wrapper>
);
