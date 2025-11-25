import { UserGymSubscriptionDTO } from '../dto/subscription.api.dto';
import { Subscription, GymBasicInfo } from '../../domain/entities/Subscription';

/**
 * Mappers para convertir DTOs de API a entidades de dominio
 */

export const SubscriptionMapper = {
  /**
   * Convierte DTO de API a entidad de dominio
   */
  toDomain: (dto: UserGymSubscriptionDTO): Subscription => {
    console.log('🔄 [SubscriptionMapper] Mapeando DTO:', { id_gym: dto.id_gym, is_active: dto.is_active, subscription_end: dto.subscription_end });

    const mapped = {
      id: dto.id_user_gym,
      userProfileId: dto.id_user_profile,
      gymId: dto.id_gym,
      plan: dto.subscription_plan,
      subscriptionStart: new Date(dto.subscription_start),
      subscriptionEnd: new Date(dto.subscription_end),
      isActive: dto.is_active,
      trialUsed: dto.trial_used,
      trialDate: dto.trial_date ? new Date(dto.trial_date) : null,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      gym: dto.gym ? mapGymBasicInfo(dto.gym) : undefined,
    };

    console.log('✅ [SubscriptionMapper] Mapeado:', { gymId: mapped.gymId, isActive: mapped.isActive, subscriptionEnd: mapped.subscriptionEnd });

    return mapped;
  },

  /**
   * Convierte array de DTOs a array de entidades
   */
  toDomainList: (dtos: UserGymSubscriptionDTO[]): Subscription[] => {
    return dtos.map(SubscriptionMapper.toDomain);
  },
};

/**
 * Mapea información básica del gimnasio
 */
function mapGymBasicInfo(gymDto: UserGymSubscriptionDTO['gym']): GymBasicInfo | undefined {
  if (!gymDto) return undefined;

  return {
    id: gymDto.id_gym,
    name: gymDto.name,
    address: gymDto.address,
    latitude: gymDto.latitude,
    longitude: gymDto.longitude,
    profileImageUrl: gymDto.profile_image_url,
    trialAllowed: gymDto.trial_allowed,
  };
}
