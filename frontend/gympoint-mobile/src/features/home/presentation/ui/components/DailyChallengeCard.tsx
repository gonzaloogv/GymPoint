import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { DailyChallenge } from '@features/home/domain/entities/DailyChallenge';

type Props = {
  challenge: DailyChallenge | null;
  onPress?: () => void;
};

export default function DailyChallengeCard({ challenge, onPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const completed = challenge?.progress ?? 0;
  const total = challenge?.target ?? 0;
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
      label: isDark ? '#9CA3AF' : '#6B7280',
      value: isDark ? '#F9FAFB' : '#111827',
      description: isDark ? '#9CA3AF' : '#6B7280',
      progressTrack: isDark ? '#1F2937' : '#E5E7EB',
      progressFill: isDark ? '#8B5CF6' : '#4F46E5',
      infoText: isDark ? '#9CA3AF' : '#6B7280',
      iconBg: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.18)',
      iconBorder: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
      iconColor: isDark ? '#C7D2FE' : '#4338CA',
    }),
    [isDark],
  );

  // Si no hay desafío del día
  if (!challenge) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        disabled={!onPress}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.background,
            borderColor: palette.border,
          },
          isDark ? styles.darkShadow : styles.lightShadow,
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: palette.iconBg,
                borderColor: palette.iconBorder,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={22} color={palette.iconColor} />
          </View>

          <View style={styles.headerText}>
            <Text style={[styles.label, { color: palette.label }]}>Desafío del día</Text>
            <Text style={[styles.emptyMessage, { color: palette.description }]}>
              No hay desafío disponible hoy
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Si hay desafío del día
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: palette.iconBg,
              borderColor: palette.iconBorder,
            },
          ]}
        >
          <Ionicons
            name={challenge.completed ? 'checkmark-circle' : 'sparkles'}
            size={22}
            color={palette.iconColor}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.label, { color: palette.label }]}>Desafío del día</Text>
          <Text style={[styles.challengeTitle, { color: palette.value }]}>
            {challenge.title}
          </Text>
          <Text style={[styles.description, { color: palette.description }]}>
            {challenge.description}
          </Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: palette.progressTrack }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: palette.progressFill,
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>

      <Text style={[styles.progressInfo, { color: palette.infoText }]}>
        {challenge.completed
          ? `¡Completado! +${challenge.reward} tokens`
          : `Progreso: ${completed}/${total} ${challenge.unit || ''}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 8,
  },
  lightShadow: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 6,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    lineHeight: 24,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  emptyMessage: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressInfo: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
