import React from "react";
import styled from "styled-components/native";
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";
import { Gym } from '@features/gyms/domain/entities/Gym';

const Wrapper = styled.View`
  padding: 16px;
`;

const Category = styled.View`
  margin-bottom: 12px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CatTitle = styled.Text`
  font-size: 15px;
  font-weight: bold;
`;

const Item = styled.Text`
  margin-left: 12px;
  color: #555;
`;

interface Props {
  equipment?: Gym["equipment"];
}

export const EquipmentList = ({ equipment }: Props) => {
  if (!equipment || equipment.length === 0) return null;

  return (
    <Wrapper>
      <CatTitle>Equipamiento</CatTitle>
      {equipment.map((item, index) => (
        <Item key={index}>• {item}</Item>
      ))}
    </Wrapper>
  );
};
