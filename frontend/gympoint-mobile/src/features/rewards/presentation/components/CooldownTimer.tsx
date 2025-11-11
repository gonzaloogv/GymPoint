import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { getFutureTimeString } from '@shared/utils/dateUtils';

interface Props {
  endsAt: string;
  compact?: boolean;
}

export const CooldownTimer: React.FC<Props> = ({ endsAt, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const remaining = getFutureTimeString(endsAt);
        setTimeRemaining(remaining);
      } catch (error) {
        console.error('[CooldownTimer] Error formatting date:', error);
        setTimeRemaining('tiempo desconocido');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>⏰ {timeRemaining}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏰</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Disponible nuevamente</Text>
        <Text style={styles.time}>{timeRemaining}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  compactContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  compactText: {
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '600',
  },
});
