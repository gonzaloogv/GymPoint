import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import {
  Input,
  StepScrollContainer,
  StepSection,
} from '@shared/components/ui';
import { ChipSelector } from '@shared/components/ui/ChipSelector';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-sm font-semibold mb-1" style={{ color: textColor }}>
          Nombre de la rutina
        </Text>
        <Text className="text-xs mb-1.5" style={{ color: subtextColor }}>
          Ej: Rutina de fuerza
        </Text>
        <View>
          <Input
            value={data.name}
            onChangeText={(name) => onChange({ ...data, name })}
            placeholder=""
          />
        </View>
      </StepSection>

      <StepSection>
        <Text className="text-sm font-semibold mb-1" style={{ color: textColor }}>
          Objetivo
        </Text>
        <View className="mt-1">
          <ChipSelector
            options={OBJECTIVES}
            isActive={(opt) => data.objective === opt}
            onToggle={(objective) => onChange({ ...data, objective })}
          />
        </View>
      </StepSection>

      <StepSection>
        <Text className="text-sm font-semibold mb-1" style={{ color: textColor }}>
          Grupos musculares
        </Text>
        <View className="mt-1">
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
        </View>
      </StepSection>
    </StepScrollContainer>
  );
}
