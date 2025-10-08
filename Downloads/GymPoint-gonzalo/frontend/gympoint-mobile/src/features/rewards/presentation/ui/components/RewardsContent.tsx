import React from 'react';
import { FlatList, View } from 'react-native';
import { User } from '@features/auth/domain/entities/User';
import { Reward, GeneratedCode } from '@features/rewards/domain/entities';
import { RewardItem, GeneratedCodeItem, EmptyCodes } from './';
import { TabsContent } from '../styles/tabs';

type TabType = 'available' | 'codes';

type RewardsContentProps = {
  activeTab: TabType;
  user: User;
  rewards: Reward[];
  generatedCodes: GeneratedCode[];
  onGenerate: (reward: Reward) => void;
  onCopy: (code: string) => void;
  onToggleCode: (code: GeneratedCode) => void;
  onViewRewards: () => void;
};

export const RewardsContent: React.FC<RewardsContentProps> = ({
  activeTab,
  user,
  rewards,
  generatedCodes,
  onGenerate,
  onCopy,
  onToggleCode,
  onViewRewards,
}) => {
  // Renderizado para REWARD ITEM
  const renderRewardItem = ({ item }: { item: Reward }) => (
    <RewardItem reward={item} tokens={user.tokens} onGenerate={onGenerate} />
  );

  // Renderizado para GENERATED CODE ITEM
  const renderCodeItem = ({ item }: { item: GeneratedCode }) => (
    <GeneratedCodeItem item={item} onCopy={onCopy} onToggle={onToggleCode} />
  );

  return (
    <TabsContent>
      {activeTab === 'available' && (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          renderItem={renderRewardItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
      {activeTab === 'codes' && (
        <FlatList
          data={generatedCodes}
          keyExtractor={(item) => item.id}
          renderItem={renderCodeItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => <EmptyCodes onViewRewards={onViewRewards} />}
        />
      )}
    </TabsContent>
  );
};
