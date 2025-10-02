import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import Slider from '@react-native-community/slider';

const Container = styled(View)`
  gap: 8px;
`;

const SliderWrapper = styled(View)`
  padding-horizontal: 4px;
`;

const LabelsRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: 8px;
`;

const LabelText = styled(Text)<{ $selected?: boolean }>`
  color: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.subtext};
  font-size: 13px;
  font-weight: ${({ $selected }) => $selected ? '600' : '400'};
`;

interface Props {
  value: number;
  onChange: (frequency: number) => void;
}

export function FrequencySlider({ value, onChange }: Props) {
  return (
    <Container>
      <SliderWrapper>
        <Slider
          value={value}
          onValueChange={onChange}
          minimumValue={1}
          maximumValue={7}
          step={1}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#E0E0E0"
        />
      </SliderWrapper>
      <LabelsRow>
        <LabelText $selected={value === 1}>1 día</LabelText>
        <LabelText $selected={value >= 2 && value <= 4}>
          {value === 3 ? '3 días por semana' : `${value} días`}
        </LabelText>
        <LabelText $selected={value === 7}>7 días</LabelText>
      </LabelsRow>
    </Container>
  );
}

