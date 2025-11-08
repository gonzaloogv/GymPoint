import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InfoCard, MetaChip, Button } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';

type Props = {
  routine: PredesignedRoutine;
  onImport: (routine: PredesignedRoutine) => void;
};

const getDifficultyTone = (difficulty: string) => {
  switch (difficulty) {
    case 'Principiante':
      return { label: 'Principiante', color: '#10B981' };
    case 'Intermedio':
      return { label: 'Intermedio', color: '#F59E0B' };
    default:
      return { label: difficulty || 'Avanzado', color: '#EF4444' };
  }
};

export function ImportRoutineCard({ routine, onImport }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const difficultyTone = getDifficultyTone(routine.difficulty);
  const metaColor = isDark ? '#9CA3AF' : '#6B7280';

  const durationLabel =
    routine.duration >= 60
      ? `${Math.floor(routine.duration / 60)}h ${(routine.duration % 60)
          .toString()
          .padStart(2, '0')}m`
      : `${routine.duration} min`;

  return (
    <View className="mb-4">
      <InfoCard variant="compact" className="p-0">
        <View className="flex-row items-start px-[18px] py-4">
        <View
          className="w-[52px] h-[52px] rounded-[18px] items-center justify-center border mr-4"
          style={{
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(79, 70, 229, 0.12)',
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
          }}
        >
          <Ionicons name="barbell" size={22} color={isDark ? '#C7D2FE' : '#4338CA'} />
        </View>

        <View className="flex-1">
          <View className="mb-1.5">
            <Text
              numberOfLines={2}
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            >
              {routine.name}
            </Text>
          </View>

          <View className="flex-row items-center flex-wrap gap-2.5 mb-3">
            <Text
              className="text-[13px] font-bold uppercase"
              style={{ color: difficultyTone.color, letterSpacing: 0.4 }}
            >
              {difficultyTone.label}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={14} color={metaColor} />
              <Text
                className="text-xs font-semibold"
                style={{ color: metaColor, letterSpacing: 0.3 }}
              >
                {durationLabel}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="list-outline" size={14} color={metaColor} />
              <Text
                className="text-xs font-semibold"
                style={{ color: metaColor, letterSpacing: 0.3 }}
              >
                {routine.exerciseCount} ejercicios
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {routine.muscleGroups.slice(0, 6).map((group) => (
              <View key={group} className="mr-1.5 mb-1.5">
                <MetaChip>{group}</MetaChip>
              </View>
            ))}
          </View>
        </View>

        <View className="ml-4">
          <Button size="sm" onPress={() => onImport(routine)}>
            Importar
          </Button>
        </View>
        </View>
      </InfoCard>
    </View>
  );
}
