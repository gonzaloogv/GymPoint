import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, LoadMoreButton, BackButton } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useTokenHistory } from '@features/tokens/presentation/hooks/useTokenHistory';
import type { TokenTransactionType } from '@features/tokens/domain/entities/TokenTransaction';
import { TokenCard } from '../components/TokenCard';
import { TimePeriodSelector } from '../components/TimePeriodSelector';

type TokenHistoryScreenProps = {
  navigation: any;
};

type TokenFilter = 'all' | TokenTransactionType;
type TimePeriod = '7d' | '30d' | '90d' | '12m';

export function TokenHistoryScreen({ navigation }: TokenHistoryScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [itemsToShow, setItemsToShow] = useState(5);

  const ITEMS_PER_PAGE = 5;

  // Calcular fechas basadas en el periodo seleccionado
  const dateFilters = useMemo(() => {
    const now = new Date();
    const fromDate = new Date(now);

    switch (timePeriod) {
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(now.getDate() - 90);
        break;
      case '12m':
        fromDate.setMonth(now.getMonth() - 12);
        break;
    }

    return { fromDate, toDate: now };
  }, [timePeriod]);

  const {
    history,
    balance,
    isLoadingHistory,
    isLoadingBalance,
    error,
  } = useTokenHistory({
    type: tokenFilter === 'all' ? undefined : tokenFilter,
    fromDate: dateFilters.fromDate,
    toDate: dateFilters.toDate,
  });

  const handleBackPress = useCallback(() => {
    // Navigate back (preserves the active tab)
    navigation?.goBack();
  }, [navigation]);

  // Get transactions from history (already filtered by the hook)
  const transactions = history?.transactions || [];

  // Visible transactions with pagination
  const visibleTransactions = transactions.slice(0, itemsToShow);
  const hasMore = itemsToShow < transactions.length;

  // Reset items to show when filters change
  useEffect(() => {
    setItemsToShow(5);
  }, [tokenFilter, timePeriod]);

  // Token data for cards
  const tokenData = useMemo(() => ({
    available: balance?.available || 0,
    earned: balance?.earned || 0,
    spent: balance?.spent || 0,
  }), [balance]);

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 140,
        gap: 24,
      }}
    >
      {/* Header */}
      <View className="gap-3">
        <BackButton onPress={handleBackPress} />

        <View>
          <Text
            className="text-[28px] font-extrabold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            Historial de tokens
          </Text>
          <Text
            className="mt-2 text-xs font-semibold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
          >
            {tokenData.available} tokens disponibles
          </Text>
        </View>

        <View
          className="h-px rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
        />
      </View>

      {/* Token Cards */}
      <View className="flex-row gap-2">
            <TokenCard type="available" value={tokenData.available} label="Disponibles" />
            <TokenCard type="earned" value={tokenData.earned} label="Ganados" />
            <TokenCard type="spent" value={tokenData.spent} label="Gastados" />
          </View>

      {/* Filter Tabs: Todos / Ganados / Gastados */}
      <View
        className="rounded-[28px] p-1.5 border"
        style={[
          {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          },
          isDark
            ? {
                shadowColor: '#000000',
                shadowOpacity: 0.35,
                shadowOffset: { width: 0, height: 18 },
                shadowRadius: 24,
                elevation: 10,
              }
            : {
                shadowColor: '#4338CA',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 12 },
                shadowRadius: 22,
                elevation: 5,
              },
        ]}
      >
        <View className="flex-row">
          {(['all', 'earned', 'spent'] as const).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setTokenFilter(filter)}
              className="flex-1 px-4 py-3 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: tokenFilter === filter ? '#3B82F6' : 'transparent',
              }}
            >
              <Text
                className="text-center font-semibold text-base"
                style={{
                  color: tokenFilter === filter ? '#F9FAFB' : isDark ? '#9CA3AF' : '#6B7280',
                }}
              >
                {filter === 'all' ? 'Todos' : filter === 'earned' ? 'Ganados' : 'Gastados'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Time Period Selector */}
      <TimePeriodSelector
        value={timePeriod}
        onChange={setTimePeriod}
      />

      {/* Movimientos Section */}
      <View className="gap-4">
            {isLoadingHistory ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
                <Text
                  className="text-center mt-4"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  Cargando historial...
                </Text>
              </View>
            ) : error ? (
              <View className="py-8 items-center justify-center">
                <Ionicons name="alert-circle" size={48} color={isDark ? '#EF4444' : '#DC2626'} />
                <Text
                  className="text-center mt-4"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  {error}
                </Text>
              </View>
            ) : transactions.length > 0 ? (
              <>
                {visibleTransactions.map((tx) => {
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

              const shadowStyle = isDark
                ? {
                    shadowColor: '#000000',
                    shadowOpacity: 0.35,
                    shadowOffset: { width: 0, height: 18 },
                    shadowRadius: 24,
                    elevation: 10,
                  }
                : {
                    shadowColor: '#4338CA',
                    shadowOpacity: 0.12,
                    shadowOffset: { width: 0, height: 12 },
                    shadowRadius: 22,
                    elevation: 5,
                  };

              return (
                <View
                  key={tx.id}
                  className="p-5 rounded-[28px] border flex-row items-center"
                  style={[
                    {
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
                    },
                    shadowStyle,
                  ]}
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
                      style={{ color: isDark ? '#F9FAFB' : '#111827' }}
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
                })}

                {/* Ver más button */}
                {hasMore && (
                  <LoadMoreButton
                    onPress={() => setItemsToShow(prev => prev + ITEMS_PER_PAGE)}
                    remainingItems={transactions.length - itemsToShow}
                  />
                )}
              </>
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
    </SurfaceScreen>
  );
}
