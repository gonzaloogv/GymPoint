/**
 * Mappers para convertir entre DTOs del OpenAPI y entidades del dominio de GymSchedules
 */

import {
  GymSchedule,
  CreateGymScheduleDTO as DomainCreateGymScheduleDTO,
  UpdateGymScheduleDTO as DomainUpdateGymScheduleDTO,
  GymSpecialSchedule,
  CreateGymSpecialScheduleDTO as DomainCreateGymSpecialScheduleDTO,
  UpdateGymSpecialScheduleDTO as DomainUpdateGymSpecialScheduleDTO,
} from '@/domain/entities';
import {
  GymScheduleResponse,
  CreateGymScheduleRequest,
  UpdateGymScheduleRequest,
  GymSpecialScheduleResponse,
  CreateGymSpecialScheduleRequest,
  UpdateGymSpecialScheduleRequest,
} from '../dto/types';

// ============================================================================
// GYM SCHEDULE MAPPERS
// ============================================================================

/**
 * Convierte GymScheduleResponse (DTO del API) a GymSchedule (entidad del dominio)
 */
export function mapGymScheduleResponseToGymSchedule(dto: GymScheduleResponse): GymSchedule {
  return {
    id_schedule: dto.id_schedule,
    id_gym: dto.id_gym,
    day_of_week: dto.day_of_week,
    opening_time: dto.opening_time || null,
    closing_time: dto.closing_time || null,
    closed: dto.closed,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

/**
 * Convierte CreateGymScheduleDTO (del dominio) a CreateGymScheduleRequest (DTO del API)
 */
export function mapCreateGymScheduleDTOToRequest(
  domainDTO: DomainCreateGymScheduleDTO
): CreateGymScheduleRequest {
  return {
    id_gym: domainDTO.id_gym,
    day_of_week: domainDTO.day_of_week,
    opening_time: domainDTO.opening_time,
    closing_time: domainDTO.closing_time,
    closed: domainDTO.closed,
  };
}

/**
 * Convierte UpdateGymScheduleDTO (del dominio) a UpdateGymScheduleRequest (DTO del API)
 */
export function mapUpdateGymScheduleDTOToRequest(
  domainDTO: DomainUpdateGymScheduleDTO
): UpdateGymScheduleRequest {
  const request: UpdateGymScheduleRequest = {};

  if (domainDTO.opening_time !== undefined) request.opening_time = domainDTO.opening_time;
  if (domainDTO.closing_time !== undefined) request.closing_time = domainDTO.closing_time;
  if (domainDTO.closed !== undefined) request.closed = domainDTO.closed;

  return request;
}

// ============================================================================
// GYM SPECIAL SCHEDULE MAPPERS
// ============================================================================

/**
 * Convierte GymSpecialScheduleResponse (DTO del API) a GymSpecialSchedule (entidad del dominio)
 */
export function mapGymSpecialScheduleResponseToGymSpecialSchedule(
  dto: GymSpecialScheduleResponse
): GymSpecialSchedule {
  return {
    id_special_schedule: dto.id_special_schedule,
    id_gym: dto.id_gym,
    date: dto.date,
    opening_time: dto.opening_time || null,
    closing_time: dto.closing_time || null,
    closed: dto.closed,
    motive: dto.motive,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

/**
 * Convierte CreateGymSpecialScheduleDTO (del dominio) a CreateGymSpecialScheduleRequest (DTO del API)
 */
export function mapCreateGymSpecialScheduleDTOToRequest(
  domainDTO: DomainCreateGymSpecialScheduleDTO
): CreateGymSpecialScheduleRequest {
  return {
    id_gym: domainDTO.id_gym,
    date: domainDTO.date,
    opening_time: domainDTO.opening_time,
    closing_time: domainDTO.closing_time,
    closed: domainDTO.closed,
    motive: domainDTO.motive,
  };
}

/**
 * Convierte UpdateGymSpecialScheduleDTO (del dominio) a UpdateGymSpecialScheduleRequest (DTO del API)
 */
export function mapUpdateGymSpecialScheduleDTOToRequest(
  domainDTO: DomainUpdateGymSpecialScheduleDTO
): UpdateGymSpecialScheduleRequest {
  const request: UpdateGymSpecialScheduleRequest = {};

  if (domainDTO.id_gym !== undefined) request.id_gym = domainDTO.id_gym;
  if (domainDTO.date !== undefined) request.date = domainDTO.date;
  if (domainDTO.opening_time !== undefined) request.opening_time = domainDTO.opening_time;
  if (domainDTO.closing_time !== undefined) request.closing_time = domainDTO.closing_time;
  if (domainDTO.closed !== undefined) request.closed = domainDTO.closed;
  if (domainDTO.motive !== undefined) request.motive = domainDTO.motive;

  return request;
}
