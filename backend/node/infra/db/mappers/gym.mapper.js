const { toPlain } = require('./utils');
const { toGymAmenities } = require('./gym-amenity.mapper');
const { toGymTypes } = require('./gym-type.mapper');

function toGym(instance, options = {}) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const gym = {
    id_gym: plain.id_gym,
    name: plain.name,
    description: plain.description || null,
    city: plain.city,
    address: plain.address,
    latitude: plain.latitude != null ? Number(plain.latitude) : null,
    longitude: plain.longitude != null ? Number(plain.longitude) : null,
    phone: plain.phone || null,
    whatsapp: plain.whatsapp || null,
    email: plain.email || null,
    website: plain.website || null,
    logo_url: plain.logo_url || null,
    social_media: plain.social_media || null,
    equipment: plain.equipment || null,
    services: plain.services || null,
    instagram: plain.instagram || null,
    facebook: plain.facebook || null,
    google_maps_url: plain.google_maps_url || null,
    max_capacity: plain.max_capacity ?? null,
    area_sqm: plain.area_sqm ?? null,
    verified: Boolean(plain.verified),
    featured: Boolean(plain.featured),
    month_price: plain.month_price != null ? Number(plain.month_price) : null,
    week_price: plain.week_price != null ? Number(plain.week_price) : null,
    rules: plain.rules || [],
    auto_checkin_enabled: Boolean(plain.auto_checkin_enabled),
    geofence_radius_meters: plain.geofence_radius_meters ?? null,
    min_stay_minutes: plain.min_stay_minutes ?? null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
    deleted_at: plain.deleted_at || null,
  };

  if (plain.distance !== undefined) {
    gym.distance = Number(plain.distance);
  }

  if (plain.amenities && (options.includeAmenities ?? true)) {
    gym.amenities = toGymAmenities(plain.amenities);
  }

  if (plain.types && (options.includeTypes ?? true)) {
    gym.types = toGymTypes(plain.types);
  }

  return gym;
}

function toGyms(instances = [], options = {}) {
  if (!Array.isArray(instances)) return [];
  return instances.map((item) => toGym(item, options)).filter(Boolean);
}

module.exports = {
  toGym,
  toGyms,
};
