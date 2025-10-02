import { useState } from 'react';
import RNSlider from '@react-native-community/slider';
import styled from 'styled-components/native';

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Slider({ value, min = 0, max = 10, step = 1, onChange }: Props) {
  const [internal, setInternal] = useState(value);

  return (
    <SliderContainer>
      <ValueText>{internal}</ValueText>
      <RNSlider
        style={{ flex: 1 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={internal}
        onValueChange={(val) => setInternal(val)}
        onSlidingComplete={onChange}
        minimumTrackTintColor="#007bff"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#007bff"
      />
    </SliderContainer>
  );
}

const SliderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ValueText = styled.Text`
  font-size: 14px;
  width: 30px;
  text-align: center;
`;