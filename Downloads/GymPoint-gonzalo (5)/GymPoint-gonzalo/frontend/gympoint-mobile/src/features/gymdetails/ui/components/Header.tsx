import React from "react";
import styled from "styled-components/native";
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
`;

interface Props {
  name: string;
  onBack: () => void;
}

export const Header = ({ name, onBack }: Props) => (
  <Wrapper>
    <TouchableOpacity onPress={onBack}>
      <Feather name="arrow-left" size={24} color="black" />
    </TouchableOpacity>
    <Title>{name}</Title>
  </Wrapper>
);
