import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable, FlatList } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

type AchievementsScreenProps = {
  navigation: any;
};

export function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  // Mock achievements data
  const mockAchievements = [
    {
      id: '1',
      title: 'Completaste 7 entrenamientos consecutivos',
      date: '1 oct 2024',
      earnedPoints: 50,
    },
    {
      id: '2',
      title: 'Descuento del 15% en suplementos',
      date: '30 sep 2024',
      earnedPoints: 25,
    },
    {
      id: '3',
      title: 'Rutina de pecho y tríceps - 45 min',
      date: '30 sep 2024',
      earnedPoints: 25,
    },
    {
      id: '4',
      title: 'Alcanzaste 100 PRs',
      date: '28 sep 2024',
      earnedPoints: 100,
    },
    {
      id: '5',
      title: '30 días sin faltar al gym',
      date: '25 sep 2024',
      earnedPoints: 150,
    },
    {
      id: '6',
      title: 'Primera vez completando una rutina',
      date: '20 sep 2024',
      earnedPoints: 10,
    },
  ];

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
          <View className="flex-row items-center flex-1">
            <Pressable onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </Pressable>
            <Text className={`ml-3 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Logros
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Achievement count */}
          <View className="px-4 pb-6">
            <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              6 medallas obtenidas este mes
            </Text>
          </View>

          {/* Achievements Grid */}
          <View className="px-4 pb-8">
            {mockAchievements.map((achievement, idx) => (
              <View
                key={achievement.id}
                className={`flex-row items-center p-4 rounded-xl mb-3 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <View className="mr-4">
                  <Ionicons name="trophy" size={32} color="#FCD34D" />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.title}
                  </Text>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.date}
                  </Text>
                </View>
                <Text className="text-blue-500 font-semibold text-sm">
                  +{achievement.earnedPoints}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
