import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface EquipmentCategory {
  category: string;
  icon: string;
  items: { name: string; quantity: number }[];
}

interface GymEquipmentCardProps {
  equipment: EquipmentCategory[];
}

export function GymEquipmentCard({ equipment }: GymEquipmentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const getTotalQuantity = (items: { name: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (!equipment || equipment.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 mt-4">
      <View className="flex-row items-center mb-3">
        <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-orange-500/30' : 'bg-orange-100'}`}>
          <Feather name="activity" size={20} color={isDark ? '#fb923c' : '#f97316'} />
        </View>
        <Text className={`text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Equipamiento disponible
        </Text>
      </View>

      <View className="gap-2">
        {equipment.map(({ category, icon, items }) => (
          <View key={category}>
            <TouchableOpacity
              className={`flex-row items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'
              }`}
              onPress={() => toggleCategory(category)}
            >
              <View className="flex-row items-center flex-1">
                <Text style={{ fontSize: 20, marginRight: 8 }}>{icon}</Text>
                <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {category}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`px-2 py-1 rounded-full mr-2 ${isDark ? 'bg-primary/30' : 'bg-primary/20'}`}>
                  <Text className={`text-xs font-bold ${isDark ? 'text-primary-light' : 'text-primary'}`}>
                    {getTotalQuantity(items)}
                  </Text>
                </View>
                <Feather
                  name={expandedCategories.includes(category) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDark ? '#B0B8C8' : '#666666'}
                />
              </View>
            </TouchableOpacity>

            {expandedCategories.includes(category) && (
              <View className={`mt-2 ml-4 gap-2 ${isDark ? 'border-l-2 border-border-dark' : 'border-l-2 border-border'} pl-4`}>
                {items.map((item, index) => (
                  <View key={index} className="flex-row items-center justify-between py-1">
                    <Text className={`flex-1 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                      {item.name}
                    </Text>
                    <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      ×{item.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}
