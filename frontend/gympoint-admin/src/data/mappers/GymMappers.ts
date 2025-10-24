/**
 * Mappers para convertir entre DTOs del OpenAPI y entidades del dominio de Gyms
 */

import { Gym, CreateGymDTO as DomainCreateGymDTO, UpdateGymDTO as DomainUpdateGymDTO } from '@/domain/entities';
import { GymResponse, CreateGymRequest, UpdateGymRequest } from '../dto/types';

/**
 * Convierte GymResponse (DTO del API) a Gym (entidad del dominio)
 */
export function mapGymResponseToGym(dto: GymResponse): Gym {
  return {
    id_gym: dto.id_gym,
    name: dto.name,
    description: dto.description || '',
    city: dto.city,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    phone: dto.phone || null,
    whatsapp: dto.whatsapp || null,
    email: dto.email || null,
    website: dto.website || null,
    social_media: (dto.social_media as Record<string, string>) || null,
    instagram: dto.instagram || null,
    facebook: dto.facebook || null,
    google_maps_url: dto.google_maps_url || null,
    registration_date: dto.registration_date || dto.created_at,
    equipment: dto.equipment || [],
    max_capacity: dto.max_capacity || null,
    area_sqm: dto.area_sqm || null,
    verified: dto.verified ?? false,
    featured: dto.featured ?? false,
    month_price: dto.month_price,
    week_price: dto.week_price || 0,
    photo_url: dto.photo_url || null,
    auto_checkin_enabled: dto.auto_checkin_enabled ?? true,
    geofence_radius_meters: dto.geofence_radius_meters,
    min_stay_minutes: dto.min_stay_minutes,
    rules: dto.rules || null,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    deleted_at: dto.deleted_at || null,
    amenities: [], // Se debe popular desde otro endpoint si es necesario
  };
}

/**
 * Convierte CreateGymDTO (del dominio) a CreateGymRequest (DTO del API)
 */
export function mapCreateGymDTOToRequest(domainDTO: DomainCreateGymDTO): CreateGymRequest {
  return {
    name: domainDTO.name,
    description: domainDTO.description,
    city: domainDTO.city,
    address: domainDTO.address,
    latitude: Number(domainDTO.latitude),
    longitude: Number(domainDTO.longitude),
    phone: domainDTO.phone,
    whatsapp: domainDTO.whatsapp,
    email: domainDTO.email,
    website: domainDTO.website,
    social_media: domainDTO.social_media as Record<string, any> | undefined,
    instagram: domainDTO.instagram,
    facebook: domainDTO.facebook,
    google_maps_url: domainDTO.google_maps_url,
    equipment: Array.isArray(domainDTO.equipment) ? domainDTO.equipment : [domainDTO.equipment],
    max_capacity: domainDTO.max_capacity,
    area_sqm: domainDTO.area_sqm,
    verified: domainDTO.verified,
    featured: domainDTO.featured,
    month_price: domainDTO.month_price,
    week_price: domainDTO.week_price,
    photo_url: domainDTO.photo_url,
    auto_checkin_enabled: domainDTO.auto_checkin_enabled ?? true,
    geofence_radius_meters: domainDTO.geofence_radius_meters ?? 150,
    min_stay_minutes: domainDTO.min_stay_minutes ?? 10,
    rules: domainDTO.rules,
  };
}

/**
 * Convierte UpdateGymDTO (del dominio) a UpdateGymRequest (DTO del API)
 */
export function mapUpdateGymDTOToRequest(domainDTO: DomainUpdateGymDTO): UpdateGymRequest {
  const { id_gym, ...rest } = domainDTO;

  // UpdateGymRequest es del mismo tipo que CreateGymRequest según el OpenAPI
  const request: Partial<CreateGymRequest> = {};

  if (rest.name !== undefined) request.name = rest.name;
  if (rest.description !== undefined) request.description = rest.description;
  if (rest.city !== undefined) request.city = rest.city;
  if (rest.address !== undefined) request.address = rest.address;
  if (rest.latitude !== undefined) request.latitude = Number(rest.latitude);
  if (rest.longitude !== undefined) request.longitude = Number(rest.longitude);
  if (rest.phone !== undefined) request.phone = rest.phone;
  if (rest.whatsapp !== undefined) request.whatsapp = rest.whatsapp;
  if (rest.email !== undefined) request.email = rest.email;
  if (rest.website !== undefined) request.website = rest.website;
  if (rest.social_media !== undefined) request.social_media = rest.social_media as Record<string, any> | undefined;
  if (rest.instagram !== undefined) request.instagram = rest.instagram;
  if (rest.facebook !== undefined) request.facebook = rest.facebook;
  if (rest.google_maps_url !== undefined) request.google_maps_url = rest.google_maps_url;
  if (rest.equipment !== undefined) {
    request.equipment = Array.isArray(rest.equipment) ? rest.equipment : [rest.equipment];
  }
  if (rest.max_capacity !== undefined) request.max_capacity = rest.max_capacity;
  if (rest.area_sqm !== undefined) request.area_sqm = rest.area_sqm;
  if (rest.verified !== undefined) request.verified = rest.verified;
  if (rest.featured !== undefined) request.featured = rest.featured;
  if (rest.month_price !== undefined) request.month_price = rest.month_price;
  if (rest.week_price !== undefined) request.week_price = rest.week_price;
  if (rest.photo_url !== undefined) request.photo_url = rest.photo_url;
  if (rest.auto_checkin_enabled !== undefined) request.auto_checkin_enabled = rest.auto_checkin_enabled;
  if (rest.geofence_radius_meters !== undefined) request.geofence_radius_meters = rest.geofence_radius_meters;
  if (rest.min_stay_minutes !== undefined) request.min_stay_minutes = rest.min_stay_minutes;
  if (rest.rules !== undefined) request.rules = rest.rules;

  return request as UpdateGymRequest;
}
