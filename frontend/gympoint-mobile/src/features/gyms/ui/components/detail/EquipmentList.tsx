import React from "react";
import styled from "styled-components/native";
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";
import { Gym } from "../types";

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
  expandedCategories: string[];
  toggleCategory: (c: string) => void;
}

export const EquipmentList = ({ equipment, expandedCategories, toggleCategory }: Props) => {
  if (!equipment) return null;

  return (
    <Wrapper>
      <CatTitle>Equipamiento</CatTitle>
      {equipment.map((cat) => (
        <Category key={cat.category}>
          <TouchableOpacity onPress={() => toggleCategory(cat.category)}>
            <Row>
              <CatTitle>{cat.category}</CatTitle>
              <Feather
                name={expandedCategories.includes(cat.category) ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </Row>
          </TouchableOpacity>
          {expandedCategories.includes(cat.category) &&
            cat.items.map((i) => <Item key={i.name}>• {i.name} ({i.quantity})</Item>)}
        </Category>
      ))}
    </Wrapper>
  );
};
