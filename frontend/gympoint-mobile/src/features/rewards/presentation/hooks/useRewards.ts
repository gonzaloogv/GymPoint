import { useEffect } from 'react';

import { User } from '@features/auth/domain/entities/User';
import { useRewardsStore } from '../state/rewards.store';

// COMENTADO: Sistema sin tabs por ahora
// type RewardsTab = 'available' | 'codes';

type UseRewardsParams = {
  user: User;
  onUpdateUser: (user: User) => void;
};

type UseRewardsResult = {
  // activeTab: RewardsTab; // COMENTADO: Sin tabs por ahora
  // setActiveTab: (tab: RewardsTab) => void; // COMENTADO: Sin tabs por ahora
  rewards: any[];
  // generatedCodes: any[]; // COMENTADO: Sistema sin códigos por ahora
  handleGenerate: (reward: any) => Promise<void>;
  // handleCopy: (code: string) => Promise<void>; // COMENTADO: Sistema sin códigos por ahora
  // handleToggleCode: (code: any) => void; // COMENTADO: Sistema sin códigos por ahora
};

export const useRewards = ({
  user,
  onUpdateUser,
}: UseRewardsParams): UseRewardsResult => {
  const {
    // activeTab, // COMENTADO: Sin tabs por ahora
    // setActiveTab, // COMENTADO: Sin tabs por ahora
    rewards,
    // generatedCodes, // COMENTADO: Sistema sin códigos por ahora
    fetchRewards,
    fetchClaimedRewards,
    // fetchGeneratedCodes, // COMENTADO: Sistema sin códigos por ahora
    handleGenerate: storeHandleGenerate,
    // handleCopy, // COMENTADO: Sistema sin códigos por ahora
    // handleToggleCode, // COMENTADO: Sistema sin códigos por ahora
  } = useRewardsStore();

  useEffect(() => {
    fetchRewards(user.plan === 'Premium');
    // Fetch claimed rewards to prevent 'user undefined' error
    if (user.id) {
      fetchClaimedRewards(user.id);
    }
    // fetchGeneratedCodes(); // COMENTADO: Sistema sin códigos por ahora
  }, [user.plan, user.id]);

  const handleGenerate = async (reward: any) => {
    await storeHandleGenerate(reward, user.tokens, user.id, (newTokens) => {
      onUpdateUser({ ...user, tokens: newTokens });
    });
  };

  return {
    // activeTab, // COMENTADO: Sin tabs por ahora
    // setActiveTab, // COMENTADO: Sin tabs por ahora
    rewards,
    // generatedCodes, // COMENTADO: Sistema sin códigos por ahora
    handleGenerate,
    // handleCopy, // COMENTADO: Sistema sin códigos por ahora
    // handleToggleCode, // COMENTADO: Sistema sin códigos por ahora
  };
};
