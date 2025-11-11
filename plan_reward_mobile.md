# Plan de Integración: Sistema de Recompensas en Mobile

## 1. Resumen Ejecutivo

Este documento detalla la integración del sistema de recompensas mejorado en **gympoint-mobile** (React Native), incluyendo:
- UI para mostrar **inventario de items acumulables**
- **Banner de efectos activos** (multiplicadores)
- **Badges de cooldown** y restricciones Premium
- **Notificaciones** de consumo automático de salvavidas
- Integración con arquitectura limpia existente

---

## 2. Estado Actual del Backend

✅ **Backend completamente funcional** con:
- 3 tablas nuevas (user_reward_inventory, active_user_effects, reward_cooldown)
- Endpoints: `/api/rewards/inventory/me`, `/api/rewards/effects/active`
- Lógica de cooldown, inventario, multiplicadores
- Consumo automático de salvavidas

⚠️ **Pendientes backend antes de mobile**:
1. Agregar seed data de rewards en `initial-data.js`
2. Agregar notificación cuando se consume salvavidas en `streak-service.js`

---

## 3. Arquitectura Mobile

### 3.1. Estructura de Carpetas (Clean Architecture)

```
frontend/gympoint-mobile/src/features/rewards/
├── data/
│   ├── dto/
│   │   └── reward.api.dto.ts                    [ACTUALIZAR]
│   ├── mappers/
│   │   └── reward.api.mapper.ts                 [ACTUALIZAR]
│   ├── reward.remote.ts                         [ACTUALIZAR]
│   └── RewardRepositoryImpl.ts                  [ACTUALIZAR]
├── domain/
│   ├── entities/
│   │   ├── Reward.ts                            [ACTUALIZAR]
│   │   ├── RewardInventoryItem.ts               [NUEVO]
│   │   └── ActiveEffect.ts                      [NUEVO]
│   ├── repositories/
│   │   └── RewardRepository.ts                  [ACTUALIZAR]
│   └── usecases/
│       ├── GetAvailableRewards.ts               [EXISTE]
│       ├── ClaimReward.ts                       [EXISTE]
│       ├── GetRewardInventory.ts                [NUEVO]
│       └── GetActiveRewardEffects.ts            [NUEVO]
└── presentation/
    ├── components/
    │   ├── RewardCard.tsx                       [ACTUALIZAR]
    │   ├── RewardInventoryCard.tsx              [NUEVO]
    │   ├── ActiveEffectsBanner.tsx              [NUEVO]
    │   └── CooldownTimer.tsx                    [NUEVO]
    ├── hooks/
    │   └── useRewards.ts                        [ACTUALIZAR]
    ├── state/
    │   └── rewards.store.ts                     [ACTUALIZAR]
    └── screens/
        └── RewardsScreen.tsx                    [ACTUALIZAR]
```

---

## 4. Data Layer (API & DTOs)

### 4.1. Actualizar DTOs (reward.api.dto.ts)

```typescript
// ========================================
// REWARD API DTOs
// ========================================

export interface RewardApiDTO {
  id_reward: number;
  name: string;
  description: string | null;
  reward_type: 'descuento' | 'pase_gratis' | 'producto' | 'servicio' |
                'merchandising' | 'token_multiplier' | 'streak_saver' | 'otro' | null;
  effect_value: number | null;
  token_cost: number;
  stock: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;

  // NUEVOS CAMPOS
  cooldown_days: number | null;
  is_unlimited: boolean | null;
  requires_premium: boolean | null;
  is_stackable: boolean | null;
  max_stack: number | null;
  duration_days: number | null;

  image_url: string | null;
  terms: string | null;
  created_at: string;
}

export interface AvailableRewardApiDTO extends RewardApiDTO {
  can_claim: boolean;
  cooldown_ends_at: string | null;
  reason?: string; // Razón por la que no se puede reclamar
  current_stack?: number; // Cantidad actual en inventario
}

// ========================================
// INVENTORY API DTOs
// ========================================

export interface RewardInventoryItemApiDTO {
  id_inventory: number;
  id_user_profile: number;
  id_reward: number;
  item_type: 'streak_saver' | 'token_multiplier';
  quantity: number;
  max_stack: number;
  created_at: string;
  updated_at: string;

  // Populated
  reward: RewardApiDTO;
}

export interface GetInventoryResponseApiDTO {
  inventory: RewardInventoryItemApiDTO[];
}

// ========================================
// ACTIVE EFFECTS API DTOs
// ========================================

export interface ActiveEffectApiDTO {
  id_effect: number;
  id_user_profile: number;
  effect_type: 'token_multiplier';
  multiplier_value: number; // 2, 3, 5
  started_at: string;
  expires_at: string;
  is_consumed: boolean;
  created_at: string;

  // Computed
  hours_remaining?: number;
}

export interface GetActiveEffectsResponseApiDTO {
  effects: ActiveEffectApiDTO[];
  total_multiplier: number;
}

// ========================================
// CLAIM REWARD REQUEST/RESPONSE
// ========================================

export interface ClaimRewardRequestApiDTO {
  code?: string;
}

export interface ClaimRewardResponseApiDTO {
  message: string;
  claimed_reward: {
    id_claimed_reward: number;
    status: string;
    claimed_at: string;
    expires_at: string | null;
  };
  new_balance: number;
}
```

