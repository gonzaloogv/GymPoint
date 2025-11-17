import { User } from '../domain/entities/User';
import {
  AuthSuccessResponseDTO,
  AuthUserDTO,
  UserProfileResponseDTO,
  UserProfileSummaryDTO,
} from './auth.dto';

/**
 * Mappers para transformar DTOs del backend a entidades del dominio
 * Alineado con OpenAPI backend (lotes 1-2)
 */

const normalizeRole = (roles: string[], subscription: 'FREE' | 'PREMIUM'): User['role'] => {
  const normalized = roles.map((r) => r?.toUpperCase?.() ?? '').filter(Boolean);
  if (normalized.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (normalized.includes('PREMIUM') || subscription === 'PREMIUM') {
    return 'PREMIUM';
  }
  return 'USER';
};

/**
 * Mapea AuthUserDTO (del response de login/register) a User entity
 */
export const mapAuthUserToEntity = (authUser: AuthUserDTO): User => {
  const profile = authUser.profile;
  const displayName = [profile.name, profile.lastname].filter(Boolean).join(' ').trim();

  // El backend puede retornar tokens_balance O tokens (inconsistencia legacy), aceptamos ambos
  const tokens = profile.tokens_balance ?? (profile as any).tokens ?? 0;

  return {
    id_user: profile.id_user_profile,
    name: displayName.length > 0 ? displayName : authUser.email,
    email: authUser.email,
    emailVerified: authUser.email_verified ?? false,
    role: normalizeRole(authUser.roles, profile.subscription),
    tokens,
    plan: profile.subscription === 'PREMIUM' ? 'Premium' : 'Free',
  };
};

/**
 * Mapea UserProfileResponseDTO (del endpoint /api/users/me) a User entity
 */
export const mapUserProfileToEntity = (profile: UserProfileResponseDTO): User => {
  const displayName = [profile.name, profile.lastname].filter(Boolean).join(' ').trim();

  // El backend puede retornar tokens_balance O tokens (inconsistencia legacy), aceptamos ambos
  const tokens = profile.tokens_balance ?? (profile as any).tokens ?? 0;

  return {
    id_user: profile.id_user_profile,
    name: displayName.length > 0 ? displayName : profile.email,
    email: profile.email,
    emailVerified: profile.email_verified ?? false,
    role: profile.subscription === 'PREMIUM' ? 'PREMIUM' : 'USER',
    tokens,
    plan: profile.subscription === 'PREMIUM' ? 'Premium' : 'Free',
  };
};

/**
 * Backward compatibility: mapea desde el formato legacy
 * @deprecated Usar mapAuthUserToEntity o mapUserProfileToEntity según el caso
 */
export const mapUser = (
  u:
    | AuthUserDTO
    | UserProfileSummaryDTO
    | { id: number; email: string; name?: string; lastname?: string; roles?: string[]; subscription?: 'FREE' | 'PREMIUM'; tokens?: number; id_user_profile?: number; email_verified?: boolean },
): User => {
  // Si es AuthUserDTO (tiene 'profile')
  if ('profile' in u && u.profile) {
    return mapAuthUserToEntity(u as AuthUserDTO);
  }

  // Si es UserProfileResponseDTO o UserProfileSummaryDTO
  if ('id_user_profile' in u && u.id_user_profile) {
    const profile = u as UserProfileSummaryDTO | UserProfileResponseDTO;
    const displayName = [profile.name, profile.lastname].filter(Boolean).join(' ').trim();

    return {
      id_user: profile.id_user_profile,
      name: displayName.length > 0 ? displayName : ('email' in u ? u.email : ''),
      email: 'email' in u ? u.email : '',
      emailVerified: ('email_verified' in u ? u.email_verified : false) ?? false,
      role: profile.subscription === 'PREMIUM' ? 'PREMIUM' : 'USER',
      tokens: ('tokens_balance' in profile ? profile.tokens_balance : ('tokens' in u ? u.tokens : 0)) ?? 0,
      plan: profile.subscription === 'PREMIUM' ? 'Premium' : 'Free',
    };
  }

  // Formato legacy (soporte para casos antiguos)
  const id = u.id_user_profile ?? ('id' in u ? u.id : -1);
  const displayName = [u.name, u.lastname].filter(Boolean).join(' ').trim();
  const roles = 'roles' in u ? u.roles ?? [] : [];
  const subscription = 'subscription' in u ? u.subscription ?? 'FREE' : 'FREE';

  return {
    id_user: id,
    name: displayName.length > 0 ? displayName : ('email' in u ? u.email : ''),
    email: 'email' in u ? u.email : '',
    emailVerified: ('email_verified' in u ? u.email_verified : false) ?? false,
    role: normalizeRole(roles, subscription),
    tokens: ('tokens' in u ? u.tokens : 0) ?? 0,
    plan: subscription === 'PREMIUM' ? 'Premium' : 'Free',
  };
};
