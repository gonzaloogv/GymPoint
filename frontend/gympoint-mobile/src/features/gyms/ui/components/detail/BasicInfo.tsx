import React from "react";
import styled from "styled-components/native";
import { Feather } from "@expo/vector-icons";
import { Gym } from "../types";

const Wrapper = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const Info = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 6px;
`;

interface Props {
  gym: Gym;
}

export const BasicInfo = ({ gym }: Props) => (
  <Wrapper>
    <Title>{gym.name}</Title>
    {gym.rating && (
      <Row>
        <Feather name="star" size={16} color="gold" />
        <Info>{gym.rating} (127 reseñas)</Info>
      </Row>
    )}
    <Row>
      <Feather name="map-pin" size={16} color="#666" />
      <Info>{gym.address} • {gym.distance.toFixed(1)} km</Info>
    </Row>
    <Row>
      <Feather name="clock" size={16} color="#666" />
      <Info>{gym.hours} – Abierto ahora</Info>
    </Row>
  </Wrapper>
);
