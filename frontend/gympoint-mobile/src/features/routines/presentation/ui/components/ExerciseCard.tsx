import { View, Text } from 'react-native';
import { Card, SetPill } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Exercise = {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number;
  muscleGroups: string[];
};

type Props = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
};

export function ExerciseCard({ exercise, totalSets, currentSet, restSeconds }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const metaColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View className="mx-4">
      <Card>
        <View className="p-4 gap-1">
          <Text className="font-black" style={{ color: isDark ? '#ffffff' : '#000000' }}>
            {exercise.name}
          </Text>
          <Text style={{ color: metaColor, fontSize: 12 }}>
            {`Series: ${totalSets} • Reps objetivo: ${exercise.reps} • Descanso: ${exercise.rest}s`}
          </Text>

          <View className="flex-row flex-wrap gap-1">
            {Array.from({ length: totalSets }).map((_, index) => {
              const setNumber = index + 1;
              const done = setNumber < currentSet;
              const isCurrent = setNumber === currentSet;
              return (
                <SetPill
                  key={setNumber}
                  setNumber={setNumber}
                  done={done}
                  current={isCurrent}
                />
              );
            })}
          </View>

          {restSeconds > 0 ? (
            <Text style={{ color: metaColor, fontSize: 12 }}>{`Descanso: ${restSeconds}s`}</Text>
          ) : null}
        </View>
      </Card>
    </View>
  );
}
