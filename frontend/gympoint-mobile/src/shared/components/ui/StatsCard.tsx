import React from 'react';
import { View, Text } from 'react-native';

type StatItem = {
  value: number | string;
  label: string;
  backgroundColor: string;
  color: string;
  isText?: boolean;
};

type Props = {
  stats: StatItem[];
};

export function StatsCard({ stats }: Props) {
  return (
    <View className="flex-row flex-wrap -m-1">
      {stats.map((stat, index) => (
        <View key={index} className="w-1/2 p-1">
          <View
            className="rounded-md p-4 items-center justify-center min-h-20"
            style={{ backgroundColor: stat.backgroundColor }}
          >
            <Text
              className={`font-black ${stat.isText ? 'text-xs' : 'text-2xl'} mb-1 text-center`}
              style={{ color: stat.color }}
            >
              {stat.value}
            </Text>
            <Text
              className="text-xs font-semibold text-center"
              style={{ color: stat.color }}
            >
              {stat.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
