import React from 'react';
import { FlatList, View } from 'react-native';
import { User } from '@features/auth/domain/entities/User';
import { Reward } from '@features/rewards/domain/entities';
import { RewardItem, EmptyRewards } from './';

// COMENTADO: Sistema sin códigos por ahora - imports eliminados
// import { GeneratedCode } from '@features/rewards/domain/entities';
// import { GeneratedCodeItem, EmptyCodes } from './';

type RewardsContentProps = {
  activeTab?: 'available'; // Opcional porque siempre es 'available'
  user: User;
  rewards: Reward[];
  isPremium: boolean;
  onGenerate: (reward: Reward) => void;
  // COMENTADO: Sistema sin códigos por ahora
  // generatedCodes: GeneratedCode[];
  // onCopy: (code: string) => void;
  // onToggleCode: (code: GeneratedCode) => void;
  // onViewRewards: () => void;
};

export const RewardsContent: React.FC<RewardsContentProps> = ({
  user,
  rewards,
  isPremium,
  onGenerate,
}) => {
  // Renderizado para REWARD ITEM
  const renderRewardItem = ({ item }: { item: Reward }) => (
    <RewardItem reward={item} tokens={user.tokens} isPremium={isPremium} onGenerate={onGenerate} />
  );

  // COMENTADO: Sistema sin códigos por ahora
  // const renderCodeItem = ({ item }: { item: GeneratedCode }) => (
  //   <GeneratedCodeItem item={item} onCopy={onCopy} onToggle={onToggleCode} />
  // );

  return (
    <View className="pt-5 min-h-52">
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardItem}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => <EmptyRewards />}
      />

      {/* COMENTADO: Sistema sin códigos por ahora */}
      {/* <FlatList
        data={generatedCodes}
        keyExtractor={(item) => item.id}
        renderItem={renderCodeItem}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => <EmptyCodes onViewRewards={onViewRewards} />}
      /> */}
    </View>
  );
};