### 4.2. Actualizar Remote Data Source (reward.remote.ts)

```typescript
import { apiClient } from '@/core/api/apiClient';
import {
  RewardApiDTO,
  AvailableRewardApiDTO,
  RewardInventoryItemApiDTO,
  GetInventoryResponseApiDTO,
  ActiveEffectApiDTO,
  GetActiveEffectsResponseApiDTO,
  ClaimRewardRequestApiDTO,
  ClaimRewardResponseApiDTO
} from './dto/reward.api.dto';

export class RewardRemoteDataSource {
  /**
   * Obtiene las recompensas disponibles para el usuario actual
   * Incluye información de cooldown y restricciones
   */
  async getAvailableRewards(): Promise<AvailableRewardApiDTO[]> {
    const response = await apiClient.get<{ rewards: AvailableRewardApiDTO[] }>(
      '/api/rewards/available'
    );
    return response.rewards;
  }

  /**
   * NUEVO: Obtiene el inventario de items del usuario
   */
  async getMyInventory(): Promise<RewardInventoryItemApiDTO[]> {
    const response = await apiClient.get<GetInventoryResponseApiDTO>(
      '/api/rewards/inventory/me'
    );
    return response.inventory;
  }

  /**
   * NUEVO: Obtiene los efectos activos del usuario
   */
  async getMyActiveEffects(): Promise<GetActiveEffectsResponseApiDTO> {
    const response = await apiClient.get<GetActiveEffectsResponseApiDTO>(
      '/api/rewards/effects/active'
    );
    return response;
  }

  /**
   * Canjea una recompensa
   */
  async claimReward(
    rewardId: number,
    code?: string
  ): Promise<ClaimRewardResponseApiDTO> {
    const body: ClaimRewardRequestApiDTO = code ? { code } : {};

    const response = await apiClient.post<ClaimRewardResponseApiDTO>(
      `/api/rewards/${rewardId}/claim`,
      body
    );

    return response;
  }
}
```

### 4.3. Actualizar Mappers (reward.api.mapper.ts)

