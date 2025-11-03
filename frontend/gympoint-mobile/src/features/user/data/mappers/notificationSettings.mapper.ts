import { NotificationSettingsResponseDTO, UpdateNotificationSettingsRequestDTO } from '../../../auth/data/auth.dto';
import { NotificationSettings } from '../../domain/entities/NotificationSettings';

/**
 * Mapper: NotificationSettingsResponseDTO → NotificationSettings Entity
 * Transforma el DTO del backend a la entidad del dominio
 */
export const mapNotificationSettingsDTOToEntity = (
  dto: NotificationSettingsResponseDTO
): NotificationSettings => {
  return {
    id: dto.id_setting,
    userId: dto.id_user_profile,
    remindersEnabled: dto.reminders_enabled,
    achievementsEnabled: dto.achievements_enabled,
    rewardsEnabled: dto.rewards_enabled,
    gymUpdatesEnabled: dto.gym_updates_enabled,
    paymentEnabled: dto.payment_enabled,
    socialEnabled: dto.social_enabled,
    systemEnabled: dto.system_enabled,
    challengeEnabled: dto.challenge_enabled,
    pushEnabled: dto.push_enabled,
    emailEnabled: dto.email_enabled,
    quietHoursStart: dto.quiet_hours_start,
    quietHoursEnd: dto.quiet_hours_end,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
};

/**
 * Mapper: NotificationSettings Entity → UpdateNotificationSettingsRequestDTO
 * Transforma la entidad del dominio al DTO para enviar al backend
 */
export const mapNotificationSettingsEntityToDTO = (
  entity: Partial<NotificationSettings>
): UpdateNotificationSettingsRequestDTO => {
  const dto: UpdateNotificationSettingsRequestDTO = {};

  if (entity.remindersEnabled !== undefined) dto.reminders_enabled = entity.remindersEnabled;
  if (entity.achievementsEnabled !== undefined) dto.achievements_enabled = entity.achievementsEnabled;
  if (entity.rewardsEnabled !== undefined) dto.rewards_enabled = entity.rewardsEnabled;
  if (entity.gymUpdatesEnabled !== undefined) dto.gym_updates_enabled = entity.gymUpdatesEnabled;
  if (entity.paymentEnabled !== undefined) dto.payment_enabled = entity.paymentEnabled;
  if (entity.socialEnabled !== undefined) dto.social_enabled = entity.socialEnabled;
  if (entity.systemEnabled !== undefined) dto.system_enabled = entity.systemEnabled;
  if (entity.challengeEnabled !== undefined) dto.challenge_enabled = entity.challengeEnabled;
  if (entity.pushEnabled !== undefined) dto.push_enabled = entity.pushEnabled;
  if (entity.emailEnabled !== undefined) dto.email_enabled = entity.emailEnabled;
  if (entity.quietHoursStart !== undefined) dto.quiet_hours_start = entity.quietHoursStart;
  if (entity.quietHoursEnd !== undefined) dto.quiet_hours_end = entity.quietHoursEnd;

  return dto;
};
