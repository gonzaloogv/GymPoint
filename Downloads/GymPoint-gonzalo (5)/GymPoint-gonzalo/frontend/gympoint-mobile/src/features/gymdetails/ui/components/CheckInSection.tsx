import React from "react";
import styled from "styled-components/native";

const Wrapper = styled.View`
  padding: 16px;
  align-items: center;
`;

const Btn = styled.TouchableOpacity<{ disabled?: boolean }>`
  background: ${({ theme, disabled }) => (disabled ? "#ccc" : theme.colors.primary)};
  padding: 12px 20px;
  border-radius: 10px;
`;

const Text = styled.Text`
  color: white;
  font-weight: bold;
`;

interface Props {
  gym: { name: string };
  isInRange: boolean;
  onCheckIn: () => void;
}

export const CheckInSection = ({ isInRange, onCheckIn }: Props) => (
  <Wrapper>
    <Btn disabled={!isInRange} onPress={onCheckIn}>
      <Text>{isInRange ? "Hacer Check-In" : "Fuera de rango"}</Text>
    </Btn>
  </Wrapper>
);
