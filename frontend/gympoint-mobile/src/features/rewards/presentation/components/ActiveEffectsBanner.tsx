import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { getFutureTimeString } from '@shared/utils/dateUtils';
import { useRewardsStore } from '../state/rewards.store';
import { ActiveRewardEffect } from '../../domain/entities/Reward';

export const ActiveEffectsBanner: React.FC = () => {
  const { activeEffects, fetchActiveEffects } = useRewardsStore();

  useEffect(() => {
    fetchActiveEffects();

    // Refresh every minute to update countdown
    const interval = setInterval(fetchActiveEffects, 60000);
    return () => clearInterval(interval);
  }, [fetchActiveEffects]);

  if (!activeEffects || activeEffects.effects.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🔥 Efectos Activos</Text>
        {activeEffects.totalMultiplier > 1 && (
          <View style={styles.multiplierBadge}>
            <Text style={styles.multiplierText}>x{activeEffects.totalMultiplier}</Text>
          </View>
        )}
      </View>

      <View style={styles.effectsList}>
        {activeEffects.effects.map((effect) => (
          <EffectChip key={effect.id} effect={effect} />
        ))}
      </View>

      {activeEffects.totalMultiplier > 1 && (
        <Text style={styles.infoText}>
          Estás ganando {activeEffects.totalMultiplier}x tokens en todas tus actividades
        </Text>
      )}
    </View>
  );
};

interface EffectChipProps {
  effect: ActiveRewardEffect;
}

const EffectChip: React.FC<EffectChipProps> = ({ effect }) => {
  const timeRemaining = getFutureTimeString(effect.expiresAt);

  return (
    <View style={styles.chip}>
      <Text style={styles.chipMultiplier}>x{effect.multiplierValue}</Text>
      <Text style={styles.chipTime}>Expira {timeRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  multiplierBadge: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  multiplierText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  effectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  chipMultiplier: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  chipTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
