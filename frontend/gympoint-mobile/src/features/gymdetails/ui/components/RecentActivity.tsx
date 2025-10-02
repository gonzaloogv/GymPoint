import React from "react";
import styled from "styled-components/native";

const Wrapper = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Log = styled.Text`
  color: #666;
  margin-bottom: 4px;
`;

export const RecentActivity = () => (
  <Wrapper>
    <Title>Actividad reciente</Title>
    <Log>Juan hizo check-in hace 2h</Log>
    <Log>María generó un código de descuento</Log>
  </Wrapper>
);
