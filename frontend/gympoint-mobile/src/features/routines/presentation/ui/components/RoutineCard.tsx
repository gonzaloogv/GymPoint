import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { StatusPill, MetaChip } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { Routine } from '../../../domain/entities';

type Props = {
  routine: Routine;
  onPress?: (routine: Routine) => void;
  onPressDetail?: (routine: Routine) => void;
  onPressStart?: (routine: Routine) => void;
};

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function RoutineCard({ routine, onPress, onPressDetail, onPressStart }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const exercises = routine.exercises || [];
  const exerciseCount = exercises.length;
  const muscleGroups = Array.from(new Set(exercises.map((ex) => ex.muscular_group).filter(Boolean)));
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.series || 3), 0);
  const estimatedDuration = totalSets * 3;

  const status: 'Active' | 'Scheduled' | 'Completed' = 'Active';
  const difficulty = 'Intermedio';

  const handlePress = () => {
    if (onPress) {
      onPress(routine);
      return;
    }
    onPressDetail?.(routine);
  };

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.72}
      className={`border rounded-[28px] px-5 py-[18px] ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}
      style={[
        {
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-start justify-between">
        <Text
          numberOfLines={2}
          className="flex-1 text-xl font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          {routine.routine_name}
        </Text>
        <View className="ml-3">
          <StatusPill status={status} />
        </View>
      </View>

      <View className="flex-row items-center mt-3">
        <Text
          className="text-[13px] font-semibold"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.2 }}
        >
          {minutesToLabel(estimatedDuration)}
        </Text>
        <Text className="text-sm mx-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          -
        </Text>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.2 }}
        >
          {difficulty}
        </Text>
      </View>

      <View
        className="h-px mt-[18px] mb-4"
        style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.9)' : '#E5E7EB' }}
      />

      <Text
        numberOfLines={2}
        className="text-[13px] leading-[18px]"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        {exerciseCount} ejercicios -{' '}
        {exercises
          .slice(0, 3)
          .map((exercise) => exercise.exercise_name)
          .join(', ')}
        {exerciseCount > 3 ? '...' : ''}
      </Text>

      <View className="flex-row flex-wrap mt-3.5">
        {muscleGroups.slice(0, 4).map((group) => (
          <View key={group} className="mr-2 mb-2">
            <MetaChip>{group}</MetaChip>
          </View>
        ))}
      </View>

      <View
        className="flex-row mt-6 pt-4 border-t"
        style={{ borderTopColor: isDark ? 'rgba(55, 65, 81, 0.9)' : '#E5E7EB' }}
      >
        <TouchableOpacity
          onPress={() => onPressDetail?.(routine)}
          activeOpacity={0.7}
          className="flex-1 py-3.5 rounded-2xl border items-center mr-3"
          style={{
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)',
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.28)',
          }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}
          >
            Detalle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressStart?.(routine)}
          activeOpacity={0.78}
          className="flex-1 py-3.5 rounded-2xl items-center"
          style={{ backgroundColor: isDark ? '#4C51BF' : '#4338CA' }}
        >
          <Text
            className="text-sm font-bold text-white uppercase"
            style={{ letterSpacing: 0.6 }}
          >
            Empezar
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
