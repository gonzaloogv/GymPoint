import React from 'react';
import { View } from 'react-native';
import { KPICard } from './KPICard';
import { ProgressMetric } from '@features/progress/domain/entities/ProgressMetric';

interface MetricsGridProps {
  metrics: ProgressMetric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const pairs = [];
  for (let i = 0; i < metrics.length; i += 2) {
    pairs.push(metrics.slice(i, i + 2));
  }

  return (
    <View className="px-4 gap-3">
      {pairs.map((pair, idx) => (
        <View key={idx} className="flex-row gap-2">
          {pair.map((metric) => (
            <KPICard
              key={metric.id}
              icon={<View className="w-6 h-6 bg-gray-400 rounded" />}
              label={metric.type === 'weight' ? 'Peso' : metric.type === 'bodyFat' ? '% Grasa' : metric.type === 'imc' ? 'IMC' : 'Racha'}
              value={`${metric.value} ${metric.unit}`}
              change={metric.change}
              changeType={metric.changeType}
            />
          ))}
          {pair.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}
