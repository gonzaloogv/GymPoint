import { useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { User } from '../../auth/domain/entities/User';
import { GeneratedCode, Reward } from '../types';
import { buildRewards, createInitialCodes } from '../data/rewardsData';

type RewardsTab = 'available' | 'codes';

type UseRewardsParams = {
  user: User;
  onUpdateUser: (user: User) => void;
};

type UseRewardsResult = {
  activeTab: RewardsTab;
  setActiveTab: (tab: RewardsTab) => void;
  rewards: Reward[];
  generatedCodes: GeneratedCode[];
  handleGenerate: (reward: Reward) => Promise<void>;
  handleCopy: (code: string) => Promise<void>;
  handleToggleCode: (code: GeneratedCode) => void;
};

export const useRewards = ({ user, onUpdateUser }: UseRewardsParams): UseRewardsResult => {
  const [activeTab, setActiveTab] = useState<RewardsTab>('available');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>(createInitialCodes);

  const rewards = useMemo(() => buildRewards(user.plan === 'Premium'), [user.plan]);

  const handleGenerate = async (reward: Reward) => {
    if (user.tokens < reward.cost) {
      Toast.show({ type: 'error', text1: 'No tenés suficientes tokens para esta recompensa' });
      return;
    }

    const code = `GP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const newCode: GeneratedCode = {
      id: Date.now().toString(),
      rewardId: reward.id,
      code,
      title: reward.title,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + reward.validDays * 86400000),
      used: false,
    };

    setGeneratedCodes((prev) => [newCode, ...prev]);
    const updatedUser = { ...user, tokens: user.tokens - reward.cost };
    onUpdateUser(updatedUser);
    await AsyncStorage.setItem('gympoint_user', JSON.stringify(updatedUser));

    Toast.show({ type: 'success', text1: `¡Código generado! ${code}` });
    setActiveTab('codes');
  };

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Toast.show({ type: 'success', text1: 'Código copiado al portapapeles' });
  };

  const handleToggleCode = (code: GeneratedCode) => {
    const willMarkAsUsed = !code.used;
    setGeneratedCodes((prev) =>
      prev.map((item) =>
        item.id === code.id
          ? {
              ...item,
              used: willMarkAsUsed,
              usedAt: willMarkAsUsed ? new Date() : undefined,
            }
          : item,
      ),
    );

    Toast.show({
      type: 'info',
      text1: `Código marcado como ${willMarkAsUsed ? 'USADO' : 'DISPONIBLE'}`,
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
