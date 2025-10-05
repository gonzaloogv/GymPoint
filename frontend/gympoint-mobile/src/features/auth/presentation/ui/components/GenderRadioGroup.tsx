import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { GENDER_OPTIONS } from '@shared/constants';

const Container = styled(View)`
  gap: 12px;
`;

const Row = styled(View)`
  flex-direction: row;
  gap: 16px;
  flex-wrap: wrap;
`;

const RadioButton = styled(TouchableOpacity)<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 45%;
`;

const RadioCircle = styled(View)<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border-width: 2px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : 'transparent'};
  align-items: center;
  justify-content: center;
`;

const RadioInner = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const RadioLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
`;

interface Props {
  value: string;
  onChange: (gender: string) => void;
}

export function GenderRadioGroup({ value, onChange }: Props) {
  return (
    <Container>
      <Row>
        {GENDER_OPTIONS.map((option) => (
          <RadioButton
            key={option.value}
            $selected={value === option.value}
            onPress={() => onChange(option.value)}
          >
            <RadioCircle $selected={value === option.value}>
              {value === option.value && <RadioInner />}
            </RadioCircle>
            <RadioLabel>{option.label}</RadioLabel>
          </RadioButton>
        ))}
      </Row>
    </Container>
  );
}

