// src/features/rewards/ui/RewardsScreen.tsx

import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
// NOTA: Usaremos Ionicons y Feather para los iconos, ya que lucide-react-native no es parte de expo/vector-icons
import { Ionicons, Feather, Gift } from "@expo/vector-icons"; 
import { User } from '../../auth/domain/entities/User'; // Entidad User del dominio

// Importamos todos los Styled Components
import {
  ScrollContainer,
  Container,
  HeaderWrapper,
  HeaderTitle,
  HeaderSubtitle,
  TokenDisplay,
  TokenWrapper,
  TokenText,
  TokenLabel,
  TabsContainer,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
  TabsContent,
  RewardCard,
  RewardCardContent,
  RewardIcon,
  RewardIconText,
  RewardInfo,
  RewardTitle,
  RewardDescription,
  RewardCost,
  CostText,
  BadgeWrapper,
  CategoryBadge,
  CategoryBadgeText,
  TermsText,
  ActionButton,
  ActionButtonText,
  CodeSectionTitle,
  CodeBox,
  CodeText,
  CodeCopyButton,
  CodeCopyText,
} from "./styles";


// --- INTERFACES (Mantener aquí por ahora, pero la mejor práctica es moverlas) ---
interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'gym' | 'lifestyle' | 'premium';
  icon: string;
  terms?: string;
  validDays: number;
  available: boolean;
}

interface GeneratedCode {
  id: string;
  rewardId: string;
  code: string;
  title: string;
  generatedAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

interface RewardsScreenProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}
// ------------------------------------------------------------------------------------------------


// --- Mapeo de Categorías y Utilidades ---

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'gym': return '#3B82F6'; // blue-500
    case 'lifestyle': return '#10B981'; // green-500
    case 'premium': return '#8B5CF6'; // purple-500
    default: return '#6B7280';
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'gym': return 'Gimnasio';
    case 'lifestyle': return 'Lifestyle';
    case 'premium': return 'Premium';
    default: return 'Otros';
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};


