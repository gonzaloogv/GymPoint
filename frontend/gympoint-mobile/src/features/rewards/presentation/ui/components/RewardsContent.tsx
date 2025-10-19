import React, { useState, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { User } from '@features/auth/domain/entities/User';
import { Reward, GeneratedCode } from '@features/rewards/domain/entities';
import { RewardItem } from './RewardItem';
import { GeneratedCodeItem } from './GeneratedCodeItem';
import { EmptyCodes } from './EmptyCodes';
import { TabsContent } from '../styles/tabs';
import { CodeStatusFilter } from './CodeStatusFilter';

type TabType = 'available' | 'codes';
type CodeStatusType = 'active' | 'used' | 'expired';

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
  const [codeStatusFilter, setCodeStatusFilter] = useState<CodeStatusType>('active');

  // Códigos disponibles (activos, sin usar, no vencidos) para la pestaña "Disponibles"
  const availableCodes = useMemo(() => {
    return generatedCodes.filter((code) => {
      const isExpired = code.expiresAt ? new Date() > code.expiresAt : false;
      return !code.used && !isExpired;
    });
  }, [generatedCodes]);

  // Filtrar códigos según el estado seleccionado para la pestaña "Mis códigos"
  const filteredCodes = useMemo(() => {
    return generatedCodes.filter((code) => {
      const isExpired = code.expiresAt ? new Date() > code.expiresAt : false;

      if (codeStatusFilter === 'active') {
        return !code.used && !isExpired;
      } else if (codeStatusFilter === 'used') {
        return code.used;
      } else if (codeStatusFilter === 'expired') {
        return isExpired && !code.used;
      }
      return true;
    });
  }, [generatedCodes, codeStatusFilter]);

  // Renderizado para GENERATED CODE ITEM (con botones Canjear/Marcar usado)
  const renderAvailableCodeItem = ({ item }: { item: GeneratedCode }) => (
    <GeneratedCodeItem
      item={item}
      onCopy={onCopy}
      onToggle={onToggleCode}
      showActions={true}
    />
  );

  // Renderizado para GENERATED CODE ITEM (sin botones de acción, solo Ver QR para usados)
  const renderCodeItem = ({ item }: { item: GeneratedCode }) => (
    <GeneratedCodeItem
      item={item}
      onCopy={onCopy}
      onToggle={onToggleCode}
      showActions={false}
    />
  );

  return (
    <TabsContent>
      {activeTab === 'available' && (
        <FlatList
          data={availableCodes}
          keyExtractor={(item) => item.id}
          renderItem={renderAvailableCodeItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => <EmptyCodes onViewRewards={onViewRewards} />}
        />
      )}
      {activeTab === 'codes' && (
        <>
          <CodeStatusFilter
            activeStatus={codeStatusFilter}
            onStatusChange={setCodeStatusFilter}
          />
          <FlatList
            data={filteredCodes}
            keyExtractor={(item) => item.id}
            renderItem={renderCodeItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16, paddingTop: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={() => <EmptyCodes onViewRewards={onViewRewards} />}
          />
        </>
      )}
    </TabsContent>
  );
};