```typescript
import {
  RewardApiDTO,
  AvailableRewardApiDTO,
  RewardInventoryItemApiDTO,
  ActiveEffectApiDTO
} from '../dto/reward.api.dto';
import { Reward } from '../../domain/entities/Reward';
import { RewardInventoryItem } from '../../domain/entities/RewardInventoryItem';
import { ActiveEffect } from '../../domain/entities/ActiveEffect';

export class RewardApiMapper {
  /**
   * Mapea RewardApiDTO a entidad de dominio Reward
   */
  static toDomain(dto: RewardApiDTO | AvailableRewardApiDTO): Reward {
    // Check if it's an AvailableRewardApiDTO
    const isAvailable = 'can_claim' in dto;

    return {
      id: dto.id_reward,
      name: dto.name,
      description: dto.description,
      rewardType: dto.reward_type,
      effectValue: dto.effect_value,
      tokenCost: dto.token_cost,
      stock: dto.stock,
      validFrom: dto.valid_from ? new Date(dto.valid_from) : null,
      validUntil: dto.valid_until ? new Date(dto.valid_until) : null,
      isActive: dto.is_active,

      // Nuevos campos
      cooldownDays: dto.cooldown_days ?? 0,
      isUnlimited: dto.is_unlimited ?? false,
      requiresPremium: dto.requires_premium ?? false,
      isStackable: dto.is_stackable ?? false,
      maxStack: dto.max_stack ?? 1,
      durationDays: dto.duration_days,

      imageUrl: dto.image_url,
      terms: dto.terms,
      createdAt: new Date(dto.created_at),

      // Campos de disponibilidad (si aplica)
      canClaim: isAvailable ? (dto as AvailableRewardApiDTO).can_claim : true,
      cooldownEndsAt: isAvailable && (dto as AvailableRewardApiDTO).cooldown_ends_at
        ? new Date((dto as AvailableRewardApiDTO).cooldown_ends_at!)
        : null,
      reason: isAvailable ? (dto as AvailableRewardApiDTO).reason : undefined,
      currentStack: isAvailable ? (dto as AvailableRewardApiDTO).current_stack : undefined
    };
  }

  /**
   * NUEVO: Mapea RewardInventoryItemApiDTO a entidad de dominio
   */
  static inventoryToDomain(dto: RewardInventoryItemApiDTO): RewardInventoryItem {
    return {
      id: dto.id_inventory,
      userId: dto.id_user_profile,
      rewardId: dto.id_reward,
      itemType: dto.item_type,
      quantity: dto.quantity,
      maxStack: dto.max_stack,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      reward: this.toDomain(dto.reward)
    };
  }

  /**
   * NUEVO: Mapea ActiveEffectApiDTO a entidad de dominio
   */
  static effectToDomain(dto: ActiveEffectApiDTO): ActiveEffect {
    const now = new Date();
    const expiresAt = new Date(dto.expires_at);
    const hoursRemaining = Math.max(
      0,
      Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
    );

    return {
      id: dto.id_effect,
      userId: dto.id_user_profile,
      effectType: dto.effect_type,
      multiplierValue: dto.multiplier_value,
      startedAt: new Date(dto.started_at),
      expiresAt: expiresAt,
      isConsumed: dto.is_consumed,
      createdAt: new Date(dto.created_at),
      hoursRemaining
    };
  }
}
```

---

## 5. Domain Layer

### 5.1. Actualizar Entity: Reward.ts

```typescript
export type RewardType =
  | 'descuento'
  | 'pase_gratis'
  | 'producto'
  | 'servicio'
  | 'merchandising'
  | 'token_multiplier'  // NUEVO
  | 'streak_saver'      // NUEVO
  | 'otro';

export interface Reward {
  id: number;
  name: string;
  description: string | null;
  rewardType: RewardType | null;
  effectValue: number | null;
  tokenCost: number;
  stock: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;

  // NUEVOS CAMPOS
  cooldownDays: number;
  isUnlimited: boolean;
  requiresPremium: boolean;
  isStackable: boolean;
  maxStack: number;
  durationDays: number | null;

  imageUrl: string | null;
  terms: string | null;
  createdAt: Date;

  // Campos calculados (si viene de /available)
  canClaim?: boolean;
  cooldownEndsAt?: Date | null;
  reason?: string;
  currentStack?: number;
}
```

### 5.2. NUEVO: Entity: RewardInventoryItem.ts

```typescript
import { Reward } from './Reward';

export type ItemType = 'streak_saver' | 'token_multiplier';

export interface RewardInventoryItem {
  id: number;
  userId: number;
  rewardId: number;
  itemType: ItemType;
  quantity: number;
  maxStack: number;
  createdAt: Date;
  updatedAt: Date;

  // Populated
  reward: Reward;
}
```

### 5.3. NUEVO: Entity: ActiveEffect.ts

```typescript
export type EffectType = 'token_multiplier';

export interface ActiveEffect {
  id: number;
  userId: number;
  effectType: EffectType;
  multiplierValue: number; // 2, 3, 5
  startedAt: Date;
  expiresAt: Date;
  isConsumed: boolean;
  createdAt: Date;

  // Computed
  hoursRemaining: number;
}
```

