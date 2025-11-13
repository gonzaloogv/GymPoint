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
  DAY_NAME_TO_NUMBER,
  DAY_NUMBER_TO_NAME,
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
    day_of_week: DAY_NUMBER_TO_NAME[dto.day_of_week] || String(dto.day_of_week), // Convertir number a nombre del día
    opening_time: dto.open_time || null, // OpenAPI usa open_time, dominio usa opening_time
    closing_time: dto.close_time || null, // OpenAPI usa close_time, dominio usa closing_time
    closed: dto.is_closed, // OpenAPI usa is_closed, dominio usa closed
    created_at: '', // GymScheduleResponse no tiene created_at en OpenAPI
    updated_at: '', // GymScheduleResponse no tiene updated_at en OpenAPI
  };
}

/**
 * Convierte CreateGymScheduleDTO (del dominio) a CreateGymScheduleRequest (DTO del API)
 */
export function mapCreateGymScheduleDTOToRequest(
  domainDTO: DomainCreateGymScheduleDTO
): CreateGymScheduleRequest {
  // Convertir nombre del día a número (0=Domingo, 1=Lunes, etc.)
  const dayNumber = DAY_NAME_TO_NUMBER[domainDTO.day_of_week] ?? Number(domainDTO.day_of_week);
  
  return {
    day_of_week: dayNumber,
    open_time: domainDTO.opening_time || '', // Dominio usa opening_time, OpenAPI usa open_time
    close_time: domainDTO.closing_time || '', // Dominio usa closing_time, OpenAPI usa close_time
    is_closed: domainDTO.closed ?? false, // Dominio usa closed, OpenAPI usa is_closed
  };
}

/**
 * Convierte UpdateGymScheduleDTO (del dominio) a UpdateGymScheduleRequest (DTO del API)
 */
export function mapUpdateGymScheduleDTOToRequest(
  domainDTO: DomainUpdateGymScheduleDTO
): UpdateGymScheduleRequest {
  const request: UpdateGymScheduleRequest = {};

  if (domainDTO.opening_time !== undefined) request.open_time = domainDTO.opening_time;
  if (domainDTO.closing_time !== undefined) request.close_time = domainDTO.closing_time;
  if (domainDTO.closed !== undefined) request.is_closed = domainDTO.closed;

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
    opening_time: dto.open_time || null,
    closing_time: dto.close_time || null,
    closed: dto.is_closed,
    motive: dto.motive || '',
    created_at: dto.created_at || '',
    updated_at: dto.updated_at || '',
  };
}

/**
 * Convierte CreateGymSpecialScheduleDTO (del dominio) a CreateGymSpecialScheduleRequest (DTO del API)
 */
export function mapCreateGymSpecialScheduleDTOToRequest(
  domainDTO: DomainCreateGymSpecialScheduleDTO
): CreateGymSpecialScheduleRequest {
  return {
    date: domainDTO.date,
    open_time: domainDTO.opening_time || undefined,
    close_time: domainDTO.closing_time || undefined,
    is_closed: domainDTO.closed,
    reason: domainDTO.motive,
  };
}

/**
 * Convierte UpdateGymSpecialScheduleDTO (del dominio) a UpdateGymSpecialScheduleRequest (DTO del API)
 */
export function mapUpdateGymSpecialScheduleDTOToRequest(
  domainDTO: DomainUpdateGymSpecialScheduleDTO
): UpdateGymSpecialScheduleRequest {
  const request: UpdateGymSpecialScheduleRequest = {};

  if (domainDTO.date !== undefined) request.date = domainDTO.date;
  if (domainDTO.opening_time !== undefined) request.open_time = domainDTO.opening_time || undefined;
  if (domainDTO.closing_time !== undefined) request.close_time = domainDTO.closing_time || undefined;
  if (domainDTO.closed !== undefined) request.is_closed = domainDTO.closed;
  if (domainDTO.motive !== undefined) request.reason = domainDTO.motive;

  return request;
}
