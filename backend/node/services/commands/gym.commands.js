/**
 * Commands para el dominio Gyms
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Basado en: backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md
 * - UC-GYM-01: Listar gyms
 * - UC-GYM-02: Detalle de gym
 * - UC-GYM-03: Favoritos
 * - UC-GYM-04: Reviews
 * - UC-GYM-06: Suscripción a gym
 */

/**
 * Command para crear un gimnasio
 *
 * @typedef {Object} CreateGymCommand
 * @property {string} name - Nombre del gimnasio (2-80 caracteres)
 * @property {string} city - Ciudad
 * @property {string} address - Dirección completa
 * @property {number} latitude - Latitud (-90 a 90)
 * @property {number} longitude - Longitud (-180 a 180)
 * @property {number} month_price - Precio mensual (mínimo 0)
 * @property {number} [geofence_radius_meters=100] - Radio de geofence (10-2000 metros)
 * @property {number} [min_stay_minutes=30] - Tiempo mínimo de permanencia (5-240 minutos)
 * @property {string} [description] - Descripción del gimnasio
 * @property {string} [phone] - Teléfono de contacto
 * @property {string} [email] - Email de contacto
 * @property {string} [website] - Sitio web
 * @property {boolean} [is_active=true] - Si el gimnasio está activo
 * @property {boolean} [verified=false] - Si está verificado por admin
 * @property {boolean} [featured=false] - Si es destacado
 * @property {boolean} [auto_checkin_enabled=false] - Si tiene auto check-in habilitado
 * @property {Array<number>} [id_types=[]] - IDs de tipos de gimnasio asociados
 * @property {Array<string>} [type_names=[]] - Nombres de tipos a crear/asociar
 * @property {Array<number>} [amenities=[]] - IDs de amenidades asociadas
 * @property {Array<string>} [rules=[]] - Reglas del gimnasio
 * @property {Array<string>} [equipment=[]] - Equipamiento del gimnasio
 * @property {number} createdBy - ID del admin que crea el gym
 */
class CreateGymCommand {
  constructor({
    name,
    city,
    address,
    latitude,
    longitude,
    month_price,
    geofence_radius_meters = 100,
    min_stay_minutes = 30,
    description = null,
    phone = null,
    email = null,
    website = null,
    is_active = true,
    verified = false,
    featured = false,
    auto_checkin_enabled = false,
    createdBy,
    id_types = [],
    type_names = [],
    amenities = [],
    rules = [],
    equipment = [],
  }) {
    this.name = name;
    this.city = city;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.month_price = month_price;
    this.geofence_radius_meters = geofence_radius_meters;
    this.min_stay_minutes = min_stay_minutes;
    this.description = description;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.is_active = is_active;
    this.verified = verified;
    this.featured = featured;
    this.auto_checkin_enabled = auto_checkin_enabled;
    this.createdBy = createdBy;
    this.id_types = id_types;
    this.type_names = type_names;
    this.amenities = amenities;
    this.rules = rules;
    this.equipment = equipment;
  }
}

/**
 * Command para actualizar un gimnasio
 *
 * @typedef {Object} UpdateGymCommand
 * @property {number} gymId - ID del gimnasio a actualizar
 * @property {string} [name] - Nombre del gimnasio
 * @property {string} [city] - Ciudad
 * @property {string} [address] - Dirección completa
 * @property {number} [latitude] - Latitud
 * @property {number} [longitude] - Longitud
 * @property {number} [month_price] - Precio mensual
 * @property {number} [geofence_radius_meters] - Radio de geofence
 * @property {number} [min_stay_minutes] - Tiempo mínimo de permanencia
 * @property {string} [description] - Descripción del gimnasio
 * @property {string} [phone] - Teléfono de contacto
 * @property {string} [email] - Email de contacto
 * @property {string} [website] - Sitio web
 * @property {boolean} [is_active] - Si el gimnasio está activo
 * @property {boolean} [verified] - Si está verificado por admin
 * @property {boolean} [featured] - Si es destacado
 * @property {boolean} [auto_checkin_enabled] - Si tiene auto check-in habilitado
 * @property {Array<number>} [id_types] - IDs de tipos existentes a asociar
 * @property {Array<string>} [type_names] - Nombres de tipos a crear/asociar
 * @property {Array<number>} [amenities] - IDs de amenidades
 * @property {Array<string>} [rules] - Reglas del gimnasio
 * @property {Array<string>} [equipment] - Equipamiento del gimnasio
 * @property {number} updatedBy - ID del admin que actualiza el gym
 */
class UpdateGymCommand {
  constructor({
    gymId,
    name,
    city,
    address,
    latitude,
    longitude,
    month_price,
    geofence_radius_meters,
    min_stay_minutes,
    description,
    phone,
    email,
    website,
    is_active,
    verified,
    featured,
    auto_checkin_enabled,
    updatedBy,
    id_types,
    type_names,
    amenities,
    rules,
    equipment,
  }) {
    this.gymId = gymId;
    this.name = name;
    this.city = city;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.month_price = month_price;
    this.geofence_radius_meters = geofence_radius_meters;
    this.min_stay_minutes = min_stay_minutes;
    this.description = description;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.is_active = is_active;
    this.verified = verified;
    this.featured = featured;
    this.auto_checkin_enabled = auto_checkin_enabled;
    this.updatedBy = updatedBy;
    this.id_types = id_types;
    this.type_names = type_names;
    this.amenities = amenities;
    this.rules = rules;
    this.equipment = equipment;
  }
}

/**
 * Command para eliminar un gimnasio
 *
 * @typedef {Object} DeleteGymCommand
 * @property {number} gymId - ID del gimnasio a eliminar
 * @property {number} deletedBy - ID del admin que elimina el gym
 */
class DeleteGymCommand {
  constructor({ gymId, deletedBy }) {
    this.gymId = gymId;
    this.deletedBy = deletedBy;
  }
}

/**
 * Command para agregar un gimnasio a favoritos
 *
 * UC-GYM-03: Solo usuarios autenticados, límite: 5
 *
 * @typedef {Object} AddFavoriteGymCommand
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class AddFavoriteGymCommand {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

/**
 * Command para remover un gimnasio de favoritos
 *
 * @typedef {Object} RemoveFavoriteGymCommand
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class RemoveFavoriteGymCommand {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

/**
 * Command para suscribirse a un gimnasio
 *
 * UC-GYM-06: Usuario puede asociarse a máximo 2 gyms en paralelo
 * No requiere pago para asociarse, pero puede pagar
 * Se notifica al gym por WhatsApp y email
 * Renovación: manual
 *
 * @typedef {Object} SubscribeToGymCommand
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 * @property {Date} [start_date] - Fecha de inicio de la suscripción
 * @property {Date} [end_date] - Fecha de fin de la suscripción
 * @property {number} [amount_paid] - Monto pagado (si aplica)
 */
class SubscribeToGymCommand {
  constructor({ userId, gymId, start_date = null, end_date = null, amount_paid = null }) {
    this.userId = userId;
    this.gymId = gymId;
    this.start_date = start_date;
    this.end_date = end_date;
    this.amount_paid = amount_paid;
  }
}

/**
 * Command para cancelar suscripción a un gimnasio
 *
 * @typedef {Object} UnsubscribeFromGymCommand
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class UnsubscribeFromGymCommand {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

module.exports = {
  CreateGymCommand,
  UpdateGymCommand,
  DeleteGymCommand,
  AddFavoriteGymCommand,
  RemoveFavoriteGymCommand,
  SubscribeToGymCommand,
  UnsubscribeFromGymCommand,
};