const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('available');

  // --- MANEJO DE CASO 'USER ES NULL' (Cubre el error de la imagen 669532.png) ---
  if (!user) {
    return (
      <Container>
        <HeaderTitle style={{ textAlign: 'center', marginTop: 50 }}>Cargando información de usuario...</HeaderTitle>
      </Container>
    );
  }
  // --- FIN DE MANEJO DE NULL ---

  // --- MOCK DATA COMPLETA (La lógica de estado se mantiene) ---
  const initialCodes: GeneratedCode[] = [
    {
      id: '1', rewardId: '1', code: 'GP-ABC12345', title: 'Entrada gratis por 1 día', used: false,
      generatedAt: new Date(Date.now() - 86400000), // 1 day ago
      expiresAt: new Date(Date.now() + 86400000 * 89), // 89 days from now
    },
    {
      id: '2', rewardId: '3', code: 'GP-XYZ67890', title: 'Descuento 20% en proteínas', used: true,
      generatedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
      expiresAt: new Date(Date.now() + 86400000 * 87), // 87 days from now
      usedAt: new Date(Date.now() - 86400000 * 1) // 1 day ago
    }
  ];
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>(initialCodes);

  const rewards: Reward[] = [
    { id: '1', title: 'Entrada gratis por 1 día', description: 'Acceso completo a cualquier gimnasio por un día', cost: 100, category: 'gym', icon: '🏋️', validDays: 90, terms: 'Válido en cualquier gimnasio de la red. No incluye clases premium.', available: true },
    { id: '2', title: 'Clase grupal gratis', description: 'Una clase grupal de tu elección', cost: 75, category: 'gym', icon: '👥', validDays: 30, terms: 'Sujeto a disponibilidad. Reserva con anticipación.', available: true },
    { id: '3', title: 'Descuento 20% en proteínas', description: 'Descuento en suplementos nutricionales', cost: 50, category: 'lifestyle', icon: '🥤', validDays: 60, terms: 'Válido en tiendas participantes. No acumulable con otras ofertas.', available: true },
    { id: '4', title: 'Consulta nutricional gratis', description: 'Sesión de 30min con nutricionista', cost: 150, category: 'premium', icon: '🍎', validDays: 60, terms: 'Solo disponible para usuarios Premium. Coordinar por WhatsApp.', available: user.plan === 'Premium' },
    { id: '5', title: 'Masaje deportivo', description: 'Sesión de masaje de 30 minutos', cost: 200, category: 'premium', icon: '💆', validDays: 45, terms: 'Solo disponible para usuarios Premium. Sujeto a disponibilidad.', available: user.plan === 'Premium' },
    { id: '6', title: 'Plan semanal gratis', description: 'Acceso completo por 7 días', cost: 500, category: 'gym', icon: '🎯', validDays: 30, terms: 'No acumulable. Solo una vez por usuario.', available: true }
  ];
  // ------------------------------

  const generateCode = async (reward: Reward) => {
    if (user.tokens < reward.cost) {
      Toast.show({ type: "error", text1: "No tenés suficientes tokens para esta recompensa" });
      return;
    }

    const code = `GP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
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
    await AsyncStorage.setItem("gympoint_user", JSON.stringify(updatedUser));

    Toast.show({ type: "success", text1: `¡Código generado! ${code}` });
    setActiveTab('codes');
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Toast.show({ type: "success", text1: "Código copiado al portapapeles" });
  };
  
  // --- RENDERIZADO DE ITEM DE RECOMPENSA ---
  const renderRewardItem = ({ item }: { item: Reward }) => {
    const isAffordable = user.tokens >= item.cost;
    const isDisabled = !item.available || !isAffordable;

    return (
      <RewardCard isAffordable={isAffordable} isAvailable={item.available}>
        <RewardCardContent>
          {/* Ícono */}
          <RewardIcon>
            <RewardIconText>{item.icon}</RewardIconText>
          </RewardIcon>

          {/* Información */}
          <RewardInfo>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexShrink: 1 }}>
                <RewardTitle>{item.title}</RewardTitle>
                <RewardDescription>{item.description}</RewardDescription>
              </View>
              <RewardCost>
                <Ionicons name="flash" size={14} color="#facc15" /> {/* Reemplazamos Coins por Ionicons flash */}
                <CostText>{item.cost}</CostText>
              </RewardCost>
            </View>

            {/* Badges */}
            <BadgeWrapper>
              <CategoryBadge color={getCategoryColor(item.category)}>
                <CategoryBadgeText>{getCategoryName(item.category)}</CategoryBadgeText>
              </CategoryBadge>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="clock" size={10} color="#6B7280" />
                <Text style={{ fontSize: 10, color: '#6B7280' }}>{item.validDays} días</Text>
              </View>
            </BadgeWrapper>
            
            {/* Términos */}
            {item.terms && <TermsText>{item.terms}</TermsText>}

            {/* Botón */}
            <ActionButton
              disabled={isDisabled}
              onPress={() => generateCode(item)}
            >
              <ActionButtonText>
                {!item.available
                  ? 'Solo Premium'
                  : !isAffordable
                    ? `Faltan ${item.cost - user.tokens} tokens`
                    : "Generar código"}
              </ActionButtonText>
            </ActionButton>
          </RewardInfo>
        </RewardCardContent>
      </RewardCard>
    );
  };
  
  // --- RENDERIZADO DE ITEM DE CÓDIGO ---
  const renderCodeItem = ({ item }: { item: GeneratedCode }) => {
    const isExpired = item.expiresAt && new Date() > item.expiresAt;

    const toggleUsed = () => {
      setGeneratedCodes(prev => prev.map(c => 
        c.id === item.id 
          ? { ...c, used: !c.used, usedAt: !c.used ? new Date() : undefined } 
          : c
      ));
      Toast.show({ type: "info", text1: `Código marcado como ${!item.used ? 'USADO' : 'DISPONIBLE'}` });
    };

    return (
      <View style={{ opacity: item.used ? 0.6 : 1, marginBottom: 12 }}>
        <RewardCard isAffordable={true} isAvailable={true} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexShrink: 1 }}>
              <RewardTitle>{item.title}</RewardTitle>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.used ? '#6B7280' : isExpired ? '#EF4444' : '#10B981' }}>
                  {item.used ? 'USADO' : isExpired ? 'VENCIDO' : 'DISPONIBLE'}
                </Text>
              </View>
            </View>
            {item.used && <Feather name="check-circle" size={20} color="#10B981" />}
          </View>

          <View style={{ backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <CodeText>{item.code}</CodeText>
              <TouchableOpacity onPress={() => copyCode(item.code)} style={{ padding: 4 }}>
                <Feather name="copy" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ fontSize: 12, color: '#6B7280', gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Generado:</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(item.generatedAt)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Vence:</Text>
              <Text style={{ fontSize: 12, color: isExpired ? '#EF4444' : '#6B7280' }}>
                {formatDate(item.expiresAt)}
              </Text>
            </View>
            {item.used && item.usedAt && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>Usado:</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(item.usedAt)}</Text>
              </View>
            )}
          </View>

          {!item.used && !isExpired && (
            <ActionButton
              style={{ marginTop: 12, backgroundColor: '#6B7280' }}
              onPress={toggleUsed}
            >
              <ActionButtonText>Marcar como usado</ActionButtonText>
            </ActionButton>
          )}
        </RewardCard>
      </View>
    );
  };


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
              <Ionicons name="flash" size={18} color="#facc15" /> {/* Ícono de tokens */}
              <TokenText>{user.tokens}</TokenText>
            </TokenWrapper>
            <TokenLabel>tokens disponibles</TokenLabel>
          </TokenDisplay>
        </HeaderWrapper>

        {/* Banner Premium (Reemplaza el Alert de ShadCN) */}
        {user.plan === 'Free' && (
          <View style={{ backgroundColor: '#F3E8FF', borderColor: '#D8B4FE', borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#6D28D9' }}>
                  <Text style={{ fontWeight: 'bold' }}>¿Querés más recompensas?</Text> Actualizá a Premium y desbloqueá beneficios exclusivos.
                </Text>
                <TouchableOpacity onPress={() => {/* Navegar a Premium */}} style={{ marginTop: 4 }}>
                  <Text style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: 14 }}>Ver Premium &gt;</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Pestañas (Tabs) */}
        <TabsContainer>
          <TabsList>
            <TabsTrigger isActive={activeTab === 'available'} onPress={() => setActiveTab('available')}>
              <TabsTriggerText isActive={activeTab === 'available'}>Disponibles</TabsTriggerText>
            </TabsTrigger>
            <TabsTrigger isActive={activeTab === 'codes'} onPress={() => setActiveTab('codes')}>
              <TabsTriggerText isActive={activeTab === 'codes'}>Mis códigos</TabsTriggerText>
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
                ListEmptyComponent={() => (
                  <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12 }}>
                    <Gift size={48} color="#A8A8A8" style={{ marginBottom: 16 }} />
                    <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>No tenés códigos generados</Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
                      Canjeá tokens por recompensas para generar códigos
                    </Text>
                    <ActionButton onPress={() => setActiveTab('available')} style={{ backgroundColor: '#E5E7EB', paddingHorizontal: 20 }}>
                      <Text style={{ color: '#000', fontWeight: 'bold' }}>Ver recompensas disponibles</Text>
                    </ActionButton>
                  </View>
                )}
              />
            )}
          </TabsContent>
        </TabsContainer>

        {/* Banner "Cómo ganar tokens" */}
        <View style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD', borderWidth: 1, borderRadius: 8, padding: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 8 }}>💡 ¿Cómo ganar más tokens?</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="flash" size={12} color="#1D4ED8" />
              <Text style={{ fontSize: 14, color: '#1E40AF' }}>Check-in diario: +10 tokens</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="calendar" size={12} color="#1D4ED8" />
              <Text style={{ fontSize: 14, color: '#1E40AF' }}>Racha de 7 días: +25 tokens extra</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="trophy-outline" size={12} color="#1D4ED8" />
              <Text style={{ fontSize: 14, color: '#1E40AF' }}>Racha de 30 días: +100 tokens extra</Text>
            </View>
          </View>
        </View>

      </Container>
      <Toast />
    </ScrollContainer>
  );
};

export default RewardsScreen;