### 5.4. Actualizar Repository: RewardRepository.ts

```typescript
import { Reward } from '../entities/Reward';
import { RewardInventoryItem } from '../entities/RewardInventoryItem';
import { ActiveEffect } from '../entities/ActiveEffect';

export interface RewardRepository {
  getAvailableRewards(): Promise<Reward[]>;
  claimReward(rewardId: number, code?: string): Promise<{ newBalance: number }>;

  // NUEVOS MÉTODOS
  getMyInventory(): Promise<RewardInventoryItem[]>;
  getMyActiveEffects(): Promise<{
    effects: ActiveEffect[];
    totalMultiplier: number;
  }>;
}
```

### 5.5. NUEVO: UseCase: GetRewardInventory.ts

```typescript
import { RewardRepository } from '../repositories/RewardRepository';
import { RewardInventoryItem } from '../entities/RewardInventoryItem';

export class GetRewardInventory {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<RewardInventoryItem[]> {
    return this.repository.getMyInventory();
  }
}
```

### 5.6. NUEVO: UseCase: GetActiveRewardEffects.ts

```typescript
import { RewardRepository } from '../repositories/RewardRepository';
import { ActiveEffect } from '../entities/ActiveEffect';

export interface ActiveEffectsResult {
  effects: ActiveEffect[];
  totalMultiplier: number;
}

export class GetActiveRewardEffects {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<ActiveEffectsResult> {
    return this.repository.getMyActiveEffects();
  }
}
```

---

## 6. Presentation Layer

### 6.1. Actualizar Store: rewards.store.ts

```typescript
import { create } from 'zustand';
import { Reward } from '../../domain/entities/Reward';
import { RewardInventoryItem } from '../../domain/entities/RewardInventoryItem';
import { ActiveEffect } from '../../domain/entities/ActiveEffect';

interface RewardsState {
  // Existing
  rewards: Reward[];
  isLoading: boolean;
  error: string | null;

  // NUEVO: Inventario
  inventory: RewardInventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;

  // NUEVO: Efectos activos
  activeEffects: ActiveEffect[];
  totalMultiplier: number;
  effectsLoading: boolean;
  effectsError: string | null;

  // Actions
  fetchRewards: () => Promise<void>;
  claimReward: (rewardId: number, code?: string) => Promise<void>;

  // NUEVO: Actions
  fetchInventory: () => Promise<void>;
  fetchActiveEffects: () => Promise<void>;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  // Initial state
  rewards: [],
  isLoading: false,
  error: null,

  inventory: [],
  inventoryLoading: false,
  inventoryError: null,

  activeEffects: [],
  totalMultiplier: 1,
  effectsLoading: false,
  effectsError: null,

  // Existing actions
  fetchRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const DI = await import('../../../di/container');
      const rewards = await DI.getAvailableRewards.execute();
      set({ rewards, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      });
    }
  },

  claimReward: async (rewardId: number, code?: string) => {
    try {
      const DI = await import('../../../di/container');
      const result = await DI.claimReward.execute(rewardId, code);

      // Refresh rewards, inventory and effects after claiming
      await Promise.all([
        get().fetchRewards(),
        get().fetchInventory(),
        get().fetchActiveEffects()
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  // NUEVO: Fetch inventory
  fetchInventory: async () => {
    set({ inventoryLoading: true, inventoryError: null });
    try {
      const DI = await import('../../../di/container');
      const inventory = await DI.getRewardInventory.execute();
      set({ inventory, inventoryLoading: false });
    } catch (error) {
      set({
        inventoryError: error instanceof Error ? error.message : 'Error desconocido',
        inventoryLoading: false
      });
    }
  },

  // NUEVO: Fetch active effects
  fetchActiveEffects: async () => {
    set({ effectsLoading: true, effectsError: null });
    try {
      const DI = await import('../../../di/container');
      const result = await DI.getActiveRewardEffects.execute();
      set({
        activeEffects: result.effects,
        totalMultiplier: result.totalMultiplier,
        effectsLoading: false
      });
    } catch (error) {
      set({
        effectsError: error instanceof Error ? error.message : 'Error desconocido',
        effectsLoading: false
      });
    }
  }
}));
```

