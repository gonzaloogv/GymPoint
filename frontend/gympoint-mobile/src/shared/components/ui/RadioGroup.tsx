import { TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native';

interface Option {
  label: string;
  value: string;
}

interface Props {
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function RadioGroup({ value, options, onChange }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <RadioOuter selected={value === option.value}>
            {value === option.value && <RadioInner />}
          </RadioOuter>
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const RadioOuter = styled.View<{ selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid ${(props) => (props.selected ? '#007bff' : '#ccc')};
  align-items: center;
  justify-content: center;
`;

const RadioInner = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: #007bff;
`;
