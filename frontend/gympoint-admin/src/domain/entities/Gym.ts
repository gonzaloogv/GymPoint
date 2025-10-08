export interface Gym {
  id_gym: number;
  name: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  social_media: string | null;
  gym_type: string;
  equipment: string;
  month_price: number;
  week_price: number;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGymDTO {
  name: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: string;
  gym_type: string;
  equipment: string;
  month_price: number;
  week_price: number;
  photo_url?: string;
}

export interface UpdateGymDTO extends Partial<CreateGymDTO> {
  id_gym: number;
}