### 6.2. NUEVO: Component: ActiveEffectsBanner.tsx

```tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRewardsStore } from '../state/rewards.store';
import { ActiveEffect } from '../../domain/entities/ActiveEffect';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActiveEffectsBanner: React.FC = () => {
  const { activeEffects, totalMultiplier, effectsLoading, fetchActiveEffects } =
    useRewardsStore();

  useEffect(() => {
    fetchActiveEffects();

    // Refresh every minute to update countdown
    const interval = setInterval(fetchActiveEffects, 60000);
    return () => clearInterval(interval);
  }, []);

  if (effectsLoading || activeEffects.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🔥 Efectos Activos</Text>
        {totalMultiplier > 1 && (
          <View style={styles.multiplierBadge}>
            <Text style={styles.multiplierText}>x{totalMultiplier}</Text>
          </View>
        )}
      </View>

      <View style={styles.effectsList}>
        {activeEffects.map((effect) => (
          <EffectChip key={effect.id} effect={effect} />
        ))}
      </View>

      {totalMultiplier > 1 && (
        <Text style={styles.infoText}>
          Estás ganando {totalMultiplier}x tokens en todas tus actividades
        </Text>
      )}
    </View>
  );
};

const EffectChip: React.FC<{ effect: ActiveEffect }> = ({ effect }) => {
  const timeRemaining = formatDistanceToNow(effect.expiresAt, {
    locale: es,
    addSuffix: true
  });

  return (
    <View style={styles.chip}>
      <Text style={styles.chipMultiplier}>x{effect.multiplierValue}</Text>
      <Text style={styles.chipTime}>Expira {timeRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00'
  },
  multiplierBadge: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  multiplierText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  effectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  chipMultiplier: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00'
  },
  chipTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic'
  }
});
```

### 6.3. NUEVO: Component: RewardInventoryCard.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RewardInventoryItem } from '../../domain/entities/RewardInventoryItem';

interface Props {
  item: RewardInventoryItem;
}

