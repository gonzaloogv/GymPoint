import { useEffect } from 'react';

import { User } from '@features/auth/domain/entities/User';
import { useRewardsStore } from '../state/rewards.store';

type RewardsTab = 'available' | 'codes';

type UseRewardsParams = {
  user: User;
  onUpdateUser: (user: User) => void;
};

type UseRewardsResult = {
  activeTab: RewardsTab;
  setActiveTab: (tab: RewardsTab) => void;
  rewards: any[];
  generatedCodes: any[];
  handleGenerate: (reward: any) => Promise<void>;
  handleCopy: (code: string) => Promise<void>;
  handleToggleCode: (code: any) => void;
};

export const useRewards = ({
  user,
  onUpdateUser,
}: UseRewardsParams): UseRewardsResult => {
  const {
    activeTab,
    setActiveTab,
    rewards,
    generatedCodes,
    fetchRewards,
    fetchGeneratedCodes,
    handleGenerate: storeHandleGenerate,
    handleCopy,
    handleToggleCode,
  } = useRewardsStore();

  useEffect(() => {
    fetchRewards(user.plan === 'Premium');
    fetchGeneratedCodes();
  }, [user.plan]);

  const handleGenerate = async (reward: any) => {
    await storeHandleGenerate(reward, user.tokens, (newTokens) => {
      onUpdateUser({ ...user, tokens: newTokens });
    });
  };

  return {
    activeTab,
    setActiveTab,
    rewards,
    generatedCodes,
    handleGenerate,
    handleCopy,
    handleToggleCode,
  };
};
