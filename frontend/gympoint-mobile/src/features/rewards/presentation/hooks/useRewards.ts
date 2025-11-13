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
  inventory: any[];
  activeEffects: any;
  // generatedCodes: any[]; // COMENTADO: Sistema sin códigos por ahora
  handleGenerate: (reward: any) => Promise<void>;
  useInventoryItem: (inventoryId: number) => Promise<void>;
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
    inventory,
    activeEffects,
    // generatedCodes, // COMENTADO: Sistema sin códigos por ahora
    setUserId,
    fetchRewards,
    fetchInventory,
    fetchActiveEffects,
    fetchClaimedRewards,
    // fetchGeneratedCodes, // COMENTADO: Sistema sin códigos por ahora
    handleGenerate: storeHandleGenerate,
    useInventoryItem: storeUseInventoryItem,
    // handleCopy, // COMENTADO: Sistema sin códigos por ahora
    // handleToggleCode, // COMENTADO: Sistema sin códigos por ahora
  } = useRewardsStore();

  useEffect(() => {
    console.log('[useRewards] 🔄 useEffect ejecutándose por cambio en:', {
      plan: user.plan,
      userId: user.id_user,
      tokens: user.tokens
    });

    // Save userId in store for later use in handleGenerate
    if (user.id_user) {
      setUserId(user.id_user);
    }

    fetchRewards();
    fetchInventory();
    fetchActiveEffects();
    // Fetch claimed rewards to prevent 'user undefined' error
    if (user.id_user) {
      fetchClaimedRewards(user.id_user);
    }
    // fetchGeneratedCodes(); // COMENTADO: Sistema sin cÃ³digos por ahora
  }, [user.plan, user.id_user]);

  const handleGenerate = async (reward: any) => {
    await storeHandleGenerate(reward, user.tokens, user.id_user, (tokensOrUser) => {
      // If we receive a full user object, use it directly
      // Otherwise, if it's just tokens (number), merge with existing user
      if (typeof tokensOrUser === 'number') {
        onUpdateUser({ ...user, tokens: tokensOrUser });
      } else {
        onUpdateUser(tokensOrUser);
      }
    });
  };

  return {
    // activeTab, // COMENTADO: Sin tabs por ahora
    // setActiveTab, // COMENTADO: Sin tabs por ahora
    rewards,
    inventory,
    activeEffects,
    // generatedCodes, // COMENTADO: Sistema sin códigos por ahora
    handleGenerate,
    useInventoryItem: storeUseInventoryItem,
    // handleCopy, // COMENTADO: Sistema sin cÃ³digos por ahora
    // handleToggleCode, // COMENTADO: Sistema sin cÃ³digos por ahora
  };
};