export const RewardInventoryCard: React.FC<Props> = ({ item }) => {
  const getIcon = () => {
    switch (item.itemType) {
      case 'streak_saver':
        return '🛟';
      case 'token_multiplier':
        return '🔥';
      default:
        return '🎁';
    }
  };

  const getDescription = () => {
    if (item.itemType === 'streak_saver') {
      return 'Protege tu racha automáticamente si fallas un día';
    }
    return item.reward.description || 'Item acumulable';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{item.reward.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {getDescription()}
        </Text>

        <View style={styles.footer}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>
              {item.quantity} / {item.maxStack}
            </Text>
          </View>

          {item.itemType === 'streak_saver' && (
            <Text style={styles.autoLabel}>Uso automático</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  icon: {
    fontSize: 32
  },
  content: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  quantityBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  quantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  autoLabel: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic'
  }
});
```

### 6.4. NUEVO: Component: CooldownTimer.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  endsAt: Date;
  compact?: boolean;
}

export const CooldownTimer: React.FC<Props> = ({ endsAt, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const remaining = formatDistanceToNow(endsAt, {
        locale: es,
        addSuffix: true
      });
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>⏰ {timeRemaining}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏰</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Disponible nuevamente</Text>
        <Text style={styles.time}>{timeRemaining}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  icon: {
    fontSize: 24,
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00'
  },
  compactContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  compactText: {
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '600'
  }
});
```

### 6.5. Actualizar RewardCard.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Reward } from '../../domain/entities/Reward';
import { CooldownTimer } from './CooldownTimer';

interface Props {
  reward: Reward;
  onClaim: (rewardId: number) => void;
  userTokens: number;
  isPremium: boolean;
}

export const RewardCard: React.FC<Props> = ({
  reward,
  onClaim,
  userTokens,
  isPremium
}) => {
  const canAfford = userTokens >= reward.tokenCost;
  const meetsRequirements = !reward.requiresPremium || isPremium;
  const isClaimable = reward.canClaim && canAfford && meetsRequirements;

  const getRewardTypeLabel = () => {
    switch (reward.rewardType) {
      case 'pase_gratis': return 'Premium Pass';
      case 'token_multiplier': return 'Multiplicador';
      case 'streak_saver': return 'Salvavidas';
      case 'descuento': return 'Descuento';
      default: return 'Recompensa';
    }
  };

  const getReasonText = () => {
    if (reward.reason) return reward.reason;
    if (!canAfford) return 'Tokens insuficientes';
    if (!meetsRequirements) return 'Requiere Premium';
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header con badges */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{getRewardTypeLabel()}</Text>
        </View>

        {reward.requiresPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>👑 Premium</Text>
          </View>
        )}

        {reward.isStackable && (
          <View style={styles.stackableBadge}>
            <Text style={styles.stackableText}>
              Acumulable {reward.currentStack ?? 0}/{reward.maxStack}
            </Text>
          </View>
        )}
      </View>

      {/* Nombre y descripción */}
      <Text style={styles.name}>{reward.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {reward.description}
      </Text>

      {/* Effect info */}
      {reward.rewardType === 'token_multiplier' && reward.effectValue && (
        <View style={styles.effectInfo}>
          <Text style={styles.effectText}>
            🔥 Multiplica tus tokens x{reward.effectValue} por {reward.durationDays} días
          </Text>
        </View>
      )}

      {reward.rewardType === 'streak_saver' && (
        <View style={styles.effectInfo}>
          <Text style={styles.effectText}>
            🛟 Protege tu racha automáticamente cuando sea necesario
          </Text>
        </View>
      )}

      {/* Cooldown timer */}
      {reward.cooldownEndsAt && !reward.canClaim && (
        <CooldownTimer endsAt={reward.cooldownEndsAt} />
      )}

      {/* Footer con precio y botón */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Costo:</Text>
          <Text style={[
            styles.price,
            !canAfford && styles.priceInsufficient
          ]}>
            {reward.tokenCost} 🪙
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.claimButton,
            !isClaimable && styles.claimButtonDisabled
          ]}
          onPress={() => onClaim(reward.id)}
          disabled={!isClaimable}
        >
          <Text style={[
            styles.claimButtonText,
            !isClaimable && styles.claimButtonTextDisabled
          ]}>
            {isClaimable ? 'Canjear' : getReasonText()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stock info */}
      {!reward.isUnlimited && reward.stock !== null && (
        <Text style={styles.stockText}>
          Stock: {reward.stock > 0 ? reward.stock : 'Agotado'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2'
  },
  premiumBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57C00'
  },
  stackableBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  stackableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#388E3C'
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  effectInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  effectText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priceLabel: {
    fontSize: 14,
    color: '#666'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  priceInsufficient: {
    color: '#F44336'
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  claimButtonDisabled: {
    backgroundColor: '#E0E0E0'
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  claimButtonTextDisabled: {
    color: '#999'
  },
  stockText: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});
```

### 6.6. Actualizar RewardsScreen.tsx

```tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text
} from 'react-native';
import { useRewardsStore } from '../state/rewards.store';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { RewardCard } from '../components/RewardCard';
import { RewardInventoryCard } from '../components/RewardInventoryCard';
import { ActiveEffectsBanner } from '../components/ActiveEffectsBanner';

export const RewardsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'inventory'>('available');

  const {
    rewards,
    isLoading,
    inventory,
    inventoryLoading,
    fetchRewards,
    fetchInventory,
    fetchActiveEffects,
    claimReward
  } = useRewardsStore();

  const { user } = useAuthStore();
  const userTokens = user?.tokens ?? 0;
  const isPremium = user?.app_tier === 'PREMIUM';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchRewards(),
      fetchInventory(),
      fetchActiveEffects()
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimReward = async (rewardId: number) => {
    try {
      await claimReward(rewardId);
      // Success feedback
      alert('¡Recompensa canjeada exitosamente!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al canjear');
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Effects Banner */}
      <ActiveEffectsBanner />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'available' && styles.tabTextActive
          ]}>
            Disponibles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.tabActive]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'inventory' && styles.tabTextActive
          ]}>
            Mi Inventario ({inventory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'available' ? (
          <>
            {/* User tokens header */}
            <View style={styles.tokensHeader}>
              <Text style={styles.tokensLabel}>Tus tokens:</Text>
              <Text style={styles.tokensAmount}>{userTokens} 🪙</Text>
            </View>

            {/* Rewards list */}
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onClaim={handleClaimReward}
                userTokens={userTokens}
                isPremium={isPremium}
              />
            ))}

            {!isLoading && rewards.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No hay recompensas disponibles
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Inventory list */}
            {inventory.map((item) => (
              <RewardInventoryCard key={item.id} item={item} />
            ))}

            {!inventoryLoading && inventory.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No tienes items en tu inventario
                </Text>
                <Text style={styles.emptySubtext}>
                  Canjea recompensas acumulables para verlas aquí
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center'
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999'
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  scrollView: {
    flex: 1
  },
  tokensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  tokensLabel: {
    fontSize: 14,
    color: '#666'
  },
  tokensAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 13,
    color: '#BBB',
    textAlign: 'center',
    marginTop: 8
  }
});
```

---

## 7. Dependency Injection

### 7.1. Actualizar di/container.ts

```typescript
// ==========================================
// REWARDS FEATURE
// ==========================================

