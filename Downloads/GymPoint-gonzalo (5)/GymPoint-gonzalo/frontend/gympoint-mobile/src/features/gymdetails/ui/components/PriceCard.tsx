import React from "react";
import styled from "styled-components/native";

const Card = styled.View`
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  margin: 12px;
  border-radius: 12px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Price = styled.Text`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
`;

interface Props {
  price: number;
}

export const PriceCard = ({ price }: Props) => (
  <Card>
    <Title>Membresía Mensual</Title>
    <Price>${price.toLocaleString("es-AR")}</Price>
  </Card>
);
