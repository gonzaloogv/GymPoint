import React from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '@shared/styles';

import { User } from '../../auth/domain/entities/User';
import { useRewards } from '../hooks/useRewards';
import { GeneratedCode, Reward } from '../types';
import {
  EmptyCodes,
  GeneratedCodeItem,
  PremiumUpsell,
  RewardItem,
  TokensTips,
} from './components';
import {
  ScrollContainer,
  Container,
  HeaderWrapper,
  HeaderTexts,
  HeaderTitle,
  HeaderSubtitle,
  LoadingMessage,
  TokenDisplay,
  TokenWrapper,
  TokenText,
  TokenLabel,
  TabsContainer,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
  TabsContent,
} from './styles';

type RewardsScreenProps = {
  user: User | null;
  onUpdateUser: (user: User) => void;
};

const noop = () => {};

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser }) => {
  if (!user) {
    return (
      <ScrollContainer>
        <Container>
          <LoadingMessage>Cargando información de usuario...</LoadingMessage>
        </Container>
        <Toast />
      </ScrollContainer>
    );
  }

  const {
    activeTab,
    setActiveTab,
    rewards,
    generatedCodes,
    handleGenerate,
    handleCopy,
    handleToggleCode,
  } = useRewards({ user, onUpdateUser });

  const renderReward: ListRenderItem<Reward> = ({ item }) => (
    <RewardItem reward={item} tokens={user.tokens} onGenerate={handleGenerate} />
  );

  const renderCode: ListRenderItem<GeneratedCode> = ({ item }) => (
    <GeneratedCodeItem item={item} onCopy={handleCopy} onToggle={handleToggleCode} />
  );

  const isAvailableTab = activeTab === 'available';

  return (
    <ScrollContainer>
      <Container>
        <HeaderWrapper>
          <HeaderTexts>
            <HeaderTitle>Recompensas</HeaderTitle>
            <HeaderSubtitle>Canjeá tus tokens por beneficios</HeaderSubtitle>
          </HeaderTexts>
          <TokenDisplay>
            <TokenWrapper>
              <Ionicons name="flash" size={18} color={palette.highlight} />
              <TokenText>{user.tokens}</TokenText>
            </TokenWrapper>
            <TokenLabel>tokens disponibles</TokenLabel>
          </TokenDisplay>
        </HeaderWrapper>

        {user.plan === 'Free' ? <PremiumUpsell onPress={noop} /> : null}

        <TabsContainer>
          <TabsList>
            <TabsTrigger $active={isAvailableTab} onPress={() => setActiveTab('available')}>
              <TabsTriggerText $active={isAvailableTab}>Disponibles</TabsTriggerText>
            </TabsTrigger>
            <TabsTrigger $active={activeTab === 'codes'} onPress={() => setActiveTab('codes')}>
              <TabsTriggerText $active={activeTab === 'codes'}>Mis códigos</TabsTriggerText>
            </TabsTrigger>
          </TabsList>

          <TabsContent>
            {isAvailableTab ? (
              <FlatList
                data={rewards}
                keyExtractor={(item) => item.id}
                renderItem={renderReward}
                scrollEnabled={false}
              />
            ) : (
              <FlatList
                data={generatedCodes}
                keyExtractor={(item) => item.id}
                renderItem={renderCode}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <EmptyCodes onViewRewards={() => setActiveTab('available')} />
                )}
              />
            )}
          </TabsContent>
        </TabsContainer>

        <TokensTips />
      </Container>
      <Toast />
    </ScrollContainer>
  );
};

export default RewardsScreen;