// Data Layer
import { RewardRemoteDataSource } from '@/features/rewards/data/reward.remote';
import { RewardRepositoryImpl } from '@/features/rewards/data/RewardRepositoryImpl';

// Use Cases
import { GetAvailableRewards } from '@/features/rewards/domain/usecases/GetAvailableRewards';
import { ClaimReward } from '@/features/rewards/domain/usecases/ClaimReward';
import { GetRewardInventory } from '@/features/rewards/domain/usecases/GetRewardInventory';
import { GetActiveRewardEffects } from '@/features/rewards/domain/usecases/GetActiveRewardEffects';

// Instancias singleton
const rewardRemoteDataSource = new RewardRemoteDataSource();
const rewardRepository = new RewardRepositoryImpl(rewardRemoteDataSource);

// Exportar use cases
export const getAvailableRewards = new GetAvailableRewards(rewardRepository);
export const claimReward = new ClaimReward(rewardRepository);
export const getRewardInventory = new GetRewardInventory(rewardRepository); // NUEVO
export const getActiveRewardEffects = new GetActiveRewardEffects(rewardRepository); // NUEVO
```

---

## 8. Integración con Notificaciones

### 8.1. Listener de Notificaciones

Si tu app ya tiene un sistema de notificaciones push o WebSocket, agrega un listener para el tipo `CHALLENGE`:

```typescript
// En tu notification listener/handler

