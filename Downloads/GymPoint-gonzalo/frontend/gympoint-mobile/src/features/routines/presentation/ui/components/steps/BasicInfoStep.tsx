import styled from 'styled-components/native';
import { View } from 'react-native';
import {
  Input,
  StepScrollContainer,
  StepSection,
} from '@shared/components/ui';
import { ChipSelector } from '@shared/components/ui/ChipSelector';
import { sp } from '@shared/styles';

const SectionLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

const ExampleText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const InputWrapper = styled(View)`
  margin-bottom: ${({ theme }) => sp(theme, 0)}px;
`;

const StyledInput = styled(Input)`
  font-size: 15px;
  padding: ${({ theme }) => theme.spacing(1.75)}px;
`;

const ChipsWrapper = styled(View)`
  margin-top: ${({ theme }) => sp(theme, 1)}px;
`;

const OBJECTIVES = ['Fuerza', 'Hipertrofia', 'Resistencia'] as const;
const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core',
  'Cardio',
] as const;

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type Props = {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
};

export function BasicInfoStep({ data, onChange }: Props) {
  console.log('BasicInfoStep rendered with data:', data);
  return (
    <StepScrollContainer>
      <StepSection>
        <SectionLabel>Nombre de la rutina</SectionLabel>
        <ExampleText>Ej: Rutina de fuerza</ExampleText>
        <InputWrapper>
          <StyledInput
            value={data.name}
            onChangeText={(name) => {
              console.log('Input changed:', name);
              onChange({ ...data, name });
            }}
            placeholder=""
          />
        </InputWrapper>
      </StepSection>

      <StepSection>
        <SectionLabel>Objetivo</SectionLabel>
        <ChipsWrapper>
          <ChipSelector
            options={OBJECTIVES}
            isActive={(opt) => data.objective === opt}
            onToggle={(objective) => onChange({ ...data, objective })}
          />
        </ChipsWrapper>
      </StepSection>

      <StepSection>
        <SectionLabel>Grupos musculares</SectionLabel>
        <ChipsWrapper>
          <ChipSelector
            options={MUSCLE_GROUPS}
            isActive={(opt) => data.muscleGroups.includes(opt)}
            onToggle={(group) =>
              onChange({
                ...data,
                muscleGroups: data.muscleGroups.includes(group)
                  ? data.muscleGroups.filter((g) => g !== group)
                  : [...data.muscleGroups, group],
              })
            }
          />
        </ChipsWrapper>
      </StepSection>
    </StepScrollContainer>
  );
}
