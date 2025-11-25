// DTOs alineados con backend OpenAPI spec (lote 3 - Gyms)

// ============================================================================
// Gyms Request DTOs
// ============================================================================

export type CreateGymRequestDTO = {
  name: string;
  description?: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: string[];
  month_price: number;
  week_price?: number;
  geofence_radius_meters?: number;
  min_stay_minutes?: number;
  id_types?: number[];
  type_names?: string[];
  amenities?: number[];
  rules?: string[];
};

export type UpdateGymRequestDTO = CreateGymRequestDTO;

// ============================================================================
// Gyms Response DTOs
// ============================================================================

export type GymResponseDTO = {
  id_gym: number;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  verified?: boolean | null;
  featured?: boolean | null;
  auto_checkin_enabled?: boolean | null;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  month_price: number;
  week_price?: number | null;
  geofence_radius_meters: number;
  min_stay_minutes: number;
  is_favorite?: boolean | null;
  is_subscribed?: boolean | null;
  distance?: number | null;
  created_at: string;
  updated_at: string;
};

export type GymListResponseDTO = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  items: GymResponseDTO[];
};

export type GymAmenityDTO = {
  id_amenity: number;
  name: string;
  icon?: string | null;
};

export type GymTypeDTO = {
  id_type: number;
  name: string;
  description?: string | null;
};

export type GymTypeListDTO = {
  types: GymTypeDTO[];
};

// ============================================================================
// Query Parameters
// ============================================================================

export type GymListQueryParams = {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  sortBy?: 'created_at' | 'name' | 'city' | 'month_price';
  city?: string;
};
