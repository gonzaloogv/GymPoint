import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RewardInventoryItem } from '../../domain/entities/Reward';

interface Props {
  item: RewardInventoryItem;
}

export const RewardInventoryCard: React.FC<Props> = ({ item }) => {
  const getIcon = () => {
    switch (item.itemType) {
      case 'streak_saver':
        return '🛟';
      case 'token_multiplier':
        return '🔥';
      default:
        return '🎁';
    }
  };

  const getDescription = () => {
    if (item.itemType === 'streak_saver') {
      return 'Protege tu racha automáticamente si fallas un día';
    }
    if (item.itemType === 'token_multiplier') {
      return `Multiplica tus tokens x${item.reward.effectValue || 1} durante ${item.reward.durationDays || 7} días`;
    }
    return item.reward.description || 'Item acumulable';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{item.reward.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {getDescription()}
        </Text>

        <View style={styles.footer}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>
              {item.quantity} / {item.maxStack}
            </Text>
          </View>

          {item.itemType === 'streak_saver' && (
            <Text style={styles.autoLabel}>Uso automático</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  autoLabel: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});
