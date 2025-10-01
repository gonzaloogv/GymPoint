// src/features/rewards/ui/RewardsScreen.tsx

import React from 'react';
import { View, FlatList } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; 

// 1. IMPORTACIONES DE DOMINIO Y HOOKS
import { User } from '../../auth/domain/entities/User'; 
// Hook que contiene toda la lógica y handlers
import { useRewards } from '../hooks/useRewards'; 
// Tipos necesarios para el FlatList
import { Reward, GeneratedCode } from '../types'; 

// 2. IMPORTACIONES DE COMPONENTES MODULARES
import {
  EmptyCodes,
  GeneratedCodeItem, // <-- Componente a corregir la prop
  PremiumUpsell,
  RewardItem, // <-- Componente ya corregido
  TokensTips,
} from './components';

// 3. IMPORTACIONES DE ESTILOS MODULARES
import { ScrollContainer, Container } from './styles/layout'; 
import { 
  HeaderWrapper, HeaderTitle, HeaderSubtitle, 
  TokenDisplay, TokenWrapper, TokenText, TokenLabel 
} from './styles/layout'; 
import { TabsContainer, TabsList, TabsTrigger, TabsTriggerText, TabsContent } from './styles/tabs';


// --- INTERFAZ DE PROPS ---
interface RewardsScreenProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}
// ------------------------------------------------------------------------------------------------

const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser }) => {

  if (!user) {
    return (
      <Container>
        <HeaderTitle style={{ textAlign: 'center', marginTop: 50 }}>
          Cargando información de usuario...
        </HeaderTitle>
      </Container>
    );
  }

  // Llama al hook y extrae TODAS las variables y handlers necesarios
  const {
    activeTab,
    setActiveTab,
    rewards,
    generatedCodes,
    handleGenerate,
    handleCopy, // 💡 Necesario para GeneratedCodeItem
    handleToggleCode, // El hook lo llama handleToggleCode
  } = useRewards({ user, onUpdateUser });

  // --- DELEGACIÓN DE RENDERIZADO A COMPONENTES HIJOS ---
  
  // Renderizado para REWARD ITEM (CORRECTO según tu RewardItem.tsx)
  const renderRewardItem = ({ item }: { item: Reward }) => (
    <RewardItem 
      reward={item} 
      tokens={user.tokens} 
      onGenerate={handleGenerate} 
    />
  );

  // 💥 CORRECCIÓN CRÍTICA: Renderizado para GENERATED CODE ITEM 💥
  // Ahora pasamos: 'item', 'onCopy', y 'onToggle' (tal como lo pide GeneratedCodeItemProps)
  const renderCodeItem = ({ item }: { item: GeneratedCode }) => (
    <GeneratedCodeItem 
      item={item} // 1. Prop 'item' con el objeto de código generado
      onCopy={handleCopy} // 2. Prop 'onCopy' usando el handler del hook
      onToggle={handleToggleCode} // 3. Prop 'onToggle' usando el handler del hook
    />
  );


  // --- RENDERIZADO PRINCIPAL ---

  return (
    <ScrollContainer contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 16 }}>
      <Container>
        {/* Header */}
        <HeaderWrapper>
          <View>
            <HeaderTitle>Recompensas</HeaderTitle>
            <HeaderSubtitle>Canjeá tus tokens por beneficios</HeaderSubtitle>
          </View>
          <TokenDisplay>
            <TokenWrapper>
              <Ionicons name="flash" size={18} color="#facc15" />
              <TokenText>{user.tokens}</TokenText>
            </TokenWrapper>
            <TokenLabel>tokens disponibles</TokenLabel>
          </TokenDisplay>
        </HeaderWrapper>

        {/* Banner Premium */}
        {user.plan === 'Free' && (
        <PremiumUpsell onPress={() => { /* Navegar a la pantalla Premium o modal */ }} />
        )}

        {/* Pestañas (Tabs) */}
        <TabsContainer>
            <TabsList>
            <TabsTrigger $active={activeTab === 'available'} onPress={() => setActiveTab('available')}>
              <TabsTriggerText $active={activeTab === 'available'}>Disponibles</TabsTriggerText>
            </TabsTrigger>
            <TabsTrigger $active={activeTab === 'codes'} onPress={() => setActiveTab('codes')}>
              <TabsTriggerText $active={activeTab === 'codes'}>Mis códigos</TabsTriggerText>
            </TabsTrigger>
          </TabsList>

          {/* Contenido de Pestaña */}
          <TabsContent>
            {activeTab === 'available' && (
              <FlatList
                data={rewards}
                keyExtractor={(item) => item.id}
                renderItem={renderRewardItem}
                scrollEnabled={false}
              />
            )}
            {activeTab === 'codes' && (
              <FlatList
                data={generatedCodes}
                keyExtractor={(item) => item.id}
                renderItem={renderCodeItem}
                scrollEnabled={false}
                ListEmptyComponent={() => <EmptyCodes onViewRewards={() => setActiveTab('available')} />}
              />
            )}
          </TabsContent>
        </TabsContainer>

        {/* Banner "Cómo ganar tokens" */}
        <TokensTips />

      </Container>
      <Toast />
    </ScrollContainer>
  );
};

export default RewardsScreen;