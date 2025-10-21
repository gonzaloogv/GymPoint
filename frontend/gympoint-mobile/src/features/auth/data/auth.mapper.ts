import { User } from '../domain/entities/User';
import { LoginResponseDTO } from './auth.dto';

const normalizeRole = (
  roles: LoginResponseDTO['user']['roles'],
  subscription: LoginResponseDTO['user']['subscription'],
): User['role'] => {
  const normalized = (roles ?? []).map((r) => r?.toUpperCase?.() ?? '').filter(Boolean);
  if (normalized.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (normalized.includes('PREMIUM') || subscription === 'PREMIUM') {
    return 'PREMIUM';
  }
  return 'USER';
};

export const mapUser = (u: LoginResponseDTO['user']): User => {
  const id = u.id_user_profile ?? u.id ?? -1;
  const displayName = [u.name, u.lastname].filter(Boolean).join(' ').trim();

  return {
    id_user: id,
    name: displayName.length > 0 ? displayName : u.email,
    email: u.email,
    role: normalizeRole(u.roles, u.subscription),
    tokens: u.tokens ?? 0,
    plan: u.subscription === 'PREMIUM' ? 'Premium' : 'Free',
  };
};
