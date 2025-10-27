import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { TokenCard } from '../components/TokenCard';
import { TimePeriodSelector } from '../components/TimePeriodSelector';

type TokenHistoryScreenProps = {
  navigation: any;
};

export function TokenHistoryScreen({ navigation }: TokenHistoryScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { tokenData, tokenFilter, setTokenFilter } = useProgress();

  const handleBackPress = useCallback(() => {
    // Navigate back to Usuario tab (Profile screen)
    navigation?.navigate('Usuario');
  }, [navigation]);

  // Mock transaction data
  const mockTransactions = [
    {
      id: '1',
      title: 'Completaste 7 entrenamientos consecutivos',
      date: '1 oct 2024',
      amount: 50,
      type: 'earned' as const,
    },
    {
      id: '2',
      title: 'Descuento del 15% en suplementos',
      date: '30 sep 2024',
      amount: 100,
      type: 'spent' as const,
    },
    {
      id: '3',
      title: 'Rutina de pecho y tríceps - 45 min',
      date: '30 sep 2024',
      amount: 25,
      type: 'earned' as const,
    },
  ];

  // Filter transactions based on tokenFilter state
  const filteredTransactions = mockTransactions.filter((tx) => {
    if (tokenFilter === 'all') return true;
    return tx.type === tokenFilter;
  });

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-4">
          <Pressable onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
          </Pressable>
          <Text className={`ml-3 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Historial de tokens
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Token Cards */}
          <View className="flex-row px-4 pb-6 gap-2">
            <TokenCard type="available" value={tokenData.available} label="Disponibles" />
            <TokenCard type="earned" value={tokenData.earned} label="Ganados" />
            <TokenCard type="spent" value={tokenData.spent} label="Gastados" />
          </View>

          {/* Filter Tabs: Todos / Ganados / Gastados */}
          <View className="px-4 pb-4">
            <View className="flex-row gap-2">
              {(['all', 'earned', 'spent'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setTokenFilter(filter)}
                  className="flex-1 py-3 px-4 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: tokenFilter === filter ? '#3B82F6' : isDark ? '#1F2937' : '#FFFFFF',
                    borderWidth: tokenFilter === filter ? 0 : 1,
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                >
                  <Text
                    className="text-center font-semibold text-sm"
                    style={{
                      color: tokenFilter === filter ? '#FFFFFF' : isDark ? '#9CA3AF' : '#374151',
                    }}
                  >
                    {filter === 'all' ? 'Todos' : filter === 'earned' ? 'Ganados' : 'Gastados'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Time Period Selector */}
          <View className="px-4 pb-4">
            <TimePeriodSelector
              value="30d"
              onChange={() => {}}
            />
          </View>

          {/* Movimientos Section Label */}
          <View className="px-4 mb-3">
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Movimientos
            </Text>
          </View>

          {/* Transactions List */}
          <View className="px-4 pb-8">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
              // Helper function to get transaction icon
              const getTransactionIcon = () => {
                if (tx.type === 'earned') {
                  if (tx.title.toLowerCase().includes('consecutivos') || tx.title.toLowerCase().includes('racha')) {
                    return { name: 'trophy' as const, color: '#F59E0B' };
                  }
                  if (tx.title.toLowerCase().includes('rutina') || tx.title.toLowerCase().includes('entrenamiento')) {
                    return { name: 'fitness' as const, color: '#10B981' };
                  }
                  return { name: 'add-circle' as const, color: '#3B82F6' };
                }
                // Spent
                if (tx.title.toLowerCase().includes('descuento') || tx.title.toLowerCase().includes('cupón')) {
                  return { name: 'pricetag' as const, color: '#EC4899' };
                }
                if (tx.title.toLowerCase().includes('premio') || tx.title.toLowerCase().includes('canje')) {
                  return { name: 'gift' as const, color: '#A855F7' };
                }
                return { name: 'remove-circle' as const, color: '#EF4444' };
              };

              const icon = getTransactionIcon();

              return (
                <View
                  key={tx.id}
                  className={`p-4 rounded-xl mb-3 flex-row items-center ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    }}
                  >
                    <Ionicons
                      name={icon.name}
                      size={20}
                      color={icon.color}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text
                      className="font-semibold text-sm"
                      style={{ color: isDark ? '#FFFFFF' : '#111827' }}
                    >
                      {tx.title}
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
                    >
                      {tx.date}
                    </Text>
                  </View>

                  {/* Amount */}
                  <Text
                    className="font-bold text-base ml-2"
                    style={{
                      color: tx.type === 'earned' ? '#10B981' : '#EF4444',
                    }}
                  >
                    {tx.type === 'earned' ? '+' : ''}{tx.amount}
                  </Text>
                </View>
              );
              })
            ) : (
              <View className="py-8 items-center justify-center">
                <Text
                  className="text-center"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  No hay movimientos para mostrar
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
