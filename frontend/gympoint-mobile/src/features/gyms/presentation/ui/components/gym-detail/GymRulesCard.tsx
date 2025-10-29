import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface GymRulesCardProps {
  rules: string[];
}

export function GymRulesCard({ rules }: GymRulesCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="mx-4 mt-4">
      <View className="flex-row items-center mb-3">
        <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-red-500/30' : 'bg-red-100'}`}>
          <Feather name="alert-triangle" size={20} color={isDark ? '#f87171' : '#dc2626'} />
        </View>
        <Text className={`text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Normas del gimnasio
        </Text>
      </View>

      {rules && rules.length > 0 ? (
        <View className="gap-3">
          {rules.map((rule, index) => (
            <View key={index} className="flex-row items-start">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5 ${
                  isDark ? 'bg-red-500/20' : 'bg-red-50'
                }`}
              >
                <Text className={`text-xs font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {index + 1}
                </Text>
              </View>
              <Text className={`flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {rule}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          El gimnasio no tiene reglas registradas
        </Text>
      )}
    </Card>
  );
}
