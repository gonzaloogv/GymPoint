import React from 'react';
import { TabsContainer, TabsList, TabsTrigger, TabsTriggerText } from '../styles/tabs';

type TabType = 'available' | 'codes';

type RewardsTabsProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const RewardsTabs: React.FC<RewardsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsContainer>
      <TabsList>
        <TabsTrigger $active={activeTab === 'available'} onPress={() => onTabChange('available')}>
          <TabsTriggerText $active={activeTab === 'available'}>Disponibles</TabsTriggerText>
        </TabsTrigger>
        <TabsTrigger $active={activeTab === 'codes'} onPress={() => onTabChange('codes')}>
          <TabsTriggerText $active={activeTab === 'codes'}>Mis códigos</TabsTriggerText>
        </TabsTrigger>
      </TabsList>
    </TabsContainer>
  );
};