if (notification.type === 'CHALLENGE' && notification.data?.action === 'streak_saved') {
  // Mostrar notificación local
  showLocalNotification({
    title: notification.title,
    body: notification.message,
    data: notification.data
  });

  // Opcional: Refresh inventory
  useRewardsStore.getState().fetchInventory();
}
```

---

## 9. Testing & Validación

### 9.1. Casos de Prueba - UI

1. **Recompensas disponibles**:
   - Mostrar todas las recompensas con badges correctos
   - Premium user ve todas, Free user ve restricción en premium-only
   - Cooldown muestra tiempo restante correctamente

2. **Inventario**:
   - Salvavidas muestra cantidad correcta (X/5)
   - Multipliers muestran cantidad correcta (X/3)
   - Mensaje de "uso automático" en salvavidas

3. **Efectos activos**:
   - Banner muestra cuando hay multiplicadores activos
   - Suma correcta de multiplicadores (x2 + x3 = x5)
   - Countdown actualiza cada minuto

4. **Canjeo**:
   - Botón deshabilitado cuando no puede reclamar
   - Mensaje de error apropiado (cooldown, premium, tokens insuficientes)
   - Refresh automático después de canjear

5. **Notificaciones**:
   - Notificación aparece cuando se consume salvavidas
   - Inventario se actualiza automáticamente

---

## 10. Cronograma de Implementación

### Fase 1: Data Layer (1-2 horas)
- ✅ Actualizar DTOs con nuevos campos
- ✅ Actualizar remote data source (2 endpoints nuevos)
- ✅ Actualizar mappers (3 funciones nuevas)
- ✅ Actualizar repository implementation

### Fase 2: Domain Layer (1 hora)
- ✅ Crear entidades (RewardInventoryItem, ActiveEffect)
- ✅ Actualizar Reward entity
- ✅ Crear 2 use cases nuevos
- ✅ Actualizar repository interface

### Fase 3: Presentation - State (1 hora)
- ✅ Actualizar rewards store con inventory y effects
- ✅ Agregar nuevas actions
- ✅ Actualizar DI container

### Fase 4: Presentation - Components (3-4 horas)
- ✅ Crear ActiveEffectsBanner
- ✅ Crear RewardInventoryCard
- ✅ Crear CooldownTimer
- ✅ Actualizar RewardCard con badges

### Fase 5: Presentation - Screen (1-2 horas)
- ✅ Actualizar RewardsScreen con tabs
- ✅ Integrar inventory view
- ✅ Integrar active effects banner

### Fase 6: Notifications (30 min - 1 hora)
- ✅ Integrar listener de notificaciones
- ✅ Mostrar notificación cuando se consume salvavidas

### Fase 7: Testing (2-3 horas)
- ✅ Probar todos los flujos
- ✅ Verificar integración end-to-end
- ✅ Validar UI responsive

**Total estimado: 10-14 horas**

---

## 11. Checklist de Implementación

### Backend (Pendientes antes de mobile)
- [ ] Agregar seed data de rewards en `initial-data.js`
- [ ] Agregar notificación en `streak-service.js` cuando se consume salvavidas
- [ ] Regenerar types de admin (opcional)
- [ ] Probar endpoints con Postman/Thunder Client

### Mobile - Data Layer
- [ ] Actualizar `reward.api.dto.ts` con nuevos DTOs
- [ ] Actualizar `reward.remote.ts` con endpoints nuevos
- [ ] Actualizar `reward.api.mapper.ts` con mappers nuevos
- [ ] Actualizar `RewardRepositoryImpl.ts`

### Mobile - Domain Layer
- [ ] Actualizar `Reward.ts` entity
- [ ] Crear `RewardInventoryItem.ts` entity
- [ ] Crear `ActiveEffect.ts` entity
- [ ] Actualizar `RewardRepository.ts` interface
- [ ] Crear `GetRewardInventory.ts` use case
- [ ] Crear `GetActiveRewardEffects.ts` use case

### Mobile - Presentation Layer
- [ ] Actualizar `rewards.store.ts` con inventory y effects
- [ ] Crear `ActiveEffectsBanner.tsx`
- [ ] Crear `RewardInventoryCard.tsx`
- [ ] Crear `CooldownTimer.tsx`
- [ ] Actualizar `RewardCard.tsx` con badges
- [ ] Actualizar `RewardsScreen.tsx` con tabs
- [ ] Actualizar `di/container.ts`

### Integration & Testing
- [ ] Integrar listener de notificaciones
- [ ] Probar canjeo de recompensas
- [ ] Probar cooldown visual
- [ ] Probar inventario
- [ ] Probar efectos activos
- [ ] Probar restricciones premium

---

## 12. Notas Importantes

### 12.1. Comportamiento Específico Mobile

- **Pull to refresh**: Actualiza rewards, inventory y effects simultáneamente
- **Auto-refresh effects**: El banner se actualiza cada minuto para mostrar countdown
- **Tabs**: Dos tabs (Disponibles / Mi Inventario) para mejor organización
- **Optimistic UI**: Al canjear, muestra loading y hace refresh automático

### 12.2. Consideraciones de UX

- Mostrar claramente por qué no se puede reclamar (cooldown, tokens, premium)
- Badge de "uso automático" en salvavidas para claridad
- Banner de efectos activos prominente para que el usuario sepa que tiene multiplicadores
- Cantidad visible en inventario (X/MAX) para mostrar capacidad

### 12.3. Offline Behavior

- Cache de rewards disponibles
- No permitir canjeo offline
- Mostrar mensaje cuando no hay conexión

---

**Documento generado**: 2025-11-11
**Versión**: 1.0
**Estado**: Listo para implementación
**Prerequisito**: Completar seed data y notificación en backend
